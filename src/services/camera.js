/**
 * CameraService - Mobile camera capture with metadata extraction
 * Handles photo capture, compression, and EXIF data extraction
 */
export class CameraService {
  constructor() {
    this.stream = null;
    this.isSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
  }

  /**
   * Check if camera is supported
   */
  isAvailable() {
    return this.isSupported;
  }

  /**
   * Capture photo using mobile camera
   * Uses file input for better compatibility across devices
   * @param {Object} options - Capture options
   * @returns {Promise<Object>} Photo data with metadata
   */
  async capturePhoto(options = {}) {
    console.log('📷 Camera service: starting photo capture...');

    // Use file input approach - works on all devices
    return this.captureFromFile();
  }

  /**
   * Create thumbnail from canvas
   * @param {HTMLCanvasElement} canvas - Source canvas
   * @returns {Promise<string>} Thumbnail data URL
   */
  async createThumbnail(canvas) {
    const thumbnailCanvas = document.createElement('canvas');
    const maxSize = 200;

    const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
    thumbnailCanvas.width = canvas.width * scale;
    thumbnailCanvas.height = canvas.height * scale;

    const ctx = thumbnailCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

    return thumbnailCanvas.toDataURL('image/jpeg', 0.7);
  }

  /**
   * Use file input for camera capture
   * Works on all devices and opens native camera UI
   * @returns {Promise<Object>} Photo data
   */
  async captureFromFile() {
    console.log('📷 Opening file/camera picker...');

    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Hint to use camera on mobile

      console.log('📷 File input created, triggering click...');

      input.onchange = async (e) => {
        console.log('📷 File selected, processing...');
        const file = e.target.files[0];
        if (!file) {
          console.error('❌ No file selected');
          reject(new Error('No file selected'));
          return;
        }

        console.log('📷 File info:', { name: file.name, size: file.size, type: file.type });

        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            console.log('📷 File loaded, creating image...');
            const img = new Image();
            img.onload = async () => {
              console.log('📷 Image loaded, dimensions:', img.width, 'x', img.height);

              // Create canvas from image
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);

              console.log('📷 Converting to data URL...');
              const imageData = canvas.toDataURL('image/jpeg', 0.85);

              console.log('📷 Creating thumbnail...');
              const thumbnail = await this.createThumbnail(canvas);

              const photoData = {
                imageData,
                thumbnail,
                timestamp: Date.now(),
                width: img.width,
                height: img.height,
                size: imageData.length,
                filename: file.name
              };

              console.log('✅ Photo processed successfully:', photoData);
              resolve(photoData);
            };

            img.onerror = (error) => {
              console.error('❌ Image load error:', error);
              reject(new Error('Failed to load image'));
            };

            img.src = event.target.result;
          };

          reader.onerror = (error) => {
            console.error('❌ FileReader error:', error);
            reject(new Error('Failed to read file'));
          };

          reader.readAsDataURL(file);
        } catch (error) {
          console.error('❌ Photo processing error:', error);
          reject(error);
        }
      };

      // Handle cancel
      input.oncancel = () => {
        console.log('⚠️ Camera/file picker cancelled');
        reject(new Error('Photo capture cancelled'));
      };

      // Trigger file picker
      input.click();
      console.log('📷 File picker triggered');
    });
  }

  /**
   * Show camera preview (for future enhancement)
   */
  async showPreview(containerElement) {
    if (!this.isSupported) {
      throw new Error('Camera not supported');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });

    const video = document.createElement('video');
    video.srcObject = stream;
    video.setAttribute('playsinline', true);
    video.style.width = '100%';
    video.style.height = 'auto';

    containerElement.appendChild(video);
    await video.play();

    this.stream = stream;
    return video;
  }

  /**
   * Stop camera preview
   */
  stopPreview() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

// Singleton instance
export const cameraService = new CameraService();
