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
import { Toast } from './ui/Toast.js';
import { i18n } from './i18n/i18n.js';
import { ClusteringConfig } from './config.js';
import { objectURLManager } from './utils/objectURLManager.js';
import { validatePlayerName, validateDistance, validateCoordinates, validatePhotoBlob } from './utils/validation.js';
import './ui/OnboardingFlow.js'; // Register web component

class VrooomApp {
  constructor() {
    this.grid = null;
    this.pathRouter = null;
    this.canvasGrid = null;      // Canvas journey grid renderer
    this.milestoneEngine = null;
    this.activePlayerId = null;  // Current player ID
    this.objectURLs = new Set();  // Track created object URLs for cleanup

    this.init();
  }

  async init() {
    console.log('🗺️ Initializing Vrooom...');

    // Initialize database first
    await databaseService.init();

    // Load saved language from database
    const savedLanguage = await databaseService.getSetting('language');

    // Initialize i18n with saved language
    if (savedLanguage) {
      await i18n.setLocale(savedLanguage);
      console.log('✅ i18n initialized from database, locale:', i18n.getLocale());
    } else {
      await i18n.init();
      console.log('✅ i18n initialized (auto-detect), locale:', i18n.getLocale());
    }

    // Check if onboarding is completed
    const onboardingComplete = await databaseService.getSetting('onboarding_complete');

    if (!onboardingComplete) {
      console.log('👋 First launch - showing onboarding');
      await this.showOnboarding();
      return; // Don't initialize app yet
    }

    // Get active player
    const defaultPlayer = await databaseService.getDefaultPlayer();
    if (!defaultPlayer) {
      console.error('❌ No default player found - showing onboarding');
      await this.showOnboarding();
      return;
    }

    this.activePlayerId = defaultPlayer.id;
    console.log('👤 Active player:', defaultPlayer.name, `(ID: ${this.activePlayerId})`);

    // Set player name for i18n personalization
    i18n.setPlayerName(defaultPlayer.name);

    // Initialize core systems
    await this.initializeApp();
  }

  /**
   * Show onboarding flow for first-time users
   */
  async showOnboarding() {
    // Hide main app UI
    const mainApp = document.querySelector('.app-container');
    if (mainApp) {
      mainApp.style.display = 'none';
    }

    // Create and show onboarding component
    const onboardingFlow = document.createElement('onboarding-flow');
    document.body.appendChild(onboardingFlow);

    // Listen for completion
    onboardingFlow.addEventListener('onboarding-complete', async (e) => {
      console.log('✅ Onboarding completed:', e.detail);

      const { playerName, playerAvatar, playerColor, language } = e.detail;

      try {
        // Validate player name
        const nameValidation = validatePlayerName(playerName);
        if (!nameValidation.valid) {
          Toast.error(nameValidation.error);
          console.error('❌ Invalid player name:', nameValidation.error);
          return;
        }

        // Create default player
        const playerId = await databaseService.savePlayer({
          name: playerName.trim(),
          avatar: playerAvatar,
          color: playerColor,
          isDefault: true
        });

        console.log('💾 Default player created:', playerId);

        // Set active player immediately
        this.activePlayerId = playerId;

        // Set player name for i18n personalization (before any async operations)
        i18n.setPlayerName(playerName.trim());

        // Save onboarding settings
        await databaseService.saveSetting('onboarding_complete', true);
        await databaseService.saveSetting('language', language);

        // Remove onboarding UI
        onboardingFlow.remove();

        // Show main app UI
        if (mainApp) {
          mainApp.style.display = '';
        }

        // Initialize app
        await this.initializeApp();
      } catch (error) {
        console.error('❌ Failed to complete onboarding:', error);
        Toast.error('Failed to complete setup. Please try again.');
      }
    });
  }

  /**
   * Initialize the main application
   */
  async initializeApp() {
    console.log('🚀 Initializing app for player:', this.activePlayerId);

    // Initialize core systems
    this.grid = new TravelGrid();
    this.pathRouter = new PathRouter(this.grid);
    this.milestoneEngine = new MilestoneEngine(i18n);

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

    // Load dev tools in development mode (conditional import)
    // Dev tools are always loaded since we don't have a build system
    try {
      const { initDevTools } = await import('./dev/devTools.js');
      initDevTools(this);
    } catch (error) {
      console.warn('⚠️ Dev tools not available:', error.message);
    }

    // Check permissions and show help if needed
    await this.checkPermissions();

    console.log('🚀 Vrooom initialized successfully!');
  }
  
