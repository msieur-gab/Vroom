/**
 * English translations for Vrooom
 */

export default {
  // Common UI elements
  common: {
    next: 'Next',
    back: 'Back',
    skip: 'Skip',
    done: 'Done',
    cancel: 'Cancel',
    continue: 'Continue',
    close: 'Close'
  },

  // Onboarding flow
  onboarding: {
    step1: {
      title: 'Welcome to Vrooom!',
      description: 'Turn your travels into an adventure map'
    },
    step2: {
      title: 'Every Journey Tells a Story',
      description: 'Take photos during your adventures. Each photo becomes a node on your personal map, connected by roads showing the path you\'ve traveled.'
    },
    step3: {
      title: 'Your Data Stays Yours',
      description: 'Everything is stored on your device. No tracking, no servers, completely offline.'
    },
    step4: {
      title: 'Camera Access Needed',
      description: 'To capture your adventure photos',
      grantPermission: 'Grant Camera Permission',
      permissionGranted: 'Camera access granted!',
      iosInstructions: 'To enable camera:\n1. Open Settings → Safari → Camera\n2. Select "Allow"\n3. Return to this page'
    },
    step5: {
      title: 'Location Access Needed',
      description: 'GPS tracks distance traveled and positions photos on your grid',
      grantPermission: 'Grant Location Permission',
      permissionGranted: 'Location access granted!',
      iosInstructions: 'To enable location:\n1. Open Settings → Safari → Location\n2. Select "While Using the App"\n3. Return to this page'
    },
    step6: {
      title: 'Who\'s Driving?',
      description: 'Create your driver profile',
      namePlaceholder: 'Your name',
      nameDefault: 'Driver',
      avatarHint: 'Tap to add photo',
      chooseColor: 'Choose your color:',
      colors: {
        blue: 'Blue',
        green: 'Green',
        orange: 'Orange',
        purple: 'Purple',
        red: 'Red'
      }
    },
    step7: {
      title: 'Ready, {name}!',
      description: 'Tap the camera button to start your first adventure',
      startAdventure: 'Start Adventure'
    },
    languageSelection: {
      title: 'Choose Your Language',
      description: 'Select your preferred language'
    }
  },

  // Permission errors
  permissions: {
    cameraBlocked: 'Camera access is blocked',
    locationBlocked: 'Location access is blocked',
    cameraRequired: 'Camera permission is required to use Vrooom',
    locationRequired: 'Location permission is required to use Vrooom'
  },

  // Main app UI
  app: {
    takePhoto: 'Take Photo',
    milestones: 'Milestones',
    settings: 'Settings',
    distance: 'Distance',
    adventures: 'Adventures',
    badges: 'Badges',
    milestoneUnlocked: 'You\'ve traveled {distance}km!'
  },

  // Milestones
  milestones: {
    first_steps: {
      title: 'First Steps',
      description: 'Every journey begins with a single step'
    },
    explorer: {
      title: 'Explorer',
      description: 'You\'re getting the hang of this adventure thing!'
    },
    century_mark: {
      title: 'Century Mark',
      description: '100 kilometers of memories captured'
    },
    road_warrior: {
      title: 'Road Warrior',
      description: 'Serious traveler status achieved'
    },
    five_hundred: {
      title: 'Five Hundred',
      description: 'Half a thousand kilometers of adventure!'
    },
    ultra_explorer: {
      title: 'Ultra Explorer',
      description: 'One thousand kilometers! You\'re unstoppable!'
    },
    lunar_distance: {
      title: 'Lunar Distance',
      description: 'You could have traveled to the Moon!'
    },
    around_earth: {
      title: 'Around Earth',
      description: 'You\'ve traveled the circumference of Earth!'
    }
  },

  // Node schemas
  schemas: {
    journey: {
      title: '📷 Journey Photo',
      subtitle: '{distance}km on {playerName}\'s journey'
    },
    milestone: {
      title: '🏁 Milestone Reached, {playerName}!',
      subtitle: '{distance}km on your journey'
    },
    reward: {
      title: '🏆 Achievement Unlocked!',
      subtitle: '{distance}km on your journey'
    },
    checkpoint: {
      title: '📍 Checkpoint Details',
      subtitle: '{distance}km on your journey'
    },
    fields: {
      title: 'Title',
      achievement: 'Achievement',
      description: 'Description',
      celebration: 'Celebration',
      totalDistance: 'Total Distance',
      timeElapsed: 'Time Elapsed',
      badgeEarned: 'Badge Earned',
      location: 'Location',
      weather: 'Weather',
      mood: 'Mood',
      status: 'Status',
      rarity: 'Rarity',
      images: 'Photos'
    }
  }
};
