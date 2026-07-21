import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Divider, Button, IconButton,
  List, ListItem, ListItemText, ListItemAvatar,
  Avatar, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Grid, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack, MoreVert, Edit, Delete, Receipt,
  Category, CalendarToday, Group,
  AttachMoney, CheckCircle
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { formatCurrency, formatDate } from '../utils/dataUtils';
import expenseService from '../services/expenseService';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const DetailItem = styled(ListItem)(({ theme }) => ({
  paddingLeft: 0,
  paddingRight: 0,
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  height: 24,
}));

const ReceiptImage = styled('img')(({ theme }) => ({
  width: '100%',
  maxHeight: 300,
  objectFit: 'contain',
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

const ParticipantItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ExpenseDetail = () => {
  const { id, type } = useParams(); // type can be 'personal', 'group', or 'friend'
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { 
    currentUser, 
    groups, 
    friends,
    personalExpenses,
    deleteExpense,
    updateExpense
  } = useUser();
  
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localExpenses, setLocalExpenses] = useState([]);
  
  // Load expenses directly using the same service as PersonalExpenses page
  useEffect(() => {
    const loadExpenseData = async () => {
      if (type === 'personal') {
        setLoading(true);
        try {
          const result = await expenseService.getPersonalExpenses();
          if (result.success) {
            setLocalExpenses(result.expenses);
          } else {
            console.error('Failed to load expenses:', result.message);
          }
        } catch (error) {
          console.error('Error loading expense data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadExpenseData();
  }, [type]);
  
  // Find the expense based on type and id
  let expense, container, participants;
  
  if (type === 'personal') {
    expense = localExpenses?.find(exp => exp.id === parseInt(id));
    container = { name: 'Personal Expense' };
    participants = [{ id: currentUser?.id, name: currentUser?.name, share: expense?.amount || 0 }];
  } else if (type === 'group') {
    // Find which group contains this expense
    const groupWithExpense = groups?.find(group => 
      group.expenses?.some(exp => exp.id === parseInt(id))
    );
    
    if (groupWithExpense) {
      container = groupWithExpense;
      expense = groupWithExpense.expenses?.find(exp => exp.id === parseInt(id));
      participants = expense?.participants || groupWithExpense.members?.map(member => ({
        ...member,
        share: expense ? expense.amount / groupWithExpense.members.length : 0
      })) || [];
    }
  } else if (type === 'friend') {
    // Find which friend is associated with this expense
    const friendWithExpense = friends?.find(friend => 
      friend.expenses && friend.expenses.some(exp => exp.id === parseInt(id))
    );
    
    if (friendWithExpense) {
      container = friendWithExpense;
      expense = friendWithExpense.expenses?.find(exp => exp.id === parseInt(id));
      participants = [
        { id: currentUser?.id, name: currentUser?.name, share: expense ? expense.amount / 2 : 0 },
        { id: friendWithExpense.id, name: friendWithExpense.name, share: expense ? expense.amount / 2 : 0 }
      ];
    }
  }
  
  // Show loading state while fetching data
  if (loading) {
    return (
      <Box sx={{ pb: 7 }}>
        <Header 
          title="Loading..." 
          showBackButton 
          onBackClick={() => navigate(-1)}
        />
        <Box p={2} textAlign="center">
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading expense details...
          </Typography>
        </Box>
        <BottomNavigation />
      </Box>
    );
  }

  // Handle case where expense is not found
  if (!expense) {
    return (
      <Box sx={{ pb: 7 }}>
        <Header 
          title="Expense Not Found" 
          showBackButton 
          onBackClick={() => navigate(-1)}
        />
        <Box p={2} textAlign="center">
          <Typography variant="body1" paragraph>
            The expense you're looking for could not be found.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
        <BottomNavigation />
      </Box>
    );
  }
  
  // Find the user who paid for the expense
  const paidByUser = expense?.paidBy === currentUser?.id 
    ? { id: currentUser?.id, name: currentUser?.name }
    : participants?.find(p => p.id === expense?.paidBy) || { name: 'Unknown' };
  
  // Handle menu open/close
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle edit action -> navigate to full edit screen (personal expenses supported)
  const handleEdit = () => {
    if (!expense) return;
    if (type === 'personal') {
      navigate(`/edit-expense/${expense.id}`, { state: { expense } });
    } else {
      // Future: implement edit for group/friend expenses
    }
  };
  
  // Handle delete dialog
  const handleDeleteOpen = () => {
    setDeleteDialog(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialog(false);
  };
  
  const handleDelete = () => {
    // Delete the expense and navigate back
    if (deleteExpense) {
      deleteExpense(expense.id, type, container.id);
    }
    handleDeleteClose();
    navigate(-1);
  };
  
  // Determine the back navigation path based on expense type
  const getBackPath = () => {
    switch (type) {
      case 'personal':
        return '/personal-expenses';
      case 'group':
        return `/group/${container.id}`;
      case 'friend':
        return `/friend/${container.id}`;
      default:
        return -1;
    }
  };
  
  return (
    <Box sx={{ pb: 7 }}>
      <Header 
        title="Expense Details" 
        showBackButton 
        onBackClick={() => navigate(getBackPath())}
        rightContent={
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        }
      />
      
      <Box p={2}>
        {/* Expense Summary */}
        <StyledPaper>
          <Typography variant="h5" gutterBottom>
            {expense.description}
          </Typography>
          
          <Box display="flex" alignItems="center" mb={1}>
            <CategoryChip 
              label={expense.category} 
              size="small" 
              color="primary" 
              variant="outlined"
              icon={<Category fontSize="small" />}
            />
            {expense.settled && (
              <Chip 
                label="Settled" 
                size="small" 
                color="success"
                icon={<CheckCircle fontSize="small" />}
              />
            )}
          </Box>
          
          <Typography variant="h4" color="primary" gutterBottom>
            {formatCurrency(expense.amount)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {type === 'personal' ? 'Personal expense' : `${container.name}`}
          </Typography>
          
          {/* Receipt Image if available */}
          {expense.receiptImage && (
            <Box mt={2}>
              <ReceiptImage src={expense.receiptImage} alt="Receipt" />
            </Box>
          )}
        </StyledPaper>
        
        {/* Expense Details */}
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List disablePadding>
            <DetailItem>
              <ListItemAvatar>
                <Avatar sx={{ backgroundColor: 'primary.main' }}>
                  <CalendarToday />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="Date" 
                secondary={formatDate(expense.date)} 
              />
            </DetailItem>
            

            
            {type !== 'personal' && (
              <DetailItem>
                <ListItemAvatar>
                  <Avatar sx={{ backgroundColor: 'primary.main' }}>
                    <Group />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Split between" 
                  secondary={`${participants?.length || 0} people`} 
                />
              </DetailItem>
            )}
            
            {expense.notes && (
              <DetailItem>
                <ListItemAvatar>
                  <Avatar sx={{ backgroundColor: 'primary.main' }}>
                    <Receipt />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Notes" 
                  secondary={expense.notes} 
                />
              </DetailItem>
            )}
          </List>
        </StyledPaper>
        
        {/* Participants and Shares (for group or friend expenses) */}
        {type !== 'personal' && participants && participants.length > 0 && (
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Who Paid What
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              {participants?.map((participant) => (
                <ParticipantItem key={participant.id} divider>
                  <ListItemAvatar>
                    <Avatar>{(participant.name || 'U').charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={participant.id === currentUser.id ? 'You' : participant.name} 
                  />
                  <Typography variant="subtitle1">
                    {formatCurrency(participant.share)}
                  </Typography>
                </ParticipantItem>
              ))}
            </List>
          </StyledPaper>
        )}
        
        {/* Action Buttons */}
        <Grid container spacing={2} mt={2}>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="outlined" 
              color="primary"
              startIcon={<Edit />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="outlined" 
              color="error"
              startIcon={<Delete />}
              onClick={handleDeleteOpen}
            >
              Delete
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={handleDeleteClose}
      >
        <DialogTitle>Delete Expense</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this expense? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Dialog would go here */}
      {/* This would be similar to the AddExpense form but pre-populated */}
      
      <BottomNavigation />
    </Box>
  );
};

export default ExpenseDetail;