import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Divider, Button, IconButton, 
  List, ListItem, ListItemText, ListItemSecondaryAction, 
  Avatar, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Grid, LinearProgress,
  Tab, Tabs, Menu, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  ArrowBack, MoreVert, Add, Receipt, 
  PersonAdd, Delete, Edit, AccountBalance,
  CheckCircle, PieChart, AttachMoney
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { formatCurrency, formatDate } from '../utils/dataUtils';
import expenseService from '../services/expenseService';

const groupIcons = ['👥', '🏠', '✈️', '🍕', '🎉', '💼', '🏖️', '🎓', '🚗', '🏥'];

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

const MemberChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const IconOption = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 50,
  height: 50,
  borderRadius: theme.spacing(1),
  border: `2px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  fontSize: '1.5rem',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
  },
}));

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { groups, friends, currentUser } = useUser();
  
  // Find the group by ID
  const group = groups.find(g => g.id === parseInt(id));
  
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [addExpenseDialog, setAddExpenseDialog] = useState(false);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [settleUpDialog, setSettleUpDialog] = useState(false);
  const [editGroupDialog, setEditGroupDialog] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [editGroupForm, setEditGroupForm] = useState({
    name: group?.name || '',
    description: group?.description || '',
    icon: group?.icon || '👥'
  });
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    paidBy: currentUser.id,
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    splitType: 'equal',
    participants: group?.members?.map(m => m.id) || [], // default all members
    shares: {} // custom shares map { userId: amount }
  });

  // Handle cases where group is not found
  useEffect(() => {
    if (!group && groups.length > 0) {
      navigate('/groups');
    }
  }, [group, groups, navigate]);

  if (!group) {
    return <Box p={2}><Typography>Loading...</Typography></Box>;
  }

  // Check if members are properly processed (should have 'id' and 'name' properties)
  const membersProcessed = group.members && group.members.length > 0 && 
    group.members.every(member => member.hasOwnProperty('id') && member.hasOwnProperty('name'));
  
  if (!membersProcessed) {
    console.log('Group members not properly processed:', group.members);
    return <Box p={2}><Typography>Loading group data...</Typography></Box>;
  }

  // Calculate total expenses and settlement progress
  const expenses = group.expenses || [];
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const settledAmount = expenses.filter(exp => exp.settled).reduce((sum, exp) => sum + exp.amount, 0);
  const settlementProgress = totalExpenses > 0 ? (settledAmount / totalExpenses) * 100 : 0;
  
  // Get available friends to add to the group
  const availableFriends = friends.filter(friend => 
    !group.members.some(member => member.id === friend.id)
  );

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
    try {
      const payload = {
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        paidBy: expenseForm.paidBy,
        category: expenseForm.category,
        date: expenseForm.date,
        splitType: expenseForm.splitType,
        participants: expenseForm.participants,
        shares: expenseForm.splitType === 'custom' ? expenseForm.shares : undefined
      };
      const result = await expenseService.addGroupExpense(group.id, payload);
      if (result.success) {
        // Simple approach: reload page to show updated expenses
        window.location.reload();
      } else {
        console.error(result.message || 'Failed to add expense');
      }
    } catch (e) {
      console.error('Add group expense error:', e);
    } finally {
      handleAddExpenseClose();
      // Reset form
      setExpenseForm({
        description: '',
        amount: '',
        paidBy: currentUser.id,
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        splitType: 'equal',
        participants: group?.members?.map(m => m.id) || [],
        shares: {}
      });
    }
  };

  // Handle add member dialog
  const handleAddMemberOpen = () => {
    setAddMemberDialog(true);
  };

  const handleAddMemberClose = () => {
    setAddMemberDialog(false);
    setSelectedFriend('');
  };

  const handleAddMember = () => {
    // Here you would add the selected friend to the group
    // This would typically call a function from UserContext
    console.log('Adding member:', selectedFriend);
    handleAddMemberClose();
  };

  // Handle settle up dialog
  const handleSettleUpOpen = () => {
    setSettleUpDialog(true);
  };

  const handleSettleUpClose = () => {
    setSettleUpDialog(false);
  };

  const handleSettleUp = () => {
    // Here you would mark expenses as settled
    // This would typically call a function from UserContext
    console.log('Settling up group');
    handleSettleUpClose();
  };

  // Handle edit group dialog
  const handleEditGroupOpen = () => {
    setEditGroupForm({
      name: group.name,
      description: group.description || '',
      icon: group.icon || '👥'
    });
    setEditGroupDialog(true);
  };

  const handleEditGroupClose = () => {
    setEditGroupDialog(false);
  };

  const handleEditGroupFormChange = (e) => {
    const { name, value } = e.target;
    setEditGroupForm({
      ...editGroupForm,
      [name]: value
    });
  };

  const handleEditGroupIconSelect = (icon) => {
    setEditGroupForm({
      ...editGroupForm,
      icon
    });
  };

  const handleEditGroupSave = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/groups/${group.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editGroupForm),
      });

      const data = await response.json();

      if (data.success) {
        // Update the group in the UI (you might want to refresh the page or update context)
        window.location.reload(); // Simple refresh for now
      } else {
        console.error('Failed to update group:', data.message);
      }
    } catch (error) {
      console.error('Error updating group:', error);
    }
    handleEditGroupClose();
  };

  return (
    <Box sx={{ pb: 7 }}>
      <Header 
        title={group.name} 
        showBackButton 
        onBackClick={() => navigate('/groups')}
        rightContent={
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        }
      />
      
      {/* Group Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          handleEditGroupOpen();
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit Group
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          handleAddMemberOpen();
        }}>
          <PersonAdd fontSize="small" sx={{ mr: 1 }} /> Add Member
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          // Show delete confirmation
          console.log('Delete group');
        }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete Group
        </MenuItem>
      </Menu>

      <Box p={2}>
        {/* Group Summary */}
        <StyledPaper>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="h2">
              Group Summary
            </Typography>
            <Chip 
              label={group.isSettled ? 'Settled' : 'Active'} 
              color={group.isSettled ? 'success' : 'primary'}
              size="small"
            />
          </Box>
          
          <Divider sx={{ my: 1.5 }} />
          
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
                Your Balance
              </Typography>
              <Typography 
                variant="h6" 
                color={group.yourBalance > 0 ? 'success.main' : group.yourBalance < 0 ? 'error.main' : 'text.primary'}
              >
                {formatCurrency(group.yourBalance)}
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
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button 
              variant="outlined" 
              startIcon={<AccountBalance />}
              onClick={handleSettleUpOpen}
              disabled={group.isSettled}
            >
              Settle Up
            </Button>
            <Box>
              <Button 
                variant="outlined"
                startIcon={<PersonAdd />}
                sx={{ mr: 1 }}
                onClick={() => navigate('/add-friend')}
              >
                Add Friend
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Add />}
                onClick={handleAddExpenseOpen}
                disabled={group.isSettled}
              >
                Add Expense
              </Button>
            </Box>
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
            <Tab label="Members" />
            <Tab label="Stats" />
          </Tabs>
        </Box>
        
        {/* Expenses Tab */}
        {activeTab === 0 && (
          <Box>
            {expenses.length > 0 ? (
              <List>
                {expenses.map((expense) => {
                  const paidByUser = group.members.find(m => m.id === expense.paidBy);
                  return (
                    <ExpenseItem key={expense.id} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Typography variant="subtitle1">
                              {expense.description}
                            </Typography>
                            {expense.settled && (
                              <Tooltip title="Settled">
                                <CheckCircle 
                                  fontSize="small" 
                                  color="success" 
                                  sx={{ ml: 1 }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(expense.date)} • Paid by {paidByUser?.name || 'Unknown'}
                            </Typography>
                            <Box mt={0.5}>
                              <CategoryChip 
                                label={expense.category} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="subtitle1" color="primary">
                          {formatCurrency(expense.amount)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ExpenseItem>
                  );
                })}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No expenses yet. Add your first expense!
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
        
        {/* Members Tab */}
        {activeTab === 1 && (
          <Box>
            <Box display="flex" flexWrap="wrap" mb={2}>
              {group.members.map((member) => (
                <MemberChip
                  key={member.id}
                  avatar={<Avatar>{member.name ? member.name.charAt(0).toUpperCase() : 'U'}</Avatar>}
                  label={member.name || 'Unknown User'}
                  variant={member.id === currentUser.id ? "filled" : "outlined"}
                  color={member.id === currentUser.id ? "primary" : "default"}
                />
              ))}
              {!group.isSettled && (
                <MemberChip
                  icon={<PersonAdd />}
                  label="Add"
                  variant="outlined"
                  onClick={handleAddMemberOpen}
                  disabled={availableFriends.length === 0}
                />
              )}
            </Box>
            
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              Balances
            </Typography>
            <List>
              {group.members.map((member) => (
                <ListItem key={member.id} divider>
                  <Avatar sx={{ mr: 2 }}>{member.name ? member.name.charAt(0).toUpperCase() : 'U'}</Avatar>
                  <ListItemText
                    primary={member.name || 'Unknown User'}
                    secondary={member.id === currentUser.id ? 'You' : null}
                  />
                  <Typography 
                    variant="subtitle1" 
                    color={member.balance > 0 ? 'success.main' : member.balance < 0 ? 'error.main' : 'text.primary'}
                  >
                    {formatCurrency(member.balance)}
                  </Typography>
                </ListItem>
              ))}
            </List>
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
            
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                <AttachMoney sx={{ verticalAlign: 'middle', mr: 1 }} />
                Payment History
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              {group.payments && group.payments.length > 0 ? (
                <List>
                  {group.payments.map((payment) => {
                    const fromUser = group.members.find(m => m.id === payment.fromId);
                    const toUser = group.members.find(m => m.id === payment.toId);
                    return (
                      <ListItem key={payment.id} divider>
                        <ListItemText
                          primary={
                            <Typography>
                              {fromUser?.name || 'Unknown'} paid {toUser?.name || 'Unknown'}
                            </Typography>
                          }
                          secondary={formatDate(payment.date)}
                        />
                        <Typography variant="subtitle1" color="primary">
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Typography color="text.secondary" align="center" py={2}>
                  No payments recorded yet
                </Typography>
              )}
            </StyledPaper>
          </Box>
        )}
      </Box>
      
      {/* Add Expense Dialog */}
      <Dialog open={addExpenseDialog} onClose={handleAddExpenseClose} fullWidth>
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={expenseForm.description}
            onChange={handleExpenseFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="amount"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={expenseForm.amount}
            onChange={handleExpenseFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            name="paidBy"
            label="Paid By"
            fullWidth
            variant="outlined"
            value={expenseForm.paidBy}
            onChange={handleExpenseFormChange}
            sx={{ mb: 2 }}
          >
            {group.members.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.id === currentUser.id ? 'You' : (member.name || 'Unknown User')}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            name="category"
            label="Category"
            fullWidth
            variant="outlined"
            value={expenseForm.category}
            onChange={handleExpenseFormChange}
            sx={{ mb: 2 }}
          >
            {['Food', 'Transportation', 'Housing', 'Entertainment', 'Utilities', 'Other'].map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="date"
            label="Date"
            type="date"
            fullWidth
            variant="outlined"
            value={expenseForm.date}
            onChange={handleExpenseFormChange}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            margin="dense"
            name="splitType"
            label="Split Type"
            fullWidth
            variant="outlined"
            value={expenseForm.splitType}
            onChange={handleExpenseFormChange}
            sx={{ mb: 2 }}
          >
            <MenuItem value="equal">Split Equally</MenuItem>
            <MenuItem value="custom">Custom Split</MenuItem>
          </TextField>

          {/* Participants and shares for custom split */}
          {expenseForm.splitType === 'custom' && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Participants & Shares</Typography>
              {group.members.map((member) => {
                const isSelected = expenseForm.participants.includes(member.id);
                const share = expenseForm.shares[member.id] || '';
                return (
                  <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Chip
                      label={member.id === currentUser.id ? 'You' : (member.name || 'Unknown User')}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      onClick={() => {
                        setExpenseForm(prev => {
                          const next = { ...prev };
                          if (isSelected) {
                            next.participants = next.participants.filter(id => id !== member.id);
                            delete next.shares[member.id];
                          } else {
                            next.participants = [...new Set([...next.participants, member.id])];
                          }
                          return next;
                        });
                      }}
                    />
                    <TextField
                      label="Share"
                      type="number"
                      size="small"
                      value={share}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExpenseForm(prev => ({
                          ...prev,
                          shares: { ...prev.shares, [member.id]: val === '' ? '' : parseFloat(val) || '' }
                        }));
                      }}
                      disabled={!isSelected}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddExpenseClose}>Cancel</Button>
          <Button 
            onClick={handleAddExpense} 
            variant="contained" 
            color="primary"
            disabled={!expenseForm.description || !expenseForm.amount}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Member Dialog */}
      <Dialog open={addMemberDialog} onClose={handleAddMemberClose}>
        <DialogTitle>Add Member to Group</DialogTitle>
        <DialogContent>
          {availableFriends.length > 0 ? (
            <TextField
              select
              margin="dense"
              label="Select Friend"
              fullWidth
              variant="outlined"
              value={selectedFriend}
              onChange={(e) => setSelectedFriend(e.target.value)}
            >
              {availableFriends.map((friend) => (
                <MenuItem key={friend.id} value={friend.id}>
                  {friend.name}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Typography color="text.secondary">
              You've added all your friends to this group already.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddMemberClose}>Cancel</Button>
          <Button 
            onClick={handleAddMember} 
            variant="contained" 
            color="primary"
            disabled={!selectedFriend || availableFriends.length === 0}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Settle Up Dialog */}
      <Dialog open={settleUpDialog} onClose={handleSettleUpClose}>
        <DialogTitle>Settle Up Group</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            This will mark all expenses in the group as settled. Each member's balance will be reset to zero.
          </Typography>
          <Typography variant="subtitle1" color="error">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettleUpClose}>Cancel</Button>
          <Button 
            onClick={handleSettleUp} 
            variant="contained" 
            color="primary"
          >
            Settle Up
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Group Dialog */}
      <Dialog open={editGroupDialog} onClose={handleEditGroupClose} fullWidth>
        <DialogTitle>Edit Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Group Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editGroupForm.name}
            onChange={handleEditGroupFormChange}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editGroupForm.description}
            onChange={handleEditGroupFormChange}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Choose an Icon
          </Typography>
          
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {groupIcons.map((icon) => (
              <Grid item key={icon}>
                <IconOption
                  className={editGroupForm.icon === icon ? 'selected' : ''}
                  onClick={() => handleEditGroupIconSelect(icon)}
                >
                  {icon}
                </IconOption>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditGroupClose}>Cancel</Button>
          <Button 
            onClick={handleEditGroupSave} 
            variant="contained" 
            color="primary"
            disabled={!editGroupForm.name}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      <BottomNavigation />
    </Box>
  );
};

export default GroupDetail;