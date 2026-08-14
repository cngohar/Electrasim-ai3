---
title: "How to Install an EV Charger: Dedicated Circuit Guide for Home Charging"
description: "Installing an EV charger at home requires a dedicated high-current circuit, PEN fault protection for PME supplies, and often DNO notification. This UK guide covers 7 kW and 22 kW chargers, cable sizing, earthing requirements, and safe installation."
pubDate: 2026-05-30
author: ElectraSim
category: Wiring Guide
tags: [EV charger installation, electric vehicle charger, home EV charger, 7kW charger, 22kW charger, EV charging point, dedicated circuit, PEN fault protection, TT earthing, DNO notification, 6mm cable, 10mm cable, RCBO, BS 7671]
---

Installing an EV charger at home is one of the most significant electrical additions a modern property can have. A 7 kW charger draws 32 A continuously for hours — longer than any shower or cooker operates — and introduces unique safety requirements around earthing that do not apply to other high-power appliances.

This guide covers the complete installation requirements: circuit sizing, cable selection, PEN fault protection for PME (TN-C-S) supplies, DNO notification, and the specific technical rules that make EV charging installations distinct from showers or cookers.

---

## Understanding EV Charger Power Ratings

Home EV chargers in the UK typically come in two power levels:

| Charger rating | Current at 230 V | Charging speed | Typical cable |
|---|---|---|---|
| **7 kW** (single-phase) | 30.4 A | 25–30 miles per hour | 6 mm² or 10 mm² |
| **22 kW** (three-phase) | 32 A per phase | 75–90 miles per hour | 10 mm² or 16 mm² per phase |

The vast majority of domestic installations are **7 kW single-phase**. A 22 kW three-phase charger requires a three-phase supply, which most UK homes do not have.

Calculation for 7 kW:
```
I = P / V = 7,000 / 230 = 30.4 A
```

Unlike a shower that runs for 5–10 minutes, an EV charger runs for **4–8 hours** continuously. This sustained load affects cable sizing and voltage drop calculations.

