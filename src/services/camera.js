/**
 * CameraService - Mobile camera capture with live preview
 * Handles getUserMedia stream, photo capture, and thumbnail generation
 */
export class CameraService {
  constructor() {
    this.isSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
  }

  /**
   * Check if camera is supported
   */
  isAvailable() {
    return this.isSupported;
  }

  /**
   * Start camera preview stream
   * @returns {Promise<MediaStream>} Camera stream
   */
  async startPreview() {
    console.log('📷 Starting camera preview...');

    if (!this.isSupported) {
      throw new Error('Camera not supported on this device');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      console.log('✅ Camera stream acquired');
      return stream;
    } catch (error) {
      console.error('❌ Camera access error:', error);

      if (error.name === 'NotAllowedError') {
        throw new Error('Camera permission denied. Please enable camera access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera found on this device');
      } else {
        throw new Error(`Camera error: ${error.message}`);
      }
    }
  }

  /**
   * Capture photo from video stream in square format
   * @param {HTMLVideoElement} videoElement - Video element displaying stream
   * @returns {Promise<Object>} Photo data with Blob and thumbnail Blob
   */
  async capturePhoto(videoElement) {
    console.log('📷 Capturing photo from stream...');

    if (!videoElement || !videoElement.videoWidth) {
      throw new Error('Invalid video element or stream not ready');
    }

    // Calculate square crop (centered)
    const sourceWidth = videoElement.videoWidth;
    const sourceHeight = videoElement.videoHeight;
    const size = Math.min(sourceWidth, sourceHeight);
    const offsetX = (sourceWidth - size) / 2;
    const offsetY = (sourceHeight - size) / 2;

    // Create square canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');

    // Draw cropped square from center
    ctx.drawImage(
      videoElement,
      offsetX, offsetY, size, size,  // Source crop
      0, 0, size, size                // Destination
    );

    console.log('📷 Converting to WebP blob...');
    const imageBlob = await this.canvasToBlob(canvas, 'image/webp', 0.92);

    console.log('📷 Creating thumbnail...');
    const thumbnailBlob = await this.createThumbnail(canvas);

    const photoData = {
      imageBlob,
      thumbnailBlob,
      timestamp: Date.now(),
      width: size,
      height: size,
      size: imageBlob.size,
      format: 'webp'
    };

    console.log('✅ Photo captured successfully:', {
      width: photoData.width,
      height: photoData.height,
      size: `${(photoData.size / 1024).toFixed(2)} KB`,
      format: photoData.format
    });

    return photoData;
  }

  /**
   * Convert canvas to blob
   * @param {HTMLCanvasElement} canvas - Source canvas
   * @param {string} mimeType - Image MIME type
   * @param {number} quality - Quality 0-1
   * @returns {Promise<Blob>} Image blob
   */
  async canvasToBlob(canvas, mimeType = 'image/webp', quality = 0.92) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * Create thumbnail from canvas
   * @param {HTMLCanvasElement} canvas - Source canvas
   * @returns {Promise<Blob>} Thumbnail blob
   */
  async createThumbnail(canvas) {
    const thumbnailCanvas = document.createElement('canvas');
    const maxSize = 200;

    const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
    thumbnailCanvas.width = canvas.width * scale;
    thumbnailCanvas.height = canvas.height * scale;

    const ctx = thumbnailCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

    return this.canvasToBlob(thumbnailCanvas, 'image/webp', 0.85);
  }

  /**
   * Stop camera stream and release resources
   * @param {MediaStream} stream - Camera stream to stop
   */
  stopPreview(stream) {
    if (stream) {
      console.log('📷 Stopping camera stream...');
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('📷 Track stopped:', track.kind);
      });
    }
  }

  /**
   * Fallback: Use file input for camera capture (compatibility mode)
   * @returns {Promise<Object>} Photo data with blobs
   */
  async captureFromFile() {
    console.log('📷 Using file input fallback...');

    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const img = new Image();
            img.onload = async () => {
              // Calculate square crop
              const size = Math.min(img.width, img.height);
              const offsetX = (img.width - size) / 2;
              const offsetY = (img.height - size) / 2;

              const canvas = document.createElement('canvas');
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d');

              // Draw square crop
              ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

              const imageBlob = await this.canvasToBlob(canvas, 'image/webp', 0.92);
              const thumbnailBlob = await this.createThumbnail(canvas);

              resolve({
                imageBlob,
                thumbnailBlob,
                timestamp: Date.now(),
                width: size,
                height: size,
                size: imageBlob.size,
                format: 'webp'
              });
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = event.target.result;
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        } catch (error) {
          reject(error);
        }
      };

      input.oncancel = () => reject(new Error('Photo capture cancelled'));
      input.click();
    });
  }
}

// Singleton instance
export const cameraService = new CameraService();
