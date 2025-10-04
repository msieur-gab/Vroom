import Modal from './Modal.js';

/**
 * NodeComponent - Simple schema-driven interactive node
 */
export class NodeComponent {
  constructor(nodeData, container) {
    this.nodeData = nodeData;
    this.container = container;
    this.element = null;
    this.schema = null;

    this.init();
  }
  
  async init() {
    await this.loadSchema();
    this.createElement();
    this.attachEventListeners();
    console.log('🎯 Node component initialized:', this.nodeData);
  }
  
  async loadSchema() {
    try {
      const response = await fetch(`./src/schemas/${this.nodeData.type}.json`);
      this.schema = await response.json();
    } catch (error) {
      console.warn('Failed to load schema, using defaults:', error);
      this.schema = {
        display: { icon: '❓', color: '#757575', size: '36px' },
        content: [{ field: 'title', type: 'header' }],
        modal: { title: 'Node Details', width: '400px' }
      };
    }
  }
  
  /**
   * Create the visual node element
   */
  createElement() {
    this.element = document.createElement('div');
    this.element.className = `node-component ${this.getNodeTypeClass()}`;
    this.element.style.cssText = `
      position: absolute;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 10;
    `;
    
    // Set position based on node data
    this.updatePosition();
    
    // Set content and styling based on node type
    this.updateAppearance();
    
    this.container.appendChild(this.element);
  }
  
  /**
   * Update node position
   */
  updatePosition() {
    if (this.nodeData.coords) {
      this.element.style.left = `${this.nodeData.coords.x}px`;
      this.element.style.top = `${this.nodeData.coords.y}px`;
    }
  }
  
  /**
   * Update appearance based on schema
   */
  updateAppearance() {
    if (!this.schema) return;

    const display = this.schema.display;

    // Apply schema styling
    this.element.style.backgroundColor = display.color;
    this.element.style.width = display.size;
    this.element.style.height = display.size;

    // Clear previous content
    this.element.innerHTML = '';

    // Set display text from schema
    const iconSpan = document.createElement('span');
    iconSpan.textContent = display.icon;
    iconSpan.style.position = 'relative';
    this.element.appendChild(iconSpan);

    // Add photo count badge if multiple photos
    if (this.nodeData.data && this.nodeData.data.photoCount > 1) {
      const badge = document.createElement('div');
      badge.className = 'photo-count-badge';
      badge.textContent = this.nodeData.data.photoCount;
      badge.style.cssText = `
        position: absolute;
        top: -4px;
        right: -4px;
        background: #FF9800;
        color: white;
        font-size: 10px;
        font-weight: bold;
        border-radius: 10px;
        min-width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.4);
      `;
      this.element.appendChild(badge);
    }

    // Add type indicator
    this.element.setAttribute('data-type', this.nodeData.type);
    this.element.setAttribute('data-distance', this.nodeData.distance);
  }
  
  /**
   * Get CSS class for node type
   */
  getNodeTypeClass() {
    return `node-type-${this.nodeData.type || 'default'}`;
  }
  
  /**
   * Get display text for node
   */
  getDisplayText() {
    const { type, distance, data } = this.nodeData;
    
    switch (type) {
      case 'photo':
        return '📷';
      case 'milestone':
        return '🏁';
      case 'checkpoint':
        return '📍';
      case 'badge':
        return '🏆';
      default:
        return distance ? `${distance}` : '?';
    }
  }
  
