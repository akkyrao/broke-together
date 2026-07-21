import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  IconButton,
  Chip,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InfoIcon from '@mui/icons-material/Info';

import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

const NotificationContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
}));

const NotificationItem = styled(ListItem)(({ theme, read }) => ({
  backgroundColor: read ? 'transparent' : theme.palette.action.hover,
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  position: 'relative',
}));

const TimeChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 24,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
}));

const getNotificationIcon = (type) => {
  switch (type) {
    case 'group':
      return <GroupIcon />;
    case 'friend':
      return <PersonIcon />;
    case 'expense':
      return <ReceiptIcon />;
    default:
      return <InfoIcon />;
  }
};

const Notifications = () => {
  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'group',
      title: 'Trip to Goa',
      message: 'Alex added a new expense of ₹1,200',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'friend',
      title: 'Sarah Johnson',
      message: 'Settled up and paid you ₹450',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'expense',
      title: 'Monthly Rent',
      message: 'Reminder: You need to pay ₹5,000 to Roommates group',
      time: 'Yesterday',
      read: true,
    },
    {
      id: 4,
      type: 'group',
      title: 'Dinner Club',
      message: 'You were added to a new group',
      time: '2 days ago',
      read: true,
    },
    {
      id: 5,
      type: 'friend',
      title: 'Mike Chen',
      message: 'Requested ₹300 for Coffee',
      time: '3 days ago',
      read: true,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <Box sx={{ pb: 7 }}>
      <Header title="Notifications" showBack />
      
      <NotificationContainer>
        {unreadCount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2">
              <Badge badgeContent={unreadCount} color="error" sx={{ mr: 1 }} />
              Unread notifications
            </Typography>
            <Chip 
              label="Mark all as read" 
              size="small" 
              color="primary" 
              variant="outlined"
              onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
            />
          </Box>
        )}

        <List sx={{ p: 0 }}>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <NotificationItem read={notification.read}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.read ? 'action.disabled' : 'primary.main' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" component="span">
                          {notification.title}
                        </Typography>
                        <TimeChip label={notification.time} size="small" />
                      </Box>
                    }
                    secondary={notification.message}
                  />
                  <Box sx={{ display: 'flex', position: 'absolute', right: 8, bottom: 8 }}>
                    {!notification.read && (
                      <IconButton size="small" onClick={() => markAsRead(notification.id)}>
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => deleteNotification(notification.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </NotificationItem>
                {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          )}
        </List>
      </NotificationContainer>

      <BottomNavigation />
    </Box>
  );
};

export default Notifications;