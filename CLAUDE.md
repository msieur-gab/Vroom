# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vroom Grid is a mobile-first Progressive Web Application that transforms travel photography into a visual grid-based journey. Photos are positioned on an orthogonal grid based on cumulative distance traveled, with roads connecting them in a serpentine (boustrophedon) pattern. The project focuses on visual storytelling through an engaging game-like representation of real-world adventures.

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
vroom-grid/
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

**Smooth serpentine paths** using semicircular U-turns (`OrganicPathfinder.js`):
- **Compass method**: Semicircle center at midpoint between entry/exit, radius = distance/2
- **Waypoint strategy**: Nodes and waypoints positioned at cell centers (not edges)
- **Arc cells**: Cells 0 (leftmost) and 4 (rightmost) reserved for U-turn arcs
- **Horizontal padding**: 30px prevents arc overflow beyond canvas edges

**Waypoint generation** (`OrganicPathfinder.js:146-207`):
- Same row: Direct connection between cell centers
- Row transitions: Add waypoints at arc cell centers (cell 0 or 4)
- Intermediate rows: Entry and exit waypoints for complete serpentine flow
- Left-aligned grid (no centering) for predictable positioning

**U-turn rendering** (`OrganicPathfinder.js:83-119`):
```javascript
// Compass method for perfect semicircles
const dx = next.x - curr.x;
const dy = next.y - curr.y;
const radius = Math.sqrt(dx*dx + dy*dy) / 2;  // Half the diagonal distance
const centerX = (curr.x + next.x) / 2;         // Midpoint
const centerY = (curr.y + next.y) / 2;

// Draw arc (clockwise for right turns, counter-clockwise for left)
path.arc(centerX, centerY, radius, startAngle, endAngle, clockwise);
```

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
