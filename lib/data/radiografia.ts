// RADIOGRAFIA — Deep candidate intelligence data
// Source: JNE Declaracion Jurada de Hoja de Vida (DJHV), SUNAT, Poder Judicial

export interface AssetDeclaration {
  year: number;
  totalAssets: number; // in PEN soles
  totalLiabilities: number;
  netWorth: number;
  properties: number;
  vehicles: number;
  income: number;
  source: string;
}

export interface LegalProceeding {
  caseId: string;
  type: "penal" | "civil" | "administrativo" | "electoral";
  status: "activo" | "archivado" | "sentenciado" | "apelacion" | "investigacion";
  year: number;
  description: string;
  court: string;
  severity: "alto" | "medio" | "bajo";
}

export interface NetworkConnection {
  id: string;
  name: string;
  type: "familiar" | "empresarial" | "politico" | "financiero" | "mediatico";
  relationship: string;
  entity?: string;
  riskLevel: "alto" | "medio" | "bajo" | "neutral";
}

export interface CampaignFinance {
  totalDeclared: number;
  topDonors: { name: string; amount: number; type: string; flagged: boolean }[];
  publicFunding: number;
  mediaSpend: number;
  digitalSpend: number;
  suspiciousFlags: string[];
}

export interface PositionChange {
  topic: string;
  year: number;
  position: string;
  evidence: string;
}

export interface CandidateRadiografia {
  candidateId: string;
  riskScore: number; // 0-100, higher = more risk
  patrimonio: AssetDeclaration[];
  legalHistory: LegalProceeding[];
  network: NetworkConnection[];
  finance: CampaignFinance;
  positionChanges: PositionChange[];
  conflictsOfInterest: string[];
  educationVerified: boolean;
  militaryService: boolean;
  yearsInPolitics: number;
  previousCandidacies: number;
  partySwitches: number;
}

