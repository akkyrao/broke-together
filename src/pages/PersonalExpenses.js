import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Fab,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import FlightIcon from '@mui/icons-material/Flight';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';

import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { formatCurrency, formatDate } from '../utils/dataUtils';
import expenseService from '../services/expenseService';

const ExpensesContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(45deg, #424242 30%, #616161 90%)' 
    : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const ExpenseItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const AddButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 80, // Above bottom navigation
  right: 16,
  zIndex: 1000,
}));



// Category icons mapping
const getCategoryIcon = (category) => {
  switch (category.toLowerCase()) {
    case 'food':
      return <RestaurantIcon />;
    case 'shopping':
      return <ShoppingCartIcon />;
    case 'transport':
      return <DirectionsCarIcon />;
    case 'bills':
      return <HomeIcon />;
    case 'health':
      return <LocalHospitalIcon />;
    case 'education':
      return <SchoolIcon />;
    case 'travel':
      return <FlightIcon />;
    default:
      return <MiscellaneousServicesIcon />;
  }
};

// Calculate total expenses
const calculateTotal = (expenses) => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

// Group expenses by category
const groupByCategory = (expenses) => {
  const grouped = {};
  expenses.forEach(expense => {
    if (!grouped[expense.category]) {
      grouped[expense.category] = 0;
    }
    grouped[expense.category] += expense.amount;
  });
  return Object.entries(grouped).map(([category, amount]) => ({ category, amount }));
};

const PersonalExpenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Filter expenses based on time period and selected date
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // If a specific date is selected, filter by that date
    if (selectedDate) {
      const selected = new Date(selectedDate);
      return expenseDate.toDateString() === selected.toDateString();
    }
    
    if (activeFilter === 'week') {
      return expenseDate >= oneWeekAgo;
    } else if (activeFilter === 'month') {
      return expenseDate >= oneMonthAgo;
    }
    return true;
  });

  const totalExpenses = calculateTotal(filteredExpenses);
  const categorySummary = groupByCategory(filteredExpenses);

  // Load expenses on component mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const result = await expenseService.getPersonalExpenses();
      if (result.success) {
        setExpenses(result.expenses);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to load expenses',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load expenses',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    navigate('/add-expense', { state: { personal: true } });
  };

  const handleExpenseClick = (expense) => {
    navigate(`/expense/${expense.id}/personal`);
  };

  const handleMenuOpen = (event, expense) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedExpense(expense);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExpense(null);
  };

  const handleEditExpense = () => {
    handleMenuClose();
    navigate(`/edit-expense/${selectedExpense.id}`, { state: { expense: selectedExpense } });
  };

  const handleDeleteExpense = () => {
    // Don't close menu immediately, keep selectedExpense available for dialog
    setAnchorEl(null); // Close menu but keep selectedExpense
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedExpense) return;

    try {
      const result = await expenseService.deletePersonalExpense(selectedExpense.id);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Expense deleted successfully',
          severity: 'success'
        });
        // Reload expenses
        await loadExpenses();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete expense',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete expense',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedExpense(null);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ pb: 7 }}>
        <Header title="Personal Expenses" showBack />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 7 }}>
      <Header title="Personal Expenses" showBack />
      
      <ExpensesContainer>
        <SummaryCard>
          <CardContent>
            <Typography variant="subtitle1" component="div">
              Total Expenses
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
              {formatCurrency(totalExpenses)}
            </Typography>
            
            <Box sx={{ display: 'flex', mt: 2, flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                label="All Time" 
                color={activeFilter === 'all' && !selectedDate ? 'secondary' : 'default'} 
                onClick={() => {
                  setActiveFilter('all');
                  setSelectedDate(null);
                }} 
                size="small"
              />
              <Chip 
                label="This Month" 
                color={activeFilter === 'month' && !selectedDate ? 'secondary' : 'default'} 
                onClick={() => {
                  setActiveFilter('month');
                  setSelectedDate(null);
                }} 
                size="small"
              />
              <Chip 
                label="This Week" 
                color={activeFilter === 'week' && !selectedDate ? 'secondary' : 'default'} 
                onClick={() => {
                  setActiveFilter('week');
                  setSelectedDate(null);
                }}
                size="small"
              />
              <Chip 
                icon={<CalendarTodayIcon />}
                label={selectedDate ? new Date(selectedDate).toLocaleDateString() : "Pick Date"} 
                color={selectedDate ? 'secondary' : 'default'} 
                onClick={() => setCalendarOpen(true)}
                size="small"
              />
            </Box>
          </CardContent>
        </SummaryCard>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Spending by Category
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {categorySummary.map((category, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <CategoryCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 1 }}>
                    {getCategoryIcon(category.category)}
                  </Box>
                  <Typography variant="subtitle2" component="div">
                    {category.category}
                  </Typography>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(category.amount)}
                  </Typography>
                </CardContent>
              </CategoryCard>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Recent Expenses
          </Typography>
          <Button 
            endIcon={<AddIcon />} 
            onClick={handleAddExpense}
            size="small"
            variant="outlined"
          >
            Add Expense
          </Button>
        </Box>
        
        {filteredExpenses.length > 0 ? (
          <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <List sx={{ p: 0 }}>
              {filteredExpenses.slice(0, 5).map((expense, index) => (
                <React.Fragment key={expense.id}>
                  <ExpenseItem button onClick={() => handleExpenseClick(expense)}>
                    <ListItemIcon>
                      {getCategoryIcon(expense.category)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={expense.description}
                      secondary={formatDate(expense.date)}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>
                        {formatCurrency(expense.amount)}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuOpen(e, expense)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ExpenseItem>
                  {index < filteredExpenses.slice(0, 5).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No expenses found for the selected period
            </Typography>
          </Box>
        )}
        
        {filteredExpenses.length > 5 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button 
              variant="text" 
              onClick={() => navigate('/all-expenses')}
            >
              View All Expenses
            </Button>
          </Box>
        )}
        
        <AddButton color="primary" aria-label="add expense" onClick={handleAddExpense}>
          <AddIcon />
        </AddButton>
      </ExpensesContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditExpense}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteExpense}>Delete</MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedExpense(null);
        }}
      >
        <DialogTitle>Delete Expense</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedExpense?.description || 'this expense'}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialogOpen(false);
            setSelectedExpense(null);
          }}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calendar Dialog */}
      <Dialog open={calendarOpen} onClose={() => setCalendarOpen(false)}>
        <DialogTitle>Select Date</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            fullWidth
            value={selectedDate || ''}
            onChange={(e) => setSelectedDate(e.target.value)}
            sx={{ mt: 1 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalendarOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setCalendarOpen(false);
              setActiveFilter('all'); // Reset other filters when date is selected
            }}
            variant="contained"
          >
            Apply
          </Button>
          {selectedDate && (
            <Button 
              onClick={() => {
                setSelectedDate(null);
                setCalendarOpen(false);
              }}
              color="error"
            >
              Clear
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <BottomNavigation />
    </Box>
  );
};

export default PersonalExpenses;