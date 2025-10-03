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
   * Capture photo from video stream
   * @param {HTMLVideoElement} videoElement - Video element displaying stream
   * @returns {Promise<Object>} Photo data with imageData and thumbnail
   */
  async capturePhoto(videoElement) {
    console.log('📷 Capturing photo from stream...');

    if (!videoElement || !videoElement.videoWidth) {
      throw new Error('Invalid video element or stream not ready');
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    console.log('📷 Converting to data URL...');
    const imageData = canvas.toDataURL('image/jpeg', 0.85);

    console.log('📷 Creating thumbnail...');
    const thumbnail = await this.createThumbnail(canvas);

    const photoData = {
      imageData,
      thumbnail,
      timestamp: Date.now(),
      width: canvas.width,
      height: canvas.height,
      size: imageData.length
    };

    console.log('✅ Photo captured successfully:', {
      width: photoData.width,
      height: photoData.height
    });

    return photoData;
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
   * @returns {Promise<Object>} Photo data
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
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);

              const imageData = canvas.toDataURL('image/jpeg', 0.85);
              const thumbnail = await this.createThumbnail(canvas);

              resolve({
                imageData,
                thumbnail,
                timestamp: Date.now(),
                width: img.width,
                height: img.height,
                size: imageData.length
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
