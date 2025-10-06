# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vrooom is a mobile-first Progressive Web Application that transforms travel photography into a visual grid-based journey. Photos are positioned on an orthogonal grid based on cumulative distance traveled, with roads connecting them in a serpentine (boustrophedon) pattern. The project focuses on visual storytelling through an engaging game-like representation of real-world adventures.

## Core Concept

- **Grid-based positioning**: Distance determines cell position (20km per cell, 5 cells per row = 100km per row)
- **Serpentine path pattern**: Alternating left-to-right and right-to-left flow per row (like reading ancient Greek)
- **Canvas rendering**: High-performance scrolling with viewport culling for thousands of nodes
- **Responsive grid**: Dynamic cell sizing adapts to any mobile screen size (min 60px)
- **Organic pathfinding**: Smooth semicircular U-turns using compass method for natural road flow
- **Distance-based milestones**: Achievement system unlocks badges at specific kilometer thresholds

## Development Commands

### Local Development
```bash
# No build process - pure vanilla JavaScript
# Serve with any static HTTP server

# Simple HTTP server (Python)
python3 -m http.server 8080

# Alternative (Node.js)
npx http-server . -p 8080

# For PWA features (HTTPS required for Camera, Geolocation, NFC):
npx http-server . -S -C cert.pem -K key.pem -p 8080
```

### Testing
No formal test framework - all testing is manual via browser console.

**Interactive testing methods** available via `window.vroom`:
```javascript
// Add nodes with trip distance (incremental)
window.vroom.addNode(25)  // Adds 25km to journey

// Add node at absolute distance
window.vroom.addNodeAt(100)  // Places node at exactly 100km

// Clear all data
window.vroom.clear()

// Generate sample journey
window.vroom.testJourney()

// Show grid statistics
window.vroom.showStats()

// Test cell calculations
window.vroom.testCells()

// Debug state
window.vroom.debug()
```

## Architecture

### Core Technology Stack
- **Frontend**: Vanilla JavaScript ES6 modules (no framework)
- **Graphics**: HTML5 Canvas with responsive grid rendering
- **Data Storage**: In-memory (Map/Set) - no persistence layer yet
- **Pathfinding**: Organic semicircular U-turns using Canvas arc() API and compass geometry
- **PWA Features**: Geolocation API for GPS tracking, Camera API for photo capture, Haversine distance calculations
- **UI Components**: Singleton modal system for memory efficiency

### Project Structure
```
vrooom/
├── src/
│   ├── core/                    # Business logic
│   │   ├── TravelGrid.js        # Grid coordinate system & data storage
│   │   └── MilestoneEngine.js   # Achievement tracking system
│   ├── services/                # Device API integrations
│   │   ├── camera.js            # Photo capture service (file input approach)
│   │   └── geolocation.js       # GPS tracking & Haversine distance calculations
│   ├── ui/                      # Rendering & interaction
│   │   ├── CanvasJourneyGrid.js # Main Canvas renderer with responsive grid & serpentine layout
│   │   ├── OrganicPathfinder.js # Smooth semicircular pathfinding for road visualization
│   │   ├── NodeComponent.js     # Interactive node overlays with schema-driven modals
│   │   └── Modal.js             # Reusable modal component (singleton)
│   ├── schemas/                 # JSON schemas for different node types
│   │   ├── journey.json         # Photo node schema
│   │   ├── milestone.json       # Achievement schema
│   │   ├── reward.json          # Reward badge schema
│   │   └── checkpoint.json      # Checkpoint schema
│   └── app.js                   # Main application controller
├── styles/
│   └── main.css                 # Complete styles with modal, photo preview, and responsive design
├── index.html                   # Entry point with photo preview UI
└── node-prototype.html          # Node interaction prototype
```

## Key Implementation Patterns

### Grid Coordinate System

The grid uses a **serpentine (boustrophedon) pattern** where rows alternate direction:
- **Row 0 (even)**: Left → Right (columns 0-4)
- **Row 1 (odd)**: Right → Left (columns 4-0)
- **Row 2 (even)**: Left → Right (columns 0-4)

**Distance to grid conversion** (`TravelGrid.js:27-40`, `CanvasJourneyGrid.js:128-150`):
```javascript
// Distance → Cell Index → Row/Col
const cellIndex = Math.ceil(distance / KM_PER_CELL);  // 20km per cell
const row = Math.floor(cellIndex / CELLS_PER_ROW);    // 5 cells per row

// Serpentine column calculation
const positionInRow = cellIndex % CELLS_PER_ROW;
const col = (row % 2 === 0)
  ? positionInRow                           // Even row: L→R
  : CELLS_PER_ROW - 1 - positionInRow;      // Odd row: R→L
```

