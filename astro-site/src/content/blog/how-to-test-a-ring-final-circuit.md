---
title: "How to Test a Ring Final Circuit: Continuity, Polarity and End-to-End Readings"
description: "Learn how electricians test a UK ring final circuit — end-to-end live, neutral and CPC continuity, cross-connection tests at each socket, polarity checks, open ring faults, spurs, and what the readings mean."
pubDate: 2026-07-05
author: ElectraSim
category: Wiring Guide
tags: [ring final circuit test, ring circuit testing, ring main test, continuity test, r1 rn r2, CPC continuity, polarity test, open ring fault, socket tester, electrical testing, EICR, BS 7671, wiring fault, electrician training]
---

A ring final circuit can look perfectly healthy while hiding a serious fault. Every socket may still work, the MCB may stay on, and a plug-in tester may show "correct" — but if one conductor in the ring is broken, the circuit is no longer sharing current the way it was designed to.

That is why ring final circuits are tested differently from ordinary radial circuits. Electricians do not just check that sockets are live. They check that the ring is complete, that live, neutral and CPC all return to the consumer unit, that every socket is connected to the correct conductors, and that any spurs are where they should be.

This guide explains the standard testing logic for a UK ring final circuit: **end-to-end readings, cross-connection tests, polarity checks, common fault patterns, and how to reason about the results**.

> **Safety note:** Electrical testing on fixed wiring should be carried out by a competent person using suitable test equipment. Always isolate, lock off where possible, and prove dead before touching conductors. This guide is for learning and fault-recognition, not a substitute for professional inspection or certification.

> **Try it safely:** Build a ring final circuit in **[ElectraSim](/app/)**, break one leg, add a spur, and compare how the circuit behaves before working on real wiring.

---

## What a Ring Final Circuit Test Proves

A ring final circuit is a socket circuit where the cable leaves the consumer unit, passes through each socket, and returns to the same protective device. In a typical UK domestic circuit, that means two line conductors, two neutral conductors and two CPCs at the consumer unit for the same circuit.

Testing proves five things:

1. **Line continuity** — the live/line conductor forms a complete loop.
2. **Neutral continuity** — the neutral conductor forms a complete loop.
3. **CPC continuity** — the circuit protective conductor forms a complete loop.
4. **Correct polarity** — line, neutral and CPC are not crossed at any socket.
5. **Correct topology** — sockets on the ring and sockets on spurs can be identified.

A basic voltage check cannot prove any of those. A broken ring can still energise every socket from one side. That is why continuity testing is essential.

---

## The Conductors: r1, rn and r2

Ring final circuit testing uses three resistance readings:

| Symbol | What it means | Conductor |
|---|---|---|
| **r1** | End-to-end resistance of the line conductor | Brown / live / line |
| **rn** | End-to-end resistance of the neutral conductor | Blue / neutral |
| **r2** | End-to-end resistance of the CPC | Green-yellow / earth |

These are measured with the circuit isolated and the ring ends disconnected from the consumer unit terminals.

In a healthy ring wired with the same cable throughout:

- **r1 and rn should be very similar**
- **r2 will usually be higher** because the CPC in twin-and-earth cable is often smaller than the line and neutral conductors
- all readings should be low and stable

For common 2.5 mm² twin-and-earth cable with a 1.5 mm² CPC, r2 is normally higher than r1/rn. The exact readings depend on circuit length, cable size, temperature, joints, and meter lead resistance.

---

## Tools Used for Ring Testing

Electricians normally use a multifunction installation tester, but the principles are the same as resistance and continuity testing with a suitable low-resistance meter.

You need:

- A safe isolation kit or voltage indicator
- A lock-off device for the MCB/RCBO
- A low-resistance continuity tester
- Test leads with crocodile clips
- Socket outlet adaptor or probe leads
- A record sheet for readings

For formal inspection and certification, use properly calibrated test equipment and follow the current edition of BS 7671 and the relevant IET guidance.

---

## Before Testing: Safe Isolation

Never start continuity testing until the circuit is confirmed dead.

Use the prove-test-prove method:

1. Test your voltage indicator on a known live source.
2. Switch off the correct MCB/RCBO.
3. Lock off the circuit so it cannot be switched back on accidentally.
4. Test line to neutral, line to CPC, and neutral to CPC at the circuit.
5. Confirm the circuit is dead.
6. Re-test your voltage indicator on a known live source.

Once the circuit is dead, disconnect the two line conductors, two neutrals and two CPCs for that ring from their terminals. Keep them grouped clearly so they do not get mixed with another circuit.

