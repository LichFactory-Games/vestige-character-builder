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
      if (!profession) {
        console.error("No profession found in character data");
        ui.notifications.error("Character profession not found");
        return false;
      }

      const professionSkills = PROFESSION_SKILLS[profession];
      if (!professionSkills) {
        console.error(`No skill configuration found for profession: ${profession}`);
        ui.notifications.error("Profession skill configuration not found");
        return false;
      }

      // Collect professional skills with their types
      const professionalSkills = [];
      for (const skill of professionSkills.professionalSkills) {
        const type = formData[`type-${skill.name}`];

        // Validate required skill types
        if (skill.requireType && !type) {
          console.error(`Missing required type for skill: ${skill.name}`);
          ui.notifications.error(`Please specify a type for ${skill.name}`);
          return false;
        }

        professionalSkills.push({
          name: skill.name,
          type: type || null,
          requireType: skill.requireType || false
        });
      }

      // Collect elective skills with their types
      const electiveSkills = [];
      const selectedElectives = Object.entries(formData)
            .filter(([key, value]) => key.startsWith('elective-') && value);

      // Validate number of elective selections
      if (selectedElectives.length !== professionSkills.electiveSkills.count) {
        console.error(`Invalid number of elective skills selected. Expected: ${professionSkills.electiveSkills.count}, Got: ${selectedElectives.length}`);
        ui.notifications.error(`Please select exactly ${professionSkills.electiveSkills.count} elective skills`);
        return false;
      }

      // Process elective skills
      for (const [key, value] of selectedElectives) {
        const skillName = key.replace('elective-', '');
        const type = formData[`type-${skillName}`];

        // Validate skill exists in options
        const skillOption = professionSkills.electiveSkills.options.find(o => o.name === skillName);
        if (!skillOption) {
          console.error(`Invalid elective skill selected: ${skillName}`);
          ui.notifications.error(`Invalid skill selection: ${skillName}`);
          return false;
        }

        // Validate required types for electives
        if (skillOption.requireType && !type) {
          console.error(`Missing required type for elective skill: ${skillName}`);
          ui.notifications.error(`Please specify a type for ${skillName}`);
          return false;
        }

        electiveSkills.push({
          name: skillName,
          type: type || null,
          requireType: skillOption.requireType || false
        });
      }

      // Final validation of all skills
      const validation = this.validateSkills(professionalSkills, electiveSkills);
      if (!validation.valid) {
        console.error("Skills validation error:", validation.error);
        ui.notifications.error(validation.error);
        return false;
      }

      // Update character data
      this.characterData.skills = {
        professional: professionalSkills,
        elective: electiveSkills
      };

      try {
        // Save state before proceeding
        await this.saveState();

        // Load and render next dialog
        const TiesDialog = (await import('./ties-dialog.js')).TiesDialog;
        new TiesDialog(this.characterData, {
          previousDialog: this
        }).render(true);

        return true;
      } catch (error) {
        console.error("Error proceeding to next dialog:", error);
        ui.notifications.error("Error saving progress. Please try again.");
        return false;
      }

    } catch (error) {
      console.error("Error processing skills:", error);
      ui.notifications.error("An error occurred while processing skills. Please try again.");
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
