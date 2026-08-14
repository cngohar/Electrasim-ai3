---
title: "How to Wire an Immersion Heater and Cylinder: Single, Dual and Economy 7 Setup"
description: "Immersion heaters provide backup or primary hot water heating. This UK guide explains single and dual element wiring, timer and boost switch connections, cable sizing, and Economy 7 off-peak heating setups."
pubDate: 2026-05-30
author: ElectraSim
category: Wiring Guide
tags: [immersion heater wiring, dual immersion heater, economy 7 immersion, hot water cylinder, timer switch wiring, boost switch, 3kW heater element, copper cylinder, indirect cylinder, solar immersion, off-peak heating]
---

An immersion heater is an electric heating element inside a hot water cylinder. It can serve as the primary hot water source in flats without gas, or as backup to a boiler. Wiring an immersion correctly requires understanding element ratings, control methods, and dual-element cylinder rules.

This guide covers single and dual immersion wiring, timer connections, Economy 7 setups, and cable requirements.

---

## Immersion Heater Types

### Single element
One heating element at the cylinder top. Heats the top 40–50 litres only.
- Rating: **3 kW** (13 A)
- Suitable for small households, backup heating

### Dual element
Two heating elements:
- **Top element** (1 kW or 3 kW) — quick heat for small volume
- **Bottom element** (3 kW) — heats full cylinder overnight

Dual cylinders are standard for Economy 7 installations.

---

## Power Calculations

| Rating | Current at 230 V | Circuit |
|---|---|---|
| 1 kW | 4.3 A | Can share lighting |
| 2 kW | 8.7 A | FCU recommended |
| 3 kW | 13 A | Dedicated circuit or 13 A FCU |

```
I = P / V = 3,000 / 230 = 13 A
```

A 3 kW element draws 13 A continuously. Use **fused connection unit** or dedicated circuit, not a plug.

---

## Wiring a Single Immersion

### FCU with boost switch

```
Supply (via FCU from ring or dedicated)
        |
        v
[Fused Connection Unit 13A, switched]
        |
        +--- 2.5 mm² cable ---+
        |                      |
        |                      v
        +------------- [Immersion 3kW]
        |                      |
        +--- Return ------------+
```

**Components:**
- **13 A FCU** — fuse protects cable
- **2.5 mm² twin and earth** — rated for 20 A
- **Thermostat** — built-in, typically 60–70°C

### Dedicated circuit

For primary heating:
- **16 A RCBO** at consumer unit
- **2.5 mm² cable**
- **20 A double-pole switch** with neon near cylinder

---

## Wiring a Dual Immersion

### Economy 7 setup

```
Off-peak supply (Economy 7)
        |
        v
[Timer or ripple receiver]
        |
        +--- 2.5 mm² --- [Bottom Element 3kW]

Normal supply
        |
        v
[FCU or switch]
        |
        +--- 1.5 mm² --- [Top Element 1-3kW]
```

**How it works:**
- **Bottom element** runs overnight on cheap Economy 7
- **Top element** runs on peak rate for quick top-up

> Related: [How a Timer Switch Works and How to Wire One](/blog/how-a-timer-switch-works-and-how-to-wire-one/)

---

## Control Methods

### Built-in thermostat
- Rod thermostat clips to element
- Temperature: 50–80°C
- Safety cut-out: manual reset if primary fails

### Timer control
- **Mechanical** — 24-hour or 7-day
- **Digital** — programmable schedules
- **Ripple control** — utility-controlled for off-peak

### Boost switch
- Manual override forces immersion on
- Often near cylinder or in kitchen
- Label clearly to avoid unintended peak-rate use

---

## Cable Sizing

| Element | Cable | Protection |
|---|---|---|
| 3 kW | 2.5 mm² | 13 A FCU or 16 A MCB |
| Dual 6 kW (simultaneous) | 4–6 mm² | 32 A MCB |

Most dual cylinders only run one element at a time via selector switch.

---

## Part P Notification

Installing or replacing an immersion is **notifiable** if:
- New circuit or significant alteration
- Work in a bathroom/affected location
- New FCU installed

Use a Part P-registered electrician or notify Building Control.

---

## Key Points

- **3 kW = 13 A** — wire via FCU or dedicated circuit, not a plug
- **Dual immersion** typically has separate off-peak and peak supplies
- **10 mm² cable** for 7 kW+, **6 mm²** for 3 kW
- **Economy 7** uses bottom element overnight, top element for boost
- **Built-in thermostat** controls temperature with safety cut-out
- **Part P notifiable** for new installations
