---
title: "Cable Clipping and Containment: How to Run Electrical Cables Safely and Legally"
description: "How you route and support electrical cables is just as important as choosing the right size. This guide covers every containment method — surface clipping, conduit, trunking, cable tray, concealed runs — and explains the BS 7671 rules on prescribed zones, the 50 mm depth rule, and mechanical protection."
pubDate: 2026-06-21
author: ElectraSim
category: Intermediate Guide
tags: [cable containment, cable clipping, electrical conduit, cable trunking, prescribed zones, 50mm rule, concealed cables, surface wiring, BS 7671, wiring regulations, cable installation, mechanical protection, fire stopping, cable management]
---

Choosing the right cable size gets most of the attention. How that cable is actually run through a building — how it is supported, protected, and routed — gets far less, yet it has an equally direct impact on safety, compliance, and the long-term integrity of the installation.

Run a cable through 100 mm of loft insulation without derating it and you have a fire risk. Clip it to a surface without adequate support and it sags, strains at terminations, and looks unprofessional. Bury it in a wall outside a prescribed zone without mechanical protection and you have created a concealed hazard that will catch the next person who drills in.

This guide covers every cable containment method used in UK domestic and light commercial wiring, the BS 7671 rules that govern each, and how to choose the right method for each situation.

---

## Why Cable Containment Matters

Cable containment serves four distinct purposes:

1. **Mechanical protection** — prevents physical damage from drilling, nailing, impact, or abrasion
2. **Thermal management** — affects how much heat the cable can dissipate, directly impacting its current-carrying capacity
3. **Fire containment** — limits the spread of fire through cable routes penetrating walls and floors
4. **Future identification** — allows later occupants and electricians to find, trace, and work on cables safely

BS 7671 (the IET Wiring Regulations) addresses all four. Getting containment right means considering each purpose, not just picking whatever is easiest to install.

---

## Surface Wiring: Clipping Cable Direct

The simplest containment method is clipping cable directly to a surface — wall, ceiling, or joist — using plastic cable clips.

### How to clip cable correctly

- **Clip spacing:** BS 7671 Table 4A recommends maximum clip spacing of **250 mm horizontally** and **400 mm vertically** for flat twin and earth cable (e.g. 2.5 mm² T&E). Closer spacing is always acceptable; wider spacing allows the cable to sag and strain at terminations.
- **Cable orientation:** flat twin and earth cable should be clipped with the flat face against the surface, not on its edge. This maximises heat dissipation and gives the clip the correct grip on the cable.
- **Around corners:** use cable clips rated for corner bends and do not allow the cable to kink. Maintain the cable's minimum bend radius — typically 3× the cable's overall diameter for fixed wiring.
- **At terminations:** always leave a short loop of cable at every accessory (socket, switch, junction box). Cables clipped too tight with no slack will pull terminations loose as the cable moves with temperature changes.

### Current rating for clipped cable

Cable clipped directly to a surface (or on a perforated cable tray) benefits from free air circulation on all sides — this is the reference installation method (Method C / Reference Method B in BS 7671 Table 4D5) and gives the **highest current rating** for a given cable size.

| Cable Size | Clipped Direct Rating (twin and earth, 70°C thermoplastic) |
|---|---|
| 1.0 mm² | 14 A |
| 1.5 mm² | 18.5 A |
| 2.5 mm² | 24 A |
| 4.0 mm² | 32 A |
| 6.0 mm² | 41 A |
| 10.0 mm² | 57 A |

These ratings **reduce** when cables are grouped together, enclosed in insulation, or run in conduit. See [Electrical Cable Sizes Explained](/blog/electrical-cable-sizes-explained/) for derating factors.

### When surface clipping is appropriate

Surface clipping is the standard method for:
- Cables in loft spaces running across joists
- Cables in garages, outbuildings, and utility areas where aesthetics are secondary
- Cable runs in areas that will later be concealed by dry lining or boxing

It is generally **not** appropriate as a finished installation in living areas — trunking or conduit provides a neater result and better mechanical protection.

