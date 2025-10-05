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
    badges: 'Abzeichen'
  },

  // Meilensteine
  milestones: {
    firstSteps: {
      title: 'Erste Schritte',
      description: 'Jede Reise beginnt mit einem ersten Schritt'
    },
    explorer: {
      title: 'Entdecker',
      description: 'Du bekommst den Dreh raus mit diesem Abenteuer!'
    },
    centuryMark: {
      title: 'Hundert-Kilometer-Marke',
      description: '100 Kilometer an Erinnerungen festgehalten'
    },
    roadWarrior: {
      title: 'Straßenkrieger',
      description: 'Status eines ernsthaften Reisenden erreicht'
    },
    thousandMiles: {
      title: 'Tausend Kilometer',
      description: 'Epischer Reisemeilenstein'
    },
    moonDistance: {
      title: 'Mondentfernung',
      description: 'Du hättest zum Mond reisen können!'
    }
  }
};