---

## Test 1: End-to-End Continuity

The first test is the simplest: measure resistance from one end of each conductor to the other.

At the consumer unit:

```
Line end A  ───── meter ───── Line end B   = r1
Neutral A   ───── meter ───── Neutral B    = rn
CPC A       ───── meter ───── CPC B        = r2
```

### What Healthy Readings Look Like

On a healthy ring:

| Reading | Expected pattern |
|---|---|
| **r1** | Low resistance |
| **rn** | Similar to r1 |
| **r2** | Higher than r1/rn if CPC is smaller |

Example only:

| Reading | Example value |
|---|---:|
| r1 | 0.42 Ω |
| rn | 0.43 Ω |
| r2 | 0.70 Ω |

The actual values are less important than the pattern. Very different r1 and rn readings suggest different cable lengths, a poor joint, incorrect conductor identification, or a fault.

### What a Broken Ring Looks Like

If one conductor is broken, the reading for that conductor will be open circuit.

| Fault | Likely reading |
|---|---|
| Broken line conductor | r1 open circuit |
| Broken neutral conductor | rn open circuit |
| Broken CPC | r2 open circuit |

A broken CPC is especially serious because exposed metalwork and socket earth terminals may not have a reliable fault path.

---

## Test 2: Line-Neutral Cross-Connection

After end-to-end continuity, the next step is to prove that each socket sits correctly on the ring and that line and neutral are not reversed.

At the consumer unit, cross-connect opposite ends:

```
Line A ─────┐
            ├── Neutral B

Line B ─────┐
            ├── Neutral A
```

Then measure resistance between line and neutral at every socket on the circuit.

For sockets actually on the ring, the readings should be broadly similar. In a perfectly even ring, each socket reads close to one quarter of the total line-plus-neutral ring resistance.

In practice, the readings vary slightly because sockets are at different positions and cable routes are not perfectly symmetrical.

### What the Readings Mean

| Pattern at sockets | What it suggests |
|---|---|
| Similar low readings around the ring | Ring is likely continuous and correctly connected |
| One socket much higher than neighbours | Possible spur, loose connection, or longer branch |
| One socket open circuit | Socket not connected correctly or conductor break |
| Unexpected very low reading | Possible short, crossed conductors, or test link error |

This test is useful because it checks the circuit from each socket position, not just from the consumer unit.

---

## Test 3: Line-CPC Cross-Connection

The line-CPC test proves CPC continuity at every socket and helps calculate the circuit's R1 + R2 value.

At the consumer unit, cross-connect opposite ends again, this time using line and CPC:

```
Line A ─────┐
            ├── CPC B

Line B ─────┐
            ├── CPC A
```

Then measure between line and earth/CPC at each socket.

On the ring, the readings should be broadly similar. The highest reading is important because it represents the worst point on the circuit for earth fault path resistance.

### Why R1 + R2 Matters

R1 + R2 is the resistance of the line conductor plus the CPC back to the source. It contributes to earth fault loop impedance. If this path is too high, a fault current may not be large enough to operate the protective device quickly enough.

For formal verification, the measured values must be assessed against the protective device, circuit design, supply type, and the current requirements of BS 7671.

---

## Test 4: Polarity at Every Socket

Continuity readings prove that conductors are connected, but polarity proves they are connected to the right terminals.

At each socket:

- Line should be on the line terminal
- Neutral should be on the neutral terminal
- CPC should be on the earth terminal

Wrong polarity is dangerous because a switched appliance may appear off while internal parts remain live.

### Common Polarity Faults

| Fault | Why it matters |
|---|---|
| Line and neutral reversed | Appliance switches and fuses may be on the neutral side instead of live |
| CPC disconnected | Exposed metalwork may not disconnect the supply during a fault |
| Neutral and CPC linked | Can create shock risk and nuisance RCD tripping |
| Line connected to CPC | Serious fault; protective device should operate |

A plug-in socket tester can help identify some polarity faults, but it is not a full substitute for proper continuity and installation testing.

---

## How to Identify a Spur During Testing

A spur is a branch from the ring. It is not part of the ring loop, so it often behaves differently during cross-connection tests.

During line-neutral or line-CPC testing, a socket on the ring should produce readings that follow the ring pattern. A spur usually gives a higher reading because the current path includes the branch cable out to the spur point and back.

```
Ring socket ─── ring cable ─── ring socket
                     │
                  spur cable
                     │
                 spur socket
```

Signs of a spur:

