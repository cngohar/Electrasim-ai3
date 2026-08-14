---
title: "Solar PV and Battery Storage Basics for Homeowners"
description: "Solar PV panels generate DC electricity that must be converted to AC for home use. This guide explains how solar panels work, inverter wiring, battery storage integration, earthing requirements, and DNO notification for UK installations."
pubDate: 2026-06-06
author: ElectraSim
category: Beginner Guide
tags: [solar PV, solar panels, battery storage, solar inverter, DC wiring, AC coupling, solar earthing, DNO notification, renewable energy, solar installation, solar panel wiring, G98 G99]
---

Solar PV (photovoltaic) panels convert sunlight directly into electricity. For a domestic installation, the DC power from the panels must be converted to AC for home use, and excess energy can be stored in batteries for later use. This guide explains the core components, how they connect, and the electrical requirements for a safe UK installation.

---

## How Solar PV Works

### The basic principle

Solar panels are made of photovoltaic cells that generate **DC (direct current)** electricity when exposed to light. Each panel produces a relatively low voltage (typically 30–50 V DC). Multiple panels are connected in series to form a **string** with higher DC voltage (typically 300–500 V DC for domestic systems).

This DC cannot be used directly in your home — it must be converted to **AC (alternating current)** at 230 V by an **inverter**.

### The flow of energy

```
Sunlight → Solar panels (DC) → Inverter (DC to AC) → Consumer unit → Home loads
```

When generation exceeds consumption:
```
Excess energy → Export to grid (or charge battery)
```

When generation is insufficient:
```
Grid → Consumer unit → Home loads (battery discharges if available)
```

---

## Solar PV System Components

### Solar panels (modules)

- **Power rating**: Typically 350–500 W per panel
- **Voltage**: 30–50 V DC per panel
- **Connection**: Panels connected in series to form strings
- **Mounting**: Roof-mounted on rails, or ground-mounted

### Inverter

The inverter is the heart of the system. It performs three functions:

1. **DC to AC conversion** — converts panel DC to 230 V AC
2. **MPPT (Maximum Power Point Tracking)** — optimises the voltage/current from the panels for maximum output
3. **Protection** — includes DC isolation, overcurrent protection, and monitoring

**Inverter types:**
- **String inverter** — all panels connect to one inverter (most common for domestic)
- **Microinverters** — one inverter per panel (more expensive, better for shaded roofs)
- **Hybrid inverter** — includes battery storage interface

### DC isolation switch

A **DC isolator** is required at the inverter input to allow safe isolation of the DC cables from the panels. This is a double-pole switch rated for the DC voltage and current of the array.

### AC protection

The inverter output connects to the consumer unit via:
- **AC isolator switch** — double-pole, rated for inverter output
- **MCB or RCBO** — overcurrent protection for the inverter circuit
- **RCD protection** — required for AC side

---

## Solar Panel DC Wiring

### String configuration

Panels are connected in series to form strings:

```
Panel 1 (+) → Panel 2 (+) → Panel 3 (+) → ... → String output
```

**Series connection:**
- Voltages add up (e.g., 4 panels × 40 V = 160 V)
- Current remains the same as one panel
- Used to reach the inverter's DC input voltage range

**Parallel connection:**
- Currents add up
- Voltage remains the same
- Rarely used in domestic string inverters

### DC cable sizing

DC cables must be rated for:
- **Voltage** — typically 600 V or 1000 V DC
- **Current** — string current (typically 8–12 A)
- **Temperature** — roof temperatures can reach 70°C+

Typical DC cable: **4 mm² or 6 mm²** solar-specific cable (double-insulated, UV-resistant).

### DC earthing

DC earthing requirements depend on the inverter type and system configuration:

| Inverter type | Earthing requirement |
|---|---|
| **Transformerless inverter** | No functional DC earth required; frame of panels earthed |
| **Transformer-based inverter** | DC negative may be earthed (follow manufacturer) |
| **Microinverters** | AC side earthed via consumer unit |

**Panel frame earthing:** All panel frames and mounting rails must be earthed to the main earth terminal.

> Related: [Types of Earthing Systems Explained: TN-S, TN-C-S (PME) and TT](/blog/types-of-earthing-systems-tn-s-tn-c-s-tt-explained/)

---

## Inverter AC Wiring

### Connection to consumer unit

The inverter AC output connects to the consumer unit via a dedicated circuit:

