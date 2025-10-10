import { ContourConfig } from '../config.js';
import { PatternFactory } from '../utils/PatternFactory.js';

/**
 * ContourRenderer - Generates and renders elevation contours using marching squares
 * Creates topographic-style contour lines around the journey path
 */
export class ContourRenderer {
  constructor(gridInstance) {
    this.grid = gridInstance; // Reference to CanvasJourneyGrid for config/helpers
    this.overlayCanvas = null;
    this.overlayVersion = null;

    // Pattern caches
    this.contourFillPatterns = new Map();
    this.backgroundPattern = null;
    this.innermostHatchPattern = null;
  }

  /**
   * Render elevation contours overlay
   * @param {CanvasRenderingContext2D} ctx - Target canvas context
   * @param {Path2D} path2d - Journey path
   * @param {Array} nodes - Journey nodes
   * @param {number} pathVersion - Version number for cache invalidation
   */
  render(ctx, path2d, nodes, pathVersion) {
    if (!path2d || !nodes || nodes.length === 0) return;
    if (!this.grid.canvas) return;

    const overlay = this.ensureOverlay(path2d, nodes, pathVersion);
    if (!overlay) return;

    ctx.drawImage(overlay, 0, 0);
  }

  /**
   * Ensure overlay canvas is up-to-date
   * @private
   */
  ensureOverlay(path2d, nodes, pathVersion) {
    if (!this.grid.canvas) return null;

    if (!this.overlayCanvas) {
      this.overlayCanvas = document.createElement('canvas');
      this.overlayVersion = null;
    }

    const overlay = this.overlayCanvas;
    const width = this.grid.canvas.width;
    const height = this.grid.canvas.height;

    // Check if overlay needs rebuilding
    if (overlay.width !== width || overlay.height !== height || this.overlayVersion !== pathVersion) {
      overlay.width = width;
      overlay.height = height;
      const overlayCtx = overlay.getContext('2d');
      overlayCtx.clearRect(0, 0, width, height);

      // Generate contour data
      const influence = this.buildInfluenceField(nodes, width, height);
      const contours = this.generateContours(influence);
      this.renderContours(overlayCtx, path2d, contours, nodes);

      this.overlayVersion = pathVersion;
    }

    return overlay;
  }

  /**
   * Build influence field from node centers
   * @private
   */
  buildInfluenceField(nodes, width, height) {
    const cellSize = Math.max(8, Math.floor(this.grid.CELL_SIZE * 0.15));
    const cols = Math.ceil(width / cellSize) + 6;
    const rows = Math.ceil(height / cellSize) + 6;
    const originX = -cellSize * 3;
    const originY = -cellSize * 3;

    const nodeCenters = nodes.map(node => this.grid.getNodeCenter(node));

    const field = [];
    for (let row = 0; row < rows; row++) {
      const rowData = [];
      const sampleY = originY + row * cellSize;
      for (let col = 0; col < cols; col++) {
        const sampleX = originX + col * cellSize;
        rowData.push(this.sampleInfluence(sampleX, sampleY, nodeCenters));
      }
      field.push(rowData);
    }

    return {
      data: field,
      rows,
      cols,
      cellSize,
      originX,
      originY
    };
  }

  /**
   * Sample influence at a point using Chebyshev distance
   * @private
   */
  sampleInfluence(x, y, influencePoints) {
    let value = 0;
    const baseRadius = Math.max(this.grid.CELL_SIZE * 0.6, 60);

    for (let i = 0; i < influencePoints.length; i++) {
      const ip = influencePoints[i];
      const dx = Math.abs(x - ip.x);
      const dy = Math.abs(y - ip.y);
      const chebyshev = Math.max(dx, dy);
      const influence = Math.max(0, 1 - chebyshev / baseRadius);
      value += influence;
    }

    return value;
  }

