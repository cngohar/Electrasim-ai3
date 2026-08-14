---
title: "How to Wire a Shed or Outbuilding: Complete UK Electrical Guide"
description: "Powering a shed, garage, or garden outbuilding safely requires the right cable type, burial depth, consumer unit, earthing, and RCD protection. This complete UK guide covers everything from planning to testing."
pubDate: 2026-05-22
author: ElectraSim
category: Wiring Guide
tags: [shed wiring, outbuilding electrics, garden workshop, SWA cable, armoured cable, sub consumer unit, outdoor electrics, cable burial depth, Part P, TT earthing, RCD shed, garage wiring UK, BS 7671]
---

A powered shed or outbuilding opens up possibilities: workshop tools, a home office, a gym, a garden studio. But an outbuilding supply is one of the most commonly done-wrong electrical jobs in UK homes — wrong cable type, insufficient depth, missing RCD, no consumer unit. Done correctly, it is a safe, permanent installation that adds real value. Done incorrectly, it is a persistent hazard.

This guide covers everything: planning, cable selection, burial depth, the sub-consumer unit, earthing, protection, testing, and Part P. You can simulate the protection logic in **[ElectraSim](/app/)** before laying a single cable.

---

## Step 1: Plan the Supply

Before buying anything, establish:

### What load do you need?

| Use | Typical Max Load | Suggested Circuit |
|---|---|---|
| Lighting + phone charging | 1–2 kW | 16 A radial, 2.5 mm² SWA |
| Workshop — hand tools, lighting | 3–5 kW | 20–32 A radial, 4 mm² or 6 mm² SWA |
| Workshop — heavy machinery (lathe, saw) | 5–15 kW | 32–40 A radial, 6–10 mm² SWA |
| Garden studio with heating | 3–7 kW | 32 A radial, 6 mm² SWA |
| EV charger in garage | 7.4 kW / 32 A continuous | Dedicated 32 A circuit, 6–10 mm² SWA |

For a simple garden shed with lighting and a couple of sockets, a **20 A radial with 4 mm² SWA** is typical. For a serious workshop, size up — it is much cheaper to install the right cable now than to re-trench the garden in two years.

### Where does the supply come from?

- **Consumer unit inside the house** — the supply cable runs from the house CU, through the wall or under the floor, across the garden, and into the outbuilding
- **Meter tails / cut-out** — for large outbuildings, a direct connection before the house CU is possible but requires DNO involvement

The standard route for domestic outbuildings is a **new circuit from the house consumer unit** via a dedicated MCB or RCBO.

### Does the work need notifying?

Yes. Any new circuit supplying an outbuilding is **notifiable work under Part P** of the Building Regulations. This means:
- Use a **Part P-registered electrician** (who self-certifies), OR
- Notify your local authority **Building Control** before work begins and pay for an inspection

An uninspected outbuilding supply can cause problems when you sell the property.

