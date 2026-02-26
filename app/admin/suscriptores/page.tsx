import { getSupabase } from "@/lib/supabase";
import { SubscriptoresClient } from "./suscriptores-client";
import { COUNTRIES, type CountryCode } from "@/lib/config/countries";

export const dynamic = "force-dynamic";

async function getSubscribers(country: CountryCode) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("whatsapp_subscribers")
    .select("*")
    .eq("country_code", country)
    .order("subscribed_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[Admin] Subscribers error:", error);
    return [];
  }

  return data || [];
}

export default async function AdminSuscriptoresPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country: countryParam } = await searchParams;
  const country = (countryParam === "co" ? "co" : "pe") as CountryCode;
  const countryConfig = COUNTRIES[country];

  let subscribers;
  try {
    subscribers = await getSubscribers(country);
  } catch {
    subscribers = [];
  }

  return (
    <SubscriptoresClient
      subscribers={subscribers}
      countryName={countryConfig.name}
      countryEmoji={countryConfig.emoji}
      phonePrefix={countryConfig.phonePrefix}
    />
  );
}
