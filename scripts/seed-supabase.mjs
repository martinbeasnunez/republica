#!/usr/bin/env node
/**
 * Seed Supabase with existing hardcoded data from candidates.ts and news.ts
 * Usage: node scripts/seed-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tptxqvamyjhbpdphpouf.supabase.co";
const SERVICE_ROLE_KEY = "sb_secret_uy_jMiH51GMBK_69eTMJGw_iKAx-2pQ";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ============================================================================
// CANDIDATES DATA (from lib/data/candidates.ts)
// ============================================================================
const candidates = [
  {
    id: "1",
    slug: "rafael-lopez-aliaga",
    name: "Rafael Lopez Aliaga",
    short_name: "Lopez Aliaga",
    party: "Renovacion Popular",
    party_slug: "renovacion-popular",
    party_color: "#1e3a8a",
    photo: "/candidates/lopez-aliaga.jpg",
    age: 62,
    profession: "Empresario",
    region: "Lima",
    ideology: "derecha",
    bio: "Empresario y politico peruano. Actual alcalde de Lima Metropolitana. Fundador de Renovacion Popular. Lidera las encuestas para las elecciones 2026.",
    poll_average: 13.3,
    poll_trend: "stable",
    has_legal_issues: false,
    legal_note: null,
    key_proposals: [
      { category: "seguridad", title: "Mano dura contra la delincuencia", summary: "Pena de muerte para violadores y sicarios. Aumento del presupuesto policial." },
      { category: "economia", title: "Reduccion de impuestos", summary: "Reduccion del IGV y simplificacion tributaria para impulsar la economia." },
      { category: "infraestructura", title: "Tren de cercanias", summary: "Expansion del sistema de transporte masivo en Lima y principales ciudades." },
    ],
    social_media: { twitter: "@rabordealiaga", facebook: "RafaelLopezAliagaOficial" },
    quiz_positions: { "pena-muerte": 2, "estado-empresario": -2, "inversion-extranjera": 2, "mineria": 2, "aborto": -2, "matrimonio-igualitario": -2, "descentralizacion": 1, "educacion-publica": 0, "salud-universal": 0, "corrupcion": 1 },
    sort_order: 1,
    is_active: true,
  },
  {
    id: "2",
    slug: "keiko-fujimori",
    name: "Keiko Fujimori",
    short_name: "K. Fujimori",
    party: "Fuerza Popular",
    party_slug: "fuerza-popular",
    party_color: "#ff6600",
    photo: "/candidates/keiko-fujimori.jpg",
    age: 51,
    profession: "Politica",
    region: "Lima",
    ideology: "derecha",
    bio: "Politica peruana e hija del expresidente Alberto Fujimori. Cuarta postulacion a la presidencia. Segunda en las encuestas.",
    poll_average: 7.3,
    poll_trend: "stable",
    has_legal_issues: true,
    legal_note: "Proceso penal por lavado de activos en curso (caso Odebrecht).",
    key_proposals: [
      { category: "seguridad", title: "Plan integral de seguridad", summary: "Fuerzas Armadas controlando carceles y fronteras. Rastrillajes conjuntos con la Policia." },
      { category: "economia", title: "Economia social de mercado", summary: "Estabilidad macroeconomica con programas sociales focalizados." },
      { category: "anticorrupcion", title: "Reforma del sistema judicial", summary: "Modernizacion del poder judicial y fiscalia." },
    ],
    social_media: { twitter: "@KeikoFujimori", facebook: "KeikoFujimori", instagram: "keiko.fujimori" },
    quiz_positions: { "pena-muerte": 1, "estado-empresario": -1, "inversion-extranjera": 2, "mineria": 2, "aborto": -2, "matrimonio-igualitario": -2, "descentralizacion": 0, "educacion-publica": 1, "salud-universal": 1, "corrupcion": 1 },
    sort_order: 2,
    is_active: true,
  },
  {
    id: "3",
    slug: "cesar-acuna",
    name: "Cesar Acuna Peralta",
    short_name: "C. Acuna",
    party: "Alianza para el Progreso",
    party_slug: "alianza-para-el-progreso",
    party_color: "#dc2626",
    photo: "/candidates/cesar-acuna.jpg",
    age: 73,
    profession: "Empresario / Educador",
    region: "La Libertad",
    ideology: "centro-derecha",
    bio: "Empresario educativo y politico. Fundador de la Universidad Cesar Vallejo y Alianza para el Progreso. Exgobernador de La Libertad y exalcalde de Trujillo.",
    poll_average: 4.0,
    poll_trend: "stable",
    has_legal_issues: true,
    legal_note: "Investigaciones anteriores por plagio academico. Excluido de la eleccion 2016 por entrega de dinero.",
    key_proposals: [
      { category: "educacion", title: "Educacion y empleo", summary: "Ampliacion del acceso a educacion superior y programas de capacitacion laboral." },
      { category: "infraestructura", title: "Obras para el desarrollo", summary: "Infraestructura vial y de servicios basicos en regiones." },
      { category: "economia", title: "Apoyo a emprendedores", summary: "Creditos blandos y simplificacion de tramites para pequenos empresarios." },
    ],
    social_media: { facebook: "CesarAcunaPeralta" },
    quiz_positions: { "pena-muerte": 0, "estado-empresario": 1, "inversion-extranjera": 1, "mineria": 1, "aborto": -1, "matrimonio-igualitario": -1, "descentralizacion": 2, "educacion-publica": 2, "salud-universal": 1, "corrupcion": 0 },
    sort_order: 3,
    is_active: true,
  },
  {
    id: "4",
    slug: "mario-vizcarra",
    name: "Mario Vizcarra Larios",
    short_name: "M. Vizcarra",
    party: "Peru Primero",
    party_slug: "peru-primero",
    party_color: "#f59e0b",
    photo: "/candidates/mario-vizcarra.jpg",
    age: 55,
    profession: "Politico",
    region: "Lima",
    ideology: "centro",
    bio: "Politico y candidato presidencial por Peru Primero. Figura emergente en las encuestas 2026, empatado en el tercer lugar.",
    poll_average: 4.4,
    poll_trend: "up",
    has_legal_issues: false,
    legal_note: null,
    key_proposals: [
      { category: "economia", title: "Reactivacion economica", summary: "Plan de reactivacion economica con enfoque en empleo formal y productividad." },
      { category: "seguridad", title: "Seguridad integral", summary: "Enfoque integral de seguridad ciudadana con prevencion y tecnologia." },
      { category: "salud", title: "Reforma de salud", summary: "Fortalecimiento del sistema de salud publica y ampliacion de cobertura efectiva." },
    ],
    social_media: {},
    quiz_positions: { "pena-muerte": 0, "estado-empresario": 0, "inversion-extranjera": 1, "mineria": 0, "aborto": 0, "matrimonio-igualitario": 0, "descentralizacion": 1, "educacion-publica": 1, "salud-universal": 1, "corrupcion": 1 },
    sort_order: 4,
    is_active: true,
  },
  {
    id: "5",
    slug: "carlos-alvarez",
    name: "Carlos Alvarez",
    short_name: "C. Alvarez",
    party: "Pais para Todos",
    party_slug: "pais-para-todos",
    party_color: "#0369a1",
    photo: "/candidates/carlos-alvarez.jpg",
    age: 54,
    profession: "Comediante / Comunicador",
    region: "Lima",
    ideology: "centro",
    bio: "Comediante, imitador politico y comunicador peruano. Se retiro de la comedia en enero 2026 para enfocarse en su candidatura presidencial. Candidato outsider con fuerte presencia mediatica.",
    poll_average: 3.8,
    poll_trend: "stable",
    has_legal_issues: false,
    legal_note: null,
    key_proposals: [
      { category: "anticorrupcion", title: "Lucha frontal contra la corrupcion", summary: "Muerte civil para funcionarios corruptos y transparencia total del gasto publico." },
      { category: "educacion", title: "Educacion de calidad", summary: "Aumento del presupuesto educativo al 6% del PBI." },
      { category: "salud", title: "Salud para todos", summary: "Ampliacion de cobertura del SIS y construccion de hospitales." },
    ],
    social_media: { twitter: "@carlosalvarezpe", facebook: "CarlosAlvarezComediante", tiktok: "@carlosalvarez" },
    quiz_positions: { "pena-muerte": 0, "estado-empresario": 0, "inversion-extranjera": 1, "mineria": 0, "aborto": 0, "matrimonio-igualitario": 0, "descentralizacion": 2, "educacion-publica": 2, "salud-universal": 2, "corrupcion": 2 },
    sort_order: 5,
    is_active: true,
  },
  {
    id: "6",
    slug: "alfonso-lopez-chau",
    name: "Alfonso Lopez-Chau",
    short_name: "Lopez-Chau",
    party: "Ahora Nacion",
    party_slug: "ahora-nacion",
    party_color: "#059669",
    photo: "/candidates/alfonso-lopez-chau.jpg",
    age: 58,
    profession: "Economista / Academico",
    region: "Lima",
    ideology: "centro-izquierda",
    bio: "Economista y academico peruano. Candidato por Ahora Nacion. Figura emergente con enfoque en politicas sociales y desarrollo economico inclusivo.",
    poll_average: 3.9,
    poll_trend: "up",
    has_legal_issues: false,
    legal_note: null,
    key_proposals: [
      { category: "economia", title: "Economia inclusiva", summary: "Politicas de formalizacion laboral y apoyo a la pequena empresa." },
      { category: "educacion", title: "Inversion en educacion", summary: "Aumento sostenido del presupuesto educativo con enfoque en calidad docente." },
      { category: "salud", title: "Salud universal efectiva", summary: "Reforma del sistema de salud para que la cobertura sea real, no solo en papel." },
    ],
    social_media: {},
    quiz_positions: { "pena-muerte": -1, "estado-empresario": 1, "inversion-extranjera": 0, "mineria": -1, "aborto": 0, "matrimonio-igualitario": 1, "descentralizacion": 2, "educacion-publica": 2, "salud-universal": 2, "corrupcion": 1 },
    sort_order: 6,
    is_active: true,
  },
  {
    id: "7",
    slug: "george-forsyth",
    name: "George Forsyth",
    short_name: "Forsyth",
    party: "Somos Peru",
    party_slug: "somos-peru",
    party_color: "#ea580c",
    photo: "/candidates/george-forsyth.jpg",
    age: 44,
    profession: "Exfutbolista / Politico",
    region: "Lima",
    ideology: "centro-derecha",
    bio: "Exarquero profesional y exalcalde de La Victoria. Figura politica joven y mediatica. Candidato por Somos Peru.",
    poll_average: 2.0,
    poll_trend: "down",
    has_legal_issues: false,
    legal_note: null,
    key_proposals: [
      { category: "seguridad", title: "Seguridad ciudadana tecnologica", summary: "Sistema integrado de videovigilancia y patrullaje inteligente." },
      { category: "economia", title: "Peru digital", summary: "Digitalizacion del estado y fomento del emprendimiento tecnologico." },
      { category: "infraestructura", title: "Ciudades modernas", summary: "Regeneracion urbana y vivienda social en principales ciudades." },
    ],
    social_media: { twitter: "@George_Forsyth", facebook: "GeorgeForsythSommer", instagram: "georgeforsyth" },
    quiz_positions: { "pena-muerte": 0, "estado-empresario": -1, "inversion-extranjera": 2, "mineria": 1, "aborto": -1, "matrimonio-igualitario": 0, "descentralizacion": 1, "educacion-publica": 1, "salud-universal": 1, "corrupcion": 2 },
    sort_order: 7,
    is_active: true,
  },
  {
    id: "8",
    slug: "jose-luna-galvez",
    name: "Jose Luna Galvez",
    short_name: "Luna",
    party: "Podemos Peru",
    party_slug: "podemos-peru",
    party_color: "#7c3aed",
    photo: "/candidates/jose-luna.jpg",
    age: 67,
    profession: "Empresario / Educador",
    region: "Lima",
    ideology: "centro-derecha",
    bio: "Empresario educativo, fundador de la Universidad Telesup. Fundador de Podemos Peru. Candidato presidencial.",
    poll_average: 2.0,
    poll_trend: "stable",
    has_legal_issues: true,
    legal_note: "Investigado por presunto financiamiento ilicito de campanas.",
    key_proposals: [
      { category: "educacion", title: "Universidad para todos", summary: "Becas integrales y ampliacion del acceso a educacion superior." },
      { category: "economia", title: "Empleo joven", summary: "Programa nacional de primer empleo y capacitacion laboral." },
      { category: "tecnologia", title: "Peru conectado", summary: "Internet gratuito en zonas rurales y digitalizacion de servicios." },
    ],
    social_media: { facebook: "JoseLunaGalvezOficial" },
    quiz_positions: { "pena-muerte": 0, "estado-empresario": 1, "inversion-extranjera": 1, "mineria": 1, "aborto": -1, "matrimonio-igualitario": -1, "descentralizacion": 0, "educacion-publica": 2, "salud-universal": 1, "corrupcion": 0 },
    sort_order: 8,
    is_active: true,
  },
];

// Poll history data
const pollDataPoints = [
  { candidate_id: "1", date: "2026-02", value: 12.0, pollster: "Ipsos" },
  { candidate_id: "1", date: "2026-02", value: 14.6, pollster: "CPI" },
  { candidate_id: "2", date: "2026-02", value: 8.0, pollster: "Ipsos" },
  { candidate_id: "2", date: "2026-02", value: 6.6, pollster: "CPI" },
  { candidate_id: "3", date: "2026-02", value: 4.0, pollster: "Ipsos" },
  { candidate_id: "3", date: "2026-02", value: 3.9, pollster: "CPI" },
  { candidate_id: "4", date: "2026-02", value: 4.0, pollster: "Ipsos" },
  { candidate_id: "4", date: "2026-02", value: 4.7, pollster: "CPI" },
  { candidate_id: "5", date: "2026-02", value: 4.0, pollster: "Ipsos" },
  { candidate_id: "5", date: "2026-02", value: 3.6, pollster: "CPI" },
  { candidate_id: "6", date: "2026-02", value: 4.0, pollster: "Ipsos" },
  { candidate_id: "6", date: "2026-02", value: 3.7, pollster: "CPI" },
  { candidate_id: "7", date: "2026-02", value: 2.0, pollster: "Ipsos" },
  { candidate_id: "8", date: "2026-02", value: 2.0, pollster: "Ipsos" },
];

// News articles data
const newsArticles = [
  {
    id: "1",
    title: "Congreso destituye a Jose Jeri tras 130 dias como presidente del Peru",
    summary: "El Congreso oficializo la destitucion de Jose Jeri como jefe de Estado tras el escandalo 'Chifagate'. Peru suma su octavo relevo presidencial en casi diez anos de inestabilidad politica.",
    source: "Infobae",
    source_url: "https://www.infobae.com/peru/2026/02/17/jose-jeri-fue-destituido-como-y-cuando-se-elegira-al-nuevo-presidente-de-peru-y-quienes-son-los-principales-candidatos/",
    published_at: "17 Feb 2026",
    category: "Politica",
    fact_check: "verified",
    candidates_mentioned: [],
    is_breaking: true,
    is_active: true,
  },
  {
    id: "2",
    title: "Candidatos presidenciales se pronuncian ante la destitucion de Jeri a dos meses de las elecciones",
    summary: "Los candidatos para las elecciones de abril expresaron sus posturas frente a la destitucion del presidente interino, en un contexto de alta tension politica.",
    source: "Infobae",
    source_url: "https://www.infobae.com/peru/2026/02/17/candidatos-presidenciales-se-pronuncian-ante-la-destitucion-de-jose-jeri-a-dos-meses-de-las-elecciones-2026/",
    published_at: "17 Feb 2026",
    category: "Politica",
    fact_check: "verified",
    candidates_mentioned: [],
    is_active: true,
  },
  {
    id: "3",
    title: "JNE sorteara este viernes 20 las seis fechas para el debate presidencial",
    summary: "El debate contara con 36 candidatos en dos fases y seis fechas entre la ultima semana de marzo e inicios de abril. Cada jornada tendra 12 candidatos en grupos de tres.",
    source: "Andina",
    source_url: "https://andina.pe/agencia/noticia-elecciones-2026-jne-sorteara-este-viernes-20-las-seis-fechas-para-debate-presidencial-1063248.aspx",
    published_at: "17 Feb 2026",
    category: "Politica",
    fact_check: "verified",
    candidates_mentioned: [],
    is_active: true,
  },
  {
    id: "4",
    title: "Debate presidencial 2026 en seis fechas: como se organizara y cuando debatiran los 36 candidatos",
    summary: "El JNE revela el formato del debate: dos fases, seis fechas entre el 23 de marzo y 1 de abril, con intervenciones de 2 a 3 minutos por candidato.",
    source: "El Comercio",
    source_url: "https://elcomercio.pe/politica/elecciones/elecciones-debate-presidencial-2026-en-seis-fechas-como-se-organizara-y-cuando-debatiran-los-36-candidatos-tlcnota-noticia/",
    published_at: "16 Feb 2026",
    category: "Politica",
    candidates_mentioned: [],
    is_active: true,
  },
  {
    id: "5",
    title: "Encuesta Ipsos febrero: cuatro candidatos empatados en el tercer lugar",
    summary: "Lopez Aliaga lidera con 12%, Keiko Fujimori segunda con 8%. Acuna, Vizcarra, Alvarez y Lopez-Chau empatados en tercer lugar con 4% cada uno.",
    source: "Infobae",
    source_url: "https://www.infobae.com/peru/2026/02/12/asi-van-las-encuestas-a-solo-dos-meses-de-las-elecciones-2026-cuatro-candidatos-empatados-en-el-tercer-lugar/",
    published_at: "12 Feb 2026",
    category: "Encuestas",
    fact_check: "verified",
    candidates_mentioned: ["Lopez Aliaga", "K. Fujimori"],
    is_active: true,
  },
  {
    id: "6",
    title: "Lista completa de los 36 candidatos oficiales a la presidencia para las elecciones 2026",
    summary: "La lista oficial confirmada por el JNE incluye a Keiko Fujimori, Lopez Aliaga, Cesar Acuna, George Forsyth, entre los 36 candidatos habilitados para el 12 de abril.",
    source: "La Republica",
    source_url: "https://larepublica.pe/politica/2026/02/12/quienes-son-los-candidatos-presidenciales-elecciones-peru-2026-lista-oficial-confirmada-por-jne-hnews-740868",
    published_at: "12 Feb 2026",
    category: "Politica",
    fact_check: "verified",
    candidates_mentioned: [],
    is_active: true,
  },
  {
    id: "7",
    title: "Lopez Aliaga: las 15 controversiales propuestas para llamar atencion y ganar votos",
    summary: "Analisis de las propuestas del candidato de Renovacion Popular que lidera las encuestas, incluyendo reduccion del Estado, duplicar Pension 65 y fusion de ministerios.",
    source: "La Republica",
    source_url: "https://larepublica.pe/politica/2026/02/08/lopez-aliaga-las-15-controversiales-propuestas-para-llamar-atencion-y-ganar-votos-elecciones-2026-hnews-267416",
    published_at: "8 Feb 2026",
    category: "Seguridad",
    candidates_mentioned: ["Lopez Aliaga"],
    is_active: true,
  },
  {
    id: "8",
    title: "Keiko Fujimori plantea que Fuerzas Armadas controlen carceles y fronteras",
    summary: "La candidata de Fuerza Popular propone que las FF.AA. tomen control de penales y fronteras, ademas de participar en rastrillajes conjuntos con la Policia.",
    source: "Andina",
    source_url: "https://andina.pe/agencia/noticia-elecciones-2026-keiko-fujimori-plantea-fuerzas-armadas-controlen-carceles-y-fronteras-1062965.aspx",
    published_at: "6 Feb 2026",
    category: "Seguridad",
    fact_check: "verified",
    candidates_mentioned: ["K. Fujimori"],
    is_active: true,
  },
];

async function seed() {
  console.log("🌱 Seeding Supabase...\n");

  // 1. Clear existing data (in order due to foreign keys)
  console.log("🗑️  Clearing existing data...");
  await supabase.from("poll_data_points").delete().neq("id", 0);
  await supabase.from("news_articles").delete().neq("id", "");
  await supabase.from("candidates").delete().neq("id", "");
  console.log("   Done.\n");

  // 2. Insert candidates
  console.log("👤 Inserting candidates...");
  const { data: candData, error: candError } = await supabase
    .from("candidates")
    .upsert(candidates, { onConflict: "id" })
    .select("id, name");

  if (candError) {
    console.error("   ❌ Candidates error:", candError);
    return;
  }
  console.log(`   ✅ ${candData.length} candidates inserted`);

  // 3. Insert poll data points
  console.log("📊 Inserting poll data points...");
  const { data: pollData, error: pollError } = await supabase
    .from("poll_data_points")
    .insert(pollDataPoints)
    .select("id");

  if (pollError) {
    console.error("   ❌ Poll data error:", pollError);
    return;
  }
  console.log(`   ✅ ${pollData.length} poll data points inserted`);

  // 4. Insert news articles
  console.log("📰 Inserting news articles...");
  const { data: newsData, error: newsError } = await supabase
    .from("news_articles")
    .upsert(newsArticles, { onConflict: "id" })
    .select("id");

  if (newsError) {
    console.error("   ❌ News error:", newsError);
    return;
  }
  console.log(`   ✅ ${newsData.length} news articles inserted`);

  // 5. Verify
  console.log("\n🔍 Verifying...");
  const { count: cCount } = await supabase.from("candidates").select("*", { count: "exact", head: true });
  const { count: pCount } = await supabase.from("poll_data_points").select("*", { count: "exact", head: true });
  const { count: nCount } = await supabase.from("news_articles").select("*", { count: "exact", head: true });

  console.log(`   Candidates: ${cCount}`);
  console.log(`   Poll data points: ${pCount}`);
  console.log(`   News articles: ${nCount}`);
  console.log("\n✅ Seed complete!");
}

seed().catch(console.error);
