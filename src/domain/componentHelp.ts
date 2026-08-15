export interface ComponentHelpData {
  title: string;
  category?: string;
  voltage?: string;
  amperage?: string;
  powerWatts?: string | number;
  breakingCapacity?: string;
  tripCurve?: string;
  frequency?: string;
  ipRating?: string;
  cableSize?: string;
  poles?: string;
  standards: string;
  overview: string;
  circuitBehavior: string;
  keySpecs: string[];
  quickTips: string[];
}

export const COMPONENT_HELP_REGISTRY: Record<string, ComponentHelpData> = {
  // ─── PROTECTION DEVICES ───
  mcb: {
    title: 'Miniature Circuit Breaker (MCB) - Type B',
    category: 'protection',
    voltage: '230V / 400V AC (50/60Hz)',
    amperage: '6A, 10A, 16A, 20A, 32A, 40A, 50A, 63A',
    breakingCapacity: '6kA / 10kA (BS EN 60898)',
    tripCurve: 'Type B (3–5× In instantaneous trip)',
    frequency: '50Hz / 60Hz',
    ipRating: 'IP20 (enclosure mounted)',
    cableSize: '1.5mm² – 25mm² copper',
    poles: '1 Pole (Single Phase)',
    standards: 'BS EN 60898-1 / IEC 60898-1 / BS 7671',
    overview:
      'Type B MCBs protect electrical final circuits against continuous overloads and low-level short circuits. They feature a precision thermal bimetallic strip for inverse-time overload protection and a magnetic coil for rapid short-circuit disconnection.',
    circuitBehavior:
      'Trips instantaneously within 0.1s when current reaches 3 to 5 times its rated current (In). Standard for domestic lighting, general socket outlets, and resistive domestic appliances.',
    keySpecs: [
      'Trip Factor: 3–5× In (Instantaneous electromagnetic trip)',
      'Breaking Capacity: 6,000A (6kA) standard / 10,000A (10kA) industrial',
      'Operating Voltage: 230V AC Single-Phase',
      'Endurance: 20,000 mechanical operations / 10,000 electrical operations',
    ],
    quickTips: [
      'Ideal for resistive domestic loads, domestic lighting, and standard BS 1363 socket rings.',
      'Always ensure downstream cable current-carrying capacity (Iz) exceeds breaker nominal rating (In).',
      'If nuisance tripping occurs upon starting inductive appliances, upgrade to Type C curve.',
    ],
  },
  'mcb-type-c': {
    title: 'Miniature Circuit Breaker (MCB) - Type C',
    category: 'protection',
    voltage: '230V / 400V AC (50/60Hz)',
    amperage: '6A, 10A, 16A, 20A, 32A, 40A, 50A, 63A',
    breakingCapacity: '6kA / 10kA (BS EN 60898)',
    tripCurve: 'Type C (5–10× In instantaneous trip)',
    frequency: '50Hz / 60Hz',
    ipRating: 'IP20',
    cableSize: '1.5mm² – 25mm²',
    poles: '1 Pole / 3 Pole',
    standards: 'BS EN 60898-1 / IEC 60898-1',
    overview:
      'Type C MCBs are engineered for commercial and light industrial circuits with higher inductive inrush currents, such as fluorescent lighting banks, small electric motors, air conditioners, and step-down transformers.',
    circuitBehavior:
      'Trips instantaneously at 5 to 10 times rated current. This higher magnetic trip threshold prevents nuisance tripping during switch-on current spikes while providing reliable protection against true short circuits.',
    keySpecs: [
      'Trip Factor: 5–10× In (High Inrush Tolerance)',
      'Breaking Capacity: 6kA / 10kA',
      'Typical Uses: Motors, fluorescent luminaires, IT power supplies, HVAC units',
      'Max Disconnection Time: 0.4s (TN system)',
    ],
    quickTips: [
      'Specify Type C for circuits supplying air conditioning, water pumps, or multiple LED driver ballasts.',
      'Verify loop impedance (Zs) complies with maximum permitted values under BS 7671 for Type C breakers.',
    ],
  },
  'mcb-type-d': {
    title: 'Miniature Circuit Breaker (MCB) - Type D',
    category: 'protection',
    voltage: '230V / 400V AC (50/60Hz)',
    amperage: '10A, 16A, 20A, 32A, 50A, 63A',
    breakingCapacity: '10kA / 15kA (IEC 60947-2)',
    tripCurve: 'Type D (10–20× In instantaneous trip)',
    frequency: '50Hz / 60Hz',
    ipRating: 'IP20',
    cableSize: '2.5mm² – 35mm²',
    poles: '1 Pole / 3 Pole',
    standards: 'BS EN 60898-1 / IEC 60947-2',
    overview:
      'Type D MCBs are heavy-duty protective devices built specifically for high magnetic inrush applications, including heavy 3-phase industrial induction motors, arc welders, X-ray machinery, and large power distribution transformers.',
    circuitBehavior:
      'Trips instantaneously only when fault current exceeds 10 to 20 times nominal rating, safely absorbing heavy transient start-up magnetization surges without opening.',
    keySpecs: [
      'Trip Factor: 10–20× In',
      'Breaking Capacity: 10kA to 15kA',
      'Applications: Industrial welders, large transformers, industrial machinery',
    ],
    quickTips: [
      'Only use Type D when equipment has extreme start-up surges.',
      'Ensure supply transformer and cable loop impedance (Zs) are low enough to deliver sufficient fault current to trigger the magnetic trip mechanism.',
    ],
  },
  mccb: {
    title: 'Moulded Case Circuit Breaker (MCCB)',
    category: 'protection',
    voltage: '415V / 690V AC (50/60Hz)',
    amperage: '100A, 160A, 250A, 400A, 630A, 800A',
    breakingCapacity: '25kA – 70kA (IEC 60947-2)',
    tripCurve: 'Adjustable Thermal & Magnetic Trip Settings',
    frequency: '50Hz / 60Hz',
    ipRating: 'IP40 front / IP20 terminals',
    cableSize: '35mm² – 240mm² or copper busbars',
    poles: '3 Pole / 4 Pole',
    standards: 'BS EN 60947-2 / IEC 60947-2',
    overview:
      'Moulded Case Circuit Breakers (MCCBs) provide industrial-grade circuit protection for main incoming supplies and high-power feeder circuits. They feature adjustable thermal overload (0.7–1.0× In) and magnetic short-circuit trip thresholds.',
    circuitBehavior:
      'Interrupts high fault currents up to 70kA safely inside an arc chute chamber. Equipped with an ergonomic rotary operating handle and remote shunt trip / undervoltage release capabilities.',
    keySpecs: [
      'Rated Current: 100A to 800A adjustable',
      'Breaking Capacity: 36kA – 70kA at 415V',
      'Adjustable Ir (Thermal) & Im (Magnetic) settings',
    ],
    quickTips: [
      'Used as the main incomer or feeder breaker for commercial distribution boards and motor control centres.',
      'Always torque terminal lug bolts to manufacturer specification (e.g. 15–25 Nm) using a calibrated torque wrench.',
    ],
  },
  rcd: {
    title: 'Residual Current Device (RCD) - Double Pole',
    category: 'protection',
    voltage: '230V AC Single-Phase',
    amperage: '25A, 40A, 63A, 80A, 100A (Incomer rating)',
    breakingCapacity: '10kA conditional with upstream fuse/MCB',
    tripCurve: 'Residual current trip: 30mA (IΔn)',
    frequency: '50Hz',
    ipRating: 'IP20',
    cableSize: '1.5mm² – 25mm²',
    poles: '2 Pole (Live + Neutral)',
    standards: 'BS EN 61008-1 / BS 7671 Regulation 411.3.3',
    overview:
      'Residual Current Devices continuously monitor the magnetic vector sum of current flowing through the Live and Neutral conductors. If current leaks to Earth (e.g. damaged insulation or human electrocution contact), the toroidal core imbalance triggers an ultra-fast trip mechanism.',
    circuitBehavior:
      'Disconnects both Live and Neutral simultaneously in less than 40 milliseconds when earth leakage exceeds 30mA, preventing fatal electric shocks and mitigating electrical fire risks.',
    keySpecs: [
      'Sensitivity (IΔn): 30mA for personnel safety (additional protection)',
      'Trip Time: < 300ms at 1× IΔn, < 40ms at 5× IΔn',
      'Type: Type A (detects sinusoidal AC and pulsating DC residual currents)',
    ],
    quickTips: [
      'Both incoming Live AND Neutral conductors MUST pass through the RCD toroidal sensor.',
      'Press the yellow "TEST" button periodically (recommended every 6 months) to exercise the mechanical trip linkage.',
    ],
  },
  rcbo: {
    title: 'Residual Current Breaker with Overcurrent (RCBO)',
    category: 'protection',
    voltage: '230V AC Single-Phase',
    amperage: '6A, 10A, 16A, 20A, 32A, 40A, 45A',
    breakingCapacity: '6kA / 10kA (BS EN 61009-1)',
    tripCurve: 'Type B / Type C overcurrent curve + 30mA Earth leakage',
    frequency: '50Hz',
    ipRating: 'IP20',
    cableSize: '1.5mm² – 16mm²',
    poles: 'Single Module Width (Switched Live + Solid/Switched Neutral)',
    standards: 'BS EN 61009-1 / BS 7671 18th Edition',
    overview:
      'An RCBO integrates the dual functionality of an MCB (overload and short-circuit protection) and an RCD (earth leakage shock protection) into a compact single-module DIN-rail device.',
    circuitBehavior:
      'Provides dedicated, independent safety protection to an individual circuit. If a fault develops on one circuit, only that specific RCBO trips, preventing nuisance outages across other critical household circuits.',
    keySpecs: [
      'Dual Protection: Overcurrent (6A–45A) + Earth Leakage (30mA)',
      'Width: 1 DIN Module (18mm)',
      'Neutral Flylead: Dedicated neutral connection to consumer unit busbar',
    ],
    quickTips: [
      'Modern consumer unit standard: installing all-RCBO boards guarantees maximum circuit continuity.',
      'Connect the white functional earth (FE) lead and blue neutral flylead directly to the distribution board neutral/earth bars.',
    ],
  },
  spd: {
    title: 'Surge Protection Device (SPD) - Type 2',
    category: 'protection',
    voltage: '230V / 275V AC continuous (Uc)',
    amperage: 'Discharge Current: In = 20kA / Imax = 40kA',
    breakingCapacity: '25kA short circuit withstand',
    tripCurve: 'Voltage Clamping (Response Time < 25ns)',
    frequency: '50Hz / 60Hz',
    ipRating: 'IP20',
    cableSize: '4mm² – 16mm²',
    poles: '1P+N / 3P+N (Modular DIN rail)',
    standards: 'BS EN 61643-11 / BS 7671 Section 443 & 534',
    overview:
      'Surge Protection Devices protect sensitive electronics, home automation, and appliances against destructive overvoltage transient spikes generated by lightning strikes or high-voltage utility grid switching.',
    circuitBehavior:
      'High-energy Metal Oxide Varistors (MOVs) and gas discharge tubes remain high impedance during normal voltage. When a surge occurs, they transition to low impedance within nanoseconds, diverting massive surge currents safely to Earth.',
    keySpecs: [
      'Type: Type 2 Surge Arrester (Consumer unit sub-distribution protection)',
      'Max Discharge Current (Imax): 40kA per pole',
      'Voltage Protection Level (Up): < 1.3kV',
      'Visual Status: Green = Protected / Red = Replace Module Cartridge',
    ],
    quickTips: [
      'Connect in parallel with main supply incoming terminals.',
      'Keep the total connecting lead length (Live + Earth) strictly under 0.5 meters to prevent inductive voltage overshoot.',
    ],
  },
  fuse: {
    title: 'HRC Cartridge Fuse (BS 88 / BS 1362)',
    category: 'protection',
    voltage: '240V / 415V AC',
    amperage: '3A, 5A, 13A (Plug) / 16A–100A (BS 88 Industrial)',
    breakingCapacity: '80kA at 415V (High Rupturing Capacity)',
    tripCurve: 'Thermal fusible element melting curve',
    frequency: '50Hz / 60Hz / DC',
    ipRating: 'IP20 (in carrier)',
    cableSize: '1.5mm² – 35mm²',
    poles: '1 Pole',
    standards: 'BS 1362 / BS 88-2 / IEC 60269',
    overview:
      'High Rupturing Capacity (HRC) fuses contain an engineered silver or copper fusible element surrounded by quartz silica sand inside a high-strength ceramic barrel, providing exceptional short-circuit fault interruption capability.',
    circuitBehavior:
      'When high fault current flows, the element melts and vaporizes. The quartz sand quenches the electric arc and fuses into non-conductive fulgurite glass within milliseconds, breaking faults up to 80,000 Amps safely.',
    keySpecs: [
      'Breaking Capacity: Up to 80kA (80,000 Amps)',
      'Material: Ceramic body with silver-plated copper end-caps and quartz sand filling',
    ],
    quickTips: [
      'Always replace blown fuses with exact specified amperage and voltage ratings.',
      'Ensure fuse clips maintain firm mechanical contact tension to prevent overheating from contact resistance.',
    ],
  },

  // ─── SWITCHES & CONTROLS ───
  'single-way-switch': {
    title: 'Single-Way Wall Switch (10AX)',
    category: 'switch',
    voltage: '230V AC (50Hz)',
    amperage: '10AX (Inductive/Fluorescent) / 16A (Resistive)',
    powerWatts: 2300,
    frequency: '50Hz',
    ipRating: 'IP20 (Indoor) / IP66 with weatherproof enclosure',
    cableSize: '1.0mm² – 2.5mm²',
    poles: '1 Pole (Live switching)',
    standards: 'BS EN 60669-1 / BS 7671',
    overview:
      'A standard single-pole single-throw (SPST) rocker switch designed for controlling a lighting circuit or small appliance from a single fixed location.',
    circuitBehavior:
      'When ON, connects the incoming Live rail (L-in) to the switched Live output (L-out). When OFF, creates an air-gap isolation on the Live line.',
    keySpecs: [
      'Rating: 10AX (Fluorescent & LED inductive inrush rated)',
      'Terminals: COM (Live In) and L1 (Switched Live Out)',
      'Contact Gap: Micro-gap standard (≥ 3mm)',
    ],
    quickTips: [
      'Always switch the LIVE conductor — never switch the Neutral conductor.',
      'Earth wire must be sleeved green/yellow and bonded to the metal back box and faceplate earth terminal.',
    ],
  },
  'two-way-switch': {
    title: 'Two-Way Changeover Switch (SPDT 10AX)',
    category: 'switch',
    voltage: '230V AC (50Hz)',
    amperage: '10AX',
    powerWatts: 2300,
    frequency: '50Hz',
    ipRating: 'IP20',
    cableSize: '1.0mm² – 2.5mm²',
    poles: '1 Pole 2-Way (Single Pole Double Throw)',
    standards: 'BS EN 60669-1',
    overview:
      'Single-pole double-throw switch featuring a Common terminal (COM) and two strapper terminals (L1 and L2). Used in pairs to control a single light or circuit from two different locations (such as the top and bottom of a staircase or opposite ends of a hallway).',
    circuitBehavior:
      'Flipping either switch alternates the internal connection between COM and L1 or L2, making or breaking circuit continuity between the two switch locations.',
    keySpecs: [
      'Terminals: COM, L1 (Strapper 1), L2 (Strapper 2)',
      'Rating: 10AX 230V AC',
      'Cable: 3-Core & Earth (Brown, Black with brown sleeve, Grey with blue/brown sleeve)',
    ],
    quickTips: [
      'Connect permanent Live to COM on the first switch, and the switched Live to the lamp from COM on the second switch.',
      'Connect L1-to-L1 and L2-to-L2 using strapper conductors between both switch boxes.',
    ],
  },
  'intermediate-switch': {
    title: 'Intermediate Crossover Switch (4-Terminal)',
    category: 'switch',
    voltage: '230V AC (50Hz)',
    amperage: '10AX',
    powerWatts: 2300,
    frequency: '50Hz',
    ipRating: 'IP20',
    cableSize: '1.0mm² – 2.5mm²',
    poles: '4-Terminal Double Pole Crossover',
    standards: 'BS EN 60669-1',
    overview:
      'A 4-terminal crossover switch inserted between two 2-way switches. Enables seamless lighting control from 3, 4, or more separate locations (e.g. multi-landing stairwells, large corridors, open-plan rooms).',
    circuitBehavior:
      'In Position 1, connects L1-in to L1-out and L2-in to L2-out. In Position 2, crosses them over (L1-in to L2-out and L2-in to L1-out), reversing the strapper pair status.',
    keySpecs: [
      'Terminals: L1-in, L2-in, L1-out, L2-out',
      'Rating: 10AX 250V AC',
    ],
    quickTips: [
      'Position intermediate switches strictly between two 2-way switches on the strapper line.',
      'You can add as many intermediate switches as needed for N-point lighting control.',
    ],
  },
  'double-pole-switch': {
    title: 'Double-Pole Isolator Switch (20A / 45A)',
    category: 'switch',
    voltage: '230V / 240V AC',
    amperage: '20A (Water Heaters) / 45A (Cookers)',
    powerWatts: 4600,
    frequency: '50Hz',
    ipRating: 'IP20',
    cableSize: '2.5mm² – 10.0mm²',
    poles: '2 Pole (Live and Neutral Simultaneous Isolation)',
    standards: 'BS EN 60669-2-4 / BS 7671 Regulation 537.2',
    overview:
      'Heavy-duty switch that physically breaks both the Live AND Neutral lines simultaneously, ensuring complete electrical isolation for heavy appliances like water heaters, showers, and air conditioners.',
    circuitBehavior:
      'Features a contact gap ≥ 3mm across both poles with an integrated neon power indicator lamp showing when the downstream load is energized.',
    keySpecs: [
      'Rating: 20A (4.6kW) or 45A (10.3kW)',
      'Dual Contact Break: Isolates Live and Neutral together',
      'Neon Power Indicator: Shows live output state',
    ],
    quickTips: [
      'Mandatory for fixed appliances located near water or requiring safe maintenance isolation.',
      'Check cable clamp screws are tightened to prevent loose connections on heavy current loads.',
    ],
  },
  'dimmer-switch': {
    title: 'Rotary Phase-Cut LED Dimmer Switch',
    category: 'switch',
    voltage: '230V AC (50Hz)',
    amperage: '0.1A – 1.1A',
    powerWatts: '5W – 250W LED / 400W Halogen',
    frequency: '50Hz',
    ipRating: 'IP20',
    cableSize: '1.0mm² – 2.5mm²',
    poles: '1 Pole Push-On / Push-Off + Rotary Dim',
    standards: 'BS EN 60669-2-1 / EMC Directive',
    overview:
      'Advanced digital trailing-edge / leading-edge phase-cut dimmer module engineered for smooth, flicker-free dimming of dimmable LED lamps, downlights, and incandescent fixtures.',
    circuitBehavior:
      'Electronic MOSFET/TRIAC switches chop the AC sine wave at selectable phase angles, reducing RMS voltage and thermal power delivered to the lamp.',
    keySpecs: [
      'Dimming Technology: Trailing Edge (Optimized for LED drivers)',
      'Min Load: 5W / Max Load: 250W LED',
      'Push On/Off with smooth rotary dial control',
    ],
    quickTips: [
      'Verify connected light bulbs are explicitly certified as "DIMMABLE".',
      'Do not connect non-dimmable ballasts, CFLs, or fluorescent tubes.',
    ],
  },
  'pir-sensor': {
    title: 'PIR Infrared Motion Sensor (360° Ceiling Mount)',
    category: 'switch',
    voltage: '220V – 240V AC',
    amperage: 'Switching Relay: 10A (Resistive) / 3A (LED)',
    powerWatts: 1200,
    frequency: '50/60Hz',
    ipRating: 'IP20 (Indoor) / IP65 (Outdoor options)',
    cableSize: '1.0mm² – 2.5mm²',
    poles: 'Live In, Neutral In, Switched Live Out',
    standards: 'BS EN 60669-2-1 / CE / RoHS',
    overview:
      'Passive Infrared (PIR) occupancy detector that senses moving human thermal infrared signatures across a 360° detection zone to automatically trigger lighting.',
    circuitBehavior:
      'Internal pyroelectric sensor and Fresnel lens trigger a solid-state relay when motion is detected. Built-in adjustable dials set hold-time (10s–15min) and ambient lux threshold (3–2000 lux).',
    keySpecs: [
      'Detection Range: 360° cone / 6m – 8m radius at 2.8m mounting height',
      'Adjustable Time Delay: 10 seconds to 15 minutes',
      'Lux Sensor: 3 Lux (Night only) to 2000 Lux (Daylight operation)',
    ],
    quickTips: [
      'Requires continuous Live and Neutral supply to power the internal sensor electronics.',
      'Avoid placing directly above heating radiators or in direct air conditioner airflow.',
    ],
  },
  'cooker-unit': {
    title: 'Cooker Control Unit (45A DP + 13A Socket)',
    category: 'switch',
    voltage: '230V AC (50Hz)',
    amperage: '45A (Cooker Switch) + 13A (Auxiliary Socket)',
    powerWatts: 10350,
    frequency: '50Hz',
    ipRating: 'IP20',
    cableSize: '6.0mm² – 10.0mm²',
    poles: 'Double Pole 45A Isolator',
    standards: 'BS 4177 / BS 7671',
    overview:
      'High-capacity kitchen control unit providing a 45A double-pole master switch for electric ovens/hobs alongside an independent switched 13A 3-pin socket outlet.',
    circuitBehavior:
      'Controls high power cookers up to 10.3kW on a dedicated radial circuit from the consumer unit (typically protected by a 32A or 40A MCB).',
    keySpecs: [
      'Cooker Switch: 45A Double Pole with neon indicator',
      'Socket: 13A BS 1363 single switched outlet with neon indicator',
      'Cable: 6mm² or 10mm² Twin & Earth',
    ],
    quickTips: [
      'Must be located within 2 meters of the cooker, but not directly above the hot cooking surface.',
      'Always use appropriate 6mm² or 10mm² cable sized for diversity calculations under BS 7671.',
    ],
  },

  // ─── SOCKETS & OUTLETS ───
  'socket-3pin': {
    title: 'UK 13A Single Switched Socket Outlet (BS 1363)',
    category: 'socket',
    voltage: '230V AC (50Hz)',
    amperage: '13A continuous',
    powerWatts: 3000,
    frequency: '50Hz',
    ipRating: 'IP20',
    cableSize: '2.5mm² (Ring) / 4.0mm² (Radial)',
    poles: 'Live, Neutral, Earth with Safety Shutters',
    standards: 'BS 1363-2 / BS 7671',
    overview:
      'Standard UK household power outlet featuring an integrated single-pole switch and automatic internal safety shutters over the Live and Neutral apertures.',
    circuitBehavior:
      'Delivers up to 13A (3.0kW) at 230V AC. Inserting the longer top Earth pin physically cams open the internal spring-loaded shutters, allowing Live and Neutral plug pins to engage.',
    keySpecs: [
      'Rated Current: 13A (3000W at 230V)',
      'Safety Mechanism: Earth-activated automatic child safety shutters',
      'Plate Dimensions: 86mm × 86mm standard single gang',
    ],
    quickTips: [
      'Always connect all three conductors: Live (Brown), Neutral (Blue), Earth (Green/Yellow).',
      'All socket outlets rated ≤ 32A require 30mA RCD protection under BS 7671 regulations.',
    ],
  },
  'double-socket': {
    title: 'Twin 13A Switched Socket Outlet (2-Gang BS 1363)',
    category: 'socket',
    voltage: '230V AC (50Hz)',
    amperage: '13A per outlet (20A combined continuous maximum)',
    powerWatts: 3680,
    frequency: '50Hz',
    ipRating: 'IP20',
    cableSize: '2.5mm² – 4.0mm²',
    poles: 'Twin Outlets with Dual DP Switches',
    standards: 'BS 1363-2 / BS 7671',
    overview:
      'Standard double socket plate with two independently switched BS 1363 outlets, widely installed in residential ring final and commercial radial power circuits.',
    circuitBehavior:
      'Supplies power to two appliances simultaneously. Internal copper busbars bridge Live, Neutral, and Earth between both socket compartments.',
    keySpecs: [
      'Max Load: 13A individual outlet / 20A combined total across both sockets',
      'Back Box Depth: 25mm standard / 35mm recommended for 2.5mm² ring loop cables',
    ],
    quickTips: [
      'Standard in 32A MCB protected ring final circuits using 2.5mm² Twin & Earth cable.',
      'Check all terminal screws are firmly torqued to avoid contact heating under high loads.',
    ],
  },
  'socket-usb': {
    title: 'Twin 13A Socket with Integrated USB Fast Charger',
    category: 'socket',
    voltage: '230V AC Input / 5V, 9V, 12V DC USB Output',
    amperage: '13A AC + 3.1A / 4.2A USB Fast Charge',
    powerWatts: '3000W AC + 20W–45W USB PD',
    frequency: '50Hz',
    ipRating: 'IP20',
    cableSize: '2.5mm² – 4.0mm²',
    poles: 'Twin AC Outlets + USB-A & USB-C Ports',
    standards: 'BS 1363-2 / EN 62368-1 / USB Power Delivery',
    overview:
      'Modern dual wall socket incorporating high-efficiency smart switch-mode DC converters providing high-speed USB-A and USB-C Power Delivery (PD) charging for smartphones, tablets, and laptops.',
    circuitBehavior:
      'Delivers standard 230V AC to plug sockets while internal DC step-down regulator negotiates charging voltage (5V/9V/12V) with connected USB devices with over-temperature and short-circuit protection.',
    keySpecs: [
      'USB Ports: 1× USB-A (QC 3.0) + 1× USB-C (Power Delivery PD 20W/30W)',
      'Standby DC Power: < 0.1W',
      'AC Rating: 13A 230V per gang',
    ],
    quickTips: [
      'Requires a 35mm deep back box to accommodate the rear internal transformer housing.',
      'Connect standard Live, Neutral, and Earth mains wiring.',
    ],
  },
  'socket-gfci': {
    title: 'Ground Fault Circuit Interrupter (GFCI / RCD Socket)',
    category: 'socket',
    voltage: '120V / 230V AC',
    amperage: '15A / 20A (US) or 13A (UK RCD socket)',
    powerWatts: 3600,
    breakingCapacity: '10kA conditional',
    tripCurve: '4mA–6mA (US GFCI) / 30mA (UK RCD socket)',
    frequency: '50/60Hz',
    ipRating: 'IP20 / Weather-Resistant WR versions for wet locations',
    cableSize: '2.5mm² – 4.0mm²',
    poles: 'Line In + Load Out terminals for downstream circuit protection',
    standards: 'UL 943 / BS 7288 / NEC Article 210.8',
    overview:
      'Specialized safety socket outlet featuring built-in microsecond ground fault sensing, central TEST / RESET buttons, and status indicator LED.',
    circuitBehavior:
      'Monitors current balance. If an earth fault exceeding 4–6mA (GFCI) or 30mA (RCD) occurs, mechanical contacts open in under 25ms. Downstream outlets wired to "LOAD" terminals receive full ground-fault protection.',
    keySpecs: [
      'Trip Threshold: 4mA–6mA (Personnel class A protection)',
      'Trip Speed: < 25 milliseconds',
      'Dual Terminals: LINE (supply in) and LOAD (protected downstream out)',
    ],
    quickTips: [
      'Mandatory in bathrooms, kitchens, basements, garages, and outdoor locations.',
      'Be careful not to reverse LINE and LOAD terminals during installation.',
    ],
  },

  // ─── LIGHTING LOADS ───
  bulb: {
    title: 'High-Efficiency LED Filament Lamp',
    category: 'lighting',
    voltage: '220V – 240V AC (50/60Hz)',
    amperage: '0.04A (at 9W)',
    powerWatts: 9,
    frequency: '50Hz',
    ipRating: 'IP20 (E27 / B22 Base)',
    cableSize: '1.0mm² – 1.5mm²',
    poles: 'Live + Neutral',
    standards: 'BS EN 62560 / Energy Class A+',
    overview:
      'Solid-state LED lighting fixture utilizing micro-LED chip-on-glass filament strings to produce high luminous efficacy (800 lumens at only 9W) with warm 2700K or daylight 4000K illumination.',
    circuitBehavior:
      'Built-in constant-current electronic driver rectifies AC mains to DC. High power factor (~0.90) and low operating temperature.',
    keySpecs: [
      'Power: 9W (Replaces 60W incandescent)',
      'Luminous Flux: 806 Lumens (~90 lm/W)',
      'Lifespan: 25,000 Hours (L70)',
      'Colour Temperature: 2700K Warm White',
    ],
    quickTips: [
      'Reduces lighting electrical energy consumption by up to 85% compared to incandescent bulbs.',
      'Always turn off circuit power before changing or replacing light bulbs.',
    ],
  },
  'bulb-incandescent': {
    title: 'Incandescent Tungsten Filament Lamp',
    category: 'lighting',
    voltage: '230V AC',
    amperage: '0.26A (at 60W)',
    powerWatts: 60,
    frequency: '50Hz / 60Hz / DC',
    ipRating: 'IP20',
    cableSize: '1.0mm² – 1.5mm²',
    poles: 'Live + Neutral',
    standards: 'IEC 60064',
    overview:
      'Traditional incandescent lamp producing light by passing electric current through a tungsten filament enclosed in a vacuum or inert gas glass bulb, heating it to ~2500°C.',
    circuitBehavior:
      'Acts as a pure resistive load with Unity Power Factor (1.00). Cold filament has very low resistance, drawing a brief inrush current (up to 10× normal operating current) upon initial switch-on.',
    keySpecs: [
      'Power: 60W / 100W',
      'Power Factor: 1.00 (Pure Resistive)',
      'Efficacy: ~12 lm/W (Converts 95% of energy into heat)',
    ],
    quickTips: [
      'Compatible with all types of leading-edge and trailing-edge dimmer switches.',
      'Operates at high surface temperatures — allow bulb to cool before handling.',
    ],
  },
  'bulb-cfl': {
    title: 'Compact Fluorescent Lamp (CFL Spiral)',
    category: 'lighting',
    voltage: '230V AC (50Hz)',
    amperage: '0.08A (at 15W)',
    powerWatts: 15,
    frequency: '50Hz',
    ipRating: 'IP20',
    cableSize: '1.0mm² – 1.5mm²',
    poles: 'Live + Neutral',
    standards: 'BS EN 60968',
    overview:
      'Compact fluorescent lamp utilizing an integrated electronic ballast to ionize low-pressure mercury vapor, producing UV radiation that excites a phosphor coating inside the glass spiral tube.',
    circuitBehavior:
      'Draws non-linear current spikes with moderate power factor (~0.60–0.85). Exhibits a warm-up period of 30–60 seconds to reach full luminous output.',
    keySpecs: [
      'Power: 15W (75W incandescent equivalent)',
      'Luminous Efficacy: ~60 lm/W',
      'Lifespan: 8,000 – 10,000 Hours',
    ],
    quickTips: [
      'Do not use with standard wall dimmers unless explicitly labeled "Dimmable CFL".',
      'Contains trace mercury — must be recycled at authorized waste facilities.',
    ],
  },
  'bulb-smart-rgb': {
    title: 'Smart RGB+CCT Wi-Fi / Zigbee LED Lamp',
    category: 'lighting',
    voltage: '220V – 240V AC (50/60Hz)',
    amperage: '0.045A (at 10W)',
    powerWatts: 10,
    frequency: '50Hz / 60Hz',
    ipRating: 'IP20',
    cableSize: '1.0mm² – 1.5mm²',
    poles: 'Live + Neutral',
    standards: 'BS EN 62560 / RED Directive (Radio Equipment)',
    overview:
      'Smart solid-state luminaire containing a micro-controller, 2.4GHz wireless transceiver, and addressable multichannel Red, Green, Blue, Warm White, and Cold White (RGB+CCT) LED arrays.',
    circuitBehavior:
      'Draws ~0.5W standby power when turned off via app. Internal PWM driver precisely regulates color channels and brightness from 1% to 100%.',
    keySpecs: [
      'Power: 10W (800 Lumens)',
      'Colors: 16 Million RGB Colors + 2200K–6500K Tunable White',
      'Wireless: Wi-Fi 802.11 b/g/n (2.4GHz) / Zigbee 3.0 / Matter',
    ],
    quickTips: [
      'Requires continuous Live power supply — do not switch off physical wall switch if automating via smart home.',
      'Ensure reliable Wi-Fi / Zigbee mesh gateway coverage.',
    ],
  },
  'led-downlight': {
    title: 'Recessed Fire-Rated LED Ceiling Downlight (IP65)',
    category: 'lighting',
    voltage: '230V AC',
    amperage: '0.035A (at 8W)',
    powerWatts: 8,
    frequency: '50Hz',
    ipRating: 'IP65 (Front face / Bathroom Zone 1 compliant)',
    cableSize: '1.0mm² – 1.5mm²',
    poles: 'Live, Neutral, Earth with Loop-in Terminals',
    standards: 'BS EN 60598-2-2 / BS 476 Part 21 (30, 60, 90 min fire rating)',
    overview:
      'Recessed architectural ceiling downlight featuring an integrated constant-current LED driver, intumescent fire-resistant acoustic seal, and IP65 waterproof front bezel.',
    circuitBehavior:
      'Provides high lumen output (700 lm) with focused 38°/60° beam angle. Intumescent material expands under high heat to seal ceiling penetrations and prevent fire spread.',
    keySpecs: [
      'Power: 8W (700 Lumens)',
      'Fire Rating: 30, 60, 90 minutes certified (BS 476)',
      'Waterproof: IP65 suitable for bathroom zones and showers',
    ],
    quickTips: [
      'Mandatory to use fire-rated fittings in ceilings under inhabited living spaces.',
      'Loop-in push-fit terminals allow fast daisy-chain wiring from luminaire to luminaire.',
    ],
  },
  'tube-light': {
    title: 'LED T8 Batten Luminaire (1200mm / 4ft)',
    category: 'lighting',
    voltage: '220V – 240V AC',
    amperage: '0.08A (at 18W)',
    powerWatts: 18,
    frequency: '50Hz',
    ipRating: 'IP20 / IP65 weatherproof options',
    cableSize: '1.0mm² – 1.5mm²',
    poles: 'Live, Neutral, Earth',
    standards: 'BS EN 60598-1 / BS EN 62776',
    overview:
      'High-output linear T8 LED luminaire engineered for workshops, garages, commercial corridors, and utility rooms, replacing traditional fluorescent tubes without ballast hum.',
    circuitBehavior:
      'Direct mains single-ended or double-ended connection. Delivers instant full brightness with 120 lm/W efficiency and no stroboscopic flicker.',
    keySpecs: [
      'Power: 18W (Replaces 36W fluorescent tube)',
      'Lumen Output: 2,160 Lumens (Daylight 6000K)',
      'Beam Angle: 160° Wide Diffused',
    ],
    quickTips: [
      'Bypass old magnetic or electronic ballasts when converting older fluorescent fixtures to direct LED T8.',
      'Ensure the metal chassis is solidly grounded to Earth.',
    ],
  },

  // ─── APPLIANCES & HEAVY LOADS ───
  'water-heater': {
    title: 'Storage Water Heater / Immersion Element (3kW)',
    category: 'load',
    voltage: '230V AC Single-Phase',
    amperage: '13.0A continuous',
    powerWatts: 3000,
    frequency: '50Hz',
    ipRating: 'IPX4 (Splash-proof immersion head)',
    cableSize: '2.5mm² heat-resistant flexible cable',
    poles: 'Live, Neutral, Earth',
    standards: 'BS EN 60335-2-21 / BS 7671',
    overview:
      'Heavy-duty electric immersion heating element sealed inside a domestic or commercial hot water storage cylinder, regulated by an adjustable dual-safety rod thermostat.',
    circuitBehavior:
      'Draws continuous 13.0A resistive load (Power Factor = 1.00). High thermal energy transfers directly into water until target temperature (60°C–65°C) is reached.',
    keySpecs: [
      'Power: 3,000W (3.0kW)',
      'Current: 13.0A at 230V AC',
      'Thermostat: Dual-pole temperature regulator + manual reset safety thermal cut-out (95°C)',
    ],
    quickTips: [
      'Must be wired on a dedicated radial circuit protected by a 16A or 20A MCB.',
      'Must have a dedicated 20A Double Pole isolator switch with neon indicator located nearby.',
    ],
  },
  'ev-charger': {
    title: 'Electric Vehicle Wallbox Charger (7.4kW Mode 3)',
    category: 'load',
    voltage: '230V AC Single-Phase (50Hz)',
    amperage: '32.0A continuous',
    powerWatts: 7360,
    breakingCapacity: 'Type A 30mA + 6mA DC leakage protection integrated',
    frequency: '50Hz',
    ipRating: 'IP65 (Outdoor weatherproof)',
    cableSize: '6.0mm² or 10.0mm² copper radial',
    poles: 'Live, Neutral, Earth (with PEN loss detection)',
    standards: 'BS 7671 Section 722 / IEC 61851-1 / IET EV Code of Practice',
    overview:
      'Dedicated AC Level 2 / Mode 3 fast EV charging wallbox station providing pilot communication and continuous 32A power delivery for electric vehicle battery charging.',
    circuitBehavior:
      'Draws continuous maximum current (32A = 7.36kW) for extended 4–8 hour durations. Control pilot wire negotiates charging state, interlocking the internal contactor until connector is securely latched.',
    keySpecs: [
      'Output Rating: 32A 230V Single-Phase (7.36kW)',
      'Safety: Built-in 6mA DC fault current sensor + automatic PEN fault conductor monitor',
      'Connector: Type 2 (IEC 62196) with motorized solenoid lock',
    ],
    quickTips: [
      'Must be supplied from a dedicated radial circuit protected by a 40A Type B or C MCB/RCBO.',
      'Verify earthing meets BS 7671 Section 722 guidelines (open-PEN disconnect device or independent TT earth rod).',
    ],
  },
  motor: {
    title: 'Single-Phase AC Induction Motor (1.5kW / 2HP)',
    category: 'motor',
    voltage: '230V AC (50Hz)',
    amperage: '8.5A Full Load Current (FLA) / 45A Starting Inrush',
    powerWatts: 1500,
    frequency: '50Hz',
    ipRating: 'IP55 (Dust & water jet protected)',
    cableSize: '2.5mm² – 4.0mm²',
    poles: 'Live, Neutral, Earth + Start Capacitor',
    standards: 'BS EN 60034-1 / IEC 60034',
    overview:
      'Single-phase capacitor-start capacitor-run asynchronous squirrel-cage induction motor engineered for workshops, compressors, conveyor belts, and ventilation machinery.',
    circuitBehavior:
      'Draws 5 to 7 times full-load current upon startup until centrifugal switch disengages the start capacitor. Operates with an inductive lagging power factor (~0.82).',
    keySpecs: [
      'Rated Output: 1.5kW (2.0 Horsepower)',
      'Speed: 2850 RPM (2-Pole) / 1425 RPM (4-Pole)',
      'Starting Torque: 220% full load torque',
    ],
    quickTips: [
      'Protect with a Type C MCB to absorb motor starting inrush surges without tripping.',
      'Fit an adjustable thermal overload relay matched to motor nameplate full load current.',
    ],
  },
  'solar-pv-panel': {
    title: 'Monocrystalline Solar PV Array (400W Tier-1)',
    category: 'supply',
    voltage: '37.2V Vmp / 44.8V Voc (DC)',
    amperage: '10.8A Imp / 11.4A Isc (DC)',
    powerWatts: 400,
    ipRating: 'IP68 (Junction box with MC4 connectors)',
    cableSize: '4.0mm² or 6.0mm² solar DC double-insulated cable',
    poles: 'DC Positive (+) & DC Negative (-)',
    standards: 'IEC 61215 / IEC 61730 / BS 7671 Section 712',
    overview:
      'High-efficiency monocrystalline silicon photovoltaic solar module converting ambient solar irradiance into direct current (DC) electricity.',
    circuitBehavior:
      'Outputs variable DC voltage and current depending on solar irradiance (W/m²) and cell temperature. Pairs with Maximum Power Point Tracking (MPPT) inverters for grid-tie or battery charging.',
    keySpecs: [
      'Peak Power (Pmax): 400W STC (1000 W/m², 25°C)',
      'Module Efficiency: 21.3%',
      'Connectors: MC4 locking connectors',
    ],
    quickTips: [
      'Always install a dedicated DC double-pole rotary isolator switch near the solar array and inverter.',
      'Use UV-resistant, double-insulated 4mm² or 6mm² solar DC cabling.',
    ],
  },
  'distribution-board-3phase': {
    title: '3-Phase TPN Distribution Board (125A 8-Way)',
    category: 'distribution',
    voltage: '400V 3-Phase AC (230V Phase-to-Neutral)',
    amperage: '125A Main Incomer Busbar Rating',
    breakingCapacity: '25kA fault withstand rating',
    frequency: '50Hz / 60Hz',
    ipRating: 'IP3X (Enclosure door closed)',
    cableSize: '35mm² – 70mm² incoming mains',
    poles: '3-Phase + Neutral + Earth (TP&N)',
    standards: 'BS EN 61439-2 / BS 7671',
    overview:
      'Industrial Three-Phase and Neutral (TP&N) power distribution board equipped with a 125A 4-pole main isolator switch and busbars accepting 1-pole and 3-pole DIN-rail breakers.',
    circuitBehavior:
      'Distributes 400V AC across three distinct phase lines (L1, L2, L3) with 120° phase separation, enabling balanced 3-phase heavy motor feeds and 230V single-phase sub-circuits.',
    keySpecs: [
      'Main Incomer: 125A 4-Pole Isolator or MCCB',
      'Phase Balancing: L1 (Brown), L2 (Black), L3 (Grey), Neutral (Blue), Earth (Green/Yellow)',
      'Ways: 8 Triple-Pole / 24 Single-Pole outgoing circuit ways',
    ],
    quickTips: [
      'Carefully balance single-phase load currents across all three phases (L1, L2, L3) to minimize Neutral current.',
      'Verify phase rotation sequence (L1-L2-L3 clockwise) before connecting 3-phase motors.',
    ],
  },
};

