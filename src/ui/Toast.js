/**
 * Toast - Simple toast notification system
 * Displays temporary messages with animations
 */

class ToastComponent {
  constructor() {
    this.container = null;
    this.init();
  }

  /**
   * Initialize toast container
   */
  init() {
    // Create toast container
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
      width: 90%;
      max-width: 500px;
    `;
    document.body.appendChild(this.container);
  }

  /**
   * Show a toast message
   * @param {string} message - Message to display
   * @param {string} type - Toast type: 'info', 'success', 'warning', 'error'
   * @param {Object} options - Toast options
   * @param {number} options.duration - Duration in ms (default 4000, 0 = no auto-close)
   * @param {boolean} options.tapToDismiss - Allow tap to dismiss (default true)
   */
  show(message, type = 'info', options = {}) {
    const { duration = 4000, tapToDismiss = true } = options;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Get color based on type
    const colors = {
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336'
    };

    toast.style.cssText = `
      background: ${colors[type] || colors.info};
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 15px;
      line-height: 1.4;
      text-align: center;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      pointer-events: auto;
    `;

    toast.textContent = message;
    this.container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Auto remove after duration (if duration > 0)
    if (duration > 0) {
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 300);
      }, duration);
    }

    // Allow manual close on tap (if enabled)
    if (tapToDismiss) {
      toast.addEventListener('click', () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
      });
      // Add visual hint that it's tappable
      toast.style.cursor = 'pointer';
    }
  }

  /**
   * Convenience methods
   */
  info(message, options) {
    this.show(message, 'info', options);
  }

  success(message, options) {
    this.show(message, 'success', options);
  }

  warning(message, options) {
    this.show(message, 'warning', options);
  }

  error(message, options) {
    this.show(message, 'error', options);
  }
}

// Singleton instance
export const Toast = new ToastComponent();
