import Link from "next/link";
import { Brand } from "@/components/Brand";
import { PlanCards } from "@/components/PlanCards";
import { SiteNav } from "@/components/SiteNav";
import { SERVICES } from "@/lib/services";

export default function Home() {
  return (
    <main>
      <SiteNav />
      <section className="hero shell">
        <div className="hero__copy">
          <p className="eyebrow"><span className="status-dot" /> Single-node private cloud</p>
          <h1>Cloud infrastructure,<br /><em>precisely allocated.</em></h1>
          <p className="hero__lede">BaseGrid makes OpenStack power accessible to a focused group of four. Private tenancy, transparent quotas and direct control—without hyperscale complexity.</p>
          <div className="hero__actions"><Link className="button" href="/register">Reserve your cloud <span>↗</span></Link><a className="button button--ghost" href="#services">Explore services <span>↓</span></a></div>
        </div>
        <CapacityConsole />
      </section>
      <div className="proof-bar"><span>OPENSTACK NATIVE</span><span>TENANT ISOLATED</span><span>4 FOUNDING SLOTS</span><span>POC ACCESS · £0</span></div>
      <section className="section shell" id="services">
        <SectionHeading index="01" eyebrow="The cloud toolkit" title="Open infrastructure. One considered platform." copy="Launch, connect, protect and observe workloads through a coherent OpenStack control plane. Services are enabled by deployment profile." />
        <div className="service-grid">{SERVICES.map((service, index) => <article className={`service-card service-card--${index % 4}`} key={service.code}><span className="service-card__index">{String(index + 1).padStart(2, "0")}</span><span className="service-card__code">{service.code}</span><h3>{service.name}</h3><p>{service.copy}</p><span className="service-card__arrow" aria-hidden="true">↗</span></article>)}</div>
      </section>
      <section className="section section--tint" id="capacity"><div className="shell">
        <SectionHeading index="02" eyebrow="Designed around reality" title="A private cloud with honest limits." copy="We reserve capacity for OpenStack and the host before allocating a single tenant resource. Every plan fits within the same physical envelope." />
        <div className="capacity-layout"><HostDiagram /><CapacityNotes /></div>
      </div></section>
      <section className="section shell" id="plans">
        <SectionHeading index="03" eyebrow="Project quota tiers" title="Choose limits that match your work." copy="Each tier covers compute, storage, networking, security and delivery resources. Change tier later; every update is capacity checked before it reaches OpenStack." />
        <PlanCards />
      </section>
      <section className="section shell"><div className="workflow-card">
        <div><p className="eyebrow">From zero to tenant</p><h2>Provisioned in three deliberate steps.</h2></div>
        <ol><li><span>01</span><div><strong>Select a quota</strong><p>Choose compute, memory and storage sized for your workload.</p></div></li><li><span>02</span><div><strong>Create your identity</strong><p>BaseGrid creates your tenant and OpenStack user together.</p></div></li><li><span>03</span><div><strong>Enter Horizon</strong><p>Log into the native OpenStack dashboard and start building.</p></div></li></ol>
      </div></section>
      <section className="final-cta"><div className="shell final-cta__inner"><div><span className="eyebrow">Capacity is intentionally limited</span><h2>Build on a cloud<br />that knows its boundaries.</h2></div><Link className="button button--light" href="/register">Claim a founding slot <span>↗</span></Link></div></section>
      <footer className="footer shell"><Brand compact /><p>Private OpenStack infrastructure.<br />Built with restraint.</p><div><a href="#services">Services</a><a href="#capacity">Capacity</a><a href="/api/openstack/login">Log in</a></div><span>© 2026 BASEGRID</span></footer>
    </main>
  );
}

function SectionHeading({ index, eyebrow, title, copy }: { index: string; eyebrow: string; title: string; copy: string }) {
  return <div className="section-heading"><span>{index}</span><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><p>{copy}</p></div>;
}

function CapacityConsole() {
  return <div className="console"><div className="console__top"><span>BASEGRID / HOST-01</span><span className="console__live"><i /> OPERATIONAL</span></div><div className="console__orb"><div className="console__orb-ring" /><div className="console__orb-value"><span>64</span><small>CPU THREADS</small></div></div><div className="console__metrics"><Meter label="Memory" value="32 GB" width="76%" /><Meter label="Storage" value="2.0 TB" width="64%" /><Meter label="Tenant slots" value="04" width="50%" /></div><div className="console__foot"><span>OPENSTACK</span><span>CONTROL PLANE READY</span></div></div>;
}

function Meter({ label, value, width }: { label: string; value: string; width: string }) {
  return <div className="meter"><div><span>{label}</span><strong>{value}</strong></div><i><b style={{ width }} /></i></div>;
}

function HostDiagram() {
  return <div className="host-diagram"><div className="host-diagram__head"><span>PHYSICAL HOST · BG-01</span><i>100%</i></div><div className="host-diagram__body"><div className="resource-block resource-block--system"><span>HOST + CONTROL PLANE</span><strong>RESERVED</strong><small>8 GB RAM · 16 threads · 500 GB</small></div><div className="tenant-grid"><div>TENANT 01<span>UP TO GRID L</span></div><div>TENANT 02<span>UP TO GRID L</span></div><div>TENANT 03<span>UP TO GRID L</span></div><div>TENANT 04<span>UP TO GRID L</span></div></div></div><div className="host-diagram__legend"><span><i className="legend-dot legend-dot--system" /> System reserve</span><span><i className="legend-dot" /> Allocatable</span></div></div>;
}

function CapacityNotes() {
  return <div className="capacity-notes"><div><span>ALLOCATABLE MEMORY</span><strong>24 <small>GB</small></strong><p>8 GB retained for the host and OpenStack control services.</p></div><div><span>ALLOCATABLE COMPUTE</span><strong>48 <small>threads</small></strong><p>16 of 64 hardware threads reserved for platform health.</p></div><div><span>ALLOCATABLE STORAGE</span><strong>1.5 <small>TB</small></strong><p>500 GB retained for images, services and operational headroom.</p></div><p className="capacity-note"><span>i</span> Quotas are ceilings, not guaranteed performance. Production planning should validate storage redundancy, CPU overcommit and workload contention.</p></div>;
}
