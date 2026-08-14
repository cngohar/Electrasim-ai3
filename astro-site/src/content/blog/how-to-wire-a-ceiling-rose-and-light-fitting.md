---
title: "How to Wire a Ceiling Rose and Light Fitting: Loop-In, Junction Box and 3-Plate Methods"
description: "A complete UK guide to ceiling rose wiring — the loop-in method, junction box method, and modern 3-plate method. Includes terminal-by-terminal instructions, two-way switching connections, and what to do with old red/black cables."
pubDate: 2026-05-22
author: ElectraSim
category: Wiring Guide
tags: [ceiling rose wiring, light fitting wiring, loop-in method, junction box wiring, lighting circuit, two-way switch wiring, 1.5mm cable, lighting terminals, ceiling rose terminals, BS 7671, pendant light wiring]
---

Wiring a ceiling rose is one of the most common DIY electrical tasks in the UK — and one of the most confusing. Open a ceiling rose and you might find two, three, or even four cables entering it, all connected to a block of terminals that look nothing like a simple on/off switch. The layout follows a clear logic once you understand the method being used, but there are three different methods in common use and they look completely different from each other.

This guide covers all three: the **loop-in method**, the **junction box method**, and the modern **3-plate (three-terminal) method**. By the end you will be able to identify which method is in your ceiling and connect any replacement fitting correctly.

All circuit logic described here can be explored in **[ElectraSim](/app/)** — a free browser-based circuit simulator.

> **Safety first:** Working on lighting circuits requires isolating the circuit at the consumer unit and proving it dead with a voltage indicator before touching any conductors. If in doubt, use a qualified electrician.

---

## The Lighting Circuit: A Quick Overview

A lighting circuit in a UK home is typically wired as a **radial** — a single cable leaves the MCB in the consumer unit and visits each light position in turn. The circuit is protected by a **6 A MCB** (and in modern installations a 30 mA RCBO) and wired in **1.0 mm² or 1.5 mm² twin and earth** cable.

The switch is wired in **series with the live conductor only** — the switch must always break the live, never the neutral. This means the cable to the switch carries a permanent live out and a switched live back.

> Related: [Live, Neutral and Earth Wires Explained](/blog/live-neutral-and-earth-wires-explained/)

> Related: [Electrical Cable Sizes Explained](/blog/electrical-cable-sizes-explained/)

---

## Ceiling Rose Terminal Layout

A standard UK ceiling rose has **three terminal blocks** arranged in a row, plus an earth terminal:

```
  [  NEUTRAL  ] [  LOOP-IN  ] [ SW LIVE ]   E
      (blue)     (brown/live)  (brown)     (G/Y)
```

- **Neutral terminal (left)** — all neutral (blue) conductors connect here; this terminal is not switched
- **Loop-in terminal (centre)** — all permanent live (brown) conductors connect here; this is the incoming live that loops from rose to rose along the circuit
- **Switched live terminal (right)** — the switched live returning from the switch connects here, along with the live to the lamp holder
- **Earth terminal** — all earth conductors connect here

The lamp flex connects: brown flex core → switched live terminal, blue flex core → neutral terminal.

---

## Method 1: The Loop-In Method

The **loop-in method** is the most common in UK domestic wiring from the 1960s onwards. The lighting circuit cable loops continuously from rose to rose — no junction boxes anywhere in the ceiling. The switch cable drops from the rose down to the switch.

### How it works

```
Consumer unit → Rose 1 → Rose 2 → Rose 3 → (end of circuit)
                  |          |         |
               Switch 1   Switch 2  Switch 3
```

At each rose, **two circuit cables** arrive (in from the previous rose, out to the next) plus **one switch cable** (down to and back from the switch). The final rose on the circuit has only one circuit cable.

### Connections at the ceiling rose

**Incoming circuit cable (from previous rose or consumer unit):**
- Brown → Loop-in terminal
- Blue → Neutral terminal
- Bare earth (sleeved green/yellow) → Earth terminal

**Outgoing circuit cable (to next rose):**
- Brown → Loop-in terminal (same as incoming)
- Blue → Neutral terminal (same as incoming)
- Bare earth → Earth terminal

**Switch cable (down to the switch and back):**
- Brown → Loop-in terminal (permanent live going down to switch Common)
- Blue (**sleeved brown** at both ends — it carries switched live) → Switched live terminal
- Bare earth → Earth terminal

**Lamp flex:**
- Brown core → Switched live terminal
- Blue core → Neutral terminal

### Result

The Loop-in terminal always has live voltage. The Switched live terminal is live only when the switch is closed. The lamp lights when the switch connects the permanent live (Loop-in → switch Common → switch L1 → back as switched live → Switched live terminal → lamp).

---

## Method 2: The Junction Box Method

The **junction box method** was common in older installations (pre-1960s) and is still encountered in refurbishment work. Instead of looping at the ceiling rose, the main circuit cable runs through **4-terminal junction boxes** in the ceiling void. From each junction box, a short cable drops to the rose and another short cable drops to the switch.

```
Consumer unit → JB 1 → JB 2 → JB 3 (circuit cable, never at rose)
                 |        |       |
               Rose 1   Rose 2  Rose 3
                 |        |       |
               Switch   Switch  Switch
```

### Connections at the junction box (4 terminal)

