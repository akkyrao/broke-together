import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Divider, Button, IconButton,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  Avatar, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Grid, LinearProgress,
  Tab, Tabs, Menu, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  MoreVert, Add,
  Delete, Edit, AccountBalance, CheckCircle,
  AttachMoney, Message, PieChart, History
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { formatCurrency, formatDate } from '../utils/dataUtils';
import {
  getFriendExpenses,
  calculateBalance,
  addExpense,
  settleUp,
  getExpenseDescription
} from '../utils/friendExpenseUtils';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const ExpenseItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  height: 24,
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const FriendDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { friends, currentUser, loadFriends } = useUser();
  
  // Find the friend by ID (try from context first)
  const initialFriend = friends.find(f => f.id === parseInt(id));
  const [friend, setFriend] = useState(initialFriend || null);
  const [resolving, setResolving] = useState(!initialFriend);
  
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [addExpenseDialog, setAddExpenseDialog] = useState(false);
  const [settleUpDialog, setSettleUpDialog] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [settledExpenses, setSettledExpenses] = useState([]);
  const [friendBalance, setFriendBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    paidBy: currentUser?.id || 0,
    date: new Date().toISOString().split('T')[0]
  });

  // Resolve friend from multiple sources when dependencies change
  useEffect(() => {
    const resolveFriend = async () => {
      if (!currentUser) return;
      const numericId = parseInt(id);
      // 1) From context
      const fromContext = friends.find(f => f.id === numericId);
      if (fromContext) {
        setFriend(fromContext);
        setResolving(false);
        return;
      }
      setResolving(true);
      // 2) From localStorage cache keyed by current user
      const friendsKey = `friends_${currentUser.id}`;
      try {
        const cached = JSON.parse(localStorage.getItem(friendsKey) || '[]');
        const fromCache = cached.find(f => f.id === numericId);
        if (fromCache) {
          setFriend(fromCache);
          setResolving(false);
          return;
        }
      } catch (_) {}
      // 3) From data.json (users list)
      try {
        const res = await fetch('/data.json');
        if (res.ok) {
          const data = await res.json();
          const user = (data.users || []).find(u => u.id === numericId);
          if (user) {
            setFriend({ id: user.id, name: user.name, email: user.email, avatar: user.avatar || null, balance: 0 });
            setResolving(false);
            return;
          }
        }
      } catch (_) {}
      setResolving(false);
    };
    resolveFriend();
  }, [currentUser, friends, id]);

  // Load expenses when component mounts or friend changes
  useEffect(() => {
    if (currentUser && friend) {
      loadExpenseData();
    }
  }, [currentUser, friend, id]);

  // Helper function to load expense data
  const loadExpenseData = () => {
    if (!currentUser || !friend) return;
    
    const friendExpenses = getFriendExpenses(currentUser.id, friend.id);
    const balance = calculateBalance(friendExpenses, currentUser.id, friend.id);
    
    // Load settled expenses from a separate key
    const settledExpensesKey = `settled_expenses_${currentUser.id}_${friend.id}`;
    const settled = localStorage.getItem(settledExpensesKey);
    const settledExpensesList = settled ? JSON.parse(settled) : [];
    
    setExpenses(friendExpenses);
    setSettledExpenses(settledExpensesList);
    setFriendBalance(balance);
  };

  // Helper function to refresh data and show success message
  const refreshDataAndNotify = (message, severity = 'success') => {
    loadExpenseData();
    loadFriends(); // Refresh friends list to update balances
    setSnackbar({ open: true, message, severity });
  };

  // Handle cases where friend is not found or resolving
  if (!friend) {
    return (
      <Box sx={{ pb: 7 }}>
        <Header 
          title={resolving ? 'Loading friend...' : 'Friend Not Found'} 
          showBackButton 
          onBackClick={() => navigate('/friends')}
        />
        <Box p={2} textAlign="center">
          {resolving ? (
            <>
              <CircularProgress size={28} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Looking up friend details...
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1" paragraph>
                We couldn't find that friend. This can happen if:
              </Typography>
              <List sx={{ maxWidth: 520, textAlign: 'left', mx: 'auto' }}>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="The friend list hasn’t loaded yet. Try Refresh." />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="You opened an old or invalid link." />
                </ListItem>
              </List>
              <Box mt={2}>
                <Button 
                  variant="outlined"
                  sx={{ mr: 1 }}
                  onClick={() => loadFriends()}
                >
                  Refresh friends
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/friends')}
                >
                  Back to Friends
                </Button>
              </Box>
            </>
          )}
        </Box>
        <BottomNavigation />
      </Box>
    );
  }

  // Calculate total expenses and settlement progress
  const totalExpenses = expenses.reduce((sum, exp) => 
    exp.type === 'expense' ? sum + exp.amount : sum, 0);
  const settlementProgress = Math.abs(friendBalance) < 0.01 ? 100 : 
    (totalExpenses > 0 ? Math.max(0, 100 - (Math.abs(friendBalance) / totalExpenses * 100)) : 0);
  
  // Handle menu open/close
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle add expense dialog
  const handleAddExpenseOpen = () => {
    setAddExpenseDialog(true);
  };

  const handleAddExpenseClose = () => {
    setAddExpenseDialog(false);
  };

  const handleExpenseFormChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm({
      ...expenseForm,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    
    const expenseData = {
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      paidBy: parseInt(expenseForm.paidBy),
      category: 'General',
      date: expenseForm.date
    };

    const result = addExpense(currentUser.id, friend.id, expenseData);
    
    if (result.success) {
      handleAddExpenseClose();
      // Reset form
      setExpenseForm({
        description: '',
        amount: '',
        paidBy: currentUser.id,
        date: new Date().toISOString().split('T')[0]
      });
      
      refreshDataAndNotify('Expense added successfully!');
    } else {
      setSnackbar({
        open: true,
        message: result.message || 'Failed to add expense',
        severity: 'error'
      });
    }
    
    setLoading(false);
  };

  // Handle settle up dialog
  const handleSettleUpOpen = () => {
    setSettleUpDialog(true);
  };

  const handleSettleUpClose = () => {
    setSettleUpDialog(false);
  };

  const handleSettleUp = async () => {
    setLoading(true);
    
    try {
      const currentExpenses = getFriendExpenses(currentUser.id, friend.id);
      const currentBalance = calculateBalance(currentExpenses, currentUser.id, friend.id);
      
      if (Math.abs(currentBalance) < 0.01) {
        setSnackbar({
          open: true,
          message: 'Already settled up!',
          severity: 'info'
        });
        setLoading(false);
        return;
      }

      // Create settlement record
      const settlementDate = new Date().toISOString().split('T')[0];
      const settlementEntry = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        type: 'settlement',
        description: `All expenses settled on ${new Date().toLocaleDateString()}`,
        amount: Math.abs(currentBalance),
        date: settlementDate,
        timestamp: new Date().toISOString(),
        settledExpenses: [...currentExpenses], // Store the expenses that were settled
        finalBalance: currentBalance
      };

      // Move current expenses to settled expenses
      const settledExpensesKey = `settled_expenses_${currentUser.id}_${friend.id}`;
      const existingSettled = localStorage.getItem(settledExpensesKey);
      const settledList = existingSettled ? JSON.parse(existingSettled) : [];
      
      // Add the settlement entry to settled expenses
      settledList.push(settlementEntry);
      localStorage.setItem(settledExpensesKey, JSON.stringify(settledList));

      // Clear current expenses
      const expenseKey = `friend_expenses_${currentUser.id}_${friend.id}`;
      localStorage.setItem(expenseKey, JSON.stringify([]));

      // Update friend's balance to 0
      const friendsKey = `friends_${currentUser.id}`;
      const friends = JSON.parse(localStorage.getItem(friendsKey) || '[]');
      const updatedFriends = friends.map(f => 
        f.id === friend.id ? { ...f, balance: 0 } : f
      );
      localStorage.setItem(friendsKey, JSON.stringify(updatedFriends));

      handleSettleUpClose();
      refreshDataAndNotify('Successfully settled up! All expenses moved to Activity.');
      
    } catch (error) {
      console.error('Error settling up:', error);
      setSnackbar({
        open: true,
        message: 'Failed to settle up',
        severity: 'error'
      });
    }
    
    setLoading(false);
  };

  return (
    <Box sx={{ pb: 7 }}>
      <Header 
        title={friend.name} 
        showBackButton 
        onBackClick={() => navigate('/friends')}
        rightContent={
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        }
      />
      
      {/* Friend Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          // Navigate to edit friend page or open edit dialog
          console.log('Edit friend');
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit Friend
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          // Open message dialog or navigate to message screen
          console.log('Message friend');
        }}>
          <Message fontSize="small" sx={{ mr: 1 }} /> Message
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          // Show delete confirmation
          console.log('Delete friend');
        }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Remove Friend
        </MenuItem>
      </Menu>

      <Box p={2}>
        {/* Friend Summary */}
        <StyledPaper>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              <Avatar 
                sx={{ width: 56, height: 56, mr: 2 }}
              >
                {friend.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {friend.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {friend.email || 'No email provided'}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Total Expenses
              </Typography>
              <Typography variant="h6">
                {formatCurrency(totalExpenses)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Balance
              </Typography>
              <Typography 
                variant="h6" 
                color={friendBalance > 0 ? 'success.main' : friendBalance < 0 ? 'error.main' : 'text.primary'}
              >
                {friendBalance > 0 
                  ? `${friend.name} owes you ₹${Math.abs(friendBalance).toFixed(2)}`
                  : friendBalance < 0
                    ? `You owe ${friend.name} ₹${Math.abs(friendBalance).toFixed(2)}`
                    : 'All settled up'}
              </Typography>
            </Grid>
          </Grid>
          
          <ProgressContainer>
            <Box sx={{ width: '100%', mr: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Settlement Progress
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={settlementProgress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {Math.round(settlementProgress)}%
            </Typography>
          </ProgressContainer>
          
          <Box display="flex" justifyContent="space-between" gap={2}>
            <Button 
              variant="outlined" 
              startIcon={<AccountBalance />}
              onClick={handleSettleUpOpen}
              disabled={Math.abs(friendBalance) < 0.01}
              fullWidth
            >
              Settle Up
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />}
              onClick={handleAddExpenseOpen}
              fullWidth
            >
              Add Expense
            </Button>
          </Box>
        </StyledPaper>
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
          >
            <Tab label="Expenses" />
            <Tab label="Activity" />
            <Tab label="Stats" />
          </Tabs>
        </Box>
        
        {/* Expenses Tab */}
        {activeTab === 0 && (
          <Box>
            {expenses.length > 0 ? (
              <List>
                {expenses.map((expense) => (
                  <ExpenseItem 
                    key={expense.id} 
                    divider
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography variant="subtitle1">
                            {getExpenseDescription(expense, currentUser.id, friend.name, currentUser.name)}
                          </Typography>
                          {expense.settled && (
                            <CheckCircle 
                              fontSize="small" 
                              color="success" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(expense.date || expense.timestamp)}
                          </Typography>
                          {expense.type === 'expense' && expense.category && (
                            <Box mt={0.5}>
                              <CategoryChip 
                                label={expense.category} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="subtitle1" color="primary">
                        {formatCurrency(expense.amount)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ExpenseItem>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No expenses yet with {friend.name}. Add your first expense!
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<Add />}
                  onClick={handleAddExpenseOpen}
                  sx={{ mt: 2 }}
                >
                  Add Expense
                </Button>
              </Box>
            )}
          </Box>
        )}
        
        {/* Activity Tab */}
        {activeTab === 1 && (
          <Box>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                <History sx={{ verticalAlign: 'middle', mr: 1 }} />
                Settlement History
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              {settledExpenses && settledExpenses.length > 0 ? (
                <List>
                  {settledExpenses.map((settlement) => (
                    <React.Fragment key={settlement.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {settlement.description}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Final balance: {settlement.finalBalance > 0 
                                  ? `${friend.name} owed you ₹${Math.abs(settlement.finalBalance).toFixed(2)}`
                                  : settlement.finalBalance < 0
                                    ? `You owed ${friend.name} ₹${Math.abs(settlement.finalBalance).toFixed(2)}`
                                    : 'All settled up'}
                              </Typography>
                            </Box>
                          }
                          secondary={formatDate(settlement.date)}
                        />
                      </ListItem>
                      
                      {/* Show the settled expenses */}
                      {settlement.settledExpenses && settlement.settledExpenses.length > 0 && (
                        <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Settled Expenses:
                          </Typography>
                          {settlement.settledExpenses.map((expense) => (
                            <Box key={expense.id} sx={{ 
                              pl: 2, 
                              py: 0.5, 
                              borderLeft: '2px solid',
                              borderLeftColor: 'divider',
                              mb: 1 
                            }}>
                              <Typography variant="body2">
                                {getExpenseDescription(expense, currentUser.id, friend.name, currentUser.name)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(expense.date || expense.timestamp)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center" py={2}>
                  No settlement history yet. When you settle up, all expenses will be moved here.
                </Typography>
              )}
            </StyledPaper>
          </Box>
        )}
        
        {/* Stats Tab */}
        {activeTab === 2 && (
          <Box>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                <PieChart sx={{ verticalAlign: 'middle', mr: 1 }} />
                Expense Breakdown
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary" paragraph>
                Expense distribution by category
              </Typography>
              {/* Here you would typically render a chart */}
              <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography color="text.secondary">
                  Chart visualization would go here
                </Typography>
              </Box>
            </StyledPaper>
          </Box>
        )}
      </Box>
      
      {/* Add Expense Dialog */}
      <Dialog open={addExpenseDialog} onClose={handleAddExpenseClose} fullWidth maxWidth="sm">
        <DialogTitle>Add Expense with {friend.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              name="amount"
              label="Amount (₹)"
              type="number"
              fullWidth
              variant="outlined"
              value={expenseForm.amount}
              onChange={handleExpenseFormChange}
              sx={{ mb: 2 }}
              placeholder="0.00"
            />
            <TextField
              select
              margin="dense"
              name="paidBy"
              label="Who paid?"
              fullWidth
              variant="outlined"
              value={expenseForm.paidBy}
              onChange={handleExpenseFormChange}
              sx={{ mb: 2 }}
            >
              <MenuItem value={currentUser.id}>I paid</MenuItem>
              <MenuItem value={friend.id}>{friend.name} paid</MenuItem>
            </TextField>
            <TextField
              margin="dense"
              name="description"
              label="Note"
              type="text"
              fullWidth
              variant="outlined"
              value={expenseForm.description}
              onChange={handleExpenseFormChange}
              sx={{ mb: 2 }}
              placeholder="What was this expense for?"
            />
            <TextField
              margin="dense"
              name="date"
              label="Date"
              type="date"
              fullWidth
              variant="outlined"
              value={expenseForm.date}
              onChange={handleExpenseFormChange}
              sx={{ mb: 1 }}
              InputLabelProps={{ shrink: true }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Amount will be split equally between you and {friend.name}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddExpenseClose}>Cancel</Button>
          <Button 
            onClick={handleAddExpense} 
            variant="contained" 
            color="primary"
            disabled={!expenseForm.description || !expenseForm.amount || loading}
          >
            {loading ? 'Adding...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Settle Up Dialog */}
      <Dialog open={settleUpDialog} onClose={handleSettleUpClose}>
        <DialogTitle>Settle Up with {friend.name}</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            {friendBalance > 0 
              ? `${friend.name} owes you ₹${Math.abs(friendBalance).toFixed(2)}. Ready to settle up?`
              : friendBalance < 0
                ? `You owe ${friend.name} ₹${Math.abs(friendBalance).toFixed(2)}. Ready to settle up?`
                : 'You are all settled up!'}
          </Typography>
          {Math.abs(friendBalance) >= 0.01 && (
            <Typography variant="body2" color="text.secondary">
              This will move all current expenses to Activity and reset the balance to zero.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettleUpClose}>Cancel</Button>
          <Button 
            onClick={handleSettleUp} 
            variant="contained" 
            color="primary"
            disabled={Math.abs(friendBalance) < 0.01 || loading}
          >
            {loading ? 'Processing...' : 'Settle Up'}
          </Button>
        </DialogActions>
      </Dialog>
      

      
      <BottomNavigation />
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FriendDetail;