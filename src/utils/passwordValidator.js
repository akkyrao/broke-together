// Password validation utility
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }

  const errors = [];
  
  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Check maximum length
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  // Check for lowercase letter
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for uppercase letter
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for number
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special character
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    strength: calculateStrength(password)
  };
};

const calculateStrength = (password) => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/(?=.*[a-z])/.test(password)) score++;
  if (/(?=.*[A-Z])/.test(password)) score++;
  if (/(?=.*\d)/.test(password)) score++;
  if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) score++;
  
  if (score >= 5) return 'Strong';
  if (score >= 3) return 'Medium';
  if (score >= 1) return 'Weak';
  return 'Very Weak';
};

// Test cases for password validation
export const testPasswords = [
  { password: '', expected: false },
  { password: '123', expected: false },
  { password: 'password', expected: false },
  { password: 'Password', expected: false },
  { password: 'Password1', expected: false },
  { password: 'Password1!', expected: true },
  { password: 'MySecure123!', expected: true },
  { password: 'VeryStrongP@ssw0rd', expected: true },
];

// Run tests
export const runPasswordTests = () => {
  console.log('Running password validation tests...');
  
  testPasswords.forEach(({ password, expected }, index) => {
    const result = validatePassword(password);
    const passed = result.isValid === expected;
    
    console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Password: "${password}"`);
    console.log(`  Expected: ${expected}, Got: ${result.isValid}`);
    console.log(`  Strength: ${result.strength}`);
    if (!result.isValid) {
      console.log(`  Errors: ${result.errors.join(', ')}`);
    }
    console.log('');
  });
};