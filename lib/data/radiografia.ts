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
