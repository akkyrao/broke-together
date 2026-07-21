import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Fab } from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'absolute',
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: '0 auto',
}));

const NavWrapper = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  paddingBottom: theme.spacing(1),
  paddingTop: theme.spacing(1),
  pointerEvents: 'auto'
}));

const BottomNavigationComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.substring(1); // Remove leading slash
  
  const handleChange = (event, newValue) => {
    navigate(`/${newValue}`);
  };

  return (
    <NavWrapper elevation={3}>
      <MuiBottomNavigation
        value={currentPath}
        onChange={handleChange}
        showLabels
      >
        <BottomNavigationAction 
          label="Home" 
          value="dashboard" 
          icon={<HomeIcon />} 
        />
        <BottomNavigationAction 
          label="Personal" 
          value="personal-expenses" 
          icon={<AccountBalanceWalletIcon />} 
        />
        <BottomNavigationAction 
          label="Groups" 
          value="groups" 
          icon={<GroupIcon />} 
        />
        <BottomNavigationAction 
          label="" 
          value="add-expense" 
          icon={
            <StyledFab color="primary" aria-label="add">
              <AddIcon />
            </StyledFab>
          } 
        />
        <BottomNavigationAction 
          label="Friends" 
          value="friends" 
          icon={<PeopleIcon />} 
        />
        <BottomNavigationAction 
          label="Profile" 
          value="profile" 
          icon={<PersonIcon />} 
        />
        <BottomNavigationAction 
          label="Settings" 
          value="settings" 
          icon={<SettingsIcon />} 
        />
      </MuiBottomNavigation>
    </NavWrapper>
  );
};

export default BottomNavigationComponent;