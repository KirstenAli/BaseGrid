import Link from "next/link";
import { PLANS } from "@/lib/plans.mjs";

export function PlanCards() {
  return <div className="plan-grid">{PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</div>;
}

function PlanCard({ plan }: { plan: (typeof PLANS)[number] }) {
  return (
    <article className={`plan-card ${plan.highlight ? "plan-card--featured" : ""}`}>
      <div><span className="plan-card__eyebrow">{plan.eyebrow}</span>{plan.highlight && <span className="badge">Most balanced</span>}</div>
      <h3>{plan.name}</h3><p>No payment required during the proof of concept.</p>
      <dl><Quota value={plan.vcpus} label="vCPU" /><Quota value={`${plan.memoryGb} GB`} label="RAM" /><Quota value={`${plan.storageGb} GB`} label="Storage" /></dl>
      <Link className={plan.highlight ? "button" : "button button--outline"} href={`/register?plan=${plan.id}`}>Select {plan.name} <span aria-hidden="true">→</span></Link>
    </article>
  );
}

function Quota({ value, label }: { value: string | number; label: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}