  /**
   * Load existing journey from database
   */
  async loadJourney() {
    console.log('📂 Loading journey from database...');

    try {
      // Load all étapes with their photos for current player
      console.log('🔍 Step 1: Loading étapes for player:', this.activePlayerId);
      const etapes = await databaseService.getEtapesForPlayer(this.activePlayerId);
      console.log('✅ Étapes loaded:', etapes);

      console.log('🔍 Step 2: Loading milestones for player:', this.activePlayerId);
      const milestones = await databaseService.getMilestonesForPlayer(this.activePlayerId);
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

        // Convert photo blobs to Object URLs for display
        const photosWithUrls = photos.map(photo => ({
          id: photo.id,
          image: objectURLManager.create(photo.thumbnail),
          fullImage: objectURLManager.create(photo.imageData)
        }));

        // Calculate visual distance for grid placement
        // Use the same logic as window.vroom.addNode to ensure consistency
        const { KM_PER_CELL } = this.canvasGrid;
        const existingNodes = this.grid.getNodesByDistance();
        const lastNode = existingNodes.length > 0 ? existingNodes[existingNodes.length - 1] : null;

        // Get the real cumulative distance (what's stored in DB)
        const realDistance = etape.distance;

        // Calculate visual distance based on previous node's cell position
        let visualDistance = 0;
        if (!lastNode) {
          // First node always at 0
          visualDistance = 0;
        } else {
          // Get trip distance (real distance traveled since last node)
          const lastRealDistance = lastNode.data.realDistance || lastNode.distance;
          const tripDistance = realDistance - lastRealDistance;

          // Calculate cell jump
          const lastNodeCellIndex = Math.ceil(lastNode.distance / KM_PER_CELL);
          const cellJump = Math.ceil(tripDistance / KM_PER_CELL);
          const newCellIndex = lastNodeCellIndex + cellJump;

          // Place 1km into the target cell
          visualDistance = newCellIndex > 0 ? ((newCellIndex - 1) * KM_PER_CELL) + 1 : 0;
        }

        console.log(`📦 Restoring: real=${realDistance}km, visual=${visualDistance}km`);

        // Prepare node data with image from first photo
        const nodeData = {
          ...etape,
          photos: photosWithUrls,
          photoCount: photos.length,
          type: 'journey',
          image: photosWithUrls.length > 0 ? photosWithUrls[0].image : null,
          fullImage: photosWithUrls.length > 0 ? photosWithUrls[0].fullImage : null,
          location: etape.latitude && etape.longitude
            ? geolocationService.formatCoordinates(etape.latitude, etape.longitude)
            : 'Unknown location',
          realDistance: realDistance // Store real distance
        };

        // Add étape to data grid using VISUAL distance
        const nodeId = this.grid.addPhotoNode(visualDistance, nodeData);

        // Add to canvas grid using VISUAL distance
        this.canvasGrid.addNode(visualDistance, {
          id: nodeId,
          type: 'journey',
          realDistance: realDistance,
          ...nodeData
        });
      }

      // Restore milestones to grid
      for (const milestone of milestones) {
        console.log('🏆 Restoring milestone:', milestone);

        // Mark milestone as unlocked in engine
        this.milestoneEngine.unlockMilestone(milestone.distance);

        // Calculate proper cell position for milestone
        // Milestones should appear in the middle of their target cell
        const targetCell = Math.floor(milestone.distance / this.canvasGrid.KM_PER_CELL);
        const visualDistance = (targetCell * this.canvasGrid.KM_PER_CELL) + (this.canvasGrid.KM_PER_CELL / 2);

        // Prepare milestone data with schema-compatible fields
        const milestoneData = {
          ...milestone,
          isMilestone: true,
          achievement: `${milestone.icon} ${milestone.title}`,
          description: milestone.description,
          celebration: i18n.t('app.milestoneUnlocked', { distance: milestone.distance }),
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
   * Check location permission and show help if blocked
   */
  async checkPermissions() {
    try {
      const permissionState = await geolocationService.checkPermission();
      console.log('📍 Location permission state:', permissionState);

      if (permissionState === 'denied') {
        // Show persistent toast with instructions
        Toast.error(
          '📍 Location Access Blocked\n\n' +
          'Vrooom needs your location to track your adventure!\n\n' +
          'To enable:\n' +
          '1. Open Settings → Safari → Location\n' +
          '2. Select "While Using the App"\n' +
          '3. Reload this page',
          {
            duration: 0, // Don't auto-dismiss
            tapToDismiss: true
          }
        );
      }
    } catch (error) {
      console.warn('Could not check permission state:', error);
      // Non-critical, continue app initialization
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

      const { imageBlob, thumbnailBlob, gpsPosition, hasGPS } = captureData;

      // Validate photo blobs
      const imageValidation = validatePhotoBlob(imageBlob);
      if (!imageValidation.valid) {
        Toast.error(imageValidation.error);
        console.error('❌ Invalid image:', imageValidation.error);
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        return;
      }

      const thumbnailValidation = validatePhotoBlob(thumbnailBlob);
      if (!thumbnailValidation.valid) {
        Toast.error('Invalid thumbnail: ' + thumbnailValidation.error);
        console.error('❌ Invalid thumbnail:', thumbnailValidation.error);
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        return;
      }

      // Validate GPS coordinates if provided
      if (gpsPosition && hasGPS) {
        const coordValidation = validateCoordinates(gpsPosition.latitude, gpsPosition.longitude);
        if (!coordValidation.valid) {
          Toast.warning('GPS coordinates invalid, photo will be saved without location');
          console.warn('⚠️ Invalid GPS coordinates:', coordValidation.error);
        }
      }

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
        imageBlob,
        thumbnailBlob,
        timestamp: captureData.timestamp,
        width: captureData.width,
        height: captureData.height,
        format: captureData.format
      }, gpsPosition, tripDistance);

      // Hide loading
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }

    } catch (error) {
      console.error('❌ Failed to process photo:', error);
      // Don't show alert for cluster full error - toast already shown
      if (error.message !== 'Cluster is full - cannot add more photos to this location') {
        console.error('Unexpected error:', error.message);
      }

      // Hide loading
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    }
  }