/** Get context-specific learning & tips data with rich defaults */
export function getComponentHelp(type: string, category?: string): ComponentHelpData {
  if (COMPONENT_HELP_REGISTRY[type]) {
    return COMPONENT_HELP_REGISTRY[type];
  }

  // Fallbacks by category
  if (category === 'protection') {
    return {
      title: 'Circuit Protection Device',
      category: 'protection',
      voltage: '230V / 400V AC',
      amperage: '6A – 63A',
      breakingCapacity: '6kA / 10kA',
      tripCurve: 'Type B / C / D or 30mA RCD',
      frequency: '50Hz',
      ipRating: 'IP20',
      cableSize: '1.5mm² – 25mm²',
      poles: '1P, 2P, 3P, 4P',
      standards: 'BS EN 60898 / BS EN 61008 / BS 7671 Regulations',
      overview:
        'Protects conductors and equipment against electrical overloads, short circuits, or earth leakage faults.',
      circuitBehavior:
        'Automatically interrupts current flow when safety parameters or thermal thresholds are exceeded.',
      keySpecs: [
        'Sized according to cable carrying capacity (In ≤ Iz)',
        'Automatic disconnection of supply (ADS) within required time limits (0.4s TN / 0.2s TT)',
      ],
      quickTips: [
        'Always ensure protective device rating (In) matches cable capacity (It).',
        'Check insulation resistance before energizing new circuits.',
      ],
    };
  }

  if (category === 'lighting') {
    return {
      title: 'Lighting Load Component',
      category: 'lighting',
      voltage: '230V AC (50Hz)',
      amperage: '0.02A – 0.5A',
      powerWatts: 10,
      frequency: '50Hz',
      ipRating: 'IP20 – IP65',
      cableSize: '1.0mm² – 1.5mm²',
      poles: 'Live + Neutral',
      standards: 'BS EN 60598 / Energy Rating A+',
      overview:
        'Converts electrical energy into lumen illumination for interior or outdoor lighting.',
      circuitBehavior:
        'Draws active power from Live and Neutral supply rails. May exhibit inrush or dimming characteristics.',
      keySpecs: ['Efficiency: LED high efficacy (> 80 lm/W)', 'Power Factor: 0.50–0.98 depending on driver'],
      quickTips: [
        'Connect Live from switch output and Neutral from supply Neutral bar.',
        'Always bond earth to metallic fitting enclosures.',
      ],
    };
  }

  if (category === 'socket') {
    return {
      title: 'Power Socket Outlet',
      category: 'socket',
      voltage: '230V AC (50Hz)',
      amperage: '13A / 16A / 32A',
      powerWatts: 3000,
      frequency: '50Hz',
      ipRating: 'IP20 (Indoor) / IP66 (Outdoor)',
      cableSize: '2.5mm² – 4.0mm²',
      poles: 'Live, Neutral, Earth',
      standards: 'BS 1363 / IEC 60309 / BS 7671',
      overview: 'Provides an accessible connection point for portable appliances and tools.',
      circuitBehavior:
        'Delivers 230V AC up to rated amperage. Requires continuous Live, Neutral, and Earth connections.',
      keySpecs: ['Max Current: 13A / 16A / 32A', 'RCD Protection Mandatory (30mA)'],
      quickTips: [
        'Connect all three rails: Live (Brown), Neutral (Blue), Earth (Green/Yellow).',
        'Verify ring circuit continuity or radial cable sizing.',
      ],
    };
  }

  if (category === 'switch') {
    return {
      title: 'Switching Control Device',
      category: 'switch',
      voltage: '230V AC (50Hz)',
      amperage: '10AX / 20A / 45A',
      frequency: '50Hz',
      ipRating: 'IP20 – IP66',
      cableSize: '1.0mm² – 4.0mm²',
      poles: '1 Pole / 2 Pole',
      standards: 'BS EN 60669 / BS 7671',
      overview: 'Manually or automatically opens and closes electrical paths in live circuits.',
      circuitBehavior:
        'Toggles continuity along the Live line to energize or isolate connected loads.',
      keySpecs: ['Switch Live path only', 'Rated for specific voltage & amperage'],
      quickTips: [
        'Never wire Live and Neutral directly across switch terminals (causes short circuit).',
        'Switch the Live conductor to safely isolate equipment.',
      ],
    };
  }

  return {
    title: 'Electrical Circuit Component',
    category: 'component',
    voltage: '230V AC / 12V DC',
    amperage: 'Standard load rating',
    frequency: '50Hz / 60Hz',
    ipRating: 'IP20',
    cableSize: '1.5mm² – 2.5mm²',
    poles: 'Live, Neutral, Earth',
    standards: 'BS 7671 / IEC International Electrical Standards',
    overview:
      'A standard electrical component used for power distribution, switching, or load consumption.',
    circuitBehavior:
      'Operates in accordance with Ohm’s Law (V = I × R) and Kirchhoff’s Circuit Laws.',
    keySpecs: ['Standard 230V AC / 12V DC operating range'],
    quickTips: [
      'Ensure complete circuit loop from Source Live to Source Neutral.',
      'Check all terminal screw connections before starting simulation.',
    ],
  };
}

