---
title: "Ohm's Law Explained: Voltage, Current and Resistance for Beginners"
description: "Ohm's Law is the single most important equation in electronics and electrical engineering. This guide explains voltage, current and resistance from scratch, walks through V=IR with real examples, and shows how the law applies to everyday circuits."
pubDate: 2026-05-19
author: ElectraSim
category: Beginner Guide
tags: [ohm's law, voltage, current, resistance, V=IR, electrical fundamentals, circuit theory, watts, power, series circuit, parallel circuit, beginner electricity, electrical engineering basics]
---

Three quantities govern the behaviour of every electrical circuit ever built: **voltage**, **current**, and **resistance**. Ohm's Law is the equation that links all three. Once you understand it, you have the foundation for understanding everything from a torch battery to a domestic ring main.

This guide starts from scratch — no prior knowledge assumed. By the end you will know exactly what voltage, current and resistance mean physically, how to use V = IR to solve real problems, and how Ohm's Law connects to the circuit protection devices in your consumer unit.

You can see Ohm's Law in action live by building circuits in **[ElectraSim](/app/)** — a free, browser-based circuit simulator. Every component you place obeys the same laws explained here.

---

## The Water Analogy

Before diving into definitions, a physical analogy helps. Electricity in a wire behaves similarly to water in a pipe:

| Electrical concept | Water analogy |
|---|---|
| **Voltage (V)** | Water pressure — the force pushing water through the pipe |
| **Current (A)** | Flow rate — how much water passes a point per second |
| **Resistance (Ω)** | Pipe narrowness — how much the pipe restricts the flow |

A high-pressure pump (high voltage) pushes lots of water (high current) through a wide pipe (low resistance). A narrow, kinked pipe (high resistance) restricts flow even under high pressure.

This analogy has limits — electricity is not water — but it gives you the right intuition for how the three quantities relate before the maths.

---

## Voltage (V)

**Voltage** is electrical potential difference — the difference in electrical energy between two points in a circuit. It is measured in **volts (V)**, named after Alessandro Volta.

Voltage does not "flow" through a circuit. It exists *between* two points. When you say "a 9 V battery", you mean there is a 9-volt potential difference between the positive and negative terminals. That difference is what drives current through anything connected between those terminals.

Common voltage levels:

| Source | Typical Voltage |
|---|---|
| AA battery | 1.5 V DC |
| 9 V PP3 battery | 9 V DC |
| Car battery | 12 V DC |
| UK mains supply | 230 V AC |
| UK three-phase supply | 400 V AC (line-to-line) |
| Extra-low voltage (ELV) | ≤ 50 V AC or 120 V DC |

The UK mains supply is **230 V AC** — alternating current that reverses direction 50 times per second (50 Hz). Batteries supply **DC** — direct current that flows in one direction only. Ohm's Law applies to both, though AC circuits introduce additional complexity (impedance) beyond the scope of this guide.

---

## Current (I)

**Current** is the rate of flow of electric charge through a conductor. It is measured in **amperes** (amps, A), named after André-Marie Ampère.

One ampere means one **coulomb** of charge passing a point each second. A coulomb is approximately 6.24 × 10¹⁸ electrons. You do not need to remember those numbers — what matters is the practical meaning: current is *how much* electricity is moving, and it is what heats cables, trips MCBs, and powers loads.

Common current levels:

| Device | Typical Current |
|---|---|
| LED indicator lamp | 20 mA (0.02 A) |
| Smartphone charger | 1–3 A |
| 60 W incandescent lamp at 230 V | ≈ 0.26 A |
| Kettle (2.4 kW) at 230 V | ≈ 10.4 A |
| Electric shower (9.5 kW) at 230 V | ≈ 41.3 A |
| Ring main circuit | up to 32 A total |

Current flows in a closed loop — it must have a complete path from the supply's live terminal, through the load, and back via the neutral. Break the loop anywhere and current stops.

> Related: [Live, Neutral and Earth Wires Explained](/blog/live-neutral-and-earth-wires-explained/)

---

## Resistance (Ω)

**Resistance** is the opposition to the flow of current. It is measured in **ohms (Ω)**, named after Georg Simon Ohm himself.

Every material has resistance. Copper has very low resistance — which is why it is used for cables. Nichrome wire has high resistance — which is why it is used in electric heater elements (resistance converts electrical energy to heat). Air has extremely high resistance — which is why, ordinarily, electricity does not jump across gaps.

Resistance depends on:
- **Material** — copper, aluminium, steel, nichrome all have different resistivity values
- **Length** — a longer wire has more resistance (more material to push through)
- **Cross-sectional area** — a thicker wire has lower resistance (more paths for electrons)
- **Temperature** — most conductors increase resistance as temperature rises

This last point matters practically: a lamp filament at operating temperature has much higher resistance than the same filament at room temperature, which is why lamps draw a surge of current when first switched on.

---

## Ohm's Law: V = IR

Georg Ohm published his law in 1827 after years of careful experiments with wires and batteries. The relationship he found:

> **Voltage = Current × Resistance**

Written as the formula used universally:

```
V = I × R
```

Where:
- **V** = voltage in volts (V)
- **I** = current in amperes (A)
- **R** = resistance in ohms (Ω)

The same equation rearranged gives you all three useful forms:

| To find | Formula | Use when you know |
|---|---|---|
| Voltage | **V = I × R** | Current and resistance |
| Current | **I = V ÷ R** | Voltage and resistance |
| Resistance | **R = V ÷ I** | Voltage and current |

A memory aid many students use: draw a triangle with V at the top, I at the bottom-left, and R at the bottom-right. Cover the quantity you want — the remaining two show the operation.

```
       V
      ───
     I × R
```

---

## Worked Examples

### Example 1 — Finding current

A 230 V supply is connected to a resistive heater element with a resistance of 46 Ω. What current flows?

```
I = V ÷ R
I = 230 ÷ 46
I = 5 A
```

A 5 A fuse or MCB would be appropriate protection for this circuit.

---

### Example 2 — Finding resistance

A 12 V car battery drives 3 A through a load. What is the resistance of the load?

```
R = V ÷ I
R = 12 ÷ 3
R = 4 Ω
```

---

### Example 3 — Finding voltage drop across a cable

A 2.5 mm² copper cable has a resistance of approximately 7.4 mΩ per metre (0.0074 Ω/m). A 20-metre run carries 20 A. What is the total voltage drop?

```
Total resistance = 0.0074 × 20 × 2 = 0.296 Ω
(×2 for the return path — live and neutral both contribute)

Voltage drop = I × R = 20 × 0.296 = 5.92 V
```

At 230 V, a 5.92 V drop is 2.57% — within the 3% limit for lighting circuits and below the 5% limit for power circuits under BS 7671.

> Related: [Electrical Cable Sizes Explained: 1mm², 1.5mm², 2.5mm² and Beyond](/blog/electrical-cable-sizes-explained/)

---

### Example 4 — Working backwards from a tripped MCB

A 6 A MCB on a lighting circuit trips instantly. For a Type B MCB, the instantaneous magnetic trip operates at 3–5 × rated current, so at minimum 18 A. For 18 A to flow on a 230 V circuit:

```
R = V ÷ I = 230 ÷ 18 ≈ 12.8 Ω
```

The fault resistance must be below 12.8 Ω — meaning a direct short or very low-resistance fault to earth or neutral. This gives an electrician a quantitative starting point for fault diagnosis.

---

## Power: The Fourth Quantity

Ohm's Law with one more step gives you **power** — the rate at which energy is converted.

```
P = V × I
```

Where **P** is power in watts (W).

Combined with Ohm's Law, this gives three useful power formulas:

| Formula | Use |
|---|---|
| **P = V × I** | Power from voltage and current |
| **P = I² × R** | Power dissipated in a resistance |
| **P = V² ÷ R** | Power from voltage and resistance |

### Everyday power calculations

**A 2.4 kW kettle at 230 V:**
```
I = P ÷ V = 2400 ÷ 230 = 10.4 A
```

**A 60 W lamp at 230 V:**
```
I = 60 ÷ 230 = 0.26 A
R = V ÷ I = 230 ÷ 0.26 = 884 Ω (hot filament resistance)
```

**Heat dissipated in a 0.3 Ω cable carrying 30 A:**
```
P = I² × R = 30² × 0.3 = 900 × 0.3 = 270 W
```

270 watts of heat in a cable is significant. This is why oversized fuses are dangerous — they allow excessive current to flow before tripping, generating damaging heat in the cable before protection operates.

---

## Ohm's Law in Series and Parallel Circuits

### Series circuit

In a series circuit, components are connected end-to-end in a single loop. The same current flows through every component, and resistances add up.

**Total resistance:** `R_total = R₁ + R₂ + R₃`

If three resistors of 10 Ω, 20 Ω, and 30 Ω are connected in series across 230 V:
```
R_total = 10 + 20 + 30 = 60 Ω
I = V ÷ R = 230 ÷ 60 = 3.83 A
```

The same 3.83 A flows through all three. Voltage divides proportionally — the 30 Ω resistor drops twice the voltage of the 15 Ω resistor.

> Related: [Series vs Parallel Circuits Explained](/blog/series-vs-parallel-circuits/)

### Parallel circuit

In a parallel circuit, each component is connected directly across the same voltage. The voltage across each is the same; current divides between branches.

**Total resistance:** `1/R_total = 1/R₁ + 1/R₂ + 1/R₃`

Adding resistors in parallel always *reduces* total resistance — more paths for current to flow.

Two equal resistors of 10 Ω in parallel:
```
1/R = 1/10 + 1/10 = 2/10
R_total = 5 Ω
```

This is why connecting more appliances to a socket circuit increases the total current drawn from the consumer unit — each appliance adds a parallel branch and reduces the effective resistance of the circuit.

---

## Where Ohm's Law Connects to Circuit Protection

Every MCB, RCBO, and RCD in your consumer unit depends on Ohm's Law operating correctly.

**An MCB trips when current exceeds its rated value.** That excess current is caused by reduced resistance — either a short circuit (near-zero resistance between live and neutral) or a genuine overload (too many appliances drawing current in parallel).

**Earth fault loop impedance (Zs)** — the resistance of the complete fault current path — determines whether an MCB can clear a fault fast enough. If Zs is too high (too much resistance in the earth path), fault current is too low, and the MCB takes too long to trip or does not trip at all. BS 7671 specifies maximum Zs values for every circuit type and breaker rating.

**Voltage drop** — the loss of voltage in long cable runs — is a direct result of Ohm's Law applied to the cable's resistance. Circuits that are too long for their cable size fail their voltage drop requirement.

> Related: [What Is an MCB Breaker? How Miniature Circuit Breakers Work](/blog/what-is-an-mcb-breaker/)

> Related: [What Is an RCBO? The Difference Between RCD, MCB and RCBO Explained](/blog/what-is-an-rcbo-difference-between-rcd-mcb-rcbo/)

---

## Limitations of Ohm's Law

Ohm's Law is strictly true only for **ohmic conductors** — materials where resistance is constant regardless of voltage, current, or temperature. Many real components are non-ohmic:

- **Lamp filaments** — resistance rises sharply with temperature
- **Diodes** — resistance is very high in one direction, very low in the other
- **LEDs** — current rises exponentially with voltage above a threshold
- **Thermistors** — resistance varies significantly with temperature by design
- **AC circuits with inductors and capacitors** — introduce reactance, requiring the more general concept of **impedance (Z)** rather than simple resistance

For the purposes of domestic installation work and circuit protection design, Ohm's Law in its basic form (V = IR) is sufficient to understand and calculate the quantities that matter: fault current, voltage drop, power dissipation, and cable heating.

---

## Try It in ElectraSim

[ElectraSim](/app/) simulates real circuit behaviour based on the same physics explained in this guide. To see Ohm's Law in action:

1. Place a **Power Supply** and a **Bulb** (resistive load)
2. Connect them in a simple series loop
3. Run the simulation — the bulb lights and current flows
4. Add a second bulb **in series** — both glow dimmer (total resistance increased, current reduced)
5. Move the second bulb to **in parallel** — both glow at full brightness (each has full voltage; total resistance halved)

This directly demonstrates:
- V = IR (more resistance → less current → dimmer bulb)
- Parallel circuits maintain full voltage across each branch

> [Open ElectraSim — free, no account needed →](/app/)

---

## Summary

| Quantity | Symbol | Unit | Meaning |
|---|---|---|---|
| Voltage | V | Volt (V) | Potential difference — the "pressure" driving current |
| Current | I | Ampere (A) | Rate of charge flow — "how much" electricity |
| Resistance | R | Ohm (Ω) | Opposition to current flow |
| Power | P | Watt (W) | Rate of energy conversion |

**Ohm's Law: V = I × R**

- More voltage → more current (same resistance)
- More resistance → less current (same voltage)
- Every MCB trip, every voltage drop calculation, and every cable size decision ultimately comes back to this equation

**Build circuits and see V = IR working live in [ElectraSim →](/app/)**
