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
      avatarSelfie: 'Take Selfie',
      avatarUpload: 'Upload Photo',
      avatarSkip: 'Skip (use colored icon)',
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
    badges: 'Badges'
  },

  // Milestones
  milestones: {
    firstSteps: {
      title: 'First Steps',
      description: 'Every journey begins with a single step'
    },
    explorer: {
      title: 'Explorer',
      description: 'You\'re getting the hang of this adventure thing!'
    },
    centuryMark: {
      title: 'Century Mark',
      description: '100 kilometers of memories captured'
    },
    roadWarrior: {
      title: 'Road Warrior',
      description: 'Serious traveler status achieved'
    },
    thousandMiles: {
      title: 'Thousand Kilometers',
      description: 'Epic journey milestone'
    },
    moonDistance: {
      title: 'Lunar Distance',
      description: 'You could have traveled to the Moon!'
    }
  }
};
