/**
 * Main application entry point
 * Sets up the grid system and provides dev console testing methods
 */
import { TravelGrid } from './core/TravelGrid.js';
import { PathRouter } from './core/PathRouter.js';
import { CanvasJourneyGrid } from './ui/CanvasJourneyGrid.js';
import { MilestoneEngine } from './core/MilestoneEngine.js';
import { cameraService } from './services/camera.js';
import { geolocationService } from './services/geolocation.js';

class VroomGridApp {
  constructor() {
    this.grid = null;
    this.pathRouter = null;
    this.canvasGrid = null;      // Canvas journey grid renderer
    this.milestoneEngine = null;
    
    this.init();
  }
  
  async init() {
    console.log('🗺️ Initializing Vroom Grid...');
    
    // Initialize core systems
    this.grid = new TravelGrid();
    this.pathRouter = new PathRouter(this.grid);
    this.milestoneEngine = new MilestoneEngine();
    
    // Setup canvas journey grid
    const gridContainer = document.querySelector('.grid-container');
    if (gridContainer) {
      this.canvasGrid = new CanvasJourneyGrid(gridContainer, this.grid);
      console.log('✅ Canvas journey grid initialized');
    } else {
      console.error('❌ Grid container not found');
      return;
    }
    
    // Setup UI event handlers
    this.setupUIHandlers();
    
    // Expose testing methods to window for dev console access
    this.exposeTestingMethods();
    
    console.log('🚀 Vroom Grid initialized successfully!');
    console.log('');
    console.log('🧪 Testing methods available:');
    console.log('  window.vroom.addNode(tripKm) - Add photo node (cumulative distance)');
    console.log('  window.vroom.addNodeAt(totalKm) - Add node at absolute distance');
    console.log('  window.vroom.generatePaths() - Redraw canvas');
    console.log('  window.vroom.clear() - Clear all data');
    console.log('  window.vroom.testJourney() - Create sample journey');
    console.log('  window.vroom.showStats() - Show canvas statistics');
    console.log('');
    console.log('Example: window.vroom.addNode(25) adds 25km to your journey!');
  }
  
