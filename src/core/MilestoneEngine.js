/**
 * MilestoneEngine - Achievement system for travel milestones
 * Tracks progress and unlocks badges based on distance traveled
 */
export class MilestoneEngine {
  constructor(i18nService = null) {
    this.unlockedMilestones = new Set();
    this.milestones = this.defineMilestones();
    this.i18n = i18nService;
  }

  /**
   * Set i18n service for localization
   * @param {Object} i18nService - Translation service instance
   */
  setI18nService(i18nService) {
    this.i18n = i18nService;
  }

  /**
   * Define all available milestones (structure only, no text)
   * Text content comes from i18n files
   */
  defineMilestones() {
    return [
      {
        id: 'first_steps',
        distance: 5,
        icon: '👶',
        color: '#4CAF50'
      },
      {
        id: 'explorer',
        distance: 25,
        icon: '🧭',
        color: '#2196F3'
      },
      {
        id: 'century_mark',
        distance: 100,
        icon: '💯',
        color: '#FF9800'
      },
      {
        id: 'road_warrior',
        distance: 250,
        icon: '🏆',
        color: '#9C27B0'
      },
      {
        id: 'five_hundred',
        distance: 500,
        icon: '🌟',
        color: '#F44336'
      },
      {
        id: 'ultra_explorer',
        distance: 1000,
        icon: '🚀',
        color: '#E91E63'
      },
      {
        id: 'lunar_distance',
        distance: 3844,
        icon: '🌙',
        color: '#607D8B'
      },
      {
        id: 'around_earth',
        distance: 40075,
        icon: '🌍',
        color: '#795548'
      }
    ];
  }

  /**
   * Get milestone with localized text
   * @param {string} milestoneId - Milestone identifier
   * @returns {Object|null} Milestone object with translated name/description
   */
  getLocalizedMilestone(milestoneId) {
    const milestone = this.getMilestone(milestoneId);
    if (!milestone) return null;

    // If i18n service available, merge with translations
    if (this.i18n) {
      const i18nKey = `milestones.${milestoneId}`;
      return {
        ...milestone,
        name: this.i18n.t(`${i18nKey}.title`),
        description: this.i18n.t(`${i18nKey}.description`)
      };
    }

    // Fallback to milestone ID if no i18n
    return {
      ...milestone,
      name: milestoneId,
      description: ''
    };
  }
  
  /**
   * Check for new milestone unlocks based on maximum distance
   * @param {number} maxDistance - Highest distance reached
   * @returns {Array} Array of newly unlocked milestones (localized)
   */
  checkMilestones(maxDistance) {
    const newMilestones = [];

    for (const milestone of this.milestones) {
      // Check if this milestone should be unlocked
      if (maxDistance >= milestone.distance && !this.unlockedMilestones.has(milestone.id)) {
        this.unlockedMilestones.add(milestone.id);
        const localizedMilestone = this.getLocalizedMilestone(milestone.id);
        newMilestones.push(localizedMilestone);
      }
    }

    return newMilestones;
  }
  
  /**
   * Get all unlocked milestones
   * @returns {Array} Array of unlocked milestone objects
   */
  getUnlockedMilestones() {
    return this.milestones.filter(milestone => 
      this.unlockedMilestones.has(milestone.id)
    );
  }
  
  /**
   * Get next milestone to unlock
   * @param {number} currentDistance - Current maximum distance
   * @returns {Object|null} Next milestone or null if all unlocked
   */
  getNextMilestone(currentDistance) {
    return this.milestones.find(milestone => 
      milestone.distance > currentDistance
    ) || null;
  }
  
  /**
   * Get milestone by ID
   * @param {string} milestoneId - Milestone identifier
   * @returns {Object|null} Milestone object or null
   */
  getMilestone(milestoneId) {
    return this.milestones.find(m => m.id === milestoneId) || null;
  }
  
  /**
   * Check if a milestone is unlocked
   * @param {string} milestoneId - Milestone identifier
   * @returns {boolean} True if unlocked
   */
  isMilestoneUnlocked(milestoneId) {
    return this.unlockedMilestones.has(milestoneId);
  }

  /**
   * Manually unlock a milestone (for database restore)
   * @param {number} distance - Milestone distance to unlock
   */
  unlockMilestone(distance) {
    const milestone = this.milestones.find(m => m.distance === distance);
    if (milestone && !this.unlockedMilestones.has(milestone.id)) {
      this.unlockedMilestones.add(milestone.id);
    }
  }
  
  /**
   * Get total count of unlocked milestones
   * @returns {number} Count of unlocked milestones
   */
  getUnlockedCount() {
    return this.unlockedMilestones.size;
  }
  
  /**
   * Reset all milestones (useful for testing)
   */
  reset() {
    this.unlockedMilestones.clear();
  }
  
  /**
   * Debug method: Log current milestone state
   */
  debugState() {
    console.log('=== Milestone Engine State ===');
    console.log('Total milestones defined:', this.milestones.length);
    console.log('Unlocked milestones:', this.unlockedMilestones.size);
    
    this.getUnlockedMilestones().forEach(milestone => {
      console.log(`  ✅ ${milestone.icon} ${milestone.name} (${milestone.distance}km)`);
    });
    
    const unlocked = this.getUnlockedMilestones();
    if (unlocked.length === 0) {
      console.log('  (No milestones unlocked yet)');
    }
  }
}