- The socket reading is higher than adjacent ring sockets
- Only one cable enters the socket back box
- The socket is physically beyond another socket or junction point
- The test result matches a branch rather than a point on the main loop

One unfused spur from a ring point is a normal arrangement. A spur from a spur is usually not acceptable unless protected by a suitable fused connection unit.

> Related: [How to Add a Spur from a Ring Main: Rules, Methods and Step-by-Step Guide](/blog/how-to-add-a-spur-from-a-ring-main/)

---

## Fault Patterns and What They Mean

Ring tests are powerful because different faults create different reading patterns.

### Open Line Conductor

Symptoms:

- r1 open circuit
- Some sockets may still appear live
- Cross-connection readings fail or become inconsistent

Why it matters:

The circuit may still work as two radial legs, but the cable is no longer sharing load as a ring.

### Open Neutral Conductor

Symptoms:

- rn open circuit
- Some sockets may show strange voltage behaviour under load
- Plug-in testers may give misleading results depending on where the break is

Why it matters:

Loads may not return current correctly, and parts of the circuit can behave unpredictably.

### Open CPC

Symptoms:

- r2 open circuit
- Line-neutral may test normally
- Socket tester may show missing earth at some outlets

Why it matters:

The earth fault path is broken. This is a serious safety defect.

### Reversed Line and Neutral at One Socket

Symptoms:

- End-to-end r1 and rn may look normal
- Polarity check fails at one outlet
- Cross-connection readings may be odd around that point

Why it matters:

The socket can energise appliance parts in an unsafe way even though the circuit appears functional.

### High-Resistance Joint

Symptoms:

- Readings are not open circuit, but one section is much higher than expected
- Readings may change if the socket or cable is moved
- Heating, arcing, or discoloration may be visible at terminals

Why it matters:

High-resistance joints can overheat under load and become fire risks.

---

## Recording the Results

For each ring final circuit, a test sheet normally records:

| Field | Example |
|---|---|
| Circuit ID | Sockets downstairs |
| Protective device | B32 MCB or 32 A RCBO |
| Cable size | 2.5/1.5 mm² twin-and-earth |
| r1 | 0.42 Ω |
| rn | 0.43 Ω |
| r2 | 0.70 Ω |
| Highest R1 + R2 | 0.29 Ω |
| Polarity | Correct |
| Notes | One fused spur to boiler FCU |

Good records matter because future inspections can compare readings against previous values. A significant change may point to a new joint, added spur, damaged cable, or loose termination.

---

## Testing a Ring Circuit in ElectraSim

ElectraSim is not a replacement for calibrated test equipment, but it is useful for learning the logic of ring testing.

Try this exercise:

1. Open **[ElectraSim](/app/)**.
2. Build a socket ring layout using a distribution board/MCB and several socket points.
3. Run the circuit and confirm all sockets are energised.
4. Break one conductor on one side of the ring.
5. Run again and observe that the circuit can still appear partially functional.
6. Add a spur and compare its behaviour with the main ring.
7. Add a reverse polarity fault and observe how the fault changes the circuit state.

The important lesson: **working does not always mean safe**. Ring testing exists because some dangerous faults do not stop a socket from powering a load.

---

## Quick Checklist

Before signing off or trusting a ring final circuit, confirm:

- The circuit is safely isolated before resistance testing
- r1, rn and r2 all show continuity
- r1 and rn are similar
- r2 is consistent with the CPC size
- Cross-connection readings are broadly consistent around the ring
- Spurs are identified and recorded
- Polarity is correct at every socket
- CPC continuity is present at every outlet
- Any high-resistance or open-circuit readings are investigated

---

## Summary

A ring final circuit test is not just a "does it work?" check. It proves the hidden structure of the circuit.

The key tests are:

- **r1** for line continuity
- **rn** for neutral continuity
- **r2** for CPC continuity
- **Line-neutral cross-connection** to check ring layout and polarity
- **Line-CPC cross-connection** to check CPC continuity and R1 + R2
- **Socket polarity checks** at every outlet

If a ring is complete, readings are consistent, spurs are identified, and polarity is correct, the circuit has the structure expected of a ring final circuit. If any conductor is open, the circuit may still work — but it should not be treated as safe until the fault is found and repaired.

> Continue learning: [Ring Circuit vs Radial Circuit: What's the Difference?](/blog/ring-circuit-vs-radial-circuit-explained/) and [How to Use a Multimeter: Electrical Testing Guide for Beginners](/blog/how-to-use-a-multimeter-electrical-testing-guide/)
