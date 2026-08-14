---
title: "Why Does My RCD Keep Tripping? Common Causes and Safe Fault-Finding Steps"
description: "An RCD that keeps tripping is usually detecting earth leakage, moisture, appliance faults, damaged cables, or nuisance leakage from multiple devices. This guide explains the causes and gives a safe step-by-step checklist for narrowing down the problem."
pubDate: 2026-05-25
author: ElectraSim
category: Electrical Safety
tags: [RCD tripping, RCD keeps tripping, earth leakage, nuisance tripping, electrical fault finding, RCBO tripping, consumer unit fault, appliance fault, electrical safety, BS 7671]
---

An RCD that keeps tripping is not just an inconvenience — it is a safety device telling you that current is leaking somewhere it should not. Sometimes the cause is simple: a faulty kettle, water in an outdoor socket, or a washing machine heater element breaking down. Other times it is a hidden wiring fault that needs professional testing.

This guide explains what an RCD is detecting, the most common reasons it trips, and the safest way to narrow down the faulty circuit or appliance without putting yourself at risk.

> **Safety note:** Never bypass, tape up, or replace an RCD with a non-RCD device to “stop nuisance tripping”. If it trips repeatedly, there is a cause. Find the cause.

---

## What an RCD Detects

An **RCD** (Residual Current Device) compares the current leaving the supply on the live conductor with the current returning on the neutral conductor. In a healthy circuit, these currents are equal.

If some current leaks away through another path — for example through a damaged appliance casing, a wet socket, or a person touching a live part — the live and neutral currents no longer balance. When the imbalance reaches the RCD trip threshold, usually **30 mA** in domestic installations, the RCD disconnects the circuit.

That imbalance is called **residual current** or **earth leakage**.

> Related: [What Is an RCD and Why Do You Need One?](/blog/what-is-an-rcd-and-why-do-you-need-one/)

---

## Quick Diagnosis Table

| Symptom | Most likely cause | What to check first |
|---|---|---|
| RCD trips when one appliance is plugged in | Appliance earth leakage | Unplug appliance and test another socket |
| RCD trips during rain | Outdoor socket, garden cable, exterior light | Isolate outdoor circuits and inspect for water ingress |
| RCD trips randomly | Combined leakage or intermittent appliance fault | Unplug appliances one by one |
| RCD trips immediately after reset | Hard earth fault or neutral-earth fault | Leave off and call an electrician |
| RCD trips when oven/washing machine heats | Heating element insulation breakdown | Appliance repair or replacement |
| RCD trips but MCB does not | Earth leakage, not overload | Look for leakage paths, moisture, appliances |

---

## Common Cause 1: Faulty Appliance

Appliances are the most common cause of RCD tripping. The circuit wiring may be fine; the appliance connected to it may be leaking current to earth.

Frequent culprits:

- **Kettles** — water ingress around the element base
- **Washing machines** — heater element insulation breakdown
- **Dishwashers** — water leaks onto internal wiring
- **Ovens** — heating element absorbs moisture or fails insulation resistance
- **Fridges/freezers** — compressor or defrost heater leakage
- **Outdoor tools** — damaged flex, damp motor windings

A failing appliance can still work normally while leaking enough current to trip the RCD. The RCD is not measuring whether the appliance runs; it is measuring whether current is escaping the intended live-neutral path.

---

## Common Cause 2: Moisture in Outdoor Sockets or Lights

RCD tripping after rain is a strong clue that water has entered an outdoor accessory or cable joint.

Check:

- Outdoor sockets with cracked lids or missing gaskets
- Garden lights with failed seals
- Junction boxes lying on soil or buried without gel filling
- SWA glands that are loose or not weatherproof
- Extension leads left outside

Outdoor accessories should be properly IP-rated. An exposed outdoor socket should normally be **IP65 minimum**, not just IP44.

> Related: [IP Rating Explained: IP44, IP65, IP67 and What Every Number Means](/blog/ip-rating-explained-ip44-ip65-ip67/)

> Related: [How to Wire an Outdoor Socket](/blog/how-to-wire-an-outdoor-socket-garden-power/)

---

## Common Cause 3: Neutral-to-Earth Fault

A neutral-to-earth fault can trip an RCD even when the circuit switch appears to be off. This happens because neutral is close to earth potential but still carries return current. If neutral touches earth downstream of the RCD, some return current can bypass the RCD's sensing coil, creating an imbalance.

Common causes:

- Damaged cable where neutral insulation is cut and touching CPC/earth
- Water-filled junction box connecting neutral to earth
- Incorrect wiring inside a socket or fused spur
- Neutral and earth touching inside an appliance

Neutral-earth faults are often confusing because the MCB may stay on while the RCD trips. The fault current is not necessarily high enough to trip an MCB — but the RCD detects the imbalance immediately.

---

