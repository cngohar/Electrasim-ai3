---
title: "Electrical Load Calculations for Home Circuits: How to Size Your Installation"
description: "Calculating electrical load is essential for planning circuits, sizing consumer units, and ensuring your installation can handle demand. This guide explains how to calculate total house load, apply diversity factors, and plan circuit distribution for UK homes."
pubDate: 2026-06-06
author: ElectraSim
category: Beginner Guide
tags: [electrical load calculation, diversity factor, house electrical demand, consumer unit sizing, circuit planning, maximum demand, load assessment, electrical design, BS 7671, domestic load calculation]
---

Before adding new circuits, extending a property, or upgrading a consumer unit, you need to understand the total electrical load. Load calculations tell you whether your existing supply can handle additional demand, what size consumer unit you need, and how to distribute circuits safely.

This guide explains how to calculate total house load, apply diversity factors, and plan circuit distribution for UK domestic installations.

---

## What Is Electrical Load?

**Electrical load** is the total power demand of all connected appliances and circuits, expressed in watts (W) or kilowatts (kW). The corresponding current is measured in amperes (A).

```
P = V × I
I = P / V
```

For a 230 V supply:
- 1 kW = 4.35 A
- 3 kW = 13 A
- 10 kW = 43.5 A

---

## Calculating Total Connected Load

The first step is to list all circuits and their maximum possible load.

### Typical domestic circuit loads

| Circuit | Typical load | Current at 230 V |
|---|---|---|
| **Lighting (per circuit)** | 500–1,000 W | 2.2–4.3 A |
| **Ring main (32 A)** | Up to 7,360 W | 32 A |
| **Radial socket (20 A)** | Up to 4,600 W | 20 A |
| **Cooker (32 A)** | Up to 7,360 W | 32 A |
| **Shower (50 A)** | Up to 11,500 W | 50 A |
| **EV charger (32 A)** | Up to 7,360 W | 32 A |
| **Immersion heater (13 A)** | 3,000 W | 13 A |
| **Underfloor heating** | 1,000–3,000 W | 4.3–13 A |

### Example: 3-bedroom house

| Circuit | Quantity | Load per circuit | Total load |
|---|---|---|---|
| Lighting | 2 | 800 W | 1,600 W |
| Ring main | 2 | 7,360 W | 14,720 W |
| Cooker | 1 | 7,360 W | 7,360 W |
| Shower | 1 | 11,500 W | 11,500 W |
| Immersion | 1 | 3,000 W | 3,000 W |
| **Total connected load** | | | **38,180 W** |

**Current at 230 V:** 38,180 ÷ 230 = **166 A**

This is the **maximum possible load** — every circuit running at full capacity simultaneously. In reality, this never happens.

---

## Diversity Factors

**Diversity** accounts for the fact that not all appliances run simultaneously. The IET On-Site Guide provides diversity factors for domestic installations.

### Standard diversity factors

| Circuit type | Diversity factor |
|---|---|
| **Lighting** | 66% of total connected load |
| **Socket circuits** | 100% of largest circuit + 40% of remaining |
| **Cooker** | 10 A + 30% of remaining load |
| **Shower** | 100% (no diversity) |
| **Immersion heater** | 100% (no diversity) |
| **EV charger** | 100% (no diversity) |

### Applying diversity to our example

**Lighting:** 1,600 W × 66% = **1,056 W**

**Ring mains:** Largest (7,360 W) + 40% of remaining (7,360 × 0.4 = 2,944 W) = **10,304 W**

**Cooker:** 10 A × 230 V = 2,300 W + 30% of remaining (7,360 – 2,300 = 5,060 W × 0.3 = 1,518 W) = **3,818 W**

**Shower:** 11,500 W × 100% = **11,500 W**

**Immersion:** 3,000 W × 100% = **3,000 W**

**Diversified total:** 1,056 + 10,304 + 3,818 + 11,500 + 3,000 = **29,678 W**

**Diversified current:** 29,678 ÷ 230 = **129 A**

This is the **maximum demand** — the load the installation is expected to experience in normal use.

> Related: [How to Wire a Cooker or Electric Oven: UK Circuit Guide](/blog/how-to-wire-a-cooker-electric-oven-uk/)

---

## Incoming Supply Assessment

### Typical domestic supply ratings

| Supply fuse | Maximum continuous load | Typical use |
|---|---|---|
| 60 A | 13,800 W | Small flat, older installations |
| 80 A | 18,400 W | Standard 3-bedroom house |
| 100 A | 23,000 W | Larger house, high demand |

### Comparing demand to supply

Our example house has:
- **Maximum demand:** 129 A
- **Typical supply:** 60–100 A

**Problem:** The demand exceeds the supply rating.

