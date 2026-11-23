import { ChemicalPreset, ProteinPreset, PredictionResult, BaselineComparison, ResidueInteraction } from "./types";
import { categorizeBinding } from "./utils";

export const SAMPLE_COMPOUNDS: ChemicalPreset[] = [
  {
    name: "Dasatinib",
    category: "Kinase Inhibitor",
    smiles: "CC1=C(C(=CC=C1)Cl)NC(=O)C2=CN=C(S2)NC3=CC(=NC(=N3)C)N4CCN(CC4)CCO",
    formula: "C22H26ClN7O2S",
    weight: 488.01,
    description: "Potent multi-targeted BCR-ABL and Src family tyrosine kinase inhibitor.",
  },
  {
    name: "Imatinib",
    category: "Kinase Inhibitor",
    smiles: "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5",
    formula: "C29H31N7O",
    weight: 493.60,
    description: "First-generation selective BCR-ABL tyrosine kinase inhibitor for CML.",
  },
  {
    name: "Lapatinib",
    category: "Dual Inhibitor",
    smiles: "CS(=O)(=O)CCNCC1=CC=C(O1)C2=CC3=C(C=C2)N=CN=C3NC4=CC(=C(C=C4)OCC5=CC(=CC=C5)F)Cl",
    formula: "C29H26ClFN4O4S",
    weight: 581.06,
    description: "Dual EGFR and HER2/neu receptor tyrosine kinase inhibitor.",
  },
  {
    name: "Erlotinib",
    category: "EGFR Inhibitor",
    smiles: "COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC",
    formula: "C22H23N3O4",
    weight: 393.44,
    description: "Reversible inhibitor targeting epidermal growth factor receptor (EGFR).",
  },
  {
    name: "Gefitinib",
    category: "EGFR Inhibitor",
    smiles: "COC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl)OCCCN4CCOCC4",
    formula: "C22H24ClFN4O3",
    weight: 446.90,
    description: "Selective inhibitor of EGFR tyrosine kinase enzymatic domain.",
  },
  {
    name: "Aspirin",
    category: "NSAID",
    smiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
    formula: "C9H8O4",
    weight: 180.16,
    description: "Acetylsalicylic acid; non-selective cyclooxygenase (COX-1/COX-2) inhibitor.",
  },
  {
    name: "Caffeine",
    category: "Xanthine Alkaloid",
    smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    formula: "C8H10N4O2",
    weight: 194.19,
    description: "Central nervous system stimulant and non-selective adenosine antagonist.",
  },
  {
    name: "Sorafenib",
    category: "Kinase Inhibitor",
    smiles: "CNC(=O)C1=NC=CC(=C1)OC2=CC=C(C=C2)NC(=O)NC3=CC(=C(C=C3)Cl)C(F)(F)F",
    formula: "C21H16ClF3N4O3",
    weight: 464.82,
    description: "Multi-kinase inhibitor inhibiting VEGFR, PDGFR, and Raf kinases.",
  },
];

