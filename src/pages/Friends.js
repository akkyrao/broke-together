import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Fab,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';

import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useUser } from '../context/UserContext';
import { getFriendExpenses, calculateBalance } from '../utils/friendExpenseUtils';
import expenseService from '../services/expenseService';

const FriendsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(3),
  },
}));

const FriendItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.spacing(2),
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



const Friends = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [blockDialog, setBlockDialog] = useState({ open: false, friend: null });

  // Filter friends based on search query and active filter
  const filteredFriends = friends
    .filter(friend => 
      friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(friend => {
      if (activeFilter === 'all') return true;
      const liveBalance = calculateLiveBalance(friend.id);
      if (activeFilter === 'owe') return liveBalance < 0;
      if (activeFilter === 'owed') return liveBalance > 0;
      return true;
    });

  const handleAddFriend = () => {
    navigate('/add-friend');
  };

  const handleFriendClick = (friendId) => {
    navigate(`/friend/${friendId}`);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Load friends on component mount
  useEffect(() => {
    loadFriends();
  }, []);

  // Refresh friends list when the component comes into focus (e.g., returning from expense pages)
  useEffect(() => {
    const handleFocus = () => {
      loadFriends();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const result = await expenseService.getFriends();
      if (result.success) {
        setFriends(result.friends);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to load friends',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load friends',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleMenuOpen = (event, friend) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedFriend(friend);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedFriend(null);
  };

  const handleBlockFriend = () => {
    setBlockDialog({ open: true, friend: selectedFriend });
    handleMenuClose();
  };

  const confirmBlockFriend = async () => {
    if (!blockDialog.friend) return;
    
    try {
      const result = await expenseService.blockFriend(blockDialog.friend.id);
      if (result.success) {
        setSnackbar({
          open: true,
          message: `${blockDialog.friend.name} has been blocked`,
          severity: 'success'
        });
        // Reload friends list
        loadFriends();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to block friend',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to block friend',
        severity: 'error'
      });
    }
    
    setBlockDialog({ open: false, friend: null });
  };

  const cancelBlockFriend = () => {
    setBlockDialog({ open: false, friend: null });
  };

  // Calculate live balance for a friend from expense data
  function calculateLiveBalance(friendId) {
    if (!currentUser) return 0;
    try {
      const expenses = getFriendExpenses(currentUser.id, friendId);
      return calculateBalance(expenses, currentUser.id, friendId);
    } catch (error) {
      console.error('Error calculating live balance:', error);
      return 0;
    }
  }

  // Format balance with color and sign
  const formatBalanceDisplay = (balance) => {
    if (Math.abs(balance) < 0.01) {
      return {
        display: '₹0',
        color: 'text.secondary',
        prefix: ''
      };
    }
    
    if (balance > 0) {
      return {
        display: `+₹${Math.abs(balance).toFixed(2)}`,
        color: '#4caf50',
        prefix: '+'
      };
    } else {
      return {
        display: `-₹${Math.abs(balance).toFixed(2)}`,
        color: '#f44336',
        prefix: '-'
      };
    }
  };

  return (
    <Box sx={{ pb: 7 }}>
      <Header title="Friends" showBack />
      
      <FriendsContainer>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Your Friends
        </Typography>
        

        
        <SearchBar
          fullWidth
          placeholder="Search friends..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />
        
        <Box sx={{ display: 'flex', mb: 3 }}>
          <Chip 
            label="All" 
            color={activeFilter === 'all' ? 'primary' : 'default'} 
            onClick={() => setActiveFilter('all')} 
            sx={{ mr: 1 }}
          />
          <Chip 
            label="They owe you" 
            color={activeFilter === 'owed' ? 'primary' : 'default'} 
            onClick={() => setActiveFilter('owed')} 
            sx={{ mr: 1 }}
          />
          <Chip 
            label="You owe them" 
            color={activeFilter === 'owe' ? 'primary' : 'default'} 
            onClick={() => setActiveFilter('owe')} 
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredFriends.length > 0 ? (
          <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <List sx={{ p: 0 }}>
              {filteredFriends.map((friend, index) => {
                const liveBalance = calculateLiveBalance(friend.id);
                const balanceDisplay = formatBalanceDisplay(liveBalance);
                
                return (
                  <React.Fragment key={friend.id}>
                    <FriendItem button onClick={() => handleFriendClick(friend.id)}>
                      <ListItemAvatar>
                        <Avatar alt={friend.name} src={friend.avatar || ''}>
                          {!friend.avatar && (friend.name || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                              {friend.name}
                            </Typography>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                color: balanceDisplay.color,
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                              }}
                            >
                              {balanceDisplay.display}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            {friend.email && (
                              <Typography variant="body2" color="text.secondary">
                                {friend.email}
                              </Typography>
                            )}
                            {friend.phone && (
                              <Typography variant="body2" color="text.secondary">
                                {friend.phone}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, friend)}
                        sx={{ ml: 1 }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </FriendItem>
                    {index < filteredFriends.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {searchQuery 
                ? 'No friends match your search' 
                : 'No friends found'}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<PersonAddIcon />}
              onClick={handleAddFriend}
            >
              Add a Friend
            </Button>
          </Box>
        )}
        
        <AddButton color="primary" aria-label="add friend" onClick={handleAddFriend}>
          <AddIcon />
        </AddButton>
      </FriendsContainer>

      <BottomNavigation />
      
      {/* Friend actions menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleBlockFriend}>
          <BlockIcon sx={{ mr: 1 }} />
          Block Friend
        </MenuItem>
      </Menu>

      {/* Block confirmation dialog */}
      <Dialog
        open={blockDialog.open}
        onClose={cancelBlockFriend}
        aria-labelledby="block-dialog-title"
        aria-describedby="block-dialog-description"
      >
        <DialogTitle id="block-dialog-title">
          Block Friend
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="block-dialog-description">
            Are you sure you want to block {blockDialog.friend?.name}? 
            They will be removed from your friends list and won't be able to add or share expenses with you.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelBlockFriend}>Cancel</Button>
          <Button onClick={confirmBlockFriend} color="error" variant="contained">
            Block
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default Friends;