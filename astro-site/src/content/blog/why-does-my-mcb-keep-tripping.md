---
title: "Why Does My MCB Keep Tripping? Overload, Short Circuit and Fault-Finding Guide"
description: "An MCB that keeps tripping is usually caused by overload, short circuit, appliance failure, damaged wiring, or an incorrectly rated breaker. This guide explains how to identify the cause safely and when to call an electrician."
pubDate: 2026-05-25
author: ElectraSim
category: Electrical Safety
tags: [MCB tripping, breaker keeps tripping, circuit breaker trips, overload, short circuit, electrical fault finding, consumer unit, miniature circuit breaker, appliance fault, BS 7671]
---

An MCB that keeps tripping is protecting the circuit from excessive current. Unlike an RCD, which trips on earth leakage, an MCB trips when current is too high — either because the circuit is overloaded, or because a fault has created a low-resistance path between live and neutral or live and earth.

This guide explains the difference between overload and short circuit, how to identify which one you are dealing with, and the safe fault-finding steps to take before calling an electrician.

---

## What an MCB Detects

An **MCB** (Miniature Circuit Breaker) protects a cable from overheating. It does not protect people directly from electric shock — that is the job of an RCD or RCBO.

An MCB has two trip mechanisms:

| Trip mechanism | Responds to | Typical cause |
|---|---|---|
| **Thermal trip** | Sustained overload | Too many appliances on one circuit |
| **Magnetic trip** | Instant high fault current | Short circuit or severe fault |

A thermal trip may take seconds, minutes, or even longer depending on the overload. A magnetic trip is almost instant.

> Related: [What Is an MCB Breaker? How Miniature Circuit Breakers Work](/blog/what-is-an-mcb-breaker/)

---

## Quick Diagnosis Table

| Symptom | Likely cause | First check |
|---|---|---|
| MCB trips after 5–20 minutes | Overload | Total load on circuit |
| MCB trips instantly when reset | Short circuit or hard fault | Leave off and call electrician |
| MCB trips when one appliance starts | Faulty appliance or high inrush current | Test appliance elsewhere if safe |
| Kitchen socket MCB trips at breakfast | Too many high-power appliances | Kettle, toaster, microwave, air fryer |
| Lighting MCB trips when switch turned on | Faulty fitting, lamp holder, or switch cable | Recently changed light fitting |
| MCB trips but RCD does not | Overload or live-neutral short | Not primarily earth leakage |

---

## Cause 1: Circuit Overload

Overload means the circuit is carrying more current than it was designed for. The MCB allows a small overload for a limited time, but if the cable would overheat, the thermal element trips.

Common overload examples:

- Kettle + toaster + microwave + air fryer on the same kitchen ring
- Portable heaters plugged into multiple sockets on one circuit
- Garage/workshop tools plus heater on a small radial
- Extension leads daisy-chained with several high-power loads
- Old circuits extended without checking load capacity

A 32 A ring final circuit can supply about **7.4 kW** total at 230 V:

```
P = V × I = 230 × 32 = 7,360 W
```

It is easy to approach this in a kitchen:

| Appliance | Typical power |
|---|---|
| Kettle | 3,000 W |
| Toaster | 1,500 W |
| Microwave | 1,200 W |
| Air fryer | 1,500 W |
| Dishwasher heater | 2,000 W |

All together: 9.2 kW — well above a 32 A circuit.

> Related: [5 Common Electrical Wiring Mistakes](/blog/5-common-electrical-wiring-mistakes/)

---

## Cause 2: Short Circuit

A short circuit occurs when live touches neutral or live touches earth through a very low resistance path. Current rises extremely fast, and the MCB's magnetic trip operates almost instantly.

Common causes:

- Damaged appliance flex
- Loose wire strands touching inside a plug or socket
- Cable pierced by a nail or screw
- Water inside a fitting causing conductive path
- Incorrect wiring in a new light fitting or socket
- Failed motor or transformer winding

If an MCB trips instantly the moment you reset it, do not keep trying. A hard short can cause arcing, heat, and further damage.

---

## Cause 3: Faulty Appliance

Appliances can trip MCBs in two ways:

1. **Internal short circuit** — live and neutral touch inside the appliance
2. **High startup current** — motor or compressor draws a large inrush current that exceeds the MCB curve

Frequent culprits:

