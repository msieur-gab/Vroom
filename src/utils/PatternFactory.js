/**
 * PatternFactory - Unified pattern generation for canvas textures
 * Creates repeating patterns for biomes, backgrounds, and contours
 */
export class PatternFactory {
  /**
   * Create a canvas pattern from a drawing function
   * @param {CanvasRenderingContext2D} ctx - Target context for pattern creation
   * @param {number} width - Pattern canvas width
   * @param {number} height - Pattern canvas height
   * @param {Function} drawFn - Function(canvasCtx) that draws the pattern
   * @returns {CanvasPattern} Repeating canvas pattern
   */
  static createPattern(ctx, width, height, drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const patternCtx = canvas.getContext('2d');

    drawFn(patternCtx);

    return ctx.createPattern(canvas, 'repeat');
  }

  /**
   * Create biome texture patterns
   * @param {CanvasRenderingContext2D} ctx - Target context
   * @returns {Object} Map of pattern names to CanvasPattern objects
   */
  static createBiomePatterns(ctx) {
    const patterns = {};

    // Dot pattern (for forest/plains)
    patterns.dots = this.createPattern(ctx, 24, 24, (patternCtx) => {
      patternCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      patternCtx.beginPath();
      patternCtx.arc(6, 6, 1.5, 0, Math.PI * 2);
      patternCtx.fill();
      patternCtx.beginPath();
      patternCtx.arc(18, 18, 1.5, 0, Math.PI * 2);
      patternCtx.fill();
    });

    // Cross pattern (for desert) - small + shapes
    patterns.crosses = this.createPattern(ctx, 25, 25, (patternCtx) => {
      patternCtx.strokeStyle = 'rgba(0, 0, 0, 0.10)';
      patternCtx.lineWidth = 1.5;
      patternCtx.lineCap = 'square';
      patternCtx.beginPath();
      // Vertical line (6px tall)
      patternCtx.moveTo(12.5, 9.5);
      patternCtx.lineTo(12.5, 15.5);
      // Horizontal line (6px wide)
      patternCtx.moveTo(9.5, 12.5);
      patternCtx.lineTo(15.5, 12.5);
      patternCtx.stroke();
    });

    // Diagonal lines (for mountains)
    patterns.diagonal = this.createPattern(ctx, 16, 16, (patternCtx) => {
      patternCtx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      patternCtx.lineWidth = 1;
      patternCtx.beginPath();
      patternCtx.moveTo(0, 16);
      patternCtx.lineTo(16, 0);
      patternCtx.stroke();
    });

    // Small circles (for snow)
    patterns.circles = this.createPattern(ctx, 30, 30, (patternCtx) => {
      patternCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      patternCtx.lineWidth = 1;
      patternCtx.beginPath();
      patternCtx.arc(8, 8, 3, 0, Math.PI * 2);
      patternCtx.stroke();
      patternCtx.beginPath();
      patternCtx.arc(22, 22, 2, 0, Math.PI * 2);
      patternCtx.stroke();
    });

    return patterns;
  }

  /**
   * Create subtle background pattern
   * @param {CanvasRenderingContext2D} ctx - Target context
   * @returns {CanvasPattern} Background pattern
   */
  static createBackgroundPattern(ctx) {
    return this.createPattern(ctx, 24, 24, (patternCtx) => {
      patternCtx.fillStyle = 'rgba(60, 60, 60, 0.02)';
      patternCtx.beginPath();
      patternCtx.arc(6, 7.2, 1.5, 0, Math.PI * 2);
      patternCtx.fill();

      patternCtx.fillStyle = 'rgba(60, 60, 60, 0.015)';
      patternCtx.beginPath();
      patternCtx.arc(15.6, 16.8, 1.1, 0, Math.PI * 2);
      patternCtx.fill();
    });
  }

  /**
   * Create contour fill pattern with level-based variation
   * @param {CanvasRenderingContext2D} ctx - Target context
   * @param {number} levelIndex - Contour level (0 = innermost)
   * @returns {CanvasPattern} Contour fill pattern
   */
  static createContourFillPattern(ctx, levelIndex) {
    return this.createPattern(ctx, 18, 18, (patternCtx) => {
      const baseAlpha = 0.055;
      const alpha = baseAlpha - levelIndex * 0.006;
      const clampedAlpha = Math.max(0.015, alpha);
      const radius = 1.3 + levelIndex * 0.25;
      const secondaryRadius = Math.max(0.6, radius * 0.65);
      const offset = (levelIndex % 3) * 3;

      patternCtx.fillStyle = `rgba(60, 60, 60, ${clampedAlpha.toFixed(3)})`;
      patternCtx.beginPath();
      patternCtx.arc(5.4 + offset, 6.3, radius, 0, Math.PI * 2);
      patternCtx.fill();
      patternCtx.beginPath();
      patternCtx.arc(13.5, 12.6 + offset * 0.2, secondaryRadius, 0, Math.PI * 2);
      patternCtx.fill();
    });
  }

  /**
   * Create innermost contour hatch pattern (diagonal lines)
   * @param {CanvasRenderingContext2D} ctx - Target context
   * @param {string} strokeColor - Stroke color (default from ContourConfig)
   * @returns {CanvasPattern} Hatch pattern
   */
  static createInnermostHatchPattern(ctx, strokeColor = 'rgba(109, 97, 78, 0.28)') {
    return this.createPattern(ctx, 8, 8, (patternCtx) => {
      patternCtx.strokeStyle = strokeColor;
      patternCtx.lineWidth = 1;
      patternCtx.beginPath();
      patternCtx.moveTo(0, 8);
      patternCtx.lineTo(8, 0);
      patternCtx.stroke();
    });
  }
}
