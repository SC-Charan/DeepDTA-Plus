/**
 * PubChem lookup helpers used by the Compound Search page.
 *
 * Two kinds of failure are kept apart on purpose:
 *  - CompoundNotFoundError : PubChem answered "no such compound" (usually a typo)
 *  - any other Error       : network problem / PubChem outage
 */

const PUG = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const AUTOCOMPLETE = "https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound";

export interface PubChemCompound {
  cid: number;
  iupacName: string;
  molecularFormula: string;
  molecularWeight: number;
  canonicalSMILES: string;
  isomericSMILES: string;
  inchiKey: string;
  xlogp?: number;
  hbondDonorCount?: number;
  hbondAcceptorCount?: number;
  rotatableBondCount?: number;
  heavyAtomCount?: number;
  complexity?: number;
  synonyms: string[];
  description?: string;
}

export class CompoundNotFoundError extends Error {
  query: string;
  constructor(query: string) {
    super(`"${query}" was not found in PubChem`);
    this.name = "CompoundNotFoundError";
    this.query = query;
  }
}

export async function fetchPubChemData(name: string): Promise<PubChemCompound> {
  const clean = name.trim();
  if (!clean) throw new Error("Search query cannot be empty");

  let cid: number | undefined;

  // 1a. If user passed a numeric CID directly (e.g. "2244" or "54670067")
  if (/^\d+$/.test(clean)) {
    cid = parseInt(clean, 10);
  } else {
    // 1b. Search by compound name
    try {
      const cidRes = await fetch(`${PUG}/compound/name/${encodeURIComponent(clean)}/cids/JSON`);
      if (cidRes.ok) {
        const cidData = await cidRes.json();
        cid = cidData.IdentifierList?.CID?.[0];
      }
    } catch {
      /* ignore */
    }

    // 1c. If name lookup returned nothing, try SMILES lookup
    if (!cid || cid === 0) {
      try {
        const smilesRes = await fetch(`${PUG}/compound/smiles/${encodeURIComponent(clean)}/cids/JSON`);
        if (smilesRes.ok) {
          const smilesData = await smilesRes.json();
          cid = smilesData.IdentifierList?.CID?.[0];
        }
      } catch {
        /* ignore */
      }
    }
  }

  // PubChem uses CID 0 for "no match"
  if (!cid || cid === 0) {
    throw new CompoundNotFoundError(clean);
  }

  // 2. CID -> properties (incl. SMILES)
  const propRes = await fetch(
    `${PUG}/compound/cid/${cid}/property/IUPACName,MolecularFormula,MolecularWeight,CanonicalSMILES,IsomericSMILES,InChIKey,XLogP,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,HeavyAtomCount,Complexity/JSON`
  );
  if (!propRes.ok) throw new Error(`PubChem returned an error (HTTP ${propRes.status})`);
  const propData = await propRes.json();
  const props = propData.PropertyTable?.Properties?.[0] ?? {};

  // PubChem is renaming these fields (Canonical -> Connectivity, Isomeric -> plain SMILES),
  // so accept either name.
  const canonicalSMILES: string = props.CanonicalSMILES ?? props.ConnectivitySMILES ?? "";
  const isomericSMILES: string = props.IsomericSMILES ?? props.SMILES ?? "";
  if (!canonicalSMILES && !isomericSMILES) {
    throw new Error(`PubChem found "${clean}" (CID ${cid}) but returned no SMILES structure.`);
  }

  // 3. synonyms (nice to have, never fatal)
  let synonyms: string[] = [];
  try {
    const synRes = await fetch(`${PUG}/compound/cid/${cid}/synonyms/JSON`);
    const synData = await synRes.json();
    synonyms = synData.InformationList?.Information?.[0]?.Synonym?.slice(0, 8) ?? [];
  } catch {
    /* ignore */
  }

  if (synonyms.length === 0) {
    synonyms = [clean];
  }

  return {
    cid,
    iupacName: props.IUPACName ?? "N/A",
    molecularFormula: props.MolecularFormula ?? "N/A",
    molecularWeight: Number(props.MolecularWeight) || 0,
    canonicalSMILES: canonicalSMILES || isomericSMILES,
    isomericSMILES: isomericSMILES || canonicalSMILES,
    inchiKey: props.InChIKey ?? "N/A",
    xlogp: props.XLogP,
    hbondDonorCount: props.HBondDonorCount,
    hbondAcceptorCount: props.HBondAcceptorCount,
    rotatableBondCount: props.RotatableBondCount,
    heavyAtomCount: props.HeavyAtomCount,
    complexity: props.Complexity,
    synonyms,
  };
}

/** "Did you mean ...?" suggestions for a misspelled name. Never throws. */
export async function fetchSuggestions(term: string, limit = 5): Promise<string[]> {
  // Guard: this function calls a browser-only network API — skip during SSR.
  if (typeof window === "undefined") return [];
  try {
    const res = await fetch(`${AUTOCOMPLETE}/${encodeURIComponent(term)}/json?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    const list: unknown = data?.dictionary_terms?.compound;
    if (!Array.isArray(list)) return [];
    return list
      .filter((s): s is string => typeof s === "string")
      .filter((s) => s.toLowerCase() !== term.toLowerCase())
      .slice(0, limit);
  } catch {
    return [];
  }
}
