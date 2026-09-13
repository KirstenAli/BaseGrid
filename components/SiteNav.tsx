import Link from "next/link";
import { Brand } from "./Brand";

export function SiteNav({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className="site-header">
      <Link href="/" aria-label="BaseGrid home"><Brand /></Link>
      {!minimal && <nav className="nav-links" aria-label="Primary navigation">
        <Link href="/#services">Services</Link><Link href="/#capacity">Capacity</Link><Link href="/#plans">Plans</Link>
      </nav>}
      <div className="nav-actions">
        <a className="text-link" href="/api/openstack/login">Log in</a>
        <Link className="button button--small" href="/register">Get started <span aria-hidden="true">↗</span></Link>
      </div>
    </header>
  );
}
