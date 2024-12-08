// scripts/config/professions.js
export const PROFESSIONS = {
  agent: {
    name: "Agent",
    description: "NSB field agents are the frontline investigators of the inexplicable",
    coreAttribute: "VGR",
    professionalSkills: [
      { name: "Observation", type: null },
      { name: "Surveillance", type: null },
      { name: "Navigation", type: null },
      { name: "Concealment", type: null },
      { name: "Search", type: null },
      { name: "Ranged Combat", type: "Pistols" },
      { name: "Pilot", type: "Automobile" },
      { name: "Endurance", type: null }
    ],
    electiveSkills: {
      count: 2,
      options: [
        { name: "Close Combat", requireType: true },
        { name: "Deception", type: null },
        { name: "Evasion", type: null },
        { name: "Kinesics", type: null },
        { name: "Profiling", type: null },
        { name: "Tactics", type: null }
      ]
    },
    benefits: ["fleetOfFoot", "ironBody", "quickReflexes", "sharpSenses", "unshakableNerves"],
    burdens: { required: ["duty"] },
    resources: 40,
    resourceDesc: "Stable; Restricted government salary and equipment",
    ties: 2,
    tiesDesc: "Personal relationships constrained by security clearance",
    equipment: [
      "Tactical Vest (DR 5)",
      "Medium Pistol (3 mags)",
      "Display Glasses",
      "Comm Unit",
      "Surveillance Kit",
      "Forensics Tools",
      "First Aid Kit"
    ]
  },

  archivist: {
    name: "Archivist",
    description: "Archivists are information specialists in an age of unreliable information systems",
    coreAttribute: "INS",
    professionalSkills: [
      { name: "Observation", type: null },
      { name: "Analysis", type: null },
      { name: "Research", type: null },
      { name: "Science", type: "Computer Science" },
      { name: "Languages", requireType: true },
      { name: "Humanities", requireType: true },
      { name: "Computer Use", type: null },
      { name: "Administration", type: null }
    ],
    electiveSkills: {
      count: 2,
      options: [
        { name: "Cryptography", type: null },
        { name: "Electronics", type: null },
        { name: "Forensics", type: null },
        { name: "Occultism", type: null },
        { name: "Profiling", type: null },
        { name: "Religion", type: null }
      ]
    },
    benefits: ["gutInstinct", "hawkEye", "keenMind", "walkingEncyclopedia"],
    burdens: {
      count: 1,
      options: ["absentMinded", "nosy", "obsessive"]
    },
    resources: 40,
    resourceDesc: "Stable; Academic salary and institutional access",
    ties: 3,
    tiesDesc: "Academic and personal connections",
    equipment: [
      "Forensics kit",
      "Document Recovery Tools",
      "Secure Storage",
      "Analysis Software",
      "Recording Equipment"
    ]
  },

  medic: {
    name: "Medic",
    description: "Medical professionals serve as both emergency responders and analysts of inexplicable biological phenomena",
    coreAttribute: "INS",
    professionalSkills: [
      { name: "Observation", type: null },
      { name: "Analysis", type: null },
      { name: "Science", type: "Biology" },
      { name: "Research", type: null },
      { name: "Trauma Care", type: null },
      { name: "Medical Equipment", type: null },
      { name: "Psychiatry", type: null },
      { name: "Administration", type: null }
    ],
    electiveSkills: {
      count: 2,
      options: [
        { name: "Forensics", type: null },
        { name: "Holistic Medicine", type: null },
        { name: "Kinesics", type: null },
        { name: "Medical Research", type: null },
        { name: "Pharmacology", type: null },
        { name: "Profiling", type: null }
      ]
    },
    benefits: ["guardian", "ironWill", "steelConstitution", "unshakableNerves"],
    burdens: {
      count: 1,
      options: ["duty", "moralDuty", "squeamish"]
    },
    resources: 50,
    resourceDesc: "Comfortable; Medical salary and professional equipment",
    ties: 3,
    tiesDesc: "Hospital colleagues and patient relationships",
    equipment: [
      "Trauma Kit",
      "Diagnostic Scanner",
      "Emergency Meds",
      "Vital Signs Monitor",
      "Surgical Tools",
      "Protective Gear",
      "Stim Injectors"
    ]
  },

  technologist: {
    name: "Technologist",
    description: "Experts in both current technology and anomalous technical phenomena",
    coreAttribute: "INS",
    professionalSkills: [
      { name: "Observation", type: null },
      { name: "Analysis", type: null },
      { name: "Science", type: "Computer Science" },
      { name: "Electronics", type: null },
      { name: "Computer Use", type: null },
      { name: "Laboratory Equipment", type: null },
      { name: "Security Systems", type: null },
      { name: "Maintenance/Repair", type: "Electronics" }
    ],
    electiveSkills: {
      count: 2,
      options: [
        { name: "Cryptography", type: null },
        { name: "Fabrication", type: null },
        { name: "Forensics", type: null },
        { name: "Medical Equipment", type: null },
        { name: "Robotics", type: null },
        { name: "Security Systems", type: null }
      ]
    },
    benefits: ["creativeMind", "handy", "laserFocus", "mechanicalSavant"],
    burdens: {
      count: 1,
      options: ["absentMinded", "obsessive", "ruleFollower"]
    },
    resources: 40,
    resourceDesc: "Stable; Technical consulting and specialized equipment",
    ties: 3,
    tiesDesc: "Professional network & research contacts",
    equipment: [
      "E-Pick",
      "Node Scanner",
      "Surveillance Countermeasures",
      "Hardware Diagnostics",
      "Intrusion Software",
      "Protection Gear"
    ]
  }
};

export function validateProfessionRequirements(characterData, professionKey) {
  const profession = PROFESSIONS[professionKey];
  if (!profession) return { valid: false, error: "Invalid profession" };

  // Validate core attribute requirement
  const coreAttr = profession.coreAttribute.toLowerCase();
  const attrValue = characterData.attributes.primary[coreAttr];
  if (attrValue < 50) {
    return {
      valid: false,
      error: `${profession.name} requires ${profession.coreAttribute} of 50 or higher (current: ${attrValue})`
    };
  }

  return { valid: true };
}
