import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { useUser } from './context/UserContext';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

// Pages
import SplashScreen from './pages/SplashScreen';
import WelcomeScreen from './pages/WelcomeScreen';
import AuthScreen from './pages/AuthScreen';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';
import PersonalExpenses from './pages/PersonalExpenses';
import Groups from './pages/Groups';
import AddGroup from './pages/AddGroup';
import GroupDetail from './pages/GroupDetail';
import Friends from './pages/Friends';
import AddFriend from './pages/AddFriend';
import FriendDetail from './pages/FriendDetail';
import ExpenseDetail from './pages/ExpenseDetail';
import SettleUp from './pages/SettleUp';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ScanReceipt from './pages/ScanReceipt';

// Components
import BottomNavigation from './components/BottomNavigation';
import ProtectedRoute from './components/ProtectedRoute';
import { loadDataFromJson } from './utils/dataUtils';

function App() {
  const { darkMode } = useTheme();
  const { setUsersData, isAuthenticated } = useUser();
  const navigate = useNavigate();

  // Create MUI theme based on dark mode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#FF6B6B' : '#6C5CE7',
        light: darkMode ? '#FF8A80' : '#8B7ED8',
        dark: darkMode ? '#E53935' : '#5A4FCF',
      },
      secondary: {
        main: darkMode ? '#4ECDC4' : '#00D2D3',
        light: darkMode ? '#80CBC4' : '#26C6DA',
        dark: darkMode ? '#00695C' : '#0097A7',
      },
      background: {
        default: darkMode ? '#0D1117' : '#F8F9FA',
        paper: darkMode ? '#161B22' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#F0F6FC' : '#24292F',
        secondary: darkMode ? '#8B949E' : '#656D76',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
            padding: '10px 20px',
          },
        },
      },
    },
  });

  // Load data from JSON on app initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const data = await loadDataFromJson();
        setUsersData(data.users || []);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [setUsersData]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add-expense" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
          <Route path="/edit-expense/:expenseId" element={<ProtectedRoute><EditExpense /></ProtectedRoute>} />
          <Route path="/personal-expenses" element={<ProtectedRoute><PersonalExpenses /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
          <Route path="/add-group" element={<ProtectedRoute><AddGroup /></ProtectedRoute>} />
          <Route path="/group/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
          <Route path="/add-friend" element={<ProtectedRoute><AddFriend /></ProtectedRoute>} />
          <Route path="/friend/:id" element={<ProtectedRoute><FriendDetail /></ProtectedRoute>} />
          <Route path="/expense/:id/:type" element={<ProtectedRoute><ExpenseDetail /></ProtectedRoute>} />
          <Route path="/settle-up" element={<ProtectedRoute><SettleUp /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/scan-receipt" element={<ProtectedRoute><ScanReceipt /></ProtectedRoute>} />
        </Routes>
        
        {/* Show bottom navigation on all screens except splash, welcome, and auth */}
        {!['/', '/welcome', '/auth'].includes(window.location.pathname) && <BottomNavigation />}
      </div>
    </MuiThemeProvider>
  );
}

export default App;