### Visual vs Real Distance Tracking

The system maintains TWO distance values (`app.js:76-109`):
1. **Real Distance**: Actual cumulative kilometers for statistics and milestones
2. **Visual Distance**: Adjusted value for grid positioning to ensure correct cell placement

This separation prevents rounding errors from accumulating over many photos.

### Road Rendering with Organic Pathfinding

The organic pathfinding system creates smooth, natural-looking serpentine roads connecting nodes. This was **extremely challenging to implement** - the key breakthrough was positioning waypoints at cell centers and using the compass method for U-turns.

#### Core Principles

**Critical Design Decision: Waypoints at Cell Centers**
- ALL waypoints (nodes and intermediate points) are positioned at **cell centers**, never at edges
- This single decision made the compass method work perfectly
- Cell centers provide consistent geometry for semicircular arcs
- Arc cells (leftmost/rightmost) serve as natural turning zones

**Arc Cell Strategy** (`OrganicPathfinder.js`):
- **Cell 0 (leftmost)**: Reserved for left U-turns (odd row → even row)
- **Cell 4 (rightmost)**: Reserved for right U-turns (even row → odd row)
- These cells are ONLY used for arc waypoints, never for node placement
- Ensures U-turns have space to curve naturally without overlapping grid cells

#### The Compass Method for U-Turns

This was the **hardest part to get right**. After many failed attempts with manual arc calculations, the compass method emerged as the elegant solution.

**How it works** (`OrganicPathfinder.js:70-118`):

Imagine placing a physical compass at the midpoint between two waypoints:
1. **Radius**: Half the diagonal distance between entry and exit waypoints
2. **Center**: Exact midpoint between the two waypoints
3. **Arc**: The compass naturally draws a perfect semicircle connecting them

```javascript
// STEP 1: Calculate diagonal distance between waypoints
const dx = next.x - curr.x;
const dy = next.y - curr.y;
const distance = Math.sqrt(dx * dx + dy * dy);

// STEP 2: Radius = half the distance (KEY INSIGHT!)
const radius = distance / 2;

// STEP 3: Center = midpoint (ensures arc passes through both points)
const centerX = (curr.x + next.x) / 2;
const centerY = (curr.y + next.y) / 2;

// STEP 4: Calculate angles from center to waypoints
const startAngle = Math.atan2(curr.y - centerY, curr.x - centerX);
const endAngle = Math.atan2(next.y - centerY, next.x - centerX);

// STEP 5: Draw arc in correct direction
// Even rows (L→R): clockwise turn to the right
// Odd rows (R→L): counter-clockwise turn to the left
if (isEvenRow) {
  path.arc(centerX, centerY, radius, startAngle, endAngle, false); // clockwise
} else {
  path.arc(centerX, centerY, radius, startAngle, endAngle, true);  // counter-clockwise
}
```

**Why this works:**
- The geometry guarantees the arc passes exactly through both waypoints
- No manual control point calculations needed
- Works for any cell size and grid configuration
- Semicircles naturally curve through the arc cells

#### Waypoint Generation Strategy

**Same-row connections** (`OrganicPathfinder.js:172-175`):
```javascript
if (fromRow === toRow) {
  // Direct line from cell center to cell center
  addWaypoint(this.getCellCenter(toRow, toCol));
}
```

**Row transitions with serpentine flow** (`OrganicPathfinder.js:185-216`):
```javascript
// Example: Node at (row 0, col 2) → Node at (row 2, col 1)

// 1. Travel to end of current row
addWaypoint(this.getCellCenter(0, 4)); // rightmost cell of row 0

// 2. For each intermediate row, add entry/exit waypoints
addWaypoint(this.getCellCenter(1, 4)); // entry to row 1 (rightmost)
addWaypoint(this.getCellCenter(1, 0)); // exit from row 1 (leftmost)

// 3. Enter destination row at arc cell
addWaypoint(this.getCellCenter(2, 0)); // entry to row 2 (leftmost)

// 4. Travel to destination node
addWaypoint(this.getCellCenter(2, 1)); // destination node center
```

**Aligned column optimization** (`OrganicPathfinder.js:221-271`):

When nodes in adjacent rows share the same (or nearby) column AND moving forward in the row's flow direction, skip the serpentine detour:

