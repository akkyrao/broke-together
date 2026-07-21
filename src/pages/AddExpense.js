import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Avatar,
  Grid,
  Paper,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  FormHelperText,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import FlightIcon from '@mui/icons-material/Flight';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';

import Header from '../components/Header';
import { useUser } from '../context/UserContext';
import expenseService from '../services/expenseService';

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(14), // ensure content clears bottom nav + FAB
  maxWidth: 600,
  margin: '0 auto',
}));

const ReceiptPreview = styled('img')(({ theme }) => ({
  width: '100%',
  maxHeight: 200,
  objectFit: 'cover',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const UploadButton = styled(Button)(({ theme }) => ({
  borderStyle: 'dashed',
  borderWidth: 1,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  textAlign: 'center',
  marginBottom: theme.spacing(3),
}));

const ParticipantChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const CategoryIcon = styled(Box)(({ theme, selected }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: selected ? theme.palette.primary.light : 'transparent',
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.light : theme.palette.action.hover,
  },
}));

// Category options with icons
const categories = [
  { id: 'food', name: 'Food', icon: <RestaurantIcon /> },
  { id: 'shopping', name: 'Shopping', icon: <ShoppingCartIcon /> },
  { id: 'transport', name: 'Transport', icon: <DirectionsCarIcon /> },
  { id: 'bills', name: 'Bills', icon: <HomeIcon /> },
  { id: 'health', name: 'Health', icon: <LocalHospitalIcon /> },
  { id: 'education', name: 'Education', icon: <SchoolIcon /> },
  { id: 'travel', name: 'Travel', icon: <FlightIcon /> },
  { id: 'other', name: 'Other', icon: <MiscellaneousServicesIcon /> },
];

const AddExpense = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { friends, groups } = useUser();
  
  // Check if this is a personal expense from route state
  const isPersonal = location.state?.personal || false;
  
  // Check if we have receipt data from ScanReceipt
  const receiptData = location.state?.receiptItems || [];
  const receiptTotal = location.state?.total || 0;
  
  // Form state
  const [description, setDescription] = useState(receiptData.length > 0 ? 'Receipt expense' : '');
  const [amount, setAmount] = useState(receiptTotal > 0 ? receiptTotal.toString() : '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [isShared, setIsShared] = useState(!isPersonal);
  const [expenseType, setExpenseType] = useState(isPersonal ? 'personal' : 'shared');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [splitEqually, setSplitEqually] = useState(true);
  const [customSplits, setCustomSplits] = useState({});
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Loading and notification state
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setReceiptImage(null);
  };

  const handleCategorySelect = (categoryId) => {
    setCategory(categoryId);
  };

  const handleFriendSelect = (event) => {
    const friendId = event.target.value;
    const friend = friends.find(f => f.id === friendId);
    
    if (friend && !selectedFriends.some(f => f.id === friendId)) {
      setSelectedFriends([...selectedFriends, friend]);
      
      // Initialize custom split for this friend
      if (!splitEqually) {
        setCustomSplits({
          ...customSplits,
          [friendId]: 0
        });
      }
    }
  };

  const handleRemoveFriend = (friendId) => {
    setSelectedFriends(selectedFriends.filter(f => f.id !== friendId));
    
    // Remove from custom splits if exists
    if (customSplits[friendId]) {
      const newSplits = { ...customSplits };
      delete newSplits[friendId];
      setCustomSplits(newSplits);
    }
  };

  const handleGroupSelect = (event) => {
    setSelectedGroup(event.target.value);
    // Clear selected friends when a group is selected
    setSelectedFriends([]);
  };

  const handleSplitTypeChange = (event) => {
    setSplitEqually(event.target.checked);
    
    // Initialize custom splits for all selected friends if switching to custom
    if (!event.target.checked) {
      const newSplits = {};
      selectedFriends.forEach(friend => {
        newSplits[friend.id] = 0;
      });
      setCustomSplits(newSplits);
    }
  };

  const handleCustomSplitChange = (friendId, value) => {
    setCustomSplits({
      ...customSplits,
      [friendId]: parseFloat(value) || 0
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    
    if (expenseType === 'shared' && !selectedGroup && selectedFriends.length === 0) {
      newErrors.participants = 'Please select a group or at least one friend';
    }
    
    if (!splitEqually && isShared && selectedFriends.length > 0) {
      const totalSplit = Object.values(customSplits).reduce((sum, val) => sum + val, 0);
      if (Math.abs(totalSplit - parseFloat(amount)) > 0.01) {
        newErrors.customSplits = `Total splits (${totalSplit}) must equal the expense amount (${amount})`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        if (expenseType === 'personal') {
          // Add personal expense
          const expenseData = {
            description,
            amount: parseFloat(amount),
            date,
            category,
            notes: receiptImage ? 'Receipt attached' : ''
          };
          
          const result = await expenseService.addPersonalExpense(expenseData);
          
          if (result.success) {
            setSnackbar({
              open: true,
              message: 'Personal expense added successfully!',
              severity: 'success'
            });
            
            setTimeout(() => {
              navigate('/personal-expenses');
            }, 1500);
          } else {
            setSnackbar({
              open: true,
              message: result.message || 'Failed to add expense',
              severity: 'error'
            });
          }
        } else {
          // For now, just show a message for shared expenses (not implemented yet)
          setSnackbar({
            open: true,
            message: 'Shared expenses feature coming soon!',
            severity: 'info'
          });
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to add expense',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Header title="Add Expense" showBack />
      
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Add New Expense
          </Typography>
          
          {!isPersonal && (
            <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
              <InputLabel>Expense Type</InputLabel>
              <Select
                value={expenseType}
                onChange={(e) => {
                  setExpenseType(e.target.value);
                  setIsShared(e.target.value !== 'personal');
                  if (e.target.value === 'personal') {
                    setSelectedGroup('');
                    setSelectedFriends([]);
                  }
                }}
                label="Expense Type"
              >
                <MenuItem value="personal">Personal Expense</MenuItem>
                <MenuItem value="shared">Shared with Friends/Group</MenuItem>
              </Select>
            </FormControl>
          )}
          
          <TextField
            label="Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            error={!!errors.description}
            helperText={errors.description}
          />
          
          <TextField
            label="Amount"
            fullWidth
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            error={!!errors.amount}
            helperText={errors.amount}
          />
          
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Category
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {categories.map((cat) => (
              <Grid item xs={3} key={cat.id}>
                <CategoryIcon 
                  selected={category === cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  {cat.icon}
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    {cat.name}
                  </Typography>
                </CategoryIcon>
              </Grid>
            ))}
          </Grid>
          {errors.category && (
            <FormHelperText error>{errors.category}</FormHelperText>
          )}
          
          {expenseType === 'shared' && (
            <>
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Split With
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Group</InputLabel>
                <Select
                  value={selectedGroup}
                  onChange={handleGroupSelect}
                  label="Select Group"
                  disabled={selectedFriends.length > 0}
                >
                  <MenuItem value="">None</MenuItem>
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name} ({group.members} members)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Or select individual friends:
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControl sx={{ flexGrow: 1, mr: 1 }}>
                  <InputLabel>Add Friend</InputLabel>
                  <Select
                    value=""
                    onChange={handleFriendSelect}
                    label="Add Friend"
                    disabled={!!selectedGroup}
                  >
                    {friends
                      .filter(friend => !selectedFriends.some(f => f.id === friend.id))
                      .map((friend) => (
                        <MenuItem key={friend.id} value={friend.id}>
                          {friend.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                
                <Button 
                  variant="outlined" 
                  startIcon={<PersonAddIcon />}
                  disabled={!!selectedGroup}
                  onClick={() => navigate('/add-friend', { state: { returnTo: '/add-expense' } })}
                >
                  New
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 3 }}>
                {selectedFriends.map((friend) => (
                  <ParticipantChip
                    key={friend.id}
                    avatar={<Avatar>{(friend.name || 'U').charAt(0)}</Avatar>}
                    label={friend.name}
                    onDelete={() => handleRemoveFriend(friend.id)}
                  />
                ))}
              </Box>
              
              {errors.participants && (
                <FormHelperText error sx={{ mb: 2 }}>{errors.participants}</FormHelperText>
              )}
              
              {(selectedFriends.length > 0 || selectedGroup) && (
                <>
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Split Options
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={splitEqually} 
                        onChange={handleSplitTypeChange} 
                      />
                    }
                    label="Split equally"
                  />
                  
                  {!splitEqually && selectedFriends.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Custom Split Amounts
                      </Typography>
                      
                      {selectedFriends.map((friend) => (
                        <Box key={friend.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 2 }}>{(friend.name || 'U').charAt(0)}</Avatar>
                          <Typography sx={{ flexGrow: 1 }}>{friend.name}</Typography>
                          <TextField
                            type="number"
                            size="small"
                            value={customSplits[friend.id] || ''}
                            onChange={(e) => handleCustomSplitChange(friend.id, e.target.value)}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            sx={{ width: 120 }}
                          />
                        </Box>
                      ))}
                      
                      {errors.customSplits && (
                        <FormHelperText error>{errors.customSplits}</FormHelperText>
                      )}
                    </Box>
                  )}
                </>
              )}
            </>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Receipt (Optional)
          </Typography>
          
          {receiptData.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Scanned Receipt Items
                </Typography>
                
                {receiptData.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {item.name} × {item.quantity}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Total</Typography>
                  <Typography variant="subtitle2">₹{receiptTotal.toFixed(2)}</Typography>
                </Box>
              </Paper>
            </Box>
          )}
          
          {receiptImage ? (
            <Box sx={{ position: 'relative', mb: 3 }}>
              <ReceiptPreview src={receiptImage} alt="Receipt" />
              <IconButton 
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)' }}
                onClick={handleRemoveImage}
              >
                <DeleteIcon sx={{ color: 'white' }} />
              </IconButton>
            </Box>
          ) : (
            <UploadButton
              component="label"
              variant="outlined"
              fullWidth
              startIcon={<AddPhotoAlternateIcon />}
            >
              Upload Receipt
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </UploadButton>
          )}
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            size="large"
            sx={{ mt: 3, position: 'relative', zIndex: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save Expense'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
            Tip: If the button is hidden, scroll a little up to reveal it.
          </Typography>
        </form>
      </FormContainer>

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
    </Box>
  );
};

export default AddExpense;