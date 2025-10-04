/**
 * CameraModal - In-app camera UI with live preview
 * Uses Modal singleton for display, CameraService for hardware access
 * Emits 'photo-captured' event with photo data and GPS position
 */

import { Modal } from './Modal.js';
import { cameraService } from '../services/camera.js';
import { geolocationService } from '../services/geolocation.js';
import { getOverlaySVG } from './SelfieOverlays.js';

export class CameraModal {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.gpsPosition = null;
    this.gpsAcquiring = false;
    this.facingMode = 'environment'; // 'environment' (back) or 'user' (front)
    this.milestone = null;
  }

  /**
   * Open camera modal with live preview
   * @param {Object} options - Camera options
   * @param {Object} options.milestone - Milestone info for selfie mode
   * @returns {Promise<void>}
   */
  async open(options = {}) {
    this.milestone = options.milestone || null;

    if (this.milestone) {
      console.log(`🏆 Opening milestone selfie camera for: ${this.milestone.name}`);
      console.log('🎨 Milestone data:', this.milestone);
      console.log('🎭 Overlay type:', this.milestone.overlay);
    } else {
      console.log('📷 Opening camera modal...');
    }

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
      console.log('📷 About to start camera stream...');
      await this.startCamera();
      console.log('📷 Camera stream started successfully');

      // Start GPS acquisition in background
      this.acquireGPS();

    } catch (error) {
      console.error('❌ Camera modal error:', error);
      console.error('Error stack:', error.stack);
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

    // Milestone frame overlay with SVG character overlay
    const milestoneFrame = this.milestone ? `
      <div class="milestone-frame-overlay">
        <div class="frame-corner frame-top-left"></div>
        <div class="frame-corner frame-top-right"></div>
        <div class="frame-corner frame-bottom-left"></div>
        <div class="frame-corner frame-bottom-right"></div>
        <div class="frame-stamp">
          <span class="stamp-icon">${this.milestone.icon}</span>
          <span class="stamp-text">${this.milestone.title}</span>
          <span class="stamp-distance">${this.milestone.distance}km</span>
        </div>
        ${this.milestone.overlay ? (() => {
          const svg = getOverlaySVG(this.milestone.overlay);
          console.log('🎭 Generating overlay SVG for:', this.milestone.overlay);
          console.log('📝 SVG length:', svg.length);
          return `
          <div class="selfie-overlay-container">
            ${svg}
          </div>
          `;
        })() : ''}
      </div>
    ` : '';

    container.innerHTML = `
      <div class="camera-preview">
        <video class="camera-video" autoplay playsinline></video>
        ${milestoneFrame}
        <div class="gps-indicator"></div>
      </div>

      <div class="camera-controls">
        <button class="camera-flip-btn" aria-label="Flip camera">🔄</button>

        <button class="camera-capture-btn" aria-label="Take photo">
          <div class="capture-ring">
            <div class="capture-inner"></div>
          </div>
        </button>

        <button class="camera-close-btn" aria-label="Close camera">✕</button>
      </div>
    `;

    // Get elements
    this.videoElement = container.querySelector('.camera-video');
    const closeBtn = container.querySelector('.camera-close-btn');
    const flipBtn = container.querySelector('.camera-flip-btn');
    const captureBtn = container.querySelector('.camera-capture-btn');

    // Event listeners
    closeBtn.addEventListener('click', () => this.close());
    flipBtn.addEventListener('click', () => this.flipCamera());
    captureBtn.addEventListener('click', () => this.capture());

    return container;
  }

  /**
   * Start camera stream and attach to video element
   */
  async startCamera() {
    console.log(`📷 Starting camera stream (${this.facingMode})...`);

    try {
      // Stop existing stream if any
      if (this.stream) {
        cameraService.stopPreview(this.stream);
      }

      // Get new stream with current facing mode
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.facingMode,
          width: { ideal: 4096 },    // Request 4K for maximum quality
          height: { ideal: 4096 }    // Square high-res for cropping
        },
        audio: false
      });

      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
        console.log(`✅ Camera preview started (${this.facingMode})`);
      }
    } catch (error) {
      console.error('❌ Failed to start camera:', error);
      throw error;
    }
  }

  /**
   * Flip between front and back camera
   */
  async flipCamera() {
    console.log('🔄 Flipping camera...');

    try {
      // Toggle facing mode
      this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';

      // Restart camera with new facing mode
      await this.startCamera();

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      console.log(`✅ Camera flipped to ${this.facingMode}`);
    } catch (error) {
      console.error('❌ Failed to flip camera:', error);
      // Revert on error
      this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
      alert('Failed to switch camera. This device may only have one camera.');
    }
  }

  /**
   * Acquire GPS position in background
   */
  async acquireGPS() {
    console.log('📍 Acquiring GPS position...');
    this.gpsAcquiring = true;

    const gpsIndicator = document.querySelector('.gps-indicator');

    try {
      this.gpsPosition = await geolocationService.getCurrentPosition();

      if (gpsIndicator) {
        gpsIndicator.classList.remove('gps-acquiring');
        gpsIndicator.classList.add('gps-ready');
      }

      console.log('✅ GPS position acquired:', this.gpsPosition);
    } catch (error) {
      console.warn('⚠️ GPS acquisition failed:', error);

      if (gpsIndicator) {
        gpsIndicator.classList.remove('gps-acquiring');
        gpsIndicator.classList.add('gps-error');
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
      let photoData = await cameraService.capturePhoto(this.videoElement);

      // If milestone mode, composite the frame onto the photo
      if (this.milestone) {
        console.log('🏆 Compositing milestone frame onto photo');
        photoData = await this.compositeFrame(photoData);
      }

      // Add GPS data and milestone info if available
      const captureData = {
        ...photoData,
        gpsPosition: this.gpsPosition,
        hasGPS: !!this.gpsPosition,
        milestone: this.milestone || null,
        isMilestoneSelfie: !!this.milestone
      };

      console.log('✅ Photo captured with GPS:', captureData.hasGPS);
      if (captureData.isMilestoneSelfie) {
        console.log('🏆 Milestone selfie captured for:', this.milestone.title);
      }

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
   * Composite milestone frame onto captured photo
   */
  async compositeFrame(photoData) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // Draw original photo
        ctx.drawImage(img, 0, 0);

        // Draw SVG overlay if available
        if (this.milestone.overlay) {
          await this.drawSVGOverlay(ctx, canvas.width, canvas.height);
        }

        // Draw golden corner frames
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 8;
        const cornerSize = 80;
        const margin = 30;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(margin + cornerSize, margin);
        ctx.lineTo(margin, margin);
        ctx.lineTo(margin, margin + cornerSize);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(canvas.width - margin - cornerSize, margin);
        ctx.lineTo(canvas.width - margin, margin);
        ctx.lineTo(canvas.width - margin, margin + cornerSize);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(margin, canvas.height - margin - cornerSize);
        ctx.lineTo(margin, canvas.height - margin);
        ctx.lineTo(margin + cornerSize, canvas.height - margin);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(canvas.width - margin - cornerSize, canvas.height - margin);
        ctx.lineTo(canvas.width - margin, canvas.height - margin);
        ctx.lineTo(canvas.width - margin, canvas.height - margin - cornerSize);
        ctx.stroke();

        // Draw stamp
        const stampWidth = 300;
        const stampHeight = 120;
        const stampX = (canvas.width - stampWidth) / 2;
        const stampY = canvas.height - stampHeight - 40;

        ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(stampX, stampY, stampWidth, stampHeight, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.font = 'bold 48px system-ui';
        ctx.fillText(this.milestone.icon, stampX + stampWidth/2, stampY + 55);

        ctx.font = 'bold 18px system-ui';
        ctx.fillText(this.milestone.title.toUpperCase(), stampX + stampWidth/2, stampY + 85);

        ctx.fillStyle = '#D97706';
        ctx.font = 'bold 24px system-ui';
        ctx.fillText(`${this.milestone.distance}km`, stampX + stampWidth/2, stampY + 112);

        // Convert to blob
        canvas.toBlob((blob) => {
          resolve({
            ...photoData,
            imageBlob: blob,
            thumbnailBlob: blob
          });
        }, 'image/jpeg', 0.9);
      };

      img.src = URL.createObjectURL(photoData.imageBlob);
    });
  }

  /**
   * Draw SVG overlay onto canvas
   */
  async drawSVGOverlay(ctx, width, height) {
    return new Promise((resolve, reject) => {
      const svgString = getOverlaySVG(this.milestone.overlay);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      const overlayImg = new Image();
      overlayImg.onload = () => {
        // Draw SVG centered and scaled to fit
        const size = Math.min(width, height);
        const x = (width - size) / 2;
        const y = (height - size) / 2;

        ctx.globalAlpha = 0.85;
        ctx.drawImage(overlayImg, x, y, size, size);
        ctx.globalAlpha = 1.0;

        URL.revokeObjectURL(url);
        resolve();
      };
      overlayImg.onerror = () => {
        console.warn('⚠️ Failed to load SVG overlay');
        URL.revokeObjectURL(url);
        resolve(); // Continue without overlay
      };
      overlayImg.src = url;
    });
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
    console.log('📷 close() called');
    console.trace('📷 Close stack trace:');
    this.cleanup();
    Modal.hide();
  }

  /**
   * Cleanup camera resources
   */
  cleanup() {
    console.log('📷 cleanup() called');
    console.trace('📷 Cleanup stack trace:');

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
    this.milestone = null;
  }
}

// Singleton instance
export const cameraModal = new CameraModal();
