import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';

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

const AddFriend = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [friendStatus, setFriendStatus] = useState(null); // 'registered', 'invited', or null
  const [foundFriend, setFoundFriend] = useState(null); // friend details when registered

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Reset status when user types
    setFriendStatus(null);
  };

  const isEmail = (str) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(str);

  const handlePrecheck = async () => {
    const email = (formData.email || '').trim();
    if (!email) {
      setSnackbar({ open: true, message: 'Please enter an email address', severity: 'error' });
      return;
    }
    if (!isEmail(email)) {
      setSnackbar({ open: true, message: 'Please enter a valid email address', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const result = await expenseService.lookupUserByEmail(email);
      if (result.success) {
        if (result.found) {
          setFriendStatus('registered');
          setFoundFriend(result.user);
          setSnackbar({ open: true, message: result.isSelf ? 'This is your own email' : (result.isAlreadyFriend ? 'Already your friend' : 'User exists. You can add them.'), severity: result.isSelf || result.isAlreadyFriend ? 'info' : 'success' });
        } else {
          setFriendStatus('invited');
          setFoundFriend(null);
          setSnackbar({ open: true, message: 'No account found. You can send an invite.', severity: 'info' });
        }
      } else {
        setSnackbar({ open: true, message: result.message || 'Lookup failed', severity: 'error' });
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'Lookup failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setSnackbar({
        open: true,
        message: 'Please enter an email address',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await expenseService.addFriend({ email: formData.email });
      
      if (result.success) {
        // Set friend status based on response
        setFriendStatus(result.isRegistered ? 'registered' : 'invited');
        setFoundFriend(result.isRegistered ? result.friend : null);
        
        setSnackbar({
          open: true,
          message: result.message || 'Friend added successfully!',
          severity: 'success'
        });
        
        // Stay on page briefly to show status UI, then navigate
        setTimeout(() => {
          navigate('/friends');
        }, result.isRegistered ? 1500 : 2500); // Longer delay for invitations to show message
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to add friend',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to add friend',
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
        title="Add Friend" 
        showBackButton 
        onBackClick={() => navigate('/friends')}
      />
      
      <FormContainer>
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonAddIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">
                Add a New Friend
              </Typography>
            </Box>
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Friend's Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                margin="normal"
                required
                placeholder="friend@example.com"
                helperText="Enter the email address to add as friend"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              {friendStatus && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  {friendStatus === 'registered' ? (
                    <>
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="✅ User found and added directly"
                        color="success"
                        variant="filled"
                        sx={{ mb: 1 }}
                      />
                      {foundFriend && (
                        <Card variant="outlined" sx={{ mt: 1 }}>
                          <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {foundFriend.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {foundFriend.email}
                            </Typography>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    <Chip
                      icon={<EmailIcon />}
                      label="📧 Request has been sent to them"
                      color="warning"
                      variant="filled"
                    />
                  )}
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handlePrecheck}
                  disabled={loading}
                >
                  {loading ? 'Checking...' : 'Check User'}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                >
                  {loading ? 'Adding...' : 'Add Friend'}
                </Button>
              </Box>

              <Box sx={{ mt: 1 }}>
                <Button
                  variant="text"
                  fullWidth
                  onClick={() => navigate('/friends')}
                  disabled={loading}
                >
                  Cancel
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

export default AddFriend;