> Related: [Single Phase vs Three Phase Power: What's the Difference?](/blog/single-phase-vs-three-phase-power-explained/)

---

## The Dedicated Circuit Requirement

An EV charger requires its own **dedicated circuit** from the consumer unit. It cannot:
- Share a socket circuit
- Share a cooker circuit
- Be spurred off a ring final circuit
- Share with any other high-load equipment

The circuit must run continuously from the **consumer unit to the charging point** without any intervening connections except those within the charger unit itself.

---

## Cable Sizing for EV Chargers

### 7 kW charger (30.4 A continuous)

| Cable size | Current capacity (clipped direct) | Suitability |
|---|---|---|
| **6 mm²** twin and earth | 47 A | Minimum acceptable; tight margin for long runs |
| **10 mm²** twin and earth | 65 A | Standard recommendation; better voltage drop and future-proofing |

**Recommendation:** Use **10 mm²** as the standard choice. The additional cost is minimal compared to the installation, and it provides:
- Lower voltage drop over long runs (garages, driveways)
- Headroom for future charger upgrades
- Better thermal performance in enclosed routes

### Voltage drop consideration

For a 20 m run to a driveway charger using 10 mm² (mV/A/m ≈ 4.4):
```
V_drop = (4.4 × 30.4 × 20) / 1000 = 2.68 V
```

2.68 V against the 5% limit (11.5 V) — well within limits. With 6 mm² over 25+ m, voltage drop approaches the limit.

> Related: [Voltage Drop Explained: How to Calculate It and Why It Matters](/blog/voltage-drop-explained-how-to-calculate-it/)

---

## Protection at the Consumer Unit

The EV charger circuit requires a **dedicated MCB or RCBO**:

| Charger | Protection recommendation |
|---|---|
| 7 kW (30.4 A) | **32 A Type B RCBO** or **40 A Type B MCB** with separate RCD |
| 22 kW three-phase | **32 A three-pole MCB/RCBO per phase** |

### Why RCBO is preferred

- The charger is an outdoor or semi-outdoor accessory (even wall-mounted, it is exposed to weather)
- BS 7671 requires RCD protection for EV charging (Regulation 722.531.2.101)
- An **RCBO** combines overcurrent and 30 mA earth leakage protection without sharing with other circuits

> Related: [What Is an RCBO? The Difference Between RCD, MCB and RCBO Explained](/blog/what-is-an-rcbo-difference-between-rcd-mcb-rcbo/)

---

## The PEN Fault Protection Problem

This is the most technically demanding aspect of EV charger installation and what distinguishes it from showers or cookers.

### The problem with PME (TN-C-S) supplies

Most UK homes have **PME (Protective Multiple Earthing)** — also called TN-C-S. In this system, the supplier combines neutral and earth functions in their cable, and your installation's earth comes from the neutral conductor.

Under **PEN fault conditions** (neutral break in the supplier's network), the neutral-earth point can rise to live potential. This is rare but dangerous. For a shower or cooker inside the house, the risk is contained. For an EV charger:

- The car body is connected to earth via the charging cable
- The car owner may be standing on the driveway touching the car
- A PEN fault could energise the car body, creating a shock hazard

### Solutions for PME supplies

BS 7671 Section 722 requires one of the following for EV charging on PME:

| Solution | How it works | When to use |
|---|---|---|
| **TT conversion** | Install a local earth electrode and convert the charging point to TT earthing | Most robust solution; preferred for new installations |
| **PEN fault detection device** | Electronic device that monitors for neutral-earth voltage rise and disconnects if detected | Alternative where TT conversion is impractical |
| **Galvanic isolation** | Isolating transformer that separates the PME earth from the charging circuit | Specialist application; adds cost and complexity |

#### TT conversion (recommended approach)

1. Install an **earth electrode** (earth rod or earth mat) at the property
2. Connect the EV charger's earth terminal to this electrode
3. Ensure the electrode resistance is sufficiently low (typically ≤200 Ω, but this depends on the charger's requirements)
4. The charger is now on a **TT system** — independent of the PME supply

> Related: [Types of Earthing Systems Explained: TN-S, TN-C-S (PME) and TT](/blog/types-of-earthing-systems-tn-s-tn-c-s-tt-explained/)

---

## DNO Notification

Installing an EV charger usually requires **notification to the Distribution Network Operator (DNO)** — the company that owns the local electricity network (UK Power Networks, Northern Powergrid, etc.).

### When notification is required

- **Any new dedicated circuit over 32 A** — may require fuse upgrade
- **Adding significant load** to an already heavily loaded single-phase supply
- **Three-phase charger installation** — always requires consultation

### The process

1. **Pre-installation**: Submit application to DNO (often done by the installer)
2. **DNO assesses**: Network capacity, incoming fuse size, phase balancing
3. **Possible outcomes**:
   - Approved to proceed
   - Approved with conditions (load limiting device)
   - Requires network reinforcement (costly, rare for domestic)

Some chargers have **load balancing** features that monitor the property's total demand and reduce charging current when the house is using significant power. This can help with DNO approval on limited-capacity supplies.

---

## The EV Charging Point Installation

### Positioning

- **Wall-mounted** on garage, house, or dedicated post
- **1.2 m maximum cable reach** from car charging port (typical)
- **Accessible position** for the cable but not a trip hazard
- **Protected from vehicle impact** (bollards if near driveway edge)

### IP rating

Outdoor charging points must be **minimum IP44**, with **IP65 preferred** for full weather protection. Most modern chargers are IP65 rated.

> Related: [IP Rating Explained: IP44, IP65, IP67 and What Every Number Means](/blog/ip-rating-explained-ip44-ip65-ip67/)

### Isolation requirements

A **local isolator** is required within 3 m of the charging point. This can be:
- A ** rotary switch** in a weatherproof enclosure
- The charger's built-in isolation (if accessible and clearly marked)
- A switch inside an attached garage (if the charger is garage-mounted)

---

## Part P Notification

Installing an EV charger is **notifiable work under Part P** — it is a new circuit in a special location (outdoor) and involves significant electrical work.

Options:
- Use a **Part P-registered electrician** who self-certifies
- Notify **Building Control** before starting

An **Electrical Installation Certificate (EIC)** must be issued for the new circuit.

> Related: [Part P Building Regulations Explained: What UK Homeowners Can and Can't DIY](/blog/part-p-building-regulations-explained/) — the full notifiable vs non-notifiable table, three compliance routes, and what happens if you skip notification.
>
> Related: [When to Get an EICR: The Complete Electrical Safety Inspection Guide](/blog/when-to-get-an-eicr-electrical-inspection-guide/)

---

## Smart Features and Load Management

Modern EV chargers often include:

- **App control** — start/stop charging, schedule for cheap rate electricity
- **Dynamic load balancing** — reduces charge rate if house demand is high
- **Solar PV integration** — charges from excess solar generation
- **Timed charging** — takes advantage of off-peak electricity tariffs

These features do not change the fundamental wiring requirements but may require a CT clamp on the main incoming cable for load monitoring.

---

## Testing and Commissioning

Before the charger is used, the installer must:

1. **Insulation resistance test** — confirms no cable damage
2. **Polarity** — correct at all points
3. **Earth electrode resistance** — confirms TT electrode is effective
4. **Earth fault loop impedance (Zs)** — confirms RCBO will trip under fault
5. **RCBO functionality** — passes the required 30 mA RCD/RCBO trip-time tests
6. **Functional test** — charger operates, car charges
7. **Commissioning report** — settings, maximum charge rate, load limit recorded

---

## Common Mistakes

| Mistake | Risk | Correct approach |
|---|---|---|
| Sharing a circuit with the house | Overload, fire | Dedicated circuit from CU |
| No PEN fault protection on PME | Death by electric shock under neutral fault | TT conversion or PEN fault device |
| 6 mm² cable for long run | Voltage drop, slow charging | 10 mm² standard |
| No RCD protection | Shock hazard from outdoor equipment | RCBO mandatory |
| Charger mounted without vehicle protection | Physical damage | Bollards or recessed mounting |
| No DNO notification | Potential fuse overload, network issues | Notify DNO before installation |
| Wrong earthing for the supply type | PEN fault danger | Assess supply type and install appropriate protection |

---

## Simulating EV Charger Circuits in ElectraSim

[ElectraSim](/app/) can demonstrate the key electrical concepts:

1. Build a **high-current circuit** with 30+ A load — observe sustained operation
2. Add **earth fault** protection — show why RCBO is essential for outdoor equipment
3. Demonstrate **PEN fault scenario** — live potential on earth conductor, danger to touch
4. Compare **TT earthing** — isolated earth electrode, no neutral dependency

Understanding the theory behind PEN faults and TT conversion makes the installation requirements clearer.

> [Open ElectraSim — free, no sign-up →](/app/)

---

## Key Points

- **7 kW chargers** draw 30 A continuously for hours — dedicated circuit mandatory
- **10 mm² cable** is the standard recommendation for voltage drop and future-proofing
- **32 A RCBO** provides required overcurrent and 30 mA RCD protection
- **PEN fault protection** is unique to EV chargers — PME supplies need TT conversion or equivalent protection
- **DNO notification** usually required — assess network capacity before installation
- **Part P notifiable** — use a registered electrician or notify Building Control
- **Outdoor IP rating** minimum IP44, preferably IP65
- **Local isolation** required within 3 m of the charging point
- **TT earthing** with dedicated earth electrode is the preferred solution for PME supplies
