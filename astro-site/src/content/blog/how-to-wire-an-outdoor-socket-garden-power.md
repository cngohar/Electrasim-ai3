---
title: "How to Wire an Outdoor Socket: Garden Power and External Sockets Explained"
description: "A complete UK guide to installing outdoor sockets and garden power — IP ratings, cable types, RCD protection, burial depth, Part P notification, and how to plan a safe outdoor circuit from the consumer unit."
pubDate: 2026-05-21
author: ElectraSim
category: Wiring Guide
tags: [outdoor socket, garden socket, external socket wiring, SWA cable, armoured cable, IP65 socket, outdoor power, garden electrics, Part P, BS 7671, RCD outdoor, cable burial depth, garden lighting]
---

A garden socket transforms how you use outdoor space — powering tools, lighting, water features, and EV chargers without trailing extension leads from the house. But an outdoor socket installation involves more decisions than an indoor one: cable type, burial depth, IP rating, RCD protection, and whether the work needs to be notified under Part P of the Building Regulations.

This guide covers everything from planning to testing. You can simulate the circuit protection logic in **[ElectraSim](/app/)** before the first cable is laid.

---

## Planning Your Outdoor Circuit

Before buying anything, answer four questions:

**1. What will you power?**
- General garden tools, lighting, water feature → standard 13 A socket on a 32 A ring or 20 A radial
- Electric lawnmower or hedge trimmer used occasionally → same
- Workshop/shed with sustained loads → dedicated radial circuit, possibly with its own sub-board
- EV charger → dedicated circuit; specific earthing and protection requirements apply separately

**2. Where will the socket go?**
- On the external house wall → simplest, cable runs through the wall from the ring or a new radial
- At the end of the garden / detached outbuilding → longer cable run, burial depth, and potentially a sub-consumer unit

**3. How will the cable run?**
- Through the wall and surface-mounted outside → requires suitable trunking or conduit for the exposed run
- Buried in the ground → requires armoured cable or cable in conduit, correct burial depth

**4. Does the work need notifying?**
- Any new circuit in a domestic property (including an outdoor socket on a new circuit) is **notifiable work under Part P** of the Building Regulations
- A like-for-like socket replacement is not notifiable
- Notifiable work must be done by a Part P-registered electrician OR you must notify your local authority Building Control before starting and pay for an inspection

---

## IP Rating for Outdoor Sockets

All outdoor sockets must have an appropriate IP rating for their exposure level.

| Location | Minimum IP | Recommended IP |
|---|---|---|
| Under a deep covered porch | IP44 | IP55 |
| External wall, partly sheltered | IP55 | IP65 |
| External wall, fully exposed | IP65 | IP66 |
| At ground level in garden | IP65 | IP67 |
| Post-mounted in open garden | IP65 | IP67 |

**IP44** handles splashing from any direction but is not jet-rated — heavy rain driven by wind can penetrate an IP44 enclosure. For any socket that will be directly rained on, **IP65 minimum** is the safe choice.

Purpose-made **weatherproof outdoor sockets** have a sprung or screw-down cover that closes over the plug-in use. Some designs have two-piece covers that seal around the cable even when a plug is inserted — these are rated for **use-while-connected** operation, essential for garden features running continuously.

> Related: [IP Rating Explained: IP44, IP65, IP67 and What Every Number Means](/blog/ip-rating-explained-ip44-ip65-ip67/)

---

## RCD Protection: Mandatory for All Outdoor Sockets

Under BS 7671 (18th Edition), socket outlets that may supply outdoor equipment require **30 mA RCD protection**. For a practical garden socket installation, treat RCD/RCBO protection as essential rather than optional.

This can be provided by:
- An **RCBO** at the consumer unit protecting that circuit alone (best — only the outdoor circuit trips on a fault)
- A **whole-circuit RCD** at the consumer unit covering the circuit
- A **RCD socket** at the outdoor location (useful for existing circuits without upstream RCD protection)
- A **plug-in RCD adapter** — acceptable as a temporary measure for tools but not as a permanent installation solution

An outdoor socket without RCD protection is a **Category 2 (C2) defect** on an EICR — potentially dangerous. Given that outdoor use typically involves damp conditions, soil contact, and equipment being dragged across wet grass, the risk of an earth fault without RCD clearance is significant.

> Related: [What Is an RCD and Why Do You Need One?](/blog/what-is-an-rcd-and-why-do-you-need-one/)

> Related: [What Is an RCBO? The Difference Between RCD, MCB and RCBO Explained](/blog/what-is-an-rcbo-difference-between-rcd-mcb-rcbo/)

---

## Cable Types for Outdoor Wiring

The correct cable depends on how and where it runs.

### Twin and earth in conduit (surface or buried)

Standard **2.5 mm² twin and earth** can be used outdoors if it is fully enclosed in **rigid PVC conduit** or **galvanised steel conduit** throughout its length, including the burial section. The conduit must be sealed at both ends to prevent moisture ingress.

This is a good option for:
- Surface-mounted runs along external walls (in grey PVC conduit)
- Short buried sections where conduit is practical

### Steel Wire Armoured (SWA) cable

**SWA cable** has an outer PVC sheath, steel wire armour, and an inner PVC sheath around the conductors. It is mechanically robust, can be buried directly in the ground, and does not need conduit unless passing through a wall or other structure.

For a domestic outdoor socket circuit:
- **2.5 mm² SWA** (two-core + earth, or three-core) is standard
- The steel armour must be **earthed at both ends** using proper SWA glands
- Where the SWA terminates at an outdoor socket, a weatherproof SWA gland and back box are required

### Direct-bury PVC-insulated cables