---

## Plastic Trunking

Trunking is a rectangular plastic channel with a removable lid, fixed to the surface, that encloses one or more cables in a neat run.

### Types of trunking

| Type | Use |
|---|---|
| **Mini trunking** (16×16 mm, 25×16 mm) | Single cable runs — telephone, TV aerial, low-voltage data |
| **Standard trunking** (25×25 mm, 38×25 mm, 50×25 mm) | Lighting and socket circuits in domestic installations |
| **Dado trunking** | Multi-compartment trunking at desk height — separates power, data, and comms |
| **Skirting trunking** | Replaces or covers the skirting board — conceals multiple circuits at low level |
| **Floor trunking** | Recessed into screeded floors for office power and data |

### Current rating in trunking

Cable enclosed in trunking runs warmer than cable clipped direct, because heat dissipation is reduced. BS 7671 requires a **derating factor** to be applied:

- Single cable in enclosed trunking: approximately **80% of clipped direct rating**
- Two cables grouped in trunking: approximately **70%**
- Three or more cables grouped: **60% or less**, depending on grouping

In practice, for domestic circuits where a single 2.5 mm² ring main cable runs in trunking, the 24 A clipped direct rating reduces to approximately 19 A in trunking — still well within the 32 A MCB protection, but the margin narrows. Always check grouping derating when multiple circuits share a trunking run.

### Installing trunking correctly

- Fix trunking at maximum **500 mm centres** (closer in high-vibration environments)
- Use purpose-made internal corners, external corners, and end caps — unsupported cable edges at corners cause insulation damage over time
- Do not mix mains voltage (230 V) and extra-low voltage (ELV) cables — data, telephone, or TV aerial cables — in the same trunking compartment unless the trunking has a physical separator. BS 7671 Regulation 528.1 requires segregation of circuits of different voltage bands.
- Seal trunking penetrations through fire-rated walls and floors with intumescent materials

---

## Conduit

Conduit is a circular tube — plastic (PVC) or metal — through which cables are drawn after the conduit is fixed in place. Unlike trunking, individual cables (not twin and earth) are used inside conduit — typically singles in the appropriate colours.

### Types of conduit

| Type | Material | Use |
|---|---|---|
| **PVC oval conduit** | Plastic | Concealed in plaster, dry lining — for a single cable run |
| **PVC round conduit** | Plastic | Surface or concealed, multiple cables, standard domestic and commercial |
| **Flexible PVC conduit** | Plastic | Short flexible sections at motors and equipment with movement |
| **Steel conduit** (heavy gauge) | Steel | Industrial, high-mechanical-risk, or where the conduit itself is the earth path |
| **Galvanised steel conduit** | Steel | Outdoor and damp industrial environments |

### Advantages of conduit

- **Cables can be replaced** without chasing or disturbing surfaces — draw out old cables and pull new ones through
- Excellent mechanical protection
- Steel conduit provides a metallic earth path (though a separate CPC is still recommended in most installations)
- Clean, professional finish in exposed areas (garages, plant rooms)

### Conduit fill — how many cables fit?

Conduit has a maximum fill ratio to allow cables to be drawn in and out without damage. BS 7671 Appendix 5 provides guidance:

| Conduit Size | Maximum Number of 1.5 mm² singles | Maximum Number of 2.5 mm² singles |
|---|---|---|
| 20 mm | 5 | 3 |
| 25 mm | 8 | 6 |
| 32 mm | 14 | 10 |

Exceeding the fill ratio makes drawing cables impossible and risks damaging insulation during installation. Always design conduit runs with spare capacity.

### Current rating in conduit

Cable in conduit (especially when conduit is concealed in thermal insulation) has significantly reduced current-carrying capacity. For 2.5 mm² singles in a 20 mm conduit concealed in a thermally insulated wall:

- Clipped direct rating: 24 A
- In conduit, open run: ~20 A
- In conduit, in insulation: ~13 A

