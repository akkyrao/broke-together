import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Header = ({ 
  title, 
  showBack = false, 
  showNotification = false, 
  showSettings = false,
  showEdit = false,
  notificationCount = 0,
  onBackClick,
  onNotificationClick,
  onSettingsClick,
  onEditClick
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      navigate('/notifications');
    }
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      navigate('/settings');
    }
  };

  const handleEditClick = () => {
    if (onEditClick) {
      onEditClick();
    }
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        {showBack && (
          <IconButton edge="start" color="inherit" onClick={handleBackClick} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex' }}>
          {showEdit && (
            <IconButton color="inherit" onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          )}
          
          {showNotification && (
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}
          
          {showSettings && (
            <IconButton color="inherit" onClick={handleSettingsClick}>
              <SettingsIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;