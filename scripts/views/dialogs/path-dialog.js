// scripts/views/dialogs/path-dialog.js
import { DIALOG_DEFAULTS } from '../../config/defaults.js';
import { PROFESSIONS, validateProfessionRequirements } from '../../config/professions.js';
import { BENEFITS } from '../../config/benefits.js';
import { UPBRINGING_CONFIG } from '../../config/upbringing.js';


export class PathDialog extends FormApplication {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      ...DIALOG_DEFAULTS,
      template: "modules/vestige-character-creator/templates/dialogs/path.html",
      title: "Choose Your Path",
      classes: [...DIALOG_DEFAULTS.classes, "path-dialog"]
    });
  }

  constructor(characterData, options = {}) {
    super(characterData, options);
    this.characterData = characterData;
    this.previousDialog = options.previousDialog;
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
      }
    });

    // Upbringing change handler
    html.find('input[name="upbringing"]').change(event => {
      const upbringing = event.currentTarget.value;
      this.updateUpbringingEffects(html, upbringing);
    });
  }

  updateProfessionDetails(html, profession) {
    const detailsEl = html.find('.profession-details');
    detailsEl.html(`
      <h3>${profession.name}</h3>
      <p>${profession.description}</p>
      <div class="profession-attributes">
        <strong>Core Attribute:</strong> ${profession.coreAttribute}
      </div>
      <div class="profession-skills">
        <h4>Professional Skills:</h4>
        <ul>
          ${profession.professionalSkills.map(skill =>
            `<li>${skill.name}${skill.type ? ` (${skill.type})` : ''}${skill.requireType ? ' (Type Required)' : ''}</li>`
          ).join('')}
        </ul>
        <h4>Elective Skills (Choose ${profession.electiveSkills.count}):</h4>
        <ul>
          ${profession.electiveSkills.options.map(skill =>
            `<li>${skill.name}${skill.type ? ` (${skill.type})` : ''}${skill.requireType ? ' (Type Required)' : ''}</li>`
          ).join('')}
        </ul>
      </div>
      <div class="profession-resources">
        <p><strong>Resources:</strong> ${profession.resources} - ${profession.resourceDesc}</p>
        <p><strong>Ties:</strong> ${profession.ties} - ${profession.tiesDesc}</p>
      </div>
      <div class="profession-equipment">
        <h4>Starting Equipment:</h4>
        <ul>
          ${profession.equipment.map(item => `<li>${item}</li>`).join('')}
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
      // Show burden selection
      html.find('.burden-selection').show();
    } else {
      html.find('.burden-selection').hide();
    }
  }

  async _updateObject(event, formData) {
    try {
      // Validate selections
      if (!formData.profession || !formData.upbringing) {
        ui.notifications.error("Please select both profession and upbringing");
        return false;
      }

      // Validate profession requirements
      const validation = validateProfessionRequirements(this.characterData, formData.profession);
      if (!validation.valid) {
        ui.notifications.error(validation.error);
        return false;
      }

      // Update character data
      this.characterData.path = {
        profession: formData.profession,
        upbringing: formData.upbringing,
        easyBenefit: formData['easy-benefit'] || null
      };

      // Proceed to next dialog (Benefits & Burdens)
      const BenefitsBurdensDialog = (await import('./benefits-burdens-dialog.js')).BenefitsBurdensDialog;
      new BenefitsBurdensDialog(this.characterData, {
        previousDialog: this
      }).render(true);

      return true;
    } catch (error) {
      console.error("Error in PathDialog._updateObject:", error);
      ui.notifications.error("An error occurred. Please try again.");
      return false;
    }
  }
}