  /**
   * Attach click/tap event listeners
   */
  attachEventListeners() {
    this.element.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleTap();
    });
    
    // Hover effects
    this.element.addEventListener('mouseenter', () => {
      this.element.style.transform = 'scale(1.1)';
      this.element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
    });
    
    this.element.addEventListener('mouseleave', () => {
      if (!this.isExpanded) {
        this.element.style.transform = 'scale(1)';
        this.element.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      }
    });
  }
  
  /**
   * Handle tap/click interaction
   */
  handleTap() {
    console.log('🎯 Node tapped:', this.nodeData);
    
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  
  /**
   * Expand node or show modal
   */
  expand() {
    this.isExpanded = true;
    
    // Choose expansion type based on data complexity
    if (this.shouldShowModal()) {
      this.showModal();
    } else {
      this.showInlineExpansion();
    }
  }
  
  /**
   * Collapse node or hide modal
   */
  collapse() {
    this.isExpanded = false;

    // Hide the reusable modal
    Modal.hide();

    // Also hide inline expansion if present
    this.hideInlineExpansion();
  }
  
  /**
   * Determine if should show modal vs inline expansion
   */
  shouldShowModal() {
    const { data } = this.nodeData;
    
    // Show modal for complex data (images, long descriptions, etc.)
    return (
      data?.image ||
      data?.images?.length > 0 ||
      data?.description?.length > 100 ||
      data?.details ||
      Object.keys(data || {}).length > 3
    );
  }
  
  /**
   * Show inline expansion (simple tooltip-like)
   */
  showInlineExpansion() {
    const tooltip = document.createElement('div');
    tooltip.className = 'node-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 100;
      animation: fadeIn 0.3s ease;
    `;
    
    tooltip.textContent = this.getTooltipText();
    this.element.appendChild(tooltip);
    
    // Keep node highlighted
    this.element.style.transform = 'scale(1.1)';
    this.element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
  }
  
  /**
   * Hide inline expansion
   */
  hideInlineExpansion() {
    const tooltip = this.element.querySelector('.node-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
    
    this.element.style.transform = 'scale(1)';
    this.element.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
  }
  
  /**
   * Show modal with detailed information using reusable Modal component
   */
  showModal() {
    // Keep node highlighted
    this.element.style.transform = 'scale(1.1)';
    this.element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';

    // Show modal with generated content
    Modal.show({
      title: this.schema?.modal?.title || 'Node Details',
      content: this.generateModalContent(),
      width: this.schema?.modal?.width || '500px',
      maxHeight: '80vh',
      onClose: () => this.onModalClose()
    });

    // Attach action button listeners
    setTimeout(() => {
      document.querySelectorAll('.modal-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.handleAction(e.target.dataset.action));
      });
    }, 0);
  }

  /**
   * Handle action button click
   */
  handleAction(actionId) {
    if (actionId === 'take-selfie') {
      this.takeMilestoneSelfie();
    }
  }

  /**
   * Open camera to take milestone selfie
   */
  async takeMilestoneSelfie() {
    const { data } = this.nodeData;
    console.log('📸 Taking milestone selfie:', data);

    // Close modal first
    Modal.hide();

    // Dispatch event to app to open camera with milestone info
    const event = new CustomEvent('milestone-selfie-requested', {
      detail: {
        milestone: data,
        nodeComponent: this
      },
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  /**
   * Evaluate condition expression (simple implementation)
   */
  evaluateCondition(condition, data) {
    // Handle negation
    if (condition.startsWith('!')) {
      const field = condition.substring(1);
      return !data[field];
    }
    // Check if field exists and is truthy
    return !!data[condition];
  }

  /**
   * Handle modal close
   */
  onModalClose() {
    // Reset expanded state
    this.isExpanded = false;

    // Reset node highlight
    this.element.style.transform = 'scale(1)';
    this.element.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
  }
  
  /**
   * Generate tooltip text for inline expansion
   */
  getTooltipText() {
    const { type, distance, data } = this.nodeData;
    
    if (data?.title) return data.title;
    if (data?.description) return data.description.substring(0, 50) + '...';
    
    return `${type} at ${distance}km`;
  }
  
  /**
   * Generate modal content HTML from schema
   */
  generateModalContent() {
    if (!this.schema) return '<p>No schema available</p>';

    const { distance, data = {} } = this.nodeData;

    // Prepare photo data
    const preparedData = { ...data };

    // If there are multiple photos, prepare images array for gallery
    if (data.photos && data.photos.length > 0) {
      preparedData.images = data.photos.map(photo => photo.fullImage);
      // Use first photo as the main image
      preparedData.fullImage = data.photos[0].fullImage;
    }

    let content = `
      <div class="modal-header">
        <h2>${this.schema.modal.title}</h2>
        <p class="distance-info">${distance}km on your journey</p>
      </div>
      <div class="modal-content">
    `;

    // Generate content from schema
    this.schema.content.forEach(field => {
      const value = preparedData[field.field];

      // Check conditional rendering
      if (field.condition) {
        const conditionMet = this.evaluateCondition(field.condition, preparedData);
        if (!conditionMet) return;
      }

      // Skip single fullImage if we have a gallery
      if (field.field === 'fullImage' && preparedData.images && preparedData.images.length > 1) {
        return;
      }

      // Skip gallery if we only have one photo
      if (field.field === 'images' && (!preparedData.images || preparedData.images.length <= 1)) {
        return;
      }

      if (value) {
        content += this.renderField(field, value);
      }
    });

    content += '</div>';

    // Add action buttons if defined in schema
    if (this.schema.modal.actions) {
      content += '<div class="modal-actions">';
      this.schema.modal.actions.forEach(action => {
        // Check condition
        if (action.condition) {
          const conditionMet = this.evaluateCondition(action.condition, preparedData);
          if (!conditionMet) return;
        }
        content += `<button class="modal-action-btn" data-action="${action.id}">${action.label}</button>`;
      });
      content += '</div>';
    }

    return content;
  }
  
  /**
   * Render a field based on its type
   */
  renderField(field, value) {
    const icon = field.icon ? field.icon + ' ' : '';
    const suffix = field.suffix || '';
    
    switch (field.type) {
      case 'header':
        return `<h3>${icon}${value}</h3>`;
      case 'image':
        return `<img src="${value}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin: 8px 0;">`;
      case 'gallery':
        return Array.isArray(value) ?
          `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; margin: 8px 0;">${value.map(img => `<img src="${img}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 8px; cursor: pointer;">`).join('')}</div>` : '';
      case 'tags':
        return Array.isArray(value) ? 
          `<div>${value.map(tag => `<span style="background: #f0f0f0; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin: 2px;">${tag}</span>`).join(' ')}</div>` : '';
      case 'stat':
        return `<p><strong>${icon}${field.field}:</strong> ${value}${suffix}</p>`;
      case 'status':
        return `<p><strong>Status:</strong> ${value}</p>`;
      case 'rarity':
        return `<p><strong>Rarity:</strong> ${value}</p>`;
      case 'list':
        return Array.isArray(value) ? 
          `<ul>${value.map(item => `<li>${item}</li>`).join('')}</ul>` : '';
      case 'date':
      case 'datetime':
        return `<p><strong>${icon}${field.field}:</strong> ${new Date(value).toLocaleDateString()}</p>`;
      default:
        return `<p><strong>${icon}${field.field}:</strong> ${value}${suffix}</p>`;
    }
  }
  
  /**
   * Generate content specific to node type
   */
  generateTypeSpecificContent() {
    const { type, data } = this.nodeData;
    let content = '';
    
    switch (type) {
      case 'photo':
        if (data?.image) {
          content += `<img src="${data.image}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin: 16px 0;">`;
        }
        if (data?.images) {
          content += '<div class="image-gallery" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px; margin: 16px 0;">';
          data.images.forEach(img => {
            content += `<img src="${img}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px;">`;
          });
          content += '</div>';
        }
        break;
        
      case 'milestone':
        content += `
          <div class="milestone-info" style="text-align: center; margin: 16px 0;">
            <div style="font-size: 48px; margin-bottom: 8px;">🏁</div>
            <h3>Milestone Reached!</h3>
            <p>You've completed an important part of your journey.</p>
          </div>
        `;
        break;
        
      case 'badge':
        content += `
          <div class="badge-info" style="text-align: center; margin: 16px 0;">
            <div style="font-size: 48px; margin-bottom: 8px;">🏆</div>
            <h3>Achievement Unlocked!</h3>
            <p>${data?.achievement || 'You earned a new badge!'}</p>
          </div>
        `;
        break;
        
      case 'checkpoint':
        content += `
          <div class="checkpoint-info" style="margin: 16px 0;">
            <h3>📍 Checkpoint</h3>
            <p>Distance: ${this.nodeData.distance}km</p>
            <p>Progress saved at this point in your journey.</p>
          </div>
        `;
        break;
    }
    
    return content;
  }
  
  /**
   * Update node data and refresh appearance
   */
  updateData(newData) {
    this.nodeData = { ...this.nodeData, ...newData };
    this.updatePosition();
    this.updateAppearance();
  }
  
  /**
   * Destroy the component
   */
  destroy() {
    // Hide modal if open
    Modal.hide();

    if (this.element) {
      this.element.remove();
    }
  }
}

// Add minimal CSS for node components
const style = document.createElement('style');
style.textContent = `
  .node-component {
    user-select: none;
  }

  .modal-header {
    border-bottom: 1px solid #eee;
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .modal-header h2 {
    margin: 0 0 8px 0;
    color: #333;
  }

  .distance-info {
    margin: 0;
    color: #666;
    font-style: italic;
  }
`;
document.head.appendChild(style);