## Common Cause 4: Cumulative Earth Leakage

Modern electronic appliances naturally leak tiny amounts of current to earth through filters and suppressors. One device may leak only 0.5–2 mA. Ten or fifteen devices on the same RCD can add up.

Common contributors:

- Computers and monitors
- Phone/laptop chargers
- Induction hobs
- Washing machines and dishwashers
- LED drivers
- Smart home power supplies
- Surge-protected extension leads

A 30 mA RCD should not normally trip below 15 mA and must trip by 30 mA, so a circuit with 10–15 mA of normal leakage can become prone to nuisance tripping when one appliance adds a little more.

This is one reason modern boards use **RCBOs** — each circuit has its own RCD protection, so leakage is not accumulated across half the house.

> Related: [What Is an RCBO? The Difference Between RCD, MCB and RCBO Explained](/blog/what-is-an-rcbo-difference-between-rcd-mcb-rcbo/)

---

## Common Cause 5: Damaged Cable

A nail through a cable, rodent damage, crushed insulation, or degraded old wiring can allow current to leak from live or neutral to earth.

Warning signs:

- RCD trips after drilling, DIY work, or fitting shelves
- One room or wall area causes repeated trips
- A socket faceplate shows scorch marks or cracking
- Lights flicker before the trip
- Insulation resistance test fails during EICR

Damaged cables need test equipment to locate safely. Do not keep resetting the RCD repeatedly — repeated fault current can cause heat damage at the fault point.

---

## Safe Step-by-Step Checklist

### 1. Note exactly what happened

Before resetting anything, write down:

- Which RCD or RCBO tripped
- Which circuits lost power
- What appliance was being used
- Whether it was raining
- Whether any recent drilling, DIY, or appliance installation happened

Patterns matter.

### 2. Unplug appliances on the affected circuits

Unplug everything from the sockets on the circuits protected by the tripped RCD. Do not just switch sockets off — unplug the appliances so live, neutral, and earth are fully disconnected.

### 3. Reset the RCD

If the RCD now stays on, one of the unplugged appliances is likely faulty.

Plug appliances back in one at a time. If the RCD trips immediately when a particular appliance is plugged in or switched on, that appliance is the suspect.

### 4. Isolate outdoor circuits

If the trip happens during or after rain, switch off the MCB/RCBO for outdoor sockets, garden lights, shed supply, pond pump, and exterior lighting. Then reset the RCD.

If the RCD holds with outdoor circuits off, water ingress is likely.

### 5. Do not repeatedly force reset

If the RCD trips immediately with all appliances unplugged, leave it off and call an electrician. The fault is likely fixed wiring, a neutral-earth fault, or a damaged cable.

### 6. Get insulation resistance testing

An electrician will use an insulation resistance tester to apply a DC test voltage between live, neutral, and earth conductors. This reveals leakage paths that normal multimeters cannot detect.

---

## RCD vs MCB Tripping: The Difference

| Device tripping | What it usually means |
|---|---|
| **RCD trips** | Earth leakage or imbalance between live and neutral |
| **MCB trips** | Overload or short circuit drawing too much current |
| **RCBO trips** | Could be either earth leakage or overcurrent, depending on indicator/type |

If the RCD trips but the MCB stays on, the issue is usually leakage, not overload.

> Related: [Why Does My MCB Keep Tripping?](/blog/why-does-my-mcb-keep-tripping/)

---

## Simulate RCD Faults in ElectraSim

[ElectraSim](/app/) lets you see exactly why an RCD trips:

1. Build a circuit with a power supply, RCD, switch, and load
2. Run it normally — live and neutral currents balance
3. Add an earth fault using Fault Simulation Mode
4. Watch the RCD trip as soon as leakage current flows outside the normal return path
5. Replace the RCD with an MCB and repeat — the MCB may not trip because the leakage current is too small

This clearly shows why RCDs protect against shock hazards that MCBs cannot detect.

> [Open ElectraSim — free, no sign-up →](/app/)

---

## When to Call an Electrician

Call a qualified electrician if:

- The RCD trips immediately even with appliances unplugged
- The trip happens after drilling or building work
- Outdoor wiring is involved
- You smell burning or see scorch marks
- The same circuit trips repeatedly
- You cannot identify a single faulty appliance
- The installation has an old fuse board or no RCBOs

Repeated RCD trips are not normal. The device is reporting a real electrical condition that should be found and corrected.

---

## Key Points

- An RCD trips when live and neutral current do not balance — usually earth leakage
- Common causes: faulty appliances, water ingress, neutral-earth faults, cumulative leakage, damaged cables
- Unplug appliances fully before resetting — do not rely on socket switches
- Trips after rain usually point to outdoor sockets, lights, or garden wiring
- If the RCD trips immediately with everything unplugged, call an electrician
- Never bypass an RCD to “solve” nuisance tripping
