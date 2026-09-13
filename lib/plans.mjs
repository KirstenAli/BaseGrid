export const HOST = Object.freeze({ memoryGb: 32, storageGb: 2000, threads: 64, seats: 4 });
export const RESERVED = Object.freeze({ memoryGb: 8, storageGb: 500, threads: 16 });
export const ALLOCATABLE = Object.freeze({ memoryGb: 24, storageGb: 1500, threads: 48 });

export const PLANS = Object.freeze([
  quotaPlan("grid-s", "Grid S", "Development", 4, 4, 200, [3, 4, 4, 2, 4, 1, 20, 2, 5, 40, 5, 2, 1, 3, 3, 10, 2]),
  quotaPlan("grid-m", "Grid M", "General purpose", 8, 6, 300, [6, 8, 8, 4, 8, 2, 50, 4, 10, 80, 10, 4, 2, 6, 6, 25, 5], true),
  quotaPlan("grid-l", "Grid L", "High capacity", 12, 6, 375, [10, 12, 12, 6, 12, 3, 80, 6, 15, 120, 20, 6, 3, 10, 10, 50, 10]),
]);

const LEGACY_IDS = Object.freeze({ launch: "grid-s", scale: "grid-m", pro: "grid-l" });
export const canonicalPlanId = (id) => LEGACY_IDS[id] || id;
export const planById = (id) => PLANS.find((plan) => plan.id === canonicalPlanId(id));
export const isValidPlan = (id) => Boolean(planById(id));

function quotaPlan(id, name, profile, vcpus, memoryGb, storageGb, limits, highlight = false) {
  const [instances, volumes, snapshots, backups, subnets, routers, ports, floatingIps, securityGroups, securityGroupRules, keyPairs, serverGroups, loadBalancers, listeners, pools, members, dnsZones] = limits;
  return Object.freeze({ id, name, profile, eyebrow: profile, vcpus, memoryGb, storageGb, instances, volumes, snapshots, backups, networks: Math.ceil(subnets / 2), subnets, routers, ports, floatingIps, securityGroups, securityGroupRules, keyPairs, serverGroups, loadBalancers, listeners, pools, members, dnsZones, highlight });
}

export function fitsCapacity(usage, plan) {
  if (!plan || usage.seats >= HOST.seats) return false;
  return usage.vcpus + plan.vcpus <= ALLOCATABLE.threads
    && usage.memoryGb + plan.memoryGb <= ALLOCATABLE.memoryGb
    && usage.storageGb + plan.storageGb <= ALLOCATABLE.storageGb;
}

export function remainingCapacity(usage) {
  return {
    vcpus: ALLOCATABLE.threads - usage.vcpus,
    memoryGb: ALLOCATABLE.memoryGb - usage.memoryGb,
    storageGb: ALLOCATABLE.storageGb - usage.storageGb,
    seats: HOST.seats - usage.seats,
  };
}
