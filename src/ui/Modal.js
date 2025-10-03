/**
 * Modal - Reusable modal dialog component
 * Singleton pattern for performance (one instance reused across app)
 *
 * Usage:
 *   Modal.show({
 *     title: 'My Title',
 *     content: '<div>HTML content</div>', // or HTMLElement
 *     width: '500px',
 *     onClose: () => console.log('closed')
 *   });
 *
 *   Modal.hide();
 */
export class Modal {
  static instance = null;

  constructor() {
    if (Modal.instance) {
      return Modal.instance;
    }

    this.modal = null;
    this.modalContent = null;
    this.contentContainer = null;
    this.onCloseCallback = null;
    this.isVisible = false;

    this.createModalElement();
    this.setupEventListeners();

    Modal.instance = this;
  }

  /**
   * Create the modal DOM structure once
   */
  createModalElement() {
    // Backdrop
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.style.display = 'none'; // Hidden by default

    // Content container
    this.modalContent = document.createElement('div');
    this.modalContent.className = 'modal-content';

    // Header
    this.headerContainer = document.createElement('div');
    this.headerContainer.className = 'modal-header';

    this.titleElement = document.createElement('h2');
    this.titleElement.className = 'modal-title';
    this.headerContainer.appendChild(this.titleElement);

    // Close button
    this.closeButton = document.createElement('button');
    this.closeButton.className = 'modal-close-btn';
    this.closeButton.innerHTML = '×';
    this.closeButton.setAttribute('aria-label', 'Close modal');
    this.headerContainer.appendChild(this.closeButton);

    // Body
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'modal-body';

    // Assemble
    this.modalContent.appendChild(this.headerContainer);
    this.modalContent.appendChild(this.contentContainer);
    this.modal.appendChild(this.modalContent);

    // Add to DOM
    document.body.appendChild(this.modal);
  }

  /**
   * Setup event listeners (once)
   */
  setupEventListeners() {
    // Close on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Close button
    this.closeButton.addEventListener('click', () => {
      this.hide();
    });

    // ESC key to close
    this.handleKeyDown = (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    };
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Show modal with content
   * @param {Object} options - { title, content, width, maxHeight, onClose }
   */
  show(options = {}) {
    const {
      title = 'Details',
      content = '',
      width = '500px',
      maxHeight = '80vh',
      onClose = null
    } = options;

    // Set title
    this.titleElement.textContent = title;

    // Clear and set content
    this.contentContainer.innerHTML = '';

    if (typeof content === 'string') {
      this.contentContainer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.contentContainer.appendChild(content);
    }

    // Set dimensions
    this.modalContent.style.maxWidth = width;
    this.modalContent.style.maxHeight = maxHeight;

    // Store callback
    this.onCloseCallback = onClose;

    // Show with animation
    this.modal.style.display = 'flex';
    this.isVisible = true;

    // Trigger CSS animation by adding class after display
    requestAnimationFrame(() => {
      this.modal.classList.add('modal-visible');
    });
  }

  /**
   * Hide modal
   */
  hide() {
    // Trigger fade out animation
    this.modal.classList.remove('modal-visible');

    // Wait for animation to complete
    setTimeout(() => {
      this.modal.style.display = 'none';
      this.isVisible = false;

      // Call onClose callback if provided
      if (this.onCloseCallback) {
        this.onCloseCallback();
        this.onCloseCallback = null;
      }
    }, 300); // Match CSS transition duration
  }

  /**
   * Destroy modal (cleanup)
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
    Modal.instance = null;
  }

  /**
   * Static convenience methods
   */
  static show(options) {
    const instance = new Modal();
    instance.show(options);
  }

  static hide() {
    if (Modal.instance) {
      Modal.instance.hide();
    }
  }
}

// Auto-create singleton instance
export default new Modal();
