// scripts/config/benefits.js

export const BENEFITS = [
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
];



export function applyBenefit(benefitId, characterData) {
  const benefit = BENEFITS.find(b => b.id === benefitId);
  if (!benefit) {
    console.warn(`Benefit ${benefitId} not found`);
    return false;
  }

  if (benefit.effect) {
    benefit.effect(characterData);
  }

  return true;
}

export function validateBenefitSelection(selectedBenefits, maxBenefits = 4) {
  // No need to handle upbringingBenefit here since it's already included in selectedBenefits
  if (selectedBenefits.length > maxBenefits) {
    return {
      valid: false,
      error: `Cannot select more than ${maxBenefits} benefits (including upbringing benefit)`
    };
  }

  // Check for duplicate benefits
  const uniqueBenefits = new Set(selectedBenefits);
  if (uniqueBenefits.size !== selectedBenefits.length) {
    return {
      valid: false,
      error: 'Cannot select the same benefit multiple times'
    };
  }

  // Validate each selected benefit exists
  const invalidBenefits = selectedBenefits.filter(
    id => !BENEFITS.find(b => b.id === id)
  );

  if (invalidBenefits.length > 0) {
    return {
      valid: false,
      error: `Invalid benefits selected: ${invalidBenefits.join(', ')}`
    };
  }

  return { valid: true };
}

export function getBenefitLimit(professionKey, hasEasyUpbringing = false) {
  const restrictions = PROFESSION_RESTRICTIONS[professionKey.toLowerCase()];
  // If they have an easy upbringing benefit, add 1 to the limit
  const baseLimit = restrictions?.benefitLimit || 2;
  return hasEasyUpbringing ? baseLimit + 1 : baseLimit;
}

export function getBenefitName(benefitId) {
  const benefit = BENEFITS.find(b => b.id === benefitId);
  return benefit ? benefit.name : benefitId;
}

export function getBenefitDescription(benefitId) {
  const benefit = BENEFITS.find(b => b.id === benefitId);
  return benefit ? benefit.desc : '';
}

// Add any profession-specific benefit restrictions
export const PROFESSION_RESTRICTIONS = {
  bureaucrat: {
    allowedBenefits: ['affluent', 'businessSavvy', 'charmingPresence', 'haggler',
                      'hawkEye', 'negotiator', 'silverTongue', 'wellConnected'],
    benefitLimit: 1,
    benefitText: "Select one benefit from the following:",
    requiredBurdens: ['cowardice', 'greedy', 'insecure', 'killjoy',
                      'nosy', 'ruleFollower', 'stubborn']
  },

  charlatan: {
    allowedBenefits: 'all', // Can select from any benefits
    benefitLimit: 1,
    benefitText: "Select one benefit:",
    automaticBurden: 'secret'
  },

  occultist: {
    allowedBenefits: ['gutInstinct', 'unshakableNerves', 'walkingEncyclopedia', 'truthSeeker'],
    benefitLimit: 1,
    benefitText: "Select one benefit from the following:",
    requiredBurdens: ['nosy', 'oblivious', 'obsessive', 'killjoy', 'squeamish', 'moralDuty']
  },

  scientist: {
    allowedBenefits: ['walkingEncyclopedia', 'keenMind', 'truthSeeker', 'laserFocus', 'creativeMind'],
    benefitLimit: 1,
    benefitText: "Select one benefit from the following:",
    requiredBurdens: ['absentMinded', 'easilyDistracted', 'nosy', 'oblivious', 'obsessive']
  },

  seeker: {
    allowedBenefits: 'all',
    benefitLimit: 1,
    benefitText: "Select one benefit:",
    automaticBurden: 'obsessive'
  },

  technologist: {
    allowedBenefits: 'all',
    benefitLimit: 1,
    benefitText: "Select one benefit:",
    useAllBurdens: true  // Can select from any burden
  },

  agent: {
    allowedBenefits: ['fleetOfFoot', 'ironBody', 'quickReflexes', 'sharpSenses', 'unshakableNerves'],
    benefitLimit: 1,
    benefitText: "Select one benefit from the following:",
    automaticBurden: 'duty'
  }
};

// Helper function to get available benefits for a profession
export function getAvailableBenefits(professionKey) {
  const restrictions = PROFESSION_RESTRICTIONS[professionKey.toLowerCase()];
  if (!restrictions) return BENEFITS;

  if (restrictions.allowedBenefits === 'all') return BENEFITS;
  if (restrictions.allowedBenefits === null) return [];

  return BENEFITS.filter(b => restrictions.allowedBenefits.includes(b.id));
}

// Helper function to get benefit text for a profession
export function getBenefitText(professionKey) {
  const restrictions = PROFESSION_RESTRICTIONS[professionKey.toLowerCase()];
  return restrictions?.benefitText || "Select up to two benefits:";
}

// Helper function to get automatic benefits/burdens
export function getAutomaticSelections(professionKey) {
  const restrictions = PROFESSION_RESTRICTIONS[professionKey.toLowerCase()];
  if (!restrictions) return { benefits: [], burdens: [] };

  return {
    benefits: restrictions.automaticBenefit ? [restrictions.automaticBenefit] : [],
    burdens: restrictions.automaticBurden ? [restrictions.automaticBurden] : []
  };
}

// Helper function to get required burdens
export function getRequiredBurdens(professionKey) {
  const restrictions = PROFESSION_RESTRICTIONS[professionKey.toLowerCase()];
  if (!restrictions) return [];

  if (restrictions.useAllBurdens) return 'all';
  return restrictions.requiredBurdens || [];
}


