// Personal Expenses service for API calls

// Import data utilities for local fallback
import { getPersonalExpensesLocal, deletePersonalExpenseLocal, updatePersonalExpenseLocal } from '../utils/expenseUtils';
import { getFriendsLocal, lookupUserByEmailLocal, addFriendLocal } from '../utils/friendUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ExpenseService {
  // Get stored token
  getToken() {
    return localStorage.getItem('authToken');
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
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  }

  // Get personal expenses
  async getPersonalExpenses() {
    try {
      const response = await this.authenticatedRequest(`${API_BASE_URL}/expenses/personal`);
      const data = await response.json();

      if (data.success) {
        return { success: true, expenses: data.expenses };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.log('API not available, loading personal expenses from local data:', error);
      
      // Fallback to local data with localStorage modifications
      try {
        // Get current user ID from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!currentUser.id) {
          return { success: false, message: 'User not authenticated' };
        }
        
        const expenses = await getPersonalExpensesLocal(currentUser.id);
        return { success: true, expenses };
        
      } catch (localError) {
        console.error('Error loading personal expenses from local data:', localError);
        return { 
          success: false, 
          message: 'Failed to load expenses from local data' 
        };
      }
    }
  }

  // Add personal expense
  async addPersonalExpense(expenseData) {
    try {
      const response = await this.authenticatedRequest(`${API_BASE_URL}/expenses/personal`, {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, expense: data.expense, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Add personal expense error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    }
  }

  // Update personal expense
  async updatePersonalExpense(expenseId, expenseData) {
    try {
      const response = await this.authenticatedRequest(`${API_BASE_URL}/expenses/personal/${expenseId}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, expense: data.expense, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.log('API not available, updating expense in local data:', error);
      
      // Update in local storage
      const success = updatePersonalExpenseLocal(expenseId, expenseData);
      
      if (success) {
        return { 
          success: true, 
          message: 'Expense updated successfully' 
        };
      } else {
        return { 
          success: false, 
          message: 'Failed to update expense in local data' 
        };
      }
    }
  }

  // Delete personal expense
  async deletePersonalExpense(expenseId) {
    try {
      const response = await this.authenticatedRequest(`${API_BASE_URL}/expenses/personal/${expenseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.log('API not available, deleting expense from local data:', error);
      
      // Delete from local storage
      const success = deletePersonalExpenseLocal(expenseId);
      
      if (success) {
        return { 
          success: true, 
          message: 'Expense deleted successfully' 
        };
      } else {
        return { 
          success: false, 
          message: 'Failed to delete expense from local data' 
        };
      }
    }
  }

  // Get friends
  async getFriends() {
    try {
      const response = await this.authenticatedRequest(`${API_BASE_URL}/friends`);
      const data = await response.json();

      if (data.success) {
        return { success: true, friends: data.friends };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.log('API not available, loading friends from local data:', error);
      
      // Fallback to local data
      try {
        // Get current user ID from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!currentUser.id) {
          return { success: false, message: 'User not authenticated' };
        }
        
        const friends = await getFriendsLocal(currentUser.id);
        return { success: true, friends };
        
      } catch (localError) {
        console.error('Error loading friends from local data:', localError);
        return { 
          success: false, 
          message: 'Failed to load friends from local data' 
        };
      }
    }
  }

  // Add friend
  async addFriend(friendData) {
    try {
      const response = await this.authenticatedRequest(`${API_BASE_URL}/friends`, {
        method: 'POST',
        body: JSON.stringify(friendData),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, friend: data.friend, message: data.message, isRegistered: data.isRegistered };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.log('API not available, adding friend locally:', error);
      
      // Fallback to local data
      try {
        // Get current user ID from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!currentUser.id) {
          return { success: false, message: 'User not authenticated' };
        }
        
        const result = await addFriendLocal(currentUser.id, friendData.email);
        return result;
        
      } catch (localError) {
        console.error('Error adding friend locally:', localError);
        return { 
          success: false, 
          message: 'Failed to add friend locally' 
        };
      }
    }
  }

  // Lookup user by email (pre-check)
  async lookupUserByEmail(email) {
    try {
      const url = `${API_BASE_URL}/users/lookup?email=${encodeURIComponent(email)}`;
      const response = await this.authenticatedRequest(url);
      const data = await response.json();
      if (data.success) {
        return { success: true, ...data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.log('API not available, looking up user locally:', error);
      
      // Fallback to local data
      try {
        // Get current user ID from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!currentUser.id) {
          return { success: false, message: 'User not authenticated' };
        }
        
        const result = await lookupUserByEmailLocal(email, currentUser.id);
        return result;
        
      } catch (localError) {
        console.error('Error looking up user locally:', localError);
        return { 
          success: false, 
          message: 'Failed to lookup user locally' 
        };
      }
    }
  }

  // Block friend
  async blockFriend(friendId) {
    try {
      const response = await this.authenticatedRequest(`${API_BASE_URL}/friends/${friendId}/block`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Block friend error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  }

  // Unblock friend
  async unblockFriend(friendId) {
    try {
      const response = await this.authenticatedRequest(`${API_BASE_URL}/friends/${friendId}/unblock`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Unblock friend error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  }

  // Get groups
  async getGroups() {
    try {
      const response = await this.authenticatedRequest(`${API_BASE_URL}/groups`);
      const data = await response.json();

      if (data.success) {
        return { success: true, groups: data.groups };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get groups error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    }
  }

  // Create group
  async createGroup(groupData) {
    try {
      const response = await this.authenticatedRequest(`${API_BASE_URL}/groups`, {
        method: 'POST',
        body: JSON.stringify(groupData),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, group: data.group, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Create group error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    }
  }

  // Add member to group
  async addGroupMember(groupId, memberData) {
    try {
      const response = await this.authenticatedRequest(`${API_BASE_URL}/groups/${groupId}/members`, {
        method: 'POST',
        body: JSON.stringify(memberData),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, member: data.member, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Add group member error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    }
  }
}

// Create and export a singleton instance
const expenseService = new ExpenseService();
export default expenseService;