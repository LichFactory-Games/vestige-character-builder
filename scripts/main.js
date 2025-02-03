// scripts/main.js
import { CHARACTER_DATA } from './config/data.js';
import { CharacterCreatorDialog } from './dialog.js';
import * as Helpers from './config/helpers.js';

Hooks.once('init', () => {
  // Register custom Handlebars helpers
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  Handlebars.registerHelper('includes', function(array, item) {
    return Array.isArray(array) && array.includes(item);
  });

  Handlebars.registerHelper('times', function(n, options) {
    let result = '';
    for (let i = 0; i < n; i++) {
      result += options.fn({ index: i });
    }
    return result;
  });

  Handlebars.registerHelper('add', function(a, b) {
    return parseInt(a) + parseInt(b);
  });

  Handlebars.registerHelper('multiply', function(a, b) {
    return parseInt(a) * parseInt(b);
  });

  Handlebars.registerHelper('default', function(value, defaultValue) {
    return value != null ? value : defaultValue;
  });

  Handlebars.registerHelper('getBenefitsForProfession', function(professionKey) {
    return Helpers.getBenefitsForProfession(professionKey);
  });

  Handlebars.registerHelper('getBurdensForProfession', function(professionKey) {
    return Helpers.getBurdensForProfession(professionKey);
  });

  Handlebars.registerHelper('findBurden', function(burdenId) {
    return CHARACTER_DATA.burdens.list.find(b => b.id === burdenId);
  });

  // Lookup helper for nested objects
  Handlebars.registerHelper('lookup', function(obj, key, prop) {
    if (arguments.length === 2) {
      return obj?.[key];
    }
    return obj?.[key]?.[prop];
  });

  // Register module configuration
  CONFIG.VESTIGE = CHARACTER_DATA;

  // Register module API
  game.vestige = {
    createCharacter: () => new CharacterCreatorDialog().render(true),
    config: CHARACTER_DATA,
    helpers: Helpers
  };
});
