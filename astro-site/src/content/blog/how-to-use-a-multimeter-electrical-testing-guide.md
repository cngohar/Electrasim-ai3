---
title: "How to Use a Multimeter: Electrical Testing Guide for Beginners"
description: "A multimeter is the most useful tool in any electrician's or DIYer's kit. This UK guide covers voltage, continuity, resistance, and current measurements — how to set up the meter, what the readings mean, and how to use a multimeter safely on domestic wiring."
pubDate: 2026-06-16
author: ElectraSim
category: Tips & Tricks
tags: [how to use a multimeter, multimeter guide, multimeter testing, voltage measurement, continuity test, resistance test, current measurement, AC voltage, DC voltage, multimeter settings, electrical testing, test equipment, fault finding, domestic wiring, beginner electrical, multimeter UK]
---

A multimeter is the single most useful piece of test equipment for anyone working on electrical circuits — from diagnosing a dead socket to testing a battery, checking continuity in a length of cable, or measuring the voltage at a consumer unit. Yet many homeowners and apprentices own one and barely know how to use it.

This guide covers everything you need to know: what a multimeter measures, how to set it up correctly, what the readings mean, and how to use it safely on domestic wiring. All the measurements described here are directly relevant to the circuits you can build and simulate in **[ElectraSim](/app/)**.

---

## What a Multimeter Measures

A multimeter combines several instruments into one:

| Function | What it measures | Typical use |
|---|---|---|
| **AC Voltage (V~)** | Alternating voltage between two points | Testing mains sockets, consumer unit, lighting circuits |
| **DC Voltage (V⎓)** | Direct voltage between two points | Testing batteries, 12 V systems, LED drivers |
| **Resistance (Ω)** | Opposition to current flow | Cable resistance, component testing, fault finding |
| **Continuity** | Whether a complete path exists | Testing CPC, checking cable runs, confirming switches |
| **DC Current (A⎓)** | Current flowing in a circuit | Testing battery draw, low-current DC circuits |
| **AC Current (A~)** | Alternating current | Load measurement (requires clamp meter for high currents) |
| **Diode test** | Diode forward voltage | Component testing |
| **Capacitance (F)** | Capacitor value | Component testing |

For domestic electrical work, the four functions you will use most are: **AC voltage, DC voltage, resistance, and continuity**.

---

## Parts of a Multimeter

### Display

A digital LCD display showing the measurement value. Better meters show four significant digits (e.g. 234.7 V). Look for:
- **Auto-ranging** — the meter selects the correct range automatically; no manual range selection needed
- **Hold function** — freezes the display for awkward measurements
- **Backlight** — essential for working in dark ceiling voids or consumer units

### Rotary selector dial

Selects the measurement function. Common positions:

```
 V~   — AC voltage
 V⎓   — DC voltage
 Ω    — Resistance
 )))  — Continuity (buzzer)
 A⎓   — DC current
 A~   — AC current
```

On non-auto-ranging meters, each position has multiple ranges (e.g. 200 mV, 2 V, 20 V, 200 V, 750 V for AC voltage). Always start at the **highest range** and work down for safety.

### Test leads

Two insulated probes — **red** (positive) and **black** (negative/common). The leads plug into the meter's input sockets:

| Socket label | Colour | Used for |
|---|---|---|
| **COM** | Black | All measurements — always connect black here |
| **V / Ω** | Red | Voltage, resistance, continuity, diode |
| **A** or **mA** | Red | Current measurement only |
| **10A** or **20A** | Red | High current measurement only |

**Always check which socket the red lead is in before measuring.** Measuring voltage with the red lead in the current socket will blow the meter's internal fuse — and can be dangerous on live circuits.

### Internal fuse

The current measurement input is protected by an internal fuse (typically 200 mA and 10 A). A blown fuse means the current function does not work — but all other functions are unaffected. Replacement fuses are inexpensive.

---

## Safety Rules Before You Start

Multimeters for domestic electrical work must be rated at least **CAT III 600 V** or **CAT II 1000 V**. The CAT rating indicates the meter's ability to withstand transient voltage spikes:

| CAT rating | Suitable for |
|---|---|
| CAT I | Electronic equipment only — not for mains |
| CAT II | Mains socket outlets, appliances, portable equipment |
| CAT III | Fixed installation wiring, consumer unit, distribution boards |
| CAT IV | Supply origin, overhead lines, service entrance |

**For testing at sockets and consumer units, use CAT III minimum.**

### Pre-use checks

Before touching any live circuit with a multimeter:

1. **Inspect the leads** — check for cracked insulation, damaged plugs, or exposed copper anywhere along the lead. Damaged leads must be replaced before use.
2. **Check the selector** — confirm the function is set correctly for your intended measurement.
3. **Check the lead positions** — red in V/Ω for voltage/resistance; red in A for current.
4. **Test on a known source** — measure a known socket or battery first to confirm the meter is working correctly.

---

## Measuring AC Voltage (Mains)

