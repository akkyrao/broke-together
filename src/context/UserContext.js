import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveDataToJson, loadDataFromJson, processGroupsWithMembers } from '../utils/dataUtils';
import authService from '../services/authService';
import expenseService from '../services/expenseService';
import { getPersonalExpensesLocal, deletePersonalExpenseLocal } from '../utils/expenseUtils';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  // State for user data
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [usersData, setUsersData] = useState([]);
  
  const [balances, setBalances] = useState({
    youOwe: 2450,
    owedToYou: 1200,
    totalSpent: 15240,
    monthlySpent: 3450,
    weeklySpent: 850
  });
  
  const [friends, setFriends] = useState([]);
  
  const [groups, setGroups] = useState([]);
  
  const [personalExpenses, setPersonalExpenses] = useState([]);
  
  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 1,
      description: 'Dinner',
      amount: 420,
      date: '2023-05-15',
      paidBy: 'You'
    },
    {
      id: 2,
      description: 'Coffee',
      amount: 45,
      date: '2023-05-14',
      paidBy: 'You'
    },
    {
      id: 3,
      description: 'Groceries',
      amount: 250,
      date: '2023-05-12',
      paidBy: 'Sarah'
    }
  ]);
  
  // CRUD operations for users
  const createUser = (userData) => {
    // Generate a unique ID
    const newId = usersData.length > 0 
      ? Math.max(...usersData.map(user => user.id)) + 1 
      : 1;
    
    const newUser = { ...userData, id: newId };
    const updatedUsers = [...usersData, newUser];
    
    setUsersData(updatedUsers);
    saveDataToJson({ users: updatedUsers });
    
    return newUser;
  };
  
  const getUser = (userId) => {
    return usersData.find(user => user.id === userId);
  };
  
  const updateUser = (userId, userData) => {
    const updatedUsers = usersData.map(user => 
      user.id === userId ? { ...user, ...userData } : user
    );
    
    setUsersData(updatedUsers);
    saveDataToJson({ users: updatedUsers });
    
    // Update current user if it's the same user being updated
    if (currentUser && currentUser.id === userId) {
      const updatedCurrentUser = { ...currentUser, ...userData };
      setCurrentUser(updatedCurrentUser);
      // Update localStorage as well
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }
    
    return getUser(userId);
  };
  
  const deleteUser = (userId) => {
    const updatedUsers = usersData.filter(user => user.id !== userId);
    
    setUsersData(updatedUsers);
    saveDataToJson({ users: updatedUsers });
    
    return true;
  };
  

  
  // Load profile picture from localStorage
  const loadProfilePicture = (user) => {
    if (user && user.id) {
      const imageKey = `profile_image_${user.id}`;
      const storedImage = localStorage.getItem(imageKey);
      if (storedImage && !user.avatar) {
        return { ...user, avatar: storedImage };
      }
    }
    return user;
  };

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      
      if (authService.isAuthenticated()) {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          // Load profile picture from localStorage if not already present
          const userWithAvatar = loadProfilePicture(storedUser);
          setCurrentUser(userWithAvatar);
          setIsAuthenticated(true);
          
          // Optionally verify token with server
          try {
            const result = await authService.getProfile();
            if (result.success) {
              const userWithAvatarFromServer = loadProfilePicture(result.user);
              setCurrentUser(userWithAvatarFromServer);
            } else {
              // Token might be expired, logout
              logout();
            }
          } catch (error) {
            console.error('Error verifying token:', error);
            // Don't logout on network errors, keep using stored user
            console.log('Using stored user data due to network error');
          }
        }
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        const userWithAvatar = loadProfilePicture(result.user);
        setCurrentUser(userWithAvatar);
        setIsAuthenticated(true);
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        const userWithAvatar = loadProfilePicture(result.user);
        setCurrentUser(userWithAvatar);
        setIsAuthenticated(true);
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  // Load friends from API or local data
  const loadFriends = async () => {
    if (!currentUser) return;
    
    try {
      // Try to load from localStorage first (for friend balance persistence)
      const friendsKey = `friends_${currentUser.id}`;
      const storedFriends = localStorage.getItem(friendsKey);
      
      if (storedFriends) {
        const parsedFriends = JSON.parse(storedFriends);
        setFriends(parsedFriends);
        return;
      }
      
      // Try to load from API
      const result = await expenseService.getFriends();
      if (result.success) {
        const friendsWithBalance = result.friends.map(friend => ({
          ...friend,
          balance: 0 // Initialize balance
        }));
        setFriends(friendsWithBalance);
        // Save to localStorage
        localStorage.setItem(friendsKey, JSON.stringify(friendsWithBalance));
        return;
      }
    } catch (error) {
      console.log('API not available, loading from local data:', error);
    }
    
    // Fallback to local data (from data.json)
    try {
      const data = await loadDataFromJson();
      if (data.friends && data.users) {
        // Process friends to include user information
        const processedFriends = data.friends.map(friendship => {
          const friend = data.users.find(u => u.id === friendship.friendId);
          return {
            id: friendship.friendId,
            name: friend ? friend.name : 'Unknown User',
            email: friend ? friend.email : '',
            avatar: friend ? friend.avatar : null,
            balance: friendship.balance || 0
          };
        });
        setFriends(processedFriends);
        
        // Save to localStorage for future use
        if (currentUser) {
          const friendsKey = `friends_${currentUser.id}`;
          localStorage.setItem(friendsKey, JSON.stringify(processedFriends));
        }
      }
    } catch (error) {
      console.error('Error loading friends from local data:', error);
    }
  };

  // Load groups from local data
  const loadGroups = async () => {
    try {
      // Try to load from API first
      const result = await expenseService.getGroups();
      if (result.success) {
        // Process API groups as well to ensure consistent structure
        const data = await loadDataFromJson();
        if (data.users) {
          const processedGroups = processGroupsWithMembers(result.groups, data.users);
          setGroups(processedGroups);
        } else {
          setGroups(result.groups);
        }
        return;
      }
    } catch (error) {
      console.log('API not available, loading from local data:', error);
    }
    
    // Fallback to local data
    try {
      const data = await loadDataFromJson();
      if (data.groups && data.users) {
        console.log('Raw groups before processing:', data.groups);
        const processedGroups = processGroupsWithMembers(data.groups, data.users);
        console.log('Processed groups:', processedGroups);
        setGroups(processedGroups);
      }
    } catch (error) {
      console.error('Error loading groups from local data:', error);
    }
  };

  // Load personal expenses from local data
  const loadPersonalExpenses = async () => {
    if (!currentUser) return;
    
    try {
      const expenses = await getPersonalExpensesLocal(currentUser.id);
      setPersonalExpenses(expenses);
    } catch (error) {
      console.error('Error loading personal expenses:', error);
      setPersonalExpenses([]);
    }
  };

  // Delete expense function
  const deleteExpense = async (expenseId, type, containerId) => {
    try {
      if (type === 'personal') {
        const success = deletePersonalExpenseLocal(expenseId);
        if (success) {
          // Reload personal expenses
          await loadPersonalExpenses();
          return true;
        }
      }
      // TODO: Add handling for group and friend expenses
      return false;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  };

  // Initialize authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('currentUser');
        
        if (token && savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadFriends();
      loadGroups();
      loadPersonalExpenses();
    }
  }, [isAuthenticated, currentUser]);

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setFriends([]);
    setGroups([]);
    setPersonalExpenses([]);
    return { success: true, message: 'Logged out successfully' };
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      setCurrentUser,
      isAuthenticated,
      isLoading,
      usersData,
      setUsersData,
      balances,
      setBalances,
      friends,
      setFriends,
      groups,
      setGroups,
      personalExpenses,
      setPersonalExpenses,
      recentTransactions,
      setRecentTransactions,
      createUser,
      getUser,
      updateUser,
      deleteUser,
      register,
      login,
      logout,
      loadFriends,
      loadGroups,
      loadPersonalExpenses,
      deleteExpense,
      loadProfilePicture
    }}>
      {children}
    </UserContext.Provider>
  );
};