  /**
   * Generate contours using marching squares algorithm
   * @private
   */
  generateContours(field, customThresholds = null) {
    const thresholds = customThresholds || ContourConfig.thresholds;
    const groups = [];

    for (let thresholdIndex = 0; thresholdIndex < thresholds.length; thresholdIndex++) {
      const threshold = thresholds[thresholdIndex];
      const rawSegments = [];

      // Extract segments from field using marching squares
      for (let row = 0; row < field.rows - 1; row++) {
        for (let col = 0; col < field.cols - 1; col++) {
          const cell = this.extractCell(field, row, col);
          const segs = this.marchSquare(cell, threshold);
          if (!segs) continue;
          for (const seg of segs) {
            rawSegments.push({
              ax: seg[0].x, ay: seg[0].y, bx: seg[1].x, by: seg[1].y
            });
          }
        }
      }

      if (rawSegments.length === 0) continue;

      // Build polylines from segments
      const polylines = this.buildPolylines(rawSegments);
      const paths = [];

      for (const poly of polylines) {
        const smoothed = this.smoothPolyline(poly.points, poly.closed);
        if (smoothed.length < 2) continue;

        const path = new Path2D();
        path.moveTo(smoothed[0].x, smoothed[0].y);
        for (let i = 1; i < smoothed.length; i++) {
          path.lineTo(smoothed[i].x, smoothed[i].y);
        }
        if (poly.closed) {
          path.closePath();
        }
        paths.push({ path, closed: poly.closed, points: smoothed });
      }

      if (paths.length > 0) {
        groups.push({ colorIndex: thresholdIndex, paths });
      }
    }

    return { groups };
  }

  /**
   * Extract 2x2 cell from influence field
   * @private
   */
  extractCell(field, row, col) {
    const x = field.originX + col * field.cellSize;
    const y = field.originY + row * field.cellSize;
    return {
      x,
      y,
      size: field.cellSize,
      tl: field.data[row][col],
      tr: field.data[row][col + 1],
      br: field.data[row + 1][col + 1],
      bl: field.data[row + 1][col]
    };
  }

  /**
   * Marching squares algorithm for single cell
   * @private
   */
  marchSquare(cell, threshold) {
    const { x, y, size, tl, tr, br, bl } = cell;
    const caseIndex = (tl > threshold ? 8 : 0) | (tr > threshold ? 4 : 0) | (br > threshold ? 2 : 0) | (bl > threshold ? 1 : 0);

    if (caseIndex === 0 || caseIndex === 15) return null;

    const edges = [
      [[{ x, y }, tl], [{ x: x + size, y }, tr]],
      [[{ x: x + size, y }, tr], [{ x: x + size, y: y + size }, br]],
      [[{ x: x + size, y: y + size }, br], [{ x, y: y + size }, bl]],
      [[{ x, y: y + size }, bl], [{ x, y }, tl]]
    ];

    const lookup = {
      1: [3, 2], 2: [1, 2], 3: [3, 1], 4: [0, 1], 5: [0, 3, 1, 2], 6: [0, 2], 7: [3, 0],
      8: [0, 3], 9: [0, 2], 10: [0, 1, 2, 3], 11: [0, 1], 12: [3, 1], 13: [1, 2], 14: [3, 2]
    };

    const edgeIndices = lookup[caseIndex];
    if (!edgeIndices) return null;

    const points = [];
    for (let i = 0; i < edgeIndices.length; i++) {
      const edge = edges[edgeIndices[i]];
      points.push(this.interpolateEdge(edge[0], edge[1], threshold));
    }

    const segments = [];
    for (let i = 0; i < points.length; i += 2) {
      if (points[i] && points[i + 1]) {
        segments.push([points[i], points[i + 1]]);
      }
    }

    return segments.length ? segments : null;
  }

  /**
   * Interpolate point along edge
   * @private
   */
  interpolateEdge(start, end, threshold) {
    const [p0, v0] = start;
    const [p1, v1] = end;
    const denom = v0 - v1;
    if (denom === 0) {
      return { x: p0.x, y: p0.y };
    }

    const t = (v0 - threshold) / denom;
    return {
      x: p0.x + (p1.x - p0.x) * t,
      y: p0.y + (p1.y - p0.y) * t
    };
  }

