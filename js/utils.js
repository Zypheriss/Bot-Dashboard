const utils = {
  /**
   * @param {string} tag 
   * @param {Object} attrs 
   * @param {Array|string|Node} children 
   * @returns {HTMLElement} 
   */
  createElement(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (child) {
          element.appendChild(
            typeof child === 'string' 
              ? document.createTextNode(child) 
              : child
          );
        }
      });
    } else if (children) {
      element.appendChild(
        typeof children === 'string' 
          ? document.createTextNode(children) 
          : children
      );
    }
    
    return element;
  },
  
  /**
   * @param {string} sectionId 
   */
  showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add('active');
    }
  },
  
  /**
   * @param {boolean} show 
   * @param {string} message 
   */
  toggleLoading(show, message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const messageElement = overlay.querySelector('p');
    
    if (show) {
      messageElement.textContent = message;
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  },
  
  /**
   * @param {string} elementId
   * @param {string} message 
   */
  showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
    }
  },
  
  /**
   * @param {string} elementId 
   */
  clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = '';
      element.style.display = 'none';
    }
  },
  
  /**
   * @param {string} key 
   * @param {any} data
   */
  storeData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },
  
  /**
   * @param {string} key 
   * @returns {any} 
   */
  retrieveData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },
  
  /**
   * @param {number} num
   * @returns {string} 
   */
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  
  /**
   * @param {string} name 
   * @returns {string} 
   */
  getInitials(name) {
    if (!name) return '?';
    
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return name.charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
};
window.utils = utils;