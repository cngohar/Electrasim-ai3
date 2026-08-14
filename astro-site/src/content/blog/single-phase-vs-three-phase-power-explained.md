---
title: "Single Phase vs Three Phase Power: What's the Difference and Which Do You Have?"
description: "Single phase and three phase are the two ways the electricity grid delivers power. This guide explains what each means, how to identify which supply you have, why three phase exists, and when a domestic property might need it."
pubDate: 2026-05-21
author: ElectraSim
category: Beginner Guide
tags: [single phase, three phase, three phase power, 230V, 400V, line voltage, phase voltage, power supply, electrical supply, domestic three phase, EV charger three phase, three phase wiring, electrical fundamentals]
---

Every property in the UK is connected to one of two types of electrical supply: **single phase** or **three phase**. Almost all houses have single phase. Larger properties, workshops, and commercial buildings often have three phase. But what does "phase" actually mean, and why does it matter?

This guide explains both supply types from first principles — what the waveforms look like, why three phase exists, the voltage levels involved, and how to tell which supply your property has. You can explore single-phase circuit behaviour in **[ElectraSim](/app/)** — a free browser-based circuit simulator.

---

## What Is a "Phase"?

The electricity grid generates and distributes power as **alternating current (AC)** — a voltage that rises and falls in a smooth sine wave, cycling 50 times per second (50 Hz) in the UK.

A **phase** is one of these sine wave cycles, defined by its **starting point in time**. Two signals are "in phase" if they reach their peaks at the same moment; they are "out of phase" if their peaks are offset.

Single-phase power has **one sine wave**. Three-phase power has **three sine waves**, each offset by exactly 120° from the others — one third of a cycle apart.

```
Single phase:
    ╭───╮         ╭───╮
────╯   ╰─────────╯   ╰────  (one wave)

Three phase:
    ╭───╮         ╭───╮
────╯   ╰─────────╯   ╰────  Phase L1
       ╭───╮         ╭───╮
───────╯   ╰─────────╯   ╰── Phase L2 (120° later)
              ╭───╮
──────────────╯   ╰───────── Phase L3 (240° later)
```

The three phases are conventionally labelled **L1, L2, L3** (or R, Y, B for Red, Yellow, Blue in older UK notation — now replaced by Brown, Black, Grey under BS 7671).

---

## Single Phase Power

A **single-phase supply** delivers power via two conductors:
- **Live (L)** — one phase from the grid, 230 V AC at 50 Hz in the UK
- **Neutral (N)** — the return conductor, held close to earth potential at the transformer

The voltage between live and neutral is **230 V** (nominal). This is the supply used by virtually all domestic appliances — sockets, lighting, cookers, washing machines.

### How single phase is delivered to your home

The UK grid generates three-phase power at high voltage. At local substations, this is stepped down and distributed to streets. Three cables leave the substation — one phase per cable. Houses on the same street are typically connected to different phases (one house on L1, the next on L2, the third on L3) to balance the load evenly across all three phases. Each house receives only one of those phases plus a shared neutral.

This is why a standard domestic property in the UK has a single-phase supply — it is connected to one of the three phases at the local substation.

---

## Three Phase Power

A **three-phase supply** delivers power via four conductors:
- **L1, L2, L3** — three live conductors, each carrying a sine wave 120° offset from the others
- **Neutral (N)** — the shared return conductor

In a balanced three-phase load (equal load on all three phases), the currents in L1, L2, and L3 cancel each other out in the neutral — at any instant, the sum of three equal but offset sine waves is zero. This means the neutral carries no current in a perfectly balanced system, which is why some three-phase industrial supplies omit the neutral entirely.

### Voltages in a three-phase system

Two distinct voltages exist in a three-phase supply:

| Voltage | Between | Value (UK) |
|---|---|---|
| **Phase voltage** (Vp) | Any live conductor and neutral | **230 V** |
| **Line voltage** (VL) | Any two live conductors | **400 V** |

The relationship between them: **VL = Vp × √3 = 230 × 1.732 ≈ 400 V**

