/**
 * CameraModal - In-app camera UI with live preview
 * Uses Modal singleton for display, CameraService for hardware access
 * Emits 'photo-captured' event with photo data and GPS position
 */

import { Modal } from './Modal.js';
import { cameraService } from '../services/camera.js';
import { geolocationService } from '../services/geolocation.js';

export class CameraModal {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.gpsPosition = null;
    this.gpsAcquiring = false;
  }

  /**
   * Open camera modal with live preview
   * @returns {Promise<void>}
   */
  async open() {
    console.log('📷 Opening camera modal...');

    try {
      // Create camera UI
      const cameraContainer = this.createCameraUI();

      // Show modal with camera UI
      Modal.show({
        title: '',
        content: cameraContainer,
        width: '90vw',
        maxHeight: '80vh',
        hideHeader: true,
        onClose: () => this.cleanup()
      });

      // Start camera stream
      await this.startCamera();

      // Start GPS acquisition in background
      this.acquireGPS();

    } catch (error) {
      console.error('❌ Camera modal error:', error);
      Modal.hide();

      // Show error to user
      alert(error.message || 'Failed to access camera. Please check permissions.');
    }
  }

  /**
   * Create camera UI elements
   * @returns {HTMLElement} Camera container
   */
  createCameraUI() {
    const container = document.createElement('div');
    container.className = 'camera-container';
    container.innerHTML = `
      <div class="camera-preview">
        <video class="camera-video" autoplay playsinline></video>
      </div>

      <div class="camera-overlay">
        <div class="camera-header">
          <button class="camera-close-btn" aria-label="Close camera">✕</button>
        </div>

        <div class="camera-controls">
          <div class="gps-status">
            <span class="gps-icon">📍</span>
            <span class="gps-text">Acquiring GPS...</span>
          </div>

          <button class="camera-capture-btn" aria-label="Take photo">
            <div class="capture-ring">
              <div class="capture-inner"></div>
            </div>
          </button>

          <div class="camera-spacer"></div>
        </div>
      </div>
    `;

    // Get elements
    this.videoElement = container.querySelector('.camera-video');
    const closeBtn = container.querySelector('.camera-close-btn');
    const captureBtn = container.querySelector('.camera-capture-btn');

    // Event listeners
    closeBtn.addEventListener('click', () => this.close());
    captureBtn.addEventListener('click', () => this.capture());

    return container;
  }

  /**
   * Start camera stream and attach to video element
   */
  async startCamera() {
    console.log('📷 Starting camera stream...');

    try {
      this.stream = await cameraService.startPreview();

      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
        console.log('✅ Camera preview started');
      }
    } catch (error) {
      console.error('❌ Failed to start camera:', error);
      throw error;
    }
  }

  /**
   * Acquire GPS position in background
   */
  async acquireGPS() {
    console.log('📍 Acquiring GPS position...');
    this.gpsAcquiring = true;

    const gpsStatus = document.querySelector('.gps-status');

    try {
      this.gpsPosition = await geolocationService.getCurrentPosition();

      if (gpsStatus) {
        gpsStatus.querySelector('.gps-text').textContent = 'GPS Ready';
        gpsStatus.classList.add('gps-ready');
      }

      console.log('✅ GPS position acquired:', this.gpsPosition);
    } catch (error) {
      console.warn('⚠️ GPS acquisition failed:', error);

      if (gpsStatus) {
        gpsStatus.querySelector('.gps-text').textContent = 'GPS unavailable';
        gpsStatus.classList.add('gps-error');
      }
    } finally {
      this.gpsAcquiring = false;
    }
  }

  /**
   * Capture photo from video stream
   */
  async capture() {
    console.log('📷 Capture button clicked');

    try {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      // Flash animation
      this.showFlashEffect();

      // Capture photo from video stream
      const photoData = await cameraService.capturePhoto(this.videoElement);

      // Add GPS data if available
      const captureData = {
        ...photoData,
        gpsPosition: this.gpsPosition,
        hasGPS: !!this.gpsPosition
      };

      console.log('✅ Photo captured with GPS:', captureData.hasGPS);

      // Emit custom event
      const event = new CustomEvent('photo-captured', {
        detail: captureData,
        bubbles: true
      });
      document.dispatchEvent(event);

      // Close modal
      this.close();

    } catch (error) {
      console.error('❌ Photo capture failed:', error);
      alert('Failed to capture photo. Please try again.');
    }
  }

  /**
   * Show flash animation effect
   */
  showFlashEffect() {
    const flash = document.createElement('div');
    flash.className = 'camera-flash';
    document.querySelector('.camera-container')?.appendChild(flash);

    // Trigger animation
    requestAnimationFrame(() => {
      flash.style.opacity = '1';
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 200);
      }, 100);
    });
  }

  /**
   * Close camera modal
   */
  close() {
    console.log('📷 Closing camera modal');
    this.cleanup();
    Modal.hide();
  }

  /**
   * Cleanup camera resources
   */
  cleanup() {
    console.log('📷 Cleaning up camera resources...');

    // Stop camera stream
    if (this.stream) {
      cameraService.stopPreview(this.stream);
      this.stream = null;
    }

    // Clear video element
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    // Reset GPS state
    this.gpsPosition = null;
    this.gpsAcquiring = false;
  }
}

// Singleton instance
export const cameraModal = new CameraModal();
