import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider,
  Button,
  Paper,
  IconButton,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';

import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useUser } from '../context/UserContext';
import { formatCurrency } from '../utils/dataUtils';
import expenseService from '../services/expenseService';
import { getFriendExpenses, calculateBalance } from '../utils/friendExpenseUtils';

const BalanceCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(3),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(255, 107, 107, 0.3)'
    : '0 8px 32px rgba(102, 126, 234, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
}));

const ActionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)'
    : theme.palette.background.paper,
  border: theme.palette.mode === 'dark' 
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(0, 0, 0, 0.05)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 40px rgba(255, 107, 107, 0.2)'
      : '0 20px 40px rgba(102, 126, 234, 0.2)',
    background: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)'
      : theme.palette.background.paper,
  },
}));

const ActivityItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(1),
  background: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)'
    : theme.palette.background.paper,
  border: theme.palette.mode === 'dark' 
    ? '1px solid rgba(255, 255, 255, 0.05)'
    : '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.06)'
      : theme.palette.action.hover,
    transform: 'translateX(4px)',
  },
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useUser();
  const [notificationCount, setNotificationCount] = useState(3);
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    youOwe: 0,
    youAreOwed: 0,
    recentTransactions: [],
    friends: [],
    groups: []
  });
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh data when navigating back to dashboard
  useEffect(() => {
    // Reload data whenever the location changes to dashboard
    if (location.pathname === '/dashboard') {
      loadDashboardData();
    }
  }, [location.pathname]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [expensesResult, friendsResult, groupsResult] = await Promise.all([
        expenseService.getPersonalExpenses(),
        expenseService.getFriends(),
        expenseService.getGroups()
      ]);

      let totalExpenses = 0;
      let recentTransactions = [];
      
      if (expensesResult.success) {
        totalExpenses = expensesResult.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        // Get recent transactions (last 5)
        recentTransactions = expensesResult.expenses
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(expense => ({
            id: expense.id,
            description: expense.description,
            amount: expense.amount,
            date: expense.date,
            paidBy: 'You'
          }));
      }

      let youOwe = 0;
      let youAreOwed = 0;
      let friends = [];
      
      if (friendsResult.success) {
        friends = friendsResult.friends.map(friend => {
          // Compute live balance from local friend expenses
          try {
            const expenses = getFriendExpenses(currentUser.id, friend.id);
            const liveBalance = calculateBalance(expenses, currentUser.id, friend.id);
            // Positive means friend owes you; negative means you owe friend
            const owesToYou = liveBalance > 0 ? liveBalance : 0;
            const youOweFriend = liveBalance < 0 ? Math.abs(liveBalance) : 0;
            youAreOwed += owesToYou;
            youOwe += youOweFriend;
            return { ...friend, owesToYou, youOwe: youOweFriend };
          } catch (e) {
            // Fallback to any API-provided fields if local calc fails
            if (friend.owesToYou) youAreOwed += friend.owesToYou;
            if (friend.youOwe) youOwe += friend.youOwe;
            return friend;
          }
        });
      }

      let groups = [];
      if (groupsResult.success) {
        groups = groupsResult.groups;
      }

      const totalBalance = youAreOwed - youOwe;

      setDashboardData({
        totalBalance,
        youOwe,
        youAreOwed,
        recentTransactions,
        friends,
        groups
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Build a concise human summary of amounts the user needs to pay/receive
  const renderBalanceSummary = () => {
    if (loading) return null;
    const { youOwe, youAreOwed, friends, groups } = dashboardData;

    // Count friends by direction
    const oweFriends = friends.filter(f => (f.youOwe || 0) > 0);
    const owedFriends = friends.filter(f => (f.owesToYou || 0) > 0);

    // Optionally include group balances if available on objects
    const groupNet = (groups || []).reduce((sum, g) => {
      const v = typeof g.yourBalance === 'number' ? g.yourBalance : 0;
      return sum + v;
    }, 0);

    const net = (youAreOwed - youOwe) + groupNet;

    let headline = '';
    if (Math.abs(youOwe) < 0.01 && Math.abs(youAreOwed) < 0.01 && Math.abs(groupNet) < 0.01) {
      headline = "You're all settled up. No pending balances.";
    } else {
      headline = `You are owed ${formatCurrency(youAreOwed)} from ${owedFriends.length} friend(s)` +
                 (groupNet !== 0 ? ` and ${groupNet > 0 ? 'have' : 'owe'} ${formatCurrency(Math.abs(groupNet))} in groups` : '') +
                 `, and you owe ${formatCurrency(youOwe)} to ${oweFriends.length} friend(s). Net: ${formatCurrency(net)}`;
    }

    // Suggest top counterparties (up to 2 for each side)
    const topOwed = owedFriends
      .sort((a,b) => (b.owesToYou||0) - (a.owesToYou||0))
      .slice(0, 2)
      .map(f => `${f.name} (${formatCurrency(f.owesToYou)})`);
    const topOwe = oweFriends
      .sort((a,b) => (b.youOwe||0) - (a.youOwe||0))
      .slice(0, 2)
      .map(f => `${f.name} (${formatCurrency(f.youOwe)})`);

    return (
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {headline}
        </Typography>
        {(topOwed.length > 0 || topOwe.length > 0) && (
          <Box sx={{ mt: 1.5 }}>
            {topOwed.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Biggest who owe you: {topOwed.join(', ')}
              </Typography>
            )}
            {topOwe.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Biggest you owe: {topOwe.join(', ')}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ pb: 7 }}> {/* Bottom padding for navigation */}
      <Header 
        title="Dashboard" 
        showNotification 
        showSettings
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        onSettingsClick={handleSettingsClick}
      />
      
      <Box sx={{ p: 2 }}>
        {/* Balance Card */}
        <BalanceCard>
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" component="div" sx={{ opacity: 0.9 }}>
                Total Balance
              </Typography>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: '20px', 
                px: 2, 
                py: 0.5 
              }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 3 }}>
              {loading ? <CircularProgress size={40} color="inherit" /> : formatCurrency(dashboardData.totalBalance)}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.15)', 
                borderRadius: 2, 
                p: 2, 
                flex: 1, 
                mr: 1,
                textAlign: 'center'
              }}>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Owed to You</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : formatCurrency(dashboardData.youAreOwed)}
                </Typography>
              </Box>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.15)', 
                borderRadius: 2, 
                p: 2, 
                flex: 1, 
                ml: 1,
                textAlign: 'center'
              }}>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>You Owe</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : formatCurrency(dashboardData.youOwe)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </BalanceCard>

        {/* Natural-language balance summary */}
        {renderBalanceSummary()}

        {/* Quick Actions */}
        <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
          Quick Actions
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <ActionCard onClick={() => navigate('/add-expense')}>
              <Box sx={{ 
                p: 2, 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ReceiptIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Add Expense</Typography>
              <Typography variant="caption" color="text.secondary">
                Track spending
              </Typography>
            </ActionCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <ActionCard onClick={() => navigate('/personal-expenses')}>
              <Box sx={{ 
                p: 2, 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Personal</Typography>
              <Typography variant="caption" color="text.secondary">
                Your expenses
              </Typography>
            </ActionCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <ActionCard onClick={() => navigate('/groups')}>
              <Box sx={{ 
                p: 2, 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GroupIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Groups</Typography>
              <Typography variant="caption" color="text.secondary">
                Shared expenses
              </Typography>
            </ActionCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <ActionCard onClick={() => navigate('/friends')}>
              <Box sx={{ 
                p: 2, 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #f093fb 30%, #f5576c 90%)',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PeopleIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Friends</Typography>
              <Typography variant="caption" color="text.secondary">
                Split bills
              </Typography>
            </ActionCard>
          </Grid>
        </Grid>

        {/* Balance Breakdown */}
        {(dashboardData.youOwe > 0 || dashboardData.youAreOwed > 0) && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Balance Details
            </Typography>
            
            {/* You Owe Section */}
            {dashboardData.youOwe > 0 && (
              <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: 'error.main', fontWeight: 600 }}>
                  You Owe: {formatCurrency(dashboardData.youOwe)}
                </Typography>
                <List sx={{ p: 0 }}>
                  {dashboardData.friends
                    .filter(friend => friend.youOwe && friend.youOwe > 0)
                    .map((friend) => (
                      <ListItem key={friend.id} sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar>
                          <Avatar src={friend.avatar}>
                            {friend.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={friend.name}
                          secondary={`You owe ${formatCurrency(friend.youOwe)}`}
                        />
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="error"
                          onClick={() => navigate(`/settle-up?friend=${friend.id}&amount=${friend.youOwe}`)}
                        >
                          Pay Back
                        </Button>
                      </ListItem>
                    ))}
                </List>
              </Paper>
            )}
            
            {/* You're Owed Section */}
            {dashboardData.youAreOwed > 0 && (
              <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: 'success.main', fontWeight: 600 }}>
                  You're Owed: {formatCurrency(dashboardData.youAreOwed)}
                </Typography>
                <List sx={{ p: 0 }}>
                  {dashboardData.friends
                    .filter(friend => friend.owesToYou && friend.owesToYou > 0)
                    .map((friend) => (
                      <ListItem key={friend.id} sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar>
                          <Avatar src={friend.avatar}>
                            {friend.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={friend.name}
                          secondary={`Owes you ${formatCurrency(friend.owesToYou)}`}
                        />
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="success"
                          onClick={() => navigate(`/remind?friend=${friend.id}&amount=${friend.owesToYou}`)}
                        >
                          Remind
                        </Button>
                      </ListItem>
                    ))}
                </List>
              </Paper>
            )}
          </Box>
        )}

        {/* Recent Activity */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Recent Activity</Typography>
            <Button 
              endIcon={<ArrowForwardIcon />} 
              onClick={() => navigate('/activity')}
              size="small"
            >
              View All
            </Button>
          </Box>
          
          <List sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : dashboardData.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
              dashboardData.recentTransactions.slice(0, 5).map((transaction, index) => {
                // Safety check for transaction data
                if (!transaction) return null;
                
                return (
                <React.Fragment key={transaction.id || index}>
                  <ActivityItem>
                    <ListItemAvatar>
                      <Avatar 
                        alt={transaction.paidBy || 'Unknown'} 
                        src={transaction.avatar || ''}
                        sx={{
                          bgcolor: !transaction.avatar ? 
                            transaction.paidBy === 'You' ? 'success.main' : 'error.main' : 'inherit'
                        }}
                      >
                        {!transaction.avatar && (transaction.paidBy || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={transaction.paidBy || 'Unknown'}
                      secondary={transaction.description || 'Transaction'}
                    />
                    <Typography 
                      variant="body2" 
                      color={transaction.paidBy === 'You' ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {transaction.paidBy === 'You' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Typography>
                  </ActivityItem>
                  {index < dashboardData.recentTransactions.slice(0, 5).length - 1 && <Divider />}
                </React.Fragment>
                );
              })
            ) : (
              <Typography variant="body2" sx={{ textAlign: 'center', py: 2 }}>
                No recent activity
              </Typography>
            )}
          </List>
        </Box>
      </Box>

      <BottomNavigation />
    </Box>
  );
};

export default Dashboard;