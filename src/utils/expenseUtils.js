// Utility functions for expense management with local storage

/**
 * Get personal expenses for a user, combining JSON data with localStorage modifications
 * @param {number} userId - The user ID to get expenses for
 * @returns {Array} - Array of personal expenses
 */
export const getPersonalExpensesLocal = async (userId) => {
  try {
    // Load base data from JSON
    const response = await fetch('/data.json');
    const data = await response.json();
    
    // Get base expenses for the user
    const baseExpenses = data.personalExpenses?.filter(expense => expense.userId === userId) || [];
    
    // Get localStorage modifications
    const deletedExpenses = JSON.parse(localStorage.getItem('deletedExpenses') || '[]');
    const addedExpenses = JSON.parse(localStorage.getItem('addedExpenses') || '[]');
    const updatedExpenses = JSON.parse(localStorage.getItem('updatedExpenses') || '{}');
    
    // Filter out deleted expenses (ensure consistent type comparison)
    let expenses = baseExpenses.filter(expense => !deletedExpenses.includes(parseInt(expense.id)));
    
    // Apply updates
    expenses = expenses.map(expense => {
      if (updatedExpenses[expense.id]) {
        return { ...expense, ...updatedExpenses[expense.id] };
      }
      return expense;
    });
    
    // Add new expenses for this user
    const userAddedExpenses = addedExpenses.filter(expense => expense.userId === userId);
    expenses = [...expenses, ...userAddedExpenses];
    
    // Sort by date (newest first)
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return expenses;
  } catch (error) {
    console.error('Error loading personal expenses:', error);
    return [];
  }
};

/**
 * Delete a personal expense (mark as deleted in localStorage)
 * @param {number} expenseId - The expense ID to delete
 * @returns {boolean} - Success status
 */
export const deletePersonalExpenseLocal = (expenseId) => {
  try {
    const deletedExpenses = JSON.parse(localStorage.getItem('deletedExpenses') || '[]');
    
    // Convert expenseId to number to ensure consistent comparison
    const numericExpenseId = parseInt(expenseId);
    
    if (!deletedExpenses.includes(numericExpenseId)) {
      deletedExpenses.push(numericExpenseId);
      localStorage.setItem('deletedExpenses', JSON.stringify(deletedExpenses));
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
};

/**
 * Add a new personal expense to localStorage
 * @param {Object} expenseData - The expense data to add
 * @returns {Object} - The created expense with ID
 */
export const addPersonalExpenseLocal = (expenseData) => {
  try {
    const addedExpenses = JSON.parse(localStorage.getItem('addedExpenses') || '[]');
    
    // Generate a unique ID (use timestamp + random number)
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    
    const newExpense = {
      ...expenseData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    addedExpenses.push(newExpense);
    localStorage.setItem('addedExpenses', JSON.stringify(addedExpenses));
    
    return newExpense;
  } catch (error) {
    console.error('Error adding expense:', error);
    return null;
  }
};

/**
 * Update a personal expense in localStorage
 * @param {number} expenseId - The expense ID to update
 * @param {Object} updateData - The data to update
 * @returns {boolean} - Success status
 */
export const updatePersonalExpenseLocal = (expenseId, updateData) => {
  try {
    const updatedExpenses = JSON.parse(localStorage.getItem('updatedExpenses') || '{}');
    
    updatedExpenses[expenseId] = {
      ...updatedExpenses[expenseId],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('updatedExpenses', JSON.stringify(updatedExpenses));
    
    return true;
  } catch (error) {
    console.error('Error updating expense:', error);
    return false;
  }
};

/**
 * Get expense statistics for a user
 * @param {Array} expenses - Array of expenses
 * @returns {Object} - Statistics object
 */
export const getExpenseStatistics = (expenses) => {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const thisMonthTotal = expenses
    .filter(expense => new Date(expense.date) >= thisMonth)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const thisWeekTotal = expenses
    .filter(expense => new Date(expense.date) >= thisWeek)
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Group by category
  const byCategory = {};
  expenses.forEach(expense => {
    if (!byCategory[expense.category]) {
      byCategory[expense.category] = 0;
    }
    byCategory[expense.category] += expense.amount;
  });
  
  return {
    total,
    thisMonth: thisMonthTotal,
    thisWeek: thisWeekTotal,
    byCategory: Object.entries(byCategory).map(([category, amount]) => ({
      category,
      amount
    }))
  };
};

/**
 * Clear all local expense modifications (for testing/reset)
 */
export const clearLocalExpenseData = () => {
  localStorage.removeItem('deletedExpenses');
  localStorage.removeItem('addedExpenses');
  localStorage.removeItem('updatedExpenses');
};

/**
 * Get a single expense by ID
 * @param {number} expenseId - The expense ID
 * @param {number} userId - The user ID
 * @returns {Object|null} - The expense object or null if not found
 */
export const getExpenseById = async (expenseId, userId) => {
  const expenses = await getPersonalExpensesLocal(userId);
  return expenses.find(expense => expense.id === expenseId) || null;
};