// scripts/views/dialogs/skills-selection-dialog.js

import { DIALOG_DEFAULTS } from '../../config/defaults.js';
import { SKILL_AREAS, PROFESSION_SKILLS } from '../../config/skills.js';

export class SkillSelectionDialog extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      ...DIALOG_DEFAULTS,
      template: "modules/vestige-character-creator/templates/dialogs/skills-selection.html",
      title: "Select Skills",
      classes: [...DIALOG_DEFAULTS.classes, "skills-selection-dialog"]
    });
  }

  constructor(characterData, options = {}) {
    super(characterData, options);
    this.characterData = characterData;
    this.previousDialog = options.previousDialog;
  }

  async getData() {
    const profession = this.characterData.path.profession;
    const professionSkills = PROFESSION_SKILLS[profession];

    // Get skills from compendium
    const skillPack = game.packs.get("core100.skills");
    const allSkills = await skillPack.getDocuments();

    return {
      characterData: this.characterData,
      professionalSkills: professionSkills.professionalSkills,
      electiveSkills: professionSkills.electiveSkills,
      allSkills: allSkills
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Add type input handler
    html.find('.type-input').on('change', this._onTypeChange.bind(this));

    // Add back button handler
    html.find('button[name="back"]').on('click', () => {
      if (this.previousDialog) {
        this.previousDialog.render(true);
      }
      this.close();
    });
  }

  _onTypeChange(event) {
    const input = event.currentTarget;
    const required = input.dataset.required === 'true';

    if (required && !input.value.trim()) {
      input.classList.add('invalid');
    } else {
      input.classList.remove('invalid');
    }
  }


  async _updateObject(event, formData) {
    try {
      const profession = this.characterData.path.profession;
      const professionSkills = PROFESSION_SKILLS[profession];

      // Collect professional skills with their types
      const professionalSkills = professionSkills.professionalSkills.map(skill => {
        const type = formData[`type-${skill.name}`];
        return {
          name: skill.name,
          type: type || null
        };
      });

      // Collect elective skills with their types
      const electiveSkills = [];
      Object.entries(formData)
        .filter(([key]) => key.startsWith('elective-'))
        .forEach(([key, value]) => {
          if (value) {
            const skillName = key.replace('elective-', '');
            const type = formData[`type-${skillName}`];
            electiveSkills.push({
              name: skillName,
              type: type || null
            });
          }
        });

      // Validate skills
      const validation = this.validateSkills(professionalSkills, electiveSkills);
      if (!validation.valid) {
        ui.notifications.error(validation.error);
        return false;
      }

      // Update character data with professional and elective skills
      this.characterData.skills = {
        professional: professionalSkills.map(skill => ({
          name: skill.name,
          type: skill.type || null,
          requireType: skill.requireType || false
        })),
        elective: electiveSkills.map(skill => ({
          name: skill.name,
          type: skill.type || null,
          requireType: skill.requireType || false
        }))
      };

      // Proceed to the next dialog (e.g., Ties)
      const TiesDialog = (await import('./ties-dialog.js')).TiesDialog;
      new TiesDialog(this.characterData, {
        previousDialog: this
      }).render(true);

      return true;

    } catch (error) {
      console.error("Error processing skills:", error);
      ui.notifications.error("An error occurred while updating skills.");
      return false;
    }
  }

  validateSkills(professionalSkills, electiveSkills) {
    const profession = this.characterData.path.profession;
    const professionSkills = PROFESSION_SKILLS[profession];

    // Validate professional skills
    for (const required of professionSkills.professionalSkills) {
      const selected = professionalSkills.find(s => s.name === required.name);

      if (!selected) {
        return { valid: false, error: `Missing required skill: ${required.name}` };
      }

      if (required.requireType && !selected.type) {
        return { valid: false, error: `Type required for ${required.name}` };
      }
    }

    // Validate elective skills
    if (electiveSkills.length !== professionSkills.electiveSkills.count) {
      return { valid: false, error: `Must select ${professionSkills.electiveSkills.count} elective skills` };
    }

    // Validate elective options
    for (const skill of electiveSkills) {
      const option = professionSkills.electiveSkills.options.find(o => o.name === skill.name);
      if (!option) {
        return { valid: false, error: `${skill.name} is not a valid elective option` };
      }

      if (option.requireType && !skill.type) {
        return { valid: false, error: `Type required for elective skill ${skill.name}` };
      }
    }

    return { valid: true };
  }
}
