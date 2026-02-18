import { NextRequest, NextResponse } from "next/server";

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

    // Validate interests
    const validInterests = ["encuestas", "noticias", "alertas", "verificacion"];
    const filteredInterests = (interests || []).filter((i: string) =>
      validInterests.includes(i)
    );

    // Log subscription (for now — later connect to Twilio/DB)
    console.log("[WhatsApp Subscribe]", {
      phone: cleanPhone,
      interests: filteredInterests,
      timestamp: new Date().toISOString(),
    });

    // TODO: Save to database
    // TODO: Send WhatsApp confirmation via Twilio/Meta Cloud API

    return NextResponse.json({
      success: true,
      message: "Suscripcion confirmada",
    });
  } catch (error: unknown) {
    console.error("WhatsApp subscribe error:", error);
    return NextResponse.json(
      { error: "Error al procesar suscripcion" },
      { status: 500 }
    );
  }
}
