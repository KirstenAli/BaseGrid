"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Brand } from "@/components/Brand";
import { QuotaMatrix } from "@/components/QuotaMatrix";
import { PLANS, planById } from "@/lib/plans.mjs";

type Account = { user: { email: string; first_name: string; last_name: string; organisation: string; plan_id: string; openstack_project_id: string; created_at: string }; changes: { results: Array<{ id: string; from_plan_id: string | null; to_plan_id: string; created_at: string }> }; payments: { results: Array<{ id: string; amount_pence: number; currency: string; status: string; created_at: string }> } };

export default function DashboardPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [status, setStatus] = useState({ loading: true, error: "", changing: "" });
  const email = useMemo(accountEmail, []);
  useEffect(() => { if (email) loadAccount(email, setAccount, setStatus); else setStatus({ loading: false, error: "No POC account is selected.", changing: "" }); }, [email]);

  async function changePlan(planId: string) {
    setStatus({ loading: false, error: "", changing: planId });
    const response = await fetch("/api/account", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, planId }) });
    const result = await response.json() as Account & { error?: string };
    if (!response.ok) return setStatus({ loading: false, error: result.error || "Quota update failed.", changing: "" });
    setAccount(result); setStatus({ loading: false, error: "", changing: "" });
  }

  if (status.loading) return <LoadingState />;
  if (!account) return <MissingState message={status.error} />;
  const plan = planById(account.user.plan_id)!;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header"><Link href="/"><Brand /></Link><div><span className="environment-pill"><i /> POC ENVIRONMENT</span><a href="/api/openstack/login">Open Horizon ↗</a><span className="avatar">{initials(account)}</span></div></header>
      <aside className="dashboard-sidebar"><nav><a className="active" href="#overview"><span>⌁</span>Overview</a><a href="#quota"><span>◫</span>Project quota</a><a href="#activity"><span>↻</span>Activity</a><a href="#billing"><span>◇</span>Billing</a></nav><div className="sidebar-bottom"><span>PROJECT</span><strong>{shortId(account.user.openstack_project_id)}</strong><small>OpenStack tenant</small></div></aside>
      <section className="dashboard-content" id="overview">
        <div className="dashboard-title"><div><p className="eyebrow">CONTROL CENTRE</p><h1>Good evening, {account.user.first_name}.</h1><p>Your BaseGrid tenant is online and operating within its {plan.name} allocation.</p></div><a className="button" href="/api/openstack/login">Launch OpenStack <span>↗</span></a></div>
        {status.error && <p className="form-error" role="alert">{status.error}</p>}
        <div className="status-strip"><div><span className="status-dot" /><p><strong>All systems operational</strong><small>Mock control plane · Updated now</small></p></div><span>STATUS / 200</span></div>
        <div className="usage-grid"><UsageCard label="Compute" used="3" total={plan.vcpus} unit="vCPU" percent={Math.min(82, Math.round(300 / plan.vcpus))} code="NOVA" /><UsageCard label="Memory" used="2.7" total={plan.memoryGb} unit="GB" percent={Math.round(270 / plan.memoryGb)} code="NOVA" /><UsageCard label="Block storage" used="82" total={plan.storageGb} unit="GB" percent={Math.round(8200 / plan.storageGb)} code="CINDER" /></div>
        <div className="dashboard-grid">
          <article className="panel quota-panel" id="quota"><div className="panel-heading"><div><span>PROJECT QUOTA</span><h2>{plan.name} · {plan.profile}</h2></div><small>Limits apply across OpenStack services</small></div><div className="quota-options">{PLANS.map((option) => <button key={option.id} className={option.id === plan.id ? "quota-option quota-option--active" : "quota-option"} disabled={Boolean(status.changing) || option.id === plan.id} onClick={() => changePlan(option.id)}><span>{option.name}{option.id === plan.id && <i>CURRENT</i>}</span><strong>{option.instances} instances · {option.vcpus} vCPU · {option.memoryGb} GB</strong><small>{status.changing === option.id ? "Applying…" : option.id === plan.id ? option.profile : "Switch quota →"}</small></button>)}</div><QuotaMatrix plan={plan} /><p className="panel-note">Compute, storage, network, security and delivery limits are sent together. Physical host headroom is checked before any change is applied.</p></article>
          <article className="panel activity-panel" id="activity"><div className="panel-heading"><div><span>RECENT ACTIVITY</span><h2>Audit trail</h2></div></div><div className="activity-list">{account.changes.results.map((change) => <div key={change.id}><i>↻</i><p><strong>{change.from_plan_id ? "Quota tier updated" : "Tenant provisioned"}</strong><small>{change.from_plan_id ? `${title(change.from_plan_id)} → ${title(change.to_plan_id)}` : `${title(change.to_plan_id)} quota applied`}</small></p><time>{formatDate(change.created_at)}</time></div>)}</div></article>
        </div>
        <article className="panel billing-panel" id="billing"><div><span>POC BILLING</span><h2>No payment method required.</h2><p>Your account ledger is ready for a future billing integration, while every proof-of-concept record remains at £0.00.</p></div><div><strong>£0.00</strong><small>CURRENT BALANCE</small><span>POC credit active</span></div></article>
      </section>
    </main>
  );
}

function UsageCard({ label, used, total, unit, percent, code }: { label: string; used: string; total: number; unit: string; percent: number; code: string }) {
  return <article className="usage-card"><div><span>{label}</span><small>{code}</small></div><p><strong>{used}</strong><span> / {total} {unit}</span></p><i><b style={{ width: `${percent}%` }} /></i><footer><span>{percent}% allocated</span><span>{Math.max(0, total - Number(used)).toFixed(1)} {unit} free</span></footer></article>;
}

function LoadingState() { return <main className="state-page"><Brand /><div className="state-spinner" /><p>Loading your control centre…</p></main>; }
function MissingState({ message }: { message: string }) { return <main className="state-page"><Brand /><h1>No account selected.</h1><p>{message}</p><Link className="button" href="/register">Create a POC account</Link></main>; }
function accountEmail() { if (typeof window === "undefined") return ""; return new URLSearchParams(window.location.search).get("email") || localStorage.getItem("basegrid_account_email") || ""; }
function initials(account: Account) { return `${account.user.first_name[0] || "B"}${account.user.last_name[0] || "G"}`.toUpperCase(); }
function shortId(id: string) { return id.length > 18 ? `${id.slice(0, 18)}…` : id; }
function title(id: string) { return planById(id)?.name || id; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

async function loadAccount(email: string, setAccount: (account: Account) => void, setStatus: (status: { loading: boolean; error: string; changing: string }) => void) {
  const response = await fetch(`/api/account?email=${encodeURIComponent(email)}`);
  const result = await response.json() as Account & { error?: string };
  if (response.ok) setAccount(result); else setStatus({ loading: false, error: result.error || "Account unavailable.", changing: "" });
  if (response.ok) setStatus({ loading: false, error: "", changing: "" });
}
