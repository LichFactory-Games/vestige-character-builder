// scripts/config/helpers.js
import { CHARACTER_DATA } from './data.js';

// Attribute Helpers
export function calculateSecondaryAttributes(primary) {
  return CHARACTER_DATA.calculateSecondary(primary);
}

export function validateAttributeValue(value, min = 0, max = 100) {
  const num = parseInt(value);
  return isNaN(num) ? 0 : Math.max(min, Math.min(max, num));
}

// Profession Helpers
export function getProfessionSkills(professionKey) {
  const profession = CHARACTER_DATA.professions[professionKey];
  if (!profession) return null;

  return {
    professional: profession.professionalSkills,
    elective: profession.electiveSkills
  };
}

export function validateProfessionRequirements(characterData, professionKey) {
  const profession = CHARACTER_DATA.professions[professionKey];
  if (!profession) {
    return { valid: false, error: "Invalid profession" };
  }

  // Check core attribute requirement
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

// Benefits & Burdens Helpers
export function getBenefitsForProfession(professionKey) {
  const profession = CHARACTER_DATA.professions[professionKey];
  return profession ? profession.benefits : [];
}

export function getBurdensForProfession(professionKey) {
  const profession = CHARACTER_DATA.professions[professionKey];
  return profession?.burdens || { count: 0, options: [] };
}

export function validateBenefitSelection(selectedBenefits, profession, upbringing) {
  // Check profession limit
  const professionBenefits = getBenefitsForProfession(profession);
  const hasEasyUpbringing = upbringing === 'easy';
  const maxBenefits = hasEasyUpbringing ? 2 : 1;

  if (selectedBenefits.length > maxBenefits) {
    return {
      valid: false,
      error: `Cannot select more than ${maxBenefits} benefits`
    };
  }

  // Check if benefits are valid for profession
  const invalidBenefits = selectedBenefits.filter(
    benefit => !professionBenefits.includes(benefit)
  );

  if (invalidBenefits.length > 0) {
    return {
      valid: false,
      error: `Invalid benefits selected: ${invalidBenefits.join(', ')}`
    };
  }

  return { valid: true };
}

// Upbringing Helpers
export function getUpbringingEffects(upbringingType) {
  return CHARACTER_DATA.upbringing.types[upbriningType]?.effects || null;
}

export function applyUpbringingEffects(characterData, upbringingType) {
  const effects = getUpbringingEffects(upbringingType);
  if (!effects) return;

  // Apply attribute bonus for Easy upbringing
  if (effects.attributeBonus) {
    characterData.pendingAttributeBonus = effects.attributeBonus;
  }

  // Apply Grit penalty
  if (effects.gritPenalty) {
    characterData.attributes.secondary.grt += effects.gritPenalty;
  }
}

// General Validation Helper
export function validateCharacterData(characterData) {
  const errors = [];

  // Check required sections
  if (!characterData.attributes?.primary) {
    errors.push("Missing primary attributes");
  }

  if (!characterData.path?.profession) {
    errors.push("No profession selected");
  }

  if (!characterData.path?.upbringing) {
    errors.push("No upbringing selected");
  }

  // Return validation result
  return {
    valid: errors.length === 0,
    errors
  };
}

// General Helper Functions
export function findById(array, id) {
  return array.find(item => item.id === id);
}

export function sanitizeString(str) {
  if (!str) return '';
  return str.trim();
}

export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}
