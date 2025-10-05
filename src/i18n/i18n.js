/**
 * Internationalization service for Vrooom
 * Handles language switching and translation management
 */

class I18nService {
  constructor() {
    this.currentLocale = 'en';
    this.translations = {};
    this.listeners = new Set();
    this.supportedLocales = ['en', 'fr', 'es', 'de'];
  }

  /**
   * Initialize i18n service
   * Auto-detects browser language or falls back to English
   */
  async init() {
    // Try to load saved language preference
    const savedLocale = localStorage.getItem('app_language');

    if (savedLocale && this.supportedLocales.includes(savedLocale)) {
      await this.setLocale(savedLocale);
    } else {
      // Auto-detect browser language
      const browserLang = this.detectBrowserLanguage();
      await this.setLocale(browserLang);
    }
  }

  /**
   * Detect browser language
   * @returns {string} Detected locale code (en, fr, es, or de)
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0].toLowerCase();

    // Return detected language if supported, otherwise default to English
    return this.supportedLocales.includes(langCode) ? langCode : 'en';
  }

  /**
   * Set current locale and load translations
   * @param {string} locale - Language code (en, fr, es, de)
   */
  async setLocale(locale) {
    if (!this.supportedLocales.includes(locale)) {
      console.warn(`Locale ${locale} not supported, falling back to English`);
      locale = 'en';
    }

    this.currentLocale = locale;

    // Dynamically import translation file
    try {
      const module = await import(`./${locale}.js`);
      this.translations = module.default;

      // Save preference
      localStorage.setItem('app_language', locale);

      // Notify listeners
      this.notifyListeners();

      console.log(`🌍 Language set to: ${locale}`);
    } catch (error) {
      console.error(`Failed to load translations for ${locale}:`, error);

      // Fallback to English if loading fails
      if (locale !== 'en') {
        await this.setLocale('en');
      }
    }
  }

  /**
   * Get translation for a key
   * Supports nested keys with dot notation (e.g., "onboarding.step1.title")
   * @param {string} key - Translation key
   * @param {Object} replacements - Optional values to replace in translation
   * @returns {string} Translated text
   */
  t(key, replacements = {}) {
    const keys = key.split('.');
    let value = this.translations;

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return key itself if not found
      }
    }

    // Handle replacements (e.g., "Hello {name}" with {name: "John"})
    if (typeof value === 'string' && Object.keys(replacements).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, key) => {
        return replacements[key] !== undefined ? replacements[key] : match;
      });
    }

    return value;
  }

  /**
   * Get current locale
   * @returns {string} Current locale code
   */
  getLocale() {
    return this.currentLocale;
  }

  /**
   * Get list of supported locales with names
   * @returns {Array} Array of {code, name, emoji} objects
   */
  getSupportedLocales() {
    return [
      { code: 'en', name: 'English', emoji: '🇬🇧' },
      { code: 'fr', name: 'Français', emoji: '🇫🇷' },
      { code: 'es', name: 'Español', emoji: '🇪🇸' },
      { code: 'de', name: 'Deutsch', emoji: '🇩🇪' }
    ];
  }

  /**
   * Add listener for locale changes
   * @param {Function} callback - Function to call when locale changes
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * Remove listener
   * @param {Function} callback - Previously registered callback
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of locale change
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentLocale);
      } catch (error) {
        console.error('Error in i18n listener:', error);
      }
    });
  }
}

// Export singleton instance
export const i18n = new I18nService();