This is the most common measurement for domestic wiring — checking whether a socket is live, measuring the supply voltage, or confirming a circuit is dead before working on it.

### Setup

1. Set the selector to **V~** (AC voltage)
2. On a manual-ranging meter, select **750 V** range (the highest AC range)
3. Red lead → **V/Ω** socket; Black lead → **COM** socket

### Measuring at a socket

1. Insert the **black probe** into the larger slot of the socket (neutral / right slot)
2. Insert the **red probe** into the smaller slot (live / left slot)
3. Read the display — a healthy UK mains supply reads **220–240 V AC**

To check if the socket is live at all, you can also measure between the live slot and the earth pin:
- Live to earth: should read ~230 V
- Neutral to earth: should read 0–5 V (neutral is bonded to earth at the supply)
- Live to neutral: should read ~230 V

### Proving dead before working

Always prove a circuit is dead before touching any conductor:

1. Confirm the meter works on a **known live socket** first
2. Turn off the MCB/RCBO for the circuit you intend to work on
3. Measure at the socket or switch that should now be dead — confirm **0 V**
4. Go back and re-test on the known live socket to confirm the meter still works
5. Now work on the isolated circuit

This three-step **prove, isolate, prove** sequence confirms both that the circuit is dead and that the meter did not fail between tests.

> Related: [How to Trace an Electrical Fault Safely: A Homeowner-Friendly Guide](/blog/how-to-trace-an-electrical-fault-safely/)

---

## Measuring DC Voltage

DC voltage measurements are used for batteries, 12 V lighting systems, LED drivers, doorbell transformers, and any low-voltage DC supply.

### Setup

1. Set the selector to **V⎓** (DC voltage)
2. On a manual-ranging meter, select a range above the expected voltage (e.g. 20 V range for a 12 V system)
3. Red lead → **V/Ω** socket; Black lead → **COM** socket

### Measuring a battery

1. **Red probe** to the positive terminal (+)
2. **Black probe** to the negative terminal (−)
3. Read the display

| Battery type | Nominal voltage | Healthy reading |
|---|---|---|
| AA / AAA alkaline | 1.5 V | 1.5–1.6 V (new), above 1.3 V (usable) |
| 9 V PP3 | 9 V | 8.5–9.5 V |
| 12 V car/leisure battery | 12 V | 12.6 V (fully charged), above 11.8 V (usable) |
| 12 V LED driver output | 12 V | 11.5–12.5 V |

If the display shows a **negative value**, the probes are reversed — red on negative, black on positive. Swap them.

---

## Measuring Resistance

Resistance measurement is used to check the value of a resistor, measure cable resistance, or test components. It must always be done on a **de-energised circuit** — measuring resistance on a live circuit will damage the meter and give meaningless readings.

### Setup

1. **Isolate the circuit** — switch off and lock out the supply
2. Set the selector to **Ω**
3. On a manual-ranging meter, start at the highest range and work down
4. Red lead → **V/Ω** socket; Black lead → **COM** socket

### Zeroing (lead resistance compensation)

Touch the two probes together. The display should read very close to **0 Ω**. If it reads a small non-zero value (e.g. 0.3 Ω), this is the resistance of the leads themselves. Subtract this from your measurements, or use the meter's relative (REL) function if available to zero it out.

### Measuring cable resistance

For a length of 2.5 mm² twin and earth cable:
- Connect both probes to the same conductor at each end (bridge the conductor at the far end with a short link)
- The reading is the round-trip resistance of that conductor
- 2.5 mm² copper has a resistance of approximately **7.4 mΩ/m** at 20°C

**Example:** 10 m of 2.5 mm² cable → expected resistance ≈ 0.074 Ω (round trip: 0.148 Ω)

---

## Testing Continuity

The continuity function combines resistance measurement with an **audible buzzer** — the meter beeps when a complete circuit path is detected. This is faster than reading the display when you are checking cable runs, switch operations, or earth paths.

### Setup

1. **Isolate the circuit**
2. Set the selector to the **continuity symbol** (typically looks like ))) or a diode symbol with a sound wave)
3. Red lead → **V/Ω** socket; Black lead → **COM** socket

### What the buzzer means

- **Continuous beep** → continuity confirmed; resistance is very low (typically below 20–50 Ω depending on meter)
- **No beep** → open circuit; no complete path
- **Intermittent beep** → loose connection or high-resistance joint

### Common continuity tests in domestic wiring

**Testing a switch:**
1. Disconnect the switch from the circuit
2. Place one probe on each switch terminal
3. Toggle the switch — should beep in one position, silent in the other
4. A switch that beeps in both positions has failed closed (stuck on)
5. A switch that beeps in neither position has failed open (stuck off)

**Testing a cable run:**
1. At one end, bridge the live and neutral together with a short link
2. At the other end, place one probe on live and one on neutral
3. A beep confirms the cable is intact end-to-end

