/**
 * OnboardingFlow Web Component
 * 7-step onboarding process for Vrooom
 * - Language selection
 * - How it works
 * - Privacy
 * - Camera permission (required)
 * - GPS permission (required)
 * - Driver profile
 * - Ready to start
 */

import { i18n } from '../i18n/i18n.js';
import { geolocationService } from '../services/geolocation.js';
import { cameraModal } from './CameraModal.js';

class OnboardingFlow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.state = {
      currentStep: 1,
      totalSteps: 7,
      cameraGranted: false,
      gpsGranted: false,
      playerName: '',
      playerAvatar: null,
      playerColor: '#FF5722' // Default orange
    };

    this.boundHandleLocaleChange = this.handleLocaleChange.bind(this);
  }

  async connectedCallback() {
    // Initialize i18n
    await i18n.init();

    this.render();
    i18n.addListener(this.boundHandleLocaleChange);
    this.updateContent();
    this.setupEventListeners();
    this.updateView();

    // Don't check permissions on init - wait for user to reach permission steps
  }

  disconnectedCallback() {
    i18n.removeListener(this.boundHandleLocaleChange);
  }

  handleLocaleChange() {
    this.updateContent();
  }

  setupEventListeners() {
    const nextButton = this.shadowRoot.getElementById('next-button');
    const backButton = this.shadowRoot.getElementById('back-button');

    nextButton?.addEventListener('click', () => this.handleNext());
    backButton?.addEventListener('click', () => this.goToStep(this.state.currentStep - 1));

    // Form input listeners
    this.setupFormListeners();

    // Bottom sheet setup
    this.setupBottomSheets();

    // Swipe support
    this.setupSwipeSupport();
  }

  setupFormListeners() {
    // Permission buttons
    const grantCameraBtn = this.shadowRoot.getElementById('grant-camera-btn');
    const grantGpsBtn = this.shadowRoot.getElementById('grant-gps-btn');

    grantCameraBtn?.addEventListener('click', () => this.requestCameraPermission());
    grantGpsBtn?.addEventListener('click', () => this.requestGPSPermission());

    const playerNameInput = this.shadowRoot.getElementById('player-name');
    const avatarPreview = this.shadowRoot.getElementById('avatar-preview');
    const colorButtons = this.shadowRoot.querySelectorAll('.color-button');

    playerNameInput?.addEventListener('input', (e) => {
      this.state.playerName = e.target.value;
      this.updateView();
    });

    avatarPreview?.addEventListener('click', () => this.handleTakeSelfie());

    colorButtons?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.currentTarget.dataset.color;
        this.state.playerColor = color;
        this.updateColorSelection();
        this.updateAvatarPreview(); // Update avatar color immediately
      });
    });
  }

  async handleTakeSelfie() {
    console.log('📸 Taking selfie for avatar...');

    // Set camera to front-facing mode
    cameraModal.facingMode = 'user';

    // Listen for photo capture
    const handlePhotoCapture = (e) => {
      console.log('📸 Selfie captured:', e.detail);
      const { imageBlob } = e.detail;

      // Convert blob to data URL for avatar
      const reader = new FileReader();
      reader.onload = (event) => {
        this.state.playerAvatar = event.target.result;

        // Update avatar preview directly
        const avatarPreview = this.shadowRoot.getElementById('avatar-preview');
        if (avatarPreview) {
          avatarPreview.innerHTML = `<img src="${event.target.result}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
      };
      reader.readAsDataURL(imageBlob);

      // Remove listener after capture
      document.removeEventListener('photo-captured', handlePhotoCapture);

      // Reset camera to back-facing for future photos
      cameraModal.facingMode = 'environment';
    };

    document.addEventListener('photo-captured', handlePhotoCapture);

    // Open camera modal
    try {
      await cameraModal.open();
    } catch (error) {
      console.error('Failed to open camera for selfie:', error);
      document.removeEventListener('photo-captured', handlePhotoCapture);
      cameraModal.facingMode = 'environment'; // Reset
    }
  }


  updateColorSelection() {
    const buttons = this.shadowRoot.querySelectorAll('.color-button');
    buttons.forEach(btn => {
      const isSelected = btn.dataset.color === this.state.playerColor;
      btn.classList.toggle('selected', isSelected);
    });
  }

  setupBottomSheets() {
    const languagePanel = this.shadowRoot.getElementById('language-panel');
    if (!languagePanel) return;

    const optionsList = this.shadowRoot.getElementById('language-options');
    const closeBtn = languagePanel.querySelector('.panel-close-btn');

    this.populateLanguageOptions(optionsList);

    optionsList?.addEventListener('click', (e) => {
      const option = e.target.closest('.panel-option');
      if (option) {
        const locale = option.dataset.value;
        i18n.setLocale(locale);
        this.updateDisplayText('language-display', option.dataset.text);
        this.closePanel(languagePanel);
      }
    });

    closeBtn?.addEventListener('click', () => this.closePanel(languagePanel));
    languagePanel.addEventListener('click', (e) => {
      if (e.target === languagePanel) this.closePanel(languagePanel);
    });

    const trigger = this.shadowRoot.querySelector('[data-panel-target="language-panel"]');
    trigger?.addEventListener('click', () => this.openPanel(languagePanel));
  }

  populateLanguageOptions(optionsList) {
    if (!optionsList) return;

    const options = i18n.getSupportedLocales();
    optionsList.innerHTML = options.map(option => `
      <li class="panel-option" data-value="${option.code}" data-text="${option.name}">
        <span class="panel-option-emoji">${option.emoji}</span>
        <span class="panel-option-text">${option.name}</span>
      </li>
    `).join('');
  }

  updateDisplayText(elementId, text) {
    const element = this.shadowRoot.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  }

  openPanel(panel) {
    panel?.classList.add('visible');
  }

  closePanel(panel) {
    panel?.classList.remove('visible');
  }

  setupSwipeSupport() {
    let touchstartX = 0;
    let touchendX = 0;
    const swipeThreshold = 50;

    const mainContainer = this.shadowRoot.getElementById('onboarding-main');

    mainContainer?.addEventListener('touchstart', e => {
      touchstartX = e.changedTouches[0].screenX;
    }, { passive: true });

    mainContainer?.addEventListener('touchend', e => {
      touchendX = e.changedTouches[0].screenX;
      this.handleSwipe(touchstartX, touchendX, swipeThreshold);
    });
  }

  handleSwipe(startX, endX, threshold) {
    if (endX < startX - threshold) {
      this.goToStep(this.state.currentStep + 1);
    }
    if (endX > startX + threshold) {
      this.goToStep(this.state.currentStep - 1);
    }
  }

  async handleNext() {
    // Step 4: Camera permission required
    if (this.state.currentStep === 4) {
      if (!this.state.cameraGranted) {
        await this.requestCameraPermission();
        return; // Don't advance until granted
      }
    }

    // Step 5: GPS permission required
    if (this.state.currentStep === 5) {
      if (!this.state.gpsGranted) {
        await this.requestGPSPermission();
        return; // Don't advance until granted
      }
    }

    // Step 6: Player name required
    if (this.state.currentStep === 6) {
      if (!this.state.playerName.trim()) {
        alert(i18n.t('onboarding.step6.namePlaceholder'));
        return;
      }
    }

    // Advance to next step
    this.goToStep(this.state.currentStep + 1);
  }

  async requestCameraPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      this.state.cameraGranted = true;
      console.log('📷 Camera permission granted');

      // Update the UI to show granted status
      const cameraStatus = this.shadowRoot.getElementById('camera-status');
      if (cameraStatus) {
        cameraStatus.innerHTML = '<div class="permission-granted">✅ <span data-i18n="onboarding.step4.permissionGranted">Camera access granted!</span></div>';
        this.updateContent(); // Re-apply i18n
      }

      // Enable Next button if it was disabled
      this.updateView();
    } catch (error) {
      console.error('Camera permission denied:', error);
      this.showPermissionError('camera');
    }
  }

  async requestGPSPermission() {
    try {
      const position = await geolocationService.getCurrentPosition();
      this.state.gpsGranted = true;
      console.log('📍 GPS permission granted');

      // Update the UI to show granted status
      const gpsStatus = this.shadowRoot.getElementById('gps-status');
      if (gpsStatus) {
        gpsStatus.innerHTML = '<div class="permission-granted">✅ <span data-i18n="onboarding.step5.permissionGranted">Location access granted!</span></div>';
        this.updateContent(); // Re-apply i18n
      }

      // Enable Next button if it was disabled
      this.updateView();
    } catch (error) {
      console.error('GPS permission denied:', error);
      this.showPermissionError('gps');
    }
  }

  showPermissionError(type) {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isIOS) {
      const key = type === 'camera' ? 'onboarding.step4.iosInstructions' : 'onboarding.step5.iosInstructions';
      alert(i18n.t(key));
    } else {
      alert(i18n.t(`permissions.${type}Required`));
    }
  }

  goToStep(stepNumber) {
    if (stepNumber > this.state.totalSteps) {
      this.finishOnboarding();
      return;
    }
    if (stepNumber < 1) return;

    this.state.currentStep = stepNumber;
    this.updateView();
  }

  updateView() {
    // Update step visibility
    this.shadowRoot.querySelectorAll('.onboarding-step').forEach((step, index) => {
      step.classList.toggle('hidden', index + 1 !== this.state.currentStep);
    });

    // Update progress dots
    this.shadowRoot.querySelectorAll('.dot').forEach((dot, index) => {
      dot.classList.toggle('active', index + 1 === this.state.currentStep);
    });

    // Update navigation buttons
    const backButton = this.shadowRoot.getElementById('back-button');
    const nextButton = this.shadowRoot.getElementById('next-button');

    if (backButton) {
      backButton.style.visibility = this.state.currentStep === 1 ? 'hidden' : 'visible';
    }

    // Update next button for permission steps
    if (nextButton) {
      let buttonText = i18n.t('common.next');
      let isDisabled = false;

      // Step 4: Camera permission
      if (this.state.currentStep === 4) {
        buttonText = this.state.cameraGranted
          ? i18n.t('onboarding.step4.permissionGranted')
          : i18n.t('onboarding.step4.grantPermission');
        isDisabled = false; // Allow clicking to request
      }

      // Step 5: GPS permission
      if (this.state.currentStep === 5) {
        buttonText = this.state.gpsGranted
          ? i18n.t('onboarding.step5.permissionGranted')
          : i18n.t('onboarding.step5.grantPermission');
        isDisabled = false; // Allow clicking to request
      }

      // Step 6: Player profile
      if (this.state.currentStep === 6) {
        isDisabled = !this.state.playerName.trim();
      }

      // Step 7: Finish
      if (this.state.currentStep === this.state.totalSteps) {
        buttonText = i18n.t('onboarding.step7.startAdventure');
      }

      nextButton.textContent = buttonText;
      nextButton.disabled = isDisabled;
    }

    // Update avatar preview for step 6
    if (this.state.currentStep === 6) {
      this.updateAvatarPreview();
    }

    // Update step-specific content
    this.updateStepContent();
  }

  updateAvatarPreview() {
    const avatarPreview = this.shadowRoot.getElementById('avatar-preview');
    if (!avatarPreview) return;

    // Update background color
    avatarPreview.style.backgroundColor = this.state.playerColor;

    // Update content (photo or initial)
    if (this.state.playerAvatar) {
      avatarPreview.innerHTML = `<img src="${this.state.playerAvatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
      const initial = this.state.playerName.charAt(0).toUpperCase() || '?';
      avatarPreview.innerHTML = initial;
    }
  }

  updateStepContent() {
    // Update player name display in step 7
    if (this.state.currentStep === 7) {
      const title = this.shadowRoot.getElementById('step7-title');
      if (title) {
        title.textContent = i18n.t('onboarding.step7.title', { name: this.state.playerName });
      }
    }

    // Update color selection
    this.updateColorSelection();

    // Update all translatable content
    this.updateContent();
  }

  updateContent() {
    // Update all translatable content
    const elements = this.shadowRoot.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.dataset.i18n;
      element.textContent = i18n.t(key);
    });

    // Update placeholders
    const placeholders = this.shadowRoot.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(element => {
      const key = element.dataset.i18nPlaceholder;
      element.placeholder = i18n.t(key);
    });
  }

  finishOnboarding() {
    // Emit completion event with player data
    this.dispatchEvent(new CustomEvent('onboarding-complete', {
      detail: {
        playerName: this.state.playerName || i18n.t('onboarding.step6.nameDefault'),
        playerAvatar: this.state.playerAvatar,
        playerColor: this.state.playerColor,
        language: i18n.getLocale()
      }
    }));
  }

  render() {
    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="app-container">
        <main class="onboarding-main" id="onboarding-main">
          ${this.renderSteps()}
          ${this.renderNavigation()}
        </main>
      </div>
      ${this.renderBottomSheets()}
    `;
  }

  getStyles() {
    return `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .app-container {
          max-width: 428px;
          margin: auto;
          height: 100vh;
          height: 100dvh; /* Dynamic viewport height for mobile browsers */
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .onboarding-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
          padding-bottom: calc(80px + env(safe-area-inset-bottom)); /* Space for fixed navigation */
          overflow: hidden; /* No scrolling - content must fit */
        }

        .onboarding-step {
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }

        .hidden { display: none !important; }

        .illustration-container {
          width: 100%;
          min-height: 200px;
          background-color: #f8f9fa;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 4rem;
          flex-shrink: 0;
          margin-bottom: 2rem;
        }

        .bottom-content-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .step-header {
          text-align: left;
          margin-bottom: 1.5rem;
        }

        .step-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .step-header p {
          font-size: 1rem;
          line-height: 1.6;
          color: #6b7280;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .styled-input {
          width: 100%;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 0.875rem 1rem;
          font-size: 1rem;
          color: #1f2937;
        }

        .styled-input::placeholder {
          color: #6b7280;
        }

        .styled-input:focus {
          outline: none;
          border-color: #FF5722;
          box-shadow: 0 0 0 2px rgba(255, 87, 34, 0.2);
        }

        .select-input-trigger {
          width: 100%;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 0.875rem 1rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .select-input-trigger:hover {
          border-color: #d1d5db;
        }

        .select-input-trigger span {
          font-size: 1rem;
          color: #1f2937;
        }

        .arrow {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }

        .hidden-input {
          display: none;
        }

        /* Avatar upload */
        .avatar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .avatar-preview {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: #f9fafb;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
          border: 3px solid #e5e7eb;
          transition: all 0.2s;
        }

        .avatar-preview.clickable {
          cursor: pointer;
        }

        .avatar-preview.clickable:hover {
          transform: scale(1.05);
          border-color: #FF5722;
        }

        .avatar-hint {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .avatar-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
        }

        .avatar-btn {
          padding: 0.75rem 1rem;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          font-size: 0.875rem;
          text-align: center;
          color: #1f2937;
          transition: all 0.2s;
        }

        .avatar-btn:hover {
          background-color: #f3f4f6;
          transform: translateY(-1px);
        }

        .hidden-input {
          display: none;
        }

        /* Color selection */
        .color-selection {
          margin-top: 1rem;
        }

        .color-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
          display: block;
        }

        .color-buttons {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .color-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }

        .color-button:hover {
          transform: scale(1.1);
        }

        .color-button.selected {
          border-color: #1f2937;
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor;
        }

        /* Permission status */
        .permission-status {
          margin-top: 1.5rem;
          text-align: center;
        }

        .permission-button {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #FF5722 0%, #FF6F3C 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(255, 87, 34, 0.3);
          transition: all 0.2s;
        }

        .permission-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 87, 34, 0.4);
        }

        .permission-button:active {
          transform: translateY(0);
        }

        .permission-granted {
          color: #10b981;
          font-size: 1.125rem;
          font-weight: 600;
        }

        /* Bottom sheets */
        .options-panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.4);
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s;
        }

        .options-panel-overlay.visible {
          opacity: 1;
          visibility: visible;
        }

        .options-panel {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: white;
          border-radius: 24px 24px 0 0;
          padding: 1rem 1.5rem 1.5rem;
          transform: translateY(100%);
          transition: transform 0.3s ease;
          max-height: 70vh;
          display: flex;
          flex-direction: column;
        }

        .options-panel-overlay.visible .options-panel {
          transform: translateY(0);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .panel-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .panel-close-btn {
          background: #f3f4f6;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.25rem;
        }

        .panel-options-list {
          list-style: none;
          padding: 0;
          margin: 0;
          overflow-y: auto;
        }

        .panel-option {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .panel-option:last-child {
          border-bottom: none;
        }

        .panel-option:hover {
          background-color: #f9fafb;
        }

        .panel-option-emoji {
          font-size: 1.5rem;
        }

        .panel-option-text {
          flex: 1;
        }

        /* Navigation */
        .navigation-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          max-width: 428px;
          margin: 0 auto;
          background: white;
          border-top: 1px solid #e5e7eb;
          padding: 1rem 1.5rem;
          padding-bottom: calc(1rem + env(safe-area-inset-bottom)); /* iOS safe area */
          z-index: 100;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
        }

        .navigation-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-dots {
          display: flex;
          gap: 0.5rem;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #d1d5db;
          transition: all 0.3s;
        }

        .dot.active {
          background-color: #1f2937;
          width: 24px;
          border-radius: 4px;
        }

        .navigation-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .nav-button {
          padding: 0.75rem 1.5rem;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          background-color: #ffffff;
          color: #1f2937;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .nav-button:hover:not(:disabled) {
          background-color: #f3f4f6;
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nav-button.primary {
          background-color: #1f2937;
          color: #ffffff;
          border-color: #1f2937;
        }

        .nav-button.primary:hover:not(:disabled) {
          background-color: #000;
        }

        .permission-granted {
          background-color: #10b981 !important;
          border-color: #10b981 !important;
        }
      </style>
    `;
  }

  renderSteps() {
    return `
      <!-- Step 1: Welcome + Language Selection -->
      <div id="step-1" class="onboarding-step">
        <div class="illustration-container">🗺️</div>
        <div class="bottom-content-container">
          <div class="step-header">
            <h2 data-i18n="onboarding.step1.title">Welcome to Vrooom!</h2>
            <p data-i18n="onboarding.step1.description">Turn your travels into an adventure map</p>
          </div>
          <div class="form-group">
            <div class="select-input-trigger" data-panel-target="language-panel">
              <span id="language-display">${this.getLanguageName()}</span>
              <div class="arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: How It Works -->
      <div id="step-2" class="onboarding-step hidden">
        <div class="illustration-container">📸</div>
        <div class="bottom-content-container">
          <div class="step-header">
            <h2 data-i18n="onboarding.step2.title">Every Journey Tells a Story</h2>
            <p data-i18n="onboarding.step2.description">Take photos during your adventures...</p>
          </div>
        </div>
      </div>

      <!-- Step 3: Privacy -->
      <div id="step-3" class="onboarding-step hidden">
        <div class="illustration-container">🔒</div>
        <div class="bottom-content-container">
          <div class="step-header">
            <h2 data-i18n="onboarding.step3.title">Your Data Stays Yours</h2>
            <p data-i18n="onboarding.step3.description">Everything is stored on your device...</p>
          </div>
        </div>
      </div>

      <!-- Step 4: Camera Permission -->
      <div id="step-4" class="onboarding-step hidden">
        <div class="illustration-container">📷</div>
        <div class="bottom-content-container">
          <div class="step-header">
            <h2 data-i18n="onboarding.step4.title">Camera Access Needed</h2>
            <p data-i18n="onboarding.step4.description">To capture your adventure photos</p>
          </div>
          <div class="permission-status" id="camera-status">
            ${this.state.cameraGranted ?
              '<div class="permission-granted">✅ <span data-i18n="onboarding.step4.permissionGranted">Camera access granted!</span></div>' :
              '<button class="permission-button" id="grant-camera-btn" data-i18n="onboarding.step4.grantPermission">Grant Camera Permission</button>'
            }
          </div>
        </div>
      </div>

      <!-- Step 5: GPS Permission -->
      <div id="step-5" class="onboarding-step hidden">
        <div class="illustration-container">📍</div>
        <div class="bottom-content-container">
          <div class="step-header">
            <h2 data-i18n="onboarding.step5.title">Location Access Needed</h2>
            <p data-i18n="onboarding.step5.description">GPS tracks distance traveled...</p>
          </div>
          <div class="permission-status" id="gps-status">
            ${this.state.gpsGranted ?
              '<div class="permission-granted">✅ <span data-i18n="onboarding.step5.permissionGranted">Location access granted!</span></div>' :
              '<button class="permission-button" id="grant-gps-btn" data-i18n="onboarding.step5.grantPermission">Grant Location Permission</button>'
            }
          </div>
        </div>
      </div>

      <!-- Step 6: Player Profile -->
      <div id="step-6" class="onboarding-step hidden">
        <div class="avatar-container">
          <div id="avatar-preview" class="avatar-preview clickable" style="background-color: ${this.state.playerColor}">
            ${this.state.playerAvatar ?
              `<img src="${this.state.playerAvatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` :
              `${this.state.playerName.charAt(0).toUpperCase() || '?'}`
            }
          </div>
          <p class="avatar-hint" data-i18n="onboarding.step6.avatarHint">Tap to add photo</p>
        </div>
        <div class="bottom-content-container">
          <div class="step-header">
            <h2 data-i18n="onboarding.step6.title">Who's Driving?</h2>
            <p data-i18n="onboarding.step6.description">Create your driver profile</p>
          </div>
          <div class="form-group">
            <input
              type="text"
              id="player-name"
              class="styled-input"
              data-i18n-placeholder="onboarding.step6.namePlaceholder"
              value="${this.state.playerName}"
            >
          </div>
          <div class="color-selection">
            <label class="color-label" data-i18n="onboarding.step6.chooseColor">Choose your color:</label>
            <div class="color-buttons">
              <button class="color-button" data-color="#2196F3" style="background-color: #2196F3"></button>
              <button class="color-button" data-color="#4CAF50" style="background-color: #4CAF50"></button>
              <button class="color-button selected" data-color="#FF5722" style="background-color: #FF5722"></button>
              <button class="color-button" data-color="#9C27B0" style="background-color: #9C27B0"></button>
              <button class="color-button" data-color="#F44336" style="background-color: #F44336"></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 7: Ready! -->
      <div id="step-7" class="onboarding-step hidden">
        <div class="illustration-container">✅</div>
        <div class="bottom-content-container">
          <div class="step-header">
            <h2 id="step7-title">Ready, ${this.state.playerName}!</h2>
            <p data-i18n="onboarding.step7.description">Tap the camera button to start...</p>
          </div>
        </div>
      </div>
    `;
  }

  getLanguageName() {
    const locale = i18n.getLocale();
    const locales = i18n.getSupportedLocales();
    const current = locales.find(l => l.code === locale);
    return current ? `${current.emoji} ${current.name}` : 'English';
  }

  renderNavigation() {
    return `
      <div class="navigation-container">
        <div class="navigation-wrapper">
          <div class="progress-dots" id="progress-dots">
            ${Array.from({length: this.state.totalSteps}, () => '<div class="dot"></div>').join('')}
          </div>
          <div class="navigation-buttons">
            <button class="nav-button" id="back-button" data-i18n="common.back">Back</button>
            <button class="nav-button primary" id="next-button" data-i18n="common.next">Next</button>
          </div>
        </div>
      </div>
    `;
  }

  renderBottomSheets() {
    return `
      <!-- Language Panel -->
      <div class="options-panel-overlay" id="language-panel">
        <div class="options-panel">
          <div class="panel-header">
            <h3 class="panel-title" data-i18n="onboarding.languageSelection.title">Choose Your Language</h3>
            <button class="panel-close-btn">×</button>
          </div>
          <ul class="panel-options-list" id="language-options"></ul>
        </div>
      </div>
    `;
  }
}

customElements.define('onboarding-flow', OnboardingFlow);

export { OnboardingFlow };
