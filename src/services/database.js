/**
 * DatabaseService - IndexedDB wrapper using Dexie.js
 * Handles persistent storage for étapes (waypoints), photos, milestones, and settings
 *
 * Data Model:
 * - Étape: A stage/waypoint in the journey (represents a location visit)
 * - Photo: Individual photos that belong to an étape
 * - Milestone: Achievement unlocked at distance thresholds
 */

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the database with schema
   */
  async init() {
    if (this.isInitialized) {
      console.log('💾 Database already initialized');
      return;
    }

    console.log('💾 Initializing VroomDB...');

    // Create Dexie instance
    this.db = new Dexie('VroomDB');

    // Define schema
    // Syntax: '++' = auto-increment primary key, other fields = indexed fields
    this.db.version(1).stores({
      etapes: '++id, distance, timestamp, latitude, longitude',
      photos: '++id, etapeId, timestamp',
      milestones: '++id, type, distance, unlocked, timestamp',
      settings: 'key'
    });

    try {
      await this.db.open();
      this.isInitialized = true;
      console.log('✅ VroomDB initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Save an étape (waypoint/stage)
   * @param {Object} etapeData - Étape data with location, distance, etc.
   * @returns {Promise<number>} Étape ID
   */
  async saveEtape(etapeData) {
    await this.ensureInitialized();

    const etape = {
      distance: etapeData.distance,
      timestamp: etapeData.timestamp || Date.now(),
      latitude: etapeData.coords?.latitude,
      longitude: etapeData.coords?.longitude,
      accuracy: etapeData.coords?.accuracy,
      title: etapeData.title || null,
      notes: etapeData.notes || null,
      metadata: etapeData.metadata || {}
    };

    const id = await this.db.etapes.add(etape);
    console.log('💾 Étape saved:', id, `at ${etape.distance}km`);
    return id;
  }

  /**
   * Update an existing étape
   * @param {number} id - Étape ID
   * @param {Object} updates - Fields to update
   */
  async updateEtape(id, updates) {
    await this.ensureInitialized();
    await this.db.etapes.update(id, updates);
    console.log('💾 Étape updated:', id);
  }

  /**
   * Get all étapes sorted by distance
   * @returns {Promise<Array>} Array of étapes with IDs
   */
  async getAllEtapes() {
    await this.ensureInitialized();

    // Get all etapes with their primary keys
    const etapesWithKeys = [];
    await this.db.etapes.orderBy('distance').each((etape, cursor) => {
      // cursor.primaryKey contains the auto-generated ID
      etapesWithKeys.push({
        id: cursor.primaryKey,
        ...etape
      });
    });

    console.log(`💾 Loaded ${etapesWithKeys.length} étapes from database`);
    return etapesWithKeys;
  }

  /**
   * Get a single étape by ID
   * @param {number} id - Étape ID
   * @returns {Promise<Object>} Étape object
   */
  async getEtape(id) {
    await this.ensureInitialized();
    return await this.db.etapes.get(id);
  }

  /**
   * Get étapes in distance range
   * @param {number} minDistance - Minimum distance (km)
   * @param {number} maxDistance - Maximum distance (km)
   * @returns {Promise<Array>} Array of étapes
   */
  async getEtapesByDistanceRange(minDistance, maxDistance) {
    await this.ensureInitialized();
    return await this.db.etapes
      .where('distance')
      .between(minDistance, maxDistance, true, true)
      .toArray();
  }

  /**
   * Save a photo to an étape
   * @param {number} etapeId - Parent étape ID
   * @param {Object} photoData - Photo data with Blob images
   * @returns {Promise<number>} Photo ID
   */
  async savePhoto(etapeId, photoData) {
    await this.ensureInitialized();

    const photo = {
      etapeId: etapeId,
      timestamp: photoData.timestamp || Date.now(),
      imageData: photoData.imageBlob,
      thumbnail: photoData.thumbnailBlob,
      width: photoData.width,
      height: photoData.height,
      size: photoData.size,
      format: photoData.format || 'webp',
      metadata: photoData.metadata || {}
    };

    const id = await this.db.photos.add(photo);
    console.log(`💾 Photo saved (blob):`, id, `to étape ${etapeId}`);
    return id;
  }

  /**
   * Get all photos for an étape
   * @param {number} etapeId - Étape ID
   * @returns {Promise<Array>} Array of photos
   */
  async getPhotosForEtape(etapeId) {
    await this.ensureInitialized();
    const photos = await this.db.photos
      .where('etapeId')
      .equals(etapeId)
      .toArray();

    // Sort by timestamp manually
    photos.sort((a, b) => a.timestamp - b.timestamp);

    return photos;
  }

  /**
   * Get all photos across all étapes
   * @returns {Promise<Array>} Array of all photos
   */
  async getAllPhotos() {
    await this.ensureInitialized();
    return await this.db.photos.toArray();
  }

  /**
   * Save a milestone
   * @param {Object} milestoneData - Milestone data
   * @returns {Promise<number>} Milestone ID
   */
  async saveMilestone(milestoneData) {
    await this.ensureInitialized();

    const milestone = {
      type: milestoneData.type,
      distance: milestoneData.distance,
      title: milestoneData.title,
      description: milestoneData.description,
      icon: milestoneData.icon,
      unlocked: milestoneData.unlocked || true,
      timestamp: milestoneData.timestamp || Date.now(),
      metadata: milestoneData.metadata || {}
    };

    const id = await this.db.milestones.add(milestone);
    console.log('💾 Milestone saved:', id, milestone.title);
    return id;
  }

  /**
   * Get all unlocked milestones
   * @returns {Promise<Array>} Array of milestones
   */
  async getAllMilestones() {
    await this.ensureInitialized();

    // Get all milestones and filter in JavaScript (Dexie has issues with boolean queries)
    const allMilestones = await this.db.milestones.toArray();
    const unlockedMilestones = allMilestones.filter(m => m.unlocked === true);

    // Sort by distance
    unlockedMilestones.sort((a, b) => a.distance - b.distance);

    console.log(`💾 Loaded ${unlockedMilestones.length} milestones from database`);
    return unlockedMilestones;
  }

  /**
   * Check if milestone exists at distance
   * @param {number} distance - Distance in km
   * @returns {Promise<boolean>} True if milestone exists
   */
  async milestoneExists(distance) {
    await this.ensureInitialized();
    const count = await this.db.milestones
      .where('distance')
      .equals(distance)
      .count();
    return count > 0;
  }

  /**
   * Save a setting
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   */
  async saveSetting(key, value) {
    await this.ensureInitialized();
    await this.db.settings.put({ key, value, updated: Date.now() });
    console.log(`💾 Setting saved: ${key}`);
  }

  /**
   * Get a setting
   * @param {string} key - Setting key
   * @param {*} defaultValue - Default value if not found
   * @returns {Promise<*>} Setting value
   */
  async getSetting(key, defaultValue = null) {
    await this.ensureInitialized();
    const setting = await this.db.settings.get(key);
    return setting ? setting.value : defaultValue;
  }

  /**
   * Get journey statistics
   * @returns {Promise<Object>} Stats object
   */
  async getStats() {
    await this.ensureInitialized();

    const etapeCount = await this.db.etapes.count();
    const photoCount = await this.db.photos.count();
    const milestoneCount = await this.db.milestones.count();

    // Get max distance from étapes
    const maxDistanceEtape = await this.db.etapes
      .orderBy('distance')
      .reverse()
      .first();

    const maxDistance = maxDistanceEtape ? maxDistanceEtape.distance : 0;

    return {
      etapeCount,
      photoCount,
      milestoneCount,
      maxDistance,
      totalNodes: etapeCount + milestoneCount
    };
  }

  /**
   * Get full journey data (étapes with their photos)
   * @returns {Promise<Array>} Array of étapes with embedded photos
   */
  async getFullJourney() {
    await this.ensureInitialized();

    const etapes = await this.db.etapes.orderBy('distance').toArray();

    // Attach photos to each étape
    for (const etape of etapes) {
      etape.photos = await this.getPhotosForEtape(etape.id);
    }

    console.log(`💾 Loaded full journey: ${etapes.length} étapes`);
    return etapes;
  }

  /**
   * Clear all journey data (étapes, photos, and milestones)
   */
  async clearJourney() {
    await this.ensureInitialized();

    await this.db.etapes.clear();
    await this.db.photos.clear();
    await this.db.milestones.clear();

    console.log('💾 Journey data cleared from database');
  }

  /**
   * Delete entire database
   */
  async deleteDatabase() {
    console.log('💾 Deleting database...');
    if (this.db) {
      this.db.close();
    }
    await Dexie.delete('VroomDB');
    this.isInitialized = false;
    console.log('✅ Database deleted');
  }

  /**
   * Ensure database is initialized
   * @private
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  /**
   * Export all data as JSON (for backup/debugging)
   * @returns {Promise<Object>} All data
   */
  async exportData() {
    await this.ensureInitialized();

    const etapes = await this.db.etapes.toArray();
    const photos = await this.db.photos.toArray();
    const milestones = await this.db.milestones.toArray();
    const settings = await this.db.settings.toArray();

    return {
      version: 1,
      exported: new Date().toISOString(),
      etapes,
      photos,
      milestones,
      settings
    };
  }

  /**
   * Import data from JSON (for restore)
   * @param {Object} data - Exported data
   */
  async importData(data) {
    await this.ensureInitialized();

    console.log('💾 Importing data...');

    // Clear existing data
    await this.clearJourney();

    // Import étapes
    if (data.etapes && data.etapes.length > 0) {
      await this.db.etapes.bulkAdd(data.etapes);
      console.log(`💾 Imported ${data.etapes.length} étapes`);
    }

    // Import photos
    if (data.photos && data.photos.length > 0) {
      await this.db.photos.bulkAdd(data.photos);
      console.log(`💾 Imported ${data.photos.length} photos`);
    }

    // Import milestones
    if (data.milestones && data.milestones.length > 0) {
      await this.db.milestones.bulkAdd(data.milestones);
      console.log(`💾 Imported ${data.milestones.length} milestones`);
    }

    // Import settings
    if (data.settings && data.settings.length > 0) {
      await this.db.settings.bulkPut(data.settings);
      console.log(`💾 Imported ${data.settings.length} settings`);
    }

    console.log('✅ Data import complete');
  }
}

// Singleton instance
export const databaseService = new DatabaseService();
