/**
 * UniProt REST API lookup helper for human target proteins.
 * Endpoint: https://rest.uniprot.org/uniprotkb/search
 */

export interface UniProtProtein {
  accession: string;
  id: string;
  gene: string;
  name: string;
  sequence: string;
  length: number;
}

export class ProteinNotFoundError extends Error {
  query: string;
  constructor(query: string) {
    super(`"${query}" was not found in UniProt.`);
    this.name = "ProteinNotFoundError";
    this.query = query;
  }
}

export async function fetchUniProtProtein(query: string): Promise<UniProtProtein> {
  const clean = query.trim();
  if (!clean) throw new Error("Search query cannot be empty");

  // Search human reviewed entries by gene or protein name
  const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(
    clean
  )}+AND+organism_id:9606&fields=accession,id,gene_names,protein_name,sequence,length&size=1&format=json`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`UniProt API returned error (${res.status})`);
  }

  const data = await res.json();
  const entry = data.results?.[0];
  if (!entry) {
    throw new ProteinNotFoundError(clean);
  }

  const accession = entry.primaryAccession || entry.uniProtkbId || "Unknown";
  const id = entry.uniProtkbId || accession;
  const gene = entry.genes?.[0]?.geneName?.value || clean.toUpperCase();
  const name =
    entry.proteinDescription?.recommendedName?.fullName?.value ||
    entry.proteinDescription?.submissionNames?.[0]?.fullName?.value ||
    `${gene} protein`;
  const sequence = entry.sequence?.value || "";
  const length = entry.sequence?.length || sequence.length;

  if (!sequence) {
    throw new Error(`Found protein "${name}" (${accession}), but sequence data is missing.`);
  }

  return {
    accession,
    id,
    gene,
    name,
    sequence,
    length,
  };
}

export async function fetchProteinSuggestions(term: string): Promise<Array<{ gene: string; name: string; accession: string }>> {
  // Guard: this function calls a browser-only network API — skip during SSR.
  if (typeof window === "undefined") return [];
  const clean = term.trim();
  if (clean.length < 2) return [];

  try {
    const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(
      clean
    )}+AND+organism_id:9606&fields=accession,id,gene_names,protein_name,length&size=5&format=json`;

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.results || []).map((entry: any) => ({
      gene: entry.genes?.[0]?.geneName?.value || entry.uniProtkbId?.split("_")?.[0] || clean.toUpperCase(),
      name: entry.proteinDescription?.recommendedName?.fullName?.value || entry.uniProtkbId || "Protein",
      accession: entry.primaryAccession || "",
    }));
  } catch {
    return [];
  }
}
