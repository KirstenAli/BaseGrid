"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Brand } from "@/components/Brand";
import { QuotaMatrix } from "@/components/QuotaMatrix";
import { PLANS, planById } from "@/lib/plans.mjs";

type FormState = { firstName: string; lastName: string; organisation: string; email: string; password: string; confirmPassword: string; planId: string; terms: boolean };
const initialForm: FormState = { firstName: "", lastName: "", organisation: "", email: "", password: "", confirmPassword: "", planId: "grid-m", terms: false };

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ loading: false, error: "" });
  useEffect(() => setPlanFromUrl(setForm), []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const error = clientError(form);
    if (error) return setStatus({ loading: false, error });
    setStatus({ loading: true, error: "" });
    const response = await fetch("/api/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json() as { error?: string };
    if (!response.ok) return setStatus({ loading: false, error: result.error || "Registration failed." });
    localStorage.setItem("basegrid_account_email", form.email.toLowerCase());
    window.location.assign(`/dashboard?email=${encodeURIComponent(form.email)}`);
  }

  const setField = (field: keyof FormState, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <main className="auth-page">
      <header className="auth-header"><Link href="/"><Brand /></Link><span>Already provisioned? <a href="/api/openstack/login">Log in to OpenStack ↗</a></span></header>
      <div className="auth-shell">
        <aside className="auth-aside"><div><p className="eyebrow">FOUNDER ACCESS · 01 OF 04</p><h1>Your private cloud starts with a clear boundary.</h1><p>Choose a quota, create your tenant identity and enter the native OpenStack dashboard. No payment details are required for this POC.</p></div><div className="auth-assurance"><span>01</span><p><strong>Credentials stay out of BaseGrid.</strong>Your password is passed to the provisioning adapter and is never written to our database.</p></div></aside>
        <section className="auth-form-wrap">
          <div className="form-heading"><span>ACCOUNT SETUP</span><strong>STEP 1 OF 1</strong></div>
          <form onSubmit={submit} className="registration-form">
            <fieldset><legend>Your details</legend><div className="fieldset-body"><div className="field-grid"><Field label="First name" value={form.firstName} onChange={(value) => setField("firstName", value)} autoComplete="given-name" /><Field label="Last name" value={form.lastName} onChange={(value) => setField("lastName", value)} autoComplete="family-name" /><Field label="Organisation" value={form.organisation} onChange={(value) => setField("organisation", value)} autoComplete="organization" optional /><Field label="Email address" type="email" value={form.email} onChange={(value) => setField("email", value)} autoComplete="email" /></div></div></fieldset>
            <fieldset><legend>OpenStack credentials</legend><div className="fieldset-body"><div className="field-grid"><Field label="Password" type="password" value={form.password} onChange={(value) => setField("password", value)} autoComplete="new-password" hint="10+ characters" /><Field label="Confirm password" type="password" value={form.confirmPassword} onChange={(value) => setField("confirmPassword", value)} autoComplete="new-password" /></div><p className="field-note"><span>↗</span> These credentials are passed once to OpenStack. BaseGrid stores your account, quota tier and change history—never the password.</p></div></fieldset>
            <fieldset><legend>Select your project quota</legend><div className="fieldset-body"><div className="register-plans">{PLANS.map((plan) => <label className={form.planId === plan.id ? "register-plan register-plan--selected" : "register-plan"} key={plan.id}><input type="radio" name="plan" value={plan.id} checked={form.planId === plan.id} onChange={() => setField("planId", plan.id)} /><div><span>{plan.name}</span><small>{plan.profile.toUpperCase()}</small></div><p>{plan.instances} instances · {plan.vcpus} vCPU · {plan.memoryGb} GB RAM</p><i>{form.planId === plan.id ? "●" : "○"}</i></label>)}</div><div className="selected-quota"><div><span>INCLUDED LIMITS</span><small>Applied across Nova, Cinder, Neutron, Octavia and Designate</small></div><QuotaMatrix plan={planById(form.planId)!} compact /></div></div></fieldset>
            <label className="checkbox"><input type="checkbox" checked={form.terms} onChange={(event) => setField("terms", event.target.checked)} /><span>I understand this is a proof of concept with shared physical capacity and no uptime guarantee.</span></label>
            {status.error && <p className="form-error" role="alert">{status.error}</p>}
            <button className="button registration-submit" disabled={status.loading}>{status.loading ? "Provisioning tenant…" : "Create account & tenant"}<span aria-hidden="true">↗</span></button>
            <p className="poc-label"><span className="status-dot" /> Local development uses the mocked OpenStack adapter.</p>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", hint, optional, autoComplete }: { label: string; value: string; onChange: (value: string) => void; type?: string; hint?: string; optional?: boolean; autoComplete?: string }) {
  return <label className="field"><span>{label} {optional && <small>OPTIONAL</small>}{hint && <small>{hint}</small>}</span><input required={!optional} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} /></label>;
}

function setPlanFromUrl(setForm: React.Dispatch<React.SetStateAction<FormState>>) {
  const requested = new URLSearchParams(window.location.search).get("plan");
  if (PLANS.some((plan) => plan.id === requested)) setForm((form) => ({ ...form, planId: requested! }));
}

function clientError(form: FormState) {
  if (form.password !== form.confirmPassword) return "The passwords do not match.";
  if (form.password.length < 10) return "Use at least 10 characters for your OpenStack password.";
  if (!form.terms) return "Confirm the POC capacity notice to continue.";
  return "";
}
