---
title: "How to Wire a Kitchen: Dedicated Circuits for Every Appliance"
description: "A kitchen needs more dedicated circuits than any other room in the house. This UK guide covers ring mains, cooker circuits, washing machine, dishwasher, fridge, under-cabinet lights, and how to plan your consumer unit allocation — all to BS 7671."
pubDate: 2026-06-11
author: ElectraSim
category: Wiring Guide
tags: [kitchen wiring, dedicated circuit, kitchen ring main, cooker circuit, washing machine wiring, dishwasher circuit, fridge circuit, 2.5mm cable, 6mm cable, 10mm cable, MCB sizing, consumer unit planning, Part P, BS 7671, kitchen electrical guide, radial circuit kitchen]
---

The kitchen is the most electrically demanding room in a domestic property. It is the only room where multiple high-power appliances — a cooker or hob, electric oven, washing machine, dishwasher, fridge-freezer, microwave, and kettle — all operate from the same space. Getting the wiring right means understanding which appliances need dedicated circuits, which can share a ring main, and how to plan consumer unit space before work begins.

This guide covers every circuit in a modern UK kitchen, from cable sizing and MCB selection to Part P notification — with links to the individual appliance guides for deeper detail on each.

You can model your complete kitchen circuit layout in **[ElectraSim](/app/)** before any work starts.

---

## Why Kitchens Need More Circuits Than Other Rooms

A standard room — a bedroom, living room, or study — typically runs from a single 32 A ring final circuit with 2.5 mm² cable. That ring serves all the sockets in the room and is sufficient for the loads typically plugged in.

A kitchen is different for three reasons:

1. **High-power fixed appliances.** A cooker, electric hob, or range can draw 30–50 A continuously. An electric shower is the only domestic appliance that comes close. These loads cannot share a ring main socket.

2. **Continuous-load appliances.** A fridge-freezer runs 24 hours a day. A washing machine may run for 90 minutes at a time. These benefit from a dedicated, protected circuit to avoid nuisance tripping under kitchen demand peaks.

3. **Water proximity.** All kitchen appliances near the sink are subject to the increased risk of water ingress and spillage. BS 7671 and the 18th Edition recommend RCD protection for all socket outlets in a kitchen — an RCBO-per-circuit approach gives protection without the risk of a single fault killing every circuit.

---

## The Kitchen Circuits: Overview

A fully wired modern UK kitchen requires the following circuits:

| Circuit | Cable | MCB/RCBO | Notes |
|---|---|---|---|
| Kitchen ring main (sockets) | 2.5 mm² T&E | 32 A Type B | For all general-purpose sockets |
| Cooker / range | 6 mm² T&E | 32 A Type B | For cooker or range up to 15 kW |
| Induction hob (separate) | 6 mm² T&E | 32 A Type B | If hob is separate from oven |
| Built-in oven (separate) | 2.5 mm² T&E | 20 A Type B | Single oven only, typically |
| Washing machine | 2.5 mm² T&E | 20 A Type B | Dedicated unswitched spur |
| Dishwasher | 2.5 mm² T&E | 20 A Type B | Dedicated unswitched spur |
| Fridge-freezer | 2.5 mm² T&E | 20 A Type B | Dedicated unswitched spur (best practice) |
| Under-cabinet lights | 1 mm² T&E | 6 A Type B | Optional; can share lighting circuit |
| Extractor fan | 1 mm² T&E | 6 A Type B | Can share lighting circuit |

Not all of these are mandatory — the minimum is a ring main and a cooker circuit — but a properly specified kitchen installs them all. Each is covered in detail below.

---

## Circuit 1: The Kitchen Ring Main (Sockets)

The kitchen should have its **own dedicated ring final circuit**, separate from the ring mains serving other rooms. This is best practice and increasingly common in new builds, though not always legally required.

### Why a separate kitchen ring?

- The kitchen draws the most power of any room via its socket outlets (kettles at 2–3 kW, microwaves at 0.8–1.2 kW, toasters at 1.8–2.4 kW, coffee machines at 1.5 kW — often simultaneously)
- Separating the kitchen ring prevents kitchen demand from affecting living room or bedroom socket circuits
- A kitchen-only RCBO means a tripped circuit in the kitchen does not affect the rest of the house

### Specification