export const SAMPLE_PROTEINS: ProteinPreset[] = [
  {
    id: "ABL1",
    name: "Tyrosine-protein kinase ABL1",
    uniprot: "P00519",
    organism: "Homo sapiens",
    length: 1130,
    sequence:
      "MLEICLKLVGCKSKKGLSSSSSCYLEEALQRPVASDFEPQGLSEAARWNSKENLLAGPSENDPNLFVALYDFVASGDNTLSITKGEKLRVLGYNHNGEWCEAQTKNGQGWVPSNYITPVNSLEKHSWYHGPVSRNAAEYLLSSGINGSFLVRESESSPGQRSISLRYEGRVYHYRINTASDGKLYVSSESRFNTLAELVHHHSTVADGLITTLHYPAPKRNKPTVYGVSPNYDKWEMERTDITMKHKLGGGQYGEVYEGVWKKYSLTVAVKTLKEDTMEVEEFLKEAAVMKEIKHPNLVQLLGVCTREPPFYIITEFMTYGNLLDYLRECNRQEVNAVVLLYMATQISSAMEYLEKKNFIHRDLAARNCLVGENHLVKVADFGLSRLMTGDTYTAHAGAKFPIKWTAPESLAYNKFSIKSDVWAFGVLLWEIATYGMSPYPGIDLSQVYELLEKDYRMERPEGCPEKVYELMRACWQWNPSDRPSFAEIHQAFETMFQESSISDEVEKELGKQGVRGAVSTLLQAPELPTKTRTSRRAAEHRDTTDVPEMPHSKGQGESDPLDHEPAVSPLLPRKERGPPEGGLNEDERLLPKDKKTNLFSALIKKKKKTAPTPPKRSSSFREMDGQPERRGAGEEEGRDISNGALAFTPLDTADPAKSPKPSNGAGVPNGALRESGGSGFRSPHLWKKSSTLTSSRLATGEEEGGGSSSKRFLRSCSASCVPHGAKDTEWRSVTLPRDLQSTGRQFDSSTFGGHKSEKPALPRKRAGENRSDQVTRGTVTPPPRLVKKNEEAADEVFKDIMESSPGSSPPNLTPKPLRRQVTVAPASGLPHKEEAGKGSALGTPAAAEPVTPTSKAGSGAPGGTSKGPAEESRVRRHKHSSESPGRDKGKLSRLKPAPPPPPAASAGKAGGKPSQSPSQEAAGEAVLGAKTKATSLVDAVNSDAAKPSQPGEGLKKPVLPATPKPQSAKPSGTPISPAPVPSTLPSASSALAGDQPSSTAFIPLISTRVSLRKTRQPPERIASGAITKGVVLDSTEALCLAISRNSEQMASHSAVLEAGKNLYTFCVSYVDSIQQMRNKFAFREAINKLENNLRELQICPATAGSGPAATQDFSKLLSSVKEISDIVQR",
    description: "Key target of Dasatinib and Imatinib in chronic myeloid leukemia.",
  },
  {
    id: "EGFR",
    name: "Epidermal growth factor receptor",
    uniprot: "P00533",
    organism: "Homo sapiens",
    length: 1210,
    sequence:
      "MRPSGTAGAALLALLAALCPASRALEEKKVCQGTSNKLTQLGTFEDHFLSLQRMFNNCEVVLGNLEITYVQRNYDLSFLKTIQEVAGYVLIALNTVERIPLENLQIIRGNMYYENSYALAVLSNYDANKTGLKELPMRNLQEILHGAVRFSNNPALCNVESIQWRDIVSSDFLSNMSMDFQNHLGSCQKCDPSCPNGSCWGAGEENCQKLTKIICAQQCSGRCRGKSPSDCCHNQCAAGCTGPRESDCLVCRKFRDEATCKDTCPPLMLYNPTTYQMDVNPEGKYSFGATCVKKCPRNYVVTDHGSCVRACGADSYEMEEDGVRKCKKCEGPCRKVCNGIGIGEFKDSLSINATNIKHFKNCTSISGDLHILPVAFRGDSFTHTPPLDPQELDILKTVKEITGFLLIQAWPENRTDLHAFENLEIIRGRTKQHGQFSLAVVSLNITSLGLRSLKEISDGDVIISGNKNLCYANTINWKKLFGTSGQKTKIISNRGENSCKATGQVCHALCSPEGCWGPEPRDCVSCRNVSRGRECVDKCNLLEGEPREFVENSECIQCHPECLPQAMNITCTGRGPDNCIQCAHYIDGPHCVKTCPAGVMGENNTLVWKYADAGHVCHLCHPNCTYGCTGPGLEGCPTNGPKIPSIATGMVGALLLLLVVALGIGLFMRRRHIVRKRTLRRLLQERELVEPLTPSGEAPNQALLRILKETEFKKIKVLGSGAFGTVYKGLWIPEGEKVKIPVAIKELREATSPKANKEILDEAYVMASVDNPHVCRLLGICLTSTVQLITQLMPFGCLLDYVREHKDNIGSQYLLNWCVQIAKGMNYLEDRRLVHRDLAARNVLVKTPQHVKITDFGLAKLLGAEEKEYHAEGGKVPIKWMALESILHRIYTHQSDVWSYGVTVWELMTFGSKPYDGIPASEISSILEKGERLPQPPICTIDVYMIMVKCWMIDADSRPKFRELIIEFSKMARDPQRYLVIQGDERMHLPSPTDSNFYRALMDEEDMDDVVDADEYLIPQQGFFSSPSTSRTPLLSSLSATSNNSTVACIDRNGLQSCPIKEDSFLQRYSSDPTGALTEDSIDDTFLPVPEYINQSVPKRPAGSVQNPVYHNQPLNPAPSRDPHYQDPHSTAVGNPEYLNTVQPTCVNSTFDSPAHWAQKGSHQISLDNPDYQQDFFPKEAKPNGIFKGSTAENAEYLRVAPQSSEFIGA",
    description: "Crucial receptor tyrosine kinase targeted by Erlotinib, Gefitinib, and Lapatinib in NSCLC.",
  },
  {
    id: "BRAF",
    name: "Serine/threonine-protein kinase B-raf",
    uniprot: "P15056",
    organism: "Homo sapiens",
    length: 766,
    sequence:
      "MAALSGGGGGGAEPGQALFNGDMEPEAGAGAGAAASSAADPAIPEEVWNIKQMIKLTQEHIEALLDKFGGEHNPPSIYLDAYEEYTSKLDALQQREQQLLESLGNGTDFSVSSSASMDTVTSSSSSSLSVLPSSLSVFQNPTDVARSNPKSPQKPIVRVFLPNKQRTVVPARCGVTVRDSLKKALMMRGLIPECCAVYRIQDGEKKPIGWDTDISWLTGEELHVEVLENVPLTTHNFVRKTFFTLAFCDFCRKLLFQGFRCQTCGYKFHQRCSTEVPLMCVNYDQLDLLFVSKFFEHHPIPQEEASLAETALTSGSSPSAPASDSIGPQILTSPSPSKSIPIPQPFRPADEDHRNQFGQRDRSSSAPNVHINTIEPVNIDDLIRDQGFRGDGGSTTGLSATPPASLPGSLTNVKALQKSPGPQRERKSSSSSEDRNRMKTLGRRDSSDDWEIPDGQITVGQRIGSGSFGTVYKGKWHGDVAVKMLNVTAPTPQQLQAFKNEVGVLRKTRHVNILLFMGYSTKPQLAIVTQWCEGSSLYHHLHIIETKFEMIKLIDIARQTAQGMDYLHAKSIIHRDLKSNNIFLHEDLTVKIGDFGLATVKSRWSGSHQFEQLSGSILWMAPEVIRMQDKNPYSFQSDVYAFGIVLYELMTGQLPYSNINNRDQIIFMVGRGYLSPDLSKVRSNCPKAMKRLMAECLKKKRDERPLFPQILASIELLARSLPKIHRSASEPSLNRAGFQTEDFSLYACASPKTPIQAGGYGAFPVH",
    description: "Proto-oncogene kinase frequently mutated in melanoma (V600E) and colon carcinomas.",
  },
];

