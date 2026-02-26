"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { WhatsAppFAB } from "@/components/dashboard/whatsapp-fab";
import { AINotificationToast } from "@/components/dashboard/ai-notification-toast";
import { useAnalytics } from "@/hooks/use-analytics";
import { CountryProvider } from "@/lib/config/country-context";
import { isValidCountry, type CountryCode } from "@/lib/config/countries";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ country: string }>();
  const country = params.country;

  if (!isValidCountry(country)) {
    notFound();
  }

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useAnalytics(); // Track page views automatically

  return (
    <CountryProvider country={country as CountryCode}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
        <div className="flex flex-1 flex-col lg:pl-[240px] overflow-x-hidden">
          <Header onMobileMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
        <WhatsAppFAB />
        <AINotificationToast />
      </div>
    </CountryProvider>
  );
}
