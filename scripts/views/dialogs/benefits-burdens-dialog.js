// scripts/views/dialogs/benefits-burdens-dialog.js
import { DIALOG_DEFAULTS } from '../../config/defaults.js';
import { BENEFITS, getAvailableBenefits, getBenefitText, getBenefitLimit, getAutomaticSelections, validateBenefitSelection } from '../../config/benefits.js';
import { BURDENS, getAvailableBurdens, getBurdenRequirements, validateBurdenSelection } from '../../config/burdens.js';

export class BenefitsBurdensDialog extends FormApplication {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      ...DIALOG_DEFAULTS,
      template: "modules/vestige-character-creator/templates/dialogs/benefits-burdens.html",
      title: "Benefits & Burdens",
      classes: [...DIALOG_DEFAULTS.classes, "benefits-burdens-dialog"]
    });
  }

  constructor(characterData, options = {}) {
    super(characterData, options);
    this.characterData = characterData;
    this.previousDialog = options.previousDialog;

    // Register handlebars helpers
    Handlebars.registerHelper('getBenefitName', (benefitId) => {
      const benefit = BENEFITS.find(b => b.id === benefitId);
      return benefit ? benefit.name : benefitId;
    });

    Handlebars.registerHelper('getBurdenName', (burdenId) => {
      const burden = BURDENS.find(b => b.id === burdenId);
      return burden ? burden.name : burdenId;
    });
  }

  getData() {
    const profession = this.characterData.path.profession;
    return {
      characterData: this.characterData,
      availableBenefits: getAvailableBenefits(profession),
      benefitsText: getBenefitText(profession),
      automaticSelections: getAutomaticSelections(profession),
      availableBurdens: getAvailableBurdens(profession),
      burdenRequirements: getBurdenRequirements(profession)
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Add change handlers for benefit/burden selections
    html.find('input[type="checkbox"]').on('change', this._onSelectionChange.bind(this));

    // Add back button handler
    html.find('button[name="back"]').on('click', () => {
      if (this.previousDialog) {
        this.previousDialog.render(true);
      }
      this.close();
    });
  }

  _onSelectionChange(event) {
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
  }

  async _updateObject(event, formData) {
    try {
      // Collect selections
      const selectedBenefits = [];
      const selectedBurdens = [];

      // Add the upbringing benefit if it exists first
      if (this.characterData.path.easyBenefit) {
        selectedBenefits.push(this.characterData.path.easyBenefit);
      }

      Object.entries(formData).forEach(([key, value]) => {
        if (value) { // if checkbox is checked
          if (key.startsWith('benefit-')) {
            selectedBenefits.push(key.replace('benefit-', ''));
          } else if (key.startsWith('burden-')) {
            selectedBurdens.push(key.replace('burden-', ''));
          }
        }
      });

      // Add any automatic selections
      const automaticSelections = getAutomaticSelections(this.characterData.path.profession);
      if (automaticSelections.benefits) {
        selectedBenefits.push(...automaticSelections.benefits);
      }
      if (automaticSelections.burdens) {
        selectedBurdens.push(...automaticSelections.burdens);
      }

      // Get adjusted benefit limit based on whether we have an easy upbringing
      const hasEasyUpbringing = Boolean(this.characterData.path.easyBenefit);
      const adjustedLimit = getBenefitLimit(
        this.characterData.path.profession,
        hasEasyUpbringing
      );

      // Validate selections
      const benefitValidation = validateBenefitSelection(
        selectedBenefits,
        adjustedLimit
      );

      const burdenValidation = validateBurdenSelection(
        selectedBurdens,
        this.characterData.path.profession,
        this.characterData.path.upbringing
      );

      if (!benefitValidation.valid) {
        ui.notifications.error(benefitValidation.error);
        return false;
      }

      if (!burdenValidation.valid) {
        ui.notifications.error(burdenValidation.error);
        return false;
      }

      // Update character data
      this.characterData.benefits = {
        starting: selectedBenefits,
        purchased: []
      };

      this.characterData.burdens = {
        starting: selectedBurdens,
        acquired: []
      };

      // Continue to skill selection
      const SkillSelectionDialog = (await import('./skills-selection-dialog.js')).SkillSelectionDialog;
      new SkillSelectionDialog(this.characterData, {
        previousDialog: this
      }).render(true);

      this.close();
      return true;

    } catch (error) {
      console.error("Error processing benefits and burdens:", error);
      ui.notifications.error("An error occurred. Please try again.");
      return false;
    }
  }
}
