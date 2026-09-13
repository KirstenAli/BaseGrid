import { findUser, getAccount, getUsage, savePlanChange } from "@/db";
import { fitsCapacity, planById } from "@/lib/plans.mjs";
import { updateQuota } from "@/lib/openstack";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email")?.toLowerCase() || "";
  const account = email ? await getAccount(email) : null;
  return account ? Response.json(account) : Response.json({ error: "Account not found." }, { status: 404 });
}

export async function PATCH(request: Request) {
  try {
    const { email, planId } = await request.json() as { email?: string; planId?: string };
    const user = email ? await findUser(email.toLowerCase()) : null;
    const plan = planById(planId || "");
    if (!user || !plan) return Response.json({ error: "Account or quota tier not found." }, { status: 404 });
    if (!fitsCapacity(summarise(await getUsage(user.id)), plan)) return Response.json({ error: "That quota tier exceeds current capacity." }, { status: 409 });
    await updateQuota(user.openstack_project_id, quotaOf(plan));
    return Response.json(await savePlanChange(user, plan.id));
  } catch {
    return Response.json({ error: "The quota change could not be applied." }, { status: 500 });
  }
}

function quotaOf(plan: NonNullable<ReturnType<typeof planById>>) {
  const { id: _id, name: _name, profile: _profile, eyebrow: _eyebrow, highlight: _highlight, ...quota } = plan;
  return quota;
}

function summarise(rows: { plan_id: string }[]) {
  return rows.reduce((total, row) => { const plan = planById(row.plan_id); return plan ? { seats: total.seats + 1, vcpus: total.vcpus + plan.vcpus, memoryGb: total.memoryGb + plan.memoryGb, storageGb: total.storageGb + plan.storageGb } : total; }, { seats: 0, vcpus: 0, memoryGb: 0, storageGb: 0 });
}
