import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
// Date picker imports - will be added when package is installed
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import Header from '../components/Header';
import expenseService from '../services/expenseService';

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
}));

const categories = [
  'Food',
  'Shopping',
  'Transport',
  'Bills',
  'Health',
  'Education',
  'Travel',
  'Entertainment',
  'Other'
];

const EditExpense = () => {
  const navigate = useNavigate();
  const { expenseId } = useParams();
  const location = useLocation();
  const expense = location.state?.expense;

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date(),
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        category: expense.category || '',
        date: expense.date ? new Date(expense.date) : new Date(),
        notes: expense.notes || ''
      });
    }
  }, [expense]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date.toISOString().split('T')[0],
        notes: formData.notes
      };

      const result = await expenseService.updatePersonalExpense(expenseId, expenseData);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Expense updated successfully!',
          severity: 'success'
        });
        setTimeout(() => {
          navigate('/personal-expenses', { 
            replace: true,
            state: { refreshData: true, timestamp: Date.now() }
          });
        }, 800);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update expense',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update expense',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ pb: 7 }}>
      <Header 
        title="Edit Expense" 
        showBackButton 
        onBackClick={() => navigate('/personal-expenses')}
      />
      
      <FormContainer>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Update Expense Details
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                margin="normal"
                required
                placeholder="e.g., Lunch at restaurant"
              />

              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                margin="normal"
                required
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="0.00"
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('date', new Date(e.target.value))}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                fullWidth
                label="Notes (Optional)"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                margin="normal"
                multiline
                rows={3}
                placeholder="Additional notes about this expense"
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/personal-expenses')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Updating...' : 'Update Expense'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </StyledCard>
      </FormContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditExpense;