export const comparisonReviewedIso = '2026-07-20';
export const comparisonReviewedLabel = '20 July 2026';

export interface ComparisonSource {
  label: string;
  url: string;
}

export interface ComparisonTool {
  id: string;
  name: string;
  officialUrl: string;
  bestFor: string;
  access: string;
  priceAndAccount: string;
  practicalWiring: string;
  sharing: string;
  strength: string;
  boundary: string;
  sources: ComparisonSource[];
}

export interface TaskFit {
  task: string;
  tool: string;
  reason: string;
}

export interface ComparisonFaq {
  question: string;
  answer: string;
}

export const comparisonTools: ComparisonTool[] = [
  {
    id: 'electrasim',
    name: 'ElectraSim',
    officialUrl: 'https://electrasim.com/app/',
    bestFor: 'Practical household and electrical-installation wiring',
    access: 'Browser and installable PWA; works offline after the first visit',
    priceAndAccount: 'Free; no account or sign-up',
    practicalWiring: 'Core focus: protection, switching, sockets, conductors and connected loads',
    sharing: 'Local autosave, JSON import/export, SVG, PNG and shareable URLs',
    strength:
      'ElectraSim starts with the components and wiring logic learners meet in practical electrical work. Energised conductors animate, loads respond, and open circuits, short circuits, reverse polarity and missing-earth scenarios can be explored without live equipment.',
    boundary:
      'It is an educational wiring simulator, not a SPICE replacement, a calibrated test instrument or a substitute for competent electrical design and verification.',
    sources: [
      { label: 'ElectraSim product overview', url: 'https://electrasim.com/' },
      { label: 'ElectraSim privacy policy', url: 'https://electrasim.com/privacy/' },
    ],
  },
  {
    id: 'circuitlab',
    name: 'CircuitLab',
    officialUrl: 'https://www.circuitlab.com/',
    bestFor: 'Engineering schematics and analog/digital circuit analysis',
    access: 'Browser-based; selected workflows have partial offline support',
    priceAndAccount:
      'Try without an account; the documented student Micro plan is USD 24/year with a 10-item schematic limit',
    practicalWiring: 'General electronics rather than household-installation training',
    sharing: 'URL sharing and PDF, PNG, EPS or SVG export on documented membership plans',
    strength:
      'CircuitLab goes further into engineering analysis, with DC, time-domain and frequency-domain simulation, mixed analog/digital models and configurable plots.',
    boundary:
      'Its public documentation describes electronic system design and analysis. Practical household protection and installation wiring are not its stated teaching focus.',
    sources: [
      { label: 'CircuitLab documentation', url: 'https://www.circuitlab.com/docs/' },
      { label: 'CircuitLab FAQ', url: 'https://www.circuitlab.com/docs/faq/' },
      {
        label: 'CircuitLab student memberships',
        url: 'https://www.circuitlab.com/accounts/upgrade/academic/',
      },
    ],
  },
  {
    id: 'dcaclab',
    name: 'DCACLab',
    officialUrl: 'https://dcaclab.com/',
    bestFor: 'Managed virtual electronics labs and classroom assignments',
    access: 'Browser-based virtual lab',
    priceAndAccount: 'Account-based free trial, followed by paid plans',
    practicalWiring: 'Virtual electronics lab rather than a UK household-installation focus',
    sharing: 'Private or public circuit saves and public simulation URLs',
    strength:
      'DCACLab combines circuit building with meters, visible current, fuse behaviour, slides, assignments and tools for tracking student progress.',
    boundary:
      'Its classroom and lab workflow adds useful institutional structure, but ongoing full access is subscription-based and its focus is broader electronics education.',
    sources: [
      { label: 'DCACLab features', url: 'https://dcaclab.com/en/features' },
      { label: 'About DCACLab', url: 'https://dcaclab.com/about-dcaclab' },
      { label: 'DCACLab trial and account', url: 'https://dcaclab.com/en/users/sign_up' },
      { label: 'DCACLab pricing', url: 'https://dcaclab.com/en/pricing-table' },
    ],
  },
  {
    id: 'everycircuit',
    name: 'EveryCircuit',
    officialUrl: 'https://everycircuit.com/',
    bestFor: 'Animated electronics simulation across web and mobile',
    access: 'Modern browsers, Android and iOS',
    priceAndAccount: 'Free own circuits up to 5 components; USD 15 one-time cross-platform unlock',
    practicalWiring: 'Analog and digital electronics rather than installation wiring',
    sharing: 'Public, private or unlisted circuits with a community gallery',
    strength:
      'EveryCircuit places animated voltage, current and charge information on the schematic and supports interactive controls and oscilloscope views.',
    boundary:
      'It is a strong visual electronics tool. Household protection devices and installation conventions are not the focus described on its product page.',
    sources: [
      { label: 'EveryCircuit product and pricing', url: 'https://everycircuit.com/' },
      { label: 'EveryCircuit sharing guidance', url: 'https://everycircuit.com/conduct' },
      {
        label: 'EveryCircuit licence activation',
        url: 'https://everycircuit.com/licensekeyactivation',
      },
    ],
  },
  {
    id: 'falstad',
    name: 'Falstad / CircuitJS1',
    officialUrl: 'https://www.falstad.com/circuit/',
    bestFor: 'Open circuit-theory exploration and a broad sample library',
    access: 'Browser plus official standalone builds',
    priceAndAccount: 'Free and open source; hosted simulator opens directly',
    practicalWiring: 'Circuit theory and electronics rather than installation conventions',
    sharing: 'Circuit-description files and shareable circuit links',
    strength:
      'Falstad makes circuit behaviour visible through animated current, voltage colours, interactive switches, scopes and a large set of editable examples.',
    boundary:
      'It is broad and flexible, but its interface and examples teach general circuit behaviour rather than a guided household-wiring workflow.',
    sources: [
      { label: 'Falstad circuit simulator', url: 'https://www.falstad.com/circuit/' },
      {
        label: 'Falstad simulator overview',
        url: 'https://www.falstad.com/circuit/doc/overview.html',
      },
      { label: 'CircuitJS1 source repository', url: 'https://github.com/pfalstad/circuitjs1' },
    ],
  },
  {
    id: 'tinkercad',
    name: 'Tinkercad Circuits',
    officialUrl: 'https://www.tinkercad.com/circuits',
    bestFor: 'Breadboards, Arduino, micro:bit and beginner coding projects',
    access: 'Browser-based web app',
    priceAndAccount: 'Free; personal, education or class-code access manages saved work',
    practicalWiring: 'Breadboard electronics and microcontrollers rather than household wiring',
    sharing: 'Classroom workflows plus documented public and embedded designs',
    strength:
      'Tinkercad Circuits pairs realistic breadboard-style parts with Arduino and micro:bit simulation, coding tools, starters and classroom learning resources.',
    boundary:
      'It is a natural fit for electronics prototyping and code. Consumer units, installation protection and live-neutral-earth wiring are not its primary scope.',
    sources: [
      { label: 'Tinkercad Circuits', url: 'https://www.tinkercad.com/circuits' },
      { label: 'Tinkercad account options', url: 'https://www.tinkercad.com/login' },
      {
        label: 'Official Tinkercad Classrooms guide (PDF)',
        url: 'https://images.tinkercad.com/jl5ii4oqrdmc/5v197WuuaqspGT81cG5tT6/81154785a527f1b42a32325487a30e44/tinkercad-guides_classrooms-Printable.pdf',
      },
    ],
  },
];