```javascript
// Instead of: node(1,2) → arc(1,4) → arc(2,0) → node(2,2)
// Go direct:   node(1,2) → node(2,2) (vertical alignment)

shouldUseAlignedColumnTransition(fromNode, toNode) {
  const rowDelta = Math.abs(toRow - fromRow);
  if (rowDelta !== 1) return false; // Only for adjacent rows

  const toRowDirection = toRow % 2 === 0 ? 1 : -1;
  const relativeDirection = (toCol - fromCol) * toRowDirection;

  // Only align if moving forward in row's natural flow
  return relativeDirection >= 0;
}
```

This prevents unnecessary detours when nodes naturally align vertically.

#### Path Rendering Cache

**Performance optimization** (`CanvasJourneyGrid.js:36-43`):

The pathfinding calculations are expensive - sorting nodes, generating waypoints, creating Path2D objects. Originally these ran on **every redraw**, including every scroll event.

**Cache structure:**
```javascript
this.pathCache = {
  sortedNodes: null,      // Nodes sorted in serpentine order
  waypoints: null,        // Generated waypoint positions
  organicPath: null,      // Path2D object for organic rendering
  orthogonalPath: null,   // Waypoints for orthogonal rendering
  isDirty: true           // Rebuild flag
};
```

**Cache invalidation** - only when geometry actually changes:
- **Node added** (`addNode()` at line 216): New node changes the path
- **Nodes cleared** (`clearNodes()` at line 782): Complete rebuild needed
- **Window resize** (`repositionAllNodes()` at line 821): Cell positions change

**Performance impact:**
- **Before**: 30-50 path calculations per second during scrolling
- **After**: 1 calculation per node addition, 0 during scroll
- Smooth 60fps scrolling even with hundreds of nodes

**How it works** (`CanvasJourneyGrid.js:297-356`):
```javascript
drawRoads(visibleTop, visibleBottom) {
  // Check if cache needs rebuilding
  if (this.pathCache.isDirty) {
    this.rebuildPathCache(); // Expensive calculation
  }

  // Just draw the cached Path2D object
  this.drawOrganicPath(this.pathCache.organicPath);
}

rebuildPathCache() {
  // Sort nodes in serpentine order (once)
  this.pathCache.sortedNodes = Array.from(this.nodes.values())
    .sort((a, b) => {
      const cellA = this.getSerpentineCellIndex(a.coords.row, a.coords.col);
      const cellB = this.getSerpentineCellIndex(b.coords.row, b.coords.col);
      return cellA - cellB;
    });

  // Generate waypoints (once)
  this.pathCache.waypoints = this.organicPathfinder.generateOrganicWaypoints(
    this.pathCache.sortedNodes
  );

  // Create Path2D object (once)
  this.pathCache.organicPath = this.organicPathfinder.createOrganicSerpentinePath(
    this.pathCache.sortedNodes
  );

  this.pathCache.isDirty = false; // Cache is fresh
}
```

#### Common Pitfalls (Lessons Learned)

**❌ DON'T position waypoints at cell edges**
- Causes inconsistent arc geometry
- Requires complex manual calculations
- Different math for left vs right turns

**✅ DO position waypoints at cell centers**
- Compass method "just works"
- Consistent geometry for all arc types
- Same calculation for all configurations

**❌ DON'T recalculate paths on every redraw**
- Kills scroll performance
- Wastes CPU on identical calculations
- Causes visual stuttering

**✅ DO cache paths and invalidate only when needed**
- Smooth 60fps scrolling
- Calculations only when geometry changes
- Minimal memory overhead

**❌ DON'T use hardcoded arc control points**
- Breaks when cell size changes
- Different configs need different values
- Hard to maintain and debug

**✅ DO use the compass method with dynamic calculations**
- Works for any cell size (60px-80px)
- Adapts to any grid configuration
- Self-documenting code

### Milestone System

**Distance-based achievements** (`MilestoneEngine.js:14-81`):
- Predefined milestones at: 5km, 25km, 100km, 250km, 500km, 1000km, 3844km, 40075km
- Checked after each node addition (`app.js:354-366`)
- Milestones create special visual nodes on the grid

### Responsive Grid System

**Dynamic cell sizing** (`CanvasJourneyGrid.js:97-123`):
- Calculates optimal cell size based on screen width
- Minimum 60px, maximum 80px per cell
- Formula: `(screenWidth - 2*HORIZONTAL_PADDING - 6*CELL_PADDING) / 5`
- Horizontal padding (30px) prevents U-turn arcs from overflowing
- Left-aligned grid (no centering) for consistent arc geometry