This means a three-phase supply at your premises gives you:
- 230 V single-phase (L1-N, L2-N, or L3-N) — for standard sockets and lighting
- 400 V three-phase (L1-L2, L2-L3, or L1-L3) — for three-phase motors, industrial equipment, and some EV chargers

---

## Why Three Phase Exists

Three phase was not invented for its own sake — it solves specific engineering problems that single phase cannot:

### 1. Constant power delivery

A single-phase supply delivers power that pulses at 100 Hz (twice per cycle — once on the positive half and once on the negative). At the zero-crossings, instantaneous power is zero.

A three-phase supply delivers **constant power** — because when one phase is near zero, the other two are carrying current, and their combined instantaneous power is always equal to the total rated power. This is why three-phase motors run more smoothly and with less vibration than single-phase motors.

### 2. More efficient transmission

Transmitting the same total power using three-phase cables uses less copper than three separate single-phase cables. Three-phase power transmission is approximately 1.73× more efficient per conductor than single phase.

### 3. Self-starting motors

Single-phase induction motors require a starting capacitor or auxiliary winding to create a rotating magnetic field. Three-phase induction motors are **inherently self-starting** because the three offset phases naturally create a rotating magnetic field in the stator. This is why large motors — pumps, compressors, factory machinery — run on three phase.

---

## How to Tell Which Supply You Have

### Look at the consumer unit (fuse board)

- **Single phase**: one main switch at the top of the board, typically rated 60–100 A. One live cable enters the main switch.
- **Three phase**: a **3-pole or 4-pole main switch** (three times wider than a single-pole switch) at the top. Three live cables enter it, plus a neutral. The board may have three sets of MCBs (one set per phase) or a mixed arrangement.

### Count the cables at the cut-out (meter tails)

- **Single phase**: two thick cables enter the meter — one brown (live) and one blue (neutral), typically 25 mm²
- **Three phase**: four thick cables enter the meter — three live (brown, black, grey) and one blue neutral

### Check the electricity meter

- Single-phase meters display one set of readings
- Three-phase meters are wider, have three sets of terminal connections, and are clearly labelled for three-phase supply

### Ask your DNO

Your **Distribution Network Operator (DNO)** — the company that owns the cables to your property — can confirm what supply is installed. This is especially useful if you are planning to upgrade.

---

## When Would a House Need Three Phase?

The vast majority of UK homes run comfortably on single-phase supply. Three phase becomes relevant in specific situations:

### 1. High-power EV charging

A standard 7.4 kW single-phase EV charger uses 32 A on a single phase. A **three-phase 22 kW charger** draws approximately 32 A per phase — the same current, but three times the power because all three phases are used simultaneously.

For most homeowners, a 7.4 kW single-phase charger (overnight charging) is sufficient. For high-mileage drivers or fleet vehicles needing rapid home charging, a three-phase supply and a 22 kW charger is significantly faster.

### 2. Large electric heating systems

A large property with multiple electric heating circuits, electric underfloor heating across the whole house, or an electric thermal storage system may exceed what a standard 100 A single-phase supply can deliver (100 A × 230 V = 23 kW). Three phase allows the load to be split across phases.

### 3. Workshop and small business use

A woodworking shop, metal fabrication workshop, or small commercial unit with three-phase motors (table saw, lathe, compressor, dust extractor) requires a three-phase supply. Attempting to run three-phase equipment on single phase requires phase converters, which are inefficient and complex.

### 4. Large air source heat pumps and ground source heat pumps

Some larger heat pump installations (14–20 kW output) require three-phase supply to power the compressor and pump motors efficiently.

---

## Upgrading from Single Phase to Three Phase

If you need three phase, upgrading requires:

1. **Application to your DNO** — they install the three-phase supply from the street to your cut-out. This takes several weeks and involves a significant connection charge (typically £1,000–£5,000+ depending on distance and existing infrastructure).

2. **New consumer unit** — a three-phase consumer unit (distribution board) replaces your existing single-phase board. Each phase has its own set of MCBs and RCDs/RCBOs.

3. **Electrical Installation Certificate (EIC)** — the new installation must be certified by a qualified electrician. This work is notifiable under Part P.

