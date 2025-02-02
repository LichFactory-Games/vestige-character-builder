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
    try {
      const states = game.settings.get('vestige-character-creator', 'character-states') || {};
      const stateKey = this.characterData?.name || 'unnamed';
      states[stateKey] = this.characterData;
      await game.settings.set('vestige-character-creator', 'character-states', states);
    } catch (error) {
      console.warn('Failed to save character state:', error);
    }
  }

  async loadState() {
    try {
      const states = game.settings.get('vestige-character-creator', 'character-states') || {};
      const stateKey = this.characterData?.name || 'unnamed';
      const savedState = states[stateKey];
      if (savedState) {
        this.characterData = foundry.utils.mergeObject(this.characterData, savedState);
      }
    } catch (error) {
      console.warn('Failed to load character state:', error);
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
      return false; // Prevent dialog from closing
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

  // Update Object
  async _updateObject(event, formData) {
    try {
      // Run validation
      const validation = await this.validate();

      if (!validation.valid) {
        validation.errors.forEach(error => {
          console.error("Validation error:", error);
          ui.notifications.error(error);
        });
        return false; // Prevent dialog from closing
      }

      // Save state before proceeding
      await this.saveState();

      // Only proceed to next dialog if validation passed
      if (this.nextDialogClass) {
        try {
          const nextDialog = new this.nextDialogClass(this.characterData, {
            previousDialog: this
          });

          // Try to render the next dialog but catch any errors
          const renderSuccess = await nextDialog.render(true).catch(error => {
            console.error("Error rendering next dialog:", error);
            ui.notifications.error("Failed to proceed to next step");
            return false;
          });

          // Only close current dialog if next one rendered successfully
          if (renderSuccess !== false) {
            this.close();
          }
        } catch (error) {
          console.error("Error creating next dialog:", error);
          ui.notifications.error("Failed to proceed to next step");
          return false; // Prevent dialog from closing
        }
      }

      return true;
    } catch (error) {
      console.error("Update object error:", error);
      ui.notifications.error("An error occurred. Your progress has been saved.");
      return false; // Prevent dialog from closing
    }
  }
  
}