> Related: [Part P Building Regulations Explained: What UK Homeowners Can and Can't DIY](/blog/part-p-building-regulations-explained/) — the full notifiable vs non-notifiable table, three compliance routes, and what happens if you skip notification.

---

## Step 2: Choose the Right Cable

### Steel Wire Armoured (SWA) cable — the standard choice

**SWA cable** is the correct cable for an outbuilding supply. It has:
- PVC outer sheath
- Steel wire armour (mechanical protection + can serve as earth path when glands are fitted correctly)
- Inner PVC sheath around the conductors

SWA can be buried directly in the ground, run along walls in surface clips, or pulled through conduit. It is robust, weatherproof, and rodent-resistant.

For an outbuilding with its own consumer unit, use **SWA with a separate earth core** (3-core + earth, or 4-core). Do not rely solely on the armour as the circuit protective conductor (CPC) for a long run — a dedicated earth core provides a more reliable return path.

### Cable sizing

| Circuit rating | Cable size | Notes |
|---|---|---|
| 16 A | 2.5 mm² SWA | Lighting-only shed |
| 20 A | 4 mm² SWA | Light workshop use |
| 32 A | 6 mm² SWA | Workshop with tools, heater, EV |
| 40 A | 10 mm² SWA | Heavy machinery |

Always calculate **voltage drop** for the full cable length. A 30-metre run at 32 A on 6 mm² SWA loses approximately 4.5 V — within the 5% limit (11.5 V) for power circuits. A very long run (50+ metres) may require stepping up to the next cable size to keep voltage drop acceptable.

> Related: [Electrical Cable Sizes Explained: 1mm², 1.5mm², 2.5mm² and Beyond](/blog/electrical-cable-sizes-explained/)

### What NOT to use

- **Flat twin and earth** directly buried in soil — the PVC sheath degrades in ground contact; not rated for direct burial
- **Extension leads** as a permanent supply — unsafe, not weatherproof, and not a compliant installation
- **Flexible cable** through the garden — will be damaged by garden tools, UV, and moisture

---

## Step 3: Cable Route and Burial Depth

Plan the cable route carefully — avoid roots, drainage runs, and areas that will be excavated in future.

### Burial depths (BS 7671 / IET Guidance)

| Route | Minimum depth |
|---|---|
| Under lawn / garden (unlikely to be disturbed) | **500 mm** |
| Under paths, patios, driveways | **600 mm** |
| Under a road | **900 mm** |
| In conduit with additional protection | **300 mm** |

**Best practice:**
1. Dig the trench to the correct depth
2. Lay 50 mm of sharp sand in the base
3. Lay the SWA cable
4. Cover with 50 mm of sharp sand
5. Place **yellow cable marker tape** approximately 150 mm above the cable
6. Backfill and compact

Keep a dimensioned drawing of the cable route (measured from the house walls) so it can be located without digging blind.

### Entering the house and outbuilding

Where the cable passes through walls:
- Drill a **sleeved hole** (plastic conduit sleeve through the masonry) at a slight downward angle from inside to outside to prevent water ingress
- Seal around the sleeve with exterior-grade sealant
- Apply proper SWA glands at both ends where the cable enters enclosures

---

## Step 4: The Sub-Consumer Unit in the Outbuilding

Unless the outbuilding is tiny (a single outdoor socket on a spur), fit a **small consumer unit** in the outbuilding. This provides:
- Local isolation (switch off the outbuilding without returning to the house)
- Individual circuit protection for each outbuilding circuit
- RCD or RCBO protection for all circuits

A typical outbuilding consumer unit might contain:
- **1 × main isolator switch** (or the RCBO provides isolation)
- **1 × 6 A RCBO** — lighting circuit (1.5 mm² T&E)
- **1 × 32 A RCBO** — socket circuit (2.5 mm² T&E ring or radial)
- **1 × 32 A RCBO** — dedicated appliance circuit (for lathe, welder, EV charger, etc.)

Choose a **weatherproof or IP-rated consumer unit** if the outbuilding is not fully weather-tight (a garden shed with gaps, for example).

> Related: [Distribution Board Explained: How a Consumer Unit Is Wired](/blog/distribution-board-explained-how-a-consumer-unit-is-wired/)

---

## Step 5: Earthing the Outbuilding — TT vs TN

This is the most technically important decision in an outbuilding supply and the one most often skipped by DIY installations.

### Option A: Extend the house earthing system (TN-C-S / TN-S)

Run the earth conductor from the house consumer unit's earth bar through the SWA cable to the outbuilding consumer unit's earth bar. The outbuilding earth is the same earth reference as the house.

**Acceptable when:**
- The house has a low-impedance earth (TN-C-S or TN-S)
- The SWA cable has a dedicated earth core
- The outbuilding is not too far from the house (voltage drop on the earth conductor remains within limits)
- The earth fault loop impedance measured at the furthest outbuilding socket is low enough to ensure MCB/RCBO operation

**Problem:** if the earth conductor is long and resistance is high, fault current may be too low to trip the overcurrent device quickly. An RCBO at the outbuilding end (operating on 30 mA residual current rather than a high fault current) solves this — the RCBO trips on a small earth fault long before the resistance becomes an issue.

### Option B: TT earth electrode at the outbuilding

Drive a **copper-clad earth rod** at the outbuilding and connect it to the outbuilding consumer unit's earth bar. The outbuilding is earthed independently — no earth conductor needed in the SWA cable.

**When to use:**
- Very long cable run (high earth conductor resistance)
- House has TN-C-S (PME) and you prefer TT isolation for the outbuilding to avoid open-PEN risk
- Earthing system of the house supply is uncertain

**Requirement:** with TT earthing, **all circuits in the outbuilding MUST have 30 mA RCD protection** — the earth fault loop impedance via the rod is too high for MCBs alone to clear earth faults.

> Related: [Types of Earthing Systems Explained: TN-S, TN-C-S (PME) and TT](/blog/types-of-earthing-systems-tn-s-tn-c-s-tt-explained/)

---

## Step 6: RCD Protection

Under BS 7671, all circuits in an outbuilding require **30 mA RCD protection**. This is not optional — outbuildings are specifically mentioned as locations requiring additional protection.

**Best approach:** fit **RCBOs** (combined MCB + RCD) for each outbuilding circuit in the sub-consumer unit. Each circuit has independent RCD protection — a fault on the socket circuit does not cut power to the lighting circuit.

> Related: [What Is an RCBO? The Difference Between RCD, MCB and RCBO Explained](/blog/what-is-an-rcbo-difference-between-rcd-mcb-rcbo/)

---

## Step 7: Wiring Inside the Outbuilding

Inside the outbuilding, standard **twin and earth** cable can be used for fixed wiring — the SWA cable has done its job getting the supply safely from house to outbuilding. Use:

- **1.5 mm² T&E** for lighting circuits (6 A RCBO)
- **2.5 mm² T&E** for socket circuits (32 A RCBO or 20 A radial)

Cable should be surface-clipped or run in conduit if there is any risk of mechanical damage. In a workshop with metal tools, surface conduit (grey PVC or galvanised) is worth the extra effort.

Socket outlets in the outbuilding must be the same standard UK 13 A BS 1363 type as inside the house. If the outbuilding is damp or not weather-tight, fit **IP44 or IP65 rated socket outlets**.

> Related: [IP Rating Explained: IP44, IP65, IP67 and What Every Number Means](/blog/ip-rating-explained-ip44-ip65-ip67/)

---

## Step 8: Testing Before Energising

Before connecting the supply cable to the house consumer unit, a qualified electrician must:

1. **Insulation resistance test** on all conductors — confirms no short circuits or degraded insulation
2. **Earth continuity test** — from each outbuilding socket earth terminal back to the house MET (or the outbuilding earth rod if TT)
3. **Polarity test** — live, neutral, and earth to correct terminals throughout
4. **RCD operation test** — all RCBOs must trip at or below 30 mA
5. **Earth fault loop impedance (Zs)** — to confirm MCBs/RCBOs will operate within required disconnection times

Results are recorded on an **Electrical Installation Certificate (EIC)** — required for Part P notification.

---

## Simulate Your Outbuilding Circuit in ElectraSim

Before finalising your design, use [ElectraSim](/app/) to verify the protection logic:

1. Build a **house consumer unit** (power supply + RCBO) feeding the outbuilding supply
2. At the outbuilding, add a **sub-consumer unit** (distribution point) with RCBOs for each circuit
3. Add loads — **lighting**, **sockets**, **workshop equipment**
4. Apply **Fault Simulation Mode** to test earth fault, short circuit, and open circuit responses
5. Verify that a fault on one outbuilding circuit trips only that circuit's RCBO — not the whole supply

> [Open ElectraSim — free, no sign-up →](/app/)

---

## Common Mistakes

| Mistake | Risk | Correct Approach |
|---|---|---|
| Flat T&E buried in soil | Insulation failure, shock, fire | SWA or T&E in sealed conduit |
| Too shallow burial | Cable cut by spade | 500 mm minimum; marker tape |
| No sub-consumer unit | No local isolation or per-circuit protection | Always fit a small CU in the outbuilding |
| Missing RCD | Earth fault not cleared | 30 mA RCBO on every circuit |
| No earth electrode (TT) | High Zs — faults uncleared | Earth rod + 30 mA RCDs mandatory |
| Not notifying Part P | Illegal installation, sale problems | Register work or notify Building Control |
| Undersized cable for run length | Excessive voltage drop | Calculate for full length + apply derating |

---

## Key Points

- Use **SWA (armoured) cable** — never flat T&E direct in soil
- Bury at **500 mm minimum** in gardens; 600 mm under paths; add marker tape
- Fit a **sub-consumer unit** in the outbuilding with RCBOs per circuit
- **30 mA RCD/RCBO protection** is mandatory on all outbuilding circuits
- Choose **TT earthing** (earth rod) for long runs or where PME open-PEN risk is a concern
- New outbuilding supply is **notifiable under Part P** — use a registered electrician or notify Building Control
- **Test before energising** — insulation resistance, earth continuity, polarity, RCD operation, Zs
