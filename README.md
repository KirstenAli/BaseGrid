# BaseGrid

BaseGrid is a polished proof-of-concept portal for a four-tenant, single-node OpenStack cloud. It includes a public product site, quota-aware registration, a tenant control centre, quota-tier changes, a mock Horizon login and a persistent D1 account ledger.

## Capacity model

The physical host provides 32 GB RAM, 2 TB storage and 64 hardware threads. BaseGrid reserves 8 GB RAM, 500 GB storage and 16 threads for the host and OpenStack services. The remaining 24 GB, 1.5 TB and 48 threads are divided across four compatible quota tiers; even four Grid L allocations fit the physical envelope. Each tier also sets Nova, Cinder, Neutron, Octavia and Designate limits to control project sprawl.

## Local development

```bash
npm install
npm run dev
```

The checked-in `.env.example` defaults to `OPENSTACK_MODE=mock`. Registration forwards the chosen password to the provisioning adapter but never persists it. Set the following hosted secrets to connect a real provisioning gateway:

- `OPENSTACK_MODE=live`
- `OPENSTACK_API_URL`
- `OPENSTACK_API_TOKEN`
- `OPENSTACK_DASHBOARD_URL`

The live adapter expects `POST /v1/tenants` for provisioning and `PATCH /v1/tenants/:projectId/quota` for later quota updates. Keep Keystone administrator credentials behind that gateway rather than in browser code.

## Verification

```bash
npm test
npm run build
```

The D1 schema and its initial SQL migration live in `db/schema.ts` and `drizzle/0000_basegrid.sql`.
