// scripts/views/dialogs/attribute-dialog.js

import { BaseDialog } from './base-dialog.js';
import { calculateSecondaryAttributes, validateAttributeValue, ATTRIBUTES } from '../../config/attributes.js';
import { PathDialog } from './path-dialog.js';

export class AttributeDialog extends BaseDialog {
  constructor(data = {}, options = {}) {
    super(data, {
      ...options,
      nextDialogClass: PathDialog,
      validationRules: [
        (data) => ({
          valid: !Object.values(data.attributes.primary).some(v => v === 0),
          error: "Please set all attributes before continuing"
        })
      ]
    });

    // Initialize character data if not present
    if (!this.characterData.attributes) {
      this.characterData.attributes = {
        primary: { vgr: 0, grc: 0, ins: 0, prs: 0 },
        secondary: { hlt: 0, wds: 0, grt: 0, poi: 0 }
      };
    }

    // Bind methods
    this._onRollAttributes = this._onRollAttributes.bind(this);
    this._onUseArray = this._onUseArray.bind(this);
    this._onAttributeChange = this._onAttributeChange.bind(this);
    this._onNameChange = this._onNameChange.bind(this);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/vestige-character-creator/templates/dialogs/attributes.html",
      title: "Character Attributes",
      classes: ["vestige", "dialog", "attribute-dialog"]
    });
  }

  getData() {
    return {
      name: this.characterData.name,
      attributes: ATTRIBUTES.primary,
      values: this.characterData.attributes.primary,
      secondary: this.characterData.attributes.secondary,
      array: ATTRIBUTES.array
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('button[name="roll"]').click(this._onRollAttributes);
    html.find('button[name="array"]').click(this._onUseArray);
    html.find('input[type="number"]').change(this._onAttributeChange);
    html.find('input[name="name"]').change(this._onNameChange);
  }

  async _onRollAttributes(event) {
    event.preventDefault();

    await this.handleAsyncOperation(async () => {
      for (const key of Object.keys(this.characterData.attributes.primary)) {
        const roll = new Roll("4d10+30");
        await roll.evaluate();
        this.characterData.attributes.primary[key] = roll.total;
      }
      this._updateSecondaryAttributes();
      this.saveState();
      this.render();
    }, "Error rolling attributes");
  }

  _onAttributeChange(event) {
    const input = event.currentTarget;
    const attr = input.name;
    const value = validateAttributeValue(input.value);
    this.characterData.attributes.primary[attr] = value;
    this._updateSecondaryAttributes();
    this.saveState();
  }

  async _onUseArray(event) {
    event.preventDefault();

    const content = `
      <form>
        ${Object.entries(ATTRIBUTES.primary).map(([key, attr]) => `
          <div class="form-group">
          <label>${attr.name} (${key.toUpperCase()})</label>
          <select name="${key}" required>
          <option value="">Select Value</option>
          ${ATTRIBUTES.array.map(value =>
            `<option value="${value}">${value}</option>`
          ).join('')}
    </select>
      </div>
      `).join('')}
      </form>
    `;

    const dialog = new Dialog({
      title: "Assign Attribute Values",
      content,
      buttons: {
        confirm: {
          label: "Confirm",
          callback: async (html) => {
            const result = await this.handleAsyncOperation(async () => {
              const selections = {};
              const usedValues = [];

              for (const key of Object.keys(ATTRIBUTES.primary)) {
                const value = parseInt(html.find(`select[name="${key}"]`).val());
                if (!value) {
                  throw new Error("All attributes must be assigned a value");
                }
                if (value !== 50 && usedValues.includes(value)) {
                  throw new Error("Each value (except 50) can only be used once");
                }
                selections[key] = value;
                usedValues.push(value);
              }

              Object.assign(this.characterData.attributes.primary, selections);
              this._updateSecondaryAttributes();
              await this.saveState();
              this.render();
              return true;
            }, "Error assigning attributes");

            return result;
          }
        },
        cancel: {
          label: "Cancel"
        }
      },
      default: "confirm"
    });

    dialog.render(true);
  }

  _onNameChange(event) {
    this.characterData.name = event.currentTarget.value.trim();
    this.saveState();
  }

  _updateSecondaryAttributes() {
    this.characterData.attributes.secondary = calculateSecondaryAttributes(
      this.characterData.attributes.primary
    );
  }

  async _updateObject(event, formData) {
    // Base class handles validation and navigation
    return super._updateObject(event, formData);
  }
}
