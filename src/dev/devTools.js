/**
 * Development Tools for Vroom Grid
 * Console testing utilities - only loaded in development mode
 */

import { databaseService } from '../services/database.js';
import { geolocationService } from '../services/geolocation.js';
import { objectURLManager } from '../utils/objectURLManager.js';

/**
 * Initialize development tools on window.vroom
 * @param {VrooomApp} app - Main application instance
 */
export function initDevTools(app) {
  console.log('🛠️  Dev tools loaded. Access via window.vroom');

  window.vroom = {
    // Add a photo node with trip distance (gets added to cumulative total)
    addNode: (tripDistance, data = {}) => {
      const { KM_PER_CELL } = app.canvasGrid;
      const existingNodes = app.grid.getNodesByDistance();
      const lastNode = existingNodes.length > 0 ? existingNodes[existingNodes.length - 1] : null;

      // 1. Calculate the REAL cumulative distance for stats and milestones.
      // We track the "real" distance separately from the "visual" one.
      const lastRealDistance = lastNode ? (lastNode.data.realDistance || lastNode.distance) : 0;
      const realCumulativeDistance = lastRealDistance + tripDistance;

      // 2. Calculate the VISUAL distance for placement based on relative cell jumps.
      // The previous node's cell is our starting point (reference "0").
      const lastNodeCellIndex = lastNode ? Math.ceil(lastNode.distance / KM_PER_CELL) : 0;

      // The number of cells to jump is based purely on the trip distance.
      const cellJump = Math.ceil(tripDistance / KM_PER_CELL);
      const newCellIndex = lastNodeCellIndex + cellJump;

      // Calculate a "visual" cumulative distance that will place the node in the correct cell.
      let visualCumulativeDistance = 0;
      if (newCellIndex > 0) {
        // We place it 1km into the target cell's range to ensure it lands there.
        visualCumulativeDistance = ((newCellIndex - 1) * KM_PER_CELL) + 1;
      }

      console.log(`📍 Adding node: +${tripDistance}km trip → ${realCumulativeDistance}km total (real)`);

      // Add to data grid using the VISUAL distance for positioning
      const nodeId = app.grid.addPhotoNode(visualCumulativeDistance, { ...data, realDistance: realCumulativeDistance });

      // Add to canvas grid using the VISUAL distance for positioning
      const gridCellId = app.canvasGrid.addNode(visualCumulativeDistance, {
        id: nodeId,
        tripDistance: tripDistance,
        realDistance: realCumulativeDistance,
        ...data
      });

      app.checkAndupdate(realCumulativeDistance);
      return { nodeId, gridCellId, cumulativeDistance: visualCumulativeDistance, realDistance: realCumulativeDistance };
    },

    // Add node at absolute distance (for testing specific positions)
    addNodeAt: (absoluteDistance, data = {}) => {
      console.log(`📍 Adding node at absolute ${absoluteDistance}km`);
      const nodeId = app.grid.addPhotoNode(absoluteDistance, data);

      // Add to canvas grid
      const gridCellId = app.canvasGrid.addNode(absoluteDistance, { id: nodeId, ...data });

      app.checkAndupdate(absoluteDistance);
      return { nodeId, gridCellId, cumulativeDistance: absoluteDistance };
    },

    // Redraw canvas (roads are drawn automatically)
    generatePaths: () => {
      console.log('🎨 Redrawing canvas...');

      // Canvas draws roads automatically during redraw
      app.canvasGrid.redraw();

      return 'Canvas redrawn';
    },

    // Clear all data
    clear: async () => {
      console.log('🧹 Clearing all data...');

      // Clear database
      await databaseService.clearJourney();

      // Clear in-memory data
      app.grid.clear();
      app.canvasGrid.clearNodes(); // Clear canvas nodes
      app.milestoneEngine.reset(); // Reset achievements
      geolocationService.reset();   // Reset geolocation (clears lastPosition and homePosition)
      objectURLManager.revokeAll(); // Revoke all object URLs to prevent memory leaks
      app.updateStats(0);          // Reset statistics to 0

      console.log('✅ All data cleared (memory + database)');
    },

    // Create a sample journey for testing
    testJourney: () => {
      console.log('🚗 Creating test journey...');

      // Clear existing data
      app.grid.clear();

      // Add nodes at various distances to create interesting paths
      const distances = [0, 15, 32, 67, 89, 124, 156, 203, 245, 298, 334, 387, 421, 456, 489];

      distances.forEach((distance, index) => {
        const nodeData = {
          name: `Photo ${index + 1}`,
          description: `Taken at ${distance}km mark`
        };

        // Add to data grid
        const nodeId = app.grid.addPhotoNode(distance, nodeData);

        // Add to canvas grid
        app.canvasGrid.addNode(distance, { id: nodeId, ...nodeData });
      });

      // Canvas will redraw automatically after adding nodes

      // Check milestones and update stats
      const maxDistance = distances.length > 0 ? Math.max(...distances) : 0;
      app.checkAndupdate(maxDistance);

      // Center view after grid is populated
      setTimeout(() => {
        console.log('🎯 Journey created successfully');
      }, 100);

      console.log(`✅ Created ${distances.length} nodes on canvas`);
      return { nodes: distances.length };
    },

    // Show grid statistics
    showStats: () => {
      console.log('📊 Canvas statistics:', app.canvasGrid.getStats());
    },

    // Debug grid state
    debug: () => {
      app.grid.debugState();
      app.milestoneEngine.debugState();
    },

    // Debug milestones specifically
    milestones: () => {
      console.log('🏆 Available milestones:');
      app.milestoneEngine.milestones.forEach(m => {
        const unlocked = app.milestoneEngine.isMilestoneUnlocked(m.id) ? '✅' : '🔒';
        console.log(`  ${unlocked} ${m.icon} ${m.name} - ${m.distance}km`);
      });
    },

    // Get access to core objects for advanced testing
    getGrid: () => app.grid,
    getPathRouter: () => app.pathRouter,
    getRenderer: () => app.renderer,

    // Test cell calculations
    testCells: () => {
      if (!app.canvasGrid) {
        console.error("Canvas grid not initialized.");
        return;
      }
      const { KM_PER_CELL, CELLS_PER_ROW } = app.canvasGrid;
      console.log(`🧪 Testing cell calculations (KM_PER_CELL: ${KM_PER_CELL}, CELLS_PER_ROW: ${CELLS_PER_ROW}):`);
      const testDistances = [0, 5, 9.9, 10, 15, 21, 36, 99, 100, 101, 120];

      testDistances.forEach(dist => {
        // Use the renderer's own logic to ensure consistency
        const { row, col, cellIndex } = app.canvasGrid.distanceToCoords(dist);
        console.log(`${dist}km → cell ${cellIndex} → (${row}, ${col})`);
      });
    },

    // Add interactive schema-driven nodes for testing (uses same logic as addNode)
    addJourneyNode: (tripDistance, data = {}) => {
      const journeyData = {
        title: data.title || 'Journey Photo',
        description: data.description || 'A beautiful moment captured during the journey',
        image: data.image || 'https://picsum.photos/400/300?random=' + Math.floor(Math.random() * 100),
        location: data.location || 'Scenic Route',
        weather: data.weather || 'sunny',
        mood: data.mood || 'peaceful',
        tags: data.tags || ['adventure', 'nature'],
        ...data
      };

      // Use the same placement logic as addNode
      const { KM_PER_CELL } = app.canvasGrid;
      const existingNodes = app.grid.getNodesByDistance();
      const lastNode = existingNodes.length > 0 ? existingNodes[existingNodes.length - 1] : null;

      // Calculate real cumulative distance
      const lastRealDistance = lastNode ? (lastNode.data.realDistance || lastNode.distance) : 0;
      const realCumulativeDistance = lastRealDistance + tripDistance;

      // Calculate visual distance for placement
      const lastNodeCellIndex = lastNode ? Math.ceil(lastNode.distance / KM_PER_CELL) : 0;
      const cellJump = Math.ceil(tripDistance / KM_PER_CELL);
      const newCellIndex = lastNodeCellIndex + cellJump;

      let visualCumulativeDistance = 0;
      if (newCellIndex > 0) {
        visualCumulativeDistance = ((newCellIndex - 1) * KM_PER_CELL) + 1;
      }

      console.log(`📷 Adding journey node: +${tripDistance}km trip → ${realCumulativeDistance}km total (real)`);

      // Add to data grid using visual distance
      const nodeId = app.grid.addPhotoNode(visualCumulativeDistance, { ...journeyData, realDistance: realCumulativeDistance });

      // Add to canvas grid with journey type
      const gridCellId = app.canvasGrid.addNode(visualCumulativeDistance, {
        id: nodeId,
        type: 'journey',
        tripDistance: tripDistance,
        realDistance: realCumulativeDistance,
        ...journeyData
      });

      app.checkAndupdate(realCumulativeDistance);
      return { nodeId, gridCellId, cumulativeDistance: visualCumulativeDistance, realDistance: realCumulativeDistance };
    },

    addMilestoneNode: (distance, data = {}) => {
      const milestoneData = {
        achievement: data.achievement || 'Major Milestone',
        description: data.description || 'Reached an important milestone!',
        celebration: data.celebration || 'Treated myself to a nice dinner',
        totalDistance: data.totalDistance || distance,
        timeElapsed: data.timeElapsed || Math.floor(distance / 20),
        badgeEarned: data.badgeEarned || '🏆 Achievement Badge',
        ...data
      };

      console.log(`🏁 Adding milestone node at ${distance}km`);
      const nodeId = app.grid.addPhotoNode(distance, milestoneData);
      app.canvasGrid.addNode(distance, { id: nodeId, type: 'milestone', ...milestoneData });
      app.checkAndupdate(distance);
      return nodeId;
    },

    addRewardNode: (distance, data = {}) => {
      const rewardData = {
        name: data.name || 'Explorer Badge',
        description: data.description || 'Awarded for exploring new territories',
        rarity: data.rarity || 'rare',
        points: data.points || 100,
        criteria: data.criteria || ['Complete 100km journey', 'Take 5 photos'],
        earnedDate: data.earnedDate || new Date().toISOString(),
        ...data
      };

      console.log(`🏆 Adding reward node at ${distance}km`);
      const nodeId = app.grid.addPhotoNode(distance, rewardData);
      app.canvasGrid.addNode(distance, { id: nodeId, type: 'reward', ...rewardData });

      // Update stats with the maximum distance from all nodes
      const allNodes = app.grid.getNodesByDistance();
      const maxDistance = Math.max(...allNodes.map(n => n.distance), distance);
      app.checkAndupdate(maxDistance);
      return nodeId;
    },

    addCheckpointNode: (distance, data = {}) => {
      const checkpointData = {
        title: data.title || 'Progress Checkpoint',
        status: data.status || 'completed',
        timestamp: data.timestamp || new Date().toISOString(),
        weather: data.weather || 'Clear skies',
        temperature: data.temperature || 22,
        notes: data.notes || 'All systems green, continuing journey',
        ...data
      };

      console.log(`📍 Adding checkpoint node at ${distance}km`);
      const nodeId = app.grid.addPhotoNode(distance, checkpointData);
      app.canvasGrid.addNode(distance, { id: nodeId, type: 'checkpoint', ...checkpointData });

      // Update stats with the maximum distance from all nodes
      const allNodes = app.grid.getNodesByDistance();
      const maxDistance = Math.max(...allNodes.map(n => n.distance), distance);
      app.checkAndupdate(maxDistance);
      return nodeId;
    },

    // Quick test scenario with interactive nodes
    testInteractiveNodes: () => {
      console.log('🎯 Creating interactive node test scenario...');
      window.vroom.clear();
      window.vroom.addJourneyNode(25, { title: 'Morning Sunrise', mood: 'energetic' });
      window.vroom.addMilestoneNode(100, { achievement: '100km Milestone!' });
      window.vroom.addRewardNode(150, { name: 'Speed Demon', rarity: 'epic' });
      window.vroom.addCheckpointNode(200, { title: 'Rest Stop', status: 'active' });
      console.log('✅ Interactive nodes created! Click on them to see the modals.');
    },

    // Database utilities
    exportDB: async () => {
      const data = await databaseService.exportData();
      console.log('📦 Database export:', data);
      return data;
    },

    importDB: async (data) => {
      await databaseService.importData(data);
      console.log('✅ Database imported');
    }
  };

  // Print available methods
  console.log('Available commands:');
  console.log('  window.vroom.addNode(km) - Add photo node with trip distance');
  console.log('  window.vroom.addNodeAt(km) - Add node at absolute distance');
  console.log('  window.vroom.clear() - Clear all data');
  console.log('  window.vroom.testJourney() - Generate sample journey');
  console.log('  window.vroom.showStats() - Show grid statistics');
  console.log('  window.vroom.testCells() - Test cell calculations');
  console.log('  window.vroom.debug() - Show debug state');
}
