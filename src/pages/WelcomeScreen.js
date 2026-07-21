import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  MobileStepper,
  Paper,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
// Note: In a real implementation, you would need to install this package
// import SwipeableViews from 'react-swipeable-views';

// Since we might not have the package installed, let's create a simple alternative
const SimpleSwipeableViews = ({ index, onChangeIndex, children }) => {
  return (
    <Box sx={{ overflow: 'hidden', flex: 1 }}>
      {React.Children.map(children, (child, i) => (
        <Box 
          sx={{ 
            display: i === index ? 'block' : 'none',
            height: '100%'
          }}
          onClick={() => {
            if (i === index && index < React.Children.count(children) - 1) {
              onChangeIndex(index + 1);
            }
          }}
        >
          {child}
        </Box>
      ))}
    </Box>
  );
};

const WelcomeContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}));

const SlideContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  height: '100%',
}));

const LogoBox = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 250,
  height: 250,
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0,0,0,0.3)'
    : '0 8px 32px rgba(0,0,0,0.1)',
}));

const IllustrationBox = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 200,
  height: 200,
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255,255,255,0.05)' 
    : 'rgba(255,255,255,0.2)',
  borderRadius: theme.spacing(3),
  backdropFilter: 'blur(10px)',
  border: theme.palette.mode === 'dark' 
    ? '1px solid rgba(255,255,255,0.1)'
    : '1px solid rgba(255,255,255,0.3)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  fontWeight: 'bold',
  marginTop: theme.spacing(2),
  background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  fontSize: '1.1rem',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 10px 2px rgba(255, 105, 135, .3)',
  },
}));

const WelcomeScreen = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  
  const welcomeSteps = [
    {
      label: 'Welcome to Broke Together',
      description: 'Your ultimate expense tracking and bill splitting companion.',
      isLogo: true,
    },
    {
      label: 'Track Expenses',
      description: 'Easily record and categorize your personal and group expenses with smart categorization.',
      icon: '📊',
    },
    {
      label: 'Split Bills',
      description: 'Split bills with friends and roommates without the hassle of complex calculations.',
      icon: '💸',
    },
    {
      label: 'Settle Debts',
      description: 'Settle up with friends using multiple payment methods and keep track of who owes what.',
      icon: '🤝',
    },
    {
      label: 'Stay Organized',
      description: 'Create groups for trips, events, or shared living to keep expenses organized and transparent.',
      icon: '📱',
    },
  ];
  
  const maxSteps = welcomeSteps.length;
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleStepChange = (step) => {
    setActiveStep(step);
  };
  
  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <WelcomeContainer>
      <Paper 
        square 
        elevation={0} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'center', 
          background: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center'
          }}
        >
          {welcomeSteps[activeStep].label}
        </Typography>
      </Paper>

      <SimpleSwipeableViews
        index={activeStep}
        onChangeIndex={handleStepChange}
        enableMouseEvents
      >
        {welcomeSteps.map((step, index) => (
          <SlideContent key={index}>
            {step.isLogo ? (
              <LogoBox>
                <img 
                  src="/logo.jpeg" 
                  alt="Broke Together Logo" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    borderRadius: '16px'
                  }} 
                />
              </LogoBox>
            ) : (
              <IllustrationBox>
                <Typography variant="h1" sx={{ fontSize: '4rem' }}>
                  {step.icon}
                </Typography>
              </IllustrationBox>
            )}
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 2
              }}
            >
              {step.label}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                maxWidth: '300px'
              }}
            >
              {step.description}
            </Typography>
          </SlideContent>
        ))}
      </SimpleSwipeableViews>

      <Box sx={{ p: 2 }}>
        {activeStep === maxSteps - 1 ? (
          <ActionButton
            variant="contained"
            fullWidth
            color="primary"
            onClick={handleGetStarted}
          >
            Get Started
          </ActionButton>
        ) : null}
      </Box>

      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        sx={{ 
          background: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
            sx={{ color: 'white' }}
          >
            Next
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </Button>
        }
        backButton={
          <Button 
            size="small" 
            onClick={handleBack} 
            disabled={activeStep === 0}
            sx={{ color: 'white' }}
          >
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            Back
          </Button>
        }
      />
    </WelcomeContainer>
  );
};

export default WelcomeScreen;