#!/usr/bin/env npx tsx
/**
 * Seed/Upsert 36 JNE presidential candidates into Supabase `candidates` table.
 *
 * - For 8 EXISTING candidates: update photo to JNE URL + update party name to official JNE name.
 * - For 28 NEW candidates: insert with JNE data + placeholder bio/proposals.
 *
 * Usage: npx tsx scripts/seed-jne-candidates.ts
 * Run from: apps/web/
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Manually load .env.local (no dotenv dependency needed)
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// =============================================================================
// HELPERS
// =============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Capitalize each word properly (Spanish conventions) */
function capitalize(text: string): string {
  const lowerWords = new Set([
    "de",
    "del",
    "la",
    "las",
    "los",
    "el",
    "y",
    "en",
    "para",
    "por",
    "con",
  ]);
  return text
    .toLowerCase()
    .split(" ")
    .map((word, i) => {
      if (i > 0 && lowerWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// =============================================================================
// EXISTING 8 CANDIDATES — mapping from DB id/slug to JNE data
// These already exist in the DB; we only update photo + party info
// =============================================================================

interface ExistingUpdate {
  dbId: string; // actual DB id (numeric string)
  dbSlug: string; // actual DB slug
  jneName: string; // full JNE name
  jneParty: string; // official JNE party name
  jnePhoto: string; // JNE photo URL
}

const EXISTING_UPDATES: ExistingUpdate[] = [
  {
    dbId: "1",
    dbSlug: "rafael-lopez-aliaga",
    jneName: "RAFAEL BERNARDO LOPEZ ALIAGA CAZORLA",
    jneParty: "RENOVACION POPULAR",
    jnePhoto:
      "https://mpesije.jne.gob.pe/apidocs/b2e00ae2-1e50-4ad3-a103-71fc7e4e8255.jpg",
  },
  {
    dbId: "2",
    dbSlug: "keiko-fujimori",
    jneName: "KEIKO SOFIA FUJIMORI HIGUCHI",
    jneParty: "FUERZA POPULAR",
    jnePhoto:
      "https://mpesije.jne.gob.pe/apidocs/251cd1c0-acc7-4338-bd8a-439ccb9238d0.jpeg",
  },
  {
    dbId: "3",
    dbSlug: "cesar-acuna",
    jneName: "CESAR ACUÑA PERALTA",
    jneParty: "ALIANZA PARA EL PROGRESO",
    jnePhoto:
      "https://mpesije.jne.gob.pe/apidocs/d6fe3cac-7061-474b-8551-0aa686a54bad.jpg",
  },
  {
    dbId: "4",
    dbSlug: "mario-vizcarra",
    jneName: "MARIO ENRIQUE VIZCARRA CORNEJO",
    jneParty: "PARTIDO POLITICO PERU PRIMERO",
    jnePhoto:
      "https://mpesije.jne.gob.pe/apidocs/ee7a080e-bc81-4c81-9e5e-9fd95ff459ab.jpg",
  },
  {
    dbId: "5",
    dbSlug: "carlos-alvarez",
    jneName: "CARLOS GONSALO ALVAREZ LOAYZA",
    jneParty: "PARTIDO PAIS PARA TODOS",
    jnePhoto:
      "https://mpesije.jne.gob.pe/apidocs/2bd18177-d665-413d-9694-747d729d3e39.jpg",
  },
  {
    dbId: "6",
    dbSlug: "alfonso-lopez-chau",
    jneName: "PABLO ALFONSO LOPEZ CHAU NAVA",
    jneParty: "AHORA NACION - AN",
    jnePhoto:
      "https://mpesije.jne.gob.pe/apidocs/ddfa74eb-cae3-401c-a34c-35543ae83c57.jpg",
  },
  {
    dbId: "7",
    dbSlug: "george-forsyth",
    jneName: "GEORGE PATRICK FORSYTH SOMMER",
    jneParty: "PARTIDO DEMOCRATICO SOMOS PERU",
    jnePhoto:
      "https://mpesije.jne.gob.pe/apidocs/b1d60238-c797-4cba-936e-f13de6a34cc7.jpg",
  },
  {
    dbId: "8",
    dbSlug: "jose-luna-galvez",
    jneName: "JOSE LEON LUNA GALVEZ",
    jneParty: "PODEMOS PERU",
    jnePhoto:
      "https://mpesije.jne.gob.pe/apidocs/a669a883-bf8a-417c-9296-c14b943c3943.jpg",
  },
];

// Set of JNE names that already exist
const existingJneNames = new Set(EXISTING_UPDATES.map((e) => e.jneName));

// =============================================================================
// ALL 36 JNE CANDIDATES
// =============================================================================

interface JneCandidate {
  jneName: string;
  party: string;
  photo: string;
}

const JNE_CANDIDATES: JneCandidate[] = [
  {
    jneName: "PABLO ALFONSO LOPEZ CHAU NAVA",
    party: "AHORA NACION - AN",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/ddfa74eb-cae3-401c-a34c-35543ae83c57.jpg",
  },
  {
    jneName: "RONALD DARWIN ATENCIO SOTOMAYOR",
    party: "ALIANZA ELECTORAL VENCEREMOS",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/bac0288d-3b21-45ac-8849-39f9177fb020.jpg",
  },
  {
    jneName: "CESAR ACUÑA PERALTA",
    party: "ALIANZA PARA EL PROGRESO",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/d6fe3cac-7061-474b-8551-0aa686a54bad.jpg",
  },
  {
    jneName: "JOSE DANIEL WILLIAMS ZAPATA",
    party: "AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/b60c471f-a6bb-4b42-a4b2-02ea38acbb0d.jpg",
  },
  {
    jneName: "ALVARO GONZALO PAZ DE LA BARRA FREIGEIRO",
    party: "FE EN EL PERU",
    photo:
      "https://votoinformado.jne.gob.pe/assets/images/candidatos/ALVARO%20PAZ%20DE%20LA%20BARRA.jpg",
  },
  {
    jneName: "KEIKO SOFIA FUJIMORI HIGUCHI",
    party: "FUERZA POPULAR",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/251cd1c0-acc7-4338-bd8a-439ccb9238d0.jpeg",
  },
  {
    jneName: "FIORELLA GIANNINA MOLINELLI ARISTONDO",
    party: "FUERZA Y LIBERTAD",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/1de656b5-7593-4c60-ab7a-83d618a3d80d.jpg",
  },
  {
    jneName: "ROBERTO HELBERT SANCHEZ PALOMINO",
    party: "JUNTOS POR EL PERU",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/bb7c7465-9c6e-44eb-ac7d-e6cc7f872a1a.jpg",
  },
  {
    jneName: "RAFAEL JORGE BELAUNDE LLOSA",
    party: "LIBERTAD POPULAR",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/3302e45b-55c8-4979-a60b-2b11097abf1d.jpg",
  },
  {
    jneName: "PITTER ENRIQUE VALDERRAMA PEÑA",
    party: "PARTIDO APRISTA PERUANO",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/d72c4b29-e173-42b8-b40d-bdb6d01a526a.jpg",
  },
  {
    jneName: "RICARDO PABLO BELMONT CASSINELLI",
    party: "PARTIDO CIVICO OBRAS",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/78647f15-d5d1-4ed6-8ac6-d599e83eeea3.jpg",
  },
  {
    jneName: "NAPOLEON BECERRA GARCIA",
    party: "PARTIDO DE LOS TRABAJADORES Y EMPRENDEDORES PTE - PERU",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/bab206cb-b2d5-41ec-bde8-ef8cf3e0a2df.jpg",
  },
  {
    jneName: "JORGE NIETO MONTESINOS",
    party: "PARTIDO DEL BUEN GOBIERNO",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/9ae56ed5-3d0f-49ff-8bb9-0390bad71816.jpg",
  },
  {
    jneName: "CHARLIE CARRASCO SALAZAR",
    party: "PARTIDO DEMOCRATA UNIDO PERU",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/12fa17db-f28f-4330-9123-88549539b538.jpg",
  },
  {
    jneName: "ALEX GONZALES CASTILLO",
    party: "PARTIDO DEMOCRATA VERDE",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/c0ae56bf-21c1-4810-890a-b25c8465bdd9.jpg",
  },
  {
    jneName: "ARMANDO JOAQUIN MASSE FERNANDEZ",
    party: "PARTIDO DEMOCRATICO FEDERAL",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/cb1adeb7-7d2f-430c-ae87-519137d8edfa.jpg",
  },
  {
    jneName: "GEORGE PATRICK FORSYTH SOMMER",
    party: "PARTIDO DEMOCRATICO SOMOS PERU",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/b1d60238-c797-4cba-936e-f13de6a34cc7.jpg",
  },
  {
    jneName: "LUIS FERNANDO OLIVERA VEGA",
    party: "PARTIDO FRENTE DE LA ESPERANZA 2021",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/3e2312e1-af79-4954-abfa-a36669c1a9e9.jpg",
  },
  {
    jneName: "MESIAS ANTONIO GUEVARA AMASIFUEN",
    party: "PARTIDO MORADO",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/1b861ca7-3a5e-48b4-9024-08a92371e33b.jpg",
  },
  {
    jneName: "CARLOS GONSALO ALVAREZ LOAYZA",
    party: "PARTIDO PAIS PARA TODOS",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/2bd18177-d665-413d-9694-747d729d3e39.jpg",
  },
  {
    jneName: "HERBERT CALLER GUTIERREZ",
    party: "PARTIDO PATRIOTICO DEL PERU",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/6ad6c5ff-0411-4ddd-9cf7-b0623f373fcf.jpg",
  },
  {
    jneName: "YONHY LESCANO ANCIETA",
    party: "PARTIDO POLITICO COOPERACION POPULAR",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/b9db2b5c-02ff-4265-ae51-db9b1001ad70.jpg",
  },
  {
    jneName: "WOLFGANG MARIO GROZO COSTA",
    party: "PARTIDO POLITICO INTEGRIDAD DEMOCRATICA",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/064360d1-ce49-4abe-939c-f4de8b0130a2.jpg",
  },
  {
    jneName: "VLADIMIR ROY CERRON ROJAS",
    party: "PARTIDO POLITICO NACIONAL PERU LIBRE",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/82ee0ff2-2336-4aba-9590-e576f7564315.jpg",
  },
  {
    jneName: "FRANCISCO ERNESTO DIEZ-CANSECO TÁVARA",
    party: "PARTIDO POLITICO PERU ACCION",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/2d1bf7f2-6e88-4ea9-8ed2-975c1ae5fb92.jpg",
  },
  {
    jneName: "MARIO ENRIQUE VIZCARRA CORNEJO",
    party: "PARTIDO POLITICO PERU PRIMERO",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/ee7a080e-bc81-4c81-9e5e-9fd95ff459ab.jpg",
  },
  {
    jneName: "WALTER GILMER CHIRINOS PURIZAGA",
    party: "PARTIDO POLITICO PRIN",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/a2d0f631-fe47-4c41-92ba-7ed9f4095520.jpg",
  },
  {
    jneName: "ALFONSO CARLOS ESPA Y GARCES-ALVEAR",
    party: "PARTIDO SICREO",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/85935f77-6c46-4eab-8c7e-2494ffbcece0.jpg",
  },
  {
    jneName: "CARLOS ERNESTO JAICO CARRANZA",
    party: "PERU MODERNO",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/7d91e14f-4417-4d61-89ba-3e686dafaa95.jpg",
  },
  {
    jneName: "JOSE LEON LUNA GALVEZ",
    party: "PODEMOS PERU",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/a669a883-bf8a-417c-9296-c14b943c3943.jpg",
  },
  {
    jneName: "MARIA SOLEDAD PEREZ TELLO DE RODRIGUEZ",
    party: "PRIMERO LA GENTE - COMUNIDAD, ECOLOGIA, LIBERTAD Y PROGRESO",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/073703ca-c427-44f0-94b1-a782223a5e10.jpg",
  },
  {
    jneName: "PAUL DAVIS JAIMES BLANCO",
    party: "PROGRESEMOS",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/929e1a63-335d-4f3a-ba26-f3c7ff136213.jpg",
  },
  {
    jneName: "RAFAEL BERNARDO LOPEZ ALIAGA CAZORLA",
    party: "RENOVACION POPULAR",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/b2e00ae2-1e50-4ad3-a103-71fc7e4e8255.jpg",
  },
  {
    jneName: "ANTONIO ORTIZ VILLANO",
    party: "SALVEMOS AL PERU",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/8e6b9124-2883-4143-8768-105f2ce780eb.jpg",
  },
  {
    jneName: "ROSARIO DEL PILAR FERNANDEZ BAZAN",
    party: "UN CAMINO DIFERENTE",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/ac0b0a59-ead5-4ef1-8ef8-8967e322d6ca.jpg",
  },
  {
    jneName: "ROBERTO ENRIQUE CHIABRA LEON",
    party: "UNIDAD NACIONAL",
    photo:
      "https://mpesije.jne.gob.pe/apidocs/5c703ce9-ba1e-4490-90bf-61006740166f.jpg",
  },
];

// =============================================================================
// PARTY COLORS (one per party)
// =============================================================================

const PARTY_COLORS: Record<string, string> = {
  "AHORA NACION - AN": "#059669",
  "ALIANZA PARA EL PROGRESO": "#dc2626",
  "FUERZA POPULAR": "#ff6600",
  "PARTIDO POLITICO PERU PRIMERO": "#f59e0b",
  "PARTIDO PAIS PARA TODOS": "#0369a1",
  "PARTIDO DEMOCRATICO SOMOS PERU": "#ea580c",
  "PODEMOS PERU": "#7c3aed",
  "RENOVACION POPULAR": "#1e3a8a",
  "ALIANZA ELECTORAL VENCEREMOS": "#991b1b",
  "AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL": "#0e7490",
  "FE EN EL PERU": "#a16207",
  "FUERZA Y LIBERTAD": "#be185d",
  "JUNTOS POR EL PERU": "#9333ea",
  "LIBERTAD POPULAR": "#2563eb",
  "PARTIDO APRISTA PERUANO": "#e11d48",
  "PARTIDO CIVICO OBRAS": "#ca8a04",
  "PARTIDO DE LOS TRABAJADORES Y EMPRENDEDORES PTE - PERU": "#c2410c",
  "PARTIDO DEL BUEN GOBIERNO": "#0d9488",
  "PARTIDO DEMOCRATA UNIDO PERU": "#4f46e5",
  "PARTIDO DEMOCRATA VERDE": "#16a34a",
  "PARTIDO DEMOCRATICO FEDERAL": "#7e22ce",
  "PARTIDO FRENTE DE LA ESPERANZA 2021": "#db2777",
  "PARTIDO MORADO": "#a855f7",
  "PARTIDO PATRIOTICO DEL PERU": "#b45309",
  "PARTIDO POLITICO COOPERACION POPULAR": "#15803d",
  "PARTIDO POLITICO INTEGRIDAD DEMOCRATICA": "#6d28d9",
  "PARTIDO POLITICO NACIONAL PERU LIBRE": "#b91c1c",
  "PARTIDO POLITICO PERU ACCION": "#0284c7",
  "PARTIDO POLITICO PRIN": "#65a30d",
  "PARTIDO SICREO": "#a21caf",
  "PERU MODERNO": "#0891b2",
  "PRIMERO LA GENTE - COMUNIDAD, ECOLOGIA, LIBERTAD Y PROGRESO": "#10b981",
  "PROGRESEMOS": "#2dd4bf",
  "SALVEMOS AL PERU": "#ef4444",
  "UN CAMINO DIFERENTE": "#f472b6",
  "UNIDAD NACIONAL": "#1d4ed8",
};

// =============================================================================
// SHORT NAME OVERRIDES
// =============================================================================

const SHORT_NAME_OVERRIDES: Record<string, string> = {
  "PABLO ALFONSO LOPEZ CHAU NAVA": "Lopez Chau",
  "RONALD DARWIN ATENCIO SOTOMAYOR": "R. Atencio",
  "CESAR ACUÑA PERALTA": "C. Acuna",
  "JOSE DANIEL WILLIAMS ZAPATA": "J. Williams",
  "ALVARO GONZALO PAZ DE LA BARRA FREIGEIRO": "Paz de la Barra",
  "KEIKO SOFIA FUJIMORI HIGUCHI": "K. Fujimori",
  "FIORELLA GIANNINA MOLINELLI ARISTONDO": "F. Molinelli",
  "ROBERTO HELBERT SANCHEZ PALOMINO": "R. Sanchez",
  "RAFAEL JORGE BELAUNDE LLOSA": "R. Belaunde",
  "PITTER ENRIQUE VALDERRAMA PEÑA": "P. Valderrama",
  "RICARDO PABLO BELMONT CASSINELLI": "Belmont",
  "NAPOLEON BECERRA GARCIA": "N. Becerra",
  "JORGE NIETO MONTESINOS": "J. Nieto",
  "CHARLIE CARRASCO SALAZAR": "C. Carrasco",
  "ALEX GONZALES CASTILLO": "A. Gonzales",
  "ARMANDO JOAQUIN MASSE FERNANDEZ": "A. Masse",
  "GEORGE PATRICK FORSYTH SOMMER": "Forsyth",
  "LUIS FERNANDO OLIVERA VEGA": "F. Olivera",
  "MESIAS ANTONIO GUEVARA AMASIFUEN": "M. Guevara",
  "CARLOS GONSALO ALVAREZ LOAYZA": "C. Alvarez",
  "HERBERT CALLER GUTIERREZ": "H. Caller",
  "YONHY LESCANO ANCIETA": "Y. Lescano",
  "WOLFGANG MARIO GROZO COSTA": "W. Grozo",
  "VLADIMIR ROY CERRON ROJAS": "V. Cerron",
  "FRANCISCO ERNESTO DIEZ-CANSECO TÁVARA": "Diez-Canseco",
  "MARIO ENRIQUE VIZCARRA CORNEJO": "M. Vizcarra",
  "WALTER GILMER CHIRINOS PURIZAGA": "W. Chirinos",
  "ALFONSO CARLOS ESPA Y GARCES-ALVEAR": "A. Espa",
  "CARLOS ERNESTO JAICO CARRANZA": "C. Jaico",
  "JOSE LEON LUNA GALVEZ": "J. Luna",
  "MARIA SOLEDAD PEREZ TELLO DE RODRIGUEZ": "Perez Tello",
  "PAUL DAVIS JAIMES BLANCO": "P. Jaimes",
  "RAFAEL BERNARDO LOPEZ ALIAGA CAZORLA": "Lopez Aliaga",
  "ANTONIO ORTIZ VILLANO": "A. Ortiz",
  "ROSARIO DEL PILAR FERNANDEZ BAZAN": "R. Fernandez",
  "ROBERTO ENRIQUE CHIABRA LEON": "R. Chiabra",
};

// =============================================================================
// SLUG OVERRIDES for new candidates
// =============================================================================

const SLUG_OVERRIDES: Record<string, string> = {
  "RONALD DARWIN ATENCIO SOTOMAYOR": "ronald-atencio",
  "JOSE DANIEL WILLIAMS ZAPATA": "jose-williams",
  "ALVARO GONZALO PAZ DE LA BARRA FREIGEIRO": "alvaro-paz-de-la-barra",
  "FIORELLA GIANNINA MOLINELLI ARISTONDO": "fiorella-molinelli",
  "ROBERTO HELBERT SANCHEZ PALOMINO": "roberto-sanchez",
  "RAFAEL JORGE BELAUNDE LLOSA": "rafael-belaunde",
  "PITTER ENRIQUE VALDERRAMA PEÑA": "pitter-valderrama",
  "RICARDO PABLO BELMONT CASSINELLI": "ricardo-belmont",
  "NAPOLEON BECERRA GARCIA": "napoleon-becerra",
  "JORGE NIETO MONTESINOS": "jorge-nieto",
  "CHARLIE CARRASCO SALAZAR": "charlie-carrasco",
  "ALEX GONZALES CASTILLO": "alex-gonzales",
  "ARMANDO JOAQUIN MASSE FERNANDEZ": "armando-masse",
  "LUIS FERNANDO OLIVERA VEGA": "fernando-olivera",
  "MESIAS ANTONIO GUEVARA AMASIFUEN": "mesias-guevara",
  "HERBERT CALLER GUTIERREZ": "herbert-caller",
  "YONHY LESCANO ANCIETA": "yonhy-lescano",
  "WOLFGANG MARIO GROZO COSTA": "wolfgang-grozo",
  "VLADIMIR ROY CERRON ROJAS": "vladimir-cerron",
  "FRANCISCO ERNESTO DIEZ-CANSECO TÁVARA": "francisco-diez-canseco",
  "WALTER GILMER CHIRINOS PURIZAGA": "walter-chirinos",
  "ALFONSO CARLOS ESPA Y GARCES-ALVEAR": "alfonso-espa",
  "CARLOS ERNESTO JAICO CARRANZA": "carlos-jaico",
  "MARIA SOLEDAD PEREZ TELLO DE RODRIGUEZ": "marisol-perez-tello",
  "PAUL DAVIS JAIMES BLANCO": "paul-jaimes",
  "ANTONIO ORTIZ VILLANO": "antonio-ortiz",
  "ROSARIO DEL PILAR FERNANDEZ BAZAN": "rosario-fernandez",
  "ROBERTO ENRIQUE CHIABRA LEON": "roberto-chiabra",
};

// Female candidates
const FEMALE_CANDIDATES = new Set([
  "FIORELLA GIANNINA MOLINELLI ARISTONDO",
  "MARIA SOLEDAD PEREZ TELLO DE RODRIGUEZ",
  "ROSARIO DEL PILAR FERNANDEZ BAZAN",
  "KEIKO SOFIA FUJIMORI HIGUCHI",
]);

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

async function seedJneCandidates() {
  console.log("=== JNE Candidates Seed Script ===\n");

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 1: Update the 8 existing candidates with JNE photos
  // ───────────────────────────────────────────────────────────────────────────
  console.log("STEP 1: Updating 8 existing candidates with JNE photos...\n");

  for (const existing of EXISTING_UPDATES) {
    const { error } = await supabase
      .from("candidates")
      .update({
        photo: existing.jnePhoto,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.dbId);

    if (error) {
      console.error(`  ERROR updating ${existing.dbSlug}: ${error.message}`);
    } else {
      console.log(
        `  ✓ Updated photo for [${existing.dbId}] ${existing.dbSlug}`
      );
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 2: Insert 28 NEW candidates
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\nSTEP 2: Inserting 28 new candidates...\n");

  const newCandidates = JNE_CANDIDATES.filter(
    (c) => !existingJneNames.has(c.jneName)
  );

  // Sort alphabetically for consistent sort_order
  newCandidates.sort((a, b) => a.jneName.localeCompare(b.jneName));

  // Existing candidates have sort_order 1-8; new ones start at 9
  let sortOrder = 9;

  const newRows = newCandidates.map((c) => {
    const slug = SLUG_OVERRIDES[c.jneName] || slugify(c.jneName);
    const name = capitalize(c.jneName);
    const shortName =
      SHORT_NAME_OVERRIDES[c.jneName] ||
      capitalize(c.jneName.split(" ").slice(-2).join(" "));
    const partyDisplay = capitalize(c.party);
    const partySlug = slugify(c.party);
    const partyColor = PARTY_COLORS[c.party] || "#6b7280";
    const isFemale = FEMALE_CANDIDATES.has(c.jneName);

    return {
      id: slug, // Use slug as id for new candidates
      slug,
      name,
      short_name: shortName,
      party: partyDisplay,
      party_slug: partySlug,
      party_color: partyColor,
      photo: c.photo,
      age: 0,
      profession: isFemale ? "Politica" : "Politico",
      region: "Lima",
      ideology: "centro",
      bio: `Candidat${isFemale ? "a" : "o"} presidencial por ${partyDisplay}`,
      poll_average: 0,
      poll_trend: "stable",
      has_legal_issues: false,
      legal_note: null,
      key_proposals: [],
      social_media: {},
      quiz_positions: {},
      sort_order: sortOrder++,
      is_active: true,
    };
  });

  // Insert one by one to handle individual errors gracefully
  let insertCount = 0;
  for (const row of newRows) {
    const { error } = await supabase
      .from("candidates")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.error(`  ERROR inserting ${row.slug}: ${error.message}`);
    } else {
      console.log(`  ✓ Inserted [${row.id}] ${row.name} — ${row.party}`);
      insertCount++;
    }
  }

  console.log(`\n  Total inserted: ${insertCount}/${newRows.length}`);

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 3: Verify final state
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\nSTEP 3: Verifying final state...\n");

  const { count: activeCount } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: totalCount } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true });

  console.log(`  Total candidates: ${totalCount}`);
  console.log(`  Active candidates: ${activeCount}`);

  // List all candidates with sort order
  const { data: allCandidates } = await supabase
    .from("candidates")
    .select("id, slug, name, party, sort_order, photo, is_active")
    .order("sort_order", { ascending: true });

  if (allCandidates) {
    console.log("\n  All candidates by sort order:");
    for (const c of allCandidates) {
      const photoSource = c.photo?.startsWith("https://") ? "JNE" : "local";
      const status = c.is_active ? "✓" : "✗";
      console.log(
        `    ${status} ${String(c.sort_order).padStart(2, " ")}. [${c.id}] ${c.name} — ${c.party} (photo: ${photoSource})`
      );
    }
  }

  console.log("\n=== Seed complete! ===");
}

// =============================================================================
// RUN
// =============================================================================

seedJneCandidates().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
