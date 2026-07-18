"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AdminUser, Deal, InventoryItem, Listing, UserRole } from "@/lib/admin-api"

type Change = (path:string, body:unknown, method?:string)=>Promise<void>

export function UsersPanel({ items, change }: { items: AdminUser[]; change: Change }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users and access</CardTitle>
        <CardDescription>
          Approve professional accounts, manage multiple roles and control account access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((user) => (
          <div key={user._id} className="rounded-2xl border bg-background/35 p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{user.name}</p>
                  <Status value={user.verificationStatus} />
                  <Status value={user.accountStatus ?? "active"} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {user.phoneNumber} · {user.email || "No email"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(user.roles?.length ? user.roles : [user.role]).map((role) => (
                    <Badge key={role} variant={role === user.role ? "default" : "outline"}>
                      {roleLabel(role)}{role === user.role ? " · active" : ""}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[470px]">
                <div>
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Verification</p>
                  <Select
                    value={user.verificationStatus}
                    onValueChange={(value) =>
                      value && void change(`/admin/users/${user._id}/verification`, { status: value })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Account status</p>
                  <Select
                    value={user.accountStatus ?? "active"}
                    onValueChange={(value) =>
                      value && void change(`/admin/users/${user._id}/account-status`, { status: value })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="deleted">Soft deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="mb-3 text-xs font-semibold text-muted-foreground">Approved roles</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {userRoles.map((role) => {
                  const currentRoles = user.roles?.length ? user.roles : [user.role]
                  const checked = currentRoles.includes(role)
                  return (
                    <label key={role} className="flex cursor-pointer items-center gap-2 rounded-xl border bg-background/40 px-3 py-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) => {
                          const roles = next
                            ? [...new Set([...currentRoles, role])]
                            : currentRoles.filter((item) => item !== role)
                          if (roles.length) void change(`/admin/users/${user._id}/roles`, { roles })
                        }}
                      />
                      <span>{roleLabel(role)}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const userRoles: UserRole[] = [
  "farmer",
  "buyer",
  "wholesaleBuyer",
  "studentVolunteer",
  "agent",
  "agricultureSpecialist",
  "veterinaryDoctor",
  "seller",
  "machinerySeller",
  "medicineSeller",
  "publicUser",
  "governmentOfficer",
  "support",
  "admin",
  "superAdmin",
]

function roleLabel(role: UserRole) {
  return role.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())
}
const statuses = ["draft", "pendingOtp", "published", "reserved", "sold", "expired", "cancelled", "rejected"]
export function ListingsPanel({items,change}:{items:Listing[];change:Change}) { return <Card><CardHeader><CardTitle>All listings</CardTitle><CardDescription>Review and control every marketplace listing.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Good</TableHead><TableHead>Owner</TableHead><TableHead>Quantity</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{items.map(x=><TableRow key={x._id}><TableCell><b>{x.goodName}</b><div className="text-xs text-muted-foreground">{x.address||x.goodCode}</div></TableCell><TableCell className="font-mono text-xs">{short(x.ownerId)}</TableCell><TableCell>{x.quantity} {x.unit}</TableCell><TableCell>{money(x.minimumPrice)}</TableCell><TableCell><Select value={x.status} onValueChange={v=>v&&void change(`/admin/listings/${x._id}`,{status:v})}><SelectTrigger className="w-36"><SelectValue/></SelectTrigger><SelectContent>{statuses.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></TableCell></TableRow>)}</TableBody></Table></CardContent></Card> }

export function DealsPanel({items,change}:{items:Deal[];change:Change}) { return <Card><CardHeader><CardTitle>Deals</CardTitle><CardDescription>Transaction value and fulfillment status.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Deal</TableHead><TableHead>Parties</TableHead><TableHead>Quantity</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{items.map(x=><TableRow key={x._id}><TableCell className="font-mono text-xs">{short(x._id)}</TableCell><TableCell>Buyer {short(x.buyerId)}<div className="text-xs text-muted-foreground">Farmer {short(x.farmerId)}</div></TableCell><TableCell>{x.quantity} Ã— {money(x.unitPrice)}</TableCell><TableCell className="font-semibold">{money(x.totalPrice)}</TableCell><TableCell><Select value={x.status} onValueChange={v=>v&&void change(`/admin/deals/${x._id}`,{status:v})}><SelectTrigger className="w-32"><SelectValue/></SelectTrigger><SelectContent>{["confirmed","completed","cancelled","disputed"].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></TableCell></TableRow>)}</TableBody></Table></CardContent></Card> }

export function InventoryPanel({items,change}:{items:InventoryItem[];change:Change}) { return <Card><CardHeader><CardTitle>Seller inventory</CardTitle><CardDescription>Stock, prices and shop visibility.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Shop</TableHead><TableHead>Product</TableHead><TableHead>Stock</TableHead><TableHead>Price</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{items.map(x=><TableRow key={x._id}><TableCell><b>{x.shopName}</b><div className="text-xs text-muted-foreground">{x.address}</div></TableCell><TableCell>{x.medicineName}<div><Badge variant="outline">{x.type}</Badge></div></TableCell><TableCell>{x.stockQuantity} {x.unit}</TableCell><TableCell>{money(x.price)}</TableCell><TableCell className="text-right"><Button size="sm" variant={x.active?"outline":"default"} onClick={()=>void change(`/admin/inventory/${x._id}`,{active:!x.active})}>{x.active?"Disable":"Enable"}</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card> }

function Status({value}:{value:string}) { return <Badge variant={value==="approved"||value==="active"?"default":value==="rejected"?"destructive":"secondary"}>{value}</Badge> }
function money(value:number){return new Intl.NumberFormat("en-BD",{style:"currency",currency:"BDT",maximumFractionDigits:0}).format(value||0)}
function short(value:string){return value.length>12?`${value.slice(0,6)}â€¦${value.slice(-4)}`:value}