- Vacuum cleaners with damaged flexes
- Fridges/freezers with failing compressors
- Washing machines with motor faults
- Power tools with worn brushes
- Old extension leads
- Plug-in heaters with damaged elements

If the MCB trips only when one appliance is plugged in or switched on, stop using that appliance until it has been tested or repaired.

---

## Cause 4: Incorrect MCB Rating

The MCB rating must match the cable size and installation method. A breaker that is too small can trip unnecessarily; a breaker that is too large may fail to protect the cable.

Common examples:

| Circuit | Typical cable | Typical MCB |
|---|---|---|
| Lighting | 1.0 or 1.5 mm² | 6 A |
| Socket ring | 2.5 mm² ring | 32 A |
| Socket radial | 2.5 mm² radial | 20 A |
| Cooker | 6 mm² | 32 A |
| Shower | 10 mm² | 40–50 A |

Never replace an MCB with a higher rating just because it trips. The cable may overheat before the new breaker operates.

> Related: [Electrical Cable Sizes Explained](/blog/electrical-cable-sizes-explained/)

---

## Cause 5: Inrush Current

Some loads draw a high current for a fraction of a second at startup:

- Motors
- Compressors
- Transformers
- LED drivers
- Power supplies
- Large banks of lighting

A Type B MCB trips magnetically at 3–5 times its rated current. If a load has a high inrush current, it may trip a Type B breaker even though the steady running current is safe.

The solution is not always to increase the rating. Sometimes a different breaker curve (Type C) is appropriate — but only after checking earth fault loop impedance, because Type C devices require higher fault current to disconnect quickly.

---

## Safe Step-by-Step Checklist

### 1. Identify the circuit

Read the label on the consumer unit. Is it lighting, sockets, cooker, shower, garage, shed, or outdoor power?

### 2. Think about timing

- Trips instantly on reset → likely short circuit or hard fault
- Trips after minutes → likely overload or heating appliance fault
- Trips when one device starts → appliance or inrush issue
- Trips after DIY work → possible damaged cable

### 3. Unplug loads

For socket circuits, unplug all appliances on the affected circuit. Reset the MCB once.

If it holds, plug appliances back in one at a time. The appliance that causes the trip is suspect.

### 4. Reduce load

If it trips only when multiple high-power devices run together, the circuit is overloaded. Spread loads across different circuits or install a dedicated circuit for high-demand appliances.

### 5. Stop if it trips instantly

If the MCB trips instantly with all loads unplugged, leave it off. That suggests a fixed wiring fault or hard short that requires testing.

---

## MCB vs RCD Tripping

| Device | Trips because of | Example |
|---|---|---|
| **MCB** | Too much current | Overload, short circuit |
| **RCD** | Earth leakage imbalance | Water ingress, appliance leakage |
| **RCBO** | Either condition | Combines both functions |

If you are not sure which device tripped, photograph the consumer unit before resetting anything. The label and device type matter.

> Related: [Why Does My RCD Keep Tripping?](/blog/why-does-my-rcd-keep-tripping/)

---

## Simulate MCB Trips in ElectraSim

[ElectraSim](/app/) lets you demonstrate both overload and short-circuit conditions:

1. Build a circuit with a power supply, MCB, and load
2. Add loads in parallel until the total current exceeds the MCB rating
3. Watch the MCB trip from overload
4. Create a live-neutral short using Fault Simulation Mode
5. Observe the fast trip response compared with a slow overload

This makes the difference between thermal and magnetic tripping much easier to understand.

> [Open ElectraSim — free, no sign-up →](/app/)

---

## When to Call an Electrician

Call an electrician if:

- The MCB trips instantly with loads unplugged
- The same circuit trips repeatedly
- You suspect a cable has been drilled or nailed
- There is burning smell, buzzing, or scorch marks
- The circuit is a cooker, shower, shed, or outdoor supply
- You think the breaker rating is wrong
- You need a Type C breaker or circuit redesign

---

## Key Points

- An MCB trips because current is too high — overload or short circuit
- Trips after minutes usually suggest overload; trips instantly suggest a short or hard fault
- Do not replace an MCB with a higher rating unless the cable and Zs calculations allow it
- Kitchens often overload because several 1–3 kW appliances run together
- If the MCB trips with all loads unplugged, leave it off and call an electrician
