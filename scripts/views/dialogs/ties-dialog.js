// scripts/views/dialogs/ties-dialog.js

import { DIALOG_DEFAULTS } from '../../config/defaults.js';
import { PROFESSIONS } from '../../config/professions.js';

// ties-dialog.js
export class TiesDialog extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      ...DIALOG_DEFAULTS,
      template: "modules/vestige-character-creator/templates/dialogs/ties.html",
      title: "Create Character Ties",
      classes: [...DIALOG_DEFAULTS.classes, "ties-dialog"]
    });
  }

  constructor(characterData, options = {}) {
    super(characterData, options);
    this.characterData = characterData;
    this.previousDialog = options.previousDialog;

    // Initialize ties data
    if (!this.characterData.ties) {
      this.characterData.ties = {
        totalPoints: this.characterData.attributes.primary.prs * 2,
        assigned: [],
        remaining: this.characterData.attributes.primary.prs * 2
      };
    }

    // Register Handlebars helpers
    if (!Handlebars.helpers.times) {
      Handlebars.registerHelper('times', function(n, options) {
        let result = '';
        for (let i = 0; i < n; i++) {
          result += options.fn({ index: i });
        }
        return result;
      });
    }

    if (!Handlebars.helpers.add) {
      Handlebars.registerHelper('add', function(a, b) {
        return parseInt(a) + parseInt(b);
      });
    }
  }

  getData() {
    const profession = PROFESSIONS[this.characterData.path.profession];
    const requiredTies = profession.ties || 2;

    return {
      characterData: this.characterData,
      ties: Array(requiredTies).fill().map((_, i) => ({ index: i })),
      totalPoints: this.characterData.ties.totalPoints,
      remainingPoints: this.characterData.ties.remaining
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Strength change handler
    html.find('.tie-strength').on('input change', (event) => {
      this.updateRemainingPoints(html);
      this.updateStrengthDescription($(event.currentTarget));
    });

    // Back button handler
    html.find('button[name="back"]').on('click', () => {
      if (this.previousDialog) {
        this.previousDialog.render(true);
      }
      this.close();
    });

    // Initialize strength descriptions and points
    html.find('.tie-strength').each((i, el) => {
      this.updateStrengthDescription($(el));
    });
    this.updateRemainingPoints(html);
  }

  updateStrengthDescription($input) {
    const value = parseInt($input.val());
    const $description = $input.siblings('.strength-description');

    if (value <= 20) $description.text('Weak connection');
    else if (value <= 40) $description.text('Moderate connection');
    else if (value <= 60) $description.text('Strong connection');
    else if (value <= 80) $description.text('Very strong connection');
    else $description.text('Unbreakable connection');
  }

  updateRemainingPoints(html) {
    let usedPoints = 0;
    html.find('.tie-strength').each(function() {
      usedPoints += parseInt($(this).val()) || 0;
    });

    const remaining = this.characterData.ties.totalPoints - usedPoints;
    html.find('.remaining-points').text(remaining);
    this.characterData.ties.remaining = remaining;
  }

  async _updateObject(event, formData) {
    try {
      const profession = PROFESSIONS[this.characterData.path.profession];
      const requiredTies = profession.ties || 2;
      const ties = [];

      for (let i = 0; i < requiredTies; i++) {
        const name = formData[`tie-name-${i}`]?.trim();
        const desc = formData[`tie-desc-${i}`]?.trim();
        const strength = parseInt(formData[`tie-strength-${i}`]);

        if (!name || !desc) {
          ui.notifications.error(`Please complete all fields for Tie ${i + 1}`);
          return false;
        }

        if (!strength || strength < 1 || strength > 100) {
          ui.notifications.error(`Please enter a valid strength (1-100) for Tie ${i + 1}`);
          return false;
        }

        ties.push({ name, desc, strength });
      }

      const totalStrength = ties.reduce((sum, tie) => sum + tie.strength, 0);
      if (totalStrength !== this.characterData.ties.totalPoints) {
        ui.notifications.error(`Total strength must equal ${this.characterData.ties.totalPoints} (currently ${totalStrength})`);
        return false;
      }

      this.characterData.ties.assigned = ties;

      const FinalDetailsDialog = (await import('./final-details-dialog.js')).FinalDetailsDialog;
      new FinalDetailsDialog(this.characterData, {
        previousDialog: this
      }).render(true);

      return true;
    } catch (error) {
      console.error("Error in _updateObject:", error);
      ui.notifications.error("An error occurred. Please try again.");
      return false;
    }
  }
}
