// scripts/views/dialogs/path-dialog.js
import { BaseDialog } from './base-dialog.js';
import { PROFESSIONS, validateProfessionRequirements } from '../../config/professions.js';
import { BENEFITS } from '../../config/benefits.js';
import { UPBRINGING_CONFIG } from '../../config/upbringing.js';
import { BenefitsBurdensDialog } from './benefits-burdens-dialog.js';

export class PathDialog extends BaseDialog {
  constructor(data = {}, options = {}) {
    super(data, {
      ...options,
      nextDialogClass: BenefitsBurdensDialog,
      validationRules: [
        // Validate both selections are made
        (data) => ({
          valid: data.path?.profession && data.path?.upbringing,
          error: "Please select both profession and upbringing"
        }),
        // Validate profession requirements
        (data) => {
          if (!data.path?.profession) return { valid: true };
          return validateProfessionRequirements(data, data.path.profession);
        }
      ]
    });

    // Register Handlebars helper if not already registered
    if (!Handlebars.helpers.getBenefitName) {
      Handlebars.registerHelper('getBenefitName', function(benefitId) {
        const benefit = BENEFITS.find(b => b.id === benefitId);
        return benefit ? benefit.name : benefitId;
      });
    }
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/vestige-character-creator/templates/dialogs/path.html",
      title: "Choose Your Path",
      classes: ["vestige", "dialog", "path-dialog"]
    });
  }

  getData() {
    return {
      professions: PROFESSIONS,
      upbringing: UPBRINGING_CONFIG,
      benefits: BENEFITS,
      characterData: this.characterData
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Profession change handler
    html.find('[name="profession"]').change(event => {
      this.handleAsyncOperation(async () => {
        const profKey = event.currentTarget.value;
        const prof = PROFESSIONS[profKey];
        if (prof) {
          const validation = validateProfessionRequirements(this.characterData, profKey);
          if (!validation.valid) {
            ui.notifications.warn(validation.error);
            event.currentTarget.value = '';
            return;
          }
          this.updateProfessionDetails(html, prof);
          await this.saveState();
        }
      }, "Error updating profession");
    });

    // Upbringing change handler
    html.find('input[name="upbringing"]').change(event => {
      this.handleAsyncOperation(async () => {
        const upbringing = event.currentTarget.value;
        this.updateUpbringingEffects(html, upbringing);
        await this.saveState();
      }, "Error updating upbringing");
    });
  }

  updateProfessionDetails(html, profession) {
    const detailsEl = html.find('.profession-details');
    detailsEl.html(`
      <h3>${this.sanitizeHTML(profession.name)}</h3>
      <p>${this.sanitizeHTML(profession.description)}</p>
      <div class="profession-attributes">
        <strong>Core Attribute:</strong> ${this.sanitizeHTML(profession.coreAttribute)}
      </div>
      <div class="profession-skills">
        <h4>Professional Skills:</h4>
        <ul>
          ${profession.professionalSkills.map(skill =>
            `<li>${this.sanitizeHTML(skill.name)}${skill.type ? ` (${this.sanitizeHTML(skill.type)})` : ''}${skill.requireType ? ' (Type Required)' : ''}</li>`
          ).join('')}
        </ul>
        <h4>Elective Skills (Choose ${profession.electiveSkills.count}):</h4>
        <ul>
          ${profession.electiveSkills.options.map(skill =>
            `<li>${this.sanitizeHTML(skill.name)}${skill.type ? ` (${this.sanitizeHTML(skill.type)})` : ''}${skill.requireType ? ' (Type Required)' : ''}</li>`
          ).join('')}
        </ul>
      </div>
      <div class="profession-resources">
        <p><strong>Resources:</strong> ${profession.resources} - ${this.sanitizeHTML(profession.resourceDesc)}</p>
        <p><strong>Ties:</strong> ${profession.ties} - ${this.sanitizeHTML(profession.tiesDesc)}</p>
      </div>
      <div class="profession-equipment">
        <h4>Starting Equipment:</h4>
        <ul>
          ${profession.equipment.map(item => `<li>${this.sanitizeHTML(item)}</li>`).join('')}
        </ul>
      </div>
    `);
  }

  updateUpbringingEffects(html, upbringing) {
    const config = UPBRINGING_CONFIG[upbringing];
    if (!config) return;

    const benefitSelect = html.find('.benefit-select');
    benefitSelect.prop('disabled', upbringing !== 'easy');

    if (upbringing === 'traumatic') {
      html.find('.burden-selection').show();
    } else {
      html.find('.burden-selection').hide();
    }
  }

  // In PathDialog class
  async _updateObject(event, formData) {
    // Ensure we're creating a valid path object
    const pathData = {
      profession: formData.profession || null,
      upbringing: formData.upbringing || null,
      easyBenefit: formData['easy-benefit'] || null
    };

    // Update character data with valid path
    if (!this.characterData.path) {
      this.characterData.path = pathData;
    } else {
      Object.assign(this.characterData.path, pathData);
    }

    // Base class handles validation, state saving, and navigation
    const result = await super._updateObject(event, formData);

    // Double check we have valid data before proceeding
    if (result && (!this.characterData.path?.profession || !this.characterData.path?.upbringing)) {
      ui.notifications.error("Invalid path data");
      return false;
    }

    return result;
  }
}
