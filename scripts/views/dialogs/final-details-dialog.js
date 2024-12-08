// scripts/views/dialogs/final-details-dialog.js

import { DIALOG_DEFAULTS } from '../../config/defaults.js';
import { PROFESSIONS } from '../../config/professions.js';
import { BENEFITS } from '../../config/benefits.js';
import { BURDENS } from '../../config/burdens.js';
import { validateAttributeValue } from '../../config/attributes.js';

export class FinalDetailsDialog extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      ...DIALOG_DEFAULTS,
      template: "modules/vestige-character-creator/templates/dialogs/final-details.html",
      title: "Final Details",
      classes: [...DIALOG_DEFAULTS.classes, "final-details-dialog"]
    });
  }

  constructor(characterData, options = {}) {
    super(characterData, options);
    this.characterData = characterData;
    this.previousDialog = options.previousDialog;
  }

  async getData() {
    return {
      characterData: this.characterData
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Add back button handler
    html.find('button[name="back"]').on('click', () => {
      if (this.previousDialog) {
        this.previousDialog.render(true);
      }
      this.close();
    });

    // Add save button handler
    html.find('button[name="save"]').on('click', this._onSave.bind(this));
  }

  async applyBenefitAndBurdenEffects() {
    try {
      // Get all benefits and burdens
      const allBenefits = [
        ...(this.characterData.benefits.starting || []),
        ...(this.characterData.benefits.purchased || [])
      ];
      const allBurdens = [
        ...(this.characterData.burdens.starting || []),
        ...(this.characterData.burdens.acquired || [])
      ];

      // Process benefits
      for (const benefitId of allBenefits) {
        const benefit = game.vestige.config.BENEFITS.find(b => b.id === benefitId);
        if (!benefit) continue;

        switch(benefitId) {
        case 'ironBody':
          // Add 1 Damage Resistance (DR)
          if (!this.characterData.attributes.secondary.dr) {
            this.characterData.attributes.secondary.dr = 0;
          }
          this.characterData.attributes.secondary.dr += 1;
          break;

        case 'ironWill':
          // +5 GRT
          this.characterData.attributes.secondary.grt += 5;
          break;

        case 'keenMind':
          // +5 INS
          this.characterData.attributes.primary.ins += 5;
          break;

        case 'peakPhysique':
          // Already handled during selection, but could add validation here
          break;

        case 'quickReflexes':
          // Add initiative bonus
          if (!this.characterData.attributes.secondary.initiative) {
            this.characterData.attributes.secondary.initiative = 0;
          }
          this.characterData.attributes.secondary.initiative += 1;
          break;
        }
      }

      // Process burdens
      for (const burdenId of allBurdens) {
        const burden = game.vestige.config.BURDENS.find(b => b.id === burdenId);
        if (!burden) continue;

        switch(burdenId) {
        case 'insecure':
          // -5 GRT
          this.characterData.attributes.secondary.grt -= 5;
          break;
          // Add other burden effects as needed
        }
      }

      // Recalculate secondary attributes after all modifications
      await this.calculateSecondaryAttributes();

    } catch (error) {
      console.error("Error applying benefits and burdens:", error);
      throw error;
    }
  }

  // Add helper method for secondary attribute calculation
  async calculateSecondaryAttributes() {
    const p = this.characterData.attributes.primary;
    const s = this.characterData.attributes.secondary;

    s.hlt = Math.floor(p.vgr / 5);
    s.grt = Math.floor((p.vgr + p.prs) / 5);
    s.poi = Math.floor((p.ins + s.grt) / 5);
  }

  getResourceBasedEquipment(resourceRating) {
    let equipment = [];

    if (resourceRating >= 80) {
      equipment.push("<p>- High-end electronics (latest smartphone, laptop, tablet)</p>");
      equipment.push("<p>- Luxury vehicle or multiple vehicles</p>");
      equipment.push("<p>- High-end living arrangements</p>");
      equipment.push("<p>- Premium quality gear and tools</p>");
    } else if (resourceRating >= 60) {
      equipment.push("<p>- Quality electronics (recent smartphone, laptop)</p>");
      equipment.push("<p>- Reliable vehicle</p>");
      equipment.push("<p>- Comfortable living arrangements</p>");
      equipment.push("<p>- Good quality gear and tools</p>");
    } else if (resourceRating >= 40) {
      equipment.push("<p>- Basic electronics (smartphone, basic laptop)</p>");
      equipment.push("<p>- Used vehicle or good public transport pass</p>");
      equipment.push("<p>- Modest living arrangements</p>");
      equipment.push("<p>- Standard gear and tools</p>");
    } else if (resourceRating >= 20) {
      equipment.push("<p>- Basic phone</p>");
      equipment.push("<p>- Public transport pass</p>");
      equipment.push("<p>- Shared or basic living arrangements</p>");
      equipment.push("<p>- Basic tools and equipment</p>");
    } else {
      equipment.push("<p>- Minimal possessions</p>");
      equipment.push("<p>- Relies on others or public resources</p>");
      equipment.push("<p>- Struggles with basic necessities</p>");
    }

    return equipment.join('');
  }

  async vestigeCreateActor() {
    try {
      // Collect data for benefits and burdens
      const allBenefits = [
        ...(this.characterData.benefits.starting || []),
        ...(this.characterData.benefits.purchased || [])
      ];
      const allBurdens = [
        ...(this.characterData.burdens.starting || []),
        ...(this.characterData.burdens.acquired || [])
      ];

      // Apply effects that modify attributes, if any
      await this.applyBenefitAndBurdenEffects();

      // Ensure attributes are within valid bounds
      Object.entries(this.characterData.attributes.primary).forEach(([key, value]) => {
        if (value > 80) {
          ui.notifications.warn(`${key.toUpperCase()} exceeded 80, capping at maximum`);
          this.characterData.attributes.primary[key] = 80;
        }
      });

      // Recalculate secondary attributes
      await this.calculateSecondaryAttributes();

      // Initialize ties if needed
      if (!this.characterData.ties) {
        this.characterData.ties = {
          assigned: [],
          totalPoints: 0,
          remaining: 0
        };
      }

      // Create actor data
      const actorData = {
        name: this.characterData.name || this.characterData.personalHistory?.identity || "New Character",
        type: "character",
        prototypeToken: {
          name: this.characterData.name || this.characterData.personalHistory?.identity || "New Character"
        },
        system: {
          // Primary attributes
          // Primary attributes with proper structure
          primaryAttributes: {
            vgr: { value: this.characterData.attributes.primary.vgr, label: "Vigor" },
            grc: { value: this.characterData.attributes.primary.grc, label: "Grace" },
            ins: { value: this.characterData.attributes.primary.ins, label: "Insight" },
            prs: { value: this.characterData.attributes.primary.prs, label: "Presence" }
          },

          // Secondary attributes
          derivedAttributes: {
            hlt: { value: 0, max: 0, label: "Health" },
            wds: { value: 0, max: 0, label: "Wounds" },
            grt: { value: 0, max: 0, label: "Grit" },
            poi: { value: 0, max: 0, label: "Poise" }
          },

          // Equipment
          equipment: `
          <div class="equipment-section">
            <div class="resource-rating">
              <h3>Resource Rating: ${this.characterData.resources}</h3>
            </div>
            <div class="starting-equipment">
              <h3>Starting Equipment:</h3>
              <p>${PROFESSIONS[this.characterData.path.profession].equipment}</p>
            </div>
            <div class="additional-equipment">
              <h3>Additional Equipment based on Resource Rating (${this.characterData.resources}):</h3>
              ${this.getResourceBasedEquipment(this.characterData.resources)}
            </div>
          </div>
        `,

          // Notes
          notes: `
          <div class="character-notes">
            <h3>Character Background</h3>
            <p><strong>Profession:</strong> ${PROFESSIONS[this.characterData.path.profession].name}</p>
            <p><strong>Upbringing:</strong> ${this.characterData.path.upbringing}</p>

            <h3>Ties</h3>
            ${this.characterData.ties.assigned.map(tie =>
              `<p>- ${this.sanitizeHTML(tie.name)} (${tie.type}, Strength: ${tie.strength})</p>`
            ).join('') || "No ties assigned"}

            <h3>Benefits</h3>
            ${allBenefits.map(id => {
              const benefit = BENEFITS.find(b => b.id === id);
              return benefit ? `<p>- <strong>${benefit.name}:</strong> ${benefit.desc}</p>` : '';
            }).join('')}

            <h3>Burdens</h3>
            ${allBurdens.map(id => {
              const burden = BURDENS.find(b => b.id === id);
              return burden ? `<p>- <strong>${burden.name}:</strong> ${burden.desc}</p>` : '';
            }).join('')}
          </div>
        `,

          // Biography
          biography: `
          <div class="character-biography">
            <p><strong>Age:</strong> ${this.characterData.details.age}</p>
            <p><strong>Gender:</strong> ${this.sanitizeHTML(this.characterData.details.gender)}</p>
            <p><strong>Description:</strong> ${this.sanitizeHTML(this.characterData.details.description)}</p>
            <p><strong>Memories:</strong> ${this.sanitizeHTML(this.characterData.details.memories)}</p>
          </div>
        `,

          path: {
            profession: this.characterData.path.profession,
            upbringing: this.characterData.path.upbringing
          }
        }
      };

      // Validate name
      if (!actorData.name) {
        ui.notifications.error("Character must have a name");
        return false;
      }

      // Create the actor first
      ui.notifications.info("Creating character...");
      const actor = await Actor.create(actorData);
      console.log("Derived Attributes:", actor.system.derivedAttributes);


      if (!actor) {
        throw new Error("Failed to create actor");
      }

      // Now add skills to the created actor
      ui.notifications.info("Adding skills...");
      const professionalSkills = this.characterData.skills.professional || [];
      const electiveSkills = this.characterData.skills.elective || [];
      const allSkills = [...professionalSkills, ...electiveSkills];

      for (const skillData of allSkills) {
        try {
          const isTypeSkill = skillData.name.includes("(Type)") || skillData.requireType === true;

          const itemData = {
            name: skillData.type ? `${skillData.name} (${skillData.type})` : skillData.name,
            type: "skill",
            img: "icons/svg/book.svg",
            system: {
              area: this.getSkillArea(skillData.name),
              governing: this.getGoverningAttribute(skillData.name),
              difficulty: "average",
              successNumber: 0,
              epBonus: 0,
              specializations: [],
              hasAdvantage: false,
              description: "",
              isType: isTypeSkill,
              possibleTypes: [],
              isPrerequisite: false,
              prerequisites: []
            }
          };

          await actor.createEmbeddedDocuments("Item", [itemData]);
        } catch (error) {
          console.warn(`Failed to add skill ${skillData.name}:`, error);
        }
      }

      // Show completion dialog
      await Dialog.prompt({
        title: "Character Created!",
        content: `
        <div style="text-align: center;">
          <h2 style="color: #4CAF50;">${this.characterData.name} Created Successfully!</h2>
          <p>Your character sheet has been populated with:</p>
          <ul style="list-style: none; padding: 0;">
            <li>✓ Attributes & Derived Statistics</li>
            <li>✓ Equipment & Resources (RR: ${this.characterData.resources})</li>
            <li>✓ Biographical Information</li>
            <li>✓ Professional Skills</li>
            <li>✓ Ties & Relationships</li>
            <li>✓ Benefits & Burdens</li>
          </ul>
          <p style="margin-top: 20px;">You can now find your character in the Actors Directory.</p>
        </div>
      `,
        label: "OK",
        callback: () => true
      });

      return true;

    } catch (error) {
      console.error("Error creating character:", error);
      ui.notifications.error("Error creating character sheet. Please try again.");
      return false;
    }
  }

  // Helper methods to add to the class:
  getSkillArea(skillName) {
    // Map skill names to their areas based on your configuration
    const skillAreaMap = {
      "Observation": "attention",
      "Surveillance": "attention",
      "Navigation": "fieldcraft",
      "Concealment": "fieldcraft",
      "Search": "attention",
      "Ranged Combat": "martial",
      "Pilot": "operation",
      "Endurance": "athletics",
      "Close Combat": "martial",
      "Deception": "interpersonal",
      "Evasion": "athletics",
      "Kinesics": "attention",
      "Profiling": "attention",
      "Tactics": "education",
      "Analysis": "attention",
      "Research": "education",
      "Science": "education",
      "Languages": "education",
      "Humanities": "education",
      "Computer Use": "operation",
      "Administration": "education",
      "Cryptography": "education",
      "Electronics": "materialCrafts",
      "Forensics": "attention",
      "Occultism": "spiritual",
      "Religion": "spiritual",
      "Trauma Care": "medicine",
      "Medical Equipment": "medicine",
      "Psychiatry": "medicine",
      "Laboratory Equipment": "operation",
      "Security Systems": "operation",
      "Maintenance/Repair": "materialCrafts",
      "Fabrication": "materialCrafts",
      "Robotics": "materialCrafts"
    };

    // Extract base skill name without type
    const baseName = skillName.split('(')[0].trim();
    return skillAreaMap[baseName] || "education"; // Default to education if not found
  }

  getGoverningAttribute(skillName) {
    // Map skills to their governing attributes
    const governingMap = {
      // Vigor-based skills
      "Endurance": "vgr",

      // Grace-based skills
      "Pilot": "grc",
      "Evasion": "grc",
      "Close Combat": "grc",
      "Ranged Combat": "grc",

      // Insight-based skills
      "Observation": "ins",
      "Search": "ins",
      "Analysis": "ins",
      "Research": "ins",
      "Science": "ins",
      "Forensics": "ins",
      "Profiling": "ins",

      // Presence-based skills
      "Deception": "prs",
      "Administration": "prs",
      "Psychiatry": "prs"
    };

    // Extract base skill name without type
    const baseName = skillName.split('(')[0].trim();
    return governingMap[baseName] || "ins"; // Default to insight if not found
  }

  
  // Helper methods for validation and sanitization
  validateCharacterData() {
    if (!this.characterData) {
      console.error('No character data found');
      return false;
    }

    if (!this.characterData.attributes?.primary) {
      console.error('No primary attributes found:', this.characterData);
      return false;
    }

    const requiredAttrs = ['vgr', 'grc', 'ins', 'prs'];
    const missingAttrs = requiredAttrs.filter(attr =>
      typeof this.characterData.attributes.primary[attr] !== 'number'
    );

    if (missingAttrs.length > 0) {
      console.error('Missing attributes:', missingAttrs);
      return false;
    }

    return true;
  }

  // Helper function for sanitizing HTML (if necessary)
  sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async _onSave(event) {
    const formData = new FormData(event.target.closest('form'));

    // Get the character name
    const characterName = formData.get('identity') || this.characterData.name;
    if (!characterName) {
      ui.notifications.error("Please provide a character name");
      return false;
    }

    // Update character name
    this.characterData.name = characterName;

    // Initialize details if it doesn't exist
    this.characterData.details = {
      age: formData.get('age') || '',
      gender: formData.get('gender') || '',
      description: formData.get('appearance') || '', // Using appearance as description
      memories: `${formData.get('memory-cling-to') || ''}\n\n${formData.get('memory-forget') || ''}`
    };

    const personalHistory = {
      identity: formData.get('identity'),
      appearance: formData.get('appearance'),
      origins: formData.get('origins'),
      community: formData.get('community'),
      motivation: formData.get('motivation')
    };

    const memories = {
      memoryClingTo: formData.get('memory-cling-to'),
      memoryForget: formData.get('memory-forget')
    };

    const additionalConsiderations = {
      personalTraits: formData.get('personal-traits'),
      possessions: formData.get('possessions'),
      beliefs: formData.get('beliefs'),
      technology: formData.get('technology'),
      survival: formData.get('survival'),
      ambitions: formData.get('ambitions')
    };

    // Update the character data
    this.characterData.personalHistory = personalHistory;
    this.characterData.memories = memories;
    this.characterData.additionalConsiderations = additionalConsiderations;

    // Now, create the actor with the saved character data
    const creationSuccess = await this.vestigeCreateActor();

    // Handle post-creation steps
    if (creationSuccess) {
      ui.notifications.info("Character successfully created!");
      this.close();  // Close the dialog after creation
    } else {
      ui.notifications.error("Error creating character. Please try again.");
    }
  }

  // Optional validation or final update function
  async _updateObject(event, formData) {
    // This could be used for any last-minute checks or custom logic if needed
    return true;
  }
}