**Benefits**:
- Works on any mobile screen size (320px - 428px+)
- Larger cells on tablets for better touch targets
- Maintains 5 cells per row for serpentine pattern
- Arc geometry automatically adjusts to cell size

### Canvas Rendering with Viewport Culling

**Performance optimization** (`CanvasJourneyGrid.js:189-207`):
- Only renders grid cells and nodes visible in viewport
- 100px buffer above/below viewport for smooth scrolling
- Dynamic canvas height based on maximum distance
- Automatic redraw on scroll and resize events
- Recalculates cell size on window resize for responsive layout

**Node types** with distinct visual styling:
- `start`: Gold node at journey beginning
- `milestone`: Colored badge nodes with emoji icons
- `regular`: Blue photo nodes with cell index
- `journey`: Interactive photo nodes with custom data

### Interactive Node Components

**DOM overlay system** (`CanvasJourneyGrid.js:34-36`, `851-884`):
- Transparent DOM layer over canvas for click interactions
- `NodeComponent` instances handle modal displays
- Schema-driven content rendering from `src/schemas/`
- Both journey and milestone nodes are interactive

**Reusable Modal System** (`Modal.js`):
- Singleton pattern - one modal instance reused across entire app
- DOM structure created once, content swapped for each display
- Automatic cleanup and animation handling
- API usage:
```javascript
Modal.show({
  title: 'Node Details',
  content: '<div>HTML content</div>',  // or HTMLElement
  width: '500px',
  maxHeight: '80vh',
  onClose: () => console.log('modal closed')
});
Modal.hide();  // Programmatic close
```

**Schema-driven modals** (`NodeComponent.js:22-34`, `289-349`):
- Each node type loads its own JSON schema from `src/schemas/`
- Schema defines icon, color, modal title, and content fields
- Field types include: header, image, gallery, tags, stat, status, rarity, list, date
- Content dynamically generated based on schema field definitions
- NodeComponent uses Modal.show() to display schema-rendered content

### Camera Integration

**Photo capture workflow** (`app.js:133-191`, `camera.js:24-142`):
1. User taps "Take Photo" button
2. File input opens native camera UI (better compatibility than getUserMedia)
3. Photo processed into data URL with thumbnail generation
4. GPS position acquired and distance calculated
5. Photo preview modal displays image, location, and distance
6. User accepts/rejects photo before adding to grid

**File input approach** (`camera.js:55-142`):
- Uses `<input type="file" accept="image/*" capture="environment">`
- Works reliably across iOS and Android devices
- Triggers native camera app instead of custom video stream
- Returns full resolution image data with metadata

### Geolocation & Distance Tracking

**GPS position tracking** (`geolocation.js:46-78`):
- `getCurrentPosition()` returns fresh GPS coordinates (maximumAge: 0)
- Does NOT automatically update lastPosition - caller controls state
- High accuracy mode with 30s timeout for mobile networks
- Handles permission errors gracefully

**Haversine distance calculation** (`geolocation.js:150-165`):
- Earth radius: 6371km
- Converts lat/lon degrees to radians
- Uses spherical law of cosines for accuracy
- Returns distance in kilometers with 2 decimal precision

**Distance state management** (`app.js:156-175`):
- First photo: Sets home position, distance = 0km
- Subsequent photos: Calculate distance from lastPosition
- Update lastPosition AFTER distance calculation (critical for accuracy)
- Prevents position caching issues by using maximumAge: 0

**Common pitfall**: Chrome DevTools can cache GPS positions. Always set `maximumAge: 0` in geolocation options to force fresh readings during testing.

## Important Technical Notes

### Memory Management
- `TravelGrid.photoNodes` uses Map for O(1) lookups
- Node components must be destroyed when cleared (`clearNodes()`)
- Canvas path calculations happen on-demand during redraw

### Coordinate Systems
Three coordinate systems are used:
1. **Distance** (km): 0, 15, 32, 67...
2. **Grid** (row, col): (0,0), (0,1), (1,4)...
3. **Screen** (x, y pixels): Canvas absolute positions

Always use the appropriate converter methods to move between systems.

### Grid Configuration Constants
These are **tightly coupled** across multiple files - changing one requires updating all:
- `KM_PER_CELL`: 20km (distance per grid cell)
- `CELLS_PER_ROW`: 5 cells (defines serpentine width)
- `CELL_SIZE`: 60-80px (dynamic responsive sizing, max 80px)
- `CELL_PADDING`: 4px (spacing between cells)
- `HORIZONTAL_PADDING`: 30px (prevents U-turn arc overflow)