| Terminal | Connections |
|---|---|
| **1 — Live** | Incoming circuit brown, outgoing circuit brown, switch cable brown |
| **2 — Neutral** | Incoming circuit blue, outgoing circuit blue, rose cable blue |
| **3 — Switched live** | Switch cable blue (sleeved brown), rose cable brown |
| **4 — Earth** | All earth conductors |

### Connections at the ceiling rose (junction box method)

With this method, the ceiling rose sees only **one cable** — from the junction box. That cable carries:
- Brown → Switched live terminal (it is only live when switched)
- Blue → Neutral terminal
- Earth → Earth terminal

The rose has no Loop-in terminal in use — the looping happens at the junction box, not the rose. This is why a ceiling rose in a junction-box installation looks much simpler: just one cable, three connections.

---

## Method 3: The 3-Plate (Modern) Method

Modern installations increasingly use **3-plate ceiling roses** with a different terminal arrangement, or **connector blocks** where the lighting circuit is wired using individual connectors rather than the traditional rose terminal strips. WAGO-style lever connectors have become popular for new work.

The wiring logic is identical to the loop-in method — the difference is the physical form of the terminal block. Three separate connector blocks replace the three-terminal rose:

- **Block 1 (neutral):** all blue conductors
- **Block 2 (permanent live):** all brown conductors from the circuit plus the brown of the switch cable
- **Block 3 (switched live):** the re-sleeved blue from the switch cable, plus the brown of the lamp flex

The blue of the lamp flex goes to Block 1 (neutral).

---

## Dealing with Old Red/Black Cable

In any property wired before 2004, you will find cables with **red and black** conductors instead of the current brown and blue. The old colour code:

| Old colour | New colour | Function |
|---|---|---|
| **Red** | Brown | Live |
| **Black** | Blue | Neutral |
| **Green** or bare | Green/Yellow | Earth |

**Important:** in switch cables, the **black conductor carries switched live** — it is not a neutral. This black must be **sleeved or marked with brown tape** at both ends to show it is live. If you find a switch cable where the black has no sleeving and is connected to a terminal with other neutrals, the installation has a known defect.

When working on old red/black installations, confirm function with a voltage indicator — never assume by colour alone.

---

## Two-Way Switching at the Ceiling Rose

A ceiling rose controlled by two-way switches (one at top and bottom of stairs, for example) adds a **second switch cable** at the rose. The rose connections become:

**Switch 1 cable (2-core and earth):**
- Brown → Loop-in terminal (permanent live to Switch 1 Common)
- Blue sleeved brown → (not used at the rose — goes to switch strapper)

**Switch 2 cable (3-core and earth, with strappers to Switch 1):**
- Brown → Switched live terminal (switched live returning from Switch 2 Common)
- Blue and grey — the two strappers connecting L1 and L2 of both switches (these do not connect at the rose at all — they run directly between the two switch back boxes)

In practice, some two-way switching layouts use a junction box rather than connecting at the rose — the exact configuration depends on the layout of the installation.

> Related: [How to Wire a Two-Way Switch: Complete Guide with Diagrams](/blog/how-to-wire-a-two-way-switch-complete-guide/)

> Related: [Intermediate Switch Wiring: How to Control a Light from Three or More Locations](/blog/intermediate-switch-wiring-three-way-light-switch/)

---

## Replacing a Ceiling Rose: Step by Step

1. **Isolate the circuit** at the consumer unit — switch off the lighting MCB and lock it off or fit a warning label
2. **Prove dead** with a voltage indicator at all terminals in the rose before touching any conductors
3. **Photograph the existing connections** before disconnecting anything — a photo on your phone costs nothing and can save an hour of puzzling over the replacement
4. **Note cable colours and terminal positions** — especially any blue conductors sleeved brown (these are switch lives, not neutrals)
5. **Disconnect in reverse order** — lamp flex first, then switch cable, then circuit cables
6. **Connect the new rose** following the same pattern, matching each conductor to the same terminal type
7. **Check earth continuity** — all bare/green-yellow conductors must be connected to the earth terminal
8. **Restore power and test** — switch on at the consumer unit and operate the light switch

---

## Simulating a Lighting Circuit in ElectraSim

[ElectraSim](/app/) lets you build and test the complete lighting circuit logic before touching real wiring:

1. Place a **Power Supply** (mains), an **MCB** (6 A), a **Switch**, and a **Bulb**
2. Wire: Supply → MCB → Switch (in the live path) → Bulb → return to Supply neutral
3. Run the simulation — toggle the switch to control the bulb
4. Add a second switch for two-way control
5. Apply **Fault Simulation Mode** to inject an open circuit (simulating a broken flex) or reverse polarity (simulating a wiring error)

> [Open ElectraSim — free, no sign-up →](/app/)

---

## Key Points

- **Loop-in method:** circuit cables loop rose-to-rose; switch cable at each rose; two circuit cables + one switch cable at most roses
- **Junction box method:** circuit runs through ceiling junction boxes; only one cable at each rose (from its JB)
- **3-plate/modern method:** same logic as loop-in but with individual connector blocks (WAGO etc.)
- **Switch must always break the live** — the blue conductor in a switch cable carries switched live and must be sleeved brown
- **Old red = new brown (live); old black = new blue (neutral)** — but always confirm with a tester
- **Earth every rose** — even plastic roses must have the circuit earth connected through to maintain earth continuity for the next rose
- **Photograph before disconnecting** — always
