// scripts/config/upbringing.js

export const UPBRINGING_CONFIG = {
  easy: {
    name: "Easy",
    description: "A privileged life in one sense or other",
    effects: {
      attributeBonus: 5,
      gritPenalty: -5,
      benefits: ['ally', 'businessSavvy', 'wellConnected', 'silverTongue', 'celebrityStatus', 'affluent']
    }
  },
  average: {
    name: "Average",
    description: "Standard, expected challenges with no further adjustment"
  },
  traumatic: {
    name: "Traumatic",
    description: "Life reflects significant challenges and trauma",
    burdens: ['addiction', 'compulsiveBehavior', 'impulsive', 'killjoy', 'obsessive', 'phobia', 'shortTemper'],
    benefits: ['handy', 'hiddenRefuge', 'ironBody', 'peakPhysique', 'quickReflexes', 'shadyPast', 'streetUrchin', 'truthSeeker']
  }
};

export function applyUpbringingEffects(characterData, upbringing) {
  const config = UPBRINGING_CONFIG[upbringing];
  if (!config) return false;

  // Apply attribute bonus for Easy upbringing
  if (upbringing === 'easy') {
    characterData.pendingAttributeBonus = true;
  }

  // Apply Grit penalty for Easy upbringing
  if (config.effects?.gritPenalty) {
    characterData.attributes.secondary.grt += config.effects.gritPenalty;
  }

  return true;
}
