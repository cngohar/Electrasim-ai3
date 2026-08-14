---
title: "How to Wire a Fused Connection Unit (FCU): Switched, Unswitched and Spur Rules"
description: "A Fused Connection Unit provides fused protection for permanently connected appliances. This UK guide explains how to wire switched and unswitched FCUs, when to use them, fuse ratings, and the rules for adding spurs to ring circuits."
pubDate: 2026-05-29
author: ElectraSim
category: Wiring Guide
tags: [fused connection unit, FCU wiring, how to wire FCU, switched FCU, unswitched FCU, fused spur, 13 amp spur, 3 amp fuse, permanent connection, cooker switch, heater wiring, extractor fan wiring, BS 7671, ring circuit spur]
---

A **Fused Connection Unit (FCU)** is the standard way to connect a permanently wired appliance in UK domestic installations. Unlike a socket outlet where you plug and unplug, an FCU provides a **fused terminal block** inside a wall-mounted plate — the appliance connects once and stays connected, protected by a fuse that will blow before the cable is damaged.

This guide explains how to wire switched and unswitched FCUs, when to use a 3 A vs 13 A fuse, and how FCUs fit into ring circuit spur arrangements.

---

## What Is a Fused Connection Unit?

An FCU is a wall-mounted accessory that combines:

- A **terminal block** for connecting the fixed appliance cable
- A **fuse** (3 A or 13 A) to protect the outgoing cable and appliance
- A **switch** (in switched types) for local isolation
- An **indicator neon** (on many switched types) showing power is present

The fuse is **BS 1362** type — the same cartridge fuse used in a standard 13 A plug. This allows the fuse rating to be matched to the appliance, not fixed at 13 A like a socket.

FCUs are used for:
- **Electric heaters** (wall-mounted panel heaters, towel rails)
- **Extractor fans** (bathroom, kitchen, utility)
- **Dishwashers and washing machines** (where no socket is provided)
- **Boilers** (fused connection to the heating system)
- **Under-cupboard lighting** or display lighting
- **Cooker control units** (often incorporate an FCU-style fused connection)

---

## Switched vs Unswitched FCU

| Type | Features | Typical use |
|---|---|---|
| **Switched FCU** | Fuse + double-pole switch + neon indicator | Appliances that need regular isolation (heaters, fans, boilers) |
| **Unswitched FCU** | Fuse only, no switch | Appliances with their own switch or where isolation is at the consumer unit (hidden lighting, some boilers) |
| **Switched FCU with neon** | As switched, with power indicator | Most common domestic installation — you can see if the circuit is live |

The **double-pole switch** in a switched FCU disconnects both live and neutral simultaneously, ensuring full isolation for maintenance.

---

## Fuse Ratings: 3 A vs 13 A

The fuse protects the **outgoing cable to the appliance**, not the supply cable feeding the FCU. Choose the fuse based on the appliance rating:

| Fuse rating | Maximum load | Typical appliances |
|---|---|---|
| **3 A** | 690 W at 230 V | Extractor fans, under-cupboard lights, small boilers, doorbells, low-power appliances |
| **13 A** | 2,990 W at 230 V | Panel heaters (up to 2.5 kW), washing machines, dishwashers, towel rails, larger boilers |

Using a 13 A fuse on a 3 A-rated fan cable means the cable could overheat and catch fire before the fuse blows. Always match the fuse to the **smallest** rating: either the appliance rating or the cable's current-carrying capacity, whichever is lower.

---

## Wiring an FCU from a Ring Circuit (Fused Spur)

The most common FCU installation is as a **fused spur** from a ring final circuit. This allows you to add a fixed appliance without extending the ring itself.

### The spur rule

BS 7671 allows **one fused spur** per point on a ring circuit, or **unlimited fused spurs** if the total number of spurs does not exceed the total number of socket outlets on the ring. In practice, most domestic installations keep fused spurs to a reasonable number (2–4 per ring).

### Wiring sequence

```
Ring circuit cable (2.5 mm² T&E)
         |
    FCU (fused connection unit)
         |
    Appliance cable (appropriate size)
         |
    Appliance (heater, fan, etc.)
```

At the FCU terminals:

- **L (Line)** — brown from ring circuit → brown to appliance (via fuse)
- **N (Neutral)** — blue from ring circuit → blue to appliance
- **E (Earth)** — green/yellow from ring circuit → green/yellow to appliance

The fuse sits in the line path only. Neutral and earth are continuous.

---

## Wiring an FCU from a Radial Circuit

For high-power appliances (heaters approaching 3 kW), an FCU can be fed from a **20 A radial circuit** rather than a 32 A ring. The wiring is identical; the radial simply provides a dedicated supply rather than a spur from a ring.

---

## Cable Sizes for FCU Circuits

