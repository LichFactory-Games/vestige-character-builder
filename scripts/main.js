// scripts/main.js

import { ATTRIBUTES } from './config/attributes.js';
import { BENEFITS } from './config/benefits.js';
import { BURDENS } from './config/burdens.js';
import { PROFESSIONS } from './config/professions.js';
import { UPBRINGING_CONFIG } from './config/upbringing.js';
import { AttributeDialog } from './views/dialogs/attribute-dialog.js';
import { PathDialog } from './views/dialogs/path-dialog.js';

Hooks.once('init', async function() {
  console.log('Initializing Vestige Character Creator');

  // Register module settings
  game.settings.register('vestige-character-creator', 'character-states', {
    name: 'Character Creation States',
    scope: 'client',
    config: false,
    type: Object,
    default: {}
  });

  game.vestige = {
    config: {
      ATTRIBUTES,
      BENEFITS,
      BURDENS,
      PROFESSIONS,
      UPBRINGING_CONFIG
    },
    dialogs: {
      AttributeDialog,
      PathDialog
    },
    createCharacter: () => {
      new AttributeDialog({
        characterData: {
          name: "",
          attributes: {
            primary: { vgr: 0, grc: 0, ins: 0, prs: 0 },
            secondary: { hlt: 0, wds: 0, grt: 0, poi: 0 }
          }
        }
      }).render(true);
    }
  };
});