Located in: `TravelGrid.js:8-9`, `CanvasJourneyGrid.js:16-24`, `OrganicPathfinder.js:15-19`

### Serpentine Row Transitions
The key to smooth U-turns is positioning waypoints at **cell centers** in arc cells:
- **Even rows (L→R)**: Exit from cell 4 center, U-turn through cell 4, enter cell 0 center (next row)
- **Odd rows (R→L)**: Exit from cell 0 center, U-turn through cell 0, enter cell 4 center (next row)
- Arc geometry automatically perfect because waypoints define entry/exit points
- No manual edge calculations needed - compass method handles everything

See `OrganicPathfinder.js:83-119` for U-turn arc rendering, `OrganicPathfinder.js:146-207` for waypoint generation.

## Data Flow

### Photo Capture Flow (Real Device)
```
User taps "Take Photo"
    ↓
Camera service opens native camera UI (camera.js)
    ↓
User captures photo → File input processes image
    ↓
Geolocation acquires GPS position (geolocation.js)
    ↓
Calculate distance from lastPosition using Haversine (geolocation.js)
    ↓
Photo preview modal displays (app.js:showPhotoPreview)
    ↓
User accepts → Add node at calculated distance
    ↓
Add to TravelGrid (core/TravelGrid.js)
    ↓
Add to CanvasJourneyGrid (ui/CanvasJourneyGrid.js)
    ↓
Convert distance → grid coords (serpentine)
    ↓
Create interactive NodeComponent with schema (NodeComponent.js)
    ↓
Render canvas with roads (organic pathfinding with semicircular U-turns)
    ↓
Check milestones (core/MilestoneEngine.js)
    ↓
Add milestone nodes if unlocked (app.js:addMilestoneNode)
    ↓
Update stats display (exclude milestones from photo count)
```

### Manual Node Addition (Console Testing)
```
User calls window.vroom.addNode(distance)
    ↓
Calculate real vs visual distance (app.js)
    ↓
Add to TravelGrid (core/TravelGrid.js)
    ↓
Add to CanvasJourneyGrid (ui/CanvasJourneyGrid.js)
    ↓
Convert distance → grid coords (serpentine)
    ↓
Render canvas with roads (organic pathfinding with semicircular U-turns)
    ↓
Check milestones (core/MilestoneEngine.js)
    ↓
Update stats display
```

## Common Development Tasks

### Adding a New Node Type
1. Create schema in `src/schemas/your-type.json`
2. Add type-specific rendering in `NodeComponent.js`
3. Add test method to `app.js` window.vroom API
4. Define visual styling in `CanvasJourneyGrid.drawNode()`

### Modifying Grid Layout
- Update `KM_PER_CELL` or `CELLS_PER_ROW` constants
- **MUST update in all three files**: `TravelGrid.js`, `CanvasJourneyGrid.js`, `OrganicPathfinder.js`
- Responsive grid will auto-adjust cell size (60-80px range)
- Test thoroughly with `window.vroom.testCells()`

### Debugging Road Rendering
- Check console for `🎨 Creating path through N waypoints` debug logs
- Use `window.vroom.showStats()` to verify grid configuration and cell size
- Inspect U-turn geometry with logs showing start/end angles and radius
- Verify waypoints are at cell centers (not edges) for smooth arcs

### Testing Photo Capture & GPS
- Use Chrome DevTools → Sensors → Location override for GPS testing
- Set `maximumAge: 0` to prevent position caching during development
- Console logs include emoji prefixes: 📷 camera, 📍 GPS, 📏 distance, 🏠 home position
- Test workflow: Take photo → Check distance calculation → Verify milestone unlocks
- Important: Update `lastPosition` AFTER distance calculation, not before

### Performance Optimization
- Viewport culling already implemented for nodes/cells
- For very long journeys (>10000km), consider virtual scrolling enhancements
- Canvas redraws are throttled by browser's requestAnimationFrame

## Browser Compatibility

- **Target**: Modern mobile browsers (Chrome, Safari iOS 14+)
- **Canvas API**: Required for rendering
- **ES6 Modules**: Required (no transpilation)
- **Optional PWA APIs**: Geolocation, Camera (graceful degradation)

## Future Enhancements (from README)

- IndexedDB persistence layer
- Multi-car support with colored paths
- Social sharing (export journey maps)
- AR integration for planning
- WebGL rendering for large grids (>50000km)
- Web Workers for background pathfinding