### Supply cable to FCU

- From **ring circuit**: 2.5 mm² twin and earth (existing ring cable)
- From **radial circuit**: 2.5 mm² twin and earth (standard radial)

### Outgoing cable from FCU to appliance

| Appliance load | Minimum cable |
|---|---|
| Up to 720 W (3 A fuse) | 1.0 mm² flexible or 1.5 mm² T&E |
| Up to 2,990 W (13 A fuse) | 1.5 mm² flexible or 2.5 mm² T&E |
| 3 kW+ heater (requires dedicated circuit, not FCU) | N/A — use dedicated heater circuit |

**Important:** The outgoing cable from the FCU to the appliance must be rated for the **fuse size** in the FCU, not just the appliance rating. A 13 A fuse requires cable capable of carrying 13 A (1.5 mm² minimum, 2.5 mm² preferred).

---

## FCU in Bathroom Zones

FCUs are **not permitted in Zone 2 or Zone 1** of a bathroom. They are allowed **outside the zones** (general bathroom area) but the appliance they supply must be appropriate for the zone.

For bathroom extractor fans:
- The **FCU** must be outside Zone 2 (or be a pull-cord type)
- The **fan** must be rated for the zone it occupies (Zone 2 = IPX4 minimum)
- The circuit must have **30 mA RCD protection**

> Related: [How to Wire a Bathroom: Complete Zone-by-Zone UK Guide](/blog/how-to-wire-a-bathroom-zone-by-zone-uk-guide/)

---

## FCU for Cookers (Cooker Control Units)

A **Cooker Control Unit** is essentially a large FCU rated at 45 A with a double-pole switch. It provides:
- Fused connection (often with a 13 A socket on the faceplate for kettle/toaster)
- Double-pole isolation for the cooker
- High-current rating for oven/hob loads

The wiring principles are identical to a standard FCU, but with 6 mm² or 10 mm² cable and a 45 A rating.

> Related: [How to Wire a Cooker or Electric Oven: UK Circuit Guide](/blog/how-to-wire-a-cooker-electric-oven-uk/)

---

## Part P and FCU Installation

In England, adding an FCU as a **new spur from an existing suitable ring or radial circuit** is usually **not notifiable under Part P** unless it:
- Creates a **new circuit**
- Adds or alters wiring in a Part P special location such as a bath/shower room zone, swimming pool location, or sauna-heater room
- Forms part of wider notifiable work such as a consumer unit replacement

Kitchens are no longer Part P special locations in England, but kitchen FCUs still need careful design because appliance load, isolation, RCD protection and accessibility matter. Wales and local authority requirements can differ, so check Building Control if the scope is unclear.

---

## Common Mistakes

| Mistake | Risk | Correct approach |
|---|---|---|
| 13 A fuse on 3 A-rated cable | Cable fire before fuse blows | Match fuse to cable and appliance rating |
| FCU in bathroom Zone 2 | Non-compliant, shock hazard | Mount FCU outside zones |
| No local isolation (unswitched FCU for heater) | Cannot safely isolate for maintenance | Use switched FCU or isolator switch |
| Unfused spur from ring (socket outlet on spur) | Overload risk | Fused connection unit required for spurs from ring |
| Wrong cable size from FCU to appliance | Overheating | 1.5 mm² minimum for 13 A fuse, 2.5 mm² preferred |
| FCU supplying multiple appliances | Overload, fuse nuisance blowing | One FCU per appliance, or use socket circuit |

---

## Simulating FCU Protection in ElectraSim

An FCU's fuse behaves like a protection device that blows at a specific current threshold. In [ElectraSim](/app/):

1. Build a circuit with an **MCB** representing the ring circuit protection (32 A)
2. Add a **load** representing the appliance
3. Set the load current above the FCU fuse rating but below the MCB rating
4. Observe that without an FCU fuse, the ring MCB does not trip — the cable could overheat
5. The FCU fuse (represented by appropriate load limiting or fault injection) prevents this scenario

This demonstrates why **fused spurs** are required from ring circuits — the ring MCB is too high a rating to protect a single spur cable.

> [Open ElectraSim — free, no sign-up →](/app/)

---

## Key Points

- An **FCU** provides fused protection for permanently connected appliances
- **Switched FCUs** allow local isolation; **unswitched FCUs** rely on consumer unit isolation
- Match the **fuse rating** (3 A or 13 A) to the appliance and cable — never exceed the cable rating
- **Fused spurs from ring circuits** are the standard way to add fixed appliances
- **Cable from FCU to appliance**: 1.5 mm² minimum for 13 A fuse, 2.5 mm² preferred
- **Bathroom FCUs** must be outside Zone 2; appliances supplied must match their zone IP rating
- **Kitchen and bathroom FCU installations** are notifiable under Part P
