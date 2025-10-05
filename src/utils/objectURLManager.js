/**
 * Object URL Manager
 * Tracks and manages URL.createObjectURL() calls to prevent memory leaks
 */

class ObjectURLManager {
  constructor() {
    this.urls = new Set();
  }

  /**
   * Create object URL and track it for cleanup
   * @param {Blob} blob - Blob to create URL for
   * @returns {string} Object URL
   */
  create(blob) {
    const url = URL.createObjectURL(blob);
    this.urls.add(url);
    return url;
  }

  /**
   * Revoke a specific object URL
   * @param {string} url - URL to revoke
   */
  revoke(url) {
    if (this.urls.has(url)) {
      URL.revokeObjectURL(url);
      this.urls.delete(url);
    }
  }

  /**
   * Revoke all tracked object URLs
   */
  revokeAll() {
    this.urls.forEach(url => URL.revokeObjectURL(url));
    this.urls.clear();
  }

  /**
   * Get count of currently tracked URLs
   * @returns {number} Number of tracked URLs
   */
  getCount() {
    return this.urls.size;
  }
}

// Export singleton instance
export const objectURLManager = new ObjectURLManager();