Standard flat twin and earth must **never** be buried directly in soil without conduit. It is not rated for direct ground contact and will fail as moisture and soil chemicals degrade the insulation.

---

## Cable Burial Depth

Where cable is buried in the ground, BS 7671 requires it to be protected against foreseeable mechanical damage. The following depths are common UK practice and align with widely used guidance for typical domestic routes:

| Cable route | Minimum depth |
|---|---|
| Under garden / lawn (unlikely to be disturbed) | **500 mm** |
| Under a driveway or path | **600 mm** |
| Under a road | **900 mm** |
| In conduit or with physical protection (e.g. cover tiles) | **300 mm** |

**Practical advice:**
- Lay the cable in a trench with a layer of sand above and below to protect from sharp stones
- Place **yellow cable marker tape** approximately 150 mm above the cable before backfilling — a spade hitting the tape gives warning before the cable is reached
- Mark the cable route on a drawing and keep it — you or future owners will need to know exactly where it runs

---

## Circuit Design and Cable Sizing

### Option A: Spur from an existing ring main

The simplest approach — add the outdoor socket as a **fused spur** from the house ring main, protected by a **fused connection unit (FCU)** with a 13 A fuse.

**Pros:** No new circuit needed, no new MCB space required  
**Cons:** The outdoor socket is limited to 13 A (2,990 W at 230 V); the FCU must be indoors or in a weatherproof enclosure; the ring circuit must be healthy (no open ring faults)

### Option B: Dedicated radial circuit from the consumer unit

A **dedicated 20 A radial** (2.5 mm² cable, 20 A RCBO) or **32 A radial** (4 mm² cable, 32 A RCBO) supplies the outdoor socket(s) directly from the consumer unit.

**Pros:** Full circuit capacity, independent protection, cleaner installation  
**Cons:** Requires a spare way in the consumer unit; notifiable work; more materials

For most domestic garden sockets, **Option A via an FCU** is perfectly adequate for garden tools and lighting. For a workshop with power tools, EV charger, or high-demand use, **Option B dedicated radial** is the right approach.

> Related: [Electrical Cable Sizes Explained: 1mm², 1.5mm², 2.5mm² and Beyond](/blog/electrical-cable-sizes-explained/)

> Related: [How to Wire a Ring Main Circuit](/blog/how-to-wire-a-ring-main-circuit/)

---

## Earthing and Bonding

All outdoor metalwork — the socket back box, any conduit or trunking, SWA armour — must be properly earthed and connected to the circuit earth.

For SWA cable: the steel wire armour acts as the **circuit protective conductor (CPC)** when earthed at both ends via proper SWA glands. The glands must make solid metal-to-metal contact with the armour and be connected to the earth terminal of the back box and the consumer unit earth bar.

If the installation uses TN-C-S (PME) earthing and you are installing an outdoor socket on a post away from the house, be aware that the outdoor socket is a potential touch-voltage hazard under an open-PEN fault. In most cases the 30 mA RCBO provides adequate protection, but for EV chargers or very exposed metalwork at ground level, consider TT-isolating the outdoor circuit with its own earth electrode.

> Related: [Types of Earthing Systems Explained: TN-S, TN-C-S (PME) and TT](/blog/types-of-earthing-systems-tn-s-tn-c-s-tt-explained/)

---

## Testing Before Energising

Before connecting the circuit to the supply, a qualified electrician should carry out:

1. **Insulation resistance test** — confirms no conductor-to-conductor or conductor-to-earth short in the cable run
2. **Earth continuity test** — confirms the earth path is complete from the socket to the consumer unit MET
3. **Polarity test** — confirms live connects to live, neutral to neutral at the socket
4. **RCD operation test** — confirms the RCBO or RCD trips at or below 30 mA and within the required time

For notifiable work, these test results are recorded on an **Electrical Installation Certificate (EIC)** issued by the installing electrician.

---

## Building an Outdoor Garden Power Circuit in ElectraSim

Planning your outdoor circuit in [ElectraSim](/app/) before installation lets you verify the protection logic and understand how each device behaves:

1. Place a **Consumer Unit** (Power Supply) with an **RCBO** protecting the outdoor circuit
2. Run a cable (wire) to an **outdoor socket** (load)
3. Add an **earth fault** using Fault Simulation Mode — watch the RCBO trip immediately at the low residual current level
4. Compare the response with a plain MCB (no RCD) — the MCB does not trip, demonstrating why 30 mA protection is mandatory outdoors

> [Open ElectraSim — free, no account required →](/app/)

---

## Common Mistakes to Avoid

**Using flat T&E buried directly** — flat twin and earth without conduit will degrade in soil and fail; always use SWA or T&E in conduit

**IP44 socket in an exposed location** — sufficient for a sheltered porch but not for a socket that will be directly rained on; use IP65 minimum

**No RCD protection** — a ground fault on an outdoor circuit without a 30 mA RCD is uncleared and potentially fatal; always protect outdoor circuits

**Not notifying Building Control** — a new outdoor circuit is notifiable; an unregistered installation cannot be signed off and affects the property's electrical condition at resale

**Shallow burial** — cable less than 500 mm deep can be cut by a spade during routine gardening; always bury at the correct depth and lay marker tape above

---

## Key Points

- **IP65 minimum** for any outdoor socket exposed to rain — IP44 is not sufficient
- **30 mA RCD or RCBO** should be treated as essential for outdoor socket circuits
- **SWA cable** for direct burial; standard T&E only in sealed conduit
- **Minimum 500 mm burial depth** in gardens; 600 mm under paths and driveways
- **New outdoor circuit = notifiable work** under Part P — use a registered electrician or notify Building Control
- **Test insulation, earth continuity, polarity, and RCD** before energising