  /**
   * Build continuous polylines from line segments
   * @private
   */
  buildPolylines(lines) {
    if (lines.length === 0) return [];

    const keyForPoint = (x, y) => `${x.toFixed(3)},${y.toFixed(3)}`;
    const adjacency = new Map();
    const used = new Array(lines.length).fill(false);

    const addEntry = (pointKey, entry) => {
      if (!adjacency.has(pointKey)) {
        adjacency.set(pointKey, []);
      }
      adjacency.get(pointKey).push(entry);
    };

    lines.forEach((line, index) => {
      addEntry(keyForPoint(line.ax, line.ay), { index, isStart: true });
      addEntry(keyForPoint(line.bx, line.by), { index, isStart: false });
    });

    const polylines = [];

    const extend = (poly, pointKey, direction) => {
      while (true) {
        const entries = adjacency.get(pointKey);
        if (!entries) break;

        let nextEntry = null;
        for (const entry of entries) {
          if (!used[entry.index]) {
            nextEntry = entry;
            break;
          }
        }

        if (!nextEntry) break;

        used[nextEntry.index] = true;
        const line = lines[nextEntry.index];
        let nextPoint;
        let nextKey;

        if (nextEntry.isStart) {
          nextPoint = { x: line.bx, y: line.by };
          nextKey = keyForPoint(line.bx, line.by);
        } else {
          nextPoint = { x: line.ax, y: line.ay };
          nextKey = keyForPoint(line.ax, line.ay);
        }

        if (direction === 'forward') {
          poly.push(nextPoint);
        } else {
          poly.unshift(nextPoint);
        }

        pointKey = nextKey;
      }
    };

    const pickUnusedIndexWithLooseEnd = () => {
      for (let i = 0; i < lines.length; i++) {
        if (used[i]) continue;

        const startKey = keyForPoint(lines[i].ax, lines[i].ay);
        const endKey = keyForPoint(lines[i].bx, lines[i].by);
        const startDegree = (adjacency.get(startKey)?.filter(entry => !used[entry.index]).length) || 0;
        const endDegree = (adjacency.get(endKey)?.filter(entry => !used[entry.index]).length) || 0;

        if (startDegree === 1 || endDegree === 1) {
          return i;
        }
      }
      return -1;
    };

    while (true) {
      let segmentIndex = pickUnusedIndexWithLooseEnd();
      if (segmentIndex === -1) {
        segmentIndex = used.findIndex(flag => !flag);
        if (segmentIndex === -1) {
          break;
        }
      }

      if (used[segmentIndex]) continue;

      used[segmentIndex] = true;
      const line = lines[segmentIndex];
      const polyline = [
        { x: line.ax, y: line.ay },
        { x: line.bx, y: line.by }
      ];

      extend(polyline, keyForPoint(line.bx, line.by), 'forward');
      extend(polyline, keyForPoint(line.ax, line.ay), 'backward');

      const cleaned = this.filterDuplicatePoints(polyline);
      let closed = false;
      if (cleaned.length > 2 && this.pointsAreClose(cleaned[0], cleaned[cleaned.length - 1], 0.5)) {
        cleaned.pop();
        closed = true;
      }

      polylines.push({ points: cleaned, closed });
    }

    return polylines;
  }

  /**
   * Smooth polyline using Chaikin's algorithm
   * @private
   */
  smoothPolyline(points, closed, iterations = 2) {
    let pts = points.slice();

    for (let iter = 0; iter < iterations; iter++) {
      if (closed) {
        if (pts.length < 3) break;
        const newPts = [];
        for (let i = 0; i < pts.length; i++) {
          const p0 = pts[i];
          const p1 = pts[(i + 1) % pts.length];
          newPts.push({
            x: 0.75 * p0.x + 0.25 * p1.x,
            y: 0.75 * p0.y + 0.25 * p1.y
          });
          newPts.push({
            x: 0.25 * p0.x + 0.75 * p1.x,
            y: 0.25 * p0.y + 0.75 * p1.y
          });
        }
        pts = newPts;
      } else {
        if (pts.length < 3) break;
        const newPts = [pts[0]];
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[i];
          const p1 = pts[i + 1];
          newPts.push({
            x: 0.75 * p0.x + 0.25 * p1.x,
            y: 0.75 * p0.y + 0.25 * p1.y
          });
          newPts.push({
            x: 0.25 * p0.x + 0.75 * p1.x,
            y: 0.25 * p0.y + 0.75 * p1.y
          });
        }
        newPts.push(pts[pts.length - 1]);
        pts = newPts;
      }
    }

