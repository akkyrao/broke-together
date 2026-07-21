import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

import LogoutIcon from '@mui/icons-material/Logout';

import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const SettingsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
}));

const SettingsSection = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1),
  fontWeight: 500,
}));

const Settings = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const { logout } = useUser();
  const [currency, setCurrency] = React.useState('₹');
  const [notifications, setNotifications] = React.useState(true);

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
  };

  const handleNotificationChange = (event) => {
    setNotifications(event.target.checked);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/');
  };



  return (
    <Box sx={{ pb: 7 }}>
      <Header title="Settings" showBack />
      
      <SettingsContainer>
        <SettingsSection elevation={1}>
          <SectionTitle variant="h6">Preferences</SectionTitle>
          <List>
            <ListItem>
              <ListItemIcon>
                <DarkModeIcon />
              </ListItemIcon>
              <ListItemText primary="Dark Mode" />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={darkMode}
                  onChange={toggleTheme}
                  inputProps={{
                    'aria-labelledby': 'switch-dark-mode',
                  }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText primary="Notifications" />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={notifications}
                  onChange={handleNotificationChange}
                  inputProps={{
                    'aria-labelledby': 'switch-notifications',
                  }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <ListItemIcon>
                <CurrencyExchangeIcon />
              </ListItemIcon>
              <ListItemText primary="Currency" />
              <ListItemSecondaryAction>
                <FormControl variant="standard" sx={{ minWidth: 80 }}>
                  <Select
                    value={currency}
                    onChange={handleCurrencyChange}
                    label="Currency"
                  >
                    <MenuItem value="₹">₹ INR</MenuItem>
                    <MenuItem value="$">$ USD</MenuItem>
                    <MenuItem value="€">€ EUR</MenuItem>
                    <MenuItem value="£">£ GBP</MenuItem>
                  </Select>
                </FormControl>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </SettingsSection>



        <Button
          variant="contained"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogoutConfirm}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </SettingsContainer>

      <BottomNavigation />
    </Box>
  );
};

export default Settings;