import assert from "node:assert/strict";
import test from "node:test";
import { ALLOCATABLE, HOST, PLANS, fitsCapacity, remainingCapacity } from "../lib/plans.mjs";

test("four Pro tenants fit inside allocatable host capacity", () => {
  const pro = PLANS.find((plan) => plan.id === "pro");
  const total = { seats: 4, vcpus: pro.vcpus * 4, memoryGb: pro.memoryGb * 4, storageGb: pro.storageGb * 4 };
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

test("plans increase monotonically without exceeding a quarter-host share", () => {
  assert.deepEqual(PLANS.map((plan) => plan.vcpus), [4, 8, 12]);
  assert.ok(PLANS.every((plan) => plan.memoryGb <= ALLOCATABLE.memoryGb / HOST.seats));
  assert.ok(PLANS.every((plan) => plan.storageGb <= ALLOCATABLE.storageGb / HOST.seats));
});
