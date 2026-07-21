import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  Link,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  LinearProgress,
  Chip,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff, Email, Lock, Person } from '@mui/icons-material';
import { useUser } from '../context/UserContext';

const AuthContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[100],
}));

const AuthCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 450,
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
}));

const FormField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.2),
  borderRadius: theme.spacing(3),
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AuthScreen = () => {
  const navigate = useNavigate();
  const { login, register } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [forgotSent, setForgotSent] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Form errors
  const [loginErrors, setLoginErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    color: 'error'
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const calculatePasswordStrength = (password) => {
    if (!password) {
      return { score: 0, feedback: [], color: 'error' };
    }

    let score = 0;
    const feedback = [];
    const requirements = [
      { test: password.length >= 8, message: '8+ characters', points: 1 },
      { test: /(?=.*[a-z])/.test(password), message: 'Lowercase letter', points: 1 },
      { test: /(?=.*[A-Z])/.test(password), message: 'Uppercase letter', points: 1 },
      { test: /(?=.*\d)/.test(password), message: 'Number', points: 1 },
      { test: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password), message: 'Special character', points: 1 },
      { test: password.length >= 12, message: '12+ characters (bonus)', points: 1 }
    ];

    requirements.forEach(req => {
      if (req.test) {
        score += req.points;
        feedback.push({ message: req.message, met: true });
      } else {
        feedback.push({ message: req.message, met: false });
      }
    });

    let color = 'error';
    if (score >= 5) color = 'success';
    else if (score >= 3) color = 'warning';
    else if (score >= 1) color = 'info';

    return { score, feedback, color };
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: value
    });
    
    // Clear error when user types
    if (loginErrors[name]) {
      setLoginErrors({
        ...loginErrors,
        [name]: ''
      });
    }
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm({
      ...signupForm,
      [name]: value
    });
    
    // Calculate password strength in real-time
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear error when user types
    if (signupErrors[name]) {
      setSignupErrors({
        ...signupErrors,
        [name]: ''
      });
    }
  };

  const validateLoginForm = () => {
    const errors = {};
    
    if (!loginForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      errors.email = 'Email is invalid';
    } else if (loginForm.email.length > 100) {
      errors.email = 'Email must be less than 100 characters';
    }
    
    if (!loginForm.password) {
      errors.password = 'Password is required';
    } else if (loginForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignupForm = () => {
    const errors = {};
    
    if (!signupForm.name) {
      errors.name = 'Name is required';
    } else if (signupForm.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (signupForm.name.length > 50) {
      errors.name = 'Name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(signupForm.name)) {
      errors.name = 'Name can only contain letters and spaces';
    }
    
    if (!signupForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupForm.email)) {
      errors.email = 'Email is invalid';
    } else if (signupForm.email.length > 100) {
      errors.email = 'Email must be less than 100 characters';
    }
    
    if (!signupForm.password) {
      errors.password = 'Password is required';
    } else {
      const password = signupForm.password;
      const passwordErrors = [];
      
      if (password.length < 8) {
        passwordErrors.push('at least 8 characters');
      }
      
      if (password.length > 128) {
        passwordErrors.push('less than 128 characters');
      }
      
      if (!/(?=.*[a-z])/.test(password)) {
        passwordErrors.push('one lowercase letter');
      }
      
      if (!/(?=.*[A-Z])/.test(password)) {
        passwordErrors.push('one uppercase letter');
      }
      
      if (!/(?=.*\d)/.test(password)) {
        passwordErrors.push('one number');
      }
      
      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
        passwordErrors.push('one special character');
      }
      
      if (passwordErrors.length > 0) {
        errors.password = `Password must contain ${passwordErrors.join(', ')}`;
      }
    }
    
    if (!signupForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (signupForm.password !== signupForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (validateLoginForm()) {
      setIsSubmitting(true);
      
      try {
        const result = await login({
          email: loginForm.email,
          password: loginForm.password
        });
        
        if (result.success) {
          setSnackbar({
            open: true,
            message: result.message || 'Login successful!',
            severity: 'success'
          });
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          setSnackbar({
            open: true,
            message: result.message || 'Login failed. Please try again.',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        setSnackbar({
          open: true,
          message: 'An unexpected error occurred. Please try again.',
          severity: 'error'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (validateSignupForm()) {
      setIsSubmitting(true);
      
      try {
        const result = await register({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password
        });
        
        if (result.success) {
          setSnackbar({
            open: true,
            message: result.message || 'Account created successfully!',
            severity: 'success'
          });
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          setSnackbar({
            open: true,
            message: result.message || 'Registration failed. Please try again.',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setSnackbar({
          open: true,
          message: 'An unexpected error occurred. Please try again.',
          severity: 'error'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <AuthContainer>
      <AuthCard elevation={3}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Broke Together
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Split expenses with friends & groups
        </Typography>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="auth tabs"
        >
          <Tab label="Login" id="auth-tab-0" aria-controls="auth-tabpanel-0" />
          <Tab label="Sign Up" id="auth-tab-1" aria-controls="auth-tabpanel-1" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleLoginSubmit}>
            <FormField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={loginForm.email}
              onChange={handleLoginChange}
              error={!!loginErrors.email}
              helperText={loginErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={loginForm.password}
              onChange={handleLoginChange}
              error={!!loginErrors.password}
              helperText={loginErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ textAlign: 'right', mb: 2 }}>
              <Link
                href="#"
                variant="body2"
                underline="hover"
                onClick={(e) => {
                  e.preventDefault();
                  if (!forgotSent) {
                    setForgotSent(true);
                    setSnackbar({ open: true, message: 'Sent mail to your mail id', severity: 'success' });
                  } else {
                    setSnackbar({ open: true, message: 'Reset mail already sent', severity: 'info' });
                  }
                }}
              >
                Forgot password?
              </Link>
            </Box>
            
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disableElevation
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </SubmitButton>
          </form>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handleSignupSubmit}>
            <FormField
              fullWidth
              label="Full Name"
              name="name"
              value={signupForm.name}
              onChange={handleSignupChange}
              error={!!signupErrors.name}
              helperText={signupErrors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={signupForm.email}
              onChange={handleSignupChange}
              error={!!signupErrors.email}
              helperText={signupErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={signupForm.password}
              onChange={handleSignupChange}
              error={!!signupErrors.password}
              helperText={signupErrors.password || (!signupForm.password ? 'Must be 8+ characters with uppercase, lowercase, number, and special character' : '')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Password Strength Indicator */}
            {signupForm.password && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ mr: 1 }}>
                    Password Strength:
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: passwordStrength.color === 'success' ? 'success.main' :
                             passwordStrength.color === 'warning' ? 'warning.main' :
                             passwordStrength.color === 'info' ? 'info.main' : 'error.main'
                    }}
                  >
                    {passwordStrength.score >= 5 ? 'Strong' :
                     passwordStrength.score >= 3 ? 'Medium' :
                     passwordStrength.score >= 1 ? 'Weak' : 'Very Weak'}
                  </Typography>
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={(passwordStrength.score / 6) * 100}
                  color={passwordStrength.color}
                  sx={{ mb: 1, height: 6, borderRadius: 3 }}
                />
                
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {passwordStrength.feedback.map((item, index) => (
                    <Chip
                      key={index}
                      label={item.message}
                      size="small"
                      variant={item.met ? "filled" : "outlined"}
                      color={item.met ? "success" : "default"}
                      sx={{ 
                        fontSize: '0.7rem',
                        height: 20,
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
            
            <FormField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={signupForm.confirmPassword}
              onChange={handleSignupChange}
              error={!!signupErrors.confirmPassword}
              helperText={signupErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disableElevation
              disabled={isSubmitting || (signupForm.password && passwordStrength.score < 4)}
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </SubmitButton>
            
            {signupForm.password && passwordStrength.score < 4 && (
              <Typography 
                variant="caption" 
                color="error" 
                sx={{ mt: 1, display: 'block', textAlign: 'center' }}
              >
                Password must meet at least 4 requirements to continue
              </Typography>
            )}
          </form>
        </TabPanel>
      </AuthCard>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AuthContainer>
  );
};

export default AuthScreen;