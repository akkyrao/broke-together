import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Checkbox,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import Header from '../components/Header';
import expenseService from '../services/expenseService';
import { useUser } from '../context/UserContext';

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
}));

const IconOption = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 60,
  height: 60,
  borderRadius: theme.spacing(1),
  border: `2px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  fontSize: '2rem',
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

const groupIcons = ['👥', '🏠', '✈️', '🍕', '🎉', '💼', '🏖️', '🎓', '🚗', '🏥'];

const AddGroup = () => {
  const navigate = useNavigate();
  const { friends, loadGroups, loadFriends } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '👥'
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load friends when component mounts
  useEffect(() => {
    loadFriends();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIconSelect = (icon) => {
    setFormData(prev => ({
      ...prev,
      icon
    }));
  };

  const handleMemberToggle = (friend) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(member => member.id === friend.id);
      if (isSelected) {
        return prev.filter(member => member.id !== friend.id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const handleRemoveMember = (friendId) => {
    setSelectedMembers(prev => prev.filter(member => member.id !== friendId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setSnackbar({
        open: true,
        message: 'Please enter a group name',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const groupData = {
        ...formData,
        members: selectedMembers.map(member => member.id)
      };
      const result = await expenseService.createGroup(groupData);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Group created successfully!',
          severity: 'success'
        });
        setTimeout(() => {
          navigate('/groups');
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to create group',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create group',
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
        title="Create Group" 
        showBackButton 
        onBackClick={() => navigate('/groups')}
      />
      
      <FormContainer>
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <GroupAddIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">
                Create a New Group
              </Typography>
            </Box>
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Group Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                margin="normal"
                required
                placeholder="e.g., Trip to Goa, Roommates, Office Lunch"
              />

              <TextField
                fullWidth
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                margin="normal"
                multiline
                rows={3}
                placeholder="What's this group for?"
              />

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                Choose an Icon
              </Typography>
              
              <Grid container spacing={1} sx={{ mb: 3 }}>
                {groupIcons.map((icon) => (
                  <Grid item key={icon}>
                    <IconOption
                      className={formData.icon === icon ? 'selected' : ''}
                      onClick={() => handleIconSelect(icon)}
                    >
                      {icon}
                    </IconOption>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                Add Members (Optional)
              </Typography>
              
              {selectedMembers.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Selected Members:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedMembers.map((member) => (
                      <Chip
                        key={member.id}
                        avatar={<Avatar src={member.avatar}>{member.name.charAt(0)}</Avatar>}
                        label={member.name}
                        onDelete={() => handleRemoveMember(member.id)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {friends && friends.length > 0 ? (
                <Card variant="outlined" sx={{ mb: 3, maxHeight: 300, overflow: 'auto' }}>
                  <List dense>
                    {friends.map((friend, index) => {
                      const isSelected = selectedMembers.some(member => member.id === friend.id);
                      return (
                        <React.Fragment key={friend.id}>
                          <ListItem
                            button
                            onClick={() => handleMemberToggle(friend)}
                          >
                            <Checkbox
                              edge="start"
                              checked={isSelected}
                              tabIndex={-1}
                              disableRipple
                            />
                            <ListItemAvatar>
                              <Avatar src={friend.avatar}>
                                {friend.name.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={friend.name}
                              secondary={friend.email}
                            />
                          </ListItem>
                          {index < friends.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Card>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3, mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No friends added yet. Add friends first to include them in groups.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate('/add-friend')}
                    size="small"
                  >
                    Add Friends
                  </Button>
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/groups')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <GroupAddIcon />}
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </StyledCard>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              About Groups:
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Groups help you organize shared expenses with multiple people
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Perfect for trips, shared apartments, or regular group activities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • You can add members and track who owes what to whom
            </Typography>
          </CardContent>
        </Card>
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

export default AddGroup;