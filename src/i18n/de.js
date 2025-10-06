/**
 * Deutsche Übersetzungen für Vrooom
 */

export default {
  // Gemeinsame UI-Elemente
  common: {
    next: 'Weiter',
    back: 'Zurück',
    skip: 'Überspringen',
    done: 'Fertig',
    cancel: 'Abbrechen',
    continue: 'Fortfahren',
    close: 'Schließen'
  },

  // Onboarding-Prozess
  onboarding: {
    step1: {
      title: 'Willkommen bei Vrooom!',
      description: 'Verwandle deine Reisen in eine Abenteuerkarte'
    },
    step2: {
      title: 'Jede Reise Erzählt eine Geschichte',
      description: 'Mache Fotos während deiner Abenteuer. Jedes Foto wird zu einem Punkt auf deiner persönlichen Karte, verbunden durch Straßen, die deinen Weg zeigen.'
    },
    step3: {
      title: 'Deine Daten Bleiben Deine',
      description: 'Alles wird auf deinem Gerät gespeichert. Keine Verfolgung, keine Server, vollständig offline.'
    },
    step4: {
      title: 'Kamerazugriff Erforderlich',
      description: 'Um deine Abenteuerfotos aufzunehmen',
      grantPermission: 'Kamera Erlauben',
      permissionGranted: 'Kamerazugriff gewährt!',
      iosInstructions: 'Um die Kamera zu aktivieren:\n1. Öffne Einstellungen → Safari → Kamera\n2. Wähle "Erlauben"\n3. Kehre zu dieser Seite zurück'
    },
    step5: {
      title: 'Standortzugriff Erforderlich',
      description: 'GPS verfolgt die zurückgelegte Entfernung und positioniert Fotos auf deinem Raster',
      grantPermission: 'Standort Erlauben',
      permissionGranted: 'Standortzugriff gewährt!',
      iosInstructions: 'Um den Standort zu aktivieren:\n1. Öffne Einstellungen → Safari → Standort\n2. Wähle "Beim Verwenden der App"\n3. Kehre zu dieser Seite zurück'
    },
    step6: {
      title: 'Wer Fährt?',
      description: 'Erstelle dein Fahrerprofil',
      namePlaceholder: 'Dein Name',
      nameDefault: 'Fahrer',
      avatarHint: 'Tippen, um Foto hinzuzufügen',
      chooseColor: 'Wähle deine Farbe:',
      colors: {
        blue: 'Blau',
        green: 'Grün',
        orange: 'Orange',
        purple: 'Lila',
        red: 'Rot'
      }
    },
    step7: {
      title: 'Bereit, {name}!',
      description: 'Tippe auf die Kamera-Schaltfläche, um dein erstes Abenteuer zu starten',
      startAdventure: 'Abenteuer Starten'
    },
    languageSelection: {
      title: 'Wähle Deine Sprache',
      description: 'Wähle deine bevorzugte Sprache'
    }
  },

  // Berechtigungsfehler
  permissions: {
    cameraBlocked: 'Kamerazugriff ist blockiert',
    locationBlocked: 'Standortzugriff ist blockiert',
    cameraRequired: 'Kameraberechtigung ist erforderlich, um Vrooom zu verwenden',
    locationRequired: 'Standortberechtigung ist erforderlich, um Vrooom zu verwenden'
  },

  // Haupt-App-UI
  app: {
    takePhoto: 'Foto Aufnehmen',
    milestones: 'Meilensteine',
    settings: 'Einstellungen',
    distance: 'Entfernung',
    adventures: 'Abenteuer',
    badges: 'Abzeichen',
    milestoneUnlocked: 'Du hast {distance}km zurückgelegt!'
  },

  // Meilensteine
  milestones: {
    first_steps: {
      title: 'Erste Schritte',
      description: 'Jede Reise beginnt mit einem ersten Schritt'
    },
    explorer: {
      title: 'Entdecker',
      description: 'Du bekommst den Dreh raus mit diesem Abenteuer!'
    },
    century_mark: {
      title: 'Hundert-Kilometer-Marke',
      description: '100 Kilometer an Erinnerungen festgehalten'
    },
    road_warrior: {
      title: 'Straßenkrieger',
      description: 'Status eines ernsthaften Reisenden erreicht'
    },
    five_hundred: {
      title: 'Fünfhundert',
      description: 'Ein halbes Tausend Kilometer Abenteuer!'
    },
    ultra_explorer: {
      title: 'Ultra-Entdecker',
      description: 'Tausend Kilometer! Du bist unaufhaltsam!'
    },
    lunar_distance: {
      title: 'Mondentfernung',
      description: 'Du hättest zum Mond reisen können!'
    },
    around_earth: {
      title: 'Rund um die Erde',
      description: 'Du hast den Erdumfang bereist!'
    }
  },

  // Knotenschemas
  schemas: {
    journey: {
      title: '📷 Reisefoto',
      subtitle: '{distance}km von {playerName}s Reise'
    },
    milestone: {
      title: '🏁 Meilenstein Erreicht, {playerName}!',
      subtitle: '{distance}km deiner Reise'
    },
    reward: {
      title: '🏆 Erfolg Freigeschaltet!',
      subtitle: '{distance}km deiner Reise'
    },
    checkpoint: {
      title: '📍 Checkpoint-Details',
      subtitle: '{distance}km deiner Reise'
    },
    fields: {
      title: 'Titel',
      achievement: 'Erfolg',
      description: 'Beschreibung',
      celebration: 'Feier',
      totalDistance: 'Gesamtdistanz',
      timeElapsed: 'Verstrichene Zeit',
      badgeEarned: 'Erhaltenes Abzeichen',
      location: 'Standort',
      weather: 'Wetter',
      mood: 'Stimmung',
      status: 'Status',
      rarity: 'Seltenheit',
      images: 'Fotos',
      fullImage: 'Vollbild'
    }
  }
};
