// Authentication service for API calls

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class AuthService {
  // Get stored token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Set token in localStorage
  setToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem('authToken');
  }

  // Get stored user
  getStoredUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Set user in localStorage
  setStoredUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Remove user from localStorage
  removeStoredUser() {
    localStorage.removeItem('currentUser');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        this.setToken(data.token);
        this.setStoredUser(data.user);
        return { success: true, user: data.user, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        this.setToken(data.token);
        this.setStoredUser(data.user);
        return { success: true, user: data.user, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Update stored user data
        this.setStoredUser(data.user);
        return { success: true, user: data.user };
      } else {
        // If token is invalid, clear stored data
        if (response.status === 401 || response.status === 400) {
          this.logout();
        }
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    }
  }

  // Logout user
  logout() {
    this.removeToken();
    this.removeStoredUser();
    return { success: true, message: 'Logged out successfully' };
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  }

  // Reset password using token
  async resetPassword({ token, password }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  }

  // Make authenticated API request
  async authenticatedRequest(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const defaultHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // If unauthorized, logout user
      if (response.status === 401) {
        this.logout();
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;