This is why conduit in thermally insulated walls requires careful cable sizing — see [Electrical Cable Sizes Explained](/blog/electrical-cable-sizes-explained/).

---

## Concealed Wiring: The 50 mm Rule and Prescribed Zones

Concealing cables inside walls — in plaster, dry lining, or stud partitions — is the standard domestic wiring method. BS 7671 Regulation 522.6.6 and 522.6.7 set out the rules governing when and how this is permitted.

### The 50 mm depth rule

A cable concealed in a wall or partition **must** be either:

1. **Within 50 mm of the surface** (so it is in the zone where a future occupant would reasonably be expected to drill), **AND** protected by a 30 mA RCD, or
2. **Deeper than 50 mm**, in which case it must have **mechanical protection** (steel conduit, steel trunking, or armoured cable) sufficient to prevent penetration by normal drilling and nailing, or
3. **In a prescribed zone** (see below)

The logic: if a cable is within 50 mm of the surface and gets drilled through, the RCD trips immediately, protecting the person drilling. If it is deeper and has mechanical protection, the drill cannot reach it. Without either, a concealed cable is a hidden hazard.

### Prescribed zones

A **prescribed zone** is an area of wall where cables are expected to run — and therefore where a reasonable person would check before drilling. BS 7671 defines prescribed zones as follows:

**Vertical zones:**
- Within 150 mm of the top of a wall (i.e., running along the wall just below ceiling level)
- Within 150 mm of either side of a corner formed by two walls meeting at a right angle

**Horizontal zones:**
- Within 150 mm of the top of a wall (same as above)
- Within 150 mm horizontally of an electrical accessory (socket outlet, switch, consumer unit) — the zone extends horizontally from the accessory to the nearest corner or boundary

Cables running inside prescribed zones **without mechanical protection** are acceptable because anyone drilling in these areas should reasonably expect cables to be present. Outside prescribed zones, a concealed cable either needs to be within 50 mm of the surface (with RCD protection) or have mechanical protection.

### Visualising prescribed zones

```
┌─────────────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ← Top zone (150 mm)
│                                                     │
│░░│                                           │░░░░░│  ← Corner zones (150 mm)
│  │         Safe drilling area                │     │
│  │         (no concealed cables              │     │
│░░│          without protection)              │░░░░░│
│                                                     │
│         [SOCKET]←150 mm→                           │
│░░░░░░░░░░░░░░░░                                     │  ← Horizontal zone from socket
└─────────────────────────────────────────────────────┘
```

The shaded areas are prescribed zones. Cables can run here without mechanical protection (subject to the 50 mm depth rule and RCD protection requirement). Outside these zones, cables must be in conduit, armoured, or buried at sufficient depth with mechanical protection.

### Practical implications for DIY wiring

If you are running a new cable to a socket or switch:

1. **Plan the route through prescribed zones where possible** — run up to the top of the wall, across within 150 mm of the ceiling, and back down to the new accessory location
2. **If the route must leave prescribed zones**, use oval conduit or metal-clad conduit to protect the cable
3. **Always draw a sketch** of where concealed cables run before plastering or dry lining — and photograph the run before covering it
4. **Ensure RCD protection** on all circuits where cables are run within 50 mm of the surface

---

## Armoured Cable (SWA)

Steel Wire Armoured (SWA) cable has a layer of steel wires wound around the insulated cores, providing a high level of mechanical protection. It is the correct choice for:

- **Underground cable runs** — garden, outbuilding supplies, driveway crossings
- **Exposed external runs** on walls or buildings
- **Cables in areas of high mechanical risk** — garages, workshops, agricultural buildings
- **Long surface runs** where conduit is impractical

### SWA cable installation

- The steel armour must be terminated correctly using SWA glands — the armour is connected to earth through the gland, providing both mechanical termination and earthing continuity
- For **underground installation**, SWA should be buried at a minimum depth of **500 mm** under areas not subject to vehicle traffic and **600 mm** under areas that may be driven over
- Lay a **cable marker tape** (yellow, printed "ELECTRIC CABLE BELOW") approximately 150 mm above the cable during backfill — this warns future excavators before they reach the cable
- For long underground runs, use a **cable route drawing** or GPS record of the exact path

