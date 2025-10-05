/**
 * Traductions françaises pour Vrooom
 */

export default {
  // Éléments UI communs
  common: {
    next: 'Suivant',
    back: 'Retour',
    skip: 'Passer',
    done: 'Terminé',
    cancel: 'Annuler',
    continue: 'Continuer',
    close: 'Fermer'
  },

  // Processus d'intégration
  onboarding: {
    step1: {
      title: 'Bienvenue sur Vrooom !',
      description: 'Transformez vos voyages en carte d\'aventure'
    },
    step2: {
      title: 'Chaque Voyage Raconte une Histoire',
      description: 'Prenez des photos pendant vos aventures. Chaque photo devient un point sur votre carte personnelle, reliés par des routes montrant le chemin parcouru.'
    },
    step3: {
      title: 'Vos Données Restent à Vous',
      description: 'Tout est stocké sur votre appareil. Aucun suivi, aucun serveur, complètement hors ligne.'
    },
    step4: {
      title: 'Accès Caméra Requis',
      description: 'Pour capturer vos photos d\'aventure',
      grantPermission: 'Autoriser la Caméra',
      permissionGranted: 'Accès caméra autorisé !',
      iosInstructions: 'Pour activer la caméra :\n1. Ouvrez Réglages → Safari → Caméra\n2. Sélectionnez "Autoriser"\n3. Revenez sur cette page'
    },
    step5: {
      title: 'Accès Position Requis',
      description: 'Le GPS suit la distance parcourue et positionne les photos sur votre grille',
      grantPermission: 'Autoriser la Position',
      permissionGranted: 'Accès position autorisé !',
      iosInstructions: 'Pour activer la position :\n1. Ouvrez Réglages → Safari → Localisation\n2. Sélectionnez "Lors de l\'utilisation"\n3. Revenez sur cette page'
    },
    step6: {
      title: 'Qui Est au Volant ?',
      description: 'Créez votre profil de conducteur',
      namePlaceholder: 'Votre nom',
      nameDefault: 'Conducteur',
      avatarHint: 'Appuyer pour ajouter une photo',
      chooseColor: 'Choisissez votre couleur :',
      colors: {
        blue: 'Bleu',
        green: 'Vert',
        orange: 'Orange',
        purple: 'Violet',
        red: 'Rouge'
      }
    },
    step7: {
      title: 'Prêt, {name} !',
      description: 'Appuyez sur le bouton caméra pour commencer votre première aventure',
      startAdventure: 'Démarrer l\'Aventure'
    },
    languageSelection: {
      title: 'Choisissez Votre Langue',
      description: 'Sélectionnez votre langue préférée'
    }
  },

  // Erreurs de permissions
  permissions: {
    cameraBlocked: 'L\'accès à la caméra est bloqué',
    locationBlocked: 'L\'accès à la position est bloqué',
    cameraRequired: 'La permission caméra est requise pour utiliser Vrooom',
    locationRequired: 'La permission position est requise pour utiliser Vrooom'
  },

  // Interface principale
  app: {
    takePhoto: 'Prendre une Photo',
    milestones: 'Étapes',
    settings: 'Paramètres',
    distance: 'Distance',
    adventures: 'Aventures',
    badges: 'Badges',
    milestoneUnlocked: 'Vous avez parcouru {distance}km !'
  },

  // Jalons
  milestones: {
    first_steps: {
      title: 'Premiers Pas',
      description: 'Chaque voyage commence par un premier pas'
    },
    explorer: {
      title: 'Explorateur',
      description: 'Vous prenez le coup de cette aventure !'
    },
    century_mark: {
      title: 'Cap des 100',
      description: '100 kilomètres de souvenirs capturés'
    },
    road_warrior: {
      title: 'Guerrier de la Route',
      description: 'Statut de voyageur sérieux atteint'
    },
    five_hundred: {
      title: 'Cinq Cents',
      description: 'Un demi-millier de kilomètres d\'aventure !'
    },
    ultra_explorer: {
      title: 'Ultra Explorateur',
      description: 'Mille kilomètres ! Vous êtes inarrêtable !'
    },
    lunar_distance: {
      title: 'Distance Lunaire',
      description: 'Vous auriez pu voyager jusqu\'à la Lune !'
    },
    around_earth: {
      title: 'Tour de la Terre',
      description: 'Vous avez parcouru la circonférence de la Terre !'
    }
  },

  // Schémas de nœuds
  schemas: {
    journey: {
      title: '📷 Photo de Voyage',
      subtitle: '{distance}km du voyage de {playerName}'
    },
    milestone: {
      title: '🏁 Étape Atteinte, {playerName} !',
      subtitle: '{distance}km de votre voyage'
    },
    reward: {
      title: '🏆 Succès Débloqué !',
      subtitle: '{distance}km de votre voyage'
    },
    checkpoint: {
      title: '📍 Détails du Point de Contrôle',
      subtitle: '{distance}km de votre voyage'
    },
    fields: {
      achievement: 'Succès',
      description: 'Description',
      celebration: 'Célébration',
      totalDistance: 'Distance Totale',
      timeElapsed: 'Temps Écoulé',
      badgeEarned: 'Badge Obtenu',
      location: 'Localisation',
      weather: 'Météo',
      mood: 'Humeur',
      status: 'Statut',
      rarity: 'Rareté'
    }
  }
};
