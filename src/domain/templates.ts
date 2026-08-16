import { COMPONENT_DEFS } from './components';
import type { Circuit, ComponentInstance, WireInstance } from './types';

export type GuidedCircuitDifficulty = 'Beginner' | 'Intermediate';

export type GuidedCircuitObjectiveKind =
  | 'component-types'
  | 'wire-count'
  | 'run-simulation'
  | 'fault-free';

export interface GuidedCircuitObjective {
  id: string;
  label: string;
  description: string;
  kind: GuidedCircuitObjectiveKind;
  componentTypes?: string[];
  minimum?: number;
}

export interface GuidedCircuitTemplate {
  id: string;
  title: string;
  difficulty: GuidedCircuitDifficulty;
  topic: string;
  summary: string;
  teaches: string;
  expected: string;
  objectives?: GuidedCircuitObjective[];
  steps: string[];
  faultPrompt?: string;
  circuit: Circuit;
}

const component = (
  templateId: string,
  localId: string,
  type: string,
  x: number,
  y: number,
  state: ComponentInstance['state'] = {},
): ComponentInstance => {
  if (!COMPONENT_DEFS[type]) {
    throw new Error(`guided template "${templateId}" references unknown component "${type}"`);
  }

  return {
    id: `${templateId}-${localId}`,
    type,
    x,
    y,
    state,
  };
};

const wire = (
  templateId: string,
  localId: string,
  from: ComponentInstance,
  fromPortIndex: number,
  to: ComponentInstance,
  toPortIndex: number,
): WireInstance => {
  const fromPort = COMPONENT_DEFS[from.type]?.ports[fromPortIndex];
  const toPort = COMPONENT_DEFS[to.type]?.ports[toPortIndex];

  if (!fromPort || !toPort) {
    throw new Error(`guided template "${templateId}" references an unknown component port`);
  }
  if (fromPort.type !== toPort.type) {
    throw new Error(
      `guided template "${templateId}" connects incompatible ${fromPort.type} and ${toPort.type} ports`,
    );
  }

  return {
    id: `${templateId}-w-${localId}`,
    fromComponentId: from.id,
    fromPortIndex,
    toComponentId: to.id,
    toPortIndex,
    controlPoints: [],
    pathKind: 'orthogonal',
  };
};

function simpleLampTemplate(): GuidedCircuitTemplate {
  const id = 'simple-lamp';
  const live = component(id, 'live', 'live-terminal', 120, 220);
  const neutral = component(id, 'neutral', 'neutral-terminal', 120, 390);
  const mcb = component(id, 'mcb', 'mcb', 310, 220, { on: true });
  const bulb = component(id, 'bulb', 'bulb', 540, 220);

  return {
    id,
    title: 'Simple Protected Lamp',
    difficulty: 'Beginner',
    topic: 'Live and neutral paths',
    summary: 'A minimal lamp circuit with a live source, MCB protection, and neutral return.',
    teaches: 'A load only energises when it has both a live feed and a neutral return.',
    expected: 'Run the simulation: the bulb energises. Toggle the MCB off to break the live feed.',
    steps: [
      'Follow the live conductor from Live to the MCB and then to the bulb.',
      'Follow the neutral conductor from Neutral back to the bulb.',
      'Run the simulation and toggle the MCB to compare closed versus open protection.',
    ],
    circuit: {
      components: [live, neutral, mcb, bulb],
      wires: [
        wire(id, 'live-mcb', live, 0, mcb, 0),
        wire(id, 'mcb-bulb', mcb, 1, bulb, 0),
        wire(id, 'neutral-bulb', neutral, 0, bulb, 1),
      ],
    },
  };
}