export const taskFits: TaskFit[] = [
  {
    task: 'Learn household wiring logic',
    tool: 'ElectraSim',
    reason: 'Its component set and guided circuits are built around practical electrical wiring.',
  },
  {
    task: 'Analyse an electronic design',
    tool: 'CircuitLab',
    reason: 'Its documented simulation and plotting tools support deeper engineering analysis.',
  },
  {
    task: 'Prototype Arduino or micro:bit',
    tool: 'Tinkercad Circuits',
    reason: 'It combines simulated hardware, breadboards and code in one beginner-friendly space.',
  },
  {
    task: 'Explore animated electronics on mobile',
    tool: 'EveryCircuit',
    reason: 'Its real-time schematic animation is available on the web, Android and iOS.',
  },
  {
    task: 'Explore circuit theory freely',
    tool: 'Falstad / CircuitJS1',
    reason: 'It opens directly, includes many examples and is available as open-source software.',
  },
  {
    task: 'Manage classes and assignments',
    tool: 'DCACLab',
    reason:
      'Its published feature set includes assignments, student progress and virtual lab tools.',
  },
];

export const closeWiringAlternatives: ComparisonTool[] = [
  {
    id: 'electrical-wiring-simulator',
    name: 'Electrical Wiring Simulator',
    officialUrl: 'https://apps.apple.com/us/app/electrical-wiring-simulator/id1638500625',
    bestFor: 'Guided vocational wiring practice on phones and tablets',
    access: 'iPhone, iPad, Mac, Android phone, tablet and Chromebook',
    priceAndAccount: 'Free download with in-app Pro options',
    practicalWiring: 'House wiring, control circuits, motors, relays and industrial diagrams',
    sharing: 'Sharing and project export are not confirmed in the public store descriptions',
    strength:
      'This is the closest mobile-focused option in the research, with guided exercises spanning basic house wiring, switching, control circuits and troubleshooting.',
    boundary:
      'It is an installed app rather than a browser-first tool, and complete modules, ad-free use and some education features are listed as Pro benefits.',
    sources: [
      {
        label: 'Apple App Store listing',
        url: 'https://apps.apple.com/us/app/electrical-wiring-simulator/id1638500625',
      },
      {
        label: 'Google Play listing',
        url: 'https://play.google.com/store/apps/details?id=com.SageApprentice.ElectricalWiringSimulator',
      },
    ],
  },
  {
    id: 'uk-electrical-sim',
    name: 'UK Electrical SIM',
    officialUrl: 'https://www.electricalsim.com/',
    bestFor: 'Account-based domestic layout and testing practice',
    access: 'Browser-based simulator behind an account',
    priceAndAccount: 'Free limited tier; Full Access advertised at GBP 25/year',
    practicalWiring:
      'Domestic layouts and testing, with off-grid and fault-finding work in progress',
    sharing: 'Public documentation does not confirm project sharing or file export',
    strength:
      'UK Electrical SIM is directly aimed at practical domestic training, bringing layout, testing and reporting concepts into one workspace.',
    boundary:
      'Its homepage labels several areas as testing, under development or content in progress, and access requires registration.',
    sources: [
      { label: 'UK Electrical SIM overview', url: 'https://www.electricalsim.com/' },
      {
        label: 'UK Electrical SIM subscription',
        url: 'https://www.electricalsim.com/Subscription/subscription',
      },
      {
        label: 'UK Electrical SIM account page',
        url: 'https://www.electricalsim.com/admin/signup',
      },
    ],
  },
];

