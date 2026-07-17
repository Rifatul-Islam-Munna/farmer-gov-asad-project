import { notFound } from "next/navigation"

const supportedRoles = new Set([
  "farmer",
  "buyer",
  "wholesale-buyer",
  "seller",
  "machinery-seller",
  "medicine-seller",
  "agent",
  "agriculture-specialist",
  "veterinary-doctor",
  "government-officer",
  "support",
])

const roleTitles: Record<string, string> = {
  farmer: "Farmer dashboard",
  buyer: "Buyer dashboard",
  "wholesale-buyer": "Wholesale buyer dashboard",
  seller: "Seller dashboard",
  "machinery-seller": "Machinery seller dashboard",
  "medicine-seller": "Medicine seller dashboard",
  agent: "Agent dashboard",
  "agriculture-specialist": "Agriculture specialist dashboard",
  "veterinary-doctor": "Veterinary doctor dashboard",
  "government-officer": "Government officer dashboard",
  support: "Support dashboard",
}

export default async function RoleDashboardPage({
  params,
}: {
  params: Promise<{ role: string }>
}) {
  const { role } = await params
  if (!supportedRoles.has(role)) notFound()

  return (
    <main className="min-h-screen p-6 md:p-10">
      <section className="glass-panel mx-auto max-w-6xl rounded-3xl p-6 md:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          AgriVision AI
        </p>
        <h1 className="mt-3 text-3xl font-semibold md:text-5xl">{roleTitles[role]}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          This role workspace route is ready. Feature modules will be added under this dashboard without placing every role inside the admin route.
        </p>
      </section>
    </main>
  )
}
