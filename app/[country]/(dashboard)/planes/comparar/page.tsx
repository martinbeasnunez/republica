import { redirect } from "next/navigation";

export default async function CompararPlanesPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  redirect(`/${country}/planes`);
}