  /**
   * Add photo to journey (saves to DB and adds to grid)
   * @param {Object} photoData - Photo blob data
   * @param {Object} position - GPS position
   * @param {number} tripDistance - Distance traveled since last photo
   */
  async addPhotoToJourney(photoData, position, tripDistance) {
    console.log('💾 Adding photo to journey...');

    try {
      // Check for clustering conditions using config
      const existingNodes = this.grid.getNodesByDistance();
      const lastNode = existingNodes.length > 0 ? existingNodes[existingNodes.length - 1] : null;

      // Check if we should cluster this photo with the last node
      if (lastNode && lastNode.data && lastNode.data.type === 'journey') {
        const timeSinceLastPhoto = photoData.timestamp - lastNode.data.timestamp;
        const distanceInMeters = tripDistance * 1000; // Convert km to meters
        const currentPhotoCount = lastNode.data.photoCount || 1;

        const isCloseInSpace = distanceInMeters < ClusteringConfig.minDistanceMeters;
        const isCloseInTime = timeSinceLastPhoto < ClusteringConfig.maxTimeGapMs;
        const hasRoomInCluster = currentPhotoCount < ClusteringConfig.maxPhotosPerCluster;

        if (isCloseInSpace && isCloseInTime && hasRoomInCluster) {
          console.log(`📍 Clustering photo with last node (${distanceInMeters.toFixed(0)}m, ${Math.round(timeSinceLastPhoto/1000)}s apart, ${currentPhotoCount + 1}/${ClusteringConfig.maxPhotosPerCluster} photos)`);
          await this.addPhotoToExistingNode(lastNode, photoData, position);
          return;
        } else if (isCloseInSpace && isCloseInTime && !hasRoomInCluster) {
          // Cluster is full - reject the photo
          console.warn(`⚠️ Cluster full (${currentPhotoCount}/${ClusteringConfig.maxPhotosPerCluster}), photo rejected`);
          Toast.warning(`Your car trunk is already containing ${currentPhotoCount} memories! It is time to jump in your car and drive a few miles to capture new adventurer memories. VROoom! 🚗💨`, {
            duration: 0, // No auto-close - kids can read at their own pace
            tapToDismiss: true // Tap to dismiss when done reading
          });
          throw new Error('Cluster is full - cannot add more photos to this location');
        }
      }

      // Calculate cumulative distance
      const lastRealDistance = lastNode ? (lastNode.data.realDistance || lastNode.distance) : 0;
      const realCumulativeDistance = lastRealDistance + tripDistance;

      // Save étape to database first
      const etapeId = await databaseService.saveEtape({
        playerId: this.activePlayerId, // Link to current player
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

      // Save photo to database (blobs stored directly - no conversion!)
      const photoId = await databaseService.savePhoto(etapeId, {
        playerId: this.activePlayerId, // Link to current player
        timestamp: photoData.timestamp,
        imageBlob: photoData.imageBlob,
        thumbnailBlob: photoData.thumbnailBlob,
        width: photoData.width,
        height: photoData.height,
        format: photoData.format || 'webp'
      });

      console.log(`💾 Photo saved with ID: ${photoId}`);

      // Convert blobs to Object URLs for display
      const imageURL = objectURLManager.create(photoData.imageBlob);
      const thumbnailURL = objectURLManager.create(photoData.thumbnailBlob);

      // Add node with photo and location data to grid
      const nodeData = {
        etapeId: etapeId,
        photoId: photoId,
        image: thumbnailURL,
        fullImage: imageURL,
        location: geolocationService.formatCoordinates(position.latitude, position.longitude),
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        timestamp: photoData.timestamp,
        title: `Photo at ${Math.round(realCumulativeDistance)}km`,
        description: 'Journey moment captured',
        type: 'journey',
        realDistance: realCumulativeDistance // Store real distance for reload
      };

      // Add node to grid using window.vroom.addNode (handles visual vs real distance)
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
   * Add photo to existing node (clustering)
   * @param {Object} existingNode - The node to append the photo to
   * @param {Object} photoData - Photo blob data
   * @param {Object} position - GPS position
   */
  async addPhotoToExistingNode(existingNode, photoData, position) {
    console.log('📸 Adding photo to existing node:', existingNode);

    try {
      // Try multiple possible locations for etapeId
      const etapeId = existingNode.data?.etapeId || existingNode.data?.id || existingNode.etapeId || existingNode.id;

      if (!etapeId) {
        console.error('❌ Could not find etapeId in node:', existingNode);
        throw new Error('No etapeId found on existing node');
      }

      console.log('📸 Using etapeId:', etapeId);

      // Save photo to database under the same étape
      const photoId = await databaseService.savePhoto(etapeId, {
        playerId: this.activePlayerId, // Link to current player
        timestamp: photoData.timestamp,
        imageBlob: photoData.imageBlob,
        thumbnailBlob: photoData.thumbnailBlob,
        width: photoData.width,
        height: photoData.height,
        format: photoData.format || 'webp'
      });

      console.log(`💾 Additional photo saved with ID: ${photoId}`);

      // Reload all photos from database for this étape (same pattern as loadJourney)
      const allPhotos = await databaseService.getPhotosForEtape(etapeId);

      // Convert to Object URLs (same pattern as loadJourney)
      const photosWithUrls = allPhotos.map(photo => ({
        id: photo.id,
        image: objectURLManager.create(photo.thumbnail),
        fullImage: objectURLManager.create(photo.imageData)
      }));

      // Update existingNode data
      existingNode.data.photos = photosWithUrls;
      existingNode.data.photoCount = photosWithUrls.length;
      existingNode.data.image = photosWithUrls[0].image;
      existingNode.data.fullImage = photosWithUrls[0].fullImage;

      console.log(`📸 Photo added to cluster! Total photos: ${photosWithUrls.length}`);

      // Update the NodeComponent with refreshed data
      const nodeComponent = this.canvasGrid.nodeComponents.get(existingNode.distance);
      if (nodeComponent) {
        nodeComponent.nodeData.data = existingNode.data;
        nodeComponent.updateAppearance();
      }

      // Success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }

    } catch (error) {
      console.error('❌ Failed to add photo to existing node:', error);
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

    // Calculate proper cell position for milestone
    // Milestones should appear in the middle of their target cell
    const { KM_PER_CELL } = this.canvasGrid;
    const targetCell = Math.floor(milestone.distance / KM_PER_CELL);
    // Place milestone at the cell's midpoint to ensure it lands in the correct cell
    const visualDistance = (targetCell * KM_PER_CELL) + (KM_PER_CELL / 2);

    // Prepare milestone data with schema-compatible fields
    const milestoneData = {
      ...milestone,
      isMilestone: true,
      achievement: `${milestone.icon} ${milestone.name}`,
      description: milestone.description,
      celebration: i18n.t('app.milestoneUnlocked', { distance: milestone.distance }),
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
          playerId: this.activePlayerId, // Link to current player
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
  new VrooomApp();
});