### SWA vs twin and earth for outdoor runs

Do not use standard flat twin and earth cable for outdoor or underground runs — it is not rated for external use, is not UV-resistant, and has no mechanical protection. SWA (or suitable outdoor-rated flexible cable for short, above-ground runs with additional conduit protection) is the correct choice.

See [How to Wire a Shed or Outbuilding](/blog/how-to-wire-a-shed-or-outbuilding/) for a complete guide to underground supply cables.

---

## Cable Tray and Basket

Cable tray (solid or perforated steel or plastic tray) and cable basket (an open wire mesh structure) are used in commercial, industrial, and larger domestic installations to support multiple cables over long horizontal or vertical runs.

### When to use cable tray

- Loft or roof space runs with multiple circuits
- Commercial plant rooms, server rooms, and distribution areas
- Any run with more circuits than trunking can practically contain

### Current rating on perforated tray

Cables laid on perforated cable tray in free air have a current rating equivalent to **clipped direct** (or slightly higher for cables spaced apart), because air circulation is unrestricted. Cables touching on a tray must be derated for grouping.

### Cable securing on tray

Cables must be secured to cable tray at regular intervals — typically every 300–500 mm on horizontal runs and every 150–300 mm on vertical runs — using cable ties or proprietary cable cleats. Unsecured cables on vertical tray runs can migrate under gravity, straining terminations.

---

## Cable Runs Through Floors and Joists

Running cables through timber floor joists is standard practice in UK domestic wiring. BS 7671 and the Building Regulations both place requirements on how this is done.

### Drilling joists — the rules

- Holes must be drilled in the **neutral axis** of the joist — the centre third of the joist's depth. Drilling near the top or bottom of a joist significantly weakens it.
- Maximum hole diameter: **0.25× the joist depth** (e.g., 50 mm hole in a 200 mm joist)
- Holes must be no closer than **3× the hole diameter** apart along the joist
- Holes must be at least **50 mm** from the edge of any notch in the joist

If you need to notch a joist (for larger cables or where drilling is not possible), notches must be in the **outer quarter** of the span and not deeper than **0.125× the joist depth**.

### Cables in floor voids

Cables suspended in a floor void (between ground floor joists, between ceiling and upper floor) are treated as clipped direct for current rating purposes if they are not lying on or embedded in thermal insulation.

If cables are clipped to the underside of floorboards and covered by loft insulation laid over them, derating for thermal insulation must be applied.

### Penetrating fire-rated floors and walls

Any cable penetrating a fire-rated floor, ceiling, or wall must be **fire-stopped** at the penetration point. This means sealing around the cable with:

- **Intumescent putty or foam** — swells when heated, sealing the gap
- **Intumescent collars** — for larger conduit or trunking penetrations through compartment walls
- **Fire-rated trunking** with integral fire-stopping

Failing to fire-stop cable penetrations is a serious building safety issue and a common EICR observation. It is also a Building Regulations compliance failure (Part B — Fire Safety).

---

## Common Cable Containment Mistakes

### Stapling through cables
Using a cable staple or hammer-in clip that has been driven through the cable rather than over it. This damages the insulation and creates a potential arc fault. Always use the correct size clip for the cable, and check that the clip sits over the cable, not through it.

### Running cables across joists without protection
In accessible loft spaces, cables running across (not along) joists are vulnerable to foot traffic. They should be run through holes drilled in the joists, or protected by cable covers, not simply laid across the top.

### Grouping circuits without derating
Running five ring main cables in a single trunking without applying grouping derating factors. The cables run hotter than rated, the insulation degrades faster, and the circuit may be undersized for its actual load. Check [Electrical Cable Sizes Explained](/blog/electrical-cable-sizes-explained/) for derating tables.

