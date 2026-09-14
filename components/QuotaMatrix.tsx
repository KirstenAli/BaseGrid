"use client";

import { CSSProperties, useEffect, useState } from "react";
import { PLANS } from "@/lib/plans.mjs";

type Plan = (typeof PLANS)[number];
type QuotaRow = [string, string | number];
type ValueState = { current: string | number; previous: string | number | null };

export function QuotaMatrix({ plan, compact = false, animateValues = false }: { plan: Plan; compact?: boolean; animateValues?: boolean }) {
  const groups: Array<[string, QuotaRow[]]> = [["Compute", [["Instances", plan.instances], ["vCPU", plan.vcpus], ["RAM", `${plan.memoryGb} GB`], ["Key pairs", plan.keyPairs], ["Server groups", plan.serverGroups]]], ["Storage", [["Volume capacity", `${plan.storageGb} GB`], ["Volumes", plan.volumes], ["Snapshots", plan.snapshots], ["Backups", plan.backups]]], ["Networking", [["Networks", plan.networks], ["Subnets", plan.subnets], ["Routers", plan.routers], ["Ports", plan.ports], ["Floating IPs", plan.floatingIps]]], ["Security & delivery", [["Security groups", plan.securityGroups], ["Security rules", plan.securityGroupRules], ["Load balancers", plan.loadBalancers], ["Listeners", plan.listeners], ["Pools", plan.pools], ["Pool members", plan.members], ["DNS zones", plan.dnsZones]]]];
  return <div className={`quota-matrix ${compact ? "quota-matrix--compact" : ""}`}>{groups.map(([title, rows], index) => <QuotaGroup key={title} title={title} rows={rows} animate={animateValues} delay={index * 28} />)}</div>;
}

function QuotaGroup({ title, rows, animate, delay }: { title: string; rows: QuotaRow[]; animate: boolean; delay: number }) {
  return <section><h3>{title}</h3><dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><QuotaValue value={value} animate={animate} delay={delay} /></div>)}</dl></section>;
}

function QuotaValue({ value, animate, delay }: { value: string | number; animate: boolean; delay: number }) {
  return animate ? <AnimatedValue value={value} delay={delay} /> : <dd>{value}</dd>;
}

function AnimatedValue({ value, delay }: { value: string | number; delay: number }) {
  const [state, setState] = useState<ValueState>({ current: value, previous: null });
  useEffect(() => animateValue(setState, value, delay), [value, delay]);
  const changing = state.previous !== null;
  return <dd className={`quota-value ${changing ? "quota-value--changing" : ""}`} style={{ "--quota-delay": `${delay}ms` } as CSSProperties}>{changing && <span className="quota-value__previous" aria-hidden="true">{state.previous}</span>}<span className="quota-value__current">{state.current}</span></dd>;
}

function animateValue(setState: React.Dispatch<React.SetStateAction<ValueState>>, value: string | number, delay: number) {
  setState((state) => state.current === value ? state : { current: value, previous: state.current });
  const timer = window.setTimeout(() => setState((state) => ({ ...state, previous: null })), 500 + delay);
  return () => window.clearTimeout(timer);
}
