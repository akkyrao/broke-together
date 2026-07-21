// Utility functions for data operations

// Load data from JSON file
export const loadDataFromJson = async () => {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) {
      throw new Error('Failed to load data.json');
    }
    const data = await response.json();
    console.log('Data loaded from JSON file:', data);
    return data;
  } catch (error) {
    console.error('Error loading data from JSON:', error);
    // Return default data if JSON loading fails
    return {
      users: []
    };
  }
};

// Save data to JSON file (in a real app with backend)
export const saveDataToJson = async (data) => {
  // In a real app with a backend, this would make an API call to save the data
  // For this demo, we'll just log that we would save the data
  console.log('Saving data to JSON file:', data);
  
  // In a real implementation with a backend, we would do something like:
  /*
  try {
    const response = await fetch('/api/save-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save data');
    }
    
    const result = await response.json();
    console.log('Data saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
  */
  
  // For this demo, just return a success response
  return { success: true };
};

// Format currency
export const formatCurrency = (amount, currency = '₹') => {
  // Safety check for undefined or null amounts
  const safeAmount = amount || 0;
  return `${currency}${safeAmount.toLocaleString()}`;
};

// Format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format number with commas
export const formatNumber = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Generate a unique ID
export const generateId = (items) => {
  return items.length > 0 
    ? Math.max(...items.map(item => item.id)) + 1 
    : 1;
};

// Process groups to resolve member information
export const processGroupsWithMembers = (groups, users) => {
  if (!groups || !users) return [];
  
  return groups.map(group => {
    // Process members to include full user information
    const processedMembers = group.members.map(member => {
      // Find the user by userId
      const user = users.find(u => u.id === member.userId);
      
      return {
        id: member.userId,
        userId: member.userId,
        name: user ? user.name : 'Unknown User',
        email: user ? user.email : '',
        avatar: user ? user.avatar : null,
        role: member.role,
        joinedAt: member.joinedAt,
        balance: member.balance || 0 // Default balance if not set
      };
    });
    
    return {
      ...group,
      members: processedMembers,
      // Add other computed properties
      isSettled: group.isSettled || false,
      yourBalance: 0, // This would be calculated based on expenses
      expenses: group.expenses || []
    };
  });
};

// Get user by ID with fallback
export const getUserById = (users, userId) => {
  if (!users || !userId) return null;
  
  const user = users.find(u => u.id === userId);
  return user || {
    id: userId,
    name: 'Unknown User',
    email: '',
    avatar: null
  };
};