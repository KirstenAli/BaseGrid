import { env } from "cloudflare:workers";

type ProjectQuota = Record<string, number>;
type ProvisionInput = { email: string; password: string; name: string; organisation: string; quota: ProjectQuota };
type OpenStackResult = { userId: string; projectId: string; mode: "mock" | "live" };
type Runtime = { OPENSTACK_MODE?: string; OPENSTACK_API_URL?: string; OPENSTACK_API_TOKEN?: string; OPENSTACK_DASHBOARD_URL?: string };

const runtime = () => env as unknown as Runtime;
const mockId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 12)}`;

export async function provisionUser(input: ProvisionInput): Promise<OpenStackResult> {
  if (runtime().OPENSTACK_MODE !== "live") return { userId: mockId("usr"), projectId: mockId("prj"), mode: "mock" };
  const response = await callApi("/v1/tenants", "POST", input);
  return { userId: response.userId, projectId: response.projectId, mode: "live" };
}

export async function updateQuota(projectId: string, quota: ProjectQuota) {
  if (runtime().OPENSTACK_MODE !== "live") return { mode: "mock" as const };
  await callApi(`/v1/tenants/${projectId}/quota`, "PATCH", { quota });
  return { mode: "live" as const };
}

export const dashboardUrl = () => runtime().OPENSTACK_DASHBOARD_URL || "/mock-openstack";

async function callApi(path: string, method: string, body: unknown) {
  const response = await fetch(`${runtime().OPENSTACK_API_URL}${path}`, { method, headers: apiHeaders(), body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`OpenStack control API returned ${response.status}`);
  return response.json() as Promise<{ userId: string; projectId: string }>;
}

const apiHeaders = () => ({ "content-type": "application/json", authorization: `Bearer ${runtime().OPENSTACK_API_TOKEN || ""}` });