function oneWaySwitchTemplate(): GuidedCircuitTemplate {
  const id = 'one-way-light-switch';
  const live = component(id, 'live', 'live-terminal', 110, 210);
  const neutral = component(id, 'neutral', 'neutral-terminal', 110, 390);
  const mcb = component(id, 'mcb', 'mcb', 280, 210, { on: true });
  const sw = component(id, 'switch', 'single-way-switch', 480, 210, { on: false });
  const bulb = component(id, 'bulb', 'bulb', 700, 210);

  return {
    id,
    title: 'One-Way Light Switch',
    difficulty: 'Beginner',
    topic: 'Switching the live conductor',
    summary: 'A common light circuit where the switch opens and closes the live feed.',
    teaches:
      'The switch belongs on the live conductor, while neutral returns directly to the load.',
    expected: 'Run the simulation, then toggle the switch. The bulb follows the switch state.',
    steps: [
      'Trace Live through the MCB into the single-way switch.',
      'Trace switched live from the switch output to the bulb.',
      'Toggle the switch and watch the energised path appear and disappear.',
    ],
    circuit: {
      components: [live, neutral, mcb, sw, bulb],
      wires: [
        wire(id, 'live-mcb', live, 0, mcb, 0),
        wire(id, 'mcb-switch', mcb, 1, sw, 0),
        wire(id, 'switch-bulb', sw, 1, bulb, 0),
        wire(id, 'neutral-bulb', neutral, 0, bulb, 1),
      ],
    },
  };
}

function twoWaySwitchTemplate(): GuidedCircuitTemplate {
  const id = 'two-way-staircase-light';
  const live = component(id, 'live', 'live-terminal', 100, 210);
  const neutral = component(id, 'neutral', 'neutral-terminal', 100, 430);
  const mcb = component(id, 'mcb', 'mcb', 260, 210, { on: true });
  const swA = component(id, 'switch-a', 'two-way-switch', 450, 170, { on: true });
  const swB = component(id, 'switch-b', 'two-way-switch', 660, 170, { on: true });
  const bulb = component(id, 'bulb', 'bulb', 820, 210);

  return {
    id,
    title: 'Two-Way Staircase Light',
    difficulty: 'Intermediate',
    topic: 'Traveller conductors',
    summary: 'Two switches control one lamp from different places, like a staircase landing.',
    teaches: 'Two-way switching routes live through one of two traveller paths before the load.',
    expected:
      'Run the simulation, then double-click either switch (double-tap on touchscreens) to see the lamp and active traveller path change.',
    steps: [
      'Find COM on the first switch and follow the live feed into it.',
      'Compare L1 and L2 traveller wires between the two switches.',
      'Double-click or double-tap either switch. On desktop, you can also select it and use Switch to L1/L2 in the Inspector.',
    ],
    circuit: {
      components: [live, neutral, mcb, swA, swB, bulb],
      wires: [
        wire(id, 'live-mcb', live, 0, mcb, 0),
        wire(id, 'mcb-swa-com', mcb, 1, swA, 0),
        wire(id, 'traveller-l1', swA, 1, swB, 1),
        wire(id, 'traveller-l2', swA, 2, swB, 2),
        wire(id, 'swb-com-bulb', swB, 0, bulb, 0),
        wire(id, 'neutral-bulb', neutral, 0, bulb, 1),
      ],
    },
  };
}

function rcdFaultTemplate(): GuidedCircuitTemplate {
  const id = 'rcd-earth-fault-demo';
  const live = component(id, 'live', 'live-terminal', 100, 190);
  const neutral = component(id, 'neutral', 'neutral-terminal', 100, 360);
  const earth = component(id, 'earth', 'earth-terminal', 100, 530);
  const rcd = component(id, 'rcd', 'rcd', 310, 250, { on: true });
  const socket = component(id, 'socket', 'socket-3pin', 560, 250, { fault: 'earth-fault' });
  const lamp = component(id, 'lamp', 'bulb', 800, 250);

  return {
    id,
    title: 'RCD and Earth Fault Check',
    difficulty: 'Intermediate',
    topic: 'Protection and fault feedback',
    summary: 'A protected socket branch with a deliberate earth-fault warning and a test load.',
    teaches:
      'Protection devices and earth conductors are part of the safety story, not decoration.',
    expected:
      'Run the simulation: the lamp energises and the fault warning explains the socket risk.',
    faultPrompt: 'Clear the socket fault in Fault Mode, run again, and compare the warning list.',
    steps: [
      'Follow live and neutral through the RCD to the socket branch.',
      'Check that earth is wired to the socket earth port.',
      'Run the simulation, read the warning, then clear the socket fault to compare.',
    ],
    circuit: {
      components: [live, neutral, earth, rcd, socket, lamp],
      wires: [
        wire(id, 'live-rcd', live, 0, rcd, 0),
        wire(id, 'neutral-rcd', neutral, 0, rcd, 1),
        wire(id, 'rcd-socket-live', rcd, 2, socket, 0),
        wire(id, 'rcd-socket-neutral', rcd, 3, socket, 1),
        wire(id, 'earth-socket', earth, 0, socket, 2),
        wire(id, 'socket-lamp-live', socket, 0, lamp, 0),
        wire(id, 'socket-lamp-neutral', socket, 1, lamp, 1),
      ],
    },
  };
}