export const BENCHMARK_METRICS: BaselineComparison[] = [
  {
    model: "DeepDTA+ Ensemble (Ours)",
    ci: 0.8852,
    mse: 0.2740,
    r2m: 0.6009,
    aupr: 0.7088,
  },
  {
    model: "DeepDTA+ Similarity GBM",
    ci: 0.8813,
    mse: 0.2829,
    r2m: 0.6003,
    aupr: 0.6975,
  },
  {
    model: "DeepDTA CNN (Original)",
    ci: 0.8780,
    mse: 0.2610,
    r2m: 0.6300,
    aupr: 0.7140,
  },
  {
    model: "SimBoost (Baseline)",
    ci: 0.8720,
    mse: 0.2820,
    r2m: 0.6440,
    aupr: 0.7030,
  },
  {
    model: "KronRLS (Baseline)",
    ci: 0.8710,
    mse: 0.3790,
    r2m: 0.6110,
    aupr: 0.6610,
  },
  {
    model: "Predict-the-Mean",
    ci: 0.5000,
    mse: 0.8020,
    r2m: 0.0000,
    aupr: 0.0830,
  },
];

// Ground-truth calibrated benchmarks from official Davis kinase assay
const DAVIS_CALIBRATED_PAIRS: Record<string, { pkd: number; kd_nM: number; uncertainty: number }> = {
  // Erlotinib
  "erlotinib:abl1": { pkd: 6.48, kd_nM: 330.0, uncertainty: 0.14 },
  "erlotinib:egfr": { pkd: 9.17, kd_nM: 0.67, uncertainty: 0.08 },
  "erlotinib:braf": { pkd: 5.00, kd_nM: 10000.0, uncertainty: 0.09 },
  // Gefitinib
  "gefitinib:abl1": { pkd: 6.40, kd_nM: 400.0, uncertainty: 0.15 },
  "gefitinib:egfr": { pkd: 9.00, kd_nM: 1.0, uncertainty: 0.07 },
  "gefitinib:braf": { pkd: 5.00, kd_nM: 10000.0, uncertainty: 0.08 },
  // Dasatinib
  "dasatinib:abl1": { pkd: 10.33, kd_nM: 0.05, uncertainty: 0.06 },
  "dasatinib:egfr": { pkd: 6.92, kd_nM: 120.0, uncertainty: 0.16 },
  "dasatinib:braf": { pkd: 6.30, kd_nM: 500.0, uncertainty: 0.18 },
  // Imatinib
  "imatinib:abl1": { pkd: 6.77, kd_nM: 170.0, uncertainty: 0.13 },
  "imatinib:egfr": { pkd: 5.00, kd_nM: 10000.0, uncertainty: 0.09 },
  "imatinib:braf": { pkd: 5.00, kd_nM: 10000.0, uncertainty: 0.09 },
  // Lapatinib
  "lapatinib:abl1": { pkd: 5.00, kd_nM: 10000.0, uncertainty: 0.08 },
  "lapatinib:egfr": { pkd: 8.62, kd_nM: 2.4, uncertainty: 0.09 },
  "lapatinib:braf": { pkd: 5.00, kd_nM: 10000.0, uncertainty: 0.08 },
  // Sorafenib
  "sorafenib:abl1": { pkd: 5.47, kd_nM: 3400.0, uncertainty: 0.17 },
  "sorafenib:egfr": { pkd: 5.00, kd_nM: 10000.0, uncertainty: 0.10 },
  "sorafenib:braf": { pkd: 6.27, kd_nM: 540.0, uncertainty: 0.14 },
};

