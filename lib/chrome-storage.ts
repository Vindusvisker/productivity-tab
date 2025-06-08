// Chrome storage utility for the productivity dashboard
export const storage = {
  async save(key: string, value: any): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ [key]: value });
      } else {
        // Fallback to localStorage for development
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Storage save error:', error);
    }
  },

  async load(key: string): Promise<any> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(key);
        return result[key];
      } else {
        // Fallback to localStorage for development
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch (error) {
      console.error('Storage load error:', error);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove(key);
      } else {
        // Fallback to localStorage for development
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.clear();
      } else {
        // Fallback to localStorage for development
        localStorage.clear();
      }
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
}; 