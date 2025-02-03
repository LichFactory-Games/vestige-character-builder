// scripts/dialog.js
import { CHARACTER_DATA } from './config/data.js';
import * as Helpers from './config/helpers.js';

export class CharacterCreatorDialog extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["vestige", "creator-dialog"],
      template: "modules/vestige-character-creator/templates/char-template.html",
      width: 600,
      height: 800,
      title: "Create Character",
      tabs: [{
        navSelector: ".tabs",
        contentSelector: ".content",
        initial: "attributes"
      }]
    });
  }

  constructor(options = {}) {
    super(options);
    this.character = this._getInitialCharacter();
    this.step = 1;
  }

  _getInitialCharacter() {
    return {
      name: "",
      attributes: {
        primary: {
          vgr: 30,
          grc: 30,
          ins: 30,
          prs: 30
        },
        secondary: {}
      },
      path: {
        profession: null,
        upbringing: null
      },
      benefits: [],
      burdens: [],
      skills: {
        professional: [],
        elective: []
      },
      ties: []
    };
  }

  getData() {
    return {
      character: this.character,
      config: CHARACTER_DATA,
      step: this.step
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Navigation
    html.find('.next-step').click(this._onNextStep.bind(this));
    html.find('.prev-step').click(this._onPrevStep.bind(this));

    // Attribute controls
    html.find('.attribute-input').change(this._onAttributeChange.bind(this));
    html.find('.roll-attributes').click(this._onRollAttributes.bind(this));
    html.find('.use-array').click(this._onUseArray.bind(this));
  }

  async _updateObject(event, formData) {
    // Validate current step
    const validation = await this._validateStep();
    if (!validation.valid) {
      ui.notifications.error(validation.error);
      return false;
    }

    // Update character data based on current step
    await this._updateStep(formData);

    return true;
  }
}
