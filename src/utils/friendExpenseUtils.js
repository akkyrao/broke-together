// Utility functions for friend expense management and balance calculations

// Get friend expenses from localStorage
export const getFriendExpenses = (currentUserId, friendId) => {
  try {
    const key = `friend_expenses_${currentUserId}_${friendId}`;
    const expenses = localStorage.getItem(key);
    return expenses ? JSON.parse(expenses) : [];
  } catch (error) {
    console.error('Error loading friend expenses:', error);
    return [];
  }
};

// Save friend expenses to localStorage
export const saveFriendExpenses = (currentUserId, friendId, expenses) => {
  try {
    const key = `friend_expenses_${currentUserId}_${friendId}`;
    localStorage.setItem(key, JSON.stringify(expenses));
    return true;
  } catch (error) {
    console.error('Error saving friend expenses:', error);
    return false;
  }
};

// Generate unique ID for expenses
export const generateExpenseId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

// Calculate balance from expenses
export const calculateBalance = (expenses, currentUserId, friendId) => {
  let balance = 0;
  
  expenses.forEach(expense => {
    if (expense.type === 'expense') {
      // Split expense calculations
      if (expense.paidBy === currentUserId) {
        // User paid, friend owes their share
        balance += expense.splitAmount;
      } else if (expense.paidBy === friendId) {
        // Friend paid, user owes their share
        balance -= expense.splitAmount;
      }
    } else if (expense.type === 'settlement') {
      // Direct balance adjustment
      if (expense.direction === 'owe_friend') {
        // User owes friend
        balance -= expense.amount;
      } else if (expense.direction === 'friend_owes') {
        // Friend owes user
        balance += expense.amount;
      }
    }
  });
  
  return Math.round(balance * 100) / 100; // Round to 2 decimal places
};

// Add expense and calculate split
export const addExpense = (currentUserId, friendId, expenseData) => {
  try {
    const expenses = getFriendExpenses(currentUserId, friendId);
    
    // Calculate split amount (equal split between 2 people)
    const splitAmount = expenseData.amount / 2;
    
    const newExpense = {
      id: generateExpenseId(),
      type: 'expense',
      description: expenseData.description,
      amount: expenseData.amount,
      splitAmount: splitAmount,
      paidBy: expenseData.paidBy,
      category: expenseData.category,
      date: expenseData.date,
      participants: [currentUserId, friendId],
      settled: false,
      timestamp: new Date().toISOString()
    };
    
    const updatedExpenses = [...expenses, newExpense];
    
    if (saveFriendExpenses(currentUserId, friendId, updatedExpenses)) {
      // Update friend balance in friends list
      updateFriendBalance(currentUserId, friendId);
      return { success: true, expense: newExpense };
    }
    
    return { success: false, message: 'Failed to save expense' };
  } catch (error) {
    console.error('Error adding expense:', error);
    return { success: false, message: 'Error adding expense' };
  }
};

// Add amount (direct balance adjustment)
export const addAmount = (currentUserId, friendId, amountData) => {
  try {
    const expenses = getFriendExpenses(currentUserId, friendId);
    
    const direction = amountData.type === 'owe' ? 'friend_owes' : 'owe_friend';
    
    const newEntry = {
      id: generateExpenseId(),
      type: 'settlement',
      description: amountData.description,
      amount: parseFloat(amountData.amount),
      direction: direction,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };
    
    const updatedExpenses = [...expenses, newEntry];
    
    if (saveFriendExpenses(currentUserId, friendId, updatedExpenses)) {
      // Update friend balance in friends list
      updateFriendBalance(currentUserId, friendId);
      return { success: true, entry: newEntry };
    }
    
    return { success: false, message: 'Failed to save amount' };
  } catch (error) {
    console.error('Error adding amount:', error);
    return { success: false, message: 'Error adding amount' };
  }
};

// Settle up (reset balance to zero)
export const settleUp = (currentUserId, friendId) => {
  try {
    const expenses = getFriendExpenses(currentUserId, friendId);
    const currentBalance = calculateBalance(expenses, currentUserId, friendId);
    
    if (Math.abs(currentBalance) < 0.01) {
      return { success: true, message: 'Already settled up!' };
    }
    
    // Add a settlement entry to zero out the balance
    const settlementEntry = {
      id: generateExpenseId(),
      type: 'settlement',
      description: 'Settled up',
      amount: Math.abs(currentBalance),
      direction: currentBalance > 0 ? 'owe_friend' : 'friend_owes',
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };
    
    const updatedExpenses = [...expenses, settlementEntry];
    
    if (saveFriendExpenses(currentUserId, friendId, updatedExpenses)) {
      // Update friend balance in friends list
      updateFriendBalance(currentUserId, friendId);
      return { success: true, message: 'Successfully settled up!' };
    }
    
    return { success: false, message: 'Failed to settle up' };
  } catch (error) {
    console.error('Error settling up:', error);
    return { success: false, message: 'Error settling up' };
  }
};

// Update friend balance in the friends list
export const updateFriendBalance = (currentUserId, friendId) => {
  try {
    // Get current friends from localStorage
    const friendsKey = `friends_${currentUserId}`;
    const friends = JSON.parse(localStorage.getItem(friendsKey) || '[]');
    
    // Calculate new balance
    const expenses = getFriendExpenses(currentUserId, friendId);
    const newBalance = calculateBalance(expenses, currentUserId, parseInt(friendId));
    
    // Update friend's balance
    const updatedFriends = friends.map(friend => 
      friend.id === parseInt(friendId) 
        ? { ...friend, balance: newBalance }
        : friend
    );
    
    // Save updated friends list
    localStorage.setItem(friendsKey, JSON.stringify(updatedFriends));
    
    return true;
  } catch (error) {
    console.error('Error updating friend balance:', error);
    return false;
  }
};

// Get formatted expense description for display
export const getExpenseDescription = (expense, currentUserId, friendName, currentUserName) => {
  if (expense.type === 'expense') {
    const paidByUser = expense.paidBy === currentUserId;
    const payer = paidByUser ? 'You' : friendName;
    const ower = paidByUser ? friendName : 'You';
    const owesAmount = expense.splitAmount;
    
    if (paidByUser) {
      return `You paid ₹${expense.amount} for ${expense.description} — ${friendName} owes you ₹${owesAmount}`;
    } else {
      return `${friendName} paid ₹${expense.amount} for ${expense.description} — You owe ${friendName} ₹${owesAmount}`;
    }
  } else if (expense.type === 'settlement') {
    if (expense.description === 'Settled up') {
      return 'You settled up';
    } else {
      if (expense.direction === 'friend_owes') {
        return `${friendName} owes you ₹${expense.amount} for ${expense.description}`;
      } else {
        return `You owe ${friendName} ₹${expense.amount} for ${expense.description}`;
      }
    }
  }
  
  return expense.description;
};

// Initialize friend expenses if not exists
export const initializeFriendIfNeeded = (currentUserId, friendId) => {
  try {
    const friendsKey = `friends_${currentUserId}`;
    const friends = JSON.parse(localStorage.getItem(friendsKey) || '[]');
    
    // Check if friend exists
    const friendExists = friends.some(friend => friend.id === parseInt(friendId));
    
    if (!friendExists) {
      // This friend doesn't exist in localStorage, we should handle this case
      console.log('Friend not found in localStorage:', friendId);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing friend:', error);
    return false;
  }
};