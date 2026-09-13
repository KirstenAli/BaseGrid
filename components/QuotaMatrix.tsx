import { PLANS } from "@/lib/plans.mjs";

type Plan = (typeof PLANS)[number];

export function QuotaMatrix({ plan, compact = false }: { plan: Plan; compact?: boolean }) {
  return <div className={`quota-matrix ${compact ? "quota-matrix--compact" : ""}`}><QuotaGroup title="Compute" rows={[["Instances", plan.instances], ["vCPU", plan.vcpus], ["RAM", `${plan.memoryGb} GB`], ["Key pairs", plan.keyPairs], ["Server groups", plan.serverGroups]]} /><QuotaGroup title="Storage" rows={[["Volume capacity", `${plan.storageGb} GB`], ["Volumes", plan.volumes], ["Snapshots", plan.snapshots], ["Backups", plan.backups]]} /><QuotaGroup title="Networking" rows={[["Networks", plan.networks], ["Subnets", plan.subnets], ["Routers", plan.routers], ["Ports", plan.ports], ["Floating IPs", plan.floatingIps]]} /><QuotaGroup title="Security & delivery" rows={[["Security groups", plan.securityGroups], ["Security rules", plan.securityGroupRules], ["Load balancers", plan.loadBalancers], ["Listeners", plan.listeners], ["Pools", plan.pools], ["Pool members", plan.members], ["DNS zones", plan.dnsZones]]} /></div>;
}

function QuotaGroup({ title, rows }: { title: string; rows: Array<[string, string | number]> }) {
  return <section><h3>{title}</h3><dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}
