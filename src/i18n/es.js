/**
 * Traducciones en español para Vrooom
 */

export default {
  // Elementos UI comunes
  common: {
    next: 'Siguiente',
    back: 'Atrás',
    skip: 'Saltar',
    done: 'Hecho',
    cancel: 'Cancelar',
    continue: 'Continuar',
    close: 'Cerrar'
  },

  // Proceso de incorporación
  onboarding: {
    step1: {
      title: '¡Bienvenido a Vrooom!',
      description: 'Convierte tus viajes en un mapa de aventuras'
    },
    step2: {
      title: 'Cada Viaje Cuenta una Historia',
      description: 'Toma fotos durante tus aventuras. Cada foto se convierte en un nodo en tu mapa personal, conectados por caminos que muestran el camino recorrido.'
    },
    step3: {
      title: 'Tus Datos Son Tuyos',
      description: 'Todo se almacena en tu dispositivo. Sin rastreo, sin servidores, completamente sin conexión.'
    },
    step4: {
      title: 'Acceso a Cámara Necesario',
      description: 'Para capturar tus fotos de aventura',
      grantPermission: 'Permitir Cámara',
      permissionGranted: '¡Acceso a cámara concedido!',
      iosInstructions: 'Para activar la cámara:\n1. Abre Ajustes → Safari → Cámara\n2. Selecciona "Permitir"\n3. Vuelve a esta página'
    },
    step5: {
      title: 'Acceso a Ubicación Necesario',
      description: 'El GPS rastrea la distancia recorrida y posiciona las fotos en tu cuadrícula',
      grantPermission: 'Permitir Ubicación',
      permissionGranted: '¡Acceso a ubicación concedido!',
      iosInstructions: 'Para activar la ubicación:\n1. Abre Ajustes → Safari → Ubicación\n2. Selecciona "Mientras se usa la app"\n3. Vuelve a esta página'
    },
    step6: {
      title: '¿Quién Conduce?',
      description: 'Crea tu perfil de conductor',
      namePlaceholder: 'Tu nombre',
      nameDefault: 'Conductor',
      avatarHint: 'Toca para añadir foto',
      chooseColor: 'Elige tu color:',
      colors: {
        blue: 'Azul',
        green: 'Verde',
        orange: 'Naranja',
        purple: 'Morado',
        red: 'Rojo'
      }
    },
    step7: {
      title: '¡Listo, {name}!',
      description: 'Toca el botón de cámara para comenzar tu primera aventura',
      startAdventure: 'Comenzar Aventura'
    },
    languageSelection: {
      title: 'Elige Tu Idioma',
      description: 'Selecciona tu idioma preferido'
    }
  },

  // Errores de permisos
  permissions: {
    cameraBlocked: 'El acceso a la cámara está bloqueado',
    locationBlocked: 'El acceso a la ubicación está bloqueado',
    cameraRequired: 'El permiso de cámara es necesario para usar Vrooom',
    locationRequired: 'El permiso de ubicación es necesario para usar Vrooom'
  },

  // Interfaz principal
  app: {
    takePhoto: 'Tomar Foto',
    milestones: 'Hitos',
    settings: 'Ajustes',
    distance: 'Distancia',
    adventures: 'Aventuras',
    badges: 'Insignias',
    milestoneUnlocked: '¡Has viajado {distance}km!'
  },

  // Hitos
  milestones: {
    first_steps: {
      title: 'Primeros Pasos',
      description: 'Cada viaje comienza con un primer paso'
    },
    explorer: {
      title: 'Explorador',
      description: '¡Le estás cogiendo el truco a esto de las aventuras!'
    },
    century_mark: {
      title: 'Marca del Centenario',
      description: '100 kilómetros de recuerdos capturados'
    },
    road_warrior: {
      title: 'Guerrero del Camino',
      description: 'Estado de viajero serio alcanzado'
    },
    five_hundred: {
      title: 'Quinientos',
      description: '¡Medio millar de kilómetros de aventura!'
    },
    ultra_explorer: {
      title: 'Ultra Explorador',
      description: '¡Mil kilómetros! ¡Eres imparable!'
    },
    lunar_distance: {
      title: 'Distancia Lunar',
      description: '¡Podrías haber viajado hasta la Luna!'
    },
    around_earth: {
      title: 'Alrededor de la Tierra',
      description: '¡Has viajado la circunferencia de la Tierra!'
    }
  },

  // Esquemas de nodos
  schemas: {
    journey: {
      title: '📷 Foto de Viaje',
      subtitle: '{distance}km del viaje de {playerName}'
    },
    milestone: {
      title: '🏁 ¡Hito Alcanzado, {playerName}!',
      subtitle: '{distance}km de tu viaje'
    },
    reward: {
      title: '🏆 ¡Logro Desbloqueado!',
      subtitle: '{distance}km de tu viaje'
    },
    checkpoint: {
      title: '📍 Detalles del Punto de Control',
      subtitle: '{distance}km de tu viaje'
    },
    fields: {
      title: 'Título',
      achievement: 'Logro',
      description: 'Descripción',
      celebration: 'Celebración',
      totalDistance: 'Distancia Total',
      timeElapsed: 'Tiempo Transcurrido',
      badgeEarned: 'Insignia Obtenida',
      location: 'Ubicación',
      weather: 'Clima',
      mood: 'Estado de ánimo',
      status: 'Estado',
      rarity: 'Rareza',
      images: 'Fotos',
      fullImage: 'Imagen Completa'
    }
  }
};
