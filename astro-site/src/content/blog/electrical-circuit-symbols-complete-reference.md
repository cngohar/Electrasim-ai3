---
title: "Electrical Circuit Symbols: Complete Reference Guide"
description: "Every electrical circuit symbol you need — wires, power sources, resistors, capacitors, switches, fuses, MCBs, RCDs, lamps, motors, and more. Includes UK/IEC and US comparisons and a printable reference table."
pubDate: 2026-05-21
author: ElectraSim
category: Reference
tags: [circuit symbols, electrical symbols, circuit diagram, schematic symbols, IEC symbols, resistor symbol, capacitor symbol, switch symbol, fuse symbol, MCB symbol, RCD symbol, lamp symbol, electronics reference]
---

Circuit diagrams and schematics are the universal language of electrical engineering. Every component — from a simple wire junction to a residual current device — has a standardised symbol that communicates its function instantly, without any labels or description needed.

This reference guide covers every circuit symbol you are likely to encounter in domestic wiring diagrams, GCSE and A-Level physics, electronics, and professional electrical schematics. Where the UK/IEC symbol differs from the US ANSI symbol, both are shown.

You can place all of these components — and wire them using the same logic as a circuit diagram — in **[ElectraSim](/app/)**, a free browser-based circuit simulator.

---

## Wires and Connections

These are the building blocks of every circuit diagram.

| Symbol Description | Name | Notes |
|---|---|---|
| Straight horizontal or vertical line | **Wire / Conductor** | A connection between two components |
| Two lines crossing with a dot | **Junction (connected)** | Wires are electrically joined |
| Two lines crossing without a dot | **Crossing (not connected)** | Wires pass over each other, no connection |
| Line ending in a small circle | **Terminal / Node** | A labelled connection point |
| Line to a set of horizontal lines (decreasing size) | **Earth / Ground** | Connected to earth reference potential |
| Line to three downward diagonal lines | **Chassis ground** | Connected to the equipment's metal chassis |

> **Junction rule:** In modern diagrams, a dot at a crossing always means connected. No dot always means not connected. In older diagrams, a "bridge" (small semicircle) was used to show a crossing without connection — if you see this on old schematics, it means the same as no dot today.

---

## Power Sources

| Symbol Description | Name | Notes |
|---|---|---|
| Long line + short line (alternating, 2–4 pairs) | **Battery** | Long line = positive terminal |
| Single long + single short line | **Cell (single)** | One electrochemical cell, e.g. 1.5 V AA |
| Circle with + and − | **DC Voltage Source** | Ideal voltage source, direct current |
| Circle with a sine wave inside | **AC Voltage Source** | Ideal voltage source, alternating current |
| Circle with an arrow inside | **Current Source** | Ideal current source |
| Two circles with a line between | **Transformer** | Voltage step-up or step-down, AC only |
| Circle with crossed lines inside | **Signal Generator** | Variable frequency AC source |

In domestic electrical diagrams you will most often see:
- **AC voltage source** representing the mains supply (230 V, 50 Hz in the UK)
- **Battery** representing DC backup supplies, alarm systems, and UPS units
- **Transformer** representing isolating transformers or SELV supplies in bathroom circuits

---

## Passive Components

These components do not require a power supply to operate — they respond to the voltage and current flowing through them.

### Resistor

| Symbol | Name | Notes |
|---|---|---|
| Rectangle (IEC/UK) | **Resistor** | Fixed resistance, measured in ohms (Ω) |
| Zigzag line (US/ANSI) | **Resistor** | Same component, different convention |
| Rectangle with an arrow through it | **Variable Resistor (Rheostat)** | Two terminals; resistance adjustable |
| Rectangle with arrow (3-terminal) | **Potentiometer** | Three terminals; voltage divider |
| Rectangle with + / − and temperature symbol | **Thermistor (NTC/PTC)** | Resistance varies with temperature |
| Rectangle with light arrows | **Light-Dependent Resistor (LDR)** | Resistance decreases in light |

