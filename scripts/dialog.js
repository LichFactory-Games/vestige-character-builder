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
      }
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

    html.find('.attribute-input').change(e => this._onAttributeChange(e));
    html.find('.roll-attributes').click(e => this._onRollAttributes(e));
    html.find('.use-array').click(e => this._onUseArray(e));
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
}
