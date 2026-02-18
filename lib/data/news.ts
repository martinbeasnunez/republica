export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  time: string;
  category: string;
  factCheck?: "verified" | "questionable" | "false";
  candidates: string[];
  imageUrl?: string;
  isBreaking?: boolean;
}

export const articles: NewsArticle[] = [
  {
    id: "1",
    title: "Congreso destituye a Jose Jeri tras 130 dias como presidente del Peru",
    summary: "El Congreso oficializo la destitucion de Jose Jeri como jefe de Estado tras el escandalo 'Chifagate'. Peru suma su octavo relevo presidencial en casi diez anos de inestabilidad politica.",
    source: "Infobae",
    sourceUrl: "https://www.infobae.com/peru/2026/02/17/jose-jeri-fue-destituido-como-y-cuando-se-elegira-al-nuevo-presidente-de-peru-y-quienes-son-los-principales-candidatos/",
    time: "17 Feb 2026",
    category: "Politica",
    factCheck: "verified",
    candidates: [],
    isBreaking: true,
  },
  {
    id: "2",
    title: "Candidatos presidenciales se pronuncian ante la destitucion de Jeri a dos meses de las elecciones",
    summary: "Los candidatos para las elecciones de abril expresaron sus posturas frente a la destitucion del presidente interino, en un contexto de alta tension politica.",
    source: "Infobae",
    sourceUrl: "https://www.infobae.com/peru/2026/02/17/candidatos-presidenciales-se-pronuncian-ante-la-destitucion-de-jose-jeri-a-dos-meses-de-las-elecciones-2026/",
    time: "17 Feb 2026",
    category: "Politica",
    factCheck: "verified",
    candidates: [],
  },
  {
    id: "3",
    title: "JNE sorteara este viernes 20 las seis fechas para el debate presidencial",
    summary: "El debate contara con 36 candidatos en dos fases y seis fechas entre la ultima semana de marzo e inicios de abril. Cada jornada tendra 12 candidatos en grupos de tres.",
    source: "Andina",
    sourceUrl: "https://andina.pe/agencia/noticia-elecciones-2026-jne-sorteara-este-viernes-20-las-seis-fechas-para-debate-presidencial-1063248.aspx",
    time: "17 Feb 2026",
    category: "Politica",
    factCheck: "verified",
    candidates: [],
  },
  {
    id: "4",
    title: "Debate presidencial 2026 en seis fechas: como se organizara y cuando debatiran los 36 candidatos",
    summary: "El JNE revela el formato del debate: dos fases, seis fechas entre el 23 de marzo y 1 de abril, con intervenciones de 2 a 3 minutos por candidato.",
    source: "El Comercio",
    sourceUrl: "https://elcomercio.pe/politica/elecciones/elecciones-debate-presidencial-2026-en-seis-fechas-como-se-organizara-y-cuando-debatiran-los-36-candidatos-tlcnota-noticia/",
    time: "16 Feb 2026",
    category: "Politica",
    candidates: [],
  },
  {
    id: "5",
    title: "Encuesta Ipsos febrero: cuatro candidatos empatados en el tercer lugar",
    summary: "Lopez Aliaga lidera con 12%, Keiko Fujimori segunda con 8%. Acuna, Vizcarra, Alvarez y Lopez-Chau empatados en tercer lugar con 4% cada uno.",
    source: "Infobae",
    sourceUrl: "https://www.infobae.com/peru/2026/02/12/asi-van-las-encuestas-a-solo-dos-meses-de-las-elecciones-2026-cuatro-candidatos-empatados-en-el-tercer-lugar/",
    time: "12 Feb 2026",
    category: "Encuestas",
    factCheck: "verified",
    candidates: ["Lopez Aliaga", "K. Fujimori"],
  },
  {
    id: "6",
    title: "Lista completa de los 36 candidatos oficiales a la presidencia para las elecciones 2026",
    summary: "La lista oficial confirmada por el JNE incluye a Keiko Fujimori, Lopez Aliaga, Cesar Acuna, George Forsyth, entre los 36 candidatos habilitados para el 12 de abril.",
    source: "La Republica",
    sourceUrl: "https://larepublica.pe/politica/2026/02/12/quienes-son-los-candidatos-presidenciales-elecciones-peru-2026-lista-oficial-confirmada-por-jne-hnews-740868",
    time: "12 Feb 2026",
    category: "Politica",
    factCheck: "verified",
    candidates: [],
  },
  {
    id: "7",
    title: "Lopez Aliaga: las 15 controversiales propuestas para llamar atencion y ganar votos",
    summary: "Analisis de las propuestas del candidato de Renovacion Popular que lidera las encuestas, incluyendo reduccion del Estado, duplicar Pension 65 y fusion de ministerios.",
    source: "La Republica",
    sourceUrl: "https://larepublica.pe/politica/2026/02/08/lopez-aliaga-las-15-controversiales-propuestas-para-llamar-atencion-y-ganar-votos-elecciones-2026-hnews-267416",
    time: "8 Feb 2026",
    category: "Seguridad",
    candidates: ["Lopez Aliaga"],
  },
  {
    id: "8",
    title: "Keiko Fujimori plantea que Fuerzas Armadas controlen carceles y fronteras",
    summary: "La candidata de Fuerza Popular propone que las FF.AA. tomen control de penales y fronteras, ademas de participar en rastrillajes conjuntos con la Policia.",
    source: "Andina",
    sourceUrl: "https://andina.pe/agencia/noticia-elecciones-2026-keiko-fujimori-plantea-fuerzas-armadas-controlen-carceles-y-fronteras-1062965.aspx",
    time: "6 Feb 2026",
    category: "Seguridad",
    factCheck: "verified",
    candidates: ["K. Fujimori"],
  },
];

/** Build a text context block with all news for AI injection */
export function getNewsContext(): string {
  return articles
    .map(
      (a, i) =>
        `${i + 1}. "${a.title}" — ${a.source} (${a.time})${a.sourceUrl ? `\n   Link: ${a.sourceUrl}` : ""}\n   Resumen: ${a.summary}`
    )
    .join("\n\n");
}
