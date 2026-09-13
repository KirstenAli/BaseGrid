export const HOST = Object.freeze({ memoryGb: 32, storageGb: 2000, threads: 64, seats: 4 });
export const RESERVED = Object.freeze({ memoryGb: 8, storageGb: 500, threads: 16 });
export const ALLOCATABLE = Object.freeze({ memoryGb: 24, storageGb: 1500, threads: 48 });

export const PLANS = Object.freeze([
  { id: "launch", name: "Launch", eyebrow: "For prototypes", vcpus: 4, memoryGb: 4, storageGb: 200, highlight: false },
  { id: "scale", name: "Scale", eyebrow: "For steady workloads", vcpus: 8, memoryGb: 6, storageGb: 300, highlight: true },
  { id: "pro", name: "Pro", eyebrow: "For compute-heavy work", vcpus: 12, memoryGb: 6, storageGb: 375, highlight: false },
]);

export const planById = (id) => PLANS.find((plan) => plan.id === id);
export const isValidPlan = (id) => Boolean(planById(id));

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
