---
title: "How to Wire an Electric Shower: Cable Size, MCB Rating and Safe Installation"
description: "Electric showers draw 40–50 A and need dedicated high-current circuits. This UK guide explains cable sizing, MCB/RCBO selection, double-pole isolation, routing requirements, and Part P notification for safe shower installation."
pubDate: 2026-05-29
author: ElectraSim
category: Wiring Guide
tags: [electric shower wiring, shower circuit, 8.5kW shower, 9.5kW shower, 10.5kW shower, cable size shower, 10mm cable, 45 amp MCB, 50 amp MCB, RCBO shower, double pole switch, Part P, BS 7671, bathroom zones]
---

An electric shower is one of the highest-power appliances in a domestic property, drawing 40–50 A continuously while in use. Unlike a cooker that cycles on and off, a shower pulls full power for the entire duration. This demands a dedicated circuit with correct cable sizing, proper protection, and safe isolation — cutting corners risks cable overheating, breaker nuisance tripping, or worse.

This guide covers everything from cable selection to final testing. You can explore high-current circuit protection in **[ElectraSim](/app/)** before committing to any installation work.

---

## Understanding Electric Shower Power Ratings

Electric showers are rated by power output, typically:

| Rating | Current at 230 V | Common cable size | Typical MCB |
|---|---|---|---|
| 7.5 kW | 32.6 A | 6 mm² | 40 A |
| 8.5 kW | 37 A | 10 mm² | 40 A |
| 9.5 kW | 41.3 A | 10 mm² | 45–50 A |
| 10.5 kW | 45.7 A | 10 mm² | 50 A |

The calculation is simple:

```
I = P / V
```

For a 9.5 kW shower: 9,500 ÷ 230 = **41.3 A**

This is continuous load for the duration of the shower — 5–15 minutes of sustained high current.

---

## Cable Sizing for Electric Showers

### Minimum cable sizes

| Shower rating | Minimum cable | Safer choice |
|---|---|---|
| Up to 8.5 kW | 6 mm² | 10 mm² |
| 9.5 kW and above | 10 mm² | 10 mm² (or 16 mm² for very long runs) |

**Why 10 mm² is the standard choice:**

A 6 mm² twin and earth cable clipped direct has a current-carrying capacity of 47 A at 30°C ambient. An 8.5 kW shower draws 37 A — within the rating, but with little headroom for:

- Thermal insulation in walls or loft spaces (derating factor)
- Voltage drop over long cable runs
- Future upgrade to a higher-power shower

A **10 mm² cable** has a current-carrying capacity of 65 A clipped direct — comfortable margin for any domestic shower, better voltage drop performance, and future-proofing.

### Voltage drop check

For a shower circuit, the cable run is often 15–25 m from the consumer unit to the shower location. Using 10 mm² twin and earth (mV/A/m ≈ 4.4):

```
V_drop = (4.4 × 45 × 20) / 1000 = 3.96 V
```

3.96 V against the 5% limit (11.5 V for power circuits) — well within limits even at 20 m.

If using 6 mm² for a long run (30+ m), voltage drop becomes marginal and 10 mm² is strongly advised.

> Related: [Voltage Drop Explained: How to Calculate It and Why It Matters](/blog/voltage-drop-explained-how-to-calculate-it/)

> Related: [Electrical Cable Sizes Explained: 1mm², 1.5mm², 2.5mm² and Beyond](/blog/electrical-cable-sizes-explained/)

---

## Protection at the Consumer Unit

The shower circuit requires a dedicated MCB or RCBO in the consumer unit.

### MCB rating selection

| Shower rating | MCB rating | Type |
|---|---|---|
| 7.5–8.5 kW | 40 A | Type B |
| 9.5 kW | 45 A | Type B |
| 10.5 kW | 50 A | Type B |

The MCB rating must be **equal to or greater than** the shower's full-load current, but **not exceeding** the cable's current-carrying capacity (after any derating).

- 10 mm² cable: 65 A capacity → 50 A MCB is safe
- 6 mm² cable: 47 A capacity → 40 A MCB maximum

### RCBO strongly recommended

