// RADIOGRAFIA — Deep candidate intelligence data
// ⚠️ DATOS SIMULADOS — Toda la información es ficticia con fines de demostración.
// PE: Cuando se conecte a fuentes reales (JNE DJHV, SUNAT, Poder Judicial), se reemplazará.
// CO: Cuando se conecte a fuentes reales (Fiscalía, Procuraduría, Contraloría, CNE, RNEC), se reemplazará.

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
  status: "activo" | "archivado" | "sentenciado" | "apelación" | "investigación";
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
      { caseId: "EXP-2022-01547", type: "electoral", status: "archivado", year: 2022, description: "Investigación por presuntas irregularidades en financiamiento de campaña 2021", court: "JNE", severity: "medio" },
      { caseId: "EXP-2023-07823", type: "administrativo", status: "activo", year: 2023, description: "Proceso administrativo por conflicto de intereses como alcalde de Lima", court: "Contraloría General", severity: "medio" },
    ],
    network: [
      { id: "n1", name: "Grupo Lopez SAC", type: "empresarial", relationship: "Propietario mayoritario", entity: "Holding empresarial", riskLevel: "neutral" },
      { id: "n2", name: "TV Peru Holdings", type: "mediatico", relationship: "Accionista minoritario", entity: "Medios de comunicación", riskLevel: "medio" },
      { id: "n3", name: "Renovación Popular", type: "politico", relationship: "Fundador y líder", entity: "Partido político", riskLevel: "neutral" },
      { id: "n4", name: "Opus Dei Perú", type: "politico", relationship: "Miembro reconocido", entity: "Organización religiosa", riskLevel: "bajo" },
      { id: "n5", name: "Consorcio Inmobiliario Lima", type: "empresarial", relationship: "Director", entity: "Sector inmobiliario", riskLevel: "medio" },
      { id: "n6", name: "Camara de Comercio Lima", type: "empresarial", relationship: "Ex presidente", entity: "Gremio empresarial", riskLevel: "neutral" },
    ],
    finance: {
      totalDeclared: 4_500_000,
      topDonors: [
        { name: "Aportes propios", amount: 2_000_000, type: "Candidato", flagged: false },
        { name: "Grupo Lopez SAC", amount: 800_000, type: "Persona jurídica", flagged: true },
        { name: "Inversiones del Norte SAC", amount: 350_000, type: "Persona jurídica", flagged: false },
        { name: "Donantes individuales (142)", amount: 850_000, type: "Personas naturales", flagged: false },
        { name: "Actividades de recaudación", amount: 500_000, type: "Eventos", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 1_800_000,
      digitalSpend: 650_000,
      suspiciousFlags: ["Donación de empresa vinculada al candidato supera el 30% del total"],
    },
    positionChanges: [
      { topic: "Pena de muerte", year: 2019, position: "En contra - consideraba inviable constitucionalmente", evidence: "Entrevista RPP, Marzo 2019" },
      { topic: "Pena de muerte", year: 2021, position: "A favor - para violadores y terroristas", evidence: "Plan de gobierno 2021" },
      { topic: "Inversión extranjera", year: 2020, position: "Apertura total sin restricciones", evidence: "Foro CADE 2020" },
      { topic: "Inversión extranjera", year: 2025, position: "Apertura con condiciones de reinversión local", evidence: "Debate JNE 2025" },
    ],
    conflictsOfInterest: [
      "Como alcalde de Lima, aprobó proyecto vial que beneficia zona donde posee inmuebles",
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
      { caseId: "EXP-2018-00142", type: "penal", status: "activo", year: 2018, description: "Investigación por lavado de activos relacionado con aportes de Odebrecht a campaña 2011", court: "Fiscalía de la Nación", severity: "alto" },
      { caseId: "EXP-2018-00891", type: "penal", status: "activo", year: 2018, description: "Investigación por organización criminal en financiamiento de campañas", court: "Sala Penal Nacional", severity: "alto" },
      { caseId: "EXP-2020-03241", type: "penal", status: "investigación", year: 2020, description: "Obstrucción a la justicia - presunta interferencia en testimonios", court: "Fiscalía Anticorrupción", severity: "alto" },
      { caseId: "EXP-2015-02178", type: "electoral", status: "archivado", year: 2015, description: "Denuncia por uso de fondos públicos en campaña", court: "JNE", severity: "medio" },
    ],
    network: [
      { id: "n1", name: "Alberto Fujimori", type: "familiar", relationship: "Padre - Ex presidente (1990-2000)", entity: "Ex mandatario", riskLevel: "alto" },
      { id: "n2", name: "Fuerza Popular", type: "politico", relationship: "Fundadora y líder", entity: "Partido político", riskLevel: "medio" },
      { id: "n3", name: "Grupo Fujimori", type: "familiar", relationship: "Vínculo familiar-político", entity: "Clan político", riskLevel: "alto" },
      { id: "n4", name: "Mark Vito Villanella", type: "familiar", relationship: "Ex esposo", entity: "Empresario", riskLevel: "medio" },
      { id: "n5", name: "Bancada FP Congreso", type: "politico", relationship: "Líder de bancada histórica", entity: "Congreso de la República", riskLevel: "medio" },
      { id: "n6", name: "Odebrecht", type: "financiero", relationship: "Investigada por recibir aportes", entity: "Constructora brasileña", riskLevel: "alto" },
    ],
    finance: {
      totalDeclared: 3_200_000,
      topDonors: [
        { name: "Aportes partidarios", amount: 1_200_000, type: "Partido", flagged: false },
        { name: "Eventos de recaudación", amount: 800_000, type: "Eventos", flagged: false },
        { name: "Donantes individuales (89)", amount: 650_000, type: "Personas naturales", flagged: false },
        { name: "Aportes empresariales", amount: 550_000, type: "Personas jurídicas", flagged: true },
      ],
      publicFunding: 0,
      mediaSpend: 1_400_000,
      digitalSpend: 480_000,
      suspiciousFlags: [
        "Historial de aportes no declarados en campañas anteriores (caso Odebrecht)",
        "Investigación fiscal activa por lavado de activos en financiamiento",
      ],
    },
    positionChanges: [
      { topic: "Indulto a Alberto Fujimori", year: 2016, position: "No buscaré el indulto - el pueblo decidirá", evidence: "Debate presidencial 2016" },
      { topic: "Indulto a Alberto Fujimori", year: 2023, position: "Mi padre es inocente y merece libertad", evidence: "Declaraciones públicas 2023" },
      { topic: "Reforma constitucional", year: 2016, position: "Respetamos la Constitución de 1993", evidence: "Plan de gobierno 2016" },
      { topic: "Reforma constitucional", year: 2025, position: "Abierta a reformas parciales consensuadas", evidence: "Entrevista Canal N 2025" },
    ],
    conflictsOfInterest: [
      "Investigación activa por lavado de activos podría generar conflicto con el Poder Judicial si es elegida",
      "Historial de bancada FP bloqueando reformas anticorrupción en el Congreso",
      "Vínculo con caso Odebrecht - mayor caso de corrupción en Latinoamérica",
    ],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 20,
    previousCandidacies: 3,
    partySwitches: 0,
  },
  "3": {
    // Carlos Alvarez (Carlín) — ID was incorrectly "5", fixed to match candidates.ts
    candidateId: "3",
    riskScore: 18,
    patrimonio: [
      { year: 2022, totalAssets: 1_200_000, totalLiabilities: 180_000, netWorth: 1_020_000, properties: 2, vehicles: 1, income: 850_000, source: "JNE-DJHV-2022" },
      { year: 2023, totalAssets: 1_400_000, totalLiabilities: 150_000, netWorth: 1_250_000, properties: 2, vehicles: 1, income: 920_000, source: "JNE-DJHV-2023" },
      { year: 2024, totalAssets: 1_600_000, totalLiabilities: 120_000, netWorth: 1_480_000, properties: 2, vehicles: 2, income: 980_000, source: "JNE-DJHV-2024" },
      { year: 2025, totalAssets: 1_800_000, totalLiabilities: 100_000, netWorth: 1_700_000, properties: 2, vehicles: 2, income: 1_050_000, source: "JNE-DJHV-2025" },
    ],
    legalHistory: [
      { caseId: "EXP-2020-08412", type: "civil", status: "archivado", year: 2020, description: "Demanda por difamación - caso resuelto a favor", court: "Juzgado Civil Lima", severity: "bajo" },
    ],
    network: [
      { id: "n1", name: "País para Todos", type: "politico", relationship: "Candidato presidencial", entity: "Partido político", riskLevel: "neutral" },
      { id: "n2", name: "Productora Alvarez", type: "empresarial", relationship: "Fundador", entity: "Entretenimiento", riskLevel: "neutral" },
      { id: "n3", name: "Canal 4 / ATV", type: "mediatico", relationship: "Colaborador histórico", entity: "Televisión", riskLevel: "bajo" },
    ],
    finance: {
      totalDeclared: 1_800_000,
      topDonors: [
        { name: "Aportes propios", amount: 600_000, type: "Candidato", flagged: false },
        { name: "Eventos de recaudación", amount: 500_000, type: "Eventos", flagged: false },
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

  // ============================================================
  // 🇨🇴 COLOMBIA — DATOS SIMULADOS para demostración
  // Fuentes simuladas: Fiscalía General de la Nación, Procuraduría,
  // Contraloría, CNE, RNEC
  // ============================================================

  "co-ivan-cepeda": {
    candidateId: "co-ivan-cepeda",
    riskScore: 35,
    patrimonio: [
      { year: 2022, totalAssets: 820_000_000, totalLiabilities: 95_000_000, netWorth: 725_000_000, properties: 1, vehicles: 1, income: 180_000_000, source: "SIMULADO-CNE-RNEC-2022" },
      { year: 2023, totalAssets: 890_000_000, totalLiabilities: 80_000_000, netWorth: 810_000_000, properties: 1, vehicles: 1, income: 195_000_000, source: "SIMULADO-CNE-RNEC-2023" },
      { year: 2024, totalAssets: 960_000_000, totalLiabilities: 65_000_000, netWorth: 895_000_000, properties: 2, vehicles: 1, income: 210_000_000, source: "SIMULADO-CNE-RNEC-2024" },
      { year: 2025, totalAssets: 1_050_000_000, totalLiabilities: 50_000_000, netWorth: 1_000_000_000, properties: 2, vehicles: 1, income: 225_000_000, source: "SIMULADO-CNE-RNEC-2025" },
    ],
    legalHistory: [
      { caseId: "FISCALIA-2008-INV-0041", type: "penal", status: "archivado", year: 2008, description: "Amenazas recibidas por labor de defensa de derechos humanos — caso investigado como víctima", court: "Fiscalía General de la Nación", severity: "bajo" },
      { caseId: "PROCUR-2015-DIS-0287", type: "administrativo", status: "archivado", year: 2015, description: "Queja disciplinaria por declaraciones en debate legislativo — archivada por improcedencia", court: "Procuraduría General de la Nación", severity: "bajo" },
    ],
    network: [
      { id: "co-n1", name: "Pacto Histórico", type: "politico", relationship: "Senador y figura central de la coalición", entity: "Coalición política", riskLevel: "neutral" },
      { id: "co-n2", name: "Gustavo Petro", type: "politico", relationship: "Aliado político — presidente en ejercicio", entity: "Presidencia de la República", riskLevel: "medio" },
      { id: "co-n3", name: "Movimiento de Víctimas del Conflicto", type: "politico", relationship: "Defensor histórico y vocero", entity: "Organizaciones de víctimas", riskLevel: "neutral" },
      { id: "co-n4", name: "Movimientos sociales y sindicales", type: "politico", relationship: "Aliado de larga data", entity: "Sociedad civil", riskLevel: "neutral" },
      { id: "co-n5", name: "Organizaciones internacionales de DDHH", type: "politico", relationship: "Colaborador y fuente testimonial", entity: "ONG internacionales", riskLevel: "neutral" },
    ],
    finance: {
      totalDeclared: 3_500_000_000,
      topDonors: [
        { name: "Fondo Pacto Histórico", amount: 1_400_000_000, type: "Partido", flagged: false },
        { name: "Donantes individuales (1,250)", amount: 900_000_000, type: "Personas naturales", flagged: false },
        { name: "Eventos de recaudación popular", amount: 650_000_000, type: "Eventos", flagged: false },
        { name: "Aportes propios", amount: 350_000_000, type: "Candidato", flagged: false },
        { name: "Aportes sindicales", amount: 200_000_000, type: "Organizaciones", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 1_200_000_000,
      digitalSpend: 800_000_000,
      suspiciousFlags: [],
    },
    positionChanges: [
      { topic: "Reforma agraria", year: 2012, position: "Expropiación de tierras improductivas de latifundistas", evidence: "Debate Senado, Plenaria 2012" },
      { topic: "Reforma agraria", year: 2025, position: "Reforma agraria integral con compra asistida y apoyo técnico campesino", evidence: "Programa de gobierno 2026" },
      { topic: "Relaciones con Venezuela", year: 2015, position: "Defensa del diálogo bilateral sin condiciones", evidence: "Entrevista Caracol Radio 2015" },
      { topic: "Relaciones con Venezuela", year: 2025, position: "Diálogo crítico con exigencia de garantías democráticas", evidence: "Foro Semana 2025" },
    ],
    conflictsOfInterest: [
      "Estrecha alianza con el presidente Petro podría comprometer independencia ejecutiva",
      "Posible percepción de continuismo del Pacto Histórico en el poder",
    ],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 22,
    previousCandidacies: 0,
    partySwitches: 0,
  },

  "co-abelardo-de-la-espriella": {
    candidateId: "co-abelardo-de-la-espriella",
    riskScore: 45,
    patrimonio: [
      { year: 2022, totalAssets: 4_200_000_000, totalLiabilities: 600_000_000, netWorth: 3_600_000_000, properties: 5, vehicles: 4, income: 1_800_000_000, source: "SIMULADO-CNE-RNEC-2022" },
      { year: 2023, totalAssets: 4_800_000_000, totalLiabilities: 550_000_000, netWorth: 4_250_000_000, properties: 6, vehicles: 4, income: 2_100_000_000, source: "SIMULADO-CNE-RNEC-2023" },
      { year: 2024, totalAssets: 5_400_000_000, totalLiabilities: 500_000_000, netWorth: 4_900_000_000, properties: 6, vehicles: 5, income: 2_300_000_000, source: "SIMULADO-CNE-RNEC-2024" },
      { year: 2025, totalAssets: 5_900_000_000, totalLiabilities: 480_000_000, netWorth: 5_420_000_000, properties: 7, vehicles: 5, income: 2_500_000_000, source: "SIMULADO-CNE-RNEC-2025" },
    ],
    legalHistory: [
      { caseId: "CONSEJO-SUP-JUD-2017-0482", type: "administrativo", status: "archivado", year: 2017, description: "Queja ante Consejo Superior de la Judicatura por conducta procesal — archivada", court: "Consejo Superior de la Judicatura", severity: "bajo" },
      { caseId: "PROCUR-2021-QD-1103", type: "administrativo", status: "archivado", year: 2021, description: "Queja disciplinaria por declaraciones en medios sobre procesos judiciales activos", court: "Procuraduría General de la Nación", severity: "bajo" },
    ],
    network: [
      { id: "co-n1", name: "Defensores de la Patria", type: "politico", relationship: "Fundador y candidato presidencial", entity: "Partido político (propio)", riskLevel: "neutral" },
      { id: "co-n2", name: "Bufete De la Espriella Lawyers", type: "empresarial", relationship: "Socio fundador", entity: "Firma de abogados", riskLevel: "medio" },
      { id: "co-n3", name: "Medios de comunicación nacionales", type: "mediatico", relationship: "Panelista frecuente en TV y radio", entity: "Medios", riskLevel: "bajo" },
      { id: "co-n4", name: "Sector empresarial y gremios", type: "empresarial", relationship: "Asesor legal de alto perfil", entity: "Sector privado", riskLevel: "medio" },
      { id: "co-n5", name: "Clientes con nexos controvertidos", type: "financiero", relationship: "Defensor penal de figuras vinculadas a narco y paramilitarismo", entity: "Defensa legal", riskLevel: "alto" },
    ],
    finance: {
      totalDeclared: 5_000_000_000,
      topDonors: [
        { name: "Aportes propios", amount: 2_200_000_000, type: "Candidato", flagged: true },
        { name: "Sector empresarial y gremios", amount: 1_300_000_000, type: "Personas jurídicas", flagged: false },
        { name: "Donantes individuales (320)", amount: 800_000_000, type: "Personas naturales", flagged: false },
        { name: "Eventos de recaudación", amount: 450_000_000, type: "Eventos", flagged: false },
        { name: "Aportes Defensores de la Patria", amount: 250_000_000, type: "Partido", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 2_100_000_000,
      digitalSpend: 1_200_000_000,
      suspiciousFlags: [
        "Aporte personal del candidato supera 44% del total declarado",
        "Origen de fondos del bufete incluye honorarios de clientes con antecedentes judiciales complejos",
      ],
    },
    positionChanges: [
      { topic: "Participación política", year: 2018, position: "Los abogados no debemos meternos en política partidista", evidence: "Entrevista Blu Radio, Junio 2018" },
      { topic: "Participación política", year: 2024, position: "Colombia necesita un outsider que rompa el sistema", evidence: "Lanzamiento Defensores de la Patria 2024" },
      { topic: "Proceso de paz", year: 2016, position: "Neutralidad — defensa técnica de actores de todos los bandos", evidence: "Declaración pública 2016" },
      { topic: "Proceso de paz", year: 2025, position: "El acuerdo de paz fue una capitulación ante el terrorismo", evidence: "Programa de gobierno 2026" },
    ],
    conflictsOfInterest: [
      "Historial de defensa legal de figuras vinculadas a narcotráfico y paramilitarismo",
      "Firma de abogados con clientes en sectores regulados por el Estado",
      "Transición abrupta de abogado mediático a candidato presidencial genera dudas sobre financiación",
    ],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 3,
    previousCandidacies: 0,
    partySwitches: 0,
  },

  "co-claudia-lopez": {
    candidateId: "co-claudia-lopez",
    riskScore: 30,
    patrimonio: [
      { year: 2022, totalAssets: 1_600_000_000, totalLiabilities: 280_000_000, netWorth: 1_320_000_000, properties: 2, vehicles: 1, income: 280_000_000, source: "SIMULADO-CNE-RNEC-2022" },
      { year: 2023, totalAssets: 1_800_000_000, totalLiabilities: 240_000_000, netWorth: 1_560_000_000, properties: 2, vehicles: 1, income: 310_000_000, source: "SIMULADO-CNE-RNEC-2023" },
      { year: 2024, totalAssets: 2_100_000_000, totalLiabilities: 200_000_000, netWorth: 1_900_000_000, properties: 2, vehicles: 2, income: 350_000_000, source: "SIMULADO-CNE-RNEC-2024" },
      { year: 2025, totalAssets: 2_400_000_000, totalLiabilities: 180_000_000, netWorth: 2_220_000_000, properties: 3, vehicles: 2, income: 380_000_000, source: "SIMULADO-CNE-RNEC-2025" },
    ],
    legalHistory: [
      { caseId: "CONTRALORIA-2023-AUD-0892", type: "administrativo", status: "archivado", year: 2023, description: "Auditoría a decisiones contractuales del Metro de Bogotá primera línea — sin hallazgos fiscales", court: "Contraloría General de la República", severity: "bajo" },
      { caseId: "PROCUR-2022-DIS-0561", type: "administrativo", status: "archivado", year: 2022, description: "Investigación disciplinaria por decisiones administrativas en Alcaldía de Bogotá — archivada", court: "Procuraduría General de la Nación", severity: "bajo" },
    ],
    network: [
      { id: "co-n1", name: "Alianza Verde", type: "politico", relationship: "Miembro y excandidata por el partido", entity: "Partido político", riskLevel: "neutral" },
      { id: "co-n2", name: "Movimiento anticorrupción", type: "politico", relationship: "Promotora de consultas anticorrupción", entity: "Sociedad civil", riskLevel: "neutral" },
      { id: "co-n3", name: "Comunidad LGBTQ+", type: "politico", relationship: "Referente visible y activista", entity: "Movimiento social", riskLevel: "neutral" },
      { id: "co-n4", name: "Academia e investigación", type: "politico", relationship: "Exinvestigadora y politóloga", entity: "Universidades", riskLevel: "neutral" },
      { id: "co-n5", name: "Angélica Lozano", type: "familiar", relationship: "Pareja y senadora de Alianza Verde", entity: "Congreso de la República", riskLevel: "bajo" },
    ],
    finance: {
      totalDeclared: 4_000_000_000,
      topDonors: [
        { name: "Fondo Alianza Verde", amount: 1_500_000_000, type: "Partido", flagged: false },
        { name: "Crowdfunding ciudadano", amount: 1_100_000_000, type: "Personas naturales", flagged: false },
        { name: "Donantes individuales (2,100)", amount: 800_000_000, type: "Personas naturales", flagged: false },
        { name: "Eventos y vaquitas", amount: 400_000_000, type: "Eventos", flagged: false },
        { name: "Aportes propios", amount: 200_000_000, type: "Candidato", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 1_500_000_000,
      digitalSpend: 1_100_000_000,
      suspiciousFlags: [],
    },
    positionChanges: [
      { topic: "Rol profesional", year: 2010, position: "Periodista investigativa enfocada en denuncias de corrupción", evidence: "Publicaciones en La Silla Vacía y medios 2010" },
      { topic: "Rol profesional", year: 2018, position: "Candidata política con plataforma anticorrupción desde el Estado", evidence: "Campaña Alcaldía de Bogotá 2018" },
      { topic: "Transporte público Bogotá", year: 2019, position: "Metro elevado como solución más eficiente y económica", evidence: "Propuesta de campaña Alcaldía 2019" },
      { topic: "Transporte público Bogotá", year: 2022, position: "Metro subterráneo primera línea — respetando diseño técnico existente", evidence: "Decisión como Alcaldesa 2022" },
    ],
    conflictsOfInterest: [
      "Pareja (Angélica Lozano) es senadora activa — posible confluencia de intereses legislativo-ejecutivo",
      "Decisiones sobre Metro de Bogotá primera línea generaron controversia sobre cambios de diseño y sobrecostos",
    ],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 15,
    previousCandidacies: 0,
    partySwitches: 1,
  },

  "co-sergio-fajardo": {
    candidateId: "co-sergio-fajardo",
    riskScore: 40,
    patrimonio: [
      { year: 2022, totalAssets: 1_900_000_000, totalLiabilities: 320_000_000, netWorth: 1_580_000_000, properties: 2, vehicles: 1, income: 240_000_000, source: "SIMULADO-CNE-RNEC-2022" },
      { year: 2023, totalAssets: 2_100_000_000, totalLiabilities: 280_000_000, netWorth: 1_820_000_000, properties: 2, vehicles: 1, income: 260_000_000, source: "SIMULADO-CNE-RNEC-2023" },
      { year: 2024, totalAssets: 2_400_000_000, totalLiabilities: 250_000_000, netWorth: 2_150_000_000, properties: 3, vehicles: 2, income: 290_000_000, source: "SIMULADO-CNE-RNEC-2024" },
      { year: 2025, totalAssets: 2_700_000_000, totalLiabilities: 220_000_000, netWorth: 2_480_000_000, properties: 3, vehicles: 2, income: 310_000_000, source: "SIMULADO-CNE-RNEC-2025" },
    ],
    legalHistory: [
      { caseId: "FISCALIA-2021-INV-4821", type: "penal", status: "investigación", year: 2021, description: "Investigación por presunta financiación irregular de campaña 2018 con fondos del partido La U", court: "Fiscalía General de la Nación", severity: "alto" },
      { caseId: "CNE-2019-FIN-0234", type: "electoral", status: "activo", year: 2019, description: "Proceso por presuntas irregularidades en reporte de ingresos de campaña presidencial 2018", court: "Consejo Nacional Electoral", severity: "medio" },
      { caseId: "CONTRALORIA-2010-AUD-0178", type: "administrativo", status: "archivado", year: 2010, description: "Auditoría a gestión como Gobernador de Antioquia — sin hallazgos fiscales graves", court: "Contraloría General de la República", severity: "bajo" },
    ],
    network: [
      { id: "co-n1", name: "Dignidad y Compromiso", type: "politico", relationship: "Fundador de la coalición", entity: "Coalición política", riskLevel: "neutral" },
      { id: "co-n2", name: "Comunidad académica Medellín", type: "politico", relationship: "Exprofesor de matemáticas U. de los Andes y U. Nacional", entity: "Academia", riskLevel: "neutral" },
      { id: "co-n3", name: "Redes de transformación social Medellín", type: "politico", relationship: "Arquitecto del modelo de educación y cultura de Medellín", entity: "Sociedad civil", riskLevel: "neutral" },
      { id: "co-n4", name: "Partido La U (histórico)", type: "financiero", relationship: "Receptor de fondos en campaña 2018 — bajo investigación", entity: "Partido político", riskLevel: "alto" },
      { id: "co-n5", name: "Múltiples coaliciones", type: "politico", relationship: "Ha transitado entre Colombia Humana, Compromiso Ciudadano, independiente", entity: "Coaliciones varias", riskLevel: "medio" },
    ],
    finance: {
      totalDeclared: 3_800_000_000,
      topDonors: [
        { name: "Fondo Dignidad y Compromiso", amount: 1_200_000_000, type: "Coalición", flagged: false },
        { name: "Donantes individuales (890)", amount: 950_000_000, type: "Personas naturales", flagged: false },
        { name: "Aportes propios", amount: 400_000_000, type: "Candidato", flagged: false },
        { name: "Eventos académicos y recaudación", amount: 650_000_000, type: "Eventos", flagged: false },
        { name: "Aportes no identificados (campaña 2018)", amount: 600_000_000, type: "Sin clasificar", flagged: true },
      ],
      publicFunding: 0,
      mediaSpend: 1_300_000_000,
      digitalSpend: 700_000_000,
      suspiciousFlags: [
        "Investigación activa por financiación irregular de campaña 2018",
        "Aportes del partido La U en 2018 no fueron reportados oportunamente al CNE",
      ],
    },
    positionChanges: [
      { topic: "Posición ideológica", year: 2012, position: "Centro independiente — ni izquierda ni derecha", evidence: "Discurso campaña Gobernación Antioquia 2012" },
      { topic: "Posición ideológica", year: 2025, position: "Centro — pero cada vez más aislado sin aliados claros", evidence: "Entrevistas y análisis políticos 2025" },
      { topic: "Alianzas políticas", year: 2018, position: "Alianza amplia con sectores de centro-izquierda y La U", evidence: "Coalición presidencial 2018" },
      { topic: "Alianzas políticas", year: 2022, position: "Independiente — rechazó alianzas con partidos tradicionales", evidence: "Campaña 2022" },
      { topic: "Alianzas políticas", year: 2025, position: "Coalición propia Dignidad y Compromiso sin partidos grandes", evidence: "Lanzamiento coalición 2025" },
    ],
    conflictsOfInterest: [
      "Investigación fiscal activa por financiación irregular de campaña 2018 — riesgo legal vigente",
      "Múltiples cambios de coalición generan dudas sobre estabilidad de alianzas",
      "Aislamiento político del centro podría limitar gobernabilidad",
    ],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 18,
    previousCandidacies: 2,
    partySwitches: 3,
  },

  // ─── Remaining PE candidates ───

  "4": {
    // George Forsyth
    candidateId: "4",
    riskScore: 22,
    patrimonio: [
      { year: 2022, totalAssets: 3_500_000, totalLiabilities: 600_000, netWorth: 2_900_000, properties: 2, vehicles: 2, income: 650_000, source: "JNE-DJHV-2022" },
      { year: 2023, totalAssets: 3_800_000, totalLiabilities: 550_000, netWorth: 3_250_000, properties: 2, vehicles: 2, income: 700_000, source: "JNE-DJHV-2023" },
      { year: 2024, totalAssets: 4_200_000, totalLiabilities: 480_000, netWorth: 3_720_000, properties: 3, vehicles: 3, income: 750_000, source: "JNE-DJHV-2024" },
      { year: 2025, totalAssets: 4_600_000, totalLiabilities: 420_000, netWorth: 4_180_000, properties: 3, vehicles: 3, income: 800_000, source: "JNE-DJHV-2025" },
    ],
    legalHistory: [
      { caseId: "EXP-2022-05821", type: "administrativo", status: "archivado", year: 2022, description: "Investigación por presuntas irregularidades en gestión de la Municipalidad de La Victoria", court: "Contraloría General", severity: "bajo" },
    ],
    network: [
      { id: "n1", name: "Somos Perú", type: "politico", relationship: "Candidato presidencial", entity: "Partido político", riskLevel: "neutral" },
      { id: "n2", name: "Alianza Lima", type: "empresarial", relationship: "Exjugador profesional", entity: "Fútbol profesional", riskLevel: "neutral" },
      { id: "n3", name: "Municipalidad de La Victoria", type: "politico", relationship: "Exalcalde (2019-2022)", entity: "Gobierno local", riskLevel: "bajo" },
      { id: "n4", name: "Vanessa Terkes", type: "familiar", relationship: "Exesposa — actriz", entity: "Entretenimiento", riskLevel: "neutral" },
    ],
    finance: {
      totalDeclared: 2_200_000,
      topDonors: [
        { name: "Aportes propios", amount: 800_000, type: "Candidato", flagged: false },
        { name: "Donantes individuales (178)", amount: 650_000, type: "Personas naturales", flagged: false },
        { name: "Eventos de recaudación", amount: 450_000, type: "Eventos", flagged: false },
        { name: "Aportes partidarios Somos Perú", amount: 300_000, type: "Partido", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 900_000,
      digitalSpend: 550_000,
      suspiciousFlags: [],
    },
    positionChanges: [
      { topic: "Gestión municipal", year: 2019, position: "La Victoria será el modelo de seguridad para todo Lima", evidence: "Campaña Alcaldía 2019" },
      { topic: "Gestión municipal", year: 2022, position: "Reconoce que los resultados fueron parciales por falta de presupuesto", evidence: "Entrevista RPP 2022" },
    ],
    conflictsOfInterest: [
      "Tránsito rápido de alcalde distrital a candidato presidencial con experiencia política limitada",
    ],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 6,
    previousCandidacies: 0,
    partySwitches: 1,
  },

  "5": {
    // José López-Chau
    candidateId: "5",
    riskScore: 15,
    patrimonio: [
      { year: 2022, totalAssets: 980_000, totalLiabilities: 120_000, netWorth: 860_000, properties: 1, vehicles: 1, income: 420_000, source: "JNE-DJHV-2022" },
      { year: 2023, totalAssets: 1_050_000, totalLiabilities: 100_000, netWorth: 950_000, properties: 1, vehicles: 1, income: 450_000, source: "JNE-DJHV-2023" },
      { year: 2024, totalAssets: 1_150_000, totalLiabilities: 90_000, netWorth: 1_060_000, properties: 1, vehicles: 1, income: 480_000, source: "JNE-DJHV-2024" },
      { year: 2025, totalAssets: 1_250_000, totalLiabilities: 80_000, netWorth: 1_170_000, properties: 1, vehicles: 1, income: 510_000, source: "JNE-DJHV-2025" },
    ],
    legalHistory: [],
    network: [
      { id: "n1", name: "País para Todos", type: "politico", relationship: "Candidato presidencial", entity: "Partido político", riskLevel: "neutral" },
      { id: "n2", name: "Academia económica peruana", type: "politico", relationship: "Profesor y economista", entity: "Universidad", riskLevel: "neutral" },
      { id: "n3", name: "Sectores de centro-izquierda", type: "politico", relationship: "Aliado ideológico", entity: "Movimientos sociales", riskLevel: "neutral" },
    ],
    finance: {
      totalDeclared: 1_500_000,
      topDonors: [
        { name: "Aportes partidarios", amount: 500_000, type: "Partido", flagged: false },
        { name: "Donantes individuales (312)", amount: 550_000, type: "Personas naturales", flagged: false },
        { name: "Aportes propios", amount: 250_000, type: "Candidato", flagged: false },
        { name: "Eventos académicos", amount: 200_000, type: "Eventos", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 600_000,
      digitalSpend: 300_000,
      suspiciousFlags: [],
    },
    positionChanges: [],
    conflictsOfInterest: [],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 8,
    previousCandidacies: 0,
    partySwitches: 0,
  },

  "6": {
    // César Acuña
    candidateId: "6",
    riskScore: 55,
    patrimonio: [
      { year: 2020, totalAssets: 85_000_000, totalLiabilities: 12_000_000, netWorth: 73_000_000, properties: 18, vehicles: 6, income: 12_000_000, source: "JNE-DJHV-2020" },
      { year: 2021, totalAssets: 92_000_000, totalLiabilities: 11_000_000, netWorth: 81_000_000, properties: 20, vehicles: 7, income: 14_000_000, source: "JNE-DJHV-2021" },
      { year: 2022, totalAssets: 98_000_000, totalLiabilities: 10_000_000, netWorth: 88_000_000, properties: 22, vehicles: 7, income: 15_000_000, source: "JNE-DJHV-2022" },
      { year: 2023, totalAssets: 105_000_000, totalLiabilities: 9_500_000, netWorth: 95_500_000, properties: 24, vehicles: 8, income: 16_500_000, source: "JNE-DJHV-2023" },
      { year: 2024, totalAssets: 112_000_000, totalLiabilities: 9_000_000, netWorth: 103_000_000, properties: 25, vehicles: 8, income: 18_000_000, source: "JNE-DJHV-2024" },
      { year: 2025, totalAssets: 120_000_000, totalLiabilities: 8_500_000, netWorth: 111_500_000, properties: 26, vehicles: 9, income: 19_500_000, source: "JNE-DJHV-2025" },
    ],
    legalHistory: [
      { caseId: "EXP-2016-02145", type: "electoral", status: "sentenciado", year: 2016, description: "Exclusión de proceso electoral 2016 por entrega de dinero a electores", court: "JNE", severity: "alto" },
      { caseId: "EXP-2017-04512", type: "penal", status: "archivado", year: 2017, description: "Investigación por presunto plagio de tesis doctoral", court: "Fiscalía Anticorrupción", severity: "medio" },
      { caseId: "EXP-2021-08923", type: "administrativo", status: "activo", year: 2021, description: "Investigación por conflicto de intereses como gobernador y propietario de universidades", court: "Contraloría General", severity: "medio" },
    ],
    network: [
      { id: "n1", name: "Universidad César Vallejo", type: "empresarial", relationship: "Fundador y propietario", entity: "Consorcio educativo", riskLevel: "medio" },
      { id: "n2", name: "Alianza para el Progreso", type: "politico", relationship: "Fundador y líder del partido", entity: "Partido político", riskLevel: "neutral" },
      { id: "n3", name: "Consorcio UCV-UPN-SISE", type: "empresarial", relationship: "Propietario del grupo educativo", entity: "Educación superior", riskLevel: "medio" },
      { id: "n4", name: "Red de gobernadores regionales APP", type: "politico", relationship: "Líder de la red partidaria regional", entity: "Gobiernos regionales", riskLevel: "medio" },
      { id: "n5", name: "Gobierno Regional La Libertad", type: "politico", relationship: "Exgobernador regional", entity: "Gobierno regional", riskLevel: "bajo" },
    ],
    finance: {
      totalDeclared: 5_500_000,
      topDonors: [
        { name: "Aportes propios", amount: 2_500_000, type: "Candidato", flagged: true },
        { name: "Consorcio educativo UCV", amount: 1_200_000, type: "Persona jurídica", flagged: true },
        { name: "Donantes individuales (95)", amount: 800_000, type: "Personas naturales", flagged: false },
        { name: "Aportes partidarios APP", amount: 600_000, type: "Partido", flagged: false },
        { name: "Eventos de recaudación", amount: 400_000, type: "Eventos", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 2_500_000,
      digitalSpend: 800_000,
      suspiciousFlags: [
        "Aporte personal y de empresa propia superan el 67% del financiamiento total",
        "Precedente de exclusión electoral por compra de votos en 2016",
      ],
    },
    positionChanges: [
      { topic: "Educación universitaria", year: 2016, position: "Las universidades privadas son el motor de la educación", evidence: "Foro empresarial 2016" },
      { topic: "Educación universitaria", year: 2025, position: "Hay que mejorar la calidad con SUNEDU fortalecida", evidence: "Plan de gobierno 2025" },
      { topic: "Entrega de dádivas", year: 2016, position: "Es una costumbre popular, no es compra de votos", evidence: "Declaraciones 2016" },
      { topic: "Entrega de dádivas", year: 2025, position: "Reconozco que fue un error y no se repetirá", evidence: "Entrevista Canal N 2025" },
    ],
    conflictsOfInterest: [
      "Propietario de un consorcio universitario que se beneficiaría de políticas educativas que él mismo podría aprobar",
      "Precedente de exclusión electoral por compra de votos genera dudas sobre prácticas de campaña",
      "Inversiones inmobiliarias en zonas donde como gobernador aprobó proyectos de infraestructura",
    ],
    educationVerified: false,
    militaryService: false,
    yearsInPolitics: 18,
    previousCandidacies: 2,
    partySwitches: 0,
  },

  "7": {
    // Hernando de Soto
    candidateId: "7",
    riskScore: 20,
    patrimonio: [
      { year: 2022, totalAssets: 8_500_000, totalLiabilities: 800_000, netWorth: 7_700_000, properties: 3, vehicles: 2, income: 2_200_000, source: "JNE-DJHV-2022" },
      { year: 2023, totalAssets: 9_000_000, totalLiabilities: 750_000, netWorth: 8_250_000, properties: 3, vehicles: 2, income: 2_400_000, source: "JNE-DJHV-2023" },
      { year: 2024, totalAssets: 9_500_000, totalLiabilities: 700_000, netWorth: 8_800_000, properties: 3, vehicles: 2, income: 2_500_000, source: "JNE-DJHV-2024" },
      { year: 2025, totalAssets: 10_200_000, totalLiabilities: 650_000, netWorth: 9_550_000, properties: 4, vehicles: 2, income: 2_800_000, source: "JNE-DJHV-2025" },
    ],
    legalHistory: [],
    network: [
      { id: "n1", name: "Instituto Libertad y Democracia (ILD)", type: "empresarial", relationship: "Fundador y presidente", entity: "Think tank", riskLevel: "neutral" },
      { id: "n2", name: "Foros económicos internacionales", type: "politico", relationship: "Asesor de gobiernos y organismos", entity: "Organismos internacionales", riskLevel: "neutral" },
      { id: "n3", name: "Sector empresarial liberal", type: "empresarial", relationship: "Referente intelectual", entity: "Sector privado", riskLevel: "neutral" },
    ],
    finance: {
      totalDeclared: 3_000_000,
      topDonors: [
        { name: "Aportes propios", amount: 1_200_000, type: "Candidato", flagged: false },
        { name: "Donantes individuales (156)", amount: 800_000, type: "Personas naturales", flagged: false },
        { name: "Sector empresarial", amount: 600_000, type: "Personas jurídicas", flagged: false },
        { name: "Eventos y conferencias", amount: 400_000, type: "Eventos", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 1_200_000,
      digitalSpend: 500_000,
      suspiciousFlags: [],
    },
    positionChanges: [
      { topic: "Rol político", year: 2021, position: "No soy político, soy un técnico que quiere ayudar al Perú", evidence: "Lanzamiento de campaña 2021" },
      { topic: "Rol político", year: 2025, position: "La política necesita outsiders con experiencia internacional", evidence: "Entrevista Gestión 2025" },
    ],
    conflictsOfInterest: [],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 5,
    previousCandidacies: 1,
    partySwitches: 0,
  },

  "8": {
    // Daniel Urresti
    candidateId: "8",
    riskScore: 52,
    patrimonio: [
      { year: 2022, totalAssets: 2_800_000, totalLiabilities: 350_000, netWorth: 2_450_000, properties: 2, vehicles: 2, income: 480_000, source: "JNE-DJHV-2022" },
      { year: 2023, totalAssets: 3_100_000, totalLiabilities: 300_000, netWorth: 2_800_000, properties: 2, vehicles: 2, income: 520_000, source: "JNE-DJHV-2023" },
      { year: 2024, totalAssets: 3_400_000, totalLiabilities: 280_000, netWorth: 3_120_000, properties: 3, vehicles: 3, income: 560_000, source: "JNE-DJHV-2024" },
      { year: 2025, totalAssets: 3_700_000, totalLiabilities: 250_000, netWorth: 3_450_000, properties: 3, vehicles: 3, income: 600_000, source: "JNE-DJHV-2025" },
    ],
    legalHistory: [
      { caseId: "EXP-2015-00892", type: "penal", status: "apelación", year: 2015, description: "Juicio por el asesinato del periodista Hugo Bustíos en 1988 durante operación militar en Ayacucho", court: "Sala Penal Nacional", severity: "alto" },
      { caseId: "EXP-2020-06341", type: "administrativo", status: "archivado", year: 2020, description: "Investigación por uso de recursos del Estado en actividades políticas durante gestión como congresista", court: "Comisión de Ética del Congreso", severity: "medio" },
    ],
    network: [
      { id: "n1", name: "Podemos Perú", type: "politico", relationship: "Candidato presidencial y excongresista", entity: "Partido político", riskLevel: "neutral" },
      { id: "n2", name: "Ejército del Perú", type: "politico", relationship: "General retirado", entity: "Fuerzas Armadas", riskLevel: "medio" },
      { id: "n3", name: "Sector seguridad y defensa", type: "politico", relationship: "Exministro del Interior", entity: "Gobierno central", riskLevel: "medio" },
      { id: "n4", name: "José Luna Gálvez", type: "politico", relationship: "Aliado político — fundador de Podemos Perú", entity: "Partido político", riskLevel: "medio" },
    ],
    finance: {
      totalDeclared: 2_800_000,
      topDonors: [
        { name: "Aportes partidarios Podemos Perú", amount: 1_100_000, type: "Partido", flagged: false },
        { name: "Aportes propios", amount: 600_000, type: "Candidato", flagged: false },
        { name: "Donantes individuales (112)", amount: 550_000, type: "Personas naturales", flagged: false },
        { name: "Eventos de recaudación", amount: 350_000, type: "Eventos", flagged: false },
        { name: "Sector empresarial", amount: 200_000, type: "Personas jurídicas", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 1_100_000,
      digitalSpend: 400_000,
      suspiciousFlags: [
        "Vínculo con José Luna Gálvez, investigado por organización criminal y lavado de activos",
      ],
    },
    positionChanges: [
      { topic: "Caso Bustíos", year: 2015, position: "Soy inocente, fue una operación militar legítima", evidence: "Declaraciones judiciales 2015" },
      { topic: "Caso Bustíos", year: 2024, position: "El Poder Judicial decidirá, confío en mi inocencia", evidence: "Entrevista América TV 2024" },
      { topic: "Mano dura", year: 2014, position: "Como ministro, el delincuente que cae no se levanta", evidence: "Declaraciones como Ministro del Interior 2014" },
      { topic: "Mano dura", year: 2025, position: "Seguridad con inteligencia y tecnología, no solo fuerza", evidence: "Plan de gobierno 2025" },
    ],
    conflictsOfInterest: [
      "Juicio pendiente por asesinato de periodista Hugo Bustíos — riesgo de condena durante eventual gobierno",
      "Alianza con José Luna Gálvez, fundador de Podemos Perú, investigado por organización criminal",
      "Historial militar con denuncias de violaciones de derechos humanos durante conflicto interno",
    ],
    educationVerified: true,
    militaryService: true,
    yearsInPolitics: 12,
    previousCandidacies: 1,
    partySwitches: 1,
  },

  // ============================================================
  // 🇨🇴 COLOMBIA — DATOS SIMULADOS para demostración
  // Fuentes simuladas: Fiscalía General de la Nación, Procuraduría,
  // Contraloría, CNE, RNEC
  // ============================================================

  "co-paloma-valencia": {
    candidateId: "co-paloma-valencia",
    riskScore: 25,
    patrimonio: [
      { year: 2022, totalAssets: 2_100_000_000, totalLiabilities: 350_000_000, netWorth: 1_750_000_000, properties: 3, vehicles: 2, income: 320_000_000, source: "SIMULADO-CNE-RNEC-2022" },
      { year: 2023, totalAssets: 2_400_000_000, totalLiabilities: 300_000_000, netWorth: 2_100_000_000, properties: 3, vehicles: 2, income: 350_000_000, source: "SIMULADO-CNE-RNEC-2023" },
      { year: 2024, totalAssets: 2_800_000_000, totalLiabilities: 260_000_000, netWorth: 2_540_000_000, properties: 4, vehicles: 3, income: 380_000_000, source: "SIMULADO-CNE-RNEC-2024" },
      { year: 2025, totalAssets: 3_200_000_000, totalLiabilities: 230_000_000, netWorth: 2_970_000_000, properties: 4, vehicles: 3, income: 410_000_000, source: "SIMULADO-CNE-RNEC-2025" },
    ],
    legalHistory: [
      { caseId: "PROCUR-2020-QD-0198", type: "administrativo", status: "archivado", year: 2020, description: "Queja disciplinaria por declaraciones polémicas en debate legislativo — archivada por libertad de expresión parlamentaria", court: "Procuraduría General de la Nación", severity: "bajo" },
    ],
    network: [
      { id: "co-n1", name: "Centro Democrático", type: "politico", relationship: "Senadora y figura visible del partido", entity: "Partido político", riskLevel: "neutral" },
      { id: "co-n2", name: "Álvaro Uribe Vélez", type: "politico", relationship: "Mentor político y líder del partido", entity: "Centro Democrático", riskLevel: "medio" },
      { id: "co-n3", name: "Sector empresarial Valle del Cauca", type: "empresarial", relationship: "Vínculos familiares y redes empresariales regionales", entity: "Gremios empresariales", riskLevel: "bajo" },
      { id: "co-n4", name: "Gremios nacionales (ANDI, Fenalco, SAC)", type: "empresarial", relationship: "Aliada legislativa del sector productivo", entity: "Gremios", riskLevel: "neutral" },
      { id: "co-n5", name: "Bancada Centro Democrático Senado", type: "politico", relationship: "Vocera frecuente de la bancada", entity: "Congreso de la República", riskLevel: "neutral" },
    ],
    finance: {
      totalDeclared: 3_200_000_000,
      topDonors: [
        { name: "Fondo Centro Democrático", amount: 1_400_000_000, type: "Partido", flagged: false },
        { name: "Sector empresarial y gremios", amount: 800_000_000, type: "Personas jurídicas", flagged: false },
        { name: "Donantes individuales (560)", amount: 550_000_000, type: "Personas naturales", flagged: false },
        { name: "Eventos de recaudación", amount: 300_000_000, type: "Eventos", flagged: false },
        { name: "Aportes propios", amount: 150_000_000, type: "Candidato", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 1_400_000_000,
      digitalSpend: 650_000_000,
      suspiciousFlags: [],
    },
    positionChanges: [
      { topic: "Proceso de paz", year: 2016, position: "Rechazo total al acuerdo con las FARC — promovió el No en el plebiscito", evidence: "Campaña del No, Plebiscito 2016" },
      { topic: "Proceso de paz", year: 2025, position: "Revisión del acuerdo con énfasis en seguridad y justicia transicional estricta", evidence: "Programa de gobierno 2026" },
      { topic: "Política social", year: 2018, position: "Estado mínimo — reducción del gasto público", evidence: "Debates Senado 2018" },
      { topic: "Política social", year: 2025, position: "Estado eficiente con protección social focalizada y subsidiariedad", evidence: "Propuesta presidencial 2026" },
    ],
    conflictsOfInterest: [
      "Cercanía con Álvaro Uribe, quien tiene procesos judiciales propios, podría generar pasivos políticos",
      "Vínculos familiares con sector empresarial del Valle del Cauca podrían generar conflictos en política agraria y comercial",
    ],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 12,
    previousCandidacies: 0,
    partySwitches: 0,
  },

  "co-vicky-davila": {
    candidateId: "co-vicky-davila",
    riskScore: 28,
    patrimonio: [
      { year: 2022, totalAssets: 2_800_000_000, totalLiabilities: 400_000_000, netWorth: 2_400_000_000, properties: 3, vehicles: 2, income: 850_000_000, source: "SIMULADO-CNE-RNEC-2022" },
      { year: 2023, totalAssets: 3_200_000_000, totalLiabilities: 350_000_000, netWorth: 2_850_000_000, properties: 3, vehicles: 2, income: 920_000_000, source: "SIMULADO-CNE-RNEC-2023" },
      { year: 2024, totalAssets: 3_600_000_000, totalLiabilities: 300_000_000, netWorth: 3_300_000_000, properties: 4, vehicles: 3, income: 980_000_000, source: "SIMULADO-CNE-RNEC-2024" },
      { year: 2025, totalAssets: 4_000_000_000, totalLiabilities: 280_000_000, netWorth: 3_720_000_000, properties: 4, vehicles: 3, income: 1_050_000_000, source: "SIMULADO-CNE-RNEC-2025" },
    ],
    legalHistory: [
      { caseId: "PROCUR-2019-QD-0742", type: "administrativo", status: "archivado", year: 2019, description: "Queja por presunta violación de reserva informativa en publicación periodística — archivada por libertad de prensa", court: "Procuraduría General de la Nación", severity: "bajo" },
    ],
    network: [
      { id: "co-n1", name: "Movimiento Valientes", type: "politico", relationship: "Fundadora y candidata presidencial", entity: "Movimiento político propio", riskLevel: "neutral" },
      { id: "co-n2", name: "Revista Semana", type: "mediatico", relationship: "Exdirectora — perfil periodístico de alto impacto", entity: "Medios de comunicación", riskLevel: "bajo" },
      { id: "co-n3", name: "Sector empresarial colombiano", type: "empresarial", relationship: "Contactos extensos por carrera periodística", entity: "Gremios y empresarios", riskLevel: "bajo" },
      { id: "co-n4", name: "Redes anticorrupción ciudadanas", type: "politico", relationship: "Figura mediática que denuncia corrupción", entity: "Sociedad civil", riskLevel: "neutral" },
    ],
    finance: {
      totalDeclared: 3_000_000_000,
      topDonors: [
        { name: "Aportes propios", amount: 1_000_000_000, type: "Candidato", flagged: false },
        { name: "Donantes individuales (1,850)", amount: 850_000_000, type: "Personas naturales", flagged: false },
        { name: "Crowdfunding y eventos", amount: 600_000_000, type: "Eventos", flagged: false },
        { name: "Sector empresarial", amount: 350_000_000, type: "Personas jurídicas", flagged: false },
        { name: "Fondo Movimiento Valientes", amount: 200_000_000, type: "Partido", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 1_300_000_000,
      digitalSpend: 900_000_000,
      suspiciousFlags: [],
    },
    positionChanges: [
      { topic: "Rol profesional", year: 2020, position: "Soy periodista, mi trinchera es el periodismo no la política", evidence: "Entrevista W Radio 2020" },
      { topic: "Rol profesional", year: 2025, position: "Colombia necesita gente que diga la verdad — por eso salto a la política", evidence: "Lanzamiento Movimiento Valientes 2025" },
      { topic: "Gobierno Petro", year: 2022, position: "Cubrimiento periodístico crítico pero imparcial", evidence: "Editorial Semana 2022" },
      { topic: "Gobierno Petro", year: 2025, position: "Este gobierno destruyó a Colombia — hay que rescatar el país", evidence: "Programa de gobierno 2026" },
    ],
    conflictsOfInterest: [
      "Transición directa de periodista de alto perfil a candidata — posibles conflictos con fuentes y contactos previos",
      "Red de contactos empresariales desarrollada como directora de Semana podría generar compromisos",
    ],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 2,
    previousCandidacies: 0,
    partySwitches: 0,
  },

  "co-daniel-quintero": {
    candidateId: "co-daniel-quintero",
    riskScore: 48,
    patrimonio: [
      { year: 2022, totalAssets: 1_400_000_000, totalLiabilities: 250_000_000, netWorth: 1_150_000_000, properties: 2, vehicles: 1, income: 220_000_000, source: "SIMULADO-CNE-RNEC-2022" },
      { year: 2023, totalAssets: 1_600_000_000, totalLiabilities: 220_000_000, netWorth: 1_380_000_000, properties: 2, vehicles: 1, income: 250_000_000, source: "SIMULADO-CNE-RNEC-2023" },
      { year: 2024, totalAssets: 1_850_000_000, totalLiabilities: 200_000_000, netWorth: 1_650_000_000, properties: 2, vehicles: 2, income: 280_000_000, source: "SIMULADO-CNE-RNEC-2024" },
      { year: 2025, totalAssets: 2_100_000_000, totalLiabilities: 180_000_000, netWorth: 1_920_000_000, properties: 3, vehicles: 2, income: 310_000_000, source: "SIMULADO-CNE-RNEC-2025" },
    ],
    legalHistory: [
      { caseId: "PROCUR-2022-SUS-0341", type: "administrativo", status: "sentenciado", year: 2022, description: "Suspensión como alcalde de Medellín por participación en política — sanción de 3 meses", court: "Procuraduría General de la Nación", severity: "alto" },
      { caseId: "CONTRALORIA-2023-AUD-1204", type: "administrativo", status: "investigación", year: 2023, description: "Auditoría a contratos de tecnología e innovación durante alcaldía de Medellín", court: "Contraloría General de la República", severity: "medio" },
      { caseId: "CNE-2022-PART-0089", type: "electoral", status: "activo", year: 2022, description: "Investigación por presunta participación indebida en política durante ejercicio como alcalde", court: "Consejo Nacional Electoral", severity: "medio" },
    ],
    network: [
      { id: "co-n1", name: "AICO (Movimiento)", type: "politico", relationship: "Candidato presidencial por el movimiento", entity: "Movimiento político", riskLevel: "neutral" },
      { id: "co-n2", name: "Gustavo Petro", type: "politico", relationship: "Aliado cercano — relación petrismo", entity: "Presidencia", riskLevel: "medio" },
      { id: "co-n3", name: "Ecosistema tech Medellín", type: "empresarial", relationship: "Promotor de Medellín como ciudad digital", entity: "Sector tecnológico", riskLevel: "neutral" },
      { id: "co-n4", name: "Redes de nuevos liderazgos", type: "politico", relationship: "Referente de política joven y disruptiva", entity: "Sociedad civil", riskLevel: "neutral" },
      { id: "co-n5", name: "Contratistas Alcaldía Medellín", type: "financiero", relationship: "Contratos de tecnología e innovación bajo investigación", entity: "Sector privado", riskLevel: "alto" },
    ],
    finance: {
      totalDeclared: 2_800_000_000,
      topDonors: [
        { name: "Crowdfunding digital", amount: 900_000_000, type: "Personas naturales", flagged: false },
        { name: "Donantes individuales (2,300)", amount: 750_000_000, type: "Personas naturales", flagged: false },
        { name: "Aportes propios", amount: 400_000_000, type: "Candidato", flagged: false },
        { name: "Eventos y recaudación", amount: 450_000_000, type: "Eventos", flagged: false },
        { name: "Sector tech y startups", amount: 300_000_000, type: "Personas jurídicas", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 800_000_000,
      digitalSpend: 1_200_000_000,
      suspiciousFlags: [
        "Suspensión previa como alcalde por participación indebida en política",
        "Contratos de tecnología bajo auditoría de la Contraloría",
      ],
    },
    positionChanges: [
      { topic: "Relación con Petro", year: 2022, position: "Soy un aliado del cambio — apoyo al presidente Petro", evidence: "Declaraciones públicas como alcalde 2022" },
      { topic: "Relación con Petro", year: 2025, position: "Soy independiente — represento una nueva generación, no el petrismo", evidence: "Lanzamiento de campaña 2025" },
      { topic: "Gestión Medellín", year: 2020, position: "Medellín será la capital de la cuarta revolución industrial", evidence: "Plan de Desarrollo Municipal 2020-2023" },
      { topic: "Gestión Medellín", year: 2023, position: "Logramos avances pero la suspensión frenó los proyectos", evidence: "Balance de gestión 2023" },
    ],
    conflictsOfInterest: [
      "Sanción disciplinaria por participación en política siendo alcalde — precedente de infracción institucional",
      "Contratos de innovación tecnológica en Medellín bajo auditoría fiscal",
      "Cercanía con el petrismo genera dudas sobre independencia real como candidato",
    ],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 8,
    previousCandidacies: 0,
    partySwitches: 1,
  },

  "co-roy-barreras": {
    candidateId: "co-roy-barreras",
    riskScore: 38,
    patrimonio: [
      { year: 2022, totalAssets: 3_500_000_000, totalLiabilities: 500_000_000, netWorth: 3_000_000_000, properties: 4, vehicles: 3, income: 450_000_000, source: "SIMULADO-CNE-RNEC-2022" },
      { year: 2023, totalAssets: 3_800_000_000, totalLiabilities: 450_000_000, netWorth: 3_350_000_000, properties: 4, vehicles: 3, income: 480_000_000, source: "SIMULADO-CNE-RNEC-2023" },
      { year: 2024, totalAssets: 4_200_000_000, totalLiabilities: 400_000_000, netWorth: 3_800_000_000, properties: 5, vehicles: 3, income: 520_000_000, source: "SIMULADO-CNE-RNEC-2024" },
      { year: 2025, totalAssets: 4_600_000_000, totalLiabilities: 380_000_000, netWorth: 4_220_000_000, properties: 5, vehicles: 4, income: 560_000_000, source: "SIMULADO-CNE-RNEC-2025" },
    ],
    legalHistory: [
      { caseId: "PROCUR-2018-INV-0512", type: "administrativo", status: "archivado", year: 2018, description: "Investigación disciplinaria por presunto tráfico de influencias en nombramientos diplomáticos", court: "Procuraduría General de la Nación", severity: "medio" },
      { caseId: "FISCALIA-2020-INV-2891", type: "penal", status: "archivado", year: 2020, description: "Denuncia por presunto enriquecimiento ilícito — archivada por falta de pruebas", court: "Fiscalía General de la Nación", severity: "medio" },
    ],
    network: [
      { id: "co-n1", name: "La Fuerza de la Paz", type: "politico", relationship: "Fundador y candidato presidencial", entity: "Partido político propio", riskLevel: "neutral" },
      { id: "co-n2", name: "Proceso de paz con FARC", type: "politico", relationship: "Negociador clave del Acuerdo de Paz 2016", entity: "Gobierno Nacional", riskLevel: "neutral" },
      { id: "co-n3", name: "Múltiples partidos (La U, Liberal, Cambio Radical)", type: "politico", relationship: "Militante en distintos momentos de su carrera", entity: "Partidos políticos", riskLevel: "medio" },
      { id: "co-n4", name: "Congreso de la República", type: "politico", relationship: "Expresidente del Senado (2022-2023)", entity: "Poder Legislativo", riskLevel: "neutral" },
      { id: "co-n5", name: "Sector salud privado", type: "empresarial", relationship: "Médico cirujano con clínica propia", entity: "Sector salud", riskLevel: "bajo" },
    ],
    finance: {
      totalDeclared: 3_500_000_000,
      topDonors: [
        { name: "Fondo La Fuerza de la Paz", amount: 1_200_000_000, type: "Partido", flagged: false },
        { name: "Aportes propios", amount: 800_000_000, type: "Candidato", flagged: false },
        { name: "Donantes individuales (420)", amount: 650_000_000, type: "Personas naturales", flagged: false },
        { name: "Sector empresarial", amount: 500_000_000, type: "Personas jurídicas", flagged: false },
        { name: "Eventos de recaudación", amount: 350_000_000, type: "Eventos", flagged: false },
      ],
      publicFunding: 0,
      mediaSpend: 1_500_000_000,
      digitalSpend: 600_000_000,
      suspiciousFlags: [
        "Patrimonio creció significativamente durante años de servicio público — requiere explicación detallada",
      ],
    },
    positionChanges: [
      { topic: "Filiación partidaria", year: 2006, position: "Militante del Partido de la U — aliado del uribismo", evidence: "Registro partidario 2006" },
      { topic: "Filiación partidaria", year: 2014, position: "Ruptura con Uribe — apoyo al proceso de paz de Santos", evidence: "Declaraciones públicas 2014" },
      { topic: "Filiación partidaria", year: 2022, position: "Presidente del Senado con apoyo del Pacto Histórico de Petro", evidence: "Elección como presidente del Senado 2022" },
      { topic: "Filiación partidaria", year: 2025, position: "Independiente con partido propio La Fuerza de la Paz", evidence: "Lanzamiento partido 2025" },
      { topic: "Proceso de paz", year: 2012, position: "La paz es el único camino — negociación sin condiciones", evidence: "Discursos como senador 2012" },
      { topic: "Proceso de paz", year: 2025, position: "Paz con implementación real y rendición de cuentas", evidence: "Programa de gobierno 2026" },
    ],
    conflictsOfInterest: [
      "Ha militado en 4+ partidos diferentes — genera dudas sobre coherencia ideológica y lealtades",
      "Crecimiento patrimonial durante servicio público requiere transparencia adicional",
      "Red de contactos políticos extensa podría generar compromisos cruzados con múltiples sectores",
    ],
    educationVerified: true,
    militaryService: false,
    yearsInPolitics: 22,
    previousCandidacies: 0,
    partySwitches: 4,
  },
};

// Helper to get radiografia by candidate ID
export function getRadiografia(candidateId: string): CandidateRadiografia | null {
  return radiografiaData[candidateId] || null;
}

// Format currency by country
export function formatCurrency(amount: number, countryCode: string = "pe"): string {
  const symbol = countryCode === "co" ? "COP" : "S/";

  if (countryCode === "co") {
    if (amount >= 1_000_000_000) return `${symbol} ${(amount / 1_000_000_000).toFixed(1)}MM`;
    if (amount >= 1_000_000) return `${symbol} ${(amount / 1_000_000).toFixed(0)}M`;
    if (amount >= 1_000) return `${symbol} ${(amount / 1_000).toFixed(0)}K`;
    return `${symbol} ${amount.toLocaleString()}`;
  }
  // Peru (default)
  if (amount >= 1_000_000) return `S/ ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `S/ ${(amount / 1_000).toFixed(0)}K`;
  return `S/ ${amount.toLocaleString()}`;
}

/** @deprecated Use formatCurrency instead */
export const formatSoles = (amount: number) => formatCurrency(amount, "pe");

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
  apelación: { label: "EN APELACIÓN", color: "text-amber" },
  investigación: { label: "EN INVESTIGACIÓN", color: "text-amber" },
};
