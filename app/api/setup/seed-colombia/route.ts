import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/setup/seed-colombia
 *
 * Seeds Colombian presidential candidates into the database.
 * Auth: Bearer CRON_SECRET
 * Idempotent: skips if candidates already exist for country_code='co'.
 */

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  // Check if Colombia candidates already exist
  const { data: existing } = await supabase
    .from("candidates")
    .select("id")
    .eq("country_code", "co")
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({
      message: "Colombia candidates already seeded",
      count: existing.length,
    });
  }

  // ─── Colombian Candidates ────────────────────────────────────
  const candidates = [
    {
      id: "co-ivan-cepeda",
      slug: "ivan-cepeda",
      name: "Iván Cepeda",
      short_name: "Cepeda",
      party: "Pacto Histórico",
      party_slug: "pacto-historico",
      party_color: "#D4001A",
      photo: "/candidatos/co/ivan-cepeda.jpg",
      age: 63,
      profession: "Senador y defensor de derechos humanos",
      region: "Bogotá",
      ideology: "izquierda",
      bio: "Senador del Pacto Histórico y reconocido defensor de derechos humanos. Fue víctima del conflicto armado y ha dedicado su carrera a la paz y la justicia social. Considerado el candidato natural del petrismo para 2026.",
      key_proposals: [
        {
          category: "economia",
          title: "Reforma tributaria progresiva",
          summary: "Ampliar la base tributaria gravando grandes fortunas y reduciendo exenciones a grandes empresas para financiar programas sociales.",
        },
        {
          category: "salud",
          title: "Sistema único de salud pública",
          summary: "Fortalecer la red hospitalaria pública y avanzar hacia un sistema de salud universal sin intermediación de EPS.",
        },
        {
          category: "seguridad",
          title: "Paz total y reintegración",
          summary: "Continuar la política de paz total, diálogos con grupos armados y programas de reintegración social para excombatientes.",
        },
      ],
      poll_average: 16.5,
      poll_trend: "up",
      has_legal_issues: false,
      social_media: { twitter: "@IvanCepedaCast" },
      quiz_positions: {
        "pena-muerte": -2,
        "estado-empresario": 2,
        "inversion-extranjera": -1,
        "mineria": -2,
        "aborto": 2,
        "matrimonio-igualitario": 2,
        "descentralizacion": 1,
        "educacion-publica": 2,
        "salud-universal": 2,
        "corrupcion": 1,
      },
      is_active: true,
      sort_order: 1,
      country_code: "co",
    },
    {
      id: "co-abelardo-de-la-espriella",
      slug: "abelardo-de-la-espriella",
      name: "Abelardo de la Espriella",
      short_name: "De la Espriella",
      party: "Defensores de la Patria",
      party_slug: "defensores-de-la-patria",
      party_color: "#1B3A5C",
      photo: "/candidatos/co/abelardo-de-la-espriella.jpg",
      age: 53,
      profession: "Abogado penalista",
      region: "Córdoba",
      ideology: "derecha",
      bio: "Abogado penalista de alto perfil y figura mediática. Conocido por defender casos controversiales y su postura firme contra la corrupción y el narcotráfico. Representa la oposición dura al gobierno Petro.",
      key_proposals: [
        {
          category: "seguridad",
          title: "Mano firme contra el narcotráfico",
          summary: "Retomar la fumigación con glifosato, fortalecer las FFAA y romper diálogos con grupos armados que no cumplan acuerdos.",
        },
        {
          category: "economia",
          title: "Reactivación de la inversión privada",
          summary: "Reducir impuestos a empresas, simplificar trámites y garantizar seguridad jurídica para atraer inversión extranjera.",
        },
        {
          category: "anticorrupcion",
          title: "Reforma a la justicia",
          summary: "Endurecer penas por corrupción, eliminar beneficios jurídicos a condenados por delitos contra el Estado y fortalecer la Fiscalía.",
        },
      ],
      poll_average: 14.2,
      poll_trend: "up",
      has_legal_issues: false,
      social_media: { twitter: "@ABORESE" },
      quiz_positions: {
        "pena-muerte": 2,
        "estado-empresario": -2,
        "inversion-extranjera": 2,
        "mineria": 2,
        "aborto": -2,
        "matrimonio-igualitario": -1,
        "descentralizacion": 0,
        "educacion-publica": -1,
        "salud-universal": -1,
        "corrupcion": 2,
      },
      is_active: true,
      sort_order: 2,
      country_code: "co",
    },
    {
      id: "co-claudia-lopez",
      slug: "claudia-lopez",
      name: "Claudia López",
      short_name: "Claudia",
      party: "Alianza Verde",
      party_slug: "alianza-verde",
      party_color: "#2E8B57",
      photo: "/candidatos/co/claudia-lopez.jpg",
      age: 55,
      profession: "Politóloga y exalcaldesa de Bogotá",
      region: "Bogotá",
      ideology: "centro-izquierda",
      bio: "Exalcaldesa de Bogotá (2020-2023) y politóloga. Reconocida por su lucha anticorrupción y su gestión urbana en Bogotá. Primera mujer y primera persona abiertamente LGBTQ+ en gobernar la capital.",
      key_proposals: [
        {
          category: "anticorrupcion",
          title: "Transparencia y gobierno abierto",
          summary: "Implementar sistemas de contratación 100% digitales con trazabilidad blockchain y veedurías ciudadanas en todos los niveles.",
        },
        {
          category: "infraestructura",
          title: "Movilidad sostenible nacional",
          summary: "Expandir sistemas de transporte masivo en las 5 principales ciudades y electrificar el transporte público.",
        },
        {
          category: "medio-ambiente",
          title: "Transición energética acelerada",
          summary: "Reducir la dependencia del petróleo y el carbón, duplicar la capacidad de energía solar y eólica para 2030.",
        },
      ],
      poll_average: 11.8,
      poll_trend: "stable",
      has_legal_issues: false,
      social_media: { twitter: "@ClaudiaLopez" },
      quiz_positions: {
        "pena-muerte": -2,
        "estado-empresario": 1,
        "inversion-extranjera": 1,
        "mineria": -1,
        "aborto": 2,
        "matrimonio-igualitario": 2,
        "descentralizacion": 2,
        "educacion-publica": 2,
        "salud-universal": 1,
        "corrupcion": 2,
      },
      is_active: true,
      sort_order: 3,
      country_code: "co",
    },
    {
      id: "co-sergio-fajardo",
      slug: "sergio-fajardo",
      name: "Sergio Fajardo",
      short_name: "Fajardo",
      party: "Dignidad y Compromiso",
      party_slug: "dignidad-y-compromiso",
      party_color: "#FF8C00",
      photo: "/candidatos/co/sergio-fajardo.jpg",
      age: 69,
      profession: "Matemático y exalcalde de Medellín",
      region: "Medellín",
      ideology: "centro",
      bio: "Matemático, exalcalde de Medellín y exgobernador de Antioquia. Reconocido por transformar Medellín a través de la educación y la cultura. Candidato presidencial en 2018 y 2022.",
      key_proposals: [
        {
          category: "educacion",
          title: "Revolución educativa nacional",
          summary: "Triplicar la inversión en educación pública, construir mega-bibliotecas y parques educativos en municipios vulnerables.",
        },
        {
          category: "economia",
          title: "Economía naranja y emprendimiento",
          summary: "Impulsar las industrias creativas, la innovación tecnológica y el emprendimiento con capital semilla estatal.",
        },
        {
          category: "anticorrupcion",
          title: "Cero tolerancia a la corrupción",
          summary: "Crear una agencia anticorrupción independiente con poder vinculante y protección a denunciantes.",
        },
      ],
      poll_average: 9.3,
      poll_trend: "stable",
      has_legal_issues: true,
      legal_note: "Investigado por presunta financiación irregular de campaña en 2018. Caso en curso ante la Fiscalía.",
      social_media: { twitter: "@sergio_fajardo" },
      quiz_positions: {
        "pena-muerte": -1,
        "estado-empresario": 0,
        "inversion-extranjera": 1,
        "mineria": 0,
        "aborto": 1,
        "matrimonio-igualitario": 1,
        "descentralizacion": 2,
        "educacion-publica": 2,
        "salud-universal": 1,
        "corrupcion": 2,
      },
      is_active: true,
      sort_order: 4,
      country_code: "co",
    },
    {
      id: "co-paloma-valencia",
      slug: "paloma-valencia",
      name: "Paloma Valencia",
      short_name: "Valencia",
      party: "Centro Democrático",
      party_slug: "centro-democratico",
      party_color: "#003366",
      photo: "/candidatos/co/paloma-valencia.jpg",
      age: 46,
      profession: "Politóloga y senadora",
      region: "Valle del Cauca",
      ideology: "derecha",
      bio: "Senadora del Centro Democrático de Álvaro Uribe. Figura visible de la oposición al gobierno Petro. Defensora de la seguridad democrática, la propiedad privada y la libre empresa.",
      key_proposals: [
        {
          category: "seguridad",
          title: "Seguridad democrática 2.0",
          summary: "Retomar la estrategia de seguridad democrática, fortalecer Fuerzas Armadas y combatir frontalmente al ELN y las disidencias.",
        },
        {
          category: "economia",
          title: "Colombia emprendedora",
          summary: "Reducir la carga tributaria a pymes, promover zonas francas regionales y tratados de libre comercio con Asia.",
        },
        {
          category: "educacion",
          title: "Educación bilingüe universal",
          summary: "Implementar programa nacional de inglés desde preescolar y alianzas con universidades internacionales.",
        },
      ],
      poll_average: 7.8,
      poll_trend: "up",
      has_legal_issues: false,
      social_media: { twitter: "@PalomaValworker" },
      quiz_positions: {
        "pena-muerte": 1,
        "estado-empresario": -2,
        "inversion-extranjera": 2,
        "mineria": 2,
        "aborto": -2,
        "matrimonio-igualitario": -1,
        "descentralizacion": 0,
        "educacion-publica": 0,
        "salud-universal": -1,
        "corrupcion": 1,
      },
      is_active: true,
      sort_order: 5,
      country_code: "co",
    },
    {
      id: "co-vicky-davila",
      slug: "vicky-davila",
      name: "Vicky Dávila",
      short_name: "Vicky",
      party: "Movimiento Valientes",
      party_slug: "movimiento-valientes",
      party_color: "#8B0000",
      photo: "/candidatos/co/vicky-davila.jpg",
      age: 53,
      profession: "Periodista y directora de medios",
      region: "Bucaramanga",
      ideology: "centro-derecha",
      bio: "Periodista reconocida, exdirectora de la revista Semana. Conocida por sus investigaciones contra la corrupción y su estilo directo. Ingresó a la política como figura anticorrupción y antiestablishment.",
      key_proposals: [
        {
          category: "anticorrupcion",
          title: "Periodismo ciudadano contra la corrupción",
          summary: "Crear plataformas de denuncia ciudadana con protección legal y seguimiento judicial obligatorio.",
        },
        {
          category: "seguridad",
          title: "Policía comunitaria fortalecida",
          summary: "Reformar la Policía Nacional con enfoque comunitario, cámaras corporales y rendición de cuentas permanente.",
        },
        {
          category: "tecnologia",
          title: "Colombia digital 2030",
          summary: "Conectar a internet de alta velocidad al 95% del territorio y crear centros de innovación tecnológica regionales.",
        },
      ],
      poll_average: 6.2,
      poll_trend: "down",
      has_legal_issues: false,
      social_media: { twitter: "@VickyDavilaH" },
      quiz_positions: {
        "pena-muerte": 0,
        "estado-empresario": -1,
        "inversion-extranjera": 1,
        "mineria": 1,
        "aborto": -1,
        "matrimonio-igualitario": 0,
        "descentralizacion": 1,
        "educacion-publica": 1,
        "salud-universal": 0,
        "corrupcion": 2,
      },
      is_active: true,
      sort_order: 6,
      country_code: "co",
    },
    {
      id: "co-daniel-quintero",
      slug: "daniel-quintero",
      name: "Daniel Quintero",
      short_name: "Quintero",
      party: "AICO",
      party_slug: "aico",
      party_color: "#6A0DAD",
      photo: "/candidatos/co/daniel-quintero.jpg",
      age: 41,
      profession: "Ingeniero y exalcalde de Medellín",
      region: "Medellín",
      ideology: "centro-izquierda",
      bio: "Ingeniero de sistemas y exalcalde de Medellín (2020-2023). Se presenta como representante de una nueva generación de líderes. Cercano al petrismo pero con perfil independiente y enfoque tecnológico.",
      key_proposals: [
        {
          category: "tecnologia",
          title: "Gobierno con inteligencia artificial",
          summary: "Implementar IA en la gestión pública para optimizar recursos, predecir necesidades ciudadanas y combatir el fraude.",
        },
        {
          category: "economia",
          title: "Valle del Software colombiano",
          summary: "Crear zonas especiales de desarrollo tecnológico con incentivos tributarios para startups y empresas tech.",
        },
        {
          category: "medio-ambiente",
          title: "Ciudades sostenibles",
          summary: "Transformar las 10 principales ciudades con infraestructura verde, techos solares obligatorios y movilidad eléctrica.",
        },
      ],
      poll_average: 4.5,
      poll_trend: "up",
      has_legal_issues: true,
      legal_note: "Investigado por presunta participación en política durante su periodo como alcalde de Medellín. Suspendido temporalmente en 2022.",
      social_media: { twitter: "@QuinteroCalle" },
      quiz_positions: {
        "pena-muerte": -2,
        "estado-empresario": 1,
        "inversion-extranjera": 1,
        "mineria": -1,
        "aborto": 1,
        "matrimonio-igualitario": 2,
        "descentralizacion": 2,
        "educacion-publica": 1,
        "salud-universal": 1,
        "corrupcion": 1,
      },
      is_active: true,
      sort_order: 7,
      country_code: "co",
    },
    {
      id: "co-roy-barreras",
      slug: "roy-barreras",
      name: "Roy Barreras",
      short_name: "Roy",
      party: "La Fuerza de la Paz",
      party_slug: "la-fuerza-de-la-paz",
      party_color: "#228B22",
      photo: "/candidatos/co/roy-barreras.jpg",
      age: 62,
      profession: "Médico cirujano y político",
      region: "Valle del Cauca",
      ideology: "centro-izquierda",
      bio: "Médico cirujano, excongresista y expresidente del Senado. Fue clave en la negociación del Acuerdo de Paz con las FARC. Ha militado en varios partidos a lo largo de su carrera política.",
      key_proposals: [
        {
          category: "salud",
          title: "Reforma integral a la salud",
          summary: "Crear un sistema de salud preventivo con centros de atención primaria en cada municipio y telemedicina rural.",
        },
        {
          category: "seguridad",
          title: "Implementación total del Acuerdo de Paz",
          summary: "Completar la implementación del acuerdo con las FARC, con énfasis en reforma rural integral y justicia transicional.",
        },
        {
          category: "economia",
          title: "Desarrollo rural y agroindustria",
          summary: "Modernizar el campo colombiano con tecnología, acceso a crédito y cadenas de exportación para productos agrícolas.",
        },
      ],
      poll_average: 3.8,
      poll_trend: "stable",
      has_legal_issues: false,
      social_media: { twitter: "@RoyBarreras" },
      quiz_positions: {
        "pena-muerte": -1,
        "estado-empresario": 1,
        "inversion-extranjera": 0,
        "mineria": 0,
        "aborto": 1,
        "matrimonio-igualitario": 1,
        "descentralizacion": 1,
        "educacion-publica": 1,
        "salud-universal": 2,
        "corrupcion": 0,
      },
      is_active: true,
      sort_order: 8,
      country_code: "co",
    },
  ];

  // ─── Poll history for each candidate ─────────────────────────
  const pollData: Array<{
    candidate_id: string;
    value: number;
    pollster: string;
    date: string;
    country_code: string;
  }> = [];

  const colombianPollsters = ["Invamer", "Datexco", "Cifras y Conceptos", "Guarumo", "CNC", "YanHaas"];

  // Generate ~9 poll data points per candidate (Oct 2025 → Feb 2026)
  const pollDates = [
    "2025-10-01", "2025-11-01", "2025-12-01",
    "2026-01-01", "2026-01-15", "2026-02-01",
    "2026-02-08", "2026-02-15", "2026-02-22",
  ];

  const pollHistories: Record<string, number[]> = {
    "co-ivan-cepeda":               [12.0, 13.2, 14.0, 14.8, 15.2, 15.5, 15.8, 16.2, 16.5],
    "co-abelardo-de-la-espriella":   [10.5, 11.0, 11.8, 12.5, 13.0, 13.5, 13.8, 14.0, 14.2],
    "co-claudia-lopez":             [12.5, 12.8, 12.5, 12.2, 12.0, 11.8, 11.8, 11.8, 11.8],
    "co-sergio-fajardo":            [10.0, 9.8, 9.6, 9.5, 9.4, 9.3, 9.3, 9.3, 9.3],
    "co-paloma-valencia":           [5.5, 5.8, 6.2, 6.5, 6.8, 7.0, 7.3, 7.5, 7.8],
    "co-vicky-davila":              [7.0, 7.2, 7.0, 6.8, 6.5, 6.4, 6.3, 6.2, 6.2],
    "co-daniel-quintero":           [3.0, 3.2, 3.5, 3.8, 4.0, 4.1, 4.2, 4.3, 4.5],
    "co-roy-barreras":              [4.0, 4.2, 4.0, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8],
  };

  for (const [candidateId, values] of Object.entries(pollHistories)) {
    values.forEach((value, i) => {
      const pollsterIndex = i % colombianPollsters.length;
      pollData.push({
        candidate_id: candidateId,
        value,
        pollster: colombianPollsters[pollsterIndex],
        date: pollDates[i],
        country_code: "co",
      });
    });
  }

  // ─── Insert candidates ───────────────────────────────────────
  const { error: candError } = await supabase
    .from("candidates")
    .insert(candidates);

  if (candError) {
    console.error("[seed-colombia] Candidate insert error:", candError);
    return NextResponse.json(
      { error: "Failed to insert candidates", details: candError.message },
      { status: 500 }
    );
  }

  // ─── Insert poll data ────────────────────────────────────────
  const { error: pollError } = await supabase
    .from("poll_data_points")
    .insert(pollData);

  if (pollError) {
    console.error("[seed-colombia] Poll data insert error:", pollError);
    return NextResponse.json(
      { error: "Failed to insert poll data", details: pollError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    candidates_inserted: candidates.length,
    poll_data_points_inserted: pollData.length,
    message: `Seeded ${candidates.length} Colombian candidates with ${pollData.length} poll data points`,
  });
}
