import { notFound } from "next/navigation"

import { RoleWorkspace, type WorkspaceRole } from "@/components/dashboard/role-workspace"

const supportedRoles = new Set<WorkspaceRole>([
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

export default async function RoleDashboardPage({
  params,
}: {
  params: Promise<{ role: string }>
}) {
  const { role } = await params
  if (!supportedRoles.has(role as WorkspaceRole)) notFound()
  return <RoleWorkspace role={role as WorkspaceRole} />
}
