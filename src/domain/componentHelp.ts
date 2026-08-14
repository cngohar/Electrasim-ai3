export interface ComponentHelpData {
  title: string;
  overview: string;
  circuitBehavior: string;
  standards: string;
  keySpecs: string[];
  quickTips: string[];
}

export const COMPONENT_HELP_REGISTRY: Record<string, ComponentHelpData> = {
  // ─── PROTECTION DEVICES ───
  mcb: {
    title: 'Miniature Circuit Breaker (MCB) - Type B',
    overview:
      'Type B MCBs protect electrical final circuits against overloads and low-level short circuits. They feature a thermal bimetallic strip for slow overloads and an electromagnetic coil for instantaneous short-circuit tripping.',
    circuitBehavior:
      'In a real circuit, Type B trips instantaneously when fault current reaches 3 to 5 times its rated value (e.g., 48A–80A for a B16). It is the standard protection device for domestic lighting and general socket ring circuits.',
    standards:
      'BS EN 60898-1 / IEC 60898. Must be sized so the breaker rating (In) does not exceed the current carrying capacity (It) of the downstream cable.',
    keySpecs: [
      'Trip Factor: 3–5× In (Instantaneous)',
      'Standard Ratings: 6A, 10A, 16A, 20A, 32A',
      'Breaking Capacity: 6kA / 10kA',
    ],
    quickTips: [
      'Ideal for resistive domestic loads, lighting, and general socket outlets.',
      'Always ensure downstream cable rating exceeds breaker rating (e.g. 2.5mm² for 20A/32A ring).',
      'If frequent tripping occurs during switch-on, verify inrush current or switch to Type C.',
    ],
  },
  'mcb-type-c': {
    title: 'Miniature Circuit Breaker (MCB) - Type C',
    overview:
      'Type C MCBs are designed for commercial and industrial circuits with higher inductive inrush currents, such as fluorescent lighting banks, transformers, and small electric motors.',
    circuitBehavior:
      'Trips instantaneously at 5 to 10 times its rated current. This prevents nuisance tripping during initial magnetic magnetization or motor startup current spikes.',
    standards:
      'BS EN 60898-1. Requires lower earth fault loop impedance (Zs) to ensure automatic disconnection of supply within 0.4s.',
    keySpecs: [
      'Trip Factor: 5–10× In (Instantaneous)',
      'Typical Uses: Small motors, air conditioning, LED driver banks',
      'Max Disconnection Time: 0.4s (TN system)',
    ],
    quickTips: [
      'Use Type C for circuits supplying motors, AC units, or large banks of LED drivers.',
      'Check loop impedance (Zs) to confirm automatic disconnection within required safety limits.',
    ],
  },
  'mcb-type-d': {
    title: 'Miniature Circuit Breaker (MCB) - Type D',
    overview:
      'Type D MCBs are heavy-duty protective breakers built for high inrush applications like industrial motors, arc welders, X-ray machines, and large transformers.',
    circuitBehavior:
      'Trips instantaneously only at 10 to 20 times rated current, tolerating extreme transient starting surges without disconnecting.',
    standards:
      'BS EN 60898-1 / IEC 60947-2. Used primarily in commercial/industrial distribution boards.',
    keySpecs: [
      'Trip Factor: 10–20× In',
      'Application: Transformers, industrial welders, heavy machinery',
    ],
    quickTips: [
      'Only specified when equipment has very high start-up surges.',
      'Ensure supply transformer and cable impedance allow sufficient fault current to trigger magnetic trip.',
    ],
  },
  rcd: {
    title: 'Residual Current Device (RCD)',
    overview:
      'RCDs constantly monitor the balance of current between Live and Neutral conductors. If current leaks to earth (e.g., through an insulation fault or human body contact), the magnetic core imbalance trips the mechanism.',
    circuitBehavior:
      'Disconnects both Live and Neutral simultaneously within 30 milliseconds when an earth leakage current exceeding 30mA is detected, preventing lethal electrical shocks.',
    standards:
      'BS EN 61008-1. Essential for additional shock protection on all domestic socket outlets and outdoor equipment under BS 7671 regulations.',
    keySpecs: [
      'Sensitivity: 30mA (Additional Protection)',
      'Trip Time: < 40ms at 5× IΔn',
      'Poles: Double Pole (Live + Neutral protection)',
    ],
    quickTips: [
      'Connect both Live AND Neutral incoming and outgoing paths through the RCD.',
      'Press the yellow TEST button monthly in real installations to exercise the mechanical trip mechanism.',
    ],
  },
  rcbo: {
    title: 'Residual Current Breaker with Overcurrent (RCBO)',
    overview:
      'An RCBO combines the functions of an MCB (overload and short-circuit protection) and an RCD (earth leakage shock protection) into a single compact DIN-rail module.',
    circuitBehavior:
      'Provides dedicated protection to an individual final circuit. If a fault occurs, only the affected circuit trips, leaving the rest of the installation energized.',
    standards:
      'BS EN 61009-1. Preferred modern consumer unit design for maximum circuit continuity.',
    keySpecs: [
      'Overcurrent Trip: Type B or C curve',
      'Earth Leakage Sensitivity: 30mA Type A/AC',
      'Single Module Width',
    ],
    quickTips: [
      'Use RCBOs on individual socket or shower circuits to prevent single-fault whole-house blackouts.',
      'Verify Neutral fly-lead connects directly to the consumer unit Neutral bar.',
    ],
  },
  spd: {
    title: 'Surge Protection Device (SPD)',
    overview:
      'SPDs shield sensitive electronics from high-voltage transient spikes caused by atmospheric lightning strikes or grid switching transients by diverting surge energy to earth.',
    circuitBehavior:
      'Under normal voltage, SPD remains high impedance. When a surge occurs, Metal Oxide Varistors (MOVs) clamp the voltage near zero within nanoseconds, channeling surge current safely to Earth.',
    standards:
      'BS EN 61643-11 / BS 7671 Section 443. Mandatory in consumer units unless a risk assessment justifies exclusion.',
    keySpecs: [
      'Type 2 / Type 3 Protection',
      'Max Discharge Current (Imax): 20kA–40kA',
      'Response Time: < 25ns',
    ],
    quickTips: [
      'Connect SPD directly parallel to main incoming Live, Neutral, and Earth supply rails.',
      'Keep connecting leads as short as possible (< 0.5m total) to minimize inductive voltage drop during lightning transients.',
    ],
  },

  // ─── SWITCHES & CONTROLS ───
  'single-way-switch': {
    title: 'Single-Way Wall Switch (SPST)',
    overview:
      'A basic single-pole single-throw switch that opens or breaks the Live conductor supplying a load.',
    circuitBehavior:
      'When toggled ON, completes the Live path from L-in to L-out. When OFF, isolates the Live rail to turn off the connected lamp or appliance.',
    standards: 'BS EN 60669-1. Rated typically at 10AX for inductive lighting loads.',
    keySpecs: ['Rating: 10AX (Lighting) / 20A (DP)', 'Poles: 1 Pole (Live switching)'],
    quickTips: [
      'Always switch the LIVE wire, never switch the Neutral line directly.',
      'Ensure protective earth (PE) is connected to the metal switch faceplate grid for safety.',
    ],
  },
  'two-way-switch': {
    title: 'Two-Way Switch (SPDT Changeover)',
    overview:
      'A single-pole double-throw switch featuring one Common (COM) terminal and two strapper terminals (L1 and L2). Used in pairs for controlling a light from two locations.',
    circuitBehavior:
      'Toggling either switch changes the internal connection between COM and L1 or L2, making or breaking the strapper wire circuit between the two locations.',
    standards: 'BS EN 60669-1. Commonly wired using 3-core & earth cable between switch positions.',
    keySpecs: ['Terminals: COM, L1, L2', 'Rating: 10AX 230V'],
    quickTips: [
      'Wire COM on Switch 1 to Live supply, and COM on Switch 2 to the lamp Live terminal.',
      'Connect L1-to-L1 and L2-to-L2 using strapper wires between both switch boxes.',
    ],
  },
  'intermediate-switch': {
    title: 'Intermediate Switch (DPDT Crossover)',
    overview:
      'An intermediate switch crosses over two strapper wires. It is inserted between two 2-way switches to allow controlling a single light from 3 or more locations (e.g. landing, hallway, multi-story stairs).',
    circuitBehavior:
      'In position A, connects L1-in to L1-out and L2-in to L2-out. In position B, crosses them over (L1-in to L2-out and L2-in to L1-out).',
    standards: 'BS EN 60669-1.',
    keySpecs: ['Terminals: L1-in, L2-in, L1-out, L2-out', 'Rating: 10AX'],
    quickTips: [
      'Place intermediate switches between two 2-way switches in multi-switch lighting circuits.',
      'Use 4-terminal wiring (two strappers in, two strappers out).',
    ],
  },
  'dimmer-switch': {
    title: 'Rotary Phase-Cut Dimmer Switch',
    overview:
      'Adjusts lighting brightness by cutting trailing-edge or leading-edge AC voltage waveforms, regulating RMS power delivered to dimmable bulbs.',
    circuitBehavior:
      'Varying the rotary knob changes the phase-angle trigger point. Higher dimming clips more of the sine wave, reducing lamp power consumption and light output.',
    standards: 'BS EN 60669-2-1.',
    keySpecs: ['Power Range: 5W–250W LED', 'Trailing Edge / Leading Edge selectable'],
    quickTips: [
      'Verify connected bulb is explicitly rated as DIMMABLE.',
      'Do not connect non-dimmable fluorescent tubes or transformers to a phase-cut dimmer.',
    ],
  },

  // ─── LIGHTING LOADS ───
  'bulb-incandescent': {
    title: 'Incandescent Filament Lamp',
    overview:
      'Produces light by heating a tungsten filament inside a vacuum glass bulb to glowing temperatures (~2500°C).',
    circuitBehavior:
      'Acts as a pure resistive load with Unity Power Factor (1.00). Exhibits cold-filament inrush current (up to 10× operating current) for milliseconds at switch-on.',
    standards: 'Phase-out under energy efficiency regulations (replaced by LED).',
    keySpecs: ['Power: 60W / 100W', 'Power Factor: 1.00 (Pure Resistive)', 'Efficacy: ~12 lm/W'],
    quickTips: [
      'Resistive load converts ~95% of energy into heat and 5% into visible light.',
      'Fully compatible with simple leading-edge leading or trailing edge dimmers.',
    ],
  },
  'bulb-cfl': {
    title: 'Compact Fluorescent Lamp (CFL)',
    overview:
      'Uses electric current through mercury vapor to emit UV light, which excites a phosphor coating inside the coiled glass tube to emit visible light.',
    circuitBehavior:
      'Requires an electronic ballast. Draws non-linear current spikes with lower power factor (~0.60–0.85) and harmonic distortion.',
    standards: 'BS EN 60968.',
    keySpecs: ['Power: 11W–20W', 'Power Factor: ~0.65', 'Warm-up time: 30s–2 mins'],
    quickTips: [
      'Do not use with standard dimmers unless specifically labeled dimmable.',
      'Contains trace mercury — dispose at specialized hazardous recycling points.',
    ],
  },
  'bulb-smart-rgb': {
    title: 'Smart Wireless RGB LED Lamp',
    overview:
      'Solid-state LED bulb containing micro-controller, WiFi/Zigbee radio, and red/green/blue/white surface mount LED chips.',
    circuitBehavior:
      'Draws tiny standby power (~0.5W) when switched OFF via app. Under full illumination, draws high-efficiency PWM-driven DC current from internal driver.',
    standards: 'BS EN 62560.',
    keySpecs: [
      'Power: 9W (60W equivalent)',
      'Colors: 16 Million RGB + CCT White',
      'Standby Power: < 0.5W',
    ],
    quickTips: [
      'Requires continuous Live supply — do not turn off wall switch if controlling via smart home app.',
      'Keep within WiFi router coverage range.',
    ],
  },
  'led-downlight': {
    title: 'Recessed LED Ceiling Downlight',
    overview:
      'Energy-efficient semiconductor fixture featuring an array of LEDs and an internal or external constant-current driver.',
    circuitBehavior:
      'Low power consumption (5W–10W) with instant illumination. High efficacy (~90+ lm/W).',
    standards: 'BS EN 60598-2-2. Fire-rated models maintain ceiling fire barrier integrity.',
    keySpecs: ['Power: 6W–10W', 'Beam Angle: 36°–60°', 'IP Rating: IP65 for bathrooms'],
    quickTips: [
      'Install fire-rated downlights in ceilings under inhabited floors.',
      'Use IP65 rated units above showers and bath Zone 1 areas.',
    ],
  },

  // ─── SOCKET OUTLETS ───
  'socket-3pin': {
    title: 'UK 13A Single Switched Socket Outlet',
    overview:
      'Standard UK BS 1363 socket outlet featuring shuttered pin entries and a built-in single-pole switch.',
    circuitBehavior:
      'Provides 230V AC up to 13A continuous load. Ground PE pin opens safety shutters on Live and Neutral lines upon plug insertion.',
    standards: 'BS 1363-2. Requires 30mA RCD protection under BS 7671.',
    keySpecs: ['Max Rating: 13A (3000W at 230V)', 'Shutters: Safety interlocked on Earth pin'],
    quickTips: [
      'Connect Live (Brown), Neutral (Blue), and Earth (Green/Yellow) securely.',
      'Sleeve bare Earth copper conductors with green/yellow sleeving.',
    ],
  },
  'double-socket': {
    title: 'Twin 13A Switched Socket Outlet',
    overview: 'Double socket plate providing two independently switched BS 1363 outlets.',
    circuitBehavior:
      'Combined total load on twin socket should not exceed 20A continuous across both outlets simultaneously to prevent terminal overheating.',
    standards: 'BS 1363-2.',
    keySpecs: ['Rating: 13A per socket (20A combined max)', 'Box depth: 25mm–35mm'],
    quickTips: [
      'Standard outlet in ring final circuits wired with 2.5mm² T&E cable and 32A MCB.',
      'Check terminal screws are torqued tightly to avoid high resistance hot-spots.',
    ],
  },

  // ─── HEAVY LOADS & MOTORS ───
  'water-heater': {
    title: 'Immersion / Storage Water Heater',
    overview:
      'Heavy-duty electric heating load consisting of a mineral-insulated metal heating element immersed directly in a water storage tank.',
    circuitBehavior:
      'Draws high continuous current (~3000W / 13A) with pure resistive power factor (1.00) controlled by an integrated adjustable rod thermostat.',
    standards: 'BS EN 60335-2-21. Requires dedicated radial circuit with double-pole switch.',
    keySpecs: ['Power: 3000W (3kW)', 'Current: 13.0A at 230V', 'Isolation: Double Pole 20A switch'],
    quickTips: [
      'Wire on a dedicated radial circuit from consumer unit using 2.5mm² cable and 16A/20A MCB.',
      'Always install an unswitched double-pole isolator switch near the heater.',
    ],
  },
  motor: {
    title: 'Single-Phase AC Induction Motor',
    overview:
      'Electromechanical motor using electromagnetic induction from AC current to rotate an armature rotor.',
    circuitBehavior:
      'Exhibits inductive lagging power factor (~0.80) and high starting inrush current (up to 5–7× running current) until rotor reaches operational speed.',
    standards: 'BS EN 60034-1.',
    keySpecs: [
      'Inrush Current: 5–7× Full Load Current',
      'Power Factor: 0.75–0.85 (Lagging)',
      'Thermal Overload Protection',
    ],
    quickTips: [
      'Use Type C MCB protection to tolerate starting inrush surges without nuisance tripping.',
      'Ensure thermal overload protection relay is installed for heavy mechanical duty.',
    ],
  },
  'ev-charger': {
    title: 'Electric Vehicle Wallbox Charger (7.4 kW)',
    overview:
      'Dedicated AC charging station that negotiates power protocol with the EV onboard battery charger.',
    circuitBehavior:
      'Draws continuous high current (32A at 230V = 7.36 kW) for hours. Requires dedicated PEN fault loss protection and Type A/B RCD protection.',
    standards: 'BS 7671 Section 722 / IET Code of Practice for EV Charging.',
    keySpecs: [
      'Rating: 32A Single-Phase (7.4kW)',
      'Cable: 6mm² or 10mm² radial',
      'RCD: Type A 30mA + 6mA DC leakage protection',
    ],
    quickTips: [
      'Always supply with dedicated 6mm² or 10mm² radial circuit protected by 40A RCBO/MCB.',
      'Verify earthing arrangement (PME / TT earth rod) meets EV safety regulations.',
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
      overview:
        'Protects conductors and equipment against electrical overloads, short circuits, or earth faults.',
      circuitBehavior:
        'Automatically interrupts current flow when safety parameters or thermal thresholds are exceeded.',
      standards: 'BS EN 60898 / BS EN 61008 / BS 7671 Regulations.',
      keySpecs: ['Sized according to cable carrying capacity', 'Automatic disconnection of supply'],
      quickTips: [
        'Always ensure protective device rating (In) matches cable capacity (It).',
        'Check insulation resistance before energizing new circuits.',
      ],
    };
  }

  if (category === 'lighting') {
    return {
      title: 'Lighting Load Component',
      overview:
        'Converts electrical energy into lumen illumination for interior or outdoor lighting.',
      circuitBehavior:
        'Draws active power from Live and Neutral supply rails. May exhibit inrush or dimming characteristics.',
      standards: 'BS EN 60598.',
      keySpecs: ['Efficiency: LED high efficacy', 'Power Factor: 0.50–0.98 depending on driver'],
      quickTips: [
        'Connect Live from switch output and Neutral from supply Neutral bar.',
        'Always bond earth to metallic fitting enclosures.',
      ],
    };
  }

  if (category === 'socket') {
    return {
      title: 'Power Socket Outlet',
      overview: 'Provides an accessible connection point for portable appliances and tools.',
      circuitBehavior:
        'Delivers 230V AC up to rated amperage. Requires continuous Live, Neutral, and Earth connections.',
      standards: 'BS 1363 / IEC 60309.',
      keySpecs: ['Max Current: 13A / 16A / 32A', 'RCD Protection Mandatory'],
      quickTips: [
        'Connect all three rails: Live (Brown), Neutral (Blue), Earth (Green/Yellow).',
        'Verify ring circuit continuity or radial cable sizing.',
      ],
    };
  }

  if (category === 'switch') {
    return {
      title: 'Switching Control Device',
      overview: 'Manually or automatically opens and closes electrical paths in live circuits.',
      circuitBehavior:
        'Toggles continuity along the Live line to energize or isolate connected loads.',
      standards: 'BS EN 60669.',
      keySpecs: ['Switch Live path only', 'Rated for specific voltage & amperage'],
      quickTips: [
        'Never wire Live and Neutral directly across switch terminals (causes short circuit).',
        'Switch the Live conductor to safely isolate equipment.',
      ],
    };
  }

  return {
    title: 'Electrical Circuit Component',
    overview:
      'A standard electrical component used for power distribution, switching, or load consumption.',
    circuitBehavior:
      'Operates in accordance with Ohm’s Law (V = I × R) and Kirchhoff’s Circuit Laws.',
    standards: 'BS 7671 / IEC International Electrical Standards.',
    keySpecs: ['Standard 230V AC / 12V DC operating range'],
    quickTips: [
      'Ensure complete circuit loop from Source Live to Source Neutral.',
      'Check all terminal screw connections before starting simulation.',
    ],
  };
}
