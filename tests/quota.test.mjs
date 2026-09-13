import assert from "node:assert/strict";
import test from "node:test";
import { ALLOCATABLE, HOST, PLANS, fitsCapacity, planById, remainingCapacity } from "../lib/plans.mjs";

test("four Grid L tenants fit inside allocatable host capacity", () => {
  const largest = planById("grid-l");
  const total = { seats: 4, vcpus: largest.vcpus * 4, memoryGb: largest.memoryGb * 4, storageGb: largest.storageGb * 4 };
  assert.deepEqual(total, { seats: HOST.seats, vcpus: ALLOCATABLE.threads, memoryGb: ALLOCATABLE.memoryGb, storageGb: ALLOCATABLE.storageGb });
});

test("a fifth tenant is rejected even when smaller resources remain", () => {
  const usage = { seats: 4, vcpus: 16, memoryGb: 16, storageGb: 800 };
  assert.equal(fitsCapacity(usage, PLANS[0]), false);
});

test("remaining capacity reports each physical constraint", () => {
  const remaining = remainingCapacity({ seats: 1, vcpus: 8, memoryGb: 6, storageGb: 300 });
  assert.deepEqual(remaining, { seats: 3, vcpus: 40, memoryGb: 18, storageGb: 1200 });
});

test("tiers increase monotonically across key OpenStack limits", () => {
  for (const key of ["vcpus", "instances", "volumes", "networks", "ports", "floatingIps", "securityGroupRules", "loadBalancers"]) {
    assert.deepEqual(PLANS.map((plan) => plan[key]), [...PLANS.map((plan) => plan[key])].sort((a, b) => a - b));
  }
});

test("legacy package ids resolve to their replacement quota tiers", () => {
  assert.equal(planById("launch").id, "grid-s");
  assert.equal(planById("scale").id, "grid-m");
  assert.equal(planById("pro").id, "grid-l");
});
