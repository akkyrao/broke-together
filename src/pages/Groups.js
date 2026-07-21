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
  LinearProgress,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import FlightIcon from '@mui/icons-material/Flight';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WorkIcon from '@mui/icons-material/Work';

import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useUser } from '../context/UserContext';
import { formatCurrency } from '../utils/dataUtils';
import expenseService from '../services/expenseService';

const GroupsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
}));

const GroupCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    backgroundColor: value === 100 ? theme.palette.success.main : theme.palette.primary.main,
  },
}));

const AddButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 80, // Above bottom navigation
  right: 16,
  zIndex: 1000,
}));

const getGroupIcon = (name) => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('home') || nameLower.includes('room') || nameLower.includes('apartment')) {
    return <HomeIcon />;
  } else if (nameLower.includes('trip') || nameLower.includes('travel') || nameLower.includes('vacation')) {
    return <FlightIcon />;
  } else if (nameLower.includes('dinner') || nameLower.includes('lunch') || nameLower.includes('food')) {
    return <RestaurantIcon />;
  } else if (nameLower.includes('office') || nameLower.includes('work')) {
    return <WorkIcon />;
  } else {
    return <GroupIcon />;
  }
};

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const filteredGroups = activeFilter === 'all' 
    ? groups 
    : activeFilter === 'active' 
      ? groups.filter(group => !group.settled) 
      : groups.filter(group => group.settled);

  const handleCreateGroup = () => {
    navigate('/add-group');
  };

  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  // Load groups on component mount
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const result = await expenseService.getGroups();
      if (result.success) {
        setGroups(result.groups);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to load groups',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load groups',
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
      <Header title="Groups" showBack />
      
      <GroupsContainer>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Your Groups
          </Typography>
          
          <Box>
            <Chip 
              label="All" 
              color={activeFilter === 'all' ? 'primary' : 'default'} 
              onClick={() => setActiveFilter('all')} 
              sx={{ mr: 1 }}
            />
            <Chip 
              label="Active" 
              color={activeFilter === 'active' ? 'primary' : 'default'} 
              onClick={() => setActiveFilter('active')} 
              sx={{ mr: 1 }}
            />
            <Chip 
              label="Settled" 
              color={activeFilter === 'settled' ? 'primary' : 'default'} 
              onClick={() => setActiveFilter('settled')} 
            />
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredGroups.length > 0 ? (
          <Grid container spacing={2}>
            {filteredGroups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <GroupCard onClick={() => handleGroupClick(group.id)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          width: 50, 
                          height: 50,
                          mr: 2 
                        }}
                      >
                        {getGroupIcon(group.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {group.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {group.members?.length || 0} members
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Expenses
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(group.totalSpent || 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Your Share
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency((group.totalSpent || 0) / (group.members?.length || 1))}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Settlement Progress
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {group.settled ? 'Settled' : 'Active'}
                        </Typography>
                      </Box>
                      <ProgressBar 
                        variant="determinate" 
                        value={group.settled ? 100 : 70}
                      />
                    </Box>
                  </CardContent>
                </GroupCard>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No groups found
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateGroup}
            >
              Create a Group
            </Button>
          </Box>
        )}
        
        <AddButton color="primary" aria-label="add" onClick={handleCreateGroup}>
          <AddIcon />
        </AddButton>
      </GroupsContainer>

      <BottomNavigation />
      
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

export default Groups;