export function generateMockPrediction(
  smiles: string,
  proteinSeq: string,
  compoundName?: string,
  targetName?: string
): PredictionResult {
  const sLen = smiles.length;
  const pLen = proteinSeq.length;

  // Pseudo-deterministic hashing based on SMILES + sequence content
  let hash = 0;
  for (let i = 0; i < sLen; i++) {
    hash = (hash * 31 + smiles.charCodeAt(i)) % 100000;
  }
  for (let i = 0; i < Math.min(pLen, 100); i++) {
    hash = (hash * 17 + proteinSeq.charCodeAt(i)) % 100000;
  }

  const cName = (compoundName || "").toLowerCase();
  const tName = (targetName || "").toLowerCase();

  // 1. Check for pair-specific match from Davis ground-truth assay
  let matchedPairKey: string | null = null;
  const drugKeys = ["erlotinib", "gefitinib", "dasatinib", "imatinib", "lapatinib", "sorafenib"];
  const protKeys = ["abl1", "egfr", "braf"];

  for (const dk of drugKeys) {
    if (cName.includes(dk) || smiles.toLowerCase().includes(dk)) {
      for (const pk of protKeys) {
        if (tName.includes(pk) || proteinSeq.slice(0, 50).toLowerCase().includes(pk)) {
          matchedPairKey = `${dk}:${pk}`;
          break;
        }
      }
      // If target not specifically matched by name, check common signature sequence tokens
      if (!matchedPairKey) {
        if (proteinSeq.includes("GPSENDPNLFVALYDFVASGD") || proteinSeq.includes("MLEICLKLV")) {
          matchedPairKey = `${dk}:abl1`;
        } else if (proteinSeq.includes("MRPSGTAGAALLALLAALCP") || proteinSeq.includes("EEKKVCQGTSNKLTQLGTFE")) {
          matchedPairKey = `${dk}:egfr`;
        } else if (proteinSeq.includes("MAALSGGGGGGAEPGQALFN") || proteinSeq.includes("HGDVAVKMLNVTAPTPQQLQ")) {
          matchedPairKey = `${dk}:braf`;
        }
      }
      break;
    }
  }

  let pkd: number;
  let kd_nM: number;
  let uncertainty: number;

  if (matchedPairKey && DAVIS_CALIBRATED_PAIRS[matchedPairKey]) {
    const calibrated = DAVIS_CALIBRATED_PAIRS[matchedPairKey];
    pkd = calibrated.pkd;
    kd_nM = calibrated.kd_nM;
    uncertainty = calibrated.uncertainty;
  } else if (cName.includes("aspirin") || cName.includes("caffeine")) {
    // Non-kinase baseline floor
    pkd = 5.0;
    kd_nM = 10000.0;
    uncertainty = 0.05;
  } else {
    // General deterministic fallback based on sequence and structure hashing
    const basePkd = 6.2 + (hash % 35) / 10.0; // 6.2 to 9.7
    pkd = Math.round(basePkd * 1000) / 1000;
    kd_nM = Math.round(Math.pow(10, 9 - pkd) * 100) / 100;
    uncertainty = Math.round((0.12 + ((hash % 15) / 100)) * 1000) / 1000;
  }

  const confidence_index = Math.round((0.92 - (uncertainty * 0.8)) * 1000) / 1000;
  const category = categorizeBinding(pkd);

  let explanation = "";
  if (category === "Very High Binding") {
    explanation = `Sub-10 nM affinity indicated. Extensive hydrophobic aromatic interactions across ATP-binding hinge region with minimal ensemble variance (σ = ±${uncertainty}).`;
  } else if (category === "High Binding") {
    explanation = `Strong nanomolar potency predicted. Favorable hydrogen bonding network along the catalytic loop (Kd ≈ ${kd_nM < 1000 ? kd_nM + ' nM' : (kd_nM/1000).toFixed(1) + ' µM'}).`;
  } else if (category === "Moderate Binding") {
    explanation = `Micromolar range interaction. Partial pocket complementarity with elevated model disagreement (σ = ±${uncertainty}).`;
  } else {
    explanation = `Negligible affinity predicted (pKd ≈ 5.0 baseline floor). Steric clashes or lack of donor-acceptor alignment in target domain.`;
  }

  // Generate 25 sample residue interactions
  const sampleResidues: ResidueInteraction[] = [];
  const cleanSeq = proteinSeq.replace(/[\s\r\n\t]/g, "").toUpperCase();
  const step = Math.max(1, Math.floor(cleanSeq.length / 30));

  for (let i = 0; i < Math.min(30, cleanSeq.length); i++) {
    const pos = (i + 1) * step;
    const resChar = cleanSeq[(pos - 1) % cleanSeq.length] || "A";
    const resHash = (hash + i * 43) % 100;
    const score = Math.round((resHash / 100) * 100) / 100;
    sampleResidues.push({
      pos,
      residue: resChar,
      score,
      isPocket: score > 0.75,
    });
  }

  // Use a stable timestamp derived from the hash to prevent hydration mismatches
  // (Date.now() changes between server prerender and client render)
  const stableTimestamp = new Date(0).toISOString(); // epoch — will be overwritten client-side

  return {
    id: `run-${hash}`,
    compound_name: compoundName || "Ligand Molecule",
    smiles,
    target_name: targetName || "Target Kinase",
    protein_sequence: cleanSeq,
    pkd,
    kd_nM,
    uncertainty,
    confidence_index,
    binds: pkd >= 7.0,
    binding_level: category,
    binding_explanation: explanation,
    created_at: stableTimestamp,
    is_mock: true,
    baselines: BENCHMARK_METRICS,
    residues: sampleResidues,
  };
}
