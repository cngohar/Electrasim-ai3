---
title: "Electric Underfloor Heating Wiring: Mat, Cable and Thermostat Installation"
description: "Electric underfloor heating provides comfortable warmth without radiators. This UK guide explains mat vs cable systems, 230 V vs SELV options, thermostat wiring, load calculations, floor insulation requirements, and safe installation."
pubDate: 2026-06-06
author: ElectraSim
category: Wiring Guide
tags: [underfloor heating wiring, electric floor heating, heating cable, heating mat, thermostat wiring, floor insulation, load calculation, bathroom heating, kitchen heating, tiled floor heating, BS 7671]
---

Electric underfloor heating is an increasingly popular alternative to radiators, particularly in bathrooms, kitchens, and tiled areas. It provides even warmth across the floor surface and frees up wall space. The electrical installation requires careful planning — load calculation, cable routing, thermostat wiring, and floor insulation are all critical for safe and efficient operation.

This guide covers mat vs cable systems, 230 V vs SELV options, thermostat connections, and the electrical requirements for a compliant UK installation.

---

## Underfloor Heating System Types

### Heating mats

**Heating mats** consist of a heating cable pre-attached to a mesh mat. The mat is rolled out across the floor and secured with adhesive or tile adhesive.

**Advantages:**
- Quick installation — cable spacing is pre-set
- Uniform heat distribution
- Easy to calculate coverage area
- Ideal for regular-shaped rooms

**Disadvantages:**
- Less flexible for irregular shapes
- Harder to work around obstacles
- More expensive than loose cable

### Heating cables

**Loose heating cables** are laid manually across the floor with spacing determined by the installer.

**Advantages:**
- Flexible — can work around obstacles and irregular shapes
- More cost-effective for large areas
- Can be used in rooms with complex layouts

**Disadvantages:**
- Requires careful spacing measurement
- Installation takes longer
- Risk of incorrect spacing if not careful

---

## 230 V vs SELV (12 V) Systems

### 230 V systems

Standard mains voltage underfloor heating. The heating element is connected directly to 230 V AC.

**Typical power density:** 100–150 W/m²

**Cable:** 2.5 mm² twin and earth to thermostat, then heating element cable from thermostat

**Protection:** 6 A or 10 A MCB/RCBO at consumer unit, RCD protection required

### SELV (Safety Extra-Low Voltage) systems

12 V systems with a transformer. The heating element operates at 12 V DC.

**Typical power density:** 80–120 W/m² (lower due to higher current at 12 V)

**Cable:** 2.5 mm² twin and earth to transformer, then 4–6 mm² DC cable to heating element

**Protection:** 6 A MCB/RCBO for transformer primary, DC side requires overcurrent protection

**Advantages of SELV:**
- Safer in wet areas (bathrooms, wet rooms)
- Can be installed closer to wet zones
- Lower shock risk if cable damaged

**Disadvantages:**
- Higher cost (transformer required)
- Thicker DC cables required
- Lower power density

> Related: [How to Wire a Bathroom: Complete Zone-by-Zone UK Guide](/blog/how-to-wire-a-bathroom-zone-by-zone-uk-guide/)

---

## Load Calculations

### Calculating total load

```
Total load (W) = Floor area (m²) × Power density (W/m²)
```

**Example:** 10 m² bathroom at 120 W/m²
```
Total load = 10 × 120 = 1,200 W
Current = 1,200 / 230 = 5.2 A
```

### Circuit protection

| Total load | MCB/RCBO rating | Cable size |
|---|---|---|
| Up to 1,380 W (6 A) | 6 A | 1.5 mm² or 2.5 mm² |
| 1,380–2,300 W (10 A) | 10 A | 2.5 mm² |
| 2,300–3,450 W (15 A) | 16 A | 2.5 mm² or 4 mm² |

Most single-room underfloor heating systems are **6 A or 10 A** circuits.

### Multiple rooms

If heating multiple rooms from one circuit, sum the loads:

```
Total load = (Area1 × Density1) + (Area2 × Density2) + ...
```

If total exceeds 16 A, consider separate circuits or reduce power density.

---

## Thermostat Wiring

### Thermostat types

| Type | Features | Typical use |
|---|---|---|
| **Programmable** | Time/temp schedules | Most installations |
| **Smart WiFi** | Remote control, app | Modern homes |
| **Floor sensor** | Measures floor temp | Tile floors |
| **Air sensor** | Measures room temp | Carpeted floors |
| **Dual sensor** | Both floor and air | Best control |

### Wiring diagram

```
Consumer unit
        |
        v
[MCB/RCBO 6A-16A]
        |
        +--- 2.5 mm² cable ---+
        |                      |
        |                      v
        +------------- [Thermostat]
        |                      |
        +--- Heating element cable ---+
        |                             |
        +-----------------------------+
```

**Thermostat terminals:**
- **L (Live)** — from MCB/RCBO
- **N (Neutral)** — from neutral bar
- **E (Earth)** — from earth bar
- **L1** — to heating element
- **N1** — to heating element (if applicable)
- **Sensor** — floor temperature sensor (if equipped)

### Floor sensor installation