- **Cable:** 2.5 mm² twin and earth throughout
- **Protection:** 32 A Type B RCBO (30 mA) — one RCBO protecting only this ring
- **Sockets:** Double sockets above the worktop, spaced so no worktop position is more than 1 m from a socket
- **Behind appliances:** Sockets for the microwave, coffee machine, and other counter-top appliances should not be accessible without moving the appliance — consider adding an easily accessible double socket at eye level near each appliance group

### What not to put on the kitchen ring

Do **not** wire the following into the ring main:

- Cooker, range, hob — too high a current demand (see Circuit 2 below)
- Washing machine — motor starting current causes nuisance tripping of shared circuits
- Dishwasher — same reason as washing machine
- Fridge-freezer — best practice is a dedicated circuit so a fault on the ring does not defrost frozen food

> Related: [How to Wire a Ring Main Circuit: The UK Ring Final Circuit Explained](/blog/how-to-wire-a-ring-main-circuit/)

> Related: [Ring Circuit vs Radial Circuit: What's the Difference?](/blog/ring-circuit-vs-radial-circuit-explained/)

---

## Circuit 2: The Cooker / Range Circuit

A cooker, range cooker, or combined hob-and-oven appliance requires a **dedicated circuit** from the consumer unit. This is non-negotiable.

### Cable and MCB sizing

The diversity rule under BS 7671 allows a reduced design current for cooker circuits because all elements rarely operate simultaneously:

```
Diversity current = 10 A + 30% of the remaining full-load current
```

| Cooker rating | Full-load current | Diversity current | Cable | MCB |
|---|---|---|---|---|
| Up to 7 kW | 30 A | 16 A | 6 mm² | 32 A |
| 8–12 kW | 35–52 A | 20–28 A | 6 mm² | 32 A |
| 13–15 kW | 57–65 A | 24–29 A | 6 mm² | 32 A |
| Over 15 kW | 65+ A | 30+ A | 10 mm² | 40 A |

**6 mm² twin and earth** handles the vast majority of domestic cookers when diversity is applied.

### The cooker control unit

A **45 A double-pole switch** (cooker control unit) must be mounted on the wall to one side of the cooker — not directly above it. The switch disconnects both live and neutral, providing safe isolation for cleaning or servicing.

If the cooker control unit includes a 13 A socket (as many do), add 5 A to the diversity calculation to confirm the circuit can still handle it.

### Separate oven and hob

Many modern kitchens use a built-in oven in a tall unit and a separate induction or ceramic hob in the worktop. These can be:

- **One circuit** (via a dual cooker control unit or junction box) if the combined diversity-adjusted current is within 32 A
- **Two separate circuits** if the combined load exceeds a comfortable 32 A — particularly with a high-power induction hob (9–11 kW) plus a double oven (4–5 kW)

**Single oven only (built-in):** A single built-in oven rated 2–3.5 kW draws 9–15 A at full load. This can be wired on **2.5 mm² cable** with a **20 A Type B RCBO** — no cooker control unit needed; use a standard switched FCU (fused connection unit) with a 13 A fuse.

> Related: [How to Wire a Cooker or Electric Oven: UK Circuit Guide](/blog/how-to-wire-a-cooker-electric-oven-uk/)

> Related: [How to Wire a Fused Connection Unit (FCU): Switched, Unswitched and Spur Rules](/blog/how-to-wire-a-fused-connection-unit-fcu/)

---

## Circuit 3: Washing Machine

A washing machine should be on a **dedicated 20 A circuit** with a switched spur or FCU. This is especially important in a kitchen where the machine is built-in under the worktop and the socket is not easily accessible.

### Why dedicated?

- Washing machine motors produce a starting current spike 3–5× their running current — on a shared ring this can occasionally cause nuisance tripping
- A machine on a spur from the kitchen ring is acceptable in a pinch, but a dedicated circuit is clean, future-proof, and consumes only one RCBO position in the consumer unit
- A fault on the washing machine circuit cannot trip the ring and cut power to the kitchen socket ring

### Specification

- **Cable:** 2.5 mm² twin and earth from consumer unit to a **switched fused connection unit** (13 A FCU) behind or adjacent to the machine
- **Protection:** 20 A Type B RCBO (30 mA) at the consumer unit
- **Outlet:** Switched FCU with a 13 A cartridge fuse — the machine connects directly without a plug in most built-in installations
- Alternatively: a 13 A socket with the supply on its own 20 A circuit (for free-standing machines with a moulded plug)

---

## Circuit 4: Dishwasher

Identical specification to the washing machine:

- **Cable:** 2.5 mm² twin and earth
- **Protection:** 20 A Type B RCBO (30 mA)
- **Outlet:** Switched FCU behind the machine, or accessible 13 A socket

The dishwasher's heating element runs at 1.8–2.4 kW (8–10 A) — well within a 20 A circuit. The dedicated circuit prevents a dishwasher fault from affecting any other kitchen circuit.

---

## Circuit 5: Fridge-Freezer

Strictly speaking, a fridge-freezer can run from a standard kitchen ring main socket. In practice, most electricians recommend a dedicated unswitched circuit for two reasons:

1. **Always-on load:** The fridge compressor cycles constantly — 24 hours a day, 365 days a year. If the kitchen ring trips, you lose the fridge.
2. **Spike-free supply:** Compressor motors produce start-up spikes. On a shared ring, these interact with other loads. A dedicated circuit isolates the fridge completely.

### Specification

- **Cable:** 2.5 mm² twin and earth
- **Protection:** 20 A Type B RCBO (30 mA)
- **Outlet:** Unswitched FCU or 13 A socket — ideally positioned at the back of the fridge alcove, not easily accessible once the appliance is in place (use an unswitched FCU to prevent accidental disconnection)

If budget or consumer unit space is limited, the fridge-freezer on the kitchen ring is the acceptable compromise. Prioritise dedicated circuits for the washing machine and dishwasher first.

---

## Circuit 6: Under-Cabinet Lights

Kitchen under-cabinet lighting can be supplied in two ways:

### Option A: From the existing lighting circuit

The simplest approach for LED strip lights or individual LED spotlights (total load typically under 100 W). A spur from the nearest lighting circuit junction box or ceiling rose is sufficient.

### Option B: Dedicated circuit

For a larger kitchen with significant under-cabinet lighting, a feature island pendant, or display lighting:

- **Cable:** 1 mm² twin and earth
- **Protection:** 6 A or 10 A Type B RCBO
- Allows the kitchen working lights to be independently controlled from the main room lighting

### LED driver / transformer notes

Modern LED under-cabinet lights typically run at 12 V DC via a transformer or LED driver. The 230 V supply connects to the driver — only the low-voltage output feeds the LED strip. The transformer/driver must be accessible for replacement (not permanently enclosed inside a wall).

---

## Circuit 7: Extractor Fan

A kitchen extractor fan typically draws 30–100 W — negligible current. It can be:

- Wired from the **existing kitchen lighting circuit** via a fused spur (3 A fuse)
- Wired from a dedicated circuit if the cooker hood is integrated with an appliance (e.g. a downdraft extractor with a recirculation motor)

The fan must be wired to a **switched** outlet so it can be turned off — either via the integral controls on the hood (with permanent supply) or via a switched FCU or ceiling pull-cord isolator.

---

## Planning Consumer Unit Space

A fully specified kitchen needs **6–8 dedicated MCB/RCBO positions** in the consumer unit:

| Position | Circuit | Protection |
|---|---|---|
| 1 | Kitchen ring main | 32 A RCBO |
| 2 | Cooker / range | 32 A RCBO |
| 3 | Washing machine | 20 A RCBO |
| 4 | Dishwasher | 20 A RCBO |
| 5 | Fridge-freezer | 20 A RCBO |
| 6 | Built-in oven (if separate) | 20 A RCBO |
| 7 | Induction hob (if separate) | 32 A RCBO |
| 8 | Under-cabinet lights (if dedicated) | 6 A RCBO |

If you are specifying a new consumer unit or planning a kitchen renovation, confirm there are enough spare ways. A modern 18-way or 24-way consumer unit comfortably accommodates a full kitchen without compromising capacity for the rest of the house.

> Related: [Distribution Board Explained: How a Consumer Unit Is Wired](/blog/distribution-board-explained-how-a-consumer-unit-is-wired/)

> Related: [Consumer Unit Upgrade: What to Expect When Replacing Your Fuse Board](/blog/consumer-unit-upgrade-what-to-expect/)

---

## Voltage Drop Check for Kitchen Circuits

Kitchen cable runs are usually short — 3–15 m from the consumer unit. Voltage drop is rarely an issue, but worth calculating for any run over 10 m.

**Example: 32 A kitchen ring main, 15 m one-way run (30 m total ring), 2.5 mm² T&E (mV/A/m = 18):**

```
V_drop = (18 × 32 × 30) / 1000 = 17,280 / 1000 = 17.28 V
```

This appears to exceed the 5% limit (11.5 V), but ring main voltage drop is calculated using the **design current (not rating)** and **half the ring length** (because current enters from both ends):

```
V_drop = (18 × 20 × 15) / 1000 = 5.4 V  ✓
```

For a high-power cooker circuit with a 12 m run of 6 mm² (mV/A/m = 7.3) at diversity current of 23 A:

```
V_drop = (7.3 × 23 × 12) / 1000 = 2.01 V  ✓
```

Both well within the 11.5 V (5%) permitted limit.

> Related: [Voltage Drop Explained: How to Calculate It and Why It Matters](/blog/voltage-drop-explained-how-to-calculate-it/)

---

## Part P Notification

The following kitchen electrical work is **notifiable under Part P** of the Building Regulations:

| Work | Notifiable? |
|---|---|
| Installing a new circuit from the consumer unit | Yes |
| Adding a new consumer unit or replacing an existing one | Yes |
| Installing a new cooker control unit | Yes (as part of new circuit) |
| Adding a spur to an existing kitchen ring | No (if in kitchen only) |
| Like-for-like socket replacement | No |
| Adding a socket to an existing ring in a kitchen | No |

For notifiable work, either:
- Use a **Part P-registered electrician** who self-certifies and issues an Electrical Installation Certificate (EIC)
- Notify **Building Control** before starting and arrange an inspection on completion

> Related: [Part P Building Regulations Explained: What UK Homeowners Can and Can't DIY](/blog/part-p-building-regulations-explained/)

---

## Simulating a Kitchen Wiring Plan in ElectraSim

Before committing to cable routes and consumer unit allocation, build the complete kitchen circuit plan in [ElectraSim](/app/):

1. Place a **consumer unit** and populate it with RCBOs for each kitchen circuit
2. Wire a **ring main** with sockets at multiple positions — observe how the load divides across both legs of the ring
3. Add a **cooker circuit** with a 32 A RCBO and a high-power load — enable Fault Simulation Mode to see how an overload and an earth fault behave differently
4. Add a **washing machine circuit** and simulate a motor fault — confirm the 20 A RCBO trips without affecting the ring main
5. Compare a design with all circuits on a single 63 A RCD block vs individual RCBOs — observe how a single fault affects the rest of the kitchen in each case

This lets you verify your circuit design, understand protection behaviour, and plan your consumer unit layout — all before buying any materials.

> [Open ElectraSim — free, no sign-up →](/app/)

---

## Common Mistakes

| Mistake | Risk | Correct approach |
|---|---|---|
| Plugging a cooker into a ring main socket via an adaptor | Overload, fire | Dedicated cooker circuit with control unit |
| Washing machine and dishwasher on same spur | Simultaneous start trips RCBO | Separate circuits or separate spurs |
| Under-specifying consumer unit ways | No capacity for future circuits | Plan for at least 8 ways for kitchen circuits |
| Fridge on same circuit as other appliances | Single trip kills food storage | Dedicated unswitched spur or circuit |
| No RCD protection on kitchen sockets | Earth fault shock risk near sink | RCBO on every kitchen circuit |
| Routing 6 mm² cable through thermal insulation without derating | Cable overheats at rated current | Apply derating factor; upsize to 10 mm² if needed |
| Cooker control unit mounted above hob | Heat and steam damage the switch | Mount to the side at 1.4–1.6 m height |

---

## Key Points

- A full kitchen needs **6–8 dedicated circuits** — plan consumer unit space before the kitchen is designed
- The **kitchen ring main** should be its own 32 A RCBO circuit, separate from rings in other rooms
- **Cookers and ranges** always need a dedicated circuit with 6 mm² cable and a 45 A cooker control unit — never a standard 13 A socket
- **Washing machines and dishwashers** should have individual 20 A circuits with switched FCU outlets
- **Fridge-freezers** are best on a dedicated unswitched circuit to protect food in the event of a fault on another circuit
- Use **RCBOs on every circuit** — kitchen circuits near water benefit most from individual 30 mA protection
- New circuits are **Part P notifiable** — use a registered electrician or notify Building Control
- Model your complete kitchen circuit plan in [ElectraSim](/app/) to verify MCB sizing, ring main behaviour, and fault protection before installation
