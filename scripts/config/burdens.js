// scripts/config/burdens.js


export const BURDENS = [
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
];


// Profession-specific burden requirements
export const PROFESSION_BURDEN_REQUIREMENTS = {
  bureaucrat: {
    requiredBurdens: ['cowardice', 'greedy', 'insecure', 'killjoy', 'nosy', 'ruleFollower', 'stubborn'],
    burdenCount: 1
  },
  charlatan: {
    automaticBurden: 'secret',
    burdenCount: 1
  },
  occultist: {
    requiredBurdens: ['nosy', 'oblivious', 'obsessive', 'killjoy', 'squeamish', 'moralDuty'],
    burdenCount: 1
  },
  scientist: {
    requiredBurdens: ['absentMinded', 'easilyDistracted', 'nosy', 'oblivious', 'obsessive'],
    burdenCount: 1
  },
  seeker: {
    automaticBurden: 'obsessive',
    burdenCount: 1
  },
  technologist: {
    requiredBurdens: 'all', // Can select from any burden
    burdenCount: 1
  },
  agent: {
    automaticBurden: 'duty',
    burdenCount: 1
  }
};

// Helper functions
export function getBurdenName(burdenId) {
  const burden = BURDENS.find(b => b.id === burdenId);
  return burden ? burden.name : burdenId;
}

export function getBurdenDescription(burdenId) {
  const burden = BURDENS.find(b => b.id === burdenId);
  return burden ? burden.desc : '';
}

export function getAvailableBurdens(professionKey) {
  const requirements = PROFESSION_BURDEN_REQUIREMENTS[professionKey.toLowerCase()];
  if (!requirements) return BURDENS;

  if (requirements.requiredBurdens === 'all') return BURDENS;
  if (requirements.requiredBurdens) {
    return BURDENS.filter(b => requirements.requiredBurdens.includes(b.id));
  }
  return [];
}

export function getAutomaticBurden(professionKey) {
  const requirements = PROFESSION_BURDEN_REQUIREMENTS[professionKey.toLowerCase()];
  return requirements?.automaticBurden || null;
}

export function getBurdenRequirements(professionKey) {
  const requirements = PROFESSION_BURDEN_REQUIREMENTS[professionKey.toLowerCase()];
  return {
    count: requirements?.burdenCount || 0,
    automatic: requirements?.automaticBurden || null,
    available: requirements?.requiredBurdens || 'all'
  };
}

export function validateBurdenSelection(selectedBurdens, professionKey, upbringing = '') {
  const requirements = getBurdenRequirements(professionKey);
  const traumaticBurdens = upbringing === 'traumatic' ? 2 : 0;
  const totalRequired = requirements.count + traumaticBurdens;

  if (selectedBurdens.length !== totalRequired) {
    return {
      valid: false,
      error: `Must select exactly ${totalRequired} burden${totalRequired !== 1 ? 's' : ''}`
    };
  }

  // Validate each burden is available for selection
  if (requirements.available !== 'all') {
    const invalidBurdens = selectedBurdens.filter(
      id => !requirements.available.includes(id)
    );
    if (invalidBurdens.length > 0) {
      return {
        valid: false,
        error: `Invalid burdens selected: ${invalidBurdens.join(', ')}`
      };
    }
  }

  return { valid: true };
}

export function applyBurdenEffects(characterData, burdenIds) {
  burdenIds.forEach(burdenId => {
    const burden = BURDENS.find(b => b.id === burdenId);
    if (!burden) return;

    switch(burdenId) {
    case 'insecure':
      // -5 GRT
      characterData.attributes.secondary.grt -= 5;
      break;
      // Add other burden effects as needed
    }
  });
}