export const comparisonFaqs: ComparisonFaq[] = [
  {
    question: 'What makes ElectraSim different from general circuit simulators?',
    answer:
      'ElectraSim is centred on practical electrical wiring rather than transistor-level electronics. It uses familiar protection, switching, conductor and load concepts, then makes circuit state and common faults visible in the browser.',
  },
  {
    question: 'Is ElectraSim completely free?',
    answer:
      'Yes. ElectraSim has no subscription, premium tier, advertising or sign-up requirement. The simulator and its saving, sharing and export tools are available without an account.',
  },
  {
    question: 'Is ElectraSim an alternative to Tinkercad Circuits?',
    answer:
      'They overlap as beginner-friendly browser simulators but teach different work. ElectraSim is the more direct fit for household wiring and installation logic. Tinkercad Circuits is the stronger fit for breadboards, Arduino, micro:bit and coding projects.',
  },
  {
    question: 'Should I use ElectraSim or CircuitLab?',
    answer:
      'Choose ElectraSim to practise practical wiring logic, switching, protection and fault scenarios. Choose CircuitLab when you need engineering schematic capture, frequency-domain analysis, device models or detailed plots.',
  },
  {
    question: 'Which simulator is best for a managed classroom?',
    answer:
      'DCACLab and Tinkercad publish the most explicit managed-classroom workflows in this comparison. ElectraSim works well for instant demonstrations and shareable exercises when a teacher does not need student accounts, grading or progress tracking.',
  },
  {
    question: 'Can ElectraSim verify a real electrical installation?',
    answer:
      'No. ElectraSim is an educational simulator. It cannot replace competent design, inspection, testing, manufacturer instructions, local regulations or a calibrated electrical test instrument.',
  },
  {
    question: 'Does ElectraSim work offline?',
    answer:
      'Yes. After the first successful visit, the installable web app can run offline on a supported modern browser. Circuit designs and preferences remain on the device unless you choose to export or share them.',
  },
];
