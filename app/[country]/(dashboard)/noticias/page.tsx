import type { Metadata } from "next";
import { fetchArticles } from "@/lib/data/news";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { NewsArticleJsonLd } from "@/components/seo/json-ld";
import NoticiasClient from "./noticias-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/noticias");

  return {
    title: `Noticias Electorales — ${seo.name} ${seo.year} en Tiempo Real`,
    description: `Noticias electorales verificadas sobre las elecciones ${seo.name} ${seo.year}. Última hora y análisis con IA.`,
    keywords: getCountryKeywords(country, "noticias"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Noticias Elecciones ${seo.name} ${seo.year}`,
      description: `Noticias electorales verificadas sobre las elecciones ${seo.name} ${seo.year}. Análisis con inteligencia artificial.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function NoticiasPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const [articles, candidates] = await Promise.all([
    fetchArticles(country),
    fetchCandidates(country),
  ]);

  return (
    <>
      {articles.slice(0, 5).map((article) => (
        <NewsArticleJsonLd
          key={article.id}
          headline={article.title}
          datePublished={article.time}
          description={article.summary}
          image={article.imageUrl}
        />
      ))}
      <NoticiasClient articles={articles} candidates={candidates} />

      {country === "pe" && (
        <section className="mt-12 border-t border-border/30 pt-8 pb-4 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-3">
            Noticias Electorales Perú 2026: Cobertura con Inteligencia Artificial
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            CONDOR monitorea más de 16 fuentes de noticias electorales peruanas
            en tiempo real, incluyendo medios de alcance nacional, agencias de
            prensa y portales especializados en política. Nuestro sistema de
            inteligencia artificial analiza, clasifica y verifica cada noticia
            relacionada con las elecciones presidenciales de Perú 2026,
            asignando etiquetas de relevancia, candidato asociado y nivel de
            verificación. Esto permite filtrar el ruido informativo y acceder
            rápidamente a la información electoral más importante del día.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Cada artículo pasa por un proceso de verificación de hechos
            automatizado que contrasta las afirmaciones con datos oficiales,
            registros públicos y declaraciones previas de los candidatos. Las
            noticias reciben una calificación de confiabilidad que ayuda a los
            lectores a distinguir información verificada de rumores o contenido
            sin respaldo. En un contexto electoral con alta circulación de
            desinformación, esta capa de verificación es esencial para un
            electorado informado.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            La cobertura incluye noticias sobre propuestas de gobierno, debates
            presidenciales, resultados de encuestas, alianzas políticas,
            inscripción de candidaturas ante el JNE y todo lo relevante para
            la primera vuelta del 12 de abril de 2026. CONDOR AI actualiza
            las noticias electorales diariamente, ofreciendo un panorama
            completo y verificado de la carrera presidencial peruana.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-4">
            Última actualización: marzo 2026. Noticias curadas y verificadas
            por CONDOR AI con información de más de 16 fuentes nacionales.
          </p>
        </section>
      )}

      {country === "co" && (
        <section className="mt-12 border-t border-border/30 pt-8 pb-4 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-3">
            Noticias Electorales Colombia 2026: Cobertura con Inteligencia Artificial
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            CONDOR monitorea las principales fuentes de noticias electorales
            colombianas en tiempo real, incluyendo medios de alcance nacional,
            agencias de prensa y portales especializados en política. Nuestro
            sistema de inteligencia artificial analiza, clasifica y verifica
            cada noticia relacionada con las elecciones presidenciales de
            Colombia 2026, asignando etiquetas de relevancia, candidato
            asociado y nivel de verificación. Esto permite filtrar el ruido
            informativo y acceder rápidamente a la información electoral más
            importante del día sobre los candidatos colombianos.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Cada artículo pasa por un proceso de verificación de hechos
            automatizado que contrasta las afirmaciones con datos oficiales de
            la Registraduría Nacional, registros públicos y declaraciones
            previas de los candidatos. Las noticias reciben una calificación
            de confiabilidad que ayuda a los lectores a distinguir información
            verificada de rumores o contenido sin respaldo. En un contexto
            electoral con alta circulación de desinformación en Colombia, esta
            capa de verificación es esencial para un electorado informado.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            La cobertura incluye noticias sobre propuestas de gobierno, debates
            presidenciales, resultados de encuestas de Invamer, CNC, Guarumo,
            Datexco y demás encuestadoras, alianzas políticas, inscripción de
            candidaturas y todo lo relevante para las elecciones presidenciales
            de Colombia 2026. CONDOR AI actualiza las noticias electorales
            colombianas diariamente, ofreciendo un panorama completo y
            verificado de la carrera presidencial.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-4">
            Última actualización: marzo 2026. Noticias curadas y verificadas
            por CONDOR AI con información de fuentes colombianas confiables.
          </p>
        </section>
      )}
    </>
  );
}
