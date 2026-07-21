import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useUser } from '../context/UserContext';
import BrokeLogo from '../components/BrokeLogo';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

const SplashContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  padding: theme.spacing(2),
  textAlign: 'center',
  background: '#000000',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(77, 208, 225, 0.1) 0%, transparent 50%)',
    animation: `${pulse} 4s ease-in-out infinite`,
  },
}));

const AnimatedLogoContainer = styled(Box)({
  animation: `${fadeInUp} 1s ease-out, ${float} 3s ease-in-out infinite 1s`,
  position: 'relative',
  zIndex: 2,
});

const FloatingParticle = styled(Box)(({ delay = 0, size = 4 }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: 'linear-gradient(45deg, #4DD0E1, #FF8A80)',
  animation: `${sparkle} 2s ease-in-out infinite ${delay}s`,
  zIndex: 1,
}));

const AppSubtitle = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: '3rem',
  fontSize: '1.1rem',
  fontWeight: 300,
  letterSpacing: '0.05em',
  animation: `${fadeInUp} 1s ease-out 0.3s both`,
  position: 'relative',
  zIndex: 2,
});

const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: '25px',
  padding: '12px 32px',
  background: 'linear-gradient(45deg, #4DD0E1 30%, #FF8A80 90%)',
  color: 'white',
  fontWeight: 600,
  fontSize: '1rem',
  letterSpacing: '0.05em',
  textTransform: 'none',
  boxShadow: '0 4px 15px rgba(77, 208, 225, 0.4)',
  border: 'none',
  position: 'relative',
  zIndex: 2,
  animation: `${fadeInUp} 1s ease-out 0.6s both`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #26C6DA 30%, #FF7043 90%)',
    boxShadow: '0 6px 20px rgba(77, 208, 225, 0.6)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const LoadingContainer = styled(Box)({
  position: 'relative',
  zIndex: 2,
  animation: `${fadeInUp} 1s ease-out 0.9s both`,
});

const SplashScreen = () => {
  const navigate = useNavigate();
  const { currentUser, login } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
      
      // If user is already logged in, redirect to dashboard
      if (currentUser) {
        navigate('/dashboard');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  const handleLogin = () => {
    // For demo purposes, we'll just log in with a default user
    login({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '',
    });
    navigate('/dashboard');
  };

  return (
    <SplashContainer>
      {/* Floating particles */}
      <FloatingParticle sx={{ top: '20%', left: '15%' }} delay={0} size={3} />
      <FloatingParticle sx={{ top: '30%', right: '20%' }} delay={0.5} size={2} />
      <FloatingParticle sx={{ top: '60%', left: '10%' }} delay={1} size={4} />
      <FloatingParticle sx={{ top: '70%', right: '15%' }} delay={1.5} size={2.5} />
      <FloatingParticle sx={{ top: '40%', left: '80%' }} delay={0.8} size={3} />
      <FloatingParticle sx={{ top: '80%', left: '70%' }} delay={1.2} size={2} />
      
      <AnimatedLogoContainer>
        <BrokeLogo size={140} showText={true} />
      </AnimatedLogoContainer>
      
      <AppSubtitle>
        Split expenses with friends & groups
      </AppSubtitle>
      
      {loading ? (
        <LoadingContainer>
          <CircularProgress 
            size={40}
            sx={{ 
              color: '#4DD0E1',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
          <Typography 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              mt: 2, 
              fontSize: '0.9rem',
              fontWeight: 300,
            }}
          >
            Loading your financial journey...
          </Typography>
        </LoadingContainer>
      ) : (
        <LoginButton 
          variant="contained" 
          disableElevation
          onClick={handleLogin}
        >
          Get Started
        </LoginButton>
      )}
    </SplashContainer>
  );
};

export default SplashScreen;