// Simulated deep data for each candidate
export const radiografiaData: Record<string, CandidateRadiografia> = {
  "1": {
    // Lopez Aliaga
    candidateId: "1",
    riskScore: 42,
    patrimonio: [
      { year: 2020, totalAssets: 45_000_000, totalLiabilities: 8_200_000, netWorth: 36_800_000, properties: 12, vehicles: 5, income: 4_500_000, source: "JNE-DJHV-2020" },
      { year: 2021, totalAssets: 52_000_000, totalLiabilities: 7_800_000, netWorth: 44_200_000, properties: 14, vehicles: 6, income: 5_200_000, source: "JNE-DJHV-2021" },
      { year: 2022, totalAssets: 58_000_000, totalLiabilities: 6_500_000, netWorth: 51_500_000, properties: 15, vehicles: 6, income: 6_100_000, source: "JNE-DJHV-2022" },
      { year: 2023, totalAssets: 61_000_000, totalLiabilities: 5_900_000, netWorth: 55_100_000, properties: 15, vehicles: 7, income: 6_800_000, source: "JNE-DJHV-2023" },
      { year: 2024, totalAssets: 67_000_000, totalLiabilities: 5_200_000, netWorth: 61_800_000, properties: 16, vehicles: 7, income: 7_200_000, source: "JNE-DJHV-2024" },
      { year: 2025, totalAssets: 72_000_000, totalLiabilities: 4_800_000, netWorth: 67_200_000, properties: 17, vehicles: 8, income: 7_900_000, source: "JNE-DJHV-2025" },
    ],
    legalHistory: [
      { caseId: "EXP-2019-04281", type: "civil", status: "archivado", year: 2019, description: "Demanda civil por incumplimiento contractual en proyecto inmobiliario", court: "Juzgado Civil de Lima", severity: "bajo" },
      { caseId: "EXP-2022-01547", type: "electoral", status: "archivado", year: 2022, description: "Investigacion por presuntas irregularidades en financiamiento de campana 2021", court: "JNE", severity: "medio" },
      { caseId: "EXP-2023-07823", type: "administrativo", status: "activo", year: 2023, description: "Proceso administrativo por conflicto de intereses como alcalde de Lima", court: "Contraloria General", severity: "medio" },
    ],
    network: [
      { id: "n1", name: "Grupo Lopez SAC", type: "empresarial", relationship: "Propietario mayoritario", entity: "Holding empresarial", riskLevel: "neutral" },
      { id: "n2", name: "TV Peru Holdings", type: "mediatico", relationship: "Accionista minoritario", entity: "Medios de comunicacion", riskLevel: "medio" },
      { id: "n3", name: "Renovacion Popular", type: "politico", relationship: "Fundador y lider", entity: "Partido politico", riskLevel: "neutral" },
      { id: "n4", name: "Opus Dei Peru", type: "politico", relationship: "Miembro reconocido", entity: "Organizacion religiosa", riskLevel: "bajo" },
      { id: "n5", name: "Consorcio Inmobiliario Lima", type: "empresarial", relationship: "Director", entity: "Sector inmobiliario", riskLevel: "medio" },
      { id: "n6", name: "Camara de Comercio Lima", type: "empresarial", relationship: "Ex presidente", entity: "Gremio empresarial", riskLevel: "neutral" },
    ],
    finance: {
      totalDeclared: 4_500_000,
      topDonors: [
        { name: "Aportes propios", amount: 2_000_000, type: "Candidato", flagged: false },
        { name: "Grupo Lopez SAC", amount: 800_000, type: "Persona juridica", flagged: true },
        { name: "Inversiones del Norte SAC", amount: 350_000, type: "Persona juridica", flagged: false },
        { name: "Donantes individuales (142)", amount: 850_000, type: "Personas naturales", flagged: false },
        { name: "Actividades de recaudacion", amount: 500_000, type: "Eventos", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 1_800_000,
      digitalSpend: 650_000,
      suspiciousFlags: ["Donacion de empresa vinculada al candidato supera el 30% del total"],
    },
    positionChanges: [
      { topic: "Pena de muerte", year: 2019, position: "En contra - consideraba inviable constitucionalmente", evidence: "Entrevista RPP, Marzo 2019" },
      { topic: "Pena de muerte", year: 2021, position: "A favor - para violadores y terroristas", evidence: "Plan de gobierno 2021" },
      { topic: "Inversion extranjera", year: 2020, position: "Apertura total sin restricciones", evidence: "Foro CADE 2020" },
      { topic: "Inversion extranjera", year: 2025, position: "Apertura con condiciones de reinversion local", evidence: "Debate JNE 2025" },
    ],
    conflictsOfInterest: [
      "Como alcalde de Lima, aprobo proyecto vial que beneficia zona donde posee inmuebles",
      "Empresa familiar tiene contratos con la Municipalidad de Lima",
    ],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 6,
    previousCandidacies: 1,
    partySwitches: 0,
  },
  "2": {
    // Keiko Fujimori
    candidateId: "2",
    riskScore: 68,
    patrimonio: [
      { year: 2020, totalAssets: 2_800_000, totalLiabilities: 450_000, netWorth: 2_350_000, properties: 3, vehicles: 2, income: 380_000, source: "JNE-DJHV-2020" },
      { year: 2021, totalAssets: 3_100_000, totalLiabilities: 380_000, netWorth: 2_720_000, properties: 3, vehicles: 2, income: 420_000, source: "JNE-DJHV-2021" },
      { year: 2022, totalAssets: 3_400_000, totalLiabilities: 320_000, netWorth: 3_080_000, properties: 3, vehicles: 2, income: 480_000, source: "JNE-DJHV-2022" },
      { year: 2023, totalAssets: 3_600_000, totalLiabilities: 280_000, netWorth: 3_320_000, properties: 4, vehicles: 2, income: 510_000, source: "JNE-DJHV-2023" },
      { year: 2024, totalAssets: 3_900_000, totalLiabilities: 250_000, netWorth: 3_650_000, properties: 4, vehicles: 3, income: 550_000, source: "JNE-DJHV-2024" },
      { year: 2025, totalAssets: 4_200_000, totalLiabilities: 200_000, netWorth: 4_000_000, properties: 4, vehicles: 3, income: 600_000, source: "JNE-DJHV-2025" },
    ],
    legalHistory: [
      { caseId: "EXP-2018-00142", type: "penal", status: "activo", year: 2018, description: "Investigacion por lavado de activos relacionado con aportes de Odebrecht a campana 2011", court: "Fiscalia de la Nacion", severity: "alto" },
      { caseId: "EXP-2018-00891", type: "penal", status: "activo", year: 2018, description: "Investigacion por organizacion criminal en financiamiento de campanas", court: "Sala Penal Nacional", severity: "alto" },
      { caseId: "EXP-2020-03241", type: "penal", status: "investigacion", year: 2020, description: "Obstruccion a la justicia - presunta interferencia en testimonios", court: "Fiscalia Anticorrupcion", severity: "alto" },
      { caseId: "EXP-2015-02178", type: "electoral", status: "archivado", year: 2015, description: "Denuncia por uso de fondos publicos en campana", court: "JNE", severity: "medio" },
    ],
    network: [
      { id: "n1", name: "Alberto Fujimori", type: "familiar", relationship: "Padre - Ex presidente (1990-2000)", entity: "Ex mandatario", riskLevel: "alto" },
      { id: "n2", name: "Fuerza Popular", type: "politico", relationship: "Fundadora y lider", entity: "Partido politico", riskLevel: "medio" },
      { id: "n3", name: "Grupo Fujimori", type: "familiar", relationship: "Vinculo familiar-politico", entity: "Clan politico", riskLevel: "alto" },
      { id: "n4", name: "Mark Vito Villanella", type: "familiar", relationship: "Ex esposo", entity: "Empresario", riskLevel: "medio" },
      { id: "n5", name: "Bancada FP Congreso", type: "politico", relationship: "Lider de bancada historica", entity: "Congreso de la Republica", riskLevel: "medio" },
      { id: "n6", name: "Odebrecht", type: "financiero", relationship: "Investigada por recibir aportes", entity: "Constructora brasilena", riskLevel: "alto" },
    ],
    finance: {
      totalDeclared: 3_200_000,
      topDonors: [
        { name: "Aportes partidarios", amount: 1_200_000, type: "Partido", flagged: false },
        { name: "Eventos de recaudacion", amount: 800_000, type: "Eventos", flagged: false },
        { name: "Donantes individuales (89)", amount: 650_000, type: "Personas naturales", flagged: false },
        { name: "Aportes empresariales", amount: 550_000, type: "Personas juridicas", flagged: true },
      ],
      publicFunding: 0,
      mediaSpend: 1_400_000,
      digitalSpend: 480_000,
      suspiciousFlags: [
        "Historial de aportes no declarados en campanas anteriores (caso Odebrecht)",
        "Investigacion fiscal activa por lavado de activos en financiamiento",
      ],
    },
    positionChanges: [
      { topic: "Indulto a Alberto Fujimori", year: 2016, position: "No buscare el indulto - el pueblo decidira", evidence: "Debate presidencial 2016" },
      { topic: "Indulto a Alberto Fujimori", year: 2023, position: "Mi padre es inocente y merece libertad", evidence: "Declaraciones publicas 2023" },
      { topic: "Reforma constitucional", year: 2016, position: "Respetamos la Constitucion de 1993", evidence: "Plan de gobierno 2016" },
      { topic: "Reforma constitucional", year: 2025, position: "Abierta a reformas parciales consensuadas", evidence: "Entrevista Canal N 2025" },
    ],
    conflictsOfInterest: [
      "Investigacion activa por lavado de activos podria generar conflicto con el Poder Judicial si es elegida",
      "Historial de bancada FP bloqueando reformas anticorrupcion en el Congreso",
      "Vinculo con caso Odebrecht - mayor caso de corrupcion en Latinoamerica",
    ],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 20,
    previousCandidacies: 3,
    partySwitches: 0,
  },
  "5": {
    // Carlos Alvarez
    candidateId: "5",
    riskScore: 18,
    patrimonio: [
      { year: 2022, totalAssets: 1_200_000, totalLiabilities: 180_000, netWorth: 1_020_000, properties: 2, vehicles: 1, income: 850_000, source: "JNE-DJHV-2022" },
      { year: 2023, totalAssets: 1_400_000, totalLiabilities: 150_000, netWorth: 1_250_000, properties: 2, vehicles: 1, income: 920_000, source: "JNE-DJHV-2023" },
      { year: 2024, totalAssets: 1_600_000, totalLiabilities: 120_000, netWorth: 1_480_000, properties: 2, vehicles: 2, income: 980_000, source: "JNE-DJHV-2024" },
      { year: 2025, totalAssets: 1_800_000, totalLiabilities: 100_000, netWorth: 1_700_000, properties: 2, vehicles: 2, income: 1_050_000, source: "JNE-DJHV-2025" },
    ],
    legalHistory: [
      { caseId: "EXP-2020-08412", type: "civil", status: "archivado", year: 2020, description: "Demanda por difamacion - caso resuelto a favor", court: "Juzgado Civil Lima", severity: "bajo" },
    ],
    network: [
      { id: "n1", name: "Pais para Todos", type: "politico", relationship: "Candidato presidencial", entity: "Partido politico", riskLevel: "neutral" },
      { id: "n2", name: "Productora Alvarez", type: "empresarial", relationship: "Fundador", entity: "Entretenimiento", riskLevel: "neutral" },
      { id: "n3", name: "Canal 4 / ATV", type: "mediatico", relationship: "Colaborador historico", entity: "Television", riskLevel: "bajo" },
    ],
    finance: {
      totalDeclared: 1_800_000,
      topDonors: [
        { name: "Aportes propios", amount: 600_000, type: "Candidato", flagged: false },
        { name: "Eventos de recaudacion", amount: 500_000, type: "Eventos", flagged: false },
        { name: "Donantes individuales (234)", amount: 700_000, type: "Personas naturales", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 800_000,
      digitalSpend: 350_000,
      suspiciousFlags: [],
    },
    positionChanges: [],
    conflictsOfInterest: [],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 3,
    previousCandidacies: 0,
    partySwitches: 0,
  },
};

// Helper to get radiografia by candidate ID
export function getRadiografia(candidateId: string): CandidateRadiografia | null {
  return radiografiaData[candidateId] || null;
}

// Format currency in soles
export function formatSoles(amount: number): string {
  if (amount >= 1_000_000) {
    return `S/ ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `S/ ${(amount / 1_000).toFixed(0)}K`;
  }
  return `S/ ${amount.toLocaleString()}`;
}

// Risk level color mapping
export const RISK_COLORS = {
  alto: { text: "text-rose", bg: "bg-rose/10", border: "border-rose/20", glow: "glow-rose" },
  medio: { text: "text-amber", bg: "bg-amber/10", border: "border-amber/20", glow: "glow-amber" },
  bajo: { text: "text-sky", bg: "bg-sky/10", border: "border-sky/20" },
  neutral: { text: "text-muted-foreground", bg: "bg-muted/50", border: "border-border" },
} as const;

// Status labels
export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  activo: { label: "ACTIVO", color: "text-rose" },
  archivado: { label: "ARCHIVADO", color: "text-muted-foreground" },
  sentenciado: { label: "SENTENCIADO", color: "text-rose" },
  apelacion: { label: "EN APELACION", color: "text-amber" },
  investigacion: { label: "EN INVESTIGACION", color: "text-amber" },
};
