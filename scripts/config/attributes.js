// scripts/config/attributes.js
export const ATTRIBUTES = {
  primary: {
    vgr: { name: "Vigor", desc: "Physical strength, endurance, and resilience" },
    grc: { name: "Grace", desc: "Agility, coordination, and precision" },
    ins: { name: "Insight", desc: "Mental acuity, including memory, reasoning, and perception" },
    prs: { name: "Presence", desc: "Charm, leadership, and appeal" }
  },
  array: [65, 50, 50, 45]
};

export const ATTRIBUTE_MAPPING = {
  'vigor': 'vgr',
  'grace': 'grc',
  'insight': 'ins',
  'presence': 'prs',
  'vgr': 'vigor',
  'grc': 'grace',
  'ins': 'insight',
  'prs': 'presence',
  // Add lowercase versions too
  'vigor': 'vgr',
  'grace': 'grc',
  'insight': 'ins',
  'presence': 'prs'
};

// Helper functions related to attributes
export function calculateSecondaryAttributes(primary) {
  return {
    hlt: Math.floor(primary.vgr / 5),
    wds: Math.floor(primary.vgr / 25),
    grt: Math.floor((primary.vgr + primary.prs) / 5),
    poi: Math.floor((primary.ins + Math.floor((primary.vgr + primary.prs) / 5)) / 5)
  };
}

export function validateAttributeValue(value) {
  const num = parseInt(value);
  return isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
}
