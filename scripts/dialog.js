// dialog.js
import { CHARACTER_DATA } from "./config/data.js";

export class CharacterCreatorDialog extends FormApplication {
  constructor(options = {}) {
  super(options);
    this.character = {
      attributes: {
        primary: {
          vgr: 50,
          grc: 50,
          ins: 50,
          prs: 50
        },
        secondary: {}
      },
      profession: {
        name: null,
        skills: {
          professional: [],
          elective: []
        }
      },
      upbringing: {
        type: null,    // for storing easy/average/traumatic
        benefits: [],
        burdens: []
      },
      ties: {
        remaining: 100,
        entries: []
      },
      details: {}

    };
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["vestige", "creator-dialog"],
      template: "modules/vestige-character-creator/templates/char-template.html",
      width: 600,
      height: 800,
      title: "Create Character",
      resizable: true,
      tabs: [{
        navSelector: ".tabs",
        contentSelector: ".content",
        initial: "attributes"
      }]
    });
  }

  getData() {
    return {
      character: this.character,
      config: CHARACTER_DATA
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    console.log('Tabs:', this._tabs);

    // Navigation
    html.find('.prev-step').click(() => {
      console.log('Previous clicked', this._tabs);
      this._onNavigate(-1);
    });

    html.find('.next-step').click(() => {
      console.log('Next clicked', this._tabs);
      this._onNavigate(1);
    });

    // Attributes
    html.find('.attribute-input').change(e => this._onAttributeChange(e));
    html.find('.roll-attributes').click(e => this._onRollAttributes(e));
    html.find('.use-array').click(e => this._onUseArray(e));

    // Path
    html.find('select[name="profession.name"]').change(e => {
      const professionKey = e.target.value;
      this.character.profession.name = professionKey;

      // Get profession data from CONFIG
      const professionData = CHARACTER_DATA.professions[professionKey];

      // Initialize skills arrays
      this.character.profession.skills = {
        professional: professionData.professionalSkills.map(skill => ({
          name: skill.name,
          type: skill.type || null
        })),
        elective: [] // Will be populated when elective skills are chosen
      };

      console.log("Updated profession skills:", this.character.profession.skills);

      this.render();
    });
    html.find('input[name="skills.elective"]').change(e => {
      const checkedBoxes = html.find('input[name="skills.elective"]:checked');
      const maxElectives = CHARACTER_DATA.professions[this.character.profession.name].electiveSkills.count;

      if (checkedBoxes.length > maxElectives) {
        e.preventDefault();
        e.target.checked = false;
        return;
      }

      // Update elective skills array with skill names
      this.character.profession.skills.elective = Array.from(checkedBoxes).map(cb => cb.value);

      console.log("Updated elective skills:", this.character.profession.skills.elective);

      this.render();
    });

    html.find('input[name="upbringing.type"]').change(e => {
      this.character.upbringing.type = e.target.value;
      this.render();
    });
    html.find('input[name="upbringing.benefits"]').change(e => {
      const maxCount = this.getUpbringingBenefitsCount();
      const checkedBoxes = html.find('input[name="upbringing.benefits"]:checked');

      if (checkedBoxes.length > maxCount) {
        e.preventDefault();
        e.target.checked = false;
        return;
      }

      this.character.upbringing = this.character.upbringing || {};
      this.character.upbringing.benefits = Array.from(checkedBoxes).map(cb => cb.value);
      this.render();
    });
    html.find('input[name="upbringing.burdens"]').change(e => {
      const maxCount = this.getUpbringingBurdensCount();
      const checkedBoxes = html.find('input[name="upbringing.burdens"]:checked');

      if (checkedBoxes.length > maxCount) {
        e.preventDefault();
        e.target.checked = false;
        return;
      }
      this.character.upbringing = this.character.upbringing || {};
      this.character.upbringing.burdens = Array.from(checkedBoxes).map(cb => cb.value);
      this.render();
    });

    // Ties
    html.find('input.tie-strength').change(e => {
      // Ensure ties array exists
      this.character.ties.entries = this.character.ties.entries || [];

      // Get all tie inputs
      const tieInputs = Array.from(html.find('.tie-entry')).map(entry => ({
        name: entry.querySelector('input[name*=".name"]').value,
        desc: entry.querySelector('input[name*=".desc"]').value,
        strength: parseInt(entry.querySelector('input.tie-strength').value) || 0
      }));

      // Update character ties data
      this.character.ties.entries = tieInputs;

      // Calculate total spent and remaining
      const totalSpent = tieInputs.reduce((sum, tie) => sum + tie.strength, 0);
      const totalAvailable = this.character.attributes.primary.prs * 2;
      this.character.ties.remaining = totalAvailable - totalSpent;

      this.render();
    });

  }

  _onNavigate(direction) {
  const tabs = ['attributes', 'path', 'skills', 'ties', 'details'];
  const currentTab = this._tabs[0].active;
  const currentIndex = tabs.indexOf(currentTab);

  // If we're on details tab and trying to go forward
  if (currentTab === 'details' && direction > 0) {
    new Dialog({
      title: "Create Character",
      content: "<p>Do you want to create this character?</p>",
      buttons: {
        yes: {
          icon: '<i class="fas fa-check"></i>',
          label: "Yes",
          callback: () => this._createActor()
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "No"
        }
      },
      default: "yes"
    }).render(true);
    return;
  }

  // Normal navigation for other tabs
  const newIndex = Math.max(0, Math.min(tabs.length - 1, currentIndex + direction));
  this._tabs[0].activate(tabs[newIndex], {triggerCallback: true});
  }

  _onAttributeChange(event) {
    const input = event.currentTarget;
    const attribute = input.name.split('.').pop();
    const value = this._validateAttributeValue(input.value);

    this.character.attributes.primary[attribute] = value;
    this._updateSecondaryAttributes();
    this.render();
  }

  async _onRollAttributes(event) {
    event.preventDefault();
    try {
      console.log("Starting attribute rolls...");

      for (const key of Object.keys(this.character.attributes.primary)) {
        console.log(`Rolling for ${key}...`);
        const roll = new Roll("4d10+30");
        await roll.evaluate();
        const total = roll.total;
        console.log(`Rolled ${total} for ${key}`);
        this.character.attributes.primary[key] = total;

        // Show roll in chat (optional)
        await roll.toMessage({
          flavor: `Rolling ${key.toUpperCase()}`
        });
      }

      console.log("Updating secondary attributes...");
      this._updateSecondaryAttributes();

      console.log("Current character state:", this.character);
      this.render(true);  // Force render
    } catch (error) {
      console.error("Error rolling attributes:", error);
      ui.notifications.error("Error rolling attributes");
    }
  }

  _onUseArray(event) {
    event.preventDefault();

    const array = CHARACTER_DATA.attributeArray;

    new Dialog({
      title: "Assign Attribute Values",
      content: this._getArrayAssignmentHTML(array),
      buttons: {
        assign: {
          label: "Assign",
          callback: html => this._handleArrayAssignment(html)
        },
        cancel: {
          label: "Cancel"
        }
      }
    }).render(true);
  }

  _validateAttributeValue(value) {
    const num = parseInt(value);
    return isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
  }

  _updateSecondaryAttributes() {
    const primary = this.character.attributes.primary;
    this.character.attributes.secondary = CHARACTER_DATA.calculateSecondary(primary);
    // Update ties remaining based on PRS
    this.character.ties.remaining = primary.prs * 2;
  }

  _getArrayAssignmentHTML(array) {
    const attrs = CHARACTER_DATA.attributes.primary;
    return `
      <form>
        <p>Assign these values: ${array.join(", ")}</p>
        ${Object.entries(attrs).map(([key, attr]) => `
      <div class="form-group">
      <label>${attr.label} (${key.toUpperCase()})</label>
      <select name="${key}">
      <option value="">Select Value</option>
      ${array.map(v => `<option value="${v}">${v}</option>`).join("")}
    </select>
      </div>
      `).join("")}
      </form>
    `;
  }

  _handleArrayAssignment(html) {
    const selections = new FormData(html[0].querySelector("form"));
    const values = {};
    const used = new Set();

    for (const [attr, value] of selections.entries()) {
      if (!value) {
        ui.notifications.error("All attributes must be assigned a value");
        return;
      }
      if (value !== "50" && used.has(value)) {
        ui.notifications.error("Each value (except 50) can only be used once");
        return;
      }
      values[attr] = parseInt(value);
      used.add(value);
    }

    Object.assign(this.character.attributes.primary, values);
    this._updateSecondaryAttributes();
    this.render();
  }

  getUpbringingBenefitsCount() {
    const upbringing = this.character?.upbringing?.type;
    if (!upbringing) return 0;

    // Access benefits either from effects or directly
    const upbringingData = CHARACTER_DATA.upbringing.types[upbringing];
    return upbringingData?.effects?.benefits?.count || upbringingData?.benefits?.count || 0;
  }

  getUpbringingBurdensCount() {
    const upbringing = this.character?.upbringing?.type;
    if (!upbringing) return 0;

    const upbringingData = CHARACTER_DATA.upbringing.types[upbringing];
    return upbringingData?.burdens?.count || 0;
  }

  // Create Actor ///
  //////////////////
  async _createActor() {
    try {
      // Format benefits and burdens lists
      const benefitsList = this.character.upbringing.benefits.map(id => {
        const benefit = CHARACTER_DATA.benefits.list.find(b => b.id === id);
        return benefit ? `<p>- <strong>${benefit.name}:</strong> ${benefit.desc}</p>` : '';
      }).join('');

      const burdensList = this.character.upbringing.burdens.map(id => {
        const burden = CHARACTER_DATA.burdens.list.find(b => b.id === id);
        return burden ? `<p>- <strong>${burden.name}:</strong> ${burden.desc}</p>` : '';
      }).join('');


      // Format ties list
      const tiesList = this.character.ties.entries.map(tie =>
        `<p>- ${tie.name} (Strength: ${tie.strength})</p>`
      ).join('');

      const actorData = {
        name: this.character.details.identity || "New Character",
        type: "character",
        system: {
          // Primary attributes
          primaryAttributes: {
            vgr: { value: this.character.attributes.primary.vgr, label: "Vigor" },
            grc: { value: this.character.attributes.primary.grc, label: "Grace" },
            ins: { value: this.character.attributes.primary.ins, label: "Insight" },
            prs: { value: this.character.attributes.primary.prs, label: "Presence" }
          },
          // Secondary attributes
          derivedAttributes: {
            hlt: { value: this.character.attributes.secondary.hlt, max: this.character.attributes.secondary.hlt, label: "Health" },
            wds: { value: this.character.attributes.secondary.wds, max: this.character.attributes.secondary.wds, label: "Wounds" },
            grt: { value: this.character.attributes.secondary.grt, max: this.character.attributes.secondary.grt, label: "Grit" },
            poi: { value: this.character.attributes.secondary.poi, max: this.character.attributes.secondary.poi, label: "Poise" }
          },

          // Equipment section
          equipment: `
      <div class="equipment-section">
        <h3>Resource Rating: ${CHARACTER_DATA.professions[this.character.profession.name].resources}</h3>
        <h3>Starting Equipment</h3>
        <ul>
          ${CHARACTER_DATA.professions[this.character.profession.name].equipment.map(item =>
            `<li>${item}</li>`
          ).join('')}
        </ul>
      </div>
    `,

          /// Resources
          resources: CHARACTER_DATA.professions[this.character.profession.name].resources,

          // Notes section with background info
          notes: `
          <div class="character-background">
            <h3>Background</h3>
            <p><strong>Profession:</strong> ${this.character.profession.name}</p>
            <p><strong>Upbringing:</strong> ${this.character.upbringing.type}</p>

            <h3>Benefits</h3>
            ${benefitsList}

            <h3>Burdens</h3>
            ${burdensList}

            <h3>Ties</h3>
            ${tiesList}
          </div>
        `,
          // Biography section with personal details
          biography: `
          <div class="character-details">
            <p><strong>Appearance:</strong> ${this.character.details.appearance || ""}</p>
            <p><strong>Origins:</strong> ${this.character.details.origins || ""}</p>
            <h3>Memories</h3>
            <p><strong>A Memory You Cling To:</strong> ${this.character.details.memoryClingTo || ""}</p>
            <p><strong>A Memory You'd Rather Forget:</strong> ${this.character.details.memoryForget || ""}</p>
            <h3>Additional Details</h3>
            <p><strong>Personal Traits:</strong> ${this.character.details.traits || ""}</p>
            <p><strong>Beliefs:</strong> ${this.character.details.beliefs || ""}</p>
            <p><strong>Technology:</strong> ${this.character.details.technology || ""}</p>
          </div>
        `
        }
      };

      // Create the actor
      const actor = await Actor.create(actorData);

      console.log("Actor created:", actor);


      if (!actor) {
        throw new Error("Failed to create actor");
      }

      // Get skills from compendium
      const skillPack = game.packs.get("core100.skills");
      console.log("Skill pack:", skillPack);

      const allSkills = await skillPack.getDocuments();
      console.log("Compendium skills:", allSkills);


      // Debug log character skills
      console.log("Character professional skills:", this.character.profession.skills.professional);
      console.log("Character elective skills:", this.character.profession.skills.elective);


      // Create skill items for both professional and elective skills
      const skillsToCreate = [];

      // Process professional skills
      for (const skill of this.character.profession.skills.professional) {
        const compendiumSkill = allSkills.find(s => s.name === skill.name);
        console.log("Found compendium skill for", skill.name, ":", compendiumSkill);

        if (compendiumSkill) {
          const skillData = {
            name: skill.type ? `${skill.name} (${skill.type})` : skill.name,
            type: "skill",
            img: "icons/svg/book.svg",
            system: {
              area: compendiumSkill.system.area,
              governing: compendiumSkill.system.governing,
              difficulty: compendiumSkill.system.difficulty,
              description: compendiumSkill.system.description,
              successNumber: 0, // This will be calculated by the system
              specializations: []
            }
          };
          skillsToCreate.push(skillData);
        }
      }

      console.log("Skills to create:", skillsToCreate);


      // Process elective skills
      // Process elective skills
for (const skillName of this.character.profession.skills.elective) {
  const compendiumSkill = allSkills.find(s => s.name === skillName);
  if (compendiumSkill) {
    const skillData = {
      name: skillName,
      type: "skill",
      img: "icons/svg/book.svg",
      system: {
        area: compendiumSkill.system.area,
        governing: compendiumSkill.system.governing,
        difficulty: compendiumSkill.system.difficulty,
        description: compendiumSkill.system.description,
        successNumber: 0,
        specializations: []
      }
    };
    skillsToCreate.push(skillData);
  }
}

      // Create all skills as embedded items
      if (skillsToCreate.length > 0) {
        const createdSkills = await actor.createEmbeddedDocuments("Item", skillsToCreate);
        console.log("Created skills:", createdSkills);
      }


      // Show success dialog
      await Dialog.prompt({
        title: "Character Created!",
        content: `
        <div style="text-align: center;">
          <h2>${actorData.name} Created Successfully!</h2>
          <p>Your character has been created with all attributes, background, and personal details.</p>
          <p>You can find your character in the Actors Directory.</p>
        </div>
      `,
        label: "OK"
      });

      this.close();
      return true;

    } catch (error) {
    console.error("Error creating character:", error);
    ui.notifications.error("Error creating character sheet. Please try again.");
    return false;
  }
}
  
}
