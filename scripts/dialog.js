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
      this.character.profession.name = e.target.value;
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
    const newIndex = Math.max(0, Math.min(tabs.length - 1, currentIndex + direction));

    // Use Foundry's tab activation method directly
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


}
