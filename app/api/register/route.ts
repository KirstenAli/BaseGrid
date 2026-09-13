import { createAccount, findUser, getUsage } from "@/db";
import { fitsCapacity, planById } from "@/lib/plans.mjs";
import { provisionUser } from "@/lib/openstack";

type Payload = { firstName?: string; lastName?: string; organisation?: string; email?: string; password?: string; planId?: string };

export async function POST(request: Request) {
  try {
    const payload = clean(await request.json() as Payload);
    const error = validate(payload);
    if (error) return reply({ error }, 400);
    if (await findUser(payload.email)) return reply({ error: "An account already exists for this email." }, 409);
    const plan = planById(payload.planId)!;
    if (!fitsCapacity(summarise(await getUsage()), plan)) return reply({ error: "That quota tier no longer fits the available host capacity." }, 409);
    const openstack = await provisionUser({ email: payload.email, password: payload.password, name: `${payload.firstName} ${payload.lastName}`, organisation: payload.organisation, quota: quotaOf(plan) });
    const user = await createAccount({ id: crypto.randomUUID(), email: payload.email, first_name: payload.firstName, last_name: payload.lastName, organisation: payload.organisation, plan_id: plan.id, openstack_user_id: openstack.userId, openstack_project_id: openstack.projectId });
    return reply({ user, mode: openstack.mode }, 201);
  } catch (error) {
    console.error("Registration failed", error instanceof Error ? error.message : "Unknown error");
    return reply({ error: "Provisioning could not be completed. Please try again." }, 500);
  }
}

const reply = (body: unknown, status: number) => Response.json(body, { status });
function quotaOf(plan: NonNullable<ReturnType<typeof planById>>) {
  const { id: _id, name: _name, profile: _profile, eyebrow: _eyebrow, highlight: _highlight, ...quota } = plan;
  return quota;
}

function clean(payload: Payload) {
  return { firstName: payload.firstName?.trim() || "", lastName: payload.lastName?.trim() || "", organisation: payload.organisation?.trim() || "", email: payload.email?.trim().toLowerCase() || "", password: payload.password || "", planId: payload.planId || "" };
}

function validate(payload: ReturnType<typeof clean>) {
  if (!payload.firstName || !payload.lastName || !payload.email) return "Name and email are required.";
  if (!/^\S+@\S+\.\S+$/.test(payload.email)) return "Enter a valid email address.";
  if (payload.password.length < 10) return "Use at least 10 characters for your OpenStack password.";
  if (!planById(payload.planId)) return "Select a valid project quota tier.";
  return "";
}

function summarise(rows: { plan_id: string }[]) {
  return rows.reduce((total, row) => { const plan = planById(row.plan_id); return plan ? { seats: total.seats + 1, vcpus: total.vcpus + plan.vcpus, memoryGb: total.memoryGb + plan.memoryGb, storageGb: total.storageGb + plan.storageGb } : total; }, { seats: 0, vcpus: 0, memoryGb: 0, storageGb: 0 });
}
