// scripts/config/data.js

export const CHARACTER_DATA = {
  // Primary attributes and their characteristics
  attributes: {
    primary: {
      vgr: { label: "Vigor", desc: "Physical power and endurance", default: 50 },
      grc: { label: "Grace", desc: "Agility and coordination", default: 50 },
      ins: { label: "Insight", desc: "Mental acuity and perception", default: 50 },
      prs: { label: "Presence", desc: "Charisma and willpower", default: 50 }
    },
    // Secondary attributes derived from primary ones
    secondary: {
      hlt: { label: "Health", desc: "Physical durability" },
      wds: { label: "Wounds", desc: "Injury tolerance" },
      grt: { label: "Grit", desc: "Resilience" },
      poi: { label: "Poise", desc: "Psychological stability" }
    }
  },

  // Standard array for attribute distribution
  attributeArray: [65, 55, 50, 45],

  // Attribute calculation functions
  calculateSecondary: (primary) => ({
    hlt: Math.floor(primary.vgr / 5),
    wds: Math.floor(primary.vgr / 25),
    grt: Math.floor((primary.vgr + primary.prs) / 5),
    poi: Math.floor((primary.ins + Math.floor((primary.vgr + primary.prs) / 5)) / 5)
  }),

  // Benfits Data //
  benefits: {
    list: [
      { id: 'affluent', name: 'Affluent', desc: 'Increase Resource Rating by +15, to a minimum of 45' },
      { id: 'ally', name: 'Ally', desc: 'Reliable NPC with RR of 80 they can call on for aid' },
      { id: 'brawler', name: 'Brawler', desc: 'Advantage on Unarmed Combat action if it is your only action that round' },
      { id: 'businessSavvy', name: 'Business Savvy', desc: 'Advantage on INS checks related to business or economics' },
      { id: 'celebrityStatus', name: 'Celebrity Status', desc: 'Advantage on PRS checks when seeking VIP treatment' },
      { id: 'charmingPresence', name: 'Charming Presence', desc: 'Advantage on PRS checks for favorable impressions in normal social situations' },
      { id: 'creativeMind', name: 'Creative Mind', desc: 'Advantage on INS or PRS checks when devising creative solutions' },
      { id: 'deft', name: 'Deft', desc: 'Advantage on GRC checks requiring fine hand-eye coordination' },
      { id: 'fleetOfFoot', name: 'Fleet of Foot', desc: 'Take 1 free Movement action before first round of combat' },
      { id: 'ghostInTheSystem', name: 'Ghost in the System', desc: 'No traceable record in public databases' },
      { id: 'guardian', name: 'Guardian', desc: 'Advantage on actions aimed at protecting someone else' },
      { id: 'gutInstinct', name: 'Gut Instinct', desc: 'Advantage on INS checks for guesswork, alternatives, or reading vibes' },
      { id: 'haggler', name: 'Haggler', desc: 'Advantage on PRS checks involving negotiations or haggling' },
      { id: 'handy', name: 'Handy', desc: 'Advantage on Fabrication checks for repairs or maintenance' },
      { id: 'hangoverFree', name: 'Hangover-Free', desc: 'Resistant to post-intoxication effects' },
      { id: 'hawkEye', name: 'Hawk-Eye', desc: 'Advantage on INS checks to notice hidden or overlooked details' },
      { id: 'hiddenRefuge', name: 'Hidden Refuge', desc: 'Access to a hidden location difficult to find' },
      { id: 'improvisedMedic', name: 'Improvised Medic', desc: 'Use Healing skill with makeshift tools without penalty' },
      { id: 'innateNavigator', name: 'Innate Navigator', desc: 'Always knows north and cannot get lost naturally' },
      { id: 'ironBody', name: 'Iron Body', desc: 'Gain 1 Damage Resistance (DR)' },
      { id: 'ironWill', name: 'Iron Will', desc: 'Gain +5 GRT' },
      { id: 'keenMind', name: 'Keen Mind', desc: 'Gain +5 INS' },
      { id: 'laserFocus', name: 'Laser Focus', desc: 'Advantage on INS checks involving concentration or resisting distractions' },
      { id: 'masterDiplomat', name: 'Master Diplomat', desc: 'Advantage on PRS checks for diplomacy or rhetoric' },
      { id: 'mechanicalSavant', name: 'Mechanical Savant', desc: 'Advantage on Fabrication checks for engineering or mechanical devices' },
      { id: 'naturalBalance', name: 'Natural Balance', desc: 'Advantage on GRC checks for balance, difficult terrain, or acrobatics' },
      { id: 'negotiator', name: 'Negotiator', desc: 'Advantage on PRS checks for deals or bartering' },
      { id: 'peakPhysique', name: 'Peak Physique', desc: 'Gain +5 GRC or +5 VGR (choose when taken)' },
      { id: 'photographicMemory', name: 'Photographic Memory', desc: 'Recall details without rolls; INS for obscure information' },
      { id: 'quickReflexes', name: 'Quick Reflexes', desc: 'Gain +1 Initiative' },
      { id: 'shadyPast', name: 'Shady Past', desc: 'Advantage on opposed Grift checks against untrained opponents' },
      { id: 'sharpSenses', name: 'Sharp Senses', desc: 'Advantage on INS checks to quickly notice surroundings' },
      { id: 'silverTongue', name: 'Silver Tongue', desc: 'Advantage on PRS checks for charm or seduction' },
      { id: 'steelConstitution', name: 'Steel Constitution', desc: 'Advantage on HLT checks to resist illness, poison, or physical ailments' },
      { id: 'streetUrchin', name: 'Street Urchin', desc: 'Advantage on Streetwise skill uses' },
      { id: 'tactician', name: 'Tactician', desc: 'Advantage on INS checks for planning strategies or assessing battlefield conditions' },
      { id: 'truthSeeker', name: 'Truth Seeker', desc: 'Advantage on INS checks to detect lies' },
      { id: 'unshakableNerves', name: 'Unshakable Nerves', desc: 'Advantage on POI checks to resist fear or stay calm under pressure' },
      { id: 'walkingEncyclopedia', name: 'Walking Encyclopedia', desc: 'Roll INS to recall relevant facts from past experiences' },
      { id: 'wellConnected', name: 'Well-Connected', desc: 'Gain influential contact or family member for assistance' }

    ]
  },



  // Burdens //
  burdens: {
    list: [
      { id: 'absentMinded', name: 'Absent-Minded', desc: 'Disadvantage on checks to recall encountered information unless prompted' },
      { id: 'addiction', name: 'Addiction', desc: 'Must roll GRT to resist indulging; failure loses GRT and other consequences' },
      { id: 'compulsiveBehavior', name: 'Compulsive Behavior', desc: 'Roll GRT to avoid compulsion in stress; failure means immediate indulgence' },
      { id: 'cowardice', name: 'Cowardice', desc: 'Must roll POI to avoid fleeing or freezing when facing danger' },
      { id: 'duty', name: 'Duty', desc: 'Possesses a significant personal obligation towards an individual or group that may require significant sacrifice' },
      { id: 'easilyDistracted', name: 'Easily Distracted', desc: 'Disadvantage on concentration checks with environmental distractions' },
      { id: 'greedy', name: 'Greedy', desc: 'Must roll GRT to resist unwise opportunities for personal gain' },
      { id: 'gullible', name: 'Gullible', desc: 'Disadvantage on checks to detect lies or deception' },
      { id: 'impulsive', name: 'Impulsive', desc: 'Roll GRT to resist acting without thinking in high-stress situations' },
      { id: 'insecure', name: 'Insecure', desc: 'Disadvantage on GRT checks for asserting self or making important decisions' },
      { id: 'killjoy', name: 'Killjoy', desc: 'Disadvantage on PRS checks for charm, morale, or inspiring fun' },
      { id: 'moralDuty', name: 'Moral Duty', desc: 'Disadvantage on checks to ignore conscience, must do what is morally right' },
      { id: 'motionSick', name: 'Motion Sick', desc: 'Disadvantage on focus checks while in motion, may need HLT roll against nausea' },
      { id: 'nosy', name: 'Nosy', desc: 'Roll GRT to resist asking intrusive questions or unwelcome snooping' },
      { id: 'oblivious', name: 'Oblivious', desc: 'Disadvantage on INS checks to notice obvious details or clues' },
      { id: 'obsessive', name: 'Obsessive', desc: 'Must roll GRT to focus on anything else in stressful or related situations' },
      { id: 'overconfident', name: 'Overconfident', desc: 'Disadvantage on INS checks to assess risks, may attempt beyond capabilities' },
      { id: 'paranoia', name: 'Paranoia', desc: 'Disadvantage on PRS checks for meeting people or building trust' },
      { id: 'phobia', name: 'Phobia', desc: 'Roll POI when facing fear or suffer Disadvantage until threat is gone' },
      { id: 'ruleFollower', name: 'Rule Follower', desc: 'Roll GRT to break rules, Disadvantage when defying norms' },
      { id: 'secret', name: 'Secret', desc: 'Harbors dangerous/compromising secret with social/legal/personal consequences' },
      { id: 'shortTemper', name: 'Short Temper', desc: 'Roll POI to avoid rage when provoked; failure leads to reckless behavior' },
      { id: 'squeamish', name: 'Squeamish', desc: 'Disadvantage on actions involving blood/gore, especially medical/combat' },
      { id: 'stubborn', name: 'Stubborn', desc: 'Disadvantage on social checks related to changing mind or compromise' },
      { id: 'technophobe', name: 'Technophobe', desc: 'Disadvantage on checks involving modern technology' },
      { id: 'vain', name: 'Vain', desc: 'Roll POI to resist prioritizing personal image over practicality when stressed' }
    ]
  },

  professions: {
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
      benefits: {
        count: 1,
        options: ["fleetOfFoot", "ironBody", "quickReflexes", "sharpSenses", "unshakableNerves"]
      },
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
      benefits: {
        count: 1,
        options: ["gutInstinct", "hawkEye", "keenMind", "walkingEncyclopedia"]
      },
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
      benefits: {
        count: 1,
        options: ["guardian", "ironWill", "steelConstitution", "unshakableNerves"]
      },
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
      benefits: {
        count: 1,
        options: ["creativeMind", "handy", "laserFocus", "mechanicalSavant"]
      },
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
  },

  upbringing: {
    types: {
      easy: {
        name: "Easy",
        description: "A privileged life in one sense or other",
        effects: {
          attributeBonus: 5,
          gritPenalty: -5,
          benefits: {
            count: 1,
            options: ['ally', 'businessSavvy', 'wellConnected', 'silverTongue', 'celebrityStatus', 'affluent']
          }
        }
      },
      average: {
        name: "Average",
        description: "Standard, expected challenges with no further adjustment"
      },
      traumatic: {
        name: "Traumatic",
        description: "Life reflects significant challenges and trauma",
        burdens: {
          count: 2,
          options:  ['addiction', 'compulsiveBehavior', 'impulsive', 'killjoy', 'obsessive', 'phobia', 'shortTemper']
        },
        benefits: {
          count: 1,
          options: ['handy', 'hiddenRefuge', 'ironBody', 'peakPhysique', 'quickReflexes', 'shadyPast', 'streetUrchin', 'truthSeeker']
        }
      }
    }
  }
};
