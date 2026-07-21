const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads', 'profile-pictures');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Path to the data file
const DATA_FILE = path.join(__dirname, 'public', 'data.json');

// Ensure data file exists
const initializeDataFile = async () => {
  try {
    await fs.ensureFile(DATA_FILE);
    const data = await fs.readJson(DATA_FILE).catch(() => ({ users: [] }));
    if (!data.users) {
      data.users = [];
      await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    }
  } catch (error) {
    console.error('Error initializing data file:', error);
  }
};

// Helper function to read data
const readData = async () => {
  try {
    return await fs.readJson(DATA_FILE);
  } catch (error) {
    return { users: [] };
  }
};

// Helper function to write data
const writeData = async (data) => {
  try {
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
};

// Generate unique ID
const generateId = (items) => {
  return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
};

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Read existing data
    const data = await readData();

    // Check if user already exists
    const existingUser = data.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: generateId(data.users),
      name,
      username: email.split('@')[0], // Generate username from email
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    // Add user to data
    data.users.push(newUser);

    // Save data
    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save user data' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Read existing data
    const data = await readData();

    // Find user
    const user = data.users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Forgot password - request reset token
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const data = await readData();
    const userIndex = data.users.findIndex(u => u.email === email);

    // Always return success message to avoid email enumeration
    // But in development, include a reset token to allow manual testing
    if (userIndex === -1) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      });
    }

    // Generate a secure random token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store token and expiry on the user object
    data.users[userIndex].resetPasswordToken = resetToken;
    data.users[userIndex].resetPasswordExpires = expiresAt;
    data.users[userIndex].updatedAt = new Date().toISOString();

    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ success: false, message: 'Failed to save reset token' });
    }

    // In a real app, send email here. For development, return token in response
    return res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
      // Expose only in non-production environments for testing
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
      expiresInMinutes: 15
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Reset password using token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Reset token is required' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }

    // Server-side password validation (aligns with client rules)
    const passwordErrors = [];
    if (password.length < 8) passwordErrors.push('at least 8 characters');
    if (password.length > 128) passwordErrors.push('less than 128 characters');
    if (!/(?=.*[a-z])/.test(password)) passwordErrors.push('one lowercase letter');
    if (!/(?=.*[A-Z])/.test(password)) passwordErrors.push('one uppercase letter');
    if (!/(?=.*\d)/.test(password)) passwordErrors.push('one number');
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) passwordErrors.push('one special character');

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Password must contain ${passwordErrors.join(', ')}`
      });
    }

    const data = await readData();

    const now = Date.now();
    const userIndex = data.users.findIndex(u => 
      u.resetPasswordToken === token && typeof u.resetPasswordExpires === 'number' && u.resetPasswordExpires > now
    );

    if (userIndex === -1) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Hash new password and clear reset fields
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    data.users[userIndex].password = hashedPassword;
    delete data.users[userIndex].resetPasswordToken;
    delete data.users[userIndex].resetPasswordExpires;
    data.users[userIndex].updatedAt = new Date().toISOString();

    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ success: false, message: 'Failed to update password' });
    }

    return res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// Get user profile endpoint
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const data = await readData();
    const user = data.users.find(user => user.id === req.user.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Update user profile endpoint
app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const data = await readData();
    
    const userIndex = data.users.findIndex(user => user.id === req.user.userId);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if email is already taken by another user
    if (email && email !== data.users[userIndex].email) {
      const existingUser = data.users.find(user => user.email === email && user.id !== req.user.userId);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is already taken' 
        });
      }
    }

    // Update user data
    const updatedUser = {
      ...data.users[userIndex],
      name: name || data.users[userIndex].name,
      email: email || data.users[userIndex].email,
      phone: phone || data.users[userIndex].phone,
      updatedAt: new Date().toISOString()
    };

    data.users[userIndex] = updatedUser;

    // Save data
    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update profile' 
      });
    }

    // Return updated user data (without password)
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Upload profile picture endpoint
app.post('/api/auth/upload-profile-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const data = await readData();
    const userIndex = data.users.findIndex(user => user.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Delete old profile picture if exists
    if (data.users[userIndex].avatar) {
      const oldImagePath = path.join(__dirname, data.users[userIndex].avatar.replace('/uploads', 'uploads'));
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.log('Old image not found or already deleted');
      }
    }

    // Update user with new avatar URL
    const avatarUrl = `/uploads/profile-pictures/${req.file.filename}`;
    data.users[userIndex].avatar = avatarUrl;
    data.users[userIndex].updatedAt = new Date().toISOString();

    // Save data
    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update profile picture' 
      });
    }

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      avatarUrl: avatarUrl
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Remove profile picture endpoint
app.delete('/api/auth/remove-profile-picture', verifyToken, async (req, res) => {
  try {
    const data = await readData();
    const userIndex = data.users.findIndex(user => user.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Delete profile picture file if exists
    if (data.users[userIndex].avatar) {
      const imagePath = path.join(__dirname, data.users[userIndex].avatar.replace('/uploads', 'uploads'));
      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.log('Image file not found or already deleted');
      }
    }

    // Remove avatar from user data
    data.users[userIndex].avatar = null;
    data.users[userIndex].updatedAt = new Date().toISOString();

    // Save data
    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to remove profile picture' 
      });
    }

    res.json({
      success: true,
      message: 'Profile picture removed successfully'
    });

  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get all users endpoint (for development/testing)
app.get('/api/users', async (req, res) => {
  try {
    const data = await readData();
    
    // Return users without passwords
    const usersWithoutPasswords = data.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      users: usersWithoutPasswords
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ===== USER LOOKUP API =====
app.get('/api/users/lookup', verifyToken, async (req, res) => {
  try {
    const email = (req.query.email || '').toString().trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const data = await readData();
    if (!data.friends) data.friends = [];
    if (!data.blockedFriends) data.blockedFriends = [];

    const user = data.users.find(u => u.email && u.email.toLowerCase() === email);

    if (!user) {
      return res.json({ success: true, found: false });
    }

    // Build safe user object
    const { password, ...userWithoutPassword } = user;

    const isSelf = user.id === req.user.userId;

    const isAlreadyFriend = data.friends.some(f => f.userId === req.user.userId && f.friendId === user.id);

    const isBlocked = data.blockedFriends.some(b => 
      (b.userId === req.user.userId && b.friendId === user.id) ||
      (b.userId === user.id && b.friendId === req.user.userId)
    );

    return res.json({
      success: true,
      found: true,
      user: userWithoutPassword,
      isSelf,
      isAlreadyFriend,
      isBlocked
    });
  } catch (error) {
    console.error('User lookup error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ===== FRIENDS API ENDPOINTS =====

// Get user's friends
app.get('/api/friends', verifyToken, async (req, res) => {
  try {
    const data = await readData();

    // Ensure arrays exist
    if (!data.friends) data.friends = [];
    if (!data.blockedFriends) data.blockedFriends = [];

    // Get friendships for the current user
    const userFriends = data.friends.filter(friendship => 
      friendship.userId === req.user.userId
    );

    // Exclude blocked relations (either direction)
    const filteredUserFriends = userFriends.filter(friendship => {
      const isBlocked = data.blockedFriends.some(b => 
        (b.userId === req.user.userId && b.friendId === friendship.friendId) ||
        (b.userId === friendship.friendId && b.friendId === req.user.userId)
      );
      return !isBlocked;
    });

    // Get friend details
    const friendsWithDetails = filteredUserFriends.map(friendship => {
      const friend = data.users.find(user => user.id === friendship.friendId);
      if (friend) {
        const { password, ...friendWithoutPassword } = friend;
        return {
          ...friendWithoutPassword,
          balance: friendship.balance || 0,
          youOwe: friendship.balance < 0 ? Math.abs(friendship.balance) : 0,
          owesToYou: friendship.balance > 0 ? friendship.balance : 0
        };
      }
      return null;
    }).filter(Boolean);

    res.json({
      success: true,
      friends: friendsWithDetails
    });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Block a friend
app.post('/api/friends/:friendId/block', verifyToken, async (req, res) => {
  try {
    const friendId = parseInt(req.params.friendId);
    const data = await readData();

    if (!data.blockedFriends) data.blockedFriends = [];

    // Already blocked?
    const alreadyBlocked = data.blockedFriends.some(b => b.userId === req.user.userId && b.friendId === friendId);
    if (alreadyBlocked) {
      return res.json({ success: true, message: 'Friend already blocked' });
    }

    // Add block record (one-way block)
    data.blockedFriends.push({
      id: generateId(data.blockedFriends),
      userId: req.user.userId,
      friendId: friendId,
      createdAt: new Date().toISOString()
    });

    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ success: false, message: 'Failed to update block list' });
    }

    res.json({ success: true, message: 'Friend blocked successfully' });
  } catch (error) {
    console.error('Block friend error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Unblock a friend
app.post('/api/friends/:friendId/unblock', verifyToken, async (req, res) => {
  try {
    const friendId = parseInt(req.params.friendId);
    const data = await readData();

    if (!data.blockedFriends) data.blockedFriends = [];

    const before = data.blockedFriends.length;
    data.blockedFriends = data.blockedFriends.filter(b => !(b.userId === req.user.userId && b.friendId === friendId));
    const after = data.blockedFriends.length;

    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ success: false, message: 'Failed to update block list' });
    }

    if (before === after) {
      return res.json({ success: true, message: 'Friend was not blocked' });
    }

    res.json({ success: true, message: 'Friend unblocked successfully' });
  } catch (error) {
    console.error('Unblock friend error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add a friend
app.post('/api/friends', verifyToken, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const data = await readData();

    // Initialize arrays if they don't exist
    if (!data.friends) data.friends = [];
    if (!data.blockedFriends) data.blockedFriends = [];

    let friend = null;
    let isRegistered = false;

    // Try to find existing user by email
    friend = data.users.find(user => user.email === email);
    
    if (friend) {
      isRegistered = true;
      
      // Check if user is trying to add themselves
      if (friend.id === req.user.userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'You cannot add yourself as a friend' 
        });
      }
      
      // Check if already friends
      const existingFriendship = data.friends.find(friendship => 
        (friendship.userId === req.user.userId && friendship.friendId === friend.id) ||
        (friendship.userId === friend.id && friendship.friendId === req.user.userId)
      );

      if (existingFriendship) {
        return res.status(400).json({ 
          success: false, 
          message: 'Already friends with this user' 
        });
      }

      // Check if blocked either direction
      const isBlocked = data.blockedFriends.some(b => 
        (b.userId === req.user.userId && b.friendId === friend.id) ||
        (b.userId === friend.id && b.friendId === req.user.userId)
      );
      if (isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Cannot add this user because one of you has blocked the other'
        });
      }
    } else {
      // Create a temporary user entry for invitation
      friend = {
        id: generateId(data.users),
        name: email.split('@')[0], // Use email prefix as name
        email: email,
        isTemporary: true,
        createdAt: new Date().toISOString()
      };
      data.users.push(friend);
    }

    // Create friendship (bidirectional)
    const friendship1 = {
      id: generateId(data.friends),
      userId: req.user.userId,
      friendId: friend.id,
      balance: 0,
      createdAt: new Date().toISOString()
    };

    const friendship2 = {
      id: generateId([...data.friends, friendship1]),
      userId: friend.id,
      friendId: req.user.userId,
      balance: 0,
      createdAt: new Date().toISOString()
    };

    data.friends.push(friendship1, friendship2);

    // Save data
    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save friend data' 
      });
    }

    // Return friend data (without password)
    const { password, ...friendWithoutPassword } = friend;

    res.status(201).json({
      success: true,
      message: isRegistered 
        ? 'Friend added successfully' 
        : 'Invitation sent - friend will be added when they join',
      isRegistered,
      friend: {
        ...friendWithoutPassword,
        balance: 0,
        youOwe: 0,
        owesToYou: 0
      }
    });

  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ===== GROUPS API ENDPOINTS =====

// Get user's groups
app.get('/api/groups', verifyToken, async (req, res) => {
  try {
    const data = await readData();
    
    // Initialize groups array if it doesn't exist
    if (!data.groups) {
      data.groups = [];
    }

    // Get groups where user is a member
    const userGroups = data.groups.filter(group => 
      group.members && group.members.some(member => member.userId === req.user.userId)
    );

    // Initialize group expenses if not exists
    if (!data.groupExpenses) {
      data.groupExpenses = [];
    }

    // Populate member details for each group
    const groupsWithMemberDetails = userGroups.map(group => {
      const membersWithDetails = group.members.map(member => {
        const user = data.users.find(u => u.id === member.userId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          return {
            ...member,
            id: user.id,
            userId: user.id, // Keep both for compatibility
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            balance: 0 // TODO: Calculate actual balance
          };
        }
        return member;
      });

      // Get group expenses
      const groupExpenses = data.groupExpenses.filter(expense => expense.groupId === group.id) || [];

      return {
        ...group,
        members: membersWithDetails,
        expenses: groupExpenses,
        yourBalance: 0, // TODO: Calculate user's balance in this group
        isSettled: false // TODO: Calculate settlement status
      };
    });

    res.json({
      success: true,
      groups: groupsWithMemberDetails
    });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Create a group
app.post('/api/groups', verifyToken, async (req, res) => {
  try {
    const { name, description, icon, members } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Group name is required' 
      });
    }

    const data = await readData();

    // Initialize groups array if it doesn't exist
    if (!data.groups) {
      data.groups = [];
    }

    // Create members array starting with the creator
    const groupMembers = [{
      userId: req.user.userId,
      role: 'admin',
      joinedAt: new Date().toISOString()
    }];

    // Add selected members if provided
    if (members && Array.isArray(members)) {
      members.forEach(memberId => {
        // Check if member exists and is not already added
        const memberExists = data.users.find(user => user.id === memberId);
        const alreadyAdded = groupMembers.find(member => member.userId === memberId);
        
        if (memberExists && !alreadyAdded && memberId !== req.user.userId) {
          groupMembers.push({
            userId: memberId,
            role: 'member',
            joinedAt: new Date().toISOString()
          });
        }
      });
    }

    // Create new group
    const newGroup = {
      id: generateId(data.groups),
      name,
      description: description || '',
      icon: icon || '👥',
      createdBy: req.user.userId,
      members: groupMembers,
      totalSpent: 0,
      createdAt: new Date().toISOString()
    };

    data.groups.push(newGroup);

    // Save data
    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save group data' 
      });
    }

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group: newGroup
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Update/Edit group
app.put('/api/groups/:groupId', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Group name is required' 
      });
    }

    const data = await readData();
    const groupIndex = data.groups?.findIndex(g => g.id === parseInt(groupId));

    if (groupIndex === -1 || !data.groups) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    const group = data.groups[groupIndex];

    // Check if user is admin of the group
    const userMembership = group.members.find(member => member.userId === req.user.userId);
    if (!userMembership || userMembership.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only group admins can edit the group' 
      });
    }

    // Update group data
    const updatedGroup = {
      ...group,
      name,
      description: description || group.description,
      icon: icon || group.icon,
      updatedAt: new Date().toISOString()
    };

    data.groups[groupIndex] = updatedGroup;

    // Save data
    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update group' 
      });
    }

    res.json({
      success: true,
      message: 'Group updated successfully',
      group: updatedGroup
    });

  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Add member to group
app.post('/api/groups/:groupId/members', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email, userId } = req.body;

    if (!email && !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or userId is required' 
      });
    }

    const data = await readData();
    const group = data.groups?.find(g => g.id === parseInt(groupId));

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    // Check if user is admin of the group
    const userMembership = group.members.find(member => member.userId === req.user.userId);
    if (!userMembership || userMembership.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only group admins can add members' 
      });
    }

    let newMember = null;

    if (email) {
      newMember = data.users.find(user => user.email === email);
      if (!newMember) {
        return res.status(404).json({ 
          success: false, 
          message: 'User with this email not found' 
        });
      }
    } else {
      newMember = data.users.find(user => user.id === userId);
      if (!newMember) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
    }

    // Check if user is already a member
    const existingMember = group.members.find(member => member.userId === newMember.id);
    if (existingMember) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already a member of this group' 
      });
    }

    // Add member to group
    group.members.push({
      userId: newMember.id,
      role: 'member',
      joinedAt: new Date().toISOString()
    });

    // Save data
    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save group data' 
      });
    }

    const { password, ...memberWithoutPassword } = newMember;

    res.json({
      success: true,
      message: 'Member added successfully',
      member: memberWithoutPassword
    });

  } catch (error) {
    console.error('Add group member error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Add expense to group
app.post('/api/groups/:groupId/expenses', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { description, amount, paidBy, date, category, participants, splitType, shares } = req.body;

    if (!description || !amount || !paidBy) {
      return res.status(400).json({ success: false, message: 'Description, amount and paidBy are required' });
    }

    const amt = parseFloat(amount);
    if (!(amt > 0)) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const data = await readData();
    const group = data.groups?.find(g => g.id === parseInt(groupId));
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Ensure groupExpenses exists
    if (!data.groupExpenses) data.groupExpenses = [];

    // Validate membership
    const isMember = group.members.some(m => m.userId === req.user.userId);
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Only group members can add expenses' });
    }

    // Resolve participants: default to all members
    let participantIds = Array.isArray(participants) && participants.length > 0
      ? participants.map(id => parseInt(id))
      : group.members.map(m => m.userId);

    // Validate paidBy in group
    if (!group.members.some(m => m.userId === parseInt(paidBy))) {
      return res.status(400).json({ success: false, message: 'paidBy must be a group member' });
    }

    // Ensure paidBy is part of participants list
    if (!participantIds.includes(parseInt(paidBy))) {
      participantIds.push(parseInt(paidBy));
    }

    // Compute shares map
    let sharesMap = {};
    if (splitType === 'custom' && shares && typeof shares === 'object') {
      // Validate provided shares
      const sumShares = participantIds.reduce((s, uid) => s + (parseFloat(shares[uid]) || 0), 0);
      if (Math.abs(sumShares - amt) > 0.01) {
        return res.status(400).json({ success: false, message: 'Custom shares must sum to total amount' });
      }
      participantIds.forEach(uid => { sharesMap[uid] = parseFloat(shares[uid]) || 0; });
    } else {
      // Equal split
      const per = amt / participantIds.length;
      participantIds.forEach(uid => { sharesMap[uid] = parseFloat(per.toFixed(2)); });
      // Adjust rounding to match total exactly
      const diff = parseFloat((amt - Object.values(sharesMap).reduce((s,v)=>s+v,0)).toFixed(2));
      if (Math.abs(diff) >= 0.01) {
        const firstUid = participantIds[0];
        sharesMap[firstUid] = parseFloat((sharesMap[firstUid] + diff).toFixed(2));
      }
    }

    // Create expense
    const newExpense = {
      id: generateId(data.groupExpenses),
      groupId: parseInt(groupId),
      description,
      amount: amt,
      paidBy: parseInt(paidBy),
      date: date || new Date().toISOString().split('T')[0],
      category: category || 'Other',
      participants: participantIds,
      shares: sharesMap,
      createdAt: new Date().toISOString()
    };

    data.groupExpenses.push(newExpense);

    // Optionally update group's totalSpent for quick display
    const groupIndex = data.groups.findIndex(g => g.id === parseInt(groupId));
    if (groupIndex !== -1) {
      const totalSpent = data.groupExpenses.filter(e => e.groupId === parseInt(groupId)).reduce((s,e)=>s+e.amount,0);
      data.groups[groupIndex].totalSpent = totalSpent;
    }

    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ success: false, message: 'Failed to save expense' });
    }

    return res.status(201).json({ success: true, message: 'Expense added successfully', expense: newExpense });
  } catch (error) {
    console.error('Add group expense error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ===== PERSONAL EXPENSES API ENDPOINTS =====

// Get user's personal expenses
app.get('/api/expenses/personal', verifyToken, async (req, res) => {
  try {
    const data = await readData();
    
    // Initialize expenses array if it doesn't exist
    if (!data.personalExpenses) {
      data.personalExpenses = [];
    }

    // Get expenses for the current user
    const userExpenses = data.personalExpenses.filter(expense => 
      expense.userId === req.user.userId
    );

    res.json({
      success: true,
      expenses: userExpenses
    });

  } catch (error) {
    console.error('Get personal expenses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Add personal expense
app.post('/api/expenses/personal', verifyToken, async (req, res) => {
  try {
    const { description, amount, category, date, notes } = req.body;

    if (!description || !amount || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Description, amount, and category are required' 
      });
    }

    const data = await readData();

    // Initialize expenses array if it doesn't exist
    if (!data.personalExpenses) {
      data.personalExpenses = [];
    }

    // Create new expense
    const newExpense = {
      id: generateId(data.personalExpenses),
      userId: req.user.userId,
      description,
      amount: parseFloat(amount),
      category,
      date: date || new Date().toISOString().split('T')[0],
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    data.personalExpenses.push(newExpense);

    // Save data
    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save expense data' 
      });
    }

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense: newExpense
    });

  } catch (error) {
    console.error('Add personal expense error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Update personal expense
app.put('/api/expenses/personal/:expenseId', verifyToken, async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { description, amount, category, date, notes } = req.body;

    const data = await readData();
    
    if (!data.personalExpenses) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    const expenseIndex = data.personalExpenses.findIndex(expense => 
      expense.id === parseInt(expenseId) && expense.userId === req.user.userId
    );

    if (expenseIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    // Update expense
    const updatedExpense = {
      ...data.personalExpenses[expenseIndex],
      description: description || data.personalExpenses[expenseIndex].description,
      amount: amount ? parseFloat(amount) : data.personalExpenses[expenseIndex].amount,
      category: category || data.personalExpenses[expenseIndex].category,
      date: date || data.personalExpenses[expenseIndex].date,
      notes: notes !== undefined ? notes : data.personalExpenses[expenseIndex].notes,
      updatedAt: new Date().toISOString()
    };

    data.personalExpenses[expenseIndex] = updatedExpense;

    // Save data
    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update expense data' 
      });
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense: updatedExpense
    });

  } catch (error) {
    console.error('Update personal expense error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Delete personal expense
app.delete('/api/expenses/personal/:expenseId', verifyToken, async (req, res) => {
  try {
    const { expenseId } = req.params;

    const data = await readData();
    
    if (!data.personalExpenses) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    const expenseIndex = data.personalExpenses.findIndex(expense => 
      expense.id === parseInt(expenseId) && expense.userId === req.user.userId
    );

    if (expenseIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    // Remove expense
    data.personalExpenses.splice(expenseIndex, 1);

    // Save data
    const saved = await writeData(data);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete expense data' 
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('Delete personal expense error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// In development, we don't serve static files from server
// React dev server handles this on port 3000
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, 'build')));

  // Catch all handler: send back React's index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Initialize and start server
const startServer = async () => {
  await initializeDataFile();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Data file location: ${DATA_FILE}`);
  });
};

startServer();