```
Inverter AC output
        |
        v
[AC isolator switch]
        |
        v
[MCB or RCBO in consumer unit]
        |
        v
[Consumer unit busbar]
```

**MCB/RCBO rating:** Typically 16–32 A, depending on inverter size.

### RCD protection

The inverter circuit requires **30 mA RCD protection**. This can be:
- An **RCBO** (preferred — dedicated protection)
- An **RCD** protecting the consumer unit (if inverter shares the RCD)

### Anti-islanding protection

The inverter includes **anti-islanding protection** — it automatically disconnects if grid power is lost. This protects engineers working on the grid and prevents the inverter from energising a dead grid.

---

## Battery Storage Integration

### Battery types

| Battery type | Typical use | Pros | Cons |
|---|---|---|---|
| **Lithium-ion** | Most modern systems | High efficiency, long life, compact | Higher cost |
| **Lead-acid** | Older systems | Lower cost | Shorter life, larger, lower efficiency |
| **Saltwater** | Niche | Non-toxic | Lower energy density |

### AC vs DC coupling

**AC coupling:**
- Battery inverter connects to AC side (same as solar inverter)
- Can be added to existing solar systems
- More flexible but slightly less efficient

**DC coupling:**
- Battery connects to DC side of solar inverter
- More efficient (fewer conversions)
- Typically installed with solar from the start

### Battery sizing

Typical domestic battery: **5–13 kWh** capacity

**Example:** A 10 kWh battery can supply approximately:
- 10 kW for 1 hour
- 5 kW for 2 hours
- 1 kW for 10 hours

Battery sizing depends on:
- Daily consumption
- Solar generation
- Desired backup duration
- Budget

---

## DNO Notification

Installing solar PV requires **notification to the Distribution Network Operator (DNO)** under **G98** (for systems under 16 A per phase) or **G99** (for larger systems).

### G98 notification (most domestic systems)

For systems under 3.68 kW per phase (16 A):
- Submit notification to DNO before installation
- DNO typically approves within 28 days
- No reinforcement usually required

### G99 application (larger systems)

For systems over 3.68 kW per phase:
- Full application required
- DNO assesses network capacity
- May require reinforcement or export limiting

### Export limiting

Many systems include an **export limiter** to restrict export to the grid (e.g., 3.68 kW). This can simplify DNO approval and avoid network reinforcement costs.

---

## Part P and Building Regulations

Solar PV installation is **notifiable work under Part P**:

- Use a **MCS-certified installer** (Microgeneration Certification Scheme)
- Installer self-certifies and issues an EIC
- Or notify **Building Control** before starting

MCS certification is also required for government incentives (Smart Export Guarantee).

---

## Common Mistakes

| Mistake | Risk | Correct approach |
|---|---|---|
| Using standard AC cable for DC | Insulation failure, fire | Use solar-specific DC cable |
| No DC isolation switch | Cannot safely isolate panels | Install double-pole DC isolator at inverter |
| Incorrect earthing of panel frames | Shock hazard, equipment damage | Earth all frames and rails to MET |
| Ignoring DNO notification | Legal non-compliance, grid issues | Submit G98/G99 before installation |
| Undersized inverter | Energy clipping (wasted generation) | Size inverter for peak generation |
| Oversized battery | Unnecessary cost | Size based on consumption and solar output |

---

## Simulating Solar Circuits in ElectraSim

[ElectraSim](/app/) can help understand the electrical principles:

1. Build a **DC circuit** representing a solar string
2. Add a **load** representing the inverter input
3. Observe how **series voltage** adds up
4. Simulate **overcurrent protection** on both DC and AC sides
5. Demonstrate **earthing** — why panel frames must be earthed

While ElectraSim doesn't model solar-specific components, the fundamental DC/AC principles are the same.

> [Open ElectraSim — free, no sign-up →](/app/)

---

## Key Points

- Solar panels generate **DC electricity** that must be converted to **AC** by an inverter
- Panels are connected in **series** to form strings with higher DC voltage
- **DC isolator** required at inverter input for safe isolation
- **AC side** connects to consumer unit via MCB/RCBO with RCD protection
- **Panel frames and rails** must be earthed to the main earth terminal
- **Battery storage** can be AC-coupled (flexible) or DC-coupled (efficient)
- **DNO notification** required under G98 (under 3.68 kW) or G99 (larger)
- **Part P notifiable** — use MCS-certified installer
- **Export limiting** can simplify DNO approval for larger systems
