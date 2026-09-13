"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function MockOpenStackPage() {
  const [notice, setNotice] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); setNotice("Mock Horizon accepted the demo login. Connect a live endpoint to continue into OpenStack."); };
  return <main className="horizon-page"><header><span className="horizon-logo"><i />OPENSTACK</span><span>BaseGrid Region One</span></header><section className="horizon-login"><div><span className="mock-ribbon">LOCAL MOCK</span><h1>Log in to the dashboard</h1><p>This screen stands in for OpenStack Horizon during macOS development. Use the credentials created during BaseGrid registration.</p><form onSubmit={submit}><label>Domain<input defaultValue="default" /></label><label>User name<input type="email" defaultValue={typeof window === "undefined" ? "" : localStorage.getItem("basegrid_account_email") || ""} /></label><label>Password<input type="password" /></label>{notice && <p className="horizon-notice" role="status">{notice}</p>}<button>Connect to OpenStack</button></form><Link href="/dashboard">← Return to BaseGrid</Link></div></section></main>;
}
