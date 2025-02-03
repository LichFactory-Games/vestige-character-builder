// scripts/main.js
import { CHARACTER_DATA } from './config/data.js';
import { CharacterCreatorDialog } from './dialog.js';
import * as Helpers from './config/helpers.js';

Hooks.once('init', () => {
  // Register Handlebars helpers first
  Handlebars.registerHelper({
    eq: (a, b) => a === b,
    includes: (array, item) => Array.isArray(array) && array.includes(item),
    times: function(n, options) {
      let result = '';
      for (let i = 0; i < n; i++) {
        result += options.fn({ index: i });
      }
      return result;
    },
    add: (a, b) => parseInt(a) + parseInt(b),
    multiply: (a, b) => parseInt(a) * parseInt(b),
    default: (value, defaultValue) => value != null ? value : defaultValue,
    getBenefitsForProfession: professionKey => Helpers.getBenefitsForProfession(professionKey),
    getBurdensForProfession: professionKey => Helpers.getBurdensForProfession(professionKey),
    findBurden: burdenId => CHARACTER_DATA.burdens.list.find(b => b.id === burdenId),
    // Changed to regular function for arguments access
    lookup: function(obj, key, prop) {
      // Check if third arg is Handlebars options object
      if (prop && prop.name === 'lookup') {
        return obj?.[key];
      }
      return obj?.[key]?.[prop];
    },
    findBenefit: function(benefitId) {
      const benefit = CHARACTER_DATA.benefits.list.find(b => b.id === benefitId);
      return benefit || null;
    },
    findBurden: function(burdenId) {
      const burden = CHARACTER_DATA.burdens.list.find(b => b.id === burdenId);
      return burden || null;
    }


  });

  // Add API to game object
  game.vestige = {
    createCharacter: () => new CharacterCreatorDialog().render(true),
    data: CHARACTER_DATA,
    helpers: Helpers
  };
});