### Leaving cables outside prescribed zones without protection
Running a cable diagonally across a wall to save cable length — outside every prescribed zone — and then plastering over it. The next person to fit a picture hook, shelf bracket, or TV mount becomes a hazard. Always route through zones or use conduit.

### Not photographing concealed cable routes
Covering a cable run without any record of where it is. A photograph with a scale reference (tape measure along the wall) before plastering costs nothing and can prevent a serious injury years later.

### Incorrect SWA gland installation
Terminating an SWA cable without proper glands, leaving the armour unconnected to earth. The armour then provides no earth fault path and no protection — it is just a false sense of security.

### Not fire-stopping penetrations
Passing conduit or trunking through a compartment wall and leaving the annular gap unsealed. A fire in one room can spread through the unsealed penetration in minutes.

---

## Reference Method Summary

BS 7671 uses **reference installation methods** to determine current ratings. The method depends entirely on how the cable is installed:

| Installation Method | BS 7671 Reference | Effect on Current Rating |
|---|---|---|
| Clipped direct to surface | Method C (Ref B) | Full rating — highest |
| In free air, touching a wall | Method B | ~90% of clipped direct |
| In conduit on a wall | Method C (enclosed) | ~80% of clipped direct |
| In conduit in a thermally insulated wall | Method B (insulated) | ~55% of clipped direct |
| Buried direct in ground | Method D | Depends on soil, depth |
| In trunking | Method B (enclosed) | ~80% of clipped direct |
| Touching in groups of 3 | Grouping factor 0.70 | 70% of single-cable rating |
| Touching in groups of 6 | Grouping factor 0.57 | 57% of single-cable rating |

Always identify the worst-case section of a cable run — the section with the highest temperature rise or lowest heat dissipation — and size the cable for that section. A short section in insulation limits the entire circuit.

---

## Quick Reference: Choosing the Right Containment Method

| Location | Recommended Method |
|---|---|
| Living room / bedroom walls (finished) | Oval conduit in plaster or prescribed zone cable, RCD protected |
| Kitchen / bathroom (tiled walls) | Surface trunking or prescribed zone concealed cable |
| Garage / utility (exposed) | Surface trunking or conduit |
| Loft — along joists | Clipped direct or in oval conduit through joists |
| Loft — across joists | Drilled through joists or in conduit |
| Underground to outbuilding | SWA cable, min 500 mm depth, marker tape |
| External wall (exposed) | SWA or conduit (UV-rated, weatherproof fittings) |
| Through fire-rated floor/wall | Any method + intumescent fire stopping at penetration |
| Commercial/industrial open runs | Perforated cable tray or cable basket |

---

## Key Takeaways

- **Containment method directly affects current-carrying capacity** — a cable rated at 24 A clipped direct may only carry 13 A safely in the same size when enclosed in thermal insulation. Always derate correctly.
- The **50 mm rule** (BS 7671 Reg 522.6.6/522.6.7): concealed cables within 50 mm of a surface must have 30 mA RCD protection; deeper cables must have mechanical protection.
- **Prescribed zones** — within 150 mm of ceiling, corners, and accessories — are where cables can be concealed without mechanical protection. Outside these zones, use conduit or armoured cable.
- **Clip spacing:** 250 mm horizontal, 400 mm vertical maximum for flat twin and earth. Always leave a service loop at accessories.
- **Segregate voltage bands** — do not run mains and ELV (data, telephone, TV) cables in the same trunking compartment without a physical separator.
- **Fire-stop every penetration** through compartment walls and floors — unsealed cable penetrations are a common EICR observation and a genuine fire hazard.
- **Photograph every concealed cable run** before covering — a record that takes seconds to make can prevent a serious injury years later.
- Use **SWA cable** for all underground and high-mechanical-risk runs — never bury standard flat twin and earth.

**Planning a new circuit?** Use [ElectraSim](/app/) to design and verify your wiring layout before you pick up a drill — free, browser-based, no account required. [Open ElectraSim →](/app/)