  /**
   * Setup UI button handlers
   */
  setupUIHandlers() {
    // Camera button handler
    const takePhotoBtn = document.getElementById('take-photo-btn');
    if (takePhotoBtn) {
      takePhotoBtn.addEventListener('click', () => this.handleTakePhoto());
      console.log('✅ Camera button handler attached');
    } else {
      console.error('❌ Camera button not found');
    }

    // Settings button - could set home position
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.handleSettings());
      console.log('✅ Settings button handler attached');
    } else {
      console.error('❌ Settings button not found');
    }
  }

  /**
   * Handle photo capture
   */
  async handleTakePhoto() {
    console.log('📸 Take photo button clicked!');

    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = loadingOverlay?.querySelector('.loading-text');

    try {
      // Show loading
      if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        if (loadingText) loadingText.textContent = 'Accessing camera...';
      }

      console.log('📷 Requesting camera access...');
      // Capture photo
      const photoData = await cameraService.capturePhoto();
      console.log('✅ Photo captured:', photoData);

      if (loadingText) loadingText.textContent = 'Getting location...';

      // Get current location
      const position = await geolocationService.getCurrentPosition();
      console.log('✅ Position acquired:', position);

      // Calculate distance traveled since last photo
      let tripDistance = 0;
      const lastPos = geolocationService.lastPosition;

      console.log('🔍 Checking last position:', lastPos);
      console.log('🔍 Current position:', position);

      if (!lastPos) {
        // First photo - set as home and starting point
        geolocationService.setHomePosition(position);
        geolocationService.lastPosition = position;
        tripDistance = 0;
        console.log('🏠 First photo! Home position set:', position);
      } else {
        // Calculate distance from last photo using the position we just got
        tripDistance = geolocationService.calculateDistance(
          lastPos.latitude,
          lastPos.longitude,
          position.latitude,
          position.longitude
        );
        console.log(`📏 Distance from last photo: (${lastPos.latitude},${lastPos.longitude}) → (${position.latitude},${position.longitude}) = ${tripDistance.toFixed(2)}km`);

        // Update last position for next photo
        geolocationService.lastPosition = position;
      }

      console.log('✅ Distance calculated:', tripDistance, 'km');

      // Hide loading
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }

      console.log('🎬 About to show preview modal...');
      // Show preview modal
      this.showPhotoPreview(photoData, position, tripDistance);
      console.log('✅ showPhotoPreview called');

    } catch (error) {
      console.error('❌ Photo capture failed:', error);
      console.error('Error stack:', error.stack);
      alert(`Failed to capture photo: ${error.message}`);

      // Hide loading
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    }
  }

  /**
   * Show photo preview modal
   */
  showPhotoPreview(photoData, position, tripDistance) {
    console.log('🖼️ Showing photo preview modal...');

    const modal = document.getElementById('photo-preview-modal');
    const previewImage = document.getElementById('preview-image');
    const previewLocation = document.getElementById('preview-location');
    const previewDistance = document.getElementById('preview-distance');
    const acceptBtn = document.getElementById('preview-accept-btn');
    const rejectBtn = document.getElementById('preview-reject-btn');
    const closeBtn = document.getElementById('preview-close-btn');

    console.log('Modal elements found:', {
      modal: !!modal,
      previewImage: !!previewImage,
      previewLocation: !!previewLocation,
      previewDistance: !!previewDistance,
      acceptBtn: !!acceptBtn,
      rejectBtn: !!rejectBtn,
      closeBtn: !!closeBtn
    });

    if (!modal) {
      console.error('❌ Photo preview modal not found!');
      return;
    }

    // Set preview image
    previewImage.src = photoData.imageData;

    // Set location info
    previewLocation.textContent = geolocationService.formatCoordinates(position.latitude, position.longitude);

    // Set distance info
    if (tripDistance === 0) {
      previewDistance.textContent = 'Starting point (0 km)';
    } else {
      previewDistance.textContent = `+${tripDistance.toFixed(2)} km from last photo`;
    }

    // Show modal
    modal.classList.remove('hidden');

    // Handle accept
    const handleAccept = () => {
      // Add node with photo and location data
      const nodeData = {
        image: photoData.thumbnail,
        fullImage: photoData.imageData,
        location: geolocationService.formatCoordinates(position.latitude, position.longitude),
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        timestamp: photoData.timestamp,
        title: `Photo at ${Math.round(tripDistance)}km`,
        description: 'Journey moment captured',
        type: 'journey'
      };

      // Add node to grid
      if (tripDistance === 0) {
        window.vroom.addNodeAt(0, nodeData);
      } else {
        window.vroom.addNode(tripDistance, nodeData);
      }

      // Success feedback
      console.log(`📸 Photo added! Trip distance: ${tripDistance.toFixed(2)}km`);

      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }

      // Close modal
      closeModal();
    };

    // Handle reject (retake)
    const handleReject = () => {
      closeModal();
      // Trigger camera again
      setTimeout(() => this.handleTakePhoto(), 300);
    };

    // Handle close
    const closeModal = () => {
      modal.classList.add('hidden');
      acceptBtn.removeEventListener('click', handleAccept);
      rejectBtn.removeEventListener('click', handleReject);
      closeBtn.removeEventListener('click', closeModal);
    };

    // Attach event listeners
    acceptBtn.addEventListener('click', handleAccept);
    rejectBtn.addEventListener('click', handleReject);
    closeBtn.addEventListener('click', closeModal);
  }

  /**
   * Handle settings (set home position manually)
   */
  async handleSettings() {
    try {
      const position = await geolocationService.getCurrentPosition();
      geolocationService.setHomePosition(position);
      alert(`Home position set to: ${geolocationService.formatCoordinates(position.latitude, position.longitude)}`);
    } catch (error) {
      alert(`Failed to get location: ${error.message}`);
    }
  }
  
  /**
   * Expose testing methods to window object for dev console
   */
  exposeTestingMethods() {
    window.vroom = {
      // Add a photo node with trip distance (gets added to cumulative total)
      addNode: (tripDistance, data = {}) => {
        const { KM_PER_CELL } = this.canvasGrid;
        const existingNodes = this.grid.getNodesByDistance();
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
        const nodeId = this.grid.addPhotoNode(visualCumulativeDistance, { ...data, realDistance: realCumulativeDistance });

        // Add to canvas grid using the VISUAL distance for positioning
        const gridCellId = this.canvasGrid.addNode(visualCumulativeDistance, {
          id: nodeId, 
          tripDistance: tripDistance,
          realDistance: realCumulativeDistance,
          ...data 
        });

        this.checkAndupdate(realCumulativeDistance);
        return { nodeId, gridCellId, cumulativeDistance: visualCumulativeDistance, realDistance: realCumulativeDistance };
      },
      
      // Add node at absolute distance (for testing specific positions)
      addNodeAt: (absoluteDistance, data = {}) => {
        console.log(`📍 Adding node at absolute ${absoluteDistance}km`);
        const nodeId = this.grid.addPhotoNode(absoluteDistance, data);
        
        // Add to canvas grid
        const gridCellId = this.canvasGrid.addNode(absoluteDistance, { id: nodeId, ...data });
        
        this.checkAndupdate(absoluteDistance);
        return { nodeId, gridCellId, cumulativeDistance: absoluteDistance };
      },
      
      // Redraw canvas (roads are drawn automatically)
      generatePaths: () => {
        console.log('🎨 Redrawing canvas...');
        
        // Canvas draws roads automatically during redraw
        this.canvasGrid.redraw();
        
        return 'Canvas redrawn';
      },
      
      // Clear all data
      clear: () => {
        console.log('🧹 Clearing all data...');
        this.grid.clear();
        this.canvasGrid.clearNodes(); // Clear canvas nodes
        this.milestoneEngine.reset(); // Reset achievements
        geolocationService.reset();   // Reset geolocation (clears lastPosition and homePosition)
        this.updateStats(0);          // Reset statistics to 0
      },
      
      // Create a sample journey for testing
      testJourney: () => {
        console.log('🚗 Creating test journey...');
        
        // Clear existing data
        this.grid.clear();
        
        // Add nodes at various distances to create interesting paths
        const distances = [0, 15, 32, 67, 89, 124, 156, 203, 245, 298, 334, 387, 421, 456, 489];
        
        distances.forEach((distance, index) => {
          const nodeData = {
            name: `Photo ${index + 1}`,
            description: `Taken at ${distance}km mark`
          };
          
          // Add to data grid
          const nodeId = this.grid.addPhotoNode(distance, nodeData);
          
          // Add to canvas grid
          this.canvasGrid.addNode(distance, { id: nodeId, ...nodeData });
        });
        
        // Canvas will redraw automatically after adding nodes
        
        // Check milestones and update stats
        const maxDistance = distances.length > 0 ? Math.max(...distances) : 0;
        this.checkAndupdate(maxDistance);

        // Center view after grid is populated
        setTimeout(() => {
          console.log('🎯 Journey created successfully');
        }, 100);
        
        console.log(`✅ Created ${distances.length} nodes on canvas`);
        return { nodes: distances.length };
      },
      
      // Show grid statistics
      showStats: () => {
        console.log('📊 Canvas statistics:', this.canvasGrid.getStats());
      },
      
      // Debug grid state
      debug: () => {
        this.grid.debugState();
        this.milestoneEngine.debugState();
      },
      
      // Debug milestones specifically
      milestones: () => {
        console.log('🏆 Available milestones:');
        this.milestoneEngine.milestones.forEach(m => {
          const unlocked = this.milestoneEngine.isMilestoneUnlocked(m.id) ? '✅' : '🔒';
          console.log(`  ${unlocked} ${m.icon} ${m.name} - ${m.distance}km`);
        });
      },
      
      // Get access to core objects for advanced testing
      getGrid: () => this.grid,
      getPathRouter: () => this.pathRouter,
      getRenderer: () => this.renderer,
      
      // Test cell calculations
      testCells: () => {
        if (!this.canvasGrid) {
          console.error("Canvas grid not initialized.");
          return;
        }
        const { KM_PER_CELL, CELLS_PER_ROW } = this.canvasGrid;
        console.log(`🧪 Testing cell calculations (KM_PER_CELL: ${KM_PER_CELL}, CELLS_PER_ROW: ${CELLS_PER_ROW}):`);
        const testDistances = [0, 5, 9.9, 10, 15, 21, 36, 99, 100, 101, 120];
        
        testDistances.forEach(dist => {
          // Use the renderer's own logic to ensure consistency
          const { row, col, cellIndex } = this.canvasGrid.distanceToCoords(dist);
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
        const { KM_PER_CELL } = this.canvasGrid;
        const existingNodes = this.grid.getNodesByDistance();
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
        const nodeId = this.grid.addPhotoNode(visualCumulativeDistance, { ...journeyData, realDistance: realCumulativeDistance });

        // Add to canvas grid with journey type
        const gridCellId = this.canvasGrid.addNode(visualCumulativeDistance, {
          id: nodeId, 
          type: 'journey',
          tripDistance: tripDistance,
          realDistance: realCumulativeDistance,
          ...journeyData 
        });

        this.checkAndupdate(realCumulativeDistance);
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
        const nodeId = this.grid.addPhotoNode(distance, milestoneData);
        this.canvasGrid.addNode(distance, { id: nodeId, type: 'milestone', ...milestoneData });
        this.checkAndupdate(distance);
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
        const nodeId = this.grid.addPhotoNode(distance, rewardData);
        this.canvasGrid.addNode(distance, { id: nodeId, type: 'reward', ...rewardData });
        
        // Update stats with the maximum distance from all nodes
        const allNodes = this.grid.getNodesByDistance();
        const maxDistance = Math.max(...allNodes.map(n => n.distance), distance);
        this.checkAndupdate(maxDistance);
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
        const nodeId = this.grid.addPhotoNode(distance, checkpointData);
        this.canvasGrid.addNode(distance, { id: nodeId, type: 'checkpoint', ...checkpointData });
        
        // Update stats with the maximum distance from all nodes
        const allNodes = this.grid.getNodesByDistance();
        const maxDistance = Math.max(...allNodes.map(n => n.distance), distance);
        this.checkAndupdate(maxDistance);
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
      }
    };
    
    console.log('🔧 Testing methods exposed to window.vroom');
  }
  
  /**
   * Check for milestone achievements based on current progress
   * @param {number} realMaxDistance - The current real maximum distance traveled.
   */
  checkAndupdate(realMaxDistance) {
    // Check for new milestone unlocks
    const newMilestones = this.milestoneEngine.checkMilestones(realMaxDistance);
    
    // Show celebration for new milestones
    newMilestones.forEach(milestone => {
      this.celebrateMilestone(milestone);
      // Add a visual node for the milestone on the grid
      this.addMilestoneNode(milestone);
    });

    this.updateStats(realMaxDistance);
  }
  
  /**
   * Adds a special milestone node to the grid.
   * @param {object} milestone - The milestone object from MilestoneEngine.
   */
  addMilestoneNode(milestone) {
    console.log(`🎨 Adding milestone node: ${milestone.name} at ${milestone.distance}km`);

    // Use a tiny offset for the distance to prevent overwriting a user node at the exact same location in the canvas map.
    const visualDistance = milestone.distance > 0 ? milestone.distance - 0.01 : 0;

    // Prepare milestone data with schema-compatible fields
    const milestoneData = {
      ...milestone,
      isMilestone: true,
      achievement: `${milestone.icon} ${milestone.name}`,
      description: milestone.description,
      celebration: `You've traveled ${milestone.distance}km!`,
      totalDistance: milestone.distance,
      timeElapsed: Math.floor(milestone.distance / 20), // Rough estimate: 20km/hour
      badgeEarned: `${milestone.icon} ${milestone.name}`,
      title: milestone.name
    };

    // Add to data grid (TravelGrid)
    const nodeId = this.grid.addPhotoNode(visualDistance, milestoneData);

    // Add to canvas grid, explicitly setting the type to 'milestone'
    this.canvasGrid.addNode(visualDistance, {
      id: nodeId,
      type: 'milestone',
      ...milestoneData,
    });
  }

  /**
   * Show milestone celebration
   */
  celebrateMilestone(milestone) {
    console.log(`🎉 ACHIEVEMENT UNLOCKED: ${milestone.icon} ${milestone.name}`);
    console.log(`   ${milestone.description}`);
    console.log(`   Distance: ${milestone.distance}km`);
    
    // TODO: Add visual celebration popup
    // For now, just log to console with style
  }
  
  /**
   * Update statistics display
   */
  updateStats(realMaxDistance) {
    const totalDistanceEl = document.getElementById('total-distance');
    const photoCountEl = document.getElementById('photo-count');
    const milestoneCountEl = document.getElementById('milestone-count');

    const nodes = this.grid.getNodesByDistance();

    // Count only actual photo/journey nodes (exclude milestones)
    const photoCount = nodes.filter(node => !node.data.isMilestone).length;
    const milestoneCount = this.milestoneEngine ? this.milestoneEngine.getUnlockedCount() : 0;

    if (totalDistanceEl) totalDistanceEl.textContent = `${Math.round(realMaxDistance)} km`;
    if (photoCountEl) photoCountEl.textContent = photoCount;
    if (milestoneCountEl) milestoneCountEl.textContent = milestoneCount;
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new VroomGridApp();
});