    return this.filterDuplicatePoints(pts);
  }

  /**
   * Render contours to overlay context
   * @private
   */
  renderContours(ctx, path2d, contourData, nodes) {
    const strokeColors = ContourConfig.strokeColors;
    const fillColors = ContourConfig.fillColors;

    ctx.clearRect(0, 0, this.grid.canvas.width, this.grid.canvas.height);

    // Draw background pattern
    const backgroundPattern = this.getBackgroundPattern(ctx);
    if (backgroundPattern) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = backgroundPattern;
      ctx.fillRect(0, 0, this.grid.canvas.width, this.grid.canvas.height);
      ctx.restore();
    }

    const nodeCenters = nodes.map(node => this.grid.getNodeCenter(node));
    const outermostGroupIndex = contourData.groups.length > 0 ? contourData.groups[contourData.groups.length - 1].colorIndex : -1;
    const hatchPattern = this.getInnermostHatchPattern(ctx);

    // Draw contour groups from outermost to innermost
    for (let index = contourData.groups.length - 1; index >= 0; index--) {
      const group = contourData.groups[index];
      const strokeColor = strokeColors[group.colorIndex % strokeColors.length];

      // Find primary (largest) closed path
      const closedPaths = [];
      group.paths.forEach(entry => {
        if (entry.closed && entry.points && entry.points.length >= 3) {
          entry._polygonArea = this.computePolygonArea(entry.points);
          closedPaths.push(entry);
        }
      });

      let primaryPathId = null;
      let largestArea = 0;
      for (let i = 0; i < closedPaths.length; i++) {
        const info = closedPaths[i];
        const absArea = Math.abs(info._polygonArea);
        if (absArea > largestArea) {
          largestArea = absArea;
          primaryPathId = closedPaths[i];
        }
      }

      // Fill and stroke each path
      group.paths.forEach(entry => {
        const { path, closed } = entry;
        if (closed) {
          let fillColor = fillColors[group.colorIndex % fillColors.length];
          const isOutermostPath = group.colorIndex === outermostGroupIndex;

          // Apply hatch pattern to outermost negative space (holes without nodes)
          if (isOutermostPath && hatchPattern) {
            const isPrimary = primaryPathId && entry === primaryPathId;

            if (!isPrimary) {
              const nodesInside = nodeCenters.filter(center => ctx.isPointInPath(path, center.x, center.y)).length;

              if (nodesInside === 0) {
                console.log(
                  `🟢 Hatch contour group ${index} | area=${entry._polygonArea?.toFixed(1) || 'n/a'} ` +
                  `primaryArea=${primaryPathId?._polygonArea?.toFixed(1) || 'n/a'}`
                );
                fillColor = hatchPattern;
              } else {
                console.log(
                  `⚪️ Skip contour group ${index} (contains ${nodesInside} nodes) | area=${entry._polygonArea?.toFixed(1) || 'n/a'}`
                );
              }
            } else {
              console.log(
                `⚪️ Skip contour group ${index} (primary) | area=${entry._polygonArea?.toFixed(1) || 'n/a'}`
              );
            }
          }

          this.fillContour(ctx, path, fillColor);
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke(path);
      });
    }

    // Cut out path from contours
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#000';
    ctx.stroke(path2d);
    ctx.restore();

    // Draw subtle path border
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(154, 136, 110, 0.1)';
    ctx.lineWidth = 20;
    ctx.stroke(path2d);
    ctx.restore();
  }

  /**
   * Fill contour interior
   * @private
   */
  fillContour(ctx, path, fillStyle) {
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.fill(path, 'nonzero');
    ctx.restore();
  }

  /**
   * Compute signed polygon area (shoelace formula)
   * @private
   */
  computePolygonArea(points) {
    if (!points || points.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const p0 = points[i];
      const p1 = points[(i + 1) % points.length];
      area += (p0.x * p1.y) - (p1.x * p0.y);
    }

    return area * 0.5;
  }

  /**
   * Filter consecutive duplicate points
   * @private
   */
  filterDuplicatePoints(points) {
    if (points.length === 0) return [];
    const result = [points[0]];
    for (let i = 1; i < points.length; i++) {
      if (!this.pointsAreClose(points[i], result[result.length - 1], 0.5)) {
        result.push(points[i]);
      }
    }
    return result;
  }

  /**
   * Check if two points are within tolerance
   * @private
   */
  pointsAreClose(a, b, tolerance = 0.5) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return (dx * dx + dy * dy) <= tolerance * tolerance;
  }

  /**
   * Get or create background pattern
   * @private
   */
  getBackgroundPattern(ctx) {
    if (!this.backgroundPattern) {
      this.backgroundPattern = PatternFactory.createBackgroundPattern(ctx);
    }
    return this.backgroundPattern;
  }

  /**
   * Get or create contour fill pattern
   * @private
   */
  getContourFillPattern(ctx, levelIndex) {
    if (!this.contourFillPatterns.has(levelIndex)) {
      const pattern = PatternFactory.createContourFillPattern(ctx, levelIndex);
      this.contourFillPatterns.set(levelIndex, pattern);
    }
    return this.contourFillPatterns.get(levelIndex);
  }

  /**
   * Get or create innermost hatch pattern
   * @private
   */
  getInnermostHatchPattern(ctx) {
    if (!this.innermostHatchPattern) {
      this.innermostHatchPattern = PatternFactory.createInnermostHatchPattern(
        ctx,
        ContourConfig.strokeColors[2]
      );
    }
    return this.innermostHatchPattern;
  }

  /**
   * Clear cached resources
   */
  clear() {
    this.overlayCanvas = null;
    this.overlayVersion = null;
    this.contourFillPatterns.clear();
    this.backgroundPattern = null;
    this.innermostHatchPattern = null;
  }
}
