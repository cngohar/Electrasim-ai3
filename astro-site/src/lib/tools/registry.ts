export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolEquation {
  title: string;
  formula: string;
  description: string;
}

export interface ToolStep {
  step: string;
  instruction: string;
}

export interface ToolEntry {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  route: string;
  category: 'calculator' | 'reference' | 'converter';
  status: 'available' | 'coming-soon';
  description: string;
  badge?: string;
  icon: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
  equations?: ToolEquation[];
  faqs?: ToolFaq[];
  steps?: ToolStep[];
  relatedGuides?: Array<{ title: string; url: string; description: string }>;
}

export const TOOLBOX_REGISTRY: ToolEntry[] = [
  {
    id: 'voltage-drop',
    name: 'Voltage Drop Calculator',
    shortName: 'Voltage Drop',
    slug: 'voltage-drop-calculator',
    route: '/tools/voltage-drop-calculator/',
    category: 'calculator',
    status: 'available',
    description:
      'Calculate voltage drop in single-phase, three-phase, and DC cables with interactive real-time visual simulation and BS 7671 limits.',
    badge: 'Popular',
    icon: 'voltage',
    metaTitle: 'Voltage Drop Calculator — Free Interactive Electrical Tool | ElectraSim',
    metaDescription:
      'Calculate voltage drop in single-phase, three-phase, and DC cable runs with interactive animated visual feedback. Compare against BS 7671 limits. Free in your browser.',
    keywords: [
      'voltage drop calculator',
      'electrical voltage drop',
      'cable voltage drop formula',
      'BS 7671 voltage drop limits',
      'single phase voltage drop',
      'three phase voltage drop calculator',
      'DC voltage drop calculation',
      'copper vs aluminum wire resistance',
      'cable size voltage loss',
      'electrical engineering calculator',
    ],
    ogImage: 'https://electrasim.com/og-image.png',
    equations: [
      {
        title: 'DC Circuits (Two-Wire Loop)',
        formula: 'V_drop = 2 × I × L × (ρ / A)',
        description:
          'Accounts for total round-trip conductor resistance across positive and return conductors, where ρ is resistivity and A is cross-sectional area.',
      },
      {
        title: 'Single-Phase AC Circuits (1-Φ)',
        formula: 'V_drop = 2 × I × L × (r cos φ + x sin φ)',
        description:
          'Combines cable active resistance (r) and reactive reactance (x) adjusted for the load displacement power factor (cos φ).',
      },
      {
        title: 'Three-Phase AC Circuits (3-Φ Balanced)',
        formula: 'V_drop = √3 × I × L × (r cos φ + x sin φ)',
        description:
          'The square root of 3 (≈ 1.732) represents line-to-line voltage across three balanced 120° phase-shifted conductors.',
      },
      {
        title: 'Conductor Temperature Correction',
        formula: 'ρ_T = ρ_20 × [1 + α × (T - 20)]',
        description:
          'Accounts for positive thermal coefficient of resistance (α = 0.00393 for copper), meaning hotter cables suffer greater voltage drop.',
      },
    ],
    steps: [
      {
        step: 'Select System Type & Nominal Voltage',
        instruction:
          'Choose between DC, Single-Phase AC (e.g. 230 V), or Three-Phase AC (e.g. 400 V line-to-line).',
      },
      {
        step: 'Enter Load Current and One-Way Run Length',
        instruction:
          'Input the maximum design current in Amperes (A) and the total physical length of the cable route in meters (m).',
      },
      {
        step: 'Specify Conductor Cross-Section & Material',
        instruction:
          'Select conductor cross-sectional area (e.g. 2.5 mm², 6 mm², 10 mm², 16 mm²) and material (Copper or Aluminum).',
      },
      {
        step: 'Review Results Against BS 7671 Permissible Limits',
        instruction:
          'Verify that voltage drop is within 3% for lighting circuits or 5% for general power/socket circuits under standard public LV supply.',
      },
    ],
    faqs: [
      {
        question: 'What is the maximum permitted voltage drop in the UK under BS 7671?',
        answer:
          'Under UK Wiring Regulations (BS 7671:2018+A3:2024 Appendix 4), the maximum permitted voltage drop from the origin of a standard low-voltage public supply installation is 3% for lighting circuits (6.9 V at 230 V) and 5% for other circuits such as socket outlets, cookers, and heating (11.5 V at 230 V). For private supplies (such as generators or solar PV installations), the limits are 6% for lighting and 8% for other circuits.',
      },
      {
        question: 'Why does voltage drop occur in electrical cables?',
        answer:
          'Every metallic conductor has an internal electrical resistance determined by its material resistivity, length, and cross-sectional area. When electric current flows through this resistance, energy is dissipated as heat (I²R loss), which causes the electrical potential (voltage) at the end of the cable to be lower than at the supply origin.',
      },
      {
        question: 'How do you calculate 3-phase voltage drop compared to single-phase?',
        answer:
          'In a single-phase circuit, current flows out on the live conductor and returns on the neutral, so the multiplier is 2 (round trip). In a balanced 3-phase circuit, the 120° phase angle displacement between conductors reduces the effective line-to-line impedance multiplier to √3 (approximately 1.732).',
      },
      {
        question: 'How do I reduce excessive voltage drop in a long cable run?',
        answer:
          'The most effective way to reduce voltage drop is to increase the conductor cross-sectional area (e.g., upsizing from 6 mm² to 10 mm² or 16 mm²), which directly reduces resistance. Other methods include optimizing cable routing to reduce length, balancing loads across three phases, or using copper conductors instead of aluminum.',
      },
      {
        question: 'Does temperature affect voltage drop in electrical cables?',
        answer:
          'Yes. Metals have a positive temperature coefficient of resistance. As conductor temperature rises due to ambient heat or load current, resistivity increases according to ρ_T = ρ_20[1 + α(T - 20)]. For example, a copper conductor operating at 70°C has approximately 19.6% higher resistance than at 20°C, increasing total voltage loss.',
      },
    ],
    relatedGuides: [
      {
        title: 'Voltage Drop Explained: How to Calculate It (with Examples & BS 7671 Rules)',
        url: '/blog/voltage-drop-explained-how-to-calculate-it/',
        description:
          'Comprehensive engineering guide to cable resistance, formulas, and UK wiring regulations.',
      },
      {
        title: 'Electrical Cable Sizes Explained (1.5mm² to 25mm²)',
        url: '/blog/electrical-cable-sizes-explained/',
        description:
          'Guide to standard metric cable cross-sections, current carrying capacities, and applications.',
      },
      {
        title: 'Single-Phase vs Three-Phase Power Comparison',
        url: '/blog/single-phase-vs-three-phase-power-explained/',
        description:
          'Detailed analysis of single-phase 230V vs three-phase 400V distribution systems.',
      },
      {
        title: "Ohm's Law Master Tutorial (V = I × R)",
        url: '/blog/ohms-law-explained-voltage-current-resistance/',
        description:
          'The fundamental relationship between voltage, current, and resistance in electrical circuits.',
      },
    ],
  },
  {
    id: 'cable-size',
    name: 'Cable Size Calculator',
    shortName: 'Cable Sizing',
    slug: 'cable-size-calculator',
    route: '/tools/cable-size-calculator/',
    category: 'calculator',
    status: 'coming-soon',
    description:
      'Find the minimum required conductor cross-sectional area (mm²) based on load current, run length, and permissible voltage drop.',
    icon: 'cable',
    metaTitle: 'Cable Size Calculator — Electrical Conductor Sizing | ElectraSim',
    metaDescription:
      'Find the correct cable size (mm²) for domestic and industrial circuits based on current carrying capacity and voltage drop limits.',
    keywords: [
      'cable size calculator',
      'wire gauge calculator',
      'electrical conductor sizing',
      'BS 7671 cable selection',
      'mm2 cable calculator',
    ],
  },
  {
    id: 'power-calculator',
    name: 'Power Calculator (kW / kVA / Amps)',
    shortName: 'Power & Current',
    slug: 'power-calculator',
    route: '/tools/power-calculator/',
    category: 'calculator',
    status: 'coming-soon',
    description:
      'Convert and calculate Real Power (kW), Apparent Power (kVA), Reactive Power (kVAR), and full-load current across AC and DC systems.',
    icon: 'power',
    metaTitle: 'Electrical Power Calculator — kW, kVA, Power Factor & Current | ElectraSim',
    metaDescription:
      'Interactive electrical power calculator for single-phase and three-phase AC and DC systems. Calculate kW, kVA, kVAR and load current.',
    keywords: [
      'electrical power calculator',
      'kw to amps calculator',
      'kva to kw calculator',
      'three phase power calculator',
      'power factor calculator',
    ],
  },
  {
    id: 'electrical-load',
    name: 'Electrical Load Calculator',
    shortName: 'Load Schedule',
    slug: 'electrical-load-calculator',
    route: '/tools/electrical-load-calculator/',
    category: 'calculator',
    status: 'coming-soon',
    description:
      'Estimate maximum demand, apply diversity factors, and calculate total circuit loading for domestic and commercial installations.',
    icon: 'load',
    metaTitle: 'Electrical Load & Diversity Calculator | ElectraSim',
    metaDescription:
      'Calculate electrical load schedules, maximum demand, and diversity allowances for house wiring and consumer units.',
    keywords: [
      'electrical load calculator',
      'diversity factor calculator',
      'maximum demand electrical',
      'consumer unit load schedule',
    ],
  },
  {
    id: 'energy-cost',
    name: 'Energy Cost Calculator',
    shortName: 'Energy Cost',
    slug: 'energy-cost-calculator',
    route: '/tools/energy-cost-calculator/',
    category: 'calculator',
    status: 'coming-soon',
    description:
      'Calculate appliance energy consumption, running costs per hour/day/year, and potential savings based on electricity unit rates.',
    icon: 'energy',
    metaTitle: 'Electricity Running Cost Calculator | ElectraSim',
    metaDescription:
      'Calculate electricity running costs and kWh consumption for home appliances and electrical equipment based on your unit tariff.',
    keywords: [
      'energy cost calculator',
      'appliance running cost',
      'electricity kwh cost calculator',
      'power consumption cost',
    ],
  },
];

export function getToolById(id: string): ToolEntry | undefined {
  return TOOLBOX_REGISTRY.find((t) => t.id === id);
}

export function getToolBySlug(slug: string): ToolEntry | undefined {
  return TOOLBOX_REGISTRY.find((t) => t.slug === slug);
}