**Testing a CPC (earth) path:**
1. One probe at the earth terminal of a socket or fitting
2. Other probe at the main earthing terminal (MET) in the consumer unit
3. A beep confirms a continuous earth path

> Related: [Why Does My RCD Keep Tripping? Common Causes and Safe Fault-Finding Steps](/blog/why-does-my-rcd-keep-tripping/)

> Related: [Why Does My MCB Keep Tripping? Overload, Short Circuit and Fault-Finding Guide](/blog/why-does-my-mcb-keep-tripping/)

---

## Measuring Current

Current measurement requires the circuit to be **broken** and the meter inserted **in series** — the current flows through the meter. This is less common for routine domestic testing but useful for measuring the actual load on a circuit.

### Important warning

The current input on most handheld multimeters is limited to **200 mA or 10 A**. A domestic ring main can carry 32 A — far above the meter's limit. Connecting a standard multimeter in series with a ring main will blow the internal fuse immediately (or worse, damage the meter).

**For measuring current on mains circuits, use a clamp meter** — it measures current by sensing the magnetic field around a conductor without breaking the circuit, and is rated for full mains current.

### Using a clamp meter for mains current

1. Set the clamp meter to **AC current (A~)**
2. Open the clamp jaws and place them around a **single conductor** (live or neutral — not both together, as the fields cancel out)
3. Close the jaws — the display shows the current flowing in that conductor

**Example readings:**
- Ring main with several loads on: 5–15 A typical
- Single 100 W LED floodlight: ~0.4 A
- 9.5 kW electric shower running: ~41 A

---

## Reading a Multimeter: Common Display Symbols

| Display | Meaning |
|---|---|
| **OL** or **1** (left-aligned) | Overrange — reading exceeds selected range; increase range |
| **−** prefix | Negative value (probes reversed for DC) |
| **AC** or **~** | AC measurement active |
| **DC** or **⎓** | DC measurement active |
| **HOLD** | Display frozen by hold button |
| **AUTO** | Auto-ranging active |
| **LOW BATT** | Battery needs replacing — readings may be inaccurate |

---

## Practical Examples: Fault Finding with a Multimeter

### Dead socket

1. Measure voltage at the socket — **0 V** confirms no supply
2. Check the MCB at the consumer unit — if tripped, reset and re-test
3. If MCB is on but socket still reads 0 V, measure at the consumer unit output terminals for that circuit
4. Voltage at CU but not at socket → fault in the cable run or a junction in the circuit
5. Use continuity mode (circuit isolated) to trace the break

### Light not working

1. Confirm the bulb is not blown — test with continuity mode across the bulb terminals (or simply swap the bulb)
2. With circuit live, measure voltage at the switch output terminal — should read 230 V when switch is on
3. No voltage at switch output → switch has failed — replace it
4. Voltage at switch output but no voltage at lamp terminal → fault in cable from switch to fitting

### Tripping RCD

1. Isolate all circuits protected by the RCD — disconnect all plugs, switch off all MCBs downstream
2. Reset the RCD
3. Switch on MCBs one at a time — when the RCD trips again, you have identified the faulty circuit
4. On the faulty circuit (isolated from supply), use resistance mode: measure between live and earth, neutral and earth — a low reading (near 0 Ω) indicates an insulation failure on that circuit

> Related: [How to Trace an Electrical Fault Safely: A Homeowner-Friendly Guide](/blog/how-to-trace-an-electrical-fault-safely/)

---

## Choosing a Multimeter

For domestic electrical work, a multimeter in the **£20–£60 range** covers all the measurements described in this guide.

| Feature | Minimum | Recommended |
|---|---|---|
| CAT rating | CAT II 600 V | CAT III 600 V |
| Auto-ranging | Optional | Yes |
| AC/DC voltage | Yes | Yes |
| Continuity buzzer | Yes | Yes |
| Resistance | Yes | Yes |
| Display digits | 3.5 | 4 |
| Lead quality | Basic | Fully insulated, CAT III rated |

Avoid very cheap meters (under £10) — their CAT ratings may be misleading, lead insulation is often poor, and accuracy can be unreliable on mains voltages.

Well-regarded budget options include the **Fluke 101**, **Uni-T UT61E**, and **Brymen BM235**. For professional use, **Fluke 117** or **Fluke 179** are industry standards.

---

## Key Points

- Set the correct **function and range** before touching any probe to a circuit
- Always use **CAT III 600 V minimum** rated meter and leads for domestic mains testing
- **Prove, isolate, prove** — test on a known live circuit before and after isolating the circuit you plan to work on
- **AC voltage (V~):** use for mains socket, switch, and consumer unit measurements — healthy UK supply reads 220–240 V
- **Continuity ())):** use for cable runs, switch testing, and earth path checking — always on an **isolated circuit**
- **Resistance (Ω):** always on an **isolated, de-energised circuit** — resistance on a live circuit damages the meter
- **Never use a standard multimeter in series with a mains circuit** — use a clamp meter for measuring mains current
- **OL or 1** on the display means overrange — increase the range setting