function contactorMotorTemplate(): GuidedCircuitTemplate {
  const id = 'contactor-motor';
  const live = component(id, 'live', 'live-terminal', 110, 230);
  const neutral = component(id, 'neutral', 'neutral-terminal', 110, 400);
  const mcb = component(id, 'mcb', 'mcb', 290, 230, { on: true });
  const contactor = component(id, 'contactor', 'contactor', 520, 250, { on: true });
  const motor = component(id, 'motor', 'motor', 780, 250);

  return {
    id,
    title: 'Contactor Motor Starter',
    difficulty: 'Intermediate',
    topic: 'Switching heavier loads',
    summary: 'A compact motor branch switched through a contactor after MCB protection.',
    teaches:
      'A contactor can switch live and neutral to a load while the protection device feeds it.',
    expected: 'Run the simulation: the motor energises while the MCB and contactor are closed.',
    steps: [
      'Trace the protected live feed from Live through the MCB.',
      'Follow both live and neutral through the contactor to the motor.',
      'Toggle the contactor or MCB to see either device interrupt the motor.',
    ],
    circuit: {
      components: [live, neutral, mcb, contactor, motor],
      wires: [
        wire(id, 'live-mcb', live, 0, mcb, 0),
        wire(id, 'mcb-contactor', mcb, 1, contactor, 0),
        wire(id, 'neutral-contactor', neutral, 0, contactor, 1),
        wire(id, 'contactor-motor-live', contactor, 2, motor, 0),
        wire(id, 'contactor-motor-neutral', contactor, 3, motor, 1),
      ],
    },
  };
}

function timerBellTemplate(): GuidedCircuitTemplate {
  const id = 'timer-bell';
  const live = component(id, 'live', 'live-terminal', 110, 230);
  const neutral = component(id, 'neutral', 'neutral-terminal', 110, 400);
  const mcb = component(id, 'mcb', 'mcb', 290, 230, { on: true });
  const timer = component(id, 'timer', 'timer-switch', 500, 230, { on: true });
  const bell = component(id, 'bell', 'bell', 720, 230);

  return {
    id,
    title: 'Timer-Controlled Bell',
    difficulty: 'Beginner',
    topic: 'Timed switching',
    summary: 'A simple timed control path feeding a bell or buzzer load.',
    teaches: 'Timer switches behave like controlled switches in the live path.',
    expected: 'Run the simulation: the bell energises while the timer switch is closed.',
    steps: [
      'Trace Live through the MCB and timer switch.',
      'Trace Neutral directly back to the bell.',
      'Toggle the timer switch to simulate the timed contact opening and closing.',
    ],
    circuit: {
      components: [live, neutral, mcb, timer, bell],
      wires: [
        wire(id, 'live-mcb', live, 0, mcb, 0),
        wire(id, 'mcb-timer', mcb, 1, timer, 0),
        wire(id, 'timer-bell', timer, 1, bell, 0),
        wire(id, 'neutral-bell', neutral, 0, bell, 1),
      ],
    },
  };
}

function pushButtonDoorbellTemplate(): GuidedCircuitTemplate {
  const id = 'push-button-doorbell';
  const live = component(id, 'live', 'live-terminal', 110, 220);
  const neutral = component(id, 'neutral', 'neutral-terminal', 110, 420);
  const mcb = component(id, 'mcb', 'mcb', 300, 220, { on: true });
  const button = component(id, 'button', 'push-button', 510, 220, { on: false });
  const bell = component(id, 'bell', 'bell', 740, 220);

  return {
    id,
    title: 'Push-Button Doorbell',
    difficulty: 'Beginner',
    topic: 'Momentary switching',
    summary:
      'A protected bell circuit whose load energises only while its normally-open push button is held.',
    teaches:
      'A momentary push button closes the live path only during a press; Neutral returns directly to the bell.',
    expected:
      "Run the simulation, then press and hold the button's centre control. The bell pulses only while the control is held and stops when you release it; audio is not modelled.",
    steps: [
      'Trace Live through the MCB to L-in on the push button.',
      "Follow L-out to the bell's Live terminal, then trace the bell's Neutral terminal directly back to Neutral.",
      "Run the simulation. Press and hold the button's centre control with a pointer, or hold Space or Enter while it is focused; release it and compare the bell state.",
    ],
    faultPrompt:
      'Fault check: inject an open circuit on either bell conductor, then hold the button again. The bell stays off because the complete path is broken.',
    circuit: {
      components: [live, neutral, mcb, button, bell],
      wires: [
        wire(id, 'live-mcb', live, 0, mcb, 0),
        wire(id, 'mcb-button', mcb, 1, button, 0),
        wire(id, 'button-bell', button, 1, bell, 0),
        wire(id, 'neutral-bell', neutral, 0, bell, 1),
      ],
    },
  };
}

