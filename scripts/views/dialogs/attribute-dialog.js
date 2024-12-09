import { DIALOG_DEFAULTS } from '../../config/defaults.js';
import { handleValidationError } from '../../config/utils.js';
import { calculateSecondaryAttributes, validateAttributeValue, ATTRIBUTES } from '../../config/attributes.js';

export class AttributeDialog extends FormApplication {
  constructor(data = {}, options = {}) {
    super(data, options);
    this.characterData = data.characterData || {
      name: "",
      attributes: {
        primary: { vgr: 0, grc: 0, ins: 0, prs: 0 },
        secondary: { hlt: 0, wds: 0, grt: 0, poi: 0 }
      }
    };

    this._onRollAttributes = this._onRollAttributes.bind(this);
    this._onUseArray = this._onUseArray.bind(this);
    this._onAttributeChange = this._onAttributeChange.bind(this);
    this._onNameChange = this._onNameChange.bind(this);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      ...DIALOG_DEFAULTS,
      template: "modules/vestige-character-creator/templates/dialogs/attributes.html",
      title: "Character Attributes",
      classes: [...DIALOG_DEFAULTS.classes, "attribute-dialog"]
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
    html.find('button[name="roll"]').click(this._onRollAttributes.bind(this));
    html.find('button[name="array"]').click(this._onUseArray.bind(this));
    html.find('input[type="number"]').change(this._onAttributeChange.bind(this));
    html.find('input[name="name"]').change(this._onNameChange.bind(this));
  }

  async _onRollAttributes(event) {
    event.preventDefault();
    for (const key of Object.keys(this.characterData.attributes.primary)) {
      // Create and evaluate the roll synchronously in separate steps
      const roll = new Roll("4d10+30");
      await roll.evaluate(); // Use await with evaluate() instead of evaluateSync()
      this.characterData.attributes.primary[key] = roll.total;
    }
    this._updateSecondaryAttributes();
    this.render();
  }

  _onAttributeChange(event) {
    const input = event.currentTarget;
    const attr = input.name;
    const value = validateAttributeValue(input.value);
    this.characterData.attributes.primary[attr] = value;
    this._updateSecondaryAttributes();
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
          callback: (html) => {
            const selections = {};
            const usedValues = [];

            // Collect and validate selections
            for (const key of Object.keys(ATTRIBUTES.primary)) {
              const value = parseInt(html.find(`select[name="${key}"]`).val());
              if (!value) return ui.notifications.error("All attributes must be assigned a value");
              if (value !== 50 && usedValues.includes(value)) {
                return ui.notifications.error("Each value (except 45) can only be used once");
              }
              selections[key] = value;
              usedValues.push(value);
            }

            // Apply valid selections
            Object.assign(this.characterData.attributes.primary, selections);
            this._updateSecondaryAttributes();
            this.render();
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
  }

  _updateSecondaryAttributes() {
    this.characterData.attributes.secondary = calculateSecondaryAttributes(this.characterData.attributes.primary);
  }

  async _updateObject(event, formData) {
    // Validate attributes have been set
    const hasZeroAttributes = Object.values(this.characterData.attributes.primary)
          .some(value => value === 0);
    if (hasZeroAttributes) {
      return handleValidationError("Please set all attributes before continuing");
    }

    // Transition to PathDialog
    const PathDialog = (await import('./path-dialog.js')).PathDialog;
    new PathDialog(this.characterData, {
      previousDialog: this
    }).render(true);

    // Close this dialog
    this.close();
    return true;
  }

}