The floor sensor is embedded in the floor between heating cables:

- Position in the centre of the heated area
- Avoid placing directly over a heating cable
- Use conduit to allow sensor replacement if needed
- Connect to thermostat sensor terminals

---

## Floor Preparation and Insulation

### Insulation requirements

**Critical:** Underfloor heating is inefficient without proper insulation. Heat will simply escape downwards into the subfloor.

**Minimum insulation:**
- **Concrete subfloor:** 25–50 mm insulation board
- **Timber subfloor:** 10–20 mm insulation board
- **Suspended floors:** 50 mm+ insulation between joists

**Insulation types:**
- **Polystyrene boards** — common, cost-effective
- **Phenolic boards** — higher performance, thinner
- **XPS boards** — moisture-resistant

### Floor covering compatibility

| Floor covering | Suitable? | Notes |
|---|---|---|
| **Ceramic/porcelain tiles** | Excellent | Best heat transfer |
| **Stone tiles** | Excellent | Good heat transfer |
| **Laminate** | Good | Check manufacturer's rating |
| **Engineered wood** | Good | Check manufacturer's rating |
| **Vinyl/LVT** | Good | Check manufacturer's rating |
| **Carpet** | Poor | Insulates floor, reduces efficiency |

---

## Installation Steps

### 1. Plan the layout

- Mark the floor area to be heated
- Identify obstacles (toilet, vanity, bath)
- Plan cable routing avoiding obstacles
- Calculate total cable length required

### 2. Install insulation

- Lay insulation boards over subfloor
- Tape joints to prevent thermal bridging
- Ensure level surface

### 3. Install heating mat/cable

- **Mats:** Roll out mat, cut mesh to fit around obstacles (do not cut cable)
- **Cables:** Lay cable with correct spacing (typically 75–150 mm apart)
- Secure with tape or adhesive
- Install floor sensor in conduit

### 4. Test before tiling/flooring

- Use multimeter to check continuity
- Measure resistance (compare to manufacturer's spec)
- Power up briefly to confirm operation
- Document resistance reading

### 5. Install thermostat

- Mount thermostat at appropriate height (1.4–1.6 m)
- Connect wiring according to diagram
- Connect floor sensor
- Test operation

### 6. Complete flooring

- Install floor covering over heating system
- Ensure no damage to cables during installation
- Final test after flooring complete

---

## Bathroom Zone Requirements

Underfloor heating in bathrooms must comply with BS 7671 zone requirements:

| Zone | Underfloor heating allowed? | Requirements |
|---|---|---|
| **Zone 0** | No | Inside bath/shower |
| **Zone 1** | No | Above bath/shower to 2.25 m |
| **Zone 2** | SELV only | 0.6–2.4 m horizontally |
| **Zone 3** | 230 V or SELV | Beyond 2.4 m |

**230 V systems:** Must be outside Zone 2
**SELV systems:** Can be used in Zone 2

> Related: [IP Rating Explained: IP44, IP65, IP67 and What Every Number Means](/blog/ip-rating-explained-ip44-ip65-ip67/)

---

## Part P and Notification

Installing underfloor heating is **notifiable work under Part P** if:

- New circuit from consumer unit
- Work in a bathroom or special location
- Significant alteration to existing circuit

Use a Part P-registered electrician or notify Building Control.

---

## Common Mistakes

| Mistake | Result | Correct approach |
|---|---|---|
| No insulation | Heat loss, high running costs | Install insulation board first |
| Incorrect cable spacing | Hot/cold spots, uneven heating | Follow manufacturer's spacing |
| Cutting heating cable | System failure | Cut only the mat mesh, not the cable |
| No floor sensor | Overheating risk | Install sensor in conduit |
| Wrong thermostat location | Poor control | Mount away from direct heat sources |
| Not testing before flooring | Cannot access if faulty | Test and document before tiling |
| 230 V in bathroom Zone 2 | Non-compliant, shock hazard | Use SELV or move outside Zone 2 |

---

## Simulating Heating Circuits in ElectraSim

[ElectraSim](/app/) can demonstrate the electrical principles:

1. Build a **resistive load circuit** representing the heating element
2. Calculate **current** for different power ratings
3. Demonstrate **overcurrent protection** — MCB sizing
4. Show **voltage drop** on long cable runs
5. Compare **230 V vs 12 V** — current differences for same power

Understanding the electrical fundamentals helps with load calculations and circuit protection.

> [Open ElectraSim — free, no sign-up →](/app/)

---

## Key Points

- **Heating mats** are quicker to install; **loose cables** are more flexible for irregular shapes
- **230 V systems** are standard; **SELV (12 V)** is required in bathroom Zone 2
- **Load calculation:** Area × Power density = Total watts; divide by 230 for current
- **6–10 A circuits** are typical for single-room systems
- **Floor insulation is critical** — 25–50 mm minimum for concrete subfloors
- **Thermostat** requires L, N, E connections plus floor sensor
- **Test resistance** before flooring — document the reading
- **Bathroom zones:** 230 V only in Zone 3; SELV allowed in Zone 2
- **Part P notifiable** for new circuits or bathroom work
