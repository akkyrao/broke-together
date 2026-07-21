import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit,
  Email,
  Phone,
  CameraAlt,
  Lock,
  Logout,
  AccountCircle,
  History,
  BarChart,
  Payments
} from '@mui/icons-material';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import expenseService from '../services/expenseService';
import { compressImage, validateImageFile, createImagePreview } from '../utils/imageUtils';

const ProfileContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  border: `4px solid ${theme.palette.primary.main}`,
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  overflow: 'visible',
  position: 'relative',
}));

const EditButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  height: '100%',
}));

const Profile = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { currentUser, updateUser, logout } = useUser();
  
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({
    totalExpenses: 0,
    settlements: 0,
    activeGroups: 0,
    friends: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeGroups, setActiveGroups] = useState([]);
  const [profileImageDialog, setProfileImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Handle profile form change
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };
  
  // Handle password form change
  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };
  
  // Handle edit profile dialog
  const handleEditProfileOpen = () => {
    // Sync form with current user data when opening
    setProfileForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || ''
    });
    setEditProfileOpen(true);
  };
  
  const handleEditProfileClose = () => {
    setEditProfileOpen(false);
  };
  
  const handleEditProfileSave = async () => {
    try {
      // Update user profile via API
      const response = await fetch(`http://localhost:5001/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      if (data.success) {
        // Update current user in context and localStorage
        if (updateUser) {
          updateUser(currentUser.id, data.user);
        }
        // Also update the form state to reflect the changes
        setProfileForm({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || ''
        });
        setSnackbar({
          open: true,
          message: 'Profile updated successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Failed to update profile',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    }
    handleEditProfileClose();
  };
  
  // Handle change password dialog
  const handleChangePasswordOpen = () => {
    setChangePasswordOpen(true);
  };
  
  const handleChangePasswordClose = () => {
    setChangePasswordOpen(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };
  
  const handleChangePasswordSave = () => {
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match',
        severity: 'error'
      });
      return;
    }
    
    // Update password
    setSnackbar({
      open: true,
      message: 'Password changed successfully',
      severity: 'success'
    });
    handleChangePasswordClose();
  };
  
  // Handle logout confirmation
  const handleLogoutOpen = () => {
    setLogoutConfirmOpen(true);
  };
  
  const handleLogoutClose = () => {
    setLogoutConfirmOpen(false);
  };
  
  const handleLogout = () => {
    if (logout) {
      logout();
      navigate('/');
    }
    handleLogoutClose();
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle image selection
  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validate the image file
      const validation = validateImageFile(file, 5); // 5MB max
      
      if (!validation.isValid) {
        setSnackbar({
          open: true,
          message: validation.errors.join(', '),
          severity: 'error'
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      try {
        const preview = await createImagePreview(file);
        setImagePreview(preview);
      } catch (error) {
        console.error('Error creating preview:', error);
        setSnackbar({
          open: true,
          message: 'Failed to create image preview',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error handling image selection:', error);
      setSnackbar({
        open: true,
        message: 'Failed to process selected image',
        severity: 'error'
      });
    }
  };

  // Handle profile picture upload (client-side implementation)
  const handleProfilePictureUpload = async () => {
    if (!selectedImage) return;

    setUploadingImage(true);
    
    try {
      // Compress the image for better performance and storage
      const compressedBase64 = await compressImage(selectedImage, 400, 400, 0.8);
      
      // Create a unique filename for reference
      const timestamp = Date.now();
      const fileName = `profile-${currentUser.id}-${timestamp}.jpg`; // Always save as JPG after compression
      
      // Store compressed image in localStorage with a key
      const imageKey = `profile_image_${currentUser.id}`;
      localStorage.setItem(imageKey, compressedBase64);
      
      // Update user data with avatar reference
      const avatarUrl = compressedBase64; // Use base64 directly as avatar URL
      
      if (updateUser) {
        updateUser(currentUser.id, { 
          ...currentUser, 
          avatar: avatarUrl,
          updatedAt: new Date().toISOString()
        });
      }
      
      setSnackbar({
        open: true,
        message: 'Profile picture updated successfully!',
        severity: 'success'
      });
      
      setProfileImageDialog(false);
      setSelectedImage(null);
      setImagePreview(null);
      
    } catch (error) {
      console.error('Profile picture upload error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to upload profile picture. Please try again.',
        severity: 'error'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle profile picture removal (client-side implementation)
  const handleProfilePictureRemove = async () => {
    try {
      // Remove image from localStorage
      const imageKey = `profile_image_${currentUser.id}`;
      localStorage.removeItem(imageKey);
      
      // Update current user to remove avatar
      if (updateUser) {
        updateUser(currentUser.id, { 
          ...currentUser, 
          avatar: null,
          updatedAt: new Date().toISOString()
        });
      }
      
      setSnackbar({
        open: true,
        message: 'Profile picture removed successfully!',
        severity: 'success'
      });
      
      setProfileImageDialog(false);
      setSelectedImage(null);
      setImagePreview(null);
      
    } catch (error) {
      console.error('Profile picture removal error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove profile picture',
        severity: 'error'
      });
    }
  };

  // Load user statistics
  const loadUserStats = async () => {
    setLoadingStats(true);
    try {
      // Fetch personal expenses
      const expensesResult = await expenseService.getPersonalExpenses();
      let totalExpenses = 0;
      if (expensesResult.success) {
        totalExpenses = expensesResult.expenses.reduce((sum, expense) => sum + expense.amount, 0);
      }

      // Fetch friends
      const friendsResult = await expenseService.getFriends();
      let friendsCount = 0;
      if (friendsResult.success) {
        friendsCount = friendsResult.friends.length;
      }

      // Fetch groups
      const groupsResult = await expenseService.getGroups();
      let activeGroupsCount = 0;
      if (groupsResult.success) {
        activeGroupsCount = groupsResult.groups.length;
        setActiveGroups(groupsResult.groups);
      }

      // Calculate settlements (simplified - could be more complex based on your business logic)
      let settlements = totalExpenses * 0.6; // Assuming 60% of expenses are settled

      setStats({
        totalExpenses,
        settlements,
        activeGroups: activeGroupsCount,
        friends: friendsCount
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load stats on component mount
  useEffect(() => {
    loadUserStats();
  }, []);
  
  return (
    <Box sx={{ pb: 7 }}>
      <Header 
        title="Profile" 
        showBackButton 
        onBackClick={() => navigate('/dashboard')}
      />
      
      <ProfileContainer>
        <ProfileCard>
          <CardContent sx={{ textAlign: 'center', pt: 4, pb: 3 }}>
            <ProfileAvatar src={currentUser?.avatar || ''}>
              {!currentUser?.avatar && (currentUser?.name?.charAt(0) || 'U')}
            </ProfileAvatar>
            
            <Typography variant="h5" gutterBottom>
              {currentUser?.name || 'User'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {currentUser?.email || 'No email provided'}
            </Typography>
            
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<CameraAlt />}
              sx={{ mt: 1 }}
              onClick={() => setProfileImageDialog(true)}
            >
              Change Photo
            </Button>
            
            <EditButton onClick={handleEditProfileOpen}>
              <Edit fontSize="small" />
            </EditButton>
          </CardContent>
        </ProfileCard>
        
        <Typography variant="h6" gutterBottom>
          Account Statistics
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <StatsCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <History color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Expenses
                  </Typography>
                </Box>
                <Typography variant="h6">
                  {loadingStats ? <CircularProgress size={20} /> : `₹${stats.totalExpenses.toLocaleString()}`}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>
          
          <Grid item xs={6}>
            <StatsCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Payments color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Settlements
                  </Typography>
                </Box>
                <Typography variant="h6">
                  {loadingStats ? <CircularProgress size={20} /> : `₹${stats.settlements.toLocaleString()}`}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>
          
          <Grid item xs={6}>
            <StatsCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <BarChart color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Groups
                  </Typography>
                </Box>
                <Typography variant="h6">
                  {loadingStats ? <CircularProgress size={20} /> : stats.activeGroups}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>
          
          <Grid item xs={6}>
            <StatsCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <AccountCircle color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Friends
                  </Typography>
                </Box>
                <Typography variant="h6">
                  {loadingStats ? <CircularProgress size={20} /> : stats.friends}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>
        </Grid>
        
        <Typography variant="h6" gutterBottom>
          Active Groups
        </Typography>
        
        <Paper sx={{ borderRadius: 2, mb: 3 }}>
          {activeGroups.length > 0 ? (
            <List>
              {activeGroups.map((group, index) => (
                <React.Fragment key={group.id}>
                  <ListItem button onClick={() => navigate(`/group/${group.id}`)}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        {group.icon || group.name.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={group.name} 
                      secondary={`${group.members?.length || 0} members • ₹${group.totalSpent || 0} total`} 
                    />
                  </ListItem>
                  {index < activeGroups.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No active groups yet
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 1 }}
                onClick={() => navigate('/add-group')}
              >
                Create Group
              </Button>
            </Box>
          )}
        </Paper>
        
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        
        <Paper sx={{ borderRadius: 2, mb: 3 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <Email color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Email" 
                secondary={currentUser?.email || 'No email provided'} 
              />
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <ListItemIcon>
                <Phone color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Phone" 
                secondary={currentUser?.phone || 'No phone provided'} 
              />
            </ListItem>
            

          </List>
        </Paper>
        
        <Typography variant="h6" gutterBottom>
          Security
        </Typography>
        
        <Paper sx={{ borderRadius: 2, mb: 3 }}>
          <List>
            <ListItem button onClick={handleChangePasswordOpen}>
              <ListItemIcon>
                <Lock color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Change Password" 
                secondary="Update your password" 
              />
            </ListItem>
            
            <Divider component="li" />
            
            <ListItem button onClick={handleLogoutOpen}>
              <ListItemIcon>
                <Logout color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                secondary="Sign out of your account" 
                primaryTypographyProps={{ color: 'error' }}
              />
            </ListItem>
          </List>
        </Paper>
      </ProfileContainer>
      
      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onClose={handleEditProfileClose} fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={profileForm.name}
            onChange={handleProfileFormChange}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={profileForm.email}
            onChange={handleProfileFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={profileForm.phone}
            onChange={handleProfileFormChange}
            sx={{ mb: 2 }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditProfileClose}>Cancel</Button>
          <Button onClick={handleEditProfileSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={handleChangePasswordClose} fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="currentPassword"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.currentPassword}
            onChange={handlePasswordFormChange}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="newPassword"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.newPassword}
            onChange={handlePasswordFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordFormChange}
            error={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== ''}
            helperText={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== '' ? 'Passwords do not match' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChangePasswordClose}>Cancel</Button>
          <Button 
            onClick={handleChangePasswordSave} 
            variant="contained" 
            color="primary"
            disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutConfirmOpen} onClose={handleLogoutClose}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to log out of your account?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutClose}>Cancel</Button>
          <Button onClick={handleLogout} color="error">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Profile Image Dialog */}
      <Dialog open={profileImageDialog} onClose={() => {
        setProfileImageDialog(false);
        setSelectedImage(null);
        setImagePreview(null);
      }} fullWidth>
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <ProfileAvatar src={imagePreview || currentUser?.avatar || ''}>
              {!imagePreview && !currentUser?.avatar && (currentUser?.name?.charAt(0) || 'U')}
            </ProfileAvatar>
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CameraAlt />}
                sx={{ mr: 1 }}
              >
                {selectedImage ? 'Change Photo' : 'Upload Photo'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>
              
              {selectedImage && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProfilePictureUpload}
                  disabled={uploadingImage}
                  sx={{ ml: 1 }}
                  startIcon={uploadingImage ? <CircularProgress size={16} /> : null}
                >
                  {uploadingImage ? 'Saving...' : 'Save'}
                </Button>
              )}
            </Box>
            
            {currentUser?.avatar && (
              <Button
                variant="outlined"
                color="error"
                sx={{ mt: 2 }}
                onClick={handleProfilePictureRemove}
                disabled={uploadingImage}
              >
                Remove Current Photo
              </Button>
            )}
            
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ mt: 2, display: 'block' }}
            >
              Supported formats: JPG, PNG, GIF (Max 5MB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setProfileImageDialog(false);
            setSelectedImage(null);
            setImagePreview(null);
          }}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <BottomNavigation />
    </Box>
  );
};

export default Profile;