**Solutions:**
1. **Reduce demand** — remove high-load circuits (e.g., electric shower, replace with gas)
2. **Upgrade supply** — request DNO to upgrade incoming fuse (may require network reinforcement)
3. **Load management** — install devices that prevent certain loads operating simultaneously (e.g., EV charger load balancing)

---

## Circuit Distribution Planning

### Consumer unit sizing

The consumer unit must accommodate:

- **Number of ways** (circuit positions) — typically 12–24 for domestic
- **Main switch rating** — typically 100 A
- **RCD/RCBO arrangement** — split-load or full RCBO

### Typical circuit distribution

| Way | Circuit | Protection |
|---|---|---|
| 1 | Main switch | 100 A double-pole |
| 2 | RCD 1 | 63 A 30 mA |
| 3 | Lighting 1 | 6 A RCBO |
| 4 | Lighting 2 | 6 A RCBO |
| 5 | Ring main 1 | 32 A RCBO |
| 6 | Ring main 2 | 32 A RCBO |
| 7 | Cooker | 32 A RCBO |
| 8 | Shower | 50 A RCBO |
| 9 | RCD 2 | 63 A 30 mA |
| 10 | Immersion | 16 A RCBO |
| 11 | EV charger | 32 A RCBO |
| 12 | Spare | — |

---

## Adding New Circuits

### Before adding a circuit

1. **Calculate the new load** — add to existing maximum demand
2. **Check supply capacity** — ensure total demand ≤ supply fuse rating
3. **Check consumer unit space** — is there a spare way?
4. **Check cable routing** — can you physically run the cable?
5. **Check Part P** — is the work notifiable?

### Example: Adding EV charger

**Existing maximum demand:** 129 A
**EV charger load:** 32 A
**New total:** 161 A

**If supply is 100 A:** Exceeds capacity

**Options:**
- **Load balancing** — EV charger reduces charge rate when house demand is high
- **Supply upgrade** — request DNO upgrade to 100 A or higher
- **Remove other loads** — replace electric shower with gas

---

## Load Calculation for Extensions

When extending a property, calculate the additional load:

**Typical extension loads:**
- **Lighting:** 200–400 W
- **Sockets:** 1,500–3,000 W (ring or radial)
- **Heating:** 2,000–4,000 W (radiators or underfloor)

**Example:** 20 m² extension with lighting and sockets

- Lighting: 300 W
- Sockets: 2,000 W
- **Total:** 2,300 W (10 A)

Add this to existing maximum demand and check supply capacity.

---

## Three-Phase Considerations

For very high demand (large houses, heat pumps, three-phase EV chargers), a **three-phase supply** may be appropriate.

**Three-phase advantages:**
- Higher total capacity (typically 100 A per phase = 300 A total)
- Better for large loads (heat pumps, commercial-style kitchens)
- Allows three-phase EV chargers (22 kW)

**Three-phase disadvantages:**
- Not available in all areas
- More complex installation
- Higher cost

> Related: [Single Phase vs Three Phase Power: What's the Difference?](/blog/single-phase-vs-three-phase-power-explained/)

---

## Common Mistakes

| Mistake | Consequence | Correct approach |
|---|---|---|
| Not applying diversity | Overestimates demand, unnecessary upgrades | Use IET diversity factors |
| Ignoring shower load | Exceeds supply capacity | Showers have 100% diversity (no reduction) |
| Adding circuits without checking supply | Fuse blowing, network issues | Calculate demand before adding |
| Underestimating future loads | Need for upgrades later | Plan for EV charger, heat pump, etc. |
| Not considering three-phase | Missed opportunity for high-load homes | Assess if three-phase is available |

---

## Simulating Load Calculations in ElectraSim

[ElectraSim](/app/) can help understand load behaviour:

1. Build multiple circuits representing different loads
2. Add **ammeters** to measure current in each circuit
3. Demonstrate **total current** at the supply
4. Show what happens when a **high-load device** (shower) turns on
5. Simulate **overload** — what happens when demand exceeds protection rating

This makes the relationship between load, current, and protection clearer.

> [Open ElectraSim — free, no sign-up →](/app/)

---

## Key Points

- **Connected load** is the sum of all circuit maximums; **maximum demand** applies diversity
- **Diversity factors** account for appliances not running simultaneously
- **Lighting:** 66% diversity; **Sockets:** 100% of largest + 40% of remaining
- **Cookers:** 10 A + 30% of remaining; **Showers/Immersion/EV:** 100% (no diversity)
- **Check supply capacity** before adding circuits — ensure demand ≤ fuse rating
- **Consumer unit sizing** depends on number of circuits and total demand
- **Three-phase supply** may be needed for very high demand (heat pumps, large EV chargers)
- **Calculate extension loads** before building — add to existing demand
