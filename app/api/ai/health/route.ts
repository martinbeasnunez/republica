import { NextRequest } from "next/server";
import { getOpenAI } from "@/lib/ai/openai";

export async function GET(req: NextRequest) {
  const checks: Record<string, string> = {};

  // 1. Check env vars
  checks["OPENAI_API_KEY"] = process.env.OPENAI_API_KEY ? `set (${process.env.OPENAI_API_KEY.slice(0, 7)}...)` : "MISSING";
  checks["SUPABASE_URL"] = process.env.SUPABASE_URL ? "set" : "MISSING";
  checks["SUPABASE_SERVICE_ROLE_KEY"] = process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "MISSING";

  // 2. Test OpenAI connection
  try {
    const openai = getOpenAI();
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say OK" }],
      max_tokens: 5,
    });
    checks["openai_test"] = `OK - ${res.choices[0]?.message?.content}`;
  } catch (e) {
    checks["openai_test"] = `FAILED - ${e instanceof Error ? e.message : String(e)}`;
  }

  // 3. Test Supabase connection
  try {
    const { getSupabase } = await import("@/lib/supabase");
    const supabase = getSupabase();
    const { data, error } = await supabase.from("candidates").select("id").limit(1);
    if (error) {
      checks["supabase_test"] = `FAILED - ${error.message}`;
    } else {
      checks["supabase_test"] = `OK - ${data?.length ?? 0} rows`;
    }
  } catch (e) {
    checks["supabase_test"] = `FAILED - ${e instanceof Error ? e.message : String(e)}`;
  }

  return new Response(JSON.stringify(checks, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
