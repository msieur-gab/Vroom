/**
 * ImageConverter - Utility for optimal image format conversion
 *
 * Progressive enhancement strategy:
 * 1. AVIF - Best compression, smallest files (~50% smaller than JPEG)
 * 2. WebP - Great compression, excellent browser support (~30% smaller than JPEG)
 * 3. JPEG - Universal fallback
 *
 * Usage:
 *   const converter = new ImageConverter();
 *   const blob = await converter.convertToOptimalFormat(canvas, { quality: 0.95 });
 *   console.log(blob.type); // 'image/avif', 'image/webp', or 'image/jpeg'
 */
export class ImageConverter {
  constructor() {
    // Cache format support detection
    this.formatSupport = {
      avif: null,
      webp: null
    };
  }

  /**
   * Convert canvas to optimal format with progressive fallback
   * @param {HTMLCanvasElement} canvas - Source canvas
   * @param {Object} options - Conversion options
   * @param {number} options.quality - Quality 0-1 (default: 0.95)
   * @param {number} options.maxSize - Max width/height for resizing (optional)
   * @param {'full'|'thumbnail'} options.preset - Preset configurations
   * @returns {Promise<{blob: Blob, format: string, size: number}>}
   */
  async convertToOptimalFormat(canvas, options = {}) {
    const {
      quality = 0.95,
      maxSize = null,
      preset = null
    } = options;

    // Apply preset defaults
    let finalQuality = quality;
    let finalMaxSize = maxSize;

    if (preset === 'thumbnail') {
      finalQuality = 0.85;
      finalMaxSize = 200;
    } else if (preset === 'full') {
      finalQuality = 0.95;
    }

    // Resize if needed
    let targetCanvas = canvas;
    if (finalMaxSize) {
      targetCanvas = await this.resizeCanvas(canvas, finalMaxSize);
    }

    console.log('🎨 Converting image to optimal format...');

    // Try AVIF first (best compression)
    if (await this.supportsFormat('image/avif')) {
      const blob = await this.canvasToBlob(targetCanvas, 'image/avif', finalQuality);
      console.log(`✅ Converted to AVIF: ${(blob.size / 1024).toFixed(2)} KB`);
      return { blob, format: 'avif', size: blob.size };
    }

    // Fallback to WebP (great compression)
    if (await this.supportsFormat('image/webp')) {
      const blob = await this.canvasToBlob(targetCanvas, 'image/webp', finalQuality);
      console.log(`✅ Converted to WebP: ${(blob.size / 1024).toFixed(2)} KB`);
      return { blob, format: 'webp', size: blob.size };
    }

    // Final fallback to JPEG (universal support)
    const blob = await this.canvasToBlob(targetCanvas, 'image/jpeg', finalQuality);
    console.log(`✅ Converted to JPEG: ${(blob.size / 1024).toFixed(2)} KB`);
    return { blob, format: 'jpeg', size: blob.size };
  }

  /**
   * Check if browser supports a specific image format
   * @param {string} mimeType - MIME type to check (e.g., 'image/avif')
   * @returns {Promise<boolean>}
   */
  async supportsFormat(mimeType) {
    const formatKey = mimeType.split('/')[1]; // 'avif' or 'webp'

    // Return cached result if available
    if (this.formatSupport[formatKey] !== null) {
      return this.formatSupport[formatKey];
    }

    // Test format support by creating a tiny canvas and trying to convert
    const testCanvas = document.createElement('canvas');
    testCanvas.width = 1;
    testCanvas.height = 1;

    try {
      const blob = await this.canvasToBlob(testCanvas, mimeType, 0.5);
      const supported = blob && blob.type === mimeType;
      this.formatSupport[formatKey] = supported;
      console.log(`${mimeType} support:`, supported ? '✅' : '❌');
      return supported;
    } catch (error) {
      this.formatSupport[formatKey] = false;
      console.log(`${mimeType} support: ❌ (error)`);
      return false;
    }
  }

  /**
   * Convert canvas to blob
   * @param {HTMLCanvasElement} canvas - Source canvas
   * @param {string} mimeType - Target MIME type
   * @param {number} quality - Quality 0-1
   * @returns {Promise<Blob>}
   */
  async canvasToBlob(canvas, mimeType, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(`Failed to create ${mimeType} blob`));
          }
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * Resize canvas to fit within max dimensions while maintaining aspect ratio
   * @param {HTMLCanvasElement} sourceCanvas - Source canvas
   * @param {number} maxSize - Maximum width or height
   * @returns {HTMLCanvasElement}
   */
  resizeCanvas(sourceCanvas, maxSize) {
    const { width, height } = sourceCanvas;

    // Calculate new dimensions maintaining aspect ratio
    const scale = Math.min(maxSize / width, maxSize / height);

    // No resize needed if already smaller
    if (scale >= 1) {
      return sourceCanvas;
    }

    const newWidth = Math.floor(width * scale);
    const newHeight = Math.floor(height * scale);

    console.log(`📐 Resizing canvas: ${width}x${height} → ${newWidth}x${newHeight}`);

    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;

    const ctx = resizedCanvas.getContext('2d');
    ctx.drawImage(sourceCanvas, 0, 0, newWidth, newHeight);

    return resizedCanvas;
  }

  /**
   * Get recommended quality for different use cases
   * @param {'full'|'thumbnail'|'preview'} useCase
   * @returns {number}
   */
  getRecommendedQuality(useCase) {
    const qualityMap = {
      full: 0.95,       // High quality for main photos
      thumbnail: 0.95,  // Good quality for thumbnails
      preview: 0.95     // Lower quality for previews
    };
    return qualityMap[useCase] || 0.90;
  }
}

// Singleton instance
export const imageConverter = new ImageConverter();
