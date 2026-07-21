import React from 'react';
import { Box } from '@mui/material';

const BrokeLogo = ({ size = 120, showText = true }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Logo Icon */}
      <Box
        sx={{
          width: size,
          height: size * 0.6,
          position: 'relative',
          marginBottom: showText ? 2 : 0,
        }}
      >
        <svg
          width={size}
          height={size * 0.6}
          viewBox="0 0 120 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Document/Receipt */}
          <rect
            x="30"
            y="12"
            width="40"
            height="48"
            rx="2"
            fill="#4DD0E1"
          />
          
          {/* Document content lines */}
          <rect x="34" y="18" width="20" height="1.5" rx="0.75" fill="white" opacity="0.9" />
          <rect x="34" y="22" width="16" height="1.5" rx="0.75" fill="white" opacity="0.8" />
          <rect x="34" y="26" width="18" height="1.5" rx="0.75" fill="white" opacity="0.8" />
          <rect x="34" y="30" width="14" height="1.5" rx="0.75" fill="white" opacity="0.7" />
          
          {/* Pink accent bar - representing amount/money */}
          <rect
            x="34"
            y="38"
            width="24"
            height="6"
            rx="1"
            fill="#FF8A80"
          />
          
          {/* Small details on pink section */}
          <rect x="36" y="40.5" width="6" height="1" rx="0.5" fill="white" opacity="0.9" />
          <rect x="44" y="40.5" width="10" height="1" rx="0.5" fill="white" opacity="0.9" />
          
          {/* Vertical separator line */}
          <rect
            x="74"
            y="16"
            width="2"
            height="40"
            rx="1"
            fill="#4DD0E1"
          />
          
          {/* Rupee/Currency symbol */}
          <g transform="translate(80, 22)">
            <path
              d="M1 1h8M1 5h8M1 9l6-4M3.5 5v8"
              stroke="#4DD0E1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
          
          {/* Small decorative dots */}
          <circle cx="82" cy="42" r="1.5" fill="#FF8A80" opacity="0.8" />
          <circle cx="86" cy="46" r="1" fill="#4DD0E1" opacity="0.7" />
        </svg>
      </Box>

      {/* Text */}
      {showText && (
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
              fontWeight: 900,
              color: 'white',
              letterSpacing: '0.1em',
              lineHeight: 1,
              marginBottom: 0.5,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            BROKE
          </Box>
          <Box
            sx={{
              fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
              fontWeight: 600,
              color: 'white',
              letterSpacing: '0.2em',
              opacity: 0.95,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            TOGETHER
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BrokeLogo;