> Related: [Ohm's Law Explained: Voltage, Current and Resistance](/blog/ohms-law-explained-voltage-current-resistance/)

### Capacitor

| Symbol Description | Name | Notes |
|---|---|---|
| Two parallel lines of equal length | **Capacitor (non-polarised)** | Measured in farads (F) — usually µF or nF |
| One straight line + one curved line | **Electrolytic Capacitor (polarised)** | Straight line = positive; must be connected correctly |
| Two lines with an arrow | **Variable Capacitor** | Capacitance adjustable (e.g. tuning circuit) |

### Inductor / Coil

| Symbol Description | Name | Notes |
|---|---|---|
| Series of loops or humps | **Inductor / Coil** | Measured in henries (H) |
| Loops with two lines beneath | **Iron-Core Inductor** | Core increases inductance |
| Two sets of loops facing each other | **Transformer** | Two inductors sharing a magnetic field |

---

## Switches

Switches interrupt or redirect current flow. The symbol always shows the switch in its **open (off) state** unless otherwise noted.

| Symbol Description | Name | Notes |
|---|---|---|
| Line with a gap and angled arm | **SPST Switch (Single Pole Single Throw)** | Basic on/off switch |
| Line forking to two possible contacts | **SPDT Switch (Single Pole Double Throw)** | Two-way switch; redirects to one of two outputs |
| Two SPST switches linked by a dashed line | **DPST Switch (Double Pole Single Throw)** | Switches two conductors simultaneously |
| Two SPDT switches linked | **DPDT Switch (Double Pole Double Throw)** | Switches two conductors to one of two paths |
| Angled arm with a return spring indicator | **Push-to-Make (Normally Open) Button** | Contact closes only while pressed |
| Angled arm held closed with a spring indicator | **Push-to-Break (Normally Closed) Button** | Contact opens only while pressed |
| Switch with a coil driving it | **Relay (Electromechanical)** | Low-power coil controls high-power contacts |
| Switch with diagonal arrow | **Switch with variable position** | Selector or rotary switch |

> Related: [How to Wire a Two-Way Switch: Complete Guide with Diagrams](/blog/how-to-wire-a-two-way-switch-complete-guide/)

> Related: [Intermediate Switch Wiring: How to Control a Light from Three or More Locations](/blog/intermediate-switch-wiring-three-way-light-switch/)

> Related: [How Does a Push Button Switch Work?](/blog/how-does-a-push-button-switch-work/)

---

## Semiconductor Components

| Symbol Description | Name | Notes |
|---|---|---|
| Triangle pointing right with a vertical bar | **Diode** | Allows current in one direction only |
| Diode with light arrows pointing outward | **LED (Light Emitting Diode)** | Emits light when forward-biased |
| Diode with light arrows pointing inward | **Photodiode** | Generates current when light strikes it |
| Diode with a Z-shaped cathode bar | **Zener Diode** | Regulates voltage; designed to conduct in reverse |
| Three-terminal transistor (arrow on emitter) | **BJT Transistor (NPN/PNP)** | Current-controlled amplifier/switch |
| Three-terminal symbol with insulated gate | **MOSFET** | Voltage-controlled switch; used in trailing edge dimmers |
| Three-terminal bidirectional symbol | **TRIAC** | Bidirectional AC switch; used in leading edge dimmers |
| Four-layer symbol | **Thyristor (SCR)** | One-directional latching switch |

> Related: [How a Dimmer Switch Works: Trailing Edge vs Leading Edge](/blog/how-a-dimmer-switch-works-trailing-edge-leading-edge/)

---

## Protective Devices

These are among the most important symbols for domestic and commercial electrical diagrams.

| Symbol Description | Name | Notes |
|---|---|---|
| Line through a small oval or rectangle | **Fuse** | Melts to break circuit under overcurrent |
| Small square with a flag/trip indicator | **MCB (Miniature Circuit Breaker)** | Resets after trip; thermal + magnetic protection |
| Square with a wavy line (residual current symbol) | **RCD (Residual Current Device)** | Trips on earth leakage imbalance |
| Combined MCB + RCD symbol | **RCBO** | Overcurrent + earth leakage protection combined |
| Rectangle divided with a switch arc | **Circuit Breaker (generic)** | Used for larger LV/MV breakers |
| Two rectangles with a link | **Isolator / Disconnector** | No overcurrent protection; isolation only |

In UK domestic wiring diagrams:
- **MCB** is shown per circuit branch from the consumer unit bus bar
- **RCD** may be shown as a master device protecting groups of MCBs
- **RCBO** replaces the MCB per circuit when individual RCD protection is needed

> Related: [What Is an MCB Breaker? How Miniature Circuit Breakers Work](/blog/what-is-an-mcb-breaker/)

> Related: [What Is an RCD and Why Do You Need One?](/blog/what-is-an-rcd-and-why-do-you-need-one/)

> Related: [What Is an RCBO? The Difference Between RCD, MCB and RCBO Explained](/blog/what-is-an-rcbo-difference-between-rcd-mcb-rcbo/)

---

## Output Devices / Loads

| Symbol Description | Name | Notes |
|---|---|---|
| Circle with an X inside | **Lamp / Light Bulb** | General luminaire symbol |
| Circle with a cross and light rays | **Lamp (alternative)** | Same meaning; used in some standards |
| LED symbol (see semiconductors) | **LED Lamp** | Light emitting diode as a light source |
| Circle with an M inside | **Motor (DC or AC)** | Converts electrical energy to mechanical |
| Circle with a G inside | **Generator** | Converts mechanical energy to electrical |
| Two horizontal lines with connection | **Heating Element** | Resistive heater; electric fire, immersion |
| Bell shape | **Electric Bell / Buzzer** | Alarm, doorbell circuit |
| Speaker symbol | **Loudspeaker** | Audio output |
| Coil symbol with contacts | **Solenoid / Relay Coil** | Electromagnetic actuator |
| Rectangle with a fan symbol | **Fan / Motor Load** | Ventilation, extraction circuits |

> Related: [What is a Contactor and How Does It Work?](/blog/what-is-a-contactor-and-how-does-it-work/)

---

## Measuring Instruments

| Symbol Description | Name | Measures |
|---|---|---|
| Circle with a V | **Voltmeter** | Voltage (connected in parallel) |
| Circle with an A | **Ammeter** | Current (connected in series) |
| Circle with an Ω or R | **Ohmmeter** | Resistance (circuit de-energised) |
| Circle with a W | **Wattmeter** | Power |
| Circle with Hz | **Frequency Meter** | Frequency |
| Circle with kWh | **Energy Meter** | Cumulative energy consumption |
| Circle with a PF | **Power Factor Meter** | Power factor (ratio of real to apparent power) |

**Connection rule:** voltmeters and other high-impedance meters connect in **parallel** (across the component being measured). Ammeters and other low-impedance meters connect in **series** (in line with the current path).

> Related: [Ohm's Law Explained: Voltage, Current and Resistance](/blog/ohms-law-explained-voltage-current-resistance/)

---

## Earth and Bonding Symbols

| Symbol Description | Name | Notes |
|---|---|---|
| Line to three horizontal lines (decreasing length) | **Earth (IEC)** | Connected to earth potential |
| Line to a triangle point-down | **Earth (alternative)** | Same meaning |
| Line to three diagonal lines | **Protective Earth (PE)** | Safety earth — must not be removed |
| Line to horizontal lines with a circle | **Functional Earth** | Earth for circuit operation, not safety |
| Dashed line between metalwork symbols | **Main Bonding Conductor** | Equi-potential bonding between services |

> Related: [Live, Neutral and Earth Wires Explained](/blog/live-neutral-and-earth-wires-explained/)

> Related: [Types of Earthing Systems Explained: TN-S, TN-C-S (PME) and TT](/blog/types-of-earthing-systems-tn-s-tn-c-s-tt-explained/)

---

## Wiring Accessories (Domestic UK Diagrams)

These symbols appear specifically in domestic wiring layout drawings rather than traditional circuit schematics.

| Symbol | Name | Notes |
|---|---|---|
| Rectangle with two circles | **Single Socket Outlet** | Standard 13 A BS 1363 socket |
| Rectangle with two circles (×2) | **Double Socket Outlet** | Two-gang |
| Rectangle with circle and key symbol | **Switched Socket** | Socket with integral switch |
| Circle with a cross | **Light Point (ceiling)** | Ceiling rose or light fitting position |
| Circle with lines indicating switch | **Single Light Switch** | One-way or two-way switch |
| Two linked circles with switch | **Two-Gang Switch** | Controls two separate lighting circuits |
| Circle with pull cord symbol | **Pull-Cord Switch** | For bathrooms; no exposed metal |
| Rectangle with F | **Fused Connection Unit (FCU)** | Permanently connected appliance spur |
| Rectangle with cooker symbol | **Cooker Control Unit** | Switched outlet for electric cooker/hob |
| Rectangle with immersion symbol | **Immersion Heater Switch** | Double-pole switch for immersion heater |
| D-shaped symbol | **Consumer Unit / Distribution Board** | Shows position in wiring layout |

> Related: [Distribution Board Explained: How a Consumer Unit Is Wired](/blog/distribution-board-explained-how-a-consumer-unit-is-wired/)

---

## UK/IEC vs US/ANSI Symbol Differences

The two most common symbol systems in the world differ on several key components:

| Component | UK / IEC Symbol | US / ANSI Symbol |
|---|---|---|
| **Resistor** | Rectangle | Zigzag line |
| **Earth / Ground** | Three horizontal lines (decreasing) | Three lines to a point |
| **Fuse** | Oval or rectangle with line through | S-shaped or rectangle |
| **Battery** | Long + short lines (multiple) | Long + short lines (same, but often just two) |
| **Capacitor (polarised)** | Straight + curved line | Two straight lines (one marked +) |
| **Lamp** | Circle with X | Circle with filament curves |

For UK school curricula (GCSE Physics, A-Level, BTEC Electrical), always use **IEC 60617** symbols — these are the standard used in UK exam mark schemes.

---

## Using Symbols in ElectraSim

[ElectraSim](/app/) uses a component palette where every item maps directly to the symbols in this guide. When you place a component in ElectraSim:

- Each component behaves according to its electrical model — resistors obey Ohm's Law, switches interrupt current, MCBs trip on overcurrent
- Wires connect nodes exactly as shown in a circuit diagram
- Fault Simulation Mode lets you inject open circuits, reverse polarity, and earth faults — the same fault conditions you would analyse using a circuit diagram

> [Open ElectraSim — build your first circuit →](/app/)

---

## Quick Reference Summary

| Category | Key Symbols |
|---|---|
| **Connections** | Wire, junction (dot), crossing (no dot), earth |
| **Sources** | Battery, cell, AC supply, DC supply, transformer |
| **Passive** | Resistor (rectangle/zigzag), capacitor, inductor |
| **Switches** | SPST, SPDT, DPST, push-to-make, push-to-break, relay |
| **Semiconductors** | Diode, LED, MOSFET, TRIAC, transistor |
| **Protection** | Fuse, MCB, RCD, RCBO, isolator |
| **Outputs** | Lamp, motor, heater, bell, LED |
| **Instruments** | Voltmeter (V), ammeter (A), ohmmeter (Ω) |
| **Earthing** | Protective earth, functional earth, bonding |
| **Domestic** | Socket, ceiling rose, switch, FCU, consumer unit |
