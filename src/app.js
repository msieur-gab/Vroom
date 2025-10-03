/**
 * Main application entry point
 * Sets up the grid system and provides dev console testing methods
 */
import { TravelGrid } from './core/TravelGrid.js';
import { PathRouter } from './core/PathRouter.js';
import { CanvasJourneyGrid } from './ui/CanvasJourneyGrid.js';
import { MilestoneEngine } from './core/MilestoneEngine.js';
import { cameraModal } from './ui/CameraModal.js';
import { geolocationService } from './services/geolocation.js';
import { databaseService } from './services/database.js';

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

    // Initialize database first
    await databaseService.init();

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

    // Load existing journey from database
    await this.loadJourney();

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
   * Load existing journey from database
   */
  async loadJourney() {
    console.log('📂 Loading journey from database...');

    try {
      // Load all étapes with their photos
      console.log('🔍 Step 1: Loading étapes...');
      const etapes = await databaseService.getAllEtapes();
      console.log('✅ Étapes loaded:', etapes);

      console.log('🔍 Step 2: Loading milestones...');
      const milestones = await databaseService.getAllMilestones();
      console.log('✅ Milestones loaded:', milestones);

      if (etapes.length === 0 && milestones.length === 0) {
        console.log('📭 No existing journey data found');
        return;
      }

      console.log(`📦 Found ${etapes.length} étapes and ${milestones.length} milestones`);

      // Restore étapes to grid
      for (const etape of etapes) {
        console.log('📦 Restoring étape:', etape);

        // Load photos for this étape (only if etape has an id)
        let photos = [];
        if (etape.id) {
          try {
            photos = await databaseService.getPhotosForEtape(etape.id);
            console.log(`📷 Loaded ${photos.length} photos for étape ${etape.id}`);
          } catch (error) {
            console.error(`❌ Failed to load photos for étape ${etape.id}:`, error);
          }
        }

        // Prepare node data with image from first photo
        const nodeData = {
          ...etape,
          photos: photos,
          type: 'journey',
          // Use first photo's data for node display
          image: photos.length > 0 ? photos[0].thumbnail : null,
          fullImage: photos.length > 0 ? photos[0].imageData : null,
          location: etape.latitude && etape.longitude
            ? geolocationService.formatCoordinates(etape.latitude, etape.longitude)
            : 'Unknown location'
        };

        // Add étape to data grid
        const nodeId = this.grid.addPhotoNode(etape.distance, nodeData);

        // Add to canvas grid
        this.canvasGrid.addNode(etape.distance, {
          id: nodeId,
          type: 'journey',
          ...nodeData
        });
      }

      // Restore milestones to grid
      for (const milestone of milestones) {
        console.log('🏆 Restoring milestone:', milestone);

        // Mark milestone as unlocked in engine
        this.milestoneEngine.unlockMilestone(milestone.distance);

        // Use a tiny offset for visual distance to prevent overlap
        const visualDistance = milestone.distance > 0 ? milestone.distance - 0.01 : 0;

        // Prepare milestone data with schema-compatible fields
        const milestoneData = {
          ...milestone,
          isMilestone: true,
          achievement: `${milestone.icon} ${milestone.title}`,
          description: milestone.description,
          celebration: `You've traveled ${milestone.distance}km!`,
          totalDistance: milestone.distance,
          timeElapsed: Math.floor(milestone.distance / 20),
          badgeEarned: `${milestone.icon} ${milestone.title}`,
          title: milestone.title
        };

        // Don't spread milestoneData as it contains 'type' field which conflicts
        const nodeId = this.grid.addPhotoNode(visualDistance, milestoneData);

        const canvasNodeId = this.canvasGrid.addNode(visualDistance, {
          id: nodeId,
          type: 'milestone',  // Force type to be 'milestone', not milestone.type
          ...milestoneData,
          type: 'milestone'   // Override again after spread to ensure it stays 'milestone'
        });

        console.log(`✅ Milestone restored at ${visualDistance}km (canvas ID: ${canvasNodeId})`);
      }

      // Restore geolocation state from last étape
      if (etapes.length > 0) {
        const lastEtape = etapes[etapes.length - 1];
        if (lastEtape.latitude && lastEtape.longitude) {
          geolocationService.lastPosition = {
            latitude: lastEtape.latitude,
            longitude: lastEtape.longitude,
            timestamp: lastEtape.timestamp
          };
          console.log('📍 Restored last position from database');
        }

        // Set home position from first étape
        const firstEtape = etapes[0];
        if (firstEtape.latitude && firstEtape.longitude) {
          geolocationService.homePosition = {
            latitude: firstEtape.latitude,
            longitude: firstEtape.longitude,
            timestamp: firstEtape.timestamp
          };
          console.log('🏠 Restored home position from database');
        }
      }

      // Update stats
      console.log('🔍 Step 3: Getting stats...');
      const stats = await databaseService.getStats();
      console.log('✅ Stats loaded:', stats);

      this.updateStats(stats.maxDistance);

      console.log('✅ Journey loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load journey:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
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

    // Listen for photo-captured event from CameraModal
    document.addEventListener('photo-captured', (e) => this.handlePhotoCaptured(e.detail));

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
   * Handle photo capture - opens camera modal
   */
  async handleTakePhoto() {
    console.log('📸 Take photo button clicked - opening camera modal');

    try {
      await cameraModal.open();
    } catch (error) {
      console.error('❌ Failed to open camera:', error);
      alert(error.message || 'Failed to open camera. Please check permissions.');
    }
  }

  /**
   * Handle photo captured event from CameraModal
   * @param {Object} captureData - Photo data with GPS position
   */
  async handlePhotoCaptured(captureData) {
    console.log('✅ Photo captured event received:', captureData);

    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = loadingOverlay?.querySelector('.loading-text');

    try {
      // Show loading
      if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        if (loadingText) loadingText.textContent = 'Processing photo...';
      }

      const { imageData, thumbnail, gpsPosition, hasGPS } = captureData;

      // Calculate distance traveled since last photo
      let tripDistance = 0;
      const lastPos = geolocationService.lastPosition;

      console.log('🔍 Last position:', lastPos);
      console.log('🔍 GPS position:', gpsPosition);

      if (!hasGPS || !gpsPosition) {
        console.warn('⚠️ No GPS position available, using distance 0');
        tripDistance = 0;

        // Set home position if this is first photo and we have GPS
        if (!lastPos && gpsPosition) {
          geolocationService.setHomePosition(gpsPosition);
          geolocationService.lastPosition = gpsPosition;
        }
      } else if (!lastPos) {
        // First photo - set as home and starting point
        geolocationService.setHomePosition(gpsPosition);
        geolocationService.lastPosition = gpsPosition;
        tripDistance = 0;
        console.log('🏠 First photo! Home position set:', gpsPosition);
      } else {
        // Calculate distance from last photo
        tripDistance = geolocationService.calculateDistance(
          lastPos.latitude,
          lastPos.longitude,
          gpsPosition.latitude,
          gpsPosition.longitude
        );
        console.log(`📏 Distance from last photo: ${tripDistance.toFixed(2)}km`);

        // Update last position for next photo
        geolocationService.lastPosition = gpsPosition;
      }

      console.log('✅ Distance calculated:', tripDistance, 'km');

      // Add photo to journey immediately (no preview modal)
      await this.addPhotoToJourney({
        imageData,
        thumbnail,
        timestamp: captureData.timestamp,
        width: captureData.width,
        height: captureData.height
      }, gpsPosition, tripDistance);

      // Hide loading
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }

    } catch (error) {
      console.error('❌ Failed to process photo:', error);
      alert(`Failed to add photo: ${error.message}`);

      // Hide loading
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    }
  }

  /**
   * Add photo to journey (saves to DB and adds to grid)
   * @param {Object} photoData - Photo image data
   * @param {Object} position - GPS position
   * @param {number} tripDistance - Distance traveled since last photo
   */
  async addPhotoToJourney(photoData, position, tripDistance) {
    console.log('💾 Adding photo to journey...');

    try {
      // Calculate cumulative distance
      const existingNodes = this.grid.getNodesByDistance();
      const lastNode = existingNodes.length > 0 ? existingNodes[existingNodes.length - 1] : null;
      const lastRealDistance = lastNode ? (lastNode.data.realDistance || lastNode.distance) : 0;
      const realCumulativeDistance = lastRealDistance + tripDistance;

      // Save étape to database first
      const etapeId = await databaseService.saveEtape({
        distance: realCumulativeDistance,
        timestamp: photoData.timestamp,
        coords: {
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy
        },
        title: `Étape at ${Math.round(realCumulativeDistance)}km`,
        notes: null,
        metadata: {}
      });

      console.log(`💾 Étape saved with ID: ${etapeId}`);

      // Save photo to database (linked to étape)
      const photoId = await databaseService.savePhoto(etapeId, {
        timestamp: photoData.timestamp,
        imageData: photoData.imageData,
        thumbnail: photoData.thumbnail,
        width: photoData.width,
        height: photoData.height
      });

      console.log(`💾 Photo saved with ID: ${photoId}`);

      // Add node with photo and location data to grid
      const nodeData = {
        etapeId: etapeId,
        photoId: photoId,
        image: photoData.thumbnail,
        fullImage: photoData.imageData,
        location: geolocationService.formatCoordinates(position.latitude, position.longitude),
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        timestamp: photoData.timestamp,
        title: `Photo at ${Math.round(realCumulativeDistance)}km`,
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

    } catch (error) {
      console.error('❌ Failed to save photo:', error);
      throw error;
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
    const handleAccept = async () => {
      try {
        // Calculate cumulative distance
        const existingNodes = this.grid.getNodesByDistance();
        const lastNode = existingNodes.length > 0 ? existingNodes[existingNodes.length - 1] : null;
        const lastRealDistance = lastNode ? (lastNode.data.realDistance || lastNode.distance) : 0;
        const realCumulativeDistance = lastRealDistance + tripDistance;

        // Save étape to database first
        const etapeId = await databaseService.saveEtape({
          distance: realCumulativeDistance,
          timestamp: photoData.timestamp,
          coords: {
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy
          },
          title: `Étape at ${Math.round(realCumulativeDistance)}km`,
          notes: null,
          metadata: {}
        });

        console.log(`💾 Étape saved with ID: ${etapeId}`);

        // Save photo to database (linked to étape)
        const photoId = await databaseService.savePhoto(etapeId, {
          timestamp: photoData.timestamp,
          imageData: photoData.imageData,
          thumbnail: photoData.thumbnail,
          width: photoData.width,
          height: photoData.height,
          size: photoData.size,
          filename: photoData.filename
        });

        console.log(`💾 Photo saved with ID: ${photoId}`);

        // Add node with photo and location data to grid
        const nodeData = {
          etapeId: etapeId,
          photoId: photoId,
          image: photoData.thumbnail,
          fullImage: photoData.imageData,
          location: geolocationService.formatCoordinates(position.latitude, position.longitude),
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
          timestamp: photoData.timestamp,
          title: `Photo at ${Math.round(realCumulativeDistance)}km`,
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
      } catch (error) {
        console.error('❌ Failed to save photo:', error);
        alert(`Failed to save photo: ${error.message}`);
      }
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
      clear: async () => {
        console.log('🧹 Clearing all data...');

        // Clear database
        await databaseService.clearJourney();

        // Clear in-memory data
        this.grid.clear();
        this.canvasGrid.clearNodes(); // Clear canvas nodes
        this.milestoneEngine.reset(); // Reset achievements
        geolocationService.reset();   // Reset geolocation (clears lastPosition and homePosition)
        this.updateStats(0);          // Reset statistics to 0

        console.log('✅ All data cleared (memory + database)');
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
      },

      // Database utilities
      exportDB: async () => {
        const data = await databaseService.exportData();
        console.log('📦 Database export:', data);
        return data;
      },

      importDB: async (data) => {
        await databaseService.importData(data);
        console.log('✅ Database imported, reloading journey...');
        await this.loadJourney();
      },

      dbStats: async () => {
        const stats = await databaseService.getStats();
        console.log('📊 Database stats:', stats);
        return stats;
      },

      deleteDB: async () => {
        if (confirm('⚠️ Delete entire database? This cannot be undone!')) {
          await databaseService.deleteDatabase();
          console.log('✅ Database deleted. Reload page to start fresh.');
        }
      },

      // Direct database access for debugging
      db: databaseService
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
  async addMilestoneNode(milestone) {
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

    // Save milestone to database
    try {
      const exists = await databaseService.milestoneExists(milestone.distance);
      if (!exists) {
        await databaseService.saveMilestone({
          type: milestone.id,
          distance: milestone.distance,
          title: milestone.name,
          description: milestone.description,
          icon: milestone.icon,
          unlocked: true,
          metadata: milestone
        });
        console.log(`💾 Milestone saved to database: ${milestone.name}`);
      }
    } catch (error) {
      console.error('❌ Failed to save milestone:', error);
    }

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