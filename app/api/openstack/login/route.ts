import { dashboardUrl } from "@/lib/openstack";

export function GET(request: Request) {
  return Response.redirect(new URL(dashboardUrl(), request.url), 302);
}