function rcboProtectedSocketTemplate(): GuidedCircuitTemplate {
  const id = 'rcbo-protected-socket';
  const live = component(id, 'live', 'live-terminal', 100, 180);
  const neutral = component(id, 'neutral', 'neutral-terminal', 100, 360);
  const earth = component(id, 'earth', 'earth-terminal', 100, 540);
  const rcbo = component(id, 'rcbo', 'rcbo', 330, 260, { on: true });
  const socket = component(id, 'socket', 'socket-3pin', 600, 260);
  const testLamp = component(id, 'test-lamp', 'bulb', 850, 260);

  return {
    id,
    title: 'RCBO-Protected Socket',
    difficulty: 'Intermediate',
    topic: 'Combined circuit protection',
    summary:
      'A socket outlet supplied through an RCBO, with protective earth and a lamp representing a plugged-in appliance.',
    teaches:
      'An RCBO combines overcurrent and residual-current protection for one circuit. Earth-leakage and bolted-short faults trip it (educational thresholds), and its residual type (AC/A/F/B) decides whether smooth DC leakage trips it too.',
    expected:
      'Run the simulation: the test lamp energises while the RCBO is closed. Open the RCBO and both outgoing Live and Neutral paths are interrupted; Earth remains connected.',
    steps: [
      'Trace Live and Neutral into the RCBO at L-in and N-in.',
      "Follow L-out and N-out to the socket, and confirm Earth connects directly to the socket's E terminal rather than passing through the RCBO.",
      "Follow the socket's Live and Neutral connections to the test lamp. Run the simulation, then double-click the RCBO or toggle it in the Inspector to compare closed and open states.",
    ],
    faultPrompt:
      'Fault check: inject an open circuit on either outgoing RCBO conductor. The test lamp stays off because one required rail no longer reaches the load.',
    circuit: {
      components: [live, neutral, earth, rcbo, socket, testLamp],
      wires: [
        wire(id, 'live-rcbo', live, 0, rcbo, 0),
        wire(id, 'neutral-rcbo', neutral, 0, rcbo, 1),
        wire(id, 'rcbo-socket-live', rcbo, 2, socket, 0),
        wire(id, 'rcbo-socket-neutral', rcbo, 3, socket, 1),
        wire(id, 'earth-socket', earth, 0, socket, 2),
        wire(id, 'socket-lamp-live', socket, 0, testLamp, 0),
        wire(id, 'socket-lamp-neutral', socket, 1, testLamp, 1),
      ],
    },
  };
}

export const GUIDED_CIRCUIT_TEMPLATES: GuidedCircuitTemplate[] = [
  simpleLampTemplate(),
  oneWaySwitchTemplate(),
  twoWaySwitchTemplate(),
  rcdFaultTemplate(),
  contactorMotorTemplate(),
  timerBellTemplate(),
  pushButtonDoorbellTemplate(),
  rcboProtectedSocketTemplate(),
];

export function getGuidedCircuitTemplate(id: string): GuidedCircuitTemplate | undefined {
  return GUIDED_CIRCUIT_TEMPLATES.find((template) => template.id === id);
}

export function cloneTemplateCircuit(template: GuidedCircuitTemplate): Circuit {
  return {
    components: template.circuit.components.map((component) => ({
      ...component,
      state: { ...component.state },
    })),
    wires: template.circuit.wires.map((wire) => ({
      ...wire,
      controlPoints: wire.controlPoints.map((point) => ({ ...point })),
    })),
    ...(template.circuit.globalVoltage !== undefined
      ? { globalVoltage: template.circuit.globalVoltage }
      : {}),
  };
}
