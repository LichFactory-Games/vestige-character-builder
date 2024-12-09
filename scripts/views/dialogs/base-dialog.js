// scripts/views/dialogs/base-dialog.js
export class BaseDialog extends FormApplication {
  constructor(data = {}, options = {}) {
    super(data, options);
    this.characterData = data.characterData || {};
    this.previousDialog = options.previousDialog;
    this.nextDialogClass = options.nextDialogClass;
    this.validationRules = options.validationRules || [];
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/vestige-character-creator/templates/dialogs/base-dialog.html",
      title: "Base Dialog",
      classes: ["base-dialog"],
      width: 600,
      height: 700,
      resizable: true
    });
  }

  // Common navigation methods
  async back() {
    if (this.previousDialog) {
      // Store current state before going back
      await this.saveState();
      this.previousDialog.render(true);
      this.close();
    }
  }

  async next() {
    if (this.nextDialogClass) {
      // Store current state before proceeding
      await this.saveState();
      new this.nextDialogClass(this.characterData, {
        previousDialog: this
      }).render(true);
      this.close();
    }
  }

  // State management
  async saveState() {
    const key = `vestige-character-creator-state-${this.characterData?.name || 'unnamed'}`;
    await game.settings.set('vestige-character-creator', key, this.characterData);
  }

  async loadState() {
    const key = `vestige-character-creator-state-${this.characterData?.name || 'unnamed'}`;
    const savedState = await game.settings.get('vestige-character-creator', key);
    if (savedState) {
      this.characterData = foundry.utils.mergeObject(this.characterData, savedState);
    }
  }

  // Enhanced validation system
  async validate() {
    const validationErrors = [];

    for (const rule of this.validationRules) {
      try {
        const result = await rule(this.characterData);
        if (!result.valid) {
          validationErrors.push(result.error);
        }
      } catch (error) {
        console.error(`Validation error:`, error);
        validationErrors.push("An unexpected error occurred during validation");
      }
    }

    return {
      valid: validationErrors.length === 0,
      errors: validationErrors
    };
  }

  // Enhanced form submission handling
  async submit(event) {
    event.preventDefault();

    try {
      // Save current state before validation
      await this.saveState();

      // Run validation
      const validation = await this.validate();

      if (!validation.valid) {
        validation.errors.forEach(error =>
          ui.notifications.error(error)
        );
        return false;
      }

      // If validation passes, proceed with form submission
      const updated = await this._updateObject(event);
      if (updated) {
        await this.next();
      }

    } catch (error) {
      console.error("Form submission error:", error);
      ui.notifications.error("An error occurred. Your progress has been saved.");
    }
  }

  // Common activation listeners
  activateListeners(html) {
    super.activateListeners(html);

    html.find('button[name="back"]').on('click', () => this.back());
    html.find('button[name="next"]').on('click', (event) => this.submit(event));

    // Load any saved state
    this.loadState();
  }

  // Error handling wrapper for async operations
  async handleAsyncOperation(operation, errorMessage = "An error occurred") {
    try {
      return await operation();
    } catch (error) {
      console.error(error);
      ui.notifications.error(errorMessage);
      return false;
    }
  }

  // Common utility methods
  sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  validateNumericInput(value, min = 0, max = 100) {
    const num = parseInt(value);
    return isNaN(num) ? min : Math.max(min, Math.min(max, num));
  }
}
