// scripts/config/skills.js

export const SKILL_AREAS = {
  'attention': 'Attention',
  'fieldcraft': 'Fieldcraft',
  'martial': 'Martial',
  'athletics': 'Athletics',
  'operation': 'Operation',
  'education': 'Education',
  'interpersonal': 'Interpersonal',
  'medicine': 'Medicine',
  'spiritual': 'Spiritual',
  'materialcrafts': 'Material Crafts',
  'material crafts': 'Material Crafts'
};

export const PROFESSION_SKILLS = {
  agent: {
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
    }
  },
  archivist: {
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
    }
  },
  medic: {
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
    }
  },
  technologist: {
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
    }
  }
};
