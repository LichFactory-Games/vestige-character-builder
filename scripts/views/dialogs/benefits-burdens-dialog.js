// scripts/views/dialogs/benefits-burdens-dialog.js
import { BaseDialog } from './base-dialog.js';
import {
  BENEFITS,
  getAvailableBenefits,
  getBenefitText,
  getBenefitLimit,
  getAutomaticSelections,
  validateBenefitSelection
} from '../../config/benefits.js';
import {
  BURDENS,
  getAvailableBurdens,
  getBurdenRequirements,
  validateBurdenSelection
} from '../../config/burdens.js';
import { SkillSelectionDialog } from './skills-selection-dialog.js';

export class BenefitsBurdensDialog extends BaseDialog {
  constructor(data = {}, options = {}) {
    super(data, {
      ...options,
      nextDialogClass: SkillSelectionDialog,
      validationRules: [
        // Validate benefit selections
        (data) => {
          const selectedBenefits = this.getSelectedBenefits();
          const hasEasyUpbringing = Boolean(data.path?.easyBenefit);
          const adjustedLimit = getBenefitLimit(
            data.path.profession,
            hasEasyUpbringing
          );
          return validateBenefitSelection(selectedBenefits, adjustedLimit);
        },
        // Validate burden selections
        (data) => {
          const selectedBurdens = this.getSelectedBurdens();
          return validateBurdenSelection(
            selectedBurdens,
            data.path.profession,
            data.path.upbringing
          );
        }
      ]
    });

    // Validate required data
    if (!this.characterData?.path?.profession) {
      console.error("Missing required profession data:", this.characterData);
      ui.notifications.error("Character profession data is missing");
      // Return to previous dialog if available
      if (this.previousDialog) {
        this.previousDialog.render(true);
      }
      return;
    }

    // Register Handlebars helpers if not already registered
    if (!Handlebars.helpers.getBenefitName) {
      Handlebars.registerHelper('getBenefitName', (benefitId) => {
        const benefit = BENEFITS.find(b => b.id === benefitId);
        return benefit ? benefit.name : benefitId;
      });
    }

    if (!Handlebars.helpers.getBurdenName) {
      Handlebars.registerHelper('getBurdenName', (burdenId) => {
        const burden = BURDENS.find(b => b.id === burdenId);
        return burden ? burden.name : burdenId;
      });
    }
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/vestige-character-creator/templates/dialogs/benefits-burdens.html",
      title: "Benefits & Burdens",
      classes: ["vestige", "dialog", "benefits-burdens-dialog"]
    });
  }

  getData() {
    try {
      // Validate character data exists
      if (!this.characterData) {
        console.error("No character data found");
        ui.notifications.error("Character data not found");
        return this.getDefaultData();
      }

      // Validate path exists
      if (!this.characterData.path) {
        console.error("No path data found in character data");
        ui.notifications.error("Character path data not found");
        return this.getDefaultData();
      }

      // Validate profession exists
      const profession = this.characterData.path.profession;
      if (!profession) {
        console.error("No profession found in path data");
        ui.notifications.error("Character profession not found");
        return this.getDefaultData();
      }

      try {
        return {
          characterData: this.characterData,
          availableBenefits: getAvailableBenefits(profession),
          benefitsText: getBenefitText(profession),
          automaticSelections: getAutomaticSelections(profession),
          availableBurdens: getAvailableBurdens(profession),
          burdenRequirements: getBurdenRequirements(profession)
        };
      } catch (configError) {
        console.error("Error getting profession configuration:", configError);
        ui.notifications.error("Error loading profession data");
        return this.getDefaultData();
      }
    } catch (error) {
      console.error("Error in getData:", error);
      ui.notifications.error("Failed to load character data");
      return this.getDefaultData();
    }
  }

  // Helper method to provide safe default data
  getDefaultData() {
    return {
      characterData: this.characterData || {},
      availableBenefits: [],
      benefitsText: "Error loading benefits",
      automaticSelections: { benefits: [], burdens: [] },
      availableBurdens: [],
      burdenRequirements: { count: 0 }
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Add change handlers for benefit/burden selections
    html.find('input[type="checkbox"]').on('change', this._onSelectionChange.bind(this));
  }

  _onSelectionChange(event) {
    this.handleAsyncOperation(async () => {
      const checkbox = event.currentTarget;
      const type = checkbox.name.startsWith('benefit') ? 'benefit' : 'burden';
      const isBenefit = type === 'benefit';

      // Get all selected items of this type
      const selectedCount = this.element
            .find(`input[name^="${type}-"]:checked`).length;

      // Get limit based on type
      const limit = isBenefit ?
            getBenefitLimit(this.characterData.path.profession) :
            getBurdenRequirements(this.characterData.path.profession).count;

      // Check if over limit
      if (selectedCount > limit) {
        checkbox.checked = false;
        ui.notifications.warn(
          `You can only select ${limit} ${type}${limit !== 1 ? 's' : ''}`
        );
      }

      await this.saveState();
    }, "Error handling selection change");
  }

  getSelectedBenefits() {
    const selectedBenefits = [];

    // Add the upbringing benefit if it exists
    if (this.characterData.path.easyBenefit) {
      selectedBenefits.push(this.characterData.path.easyBenefit);
    }

    // Add checked benefits
    this.element.find('input[name^="benefit-"]:checked').each((_, el) => {
      selectedBenefits.push(el.name.replace('benefit-', ''));
    });

    // Add automatic selections
    const automaticSelections = getAutomaticSelections(this.characterData.path.profession);
    if (automaticSelections.benefits) {
      selectedBenefits.push(...automaticSelections.benefits);
    }

    return selectedBenefits;
  }

  getSelectedBurdens() {
    const selectedBurdens = [];

    // Add checked burdens
    this.element.find('input[name^="burden-"]:checked').each((_, el) => {
      selectedBurdens.push(el.name.replace('burden-', ''));
    });

    // Add automatic selections
    const automaticSelections = getAutomaticSelections(this.characterData.path.profession);
    if (automaticSelections.burdens) {
      selectedBurdens.push(...automaticSelections.burdens);
    }

    return selectedBurdens;
  }

  async _updateObject(event, formData) {
    // Update character data before validation
    this.characterData.benefits = {
      starting: this.getSelectedBenefits(),
      purchased: []
    };

    this.characterData.burdens = {
      starting: this.getSelectedBurdens(),
      acquired: []
    };

    // Base class handles validation, state saving, and navigation
    return super._updateObject(event, formData);
  }

  // Add this method to BenefitsBurdensDialog class

  async _render(force = false, options = {}) {
    try {
      // Validate required data before attempting render
      if (!this.characterData?.path?.profession) {
        console.error("Missing profession data during render");
        ui.notifications.error("Unable to display benefits selection - missing data");

        // Return to previous dialog if available
        if (this.previousDialog) {
          this.previousDialog.render(true);
          this.close(options);
        }
        return false;
      }

      // If validation passes, proceed with normal render
      return await super._render(force, options);

    } catch (error) {
      console.error("Error rendering benefits dialog:", error);
      ui.notifications.error("Failed to display benefits selection");

      // Return to previous dialog if available
      if (this.previousDialog) {
        this.previousDialog.render(true);
        this.close(options);
      }
      return false;
    }
  }
}
