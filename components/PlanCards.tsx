import Link from "next/link";
import { PLANS } from "@/lib/plans.mjs";

export function PlanCards() {
  return <div className="plan-grid">{PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</div>;
}

function PlanCard({ plan }: { plan: (typeof PLANS)[number] }) {
  return (
    <article className={`plan-card ${plan.highlight ? "plan-card--featured" : ""}`}>
      <div><span className="plan-card__eyebrow">{plan.eyebrow}</span>{plan.highlight && <span className="badge">Most balanced</span>}</div>
      <h3>{plan.name}</h3><p>{plan.profile} project quota. No payment required during the POC.</p>
      <dl><Quota value={plan.instances} label="Instances" /><Quota value={`${plan.vcpus} / ${plan.memoryGb} GB`} label="vCPU / RAM" /><Quota value={`${plan.volumes} / ${plan.storageGb} GB`} label="Volumes / capacity" /><Quota value={`${plan.networks} / ${plan.routers}`} label="Networks / routers" /><Quota value={plan.floatingIps} label="Floating IPs" /><Quota value={plan.securityGroupRules} label="Security rules" /></dl>
      <Link className={plan.highlight ? "button" : "button button--outline"} href={`/register?plan=${plan.id}`}>Select {plan.name} <span aria-hidden="true">→</span></Link>
    </article>
  );
}

function Quota({ value, label }: { value: string | number; label: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}
