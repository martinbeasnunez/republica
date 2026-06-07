import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { phone, interests } = await req.json();

    // Validate phone — supports Peru (+51 9XXXXXXXX) and Colombia (+57 3XXXXXXXXX)
    const cleanPhone = phone?.replace(/[\s\-()]/g, "");
    const isPeru = /^\+?51\d{9}$/.test(cleanPhone || "");
    const isColombia = /^\+?57\d{10}$/.test(cleanPhone || "");

    if (!cleanPhone || (!isPeru && !isColombia)) {
      return NextResponse.json(
        {
          error:
            "Numero de telefono invalido. Usa formato peruano (+51 9XX XXX XXX) o colombiano (+57 3XX XXX XXXX)",
        },
        { status: 400 }
      );
    }

    // Normalize: ensure leading '+'
    const normalizedPhone = cleanPhone.startsWith("+")
      ? cleanPhone
      : `+${cleanPhone}`;

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
