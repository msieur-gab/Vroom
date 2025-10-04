/**
 * MilestoneEngine - Achievement system for travel milestones
 * Tracks progress and unlocks badges based on distance traveled
 */
export class MilestoneEngine {
  constructor() {
    this.unlockedMilestones = new Set();
    this.milestones = this.defineMilestones();
  }
  
  /**
   * Define all available milestones
   */
  defineMilestones() {
    return [
      {
        id: 'first_steps',
        distance: 5,
        name: 'First Steps',
        icon: '👶',
        description: 'Every journey begins with a single step',
        color: '#4CAF50',
        overlay: 'baby-hat'
      },
      {
        id: 'explorer',
        distance: 25,
        name: 'Explorer',
        icon: '🧭',
        description: 'You\'re getting the hang of this adventure thing!',
        color: '#2196F3',
        overlay: 'explorer-goggles'
      },
      {
        id: 'century_mark',
        distance: 100,
        name: 'Century Mark',
        icon: '💯',
        description: '100 kilometers of memories captured',
        color: '#FF9800',
        overlay: 'party-hat'
      },
      {
        id: 'road_warrior',
        distance: 250,
        name: 'Road Warrior',
        icon: '🏆',
        description: 'Serious traveler status achieved',
        color: '#9C27B0',
        overlay: 'warrior-helmet'
      },
      {
        id: 'thousand_miles',
        distance: 500,
        name: 'Five Hundred',
        icon: '🌟',
        description: 'Half a thousand kilometers of adventure!',
        color: '#F44336',
        overlay: 'star-crown'
      },
      {
        id: 'ultra_explorer',
        distance: 1000,
        name: 'Ultra Explorer',
        icon: '🚀',
        description: 'One thousand kilometers! You\'re unstoppable!',
        color: '#E91E63',
        overlay: 'astronaut-helmet'
      },
      {
        id: 'lunar_distance',
        distance: 3844,
        name: 'Lunar Distance',
        icon: '🌙',
        description: 'You could have traveled to the Moon!',
        color: '#607D8B',
        overlay: 'moon-glasses'
      },
      {
        id: 'around_earth',
        distance: 40075,
        name: 'Around Earth',
        icon: '🌍',
        description: 'You\'ve traveled the circumference of Earth!',
        color: '#795548',
        overlay: 'globe-crown'
      }
    ];
  }
  
  /**
   * Check for new milestone unlocks based on maximum distance
   * @param {number} maxDistance - Highest distance reached
   * @returns {Array} Array of newly unlocked milestones
   */
  checkMilestones(maxDistance) {
    const newMilestones = [];
    
    for (const milestone of this.milestones) {
      // Check if this milestone should be unlocked
      if (maxDistance >= milestone.distance && !this.unlockedMilestones.has(milestone.id)) {
        this.unlockedMilestones.add(milestone.id);
        newMilestones.push(milestone);
        console.log(`🏆 Milestone unlocked: ${milestone.name} (${milestone.distance}km)`);
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
      console.log(`🔓 Milestone restored: ${milestone.name} (${milestone.distance}km)`);
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
    console.log('🧹 All milestones reset');
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