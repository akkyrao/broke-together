import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon,
  Payment as PaymentIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';

import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useUser } from '../context/UserContext';
import { formatCurrency } from '../utils/dataUtils';

const SettleContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settle-tabpanel-${index}`}
      aria-labelledby={`settle-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SettleItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PaymentMethodButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  justifyContent: 'flex-start',
  textAlign: 'left',
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const SettleUp = () => {
  const navigate = useNavigate();
  const { friends, groups } = useUser();
  
  const [tabValue, setTabValue] = useState(0);
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Filter friends who owe you or you owe them
  const friendsWithBalances = friends.filter(friend => friend.youOwe > 0 || friend.owesToYou > 0);
  
  // Filter groups with unsettled expenses
  const unsettledGroups = groups.filter(group => group.progress < 100);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSettleClick = (entity, type) => {
    setSelectedEntity({ ...entity, type });
    setAmount(type === 'friend' ? (entity.youOwe > 0 ? entity.youOwe.toString() : entity.owesToYou.toString()) : '');
    setSettleDialogOpen(true);
  };
  
  const handleSettleDialogClose = () => {
    setSettleDialogOpen(false);
    setSelectedEntity(null);
    setAmount('');
    setNote('');
  };
  
  const handlePaymentMethodClick = () => {
    setSettleDialogOpen(false);
    setPaymentMethodDialogOpen(true);
  };
  
  const handlePaymentMethodDialogClose = () => {
    setPaymentMethodDialogOpen(false);
    setPaymentMethod('');
  };
  
  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setPaymentMethodDialogOpen(false);
    
    // Simulate settlement process
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: `Settlement with ${selectedEntity.name} completed successfully!`,
        severity: 'success'
      });
      setSelectedEntity(null);
      setAmount('');
      setNote('');
      setPaymentMethod('');
    }, 1000);
  };
  
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Box sx={{ pb: 7 }}>
      <Header 
        title="Settle Up" 
        showBack 
        onBackClick={() => navigate('/dashboard')}
      />
      
      <SettleContainer>
        <Paper sx={{ borderRadius: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<PersonIcon />} label="Friends" />
            <Tab icon={<GroupIcon />} label="Groups" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            {friendsWithBalances.length > 0 ? (
              <List sx={{ p: 0 }}>
                {friendsWithBalances.map((friend, index) => (
                  <React.Fragment key={friend.id}>
                    <SettleItem button onClick={() => handleSettleClick(friend, 'friend')}>
                      <ListItemAvatar>
                        <Avatar src={friend.profilePic} alt={friend.name}>
                          {!friend.profilePic && friend.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={friend.name}
                        secondary={
                          friend.youOwe > 0 
                            ? `You owe ${formatCurrency(friend.youOwe)}` 
                            : `Owes you ${formatCurrency(friend.owesToYou)}`
                        }
                        secondaryTypographyProps={{
                          color: friend.youOwe > 0 ? 'error.main' : 'success.main',
                          fontWeight: 'medium'
                        }}
                      />
                      <ArrowForwardIcon color="action" />
                    </SettleItem>
                    {index < friendsWithBalances.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No pending settlements with friends
                </Typography>
              </Box>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {unsettledGroups.length > 0 ? (
              <List sx={{ p: 0 }}>
                {unsettledGroups.map((group, index) => (
                  <React.Fragment key={group.id}>
                    <SettleItem button onClick={() => handleSettleClick(group, 'group')}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          {group.icon || <GroupIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={group.name}
                        secondary={`${group.progress}% settled · ${formatCurrency(group.totalSpent)}`}
                      />
                      <ArrowForwardIcon color="action" />
                    </SettleItem>
                    {index < unsettledGroups.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No pending settlements with groups
                </Typography>
              </Box>
            )}
          </TabPanel>
        </Paper>
      </SettleContainer>
      
      {/* Settle Dialog */}
      <Dialog open={settleDialogOpen} onClose={handleSettleDialogClose} fullWidth>
        <DialogTitle>
          Settle with {selectedEntity?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 1 }}>
            <Avatar 
              src={selectedEntity?.profilePic} 
              sx={{ mr: 2, bgcolor: selectedEntity?.type === 'group' ? 'primary.light' : 'inherit' }}
            >
              {selectedEntity?.type === 'group' 
                ? (selectedEntity?.icon || <GroupIcon />) 
                : (!selectedEntity?.profilePic && selectedEntity?.name?.charAt(0))}
            </Avatar>
            <Typography variant="h6">
              {selectedEntity?.name}
            </Typography>
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Add a note"
            type="text"
            fullWidth
            variant="outlined"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's this for?"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettleDialogClose}>Cancel</Button>
          <Button 
            onClick={handlePaymentMethodClick} 
            variant="contained" 
            color="primary"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Payment Method Dialog */}
      <Dialog open={paymentMethodDialogOpen} onClose={handlePaymentMethodDialogClose} fullWidth>
        <DialogTitle>Choose Payment Method</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <PaymentMethodButton 
              fullWidth 
              variant="outlined" 
              startIcon={<AccountBalanceIcon />}
              onClick={() => handlePaymentMethodSelect('bank')}
            >
              <Box>
                <Typography variant="subtitle1">Bank Transfer</Typography>
                <Typography variant="body2" color="text.secondary">Transfer directly to bank account</Typography>
              </Box>
            </PaymentMethodButton>
            
            <PaymentMethodButton 
              fullWidth 
              variant="outlined" 
              startIcon={<CreditCardIcon />}
              onClick={() => handlePaymentMethodSelect('card')}
            >
              <Box>
                <Typography variant="subtitle1">Credit/Debit Card</Typography>
                <Typography variant="body2" color="text.secondary">Pay using your card</Typography>
              </Box>
            </PaymentMethodButton>
            
            <PaymentMethodButton 
              fullWidth 
              variant="outlined" 
              startIcon={<PaymentIcon />}
              onClick={() => handlePaymentMethodSelect('upi')}
            >
              <Box>
                <Typography variant="subtitle1">UPI</Typography>
                <Typography variant="body2" color="text.secondary">Pay using UPI apps</Typography>
              </Box>
            </PaymentMethodButton>
            
            <PaymentMethodButton 
              fullWidth 
              variant="outlined" 
              startIcon={<QrCodeIcon />}
              onClick={() => handlePaymentMethodSelect('qr')}
            >
              <Box>
                <Typography variant="subtitle1">Scan QR Code</Typography>
                <Typography variant="body2" color="text.secondary">Scan to pay</Typography>
              </Box>
            </PaymentMethodButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentMethodDialogClose}>Cancel</Button>
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

export default SettleUp;