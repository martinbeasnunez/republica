import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { phone, interests } = await req.json();

    // Validate phone (Peru format: +51 9xx xxx xxx)
    const cleanPhone = phone?.replace(/[\s\-()]/g, "");
    if (!cleanPhone || !/^\+?51?\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Numero de telefono invalido. Usa formato peruano: 9XX XXX XXX" },
        { status: 400 }
      );
    }

    // Normalize to +51XXXXXXXXX
    const normalizedPhone = cleanPhone.startsWith("+")
      ? cleanPhone
      : `+51${cleanPhone.replace(/^51/, "")}`;

    // Validate interests
    const validInterests = ["encuestas", "noticias", "alertas", "verificacion"];
    const filteredInterests = (interests || []).filter((i: string) =>
      validInterests.includes(i)
    );

    const supabase = getSupabase();

    // Save to Supabase (upsert: update interests if phone already exists)
    const { error: dbError } = await supabase
      .from("whatsapp_subscribers")
      .upsert(
        {
          phone: normalizedPhone,
          interests: filteredInterests,
          is_active: true,
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: "phone" }
      );

    if (dbError) {
      console.error("[WhatsApp Subscribe] DB error:", dbError);
      return NextResponse.json(
        { error: "Error al guardar suscripcion" },
        { status: 500 }
      );
    }

    // Get total subscriber count
    const { count } = await supabase
      .from("whatsapp_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    console.log("[WhatsApp Subscribe] OK:", {
      phone: normalizedPhone,
      interests: filteredInterests,
    });

    return NextResponse.json({
      success: true,
      message: "Suscripcion confirmada",
      subscriberCount: count || 0,
    });
  } catch (error: unknown) {
    console.error("WhatsApp subscribe error:", error);
    return NextResponse.json(
      { error: "Error al procesar suscripcion" },
      { status: 500 }
    );
  }
}
