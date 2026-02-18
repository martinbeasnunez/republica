import { getSupabase } from "@/lib/supabase";
import { SubscriptoresClient } from "./suscriptores-client";

async function getSubscribers() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("whatsapp_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[Admin] Subscribers error:", error);
    return [];
  }

  return data || [];
}

export default async function AdminSuscriptoresPage() {
  let subscribers;
  try {
    subscribers = await getSubscribers();
  } catch {
    subscribers = [];
  }

  return <SubscriptoresClient subscribers={subscribers} />;
}