While not strictly mandatory for a shower (it's a fixed appliance, not a socket), an **RCBO** (combined MCB + 30 mA RCD) is strongly recommended:

- The shower is in a bathroom (Zone 2 or 3) where water is present
- An RCBO provides earth leakage protection without nuisance tripping the whole house
- Modern 18th Edition installations favour RCBOs for all circuits

> Related: [What Is an RCBO? The Difference Between RCD, MCB and RCBO Explained](/blog/what-is-an-rcbo-difference-between-rcd-mcb-rcbo/)

### Earth fault loop impedance (Zs)

After installation, the Zs at the shower terminal block must be low enough to ensure the MCB/RCBO will trip within the required time under fault conditions.

For a 50 A Type B MCB: maximum Zs = **0.91 Ω** (from BS 7671 Table 41.2)

If the measured Zs is too high, the cable run may be too long or the earthing system impedance too high — consult an electrician.

---

## The Shower Isolation Switch

An electric shower must have a **double-pole isolation switch** mounted outside the bathroom, with a **45 A minimum rating** (or 50 A for 10.5 kW showers).

### Why double-pole?

A double-pole switch disconnects both **live and neutral** simultaneously. This ensures the shower is fully isolated for maintenance — no risk of residual voltage or neutral current.

### Positioning requirements

- **Outside the bathroom** — never inside Zone 2 or within reach of the shower enclosure
- **Readily accessible** — within easy reach, not hidden in a cupboard
- **Visible indicator** — many shower switches have a neon or LED indicator showing "on"
- **Standard mounting height** — 1,400–1,600 mm from floor level
- **Within 3 m** of the shower location (for practical wiring)

Common locations:
- Hallway outside the bathroom door
- Bedroom adjacent to the bathroom
- Airing cupboard (if not steamy)

The switch must be **notifiable under Part P** if it forms part of a new circuit or significant alteration.

---

## Wiring the Shower Circuit

### Route from consumer unit to isolation switch

Run **10 mm² twin and earth** from the dedicated MCB/RCBO in the consumer unit to the shower isolation switch:

- Brown (live) → L terminal of MCB, then L input of switch
- Blue (neutral) → N bar, then N input of switch
- Green/yellow (earth) → Earth bar, then earth terminal of switch

### Route from isolation switch to shower

From the switch output terminals to the shower's terminal block:

- Switch L output → Shower L terminal
- Switch N output → Shower N terminal
- Earth terminal → Shower earth terminal

The shower unit itself contains the heating element, thermal cut-out, and flow switch. The terminal block is usually rated for 6–10 mm² conductors.

### Shower in bathroom zones

The shower unit is typically mounted on the wall within **Zone 3** (outside the 0.6 m Zone 2 boundary) or on a wall that does not form part of the shower enclosure. The unit must be:

- IPX4 minimum (splash-proof)
- Connected via the double-pole switch outside the zones
- Supplied from a circuit with appropriate RCD protection

> Related: [How to Wire a Bathroom: Complete Zone-by-Zone UK Guide](/blog/how-to-wire-a-bathroom-zone-by-zone-uk-guide/)

> Related: [IP Rating Explained: IP44, IP65, IP67 and What Every Number Means](/blog/ip-rating-explained-ip44-ip65-ip67/)

---

## Part P Notification

Installing a new electric shower circuit is **notifiable work under Part P** of the Building Regulations. This includes:

- Running a new circuit from the consumer unit
- Installing the isolation switch
- Connecting the shower unit

Options:
- Use a **Part P-registered electrician** who self-certifies and issues an EIC
- Notify **Building Control** before starting and arrange inspection

Replacement of an existing shower on an existing compliant circuit (like-for-like) is not notifiable, provided no alterations are made to the circuit.

> Related: [When to Get an EICR: The Complete Electrical Safety Inspection Guide](/blog/when-to-get-an-eicr-electrical-inspection-guide/)

---

## Testing Before Use

Before energising the new shower circuit, a qualified electrician must:

1. **Insulation resistance test** — confirms no short between live, neutral, and earth
2. **Polarity test** — confirms correct connections at all points
3. **Earth continuity** — low resistance path from shower earth terminal to MET
4. **Earth fault loop impedance (Zs)** — confirms protection will operate under fault
5. **RCBO functionality** — passes the required 30 mA RCD/RCBO trip-time tests

Results are recorded on an **Electrical Installation Certificate (EIC)**.

---

## Common Mistakes

| Mistake | Risk | Correct approach |
|---|---|---|
| 6 mm² cable for 9.5 kW+ shower | Cable overheating, voltage drop | Use 10 mm² minimum for 9.5 kW+ |
| 40 A MCB for 10.5 kW shower (46 A) | MCB nuisance tripping during use | Use 50 A MCB with 10 mm² cable |
| Single-pole switch only | Neutral stays live when "off" | Double-pole switch mandatory |
| Switch inside bathroom | Non-compliant, shock hazard | Mount outside bathroom |
| No RCD/RCBO protection | Earth fault not cleared | RCBO at consumer unit |
| Tapping off socket circuit | Overload, fire risk | Dedicated circuit from CU |

---

## Simulating a Shower Circuit in ElectraSim

High-current circuits behave differently under fault conditions than low-current lighting circuits. In [ElectraSim](/app/):

1. Build a circuit with a **50 A RCBO**, **double-pole switch**, and a high-power **load** (simulating the shower element)
2. Run at rated current — observe normal operation
3. Create an **earth fault** using Fault Simulation Mode — the RCBO trips on leakage even if the current is well below 50 A
4. Create an **overload** — the MCB element trips after sustained overcurrent
5. Compare with a circuit protected by MCB-only (no RCD) — the earth fault does not trip the MCB if the leakage is below 50 A

This demonstrates why RCBO protection is essential for bathroom locations.

> [Open ElectraSim — free, no sign-up →](/app/)

---

## Key Points

- Electric showers draw **40–50 A continuously** — higher than almost any other domestic appliance
- **10 mm² twin and earth** is the standard cable for 9.5 kW and above
- **40–50 A Type B MCB or RCBO** required, depending on shower rating
- **Double-pole isolation switch** mandatory, mounted **outside the bathroom**
- **New shower circuit = Part P notifiable** — use a registered electrician or notify Building Control
- Test **Zs, polarity, insulation resistance, and RCBO operation** before first use
- Never tap a shower off an existing socket circuit — always run a dedicated circuit from the consumer unit