4. **Load balancing** — circuits must be allocated across the three phases as evenly as possible to prevent one phase carrying much more load than the others.

---

## Three Phase in Circuit Diagrams

In schematic diagrams, three-phase systems use specific notation:

- **L1, L2, L3** labels on live conductors (UK/IEC) or **R, S, T** (some European conventions)
- **Star (Y) connection**: all three loads share a common neutral point. Phase voltage (230 V) appears across each load.
- **Delta (Δ) connection**: loads connected between pairs of phases. Line voltage (400 V) appears across each load. No neutral connection used.

Most domestic and commercial three-phase supplies use **star (Y)** connection because it provides a neutral and allows 230 V single-phase connections alongside 400 V three-phase connections.

Three-phase motors may be connected in either star (lower torque, lower current, used for starting) or delta (higher torque, higher current, used for running) — the familiar **star-delta starter** switches between the two configurations to limit starting current.

---

## Key Numbers to Remember

| | Single Phase | Three Phase |
|---|---|---|
| **Live conductors** | 1 | 3 |
| **Phase voltage (L-N)** | 230 V | 230 V per phase |
| **Line voltage (L-L)** | N/A | 400 V |
| **Frequency** | 50 Hz | 50 Hz |
| **Max single-phase power (100 A supply)** | 23 kW | — |
| **Max three-phase power (100 A/phase)** | — | 69 kW |
| **Wire colours (live)** | Brown | Brown, Black, Grey |
| **Neutral colour** | Blue | Blue |
| **Earth colour** | Green/Yellow | Green/Yellow |

> Related: [Live, Neutral and Earth Wires Explained](/blog/live-neutral-and-earth-wires-explained/)

---

## Simulating Single Phase Circuits in ElectraSim

[ElectraSim](/app/) simulates single-phase circuits — the type found in virtually all UK domestic installations. Every component, protection device, and fault condition in the simulator operates on the same 230 V AC single-phase logic described in this guide.

To see single-phase power delivery in action:
1. Place a **Power Supply** (representing your 230 V single-phase supply)
2. Connect **MCBs** (representing each circuit in the consumer unit)
3. Add loads — bulbs, motors, sockets with appliances
4. Run the simulation and observe how load on each circuit is independent

> [Open ElectraSim — free, no sign-up →](/app/)

---

## Frequently Asked Questions

### Can I run three-phase equipment on single phase?

Not directly. A phase converter can simulate three-phase from single-phase supply, but they are expensive, inefficient, and reduce motor performance. For any serious three-phase load (motors above 1–2 kW), a genuine three-phase supply is the right solution.

### Is three phase more dangerous than single phase?

The 400 V line-to-line voltage is more dangerous than 230 V phase-to-neutral — higher voltage means more severe shock from the same body resistance (Ohm's Law: I = V/R). Three-phase equipment requires care and qualified installation. The same 30 mA RCD principle applies; however, three-phase protection devices must interrupt all three phases simultaneously.

### Can I have some single-phase and some three-phase circuits in the same building?

Yes — this is standard in any premises with a three-phase supply. Lighting and socket circuits are connected single-phase (L1/L2/L3 + N); large motor or heating loads are connected three-phase (L1 + L2 + L3, ± N). The consumer unit distributes circuits across phases to achieve balance.

### Why does my neighbour have 400 V but my house doesn't?

Your neighbour likely has a three-phase supply — either because they requested an upgrade for a specific use (workshop, large EV charger) or because their property historically required it (it used to be a commercial building, for example). Most standard houses are supplied single-phase as built, and upgrading requires a DNO application.

---

## Key Points

- **Single phase**: 1 live conductor, 230 V L-N, standard for all UK domestic properties
- **Three phase**: 3 live conductors, 230 V L-N / 400 V L-L, used in commercial, industrial, and high-demand domestic
- Three phase provides **constant power**, **self-starting motors**, and **more efficient transmission**
- To identify your supply: count the cables at the cut-out — 2 cables = single phase, 4 cables = three phase
- **Upgrade requires a DNO application** and costs £1,000–£5,000+
- Most homeowners need three phase only for **22 kW EV charging**, **large workshops**, or **heat pumps**
