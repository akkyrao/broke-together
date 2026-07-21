// Utility functions for friend management with local storage

/**
 * Get friends for a user, filtering out temporary users
 * @param {number} userId - The user ID to get friends for
 * @returns {Array} - Array of active friends (non-temporary users)
 */
export const getFriendsLocal = async (userId) => {
  try {
    // Load base data from JSON
    const response = await fetch('/data.json');
    const data = await response.json();
    
    // Get base friend relationships
    let friendRelationships = data.friends?.filter(friend => friend.userId === userId) || [];
    
    // Get localStorage additions
    const addedFriends = JSON.parse(localStorage.getItem('addedFriends') || '[]');
    const userAddedFriends = addedFriends.filter(friend => friend.userId === userId);
    
    // Combine base and added relationships
    friendRelationships = [...friendRelationships, ...userAddedFriends];
    
    // Get all users
    const users = data.users || [];
    
    // Map friend relationships to user data, filtering out temporary users
    const friends = friendRelationships
      .map(relationship => {
        const friendUser = users.find(user => user.id === relationship.friendId);
        if (!friendUser) return null;
        
        // Only include friends who have active accounts (not temporary or pending)
        if (friendUser.isTemporary || friendUser.isPending) return null;
        
        return {
          id: friendUser.id,
          name: friendUser.name,
          email: friendUser.email,
          phone: friendUser.phone,
          avatar: friendUser.avatar,
          username: friendUser.username,
          balance: relationship.balance,
          createdAt: relationship.createdAt
        };
      })
      .filter(friend => friend !== null) // Remove null entries
      .filter((friend, index, self) => 
        // Remove duplicates based on friend ID
        index === self.findIndex(f => f.id === friend.id)
      );
    
    return friends;
  } catch (error) {
    console.error('Error loading friends:', error);
    return [];
  }
};

/**
 * Check if a user exists by email
 * @param {string} email - Email to check
 * @param {number} currentUserId - Current user's ID to avoid self-adding
 * @returns {Object} - Result object with user info
 */
export const lookupUserByEmailLocal = async (email, currentUserId) => {
  try {
    const response = await fetch('/data.json');
    const data = await response.json();
    
    const users = data.users || [];
    const friends = data.friends || [];
    
    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return {
        success: true,
        found: false,
        message: 'No account found with this email'
      };
    }
    
    // Check if it's the current user
    if (user.id === currentUserId) {
      return {
        success: true,
        found: true,
        isSelf: true,
        message: 'This is your own email address'
      };
    }
    
    // Check if already friends
    const existingFriendship = friends.find(f => 
      f.userId === currentUserId && f.friendId === user.id
    );
    
    if (existingFriendship) {
      return {
        success: true,
        found: true,
        isAlreadyFriend: true,
        message: 'This user is already your friend'
      };
    }
    
    // Check if user has an active account (not temporary or pending)
    if (user.isTemporary || user.isPending) {
      return {
        success: true,
        found: false,
        message: 'User has not completed registration yet'
      };
    }
    
    return {
      success: true,
      found: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar
      },
      message: 'User found and can be added as friend'
    };
  } catch (error) {
    console.error('Error looking up user:', error);
    return {
      success: false,
      message: 'Failed to lookup user'
    };
  }
};

/**
 * Add a friend locally
 * @param {number} currentUserId - Current user's ID
 * @param {string} email - Friend's email
 * @returns {Object} - Result object
 */
export const addFriendLocal = async (currentUserId, email) => {
  try {
    // First lookup the user
    const lookupResult = await lookupUserByEmailLocal(email, currentUserId);
    
    if (!lookupResult.success) {
      return lookupResult;
    }
    
    if (lookupResult.isSelf) {
      return {
        success: false,
        message: 'You cannot add yourself as a friend'
      };
    }
    
    if (lookupResult.isAlreadyFriend) {
      return {
        success: false,
        message: 'This user is already your friend'
      };
    }
    
    if (!lookupResult.found) {
      // User doesn't exist or is not active - send invitation
      return await sendInvitationLocal(email);
    }
    
    // User exists and is active - add as friend
    const friendUser = lookupResult.user;
    
    // Get current friends from localStorage
    const addedFriends = JSON.parse(localStorage.getItem('addedFriends') || '[]');
    
    // Generate unique IDs for the friendship relationships
    const timestamp = Date.now();
    const friendshipId1 = timestamp;
    const friendshipId2 = timestamp + 1;
    
    // Create bidirectional friendship
    const friendship1 = {
      id: friendshipId1,
      userId: currentUserId,
      friendId: friendUser.id,
      balance: 0,
      createdAt: new Date().toISOString()
    };
    
    const friendship2 = {
      id: friendshipId2,
      userId: friendUser.id,
      friendId: currentUserId,
      balance: 0,
      createdAt: new Date().toISOString()
    };
    
    addedFriends.push(friendship1, friendship2);
    localStorage.setItem('addedFriends', JSON.stringify(addedFriends));
    
    return {
      success: true,
      isRegistered: true,
      friend: friendUser,
      message: `${friendUser.name} has been added to your friends list`
    };
    
  } catch (error) {
    console.error('Error adding friend:', error);
    return {
      success: false,
      message: 'Failed to add friend'
    };
  }
};

/**
 * Send invitation to non-registered user
 * @param {string} email - Email to send invitation to
 * @returns {Object} - Result object
 */
const sendInvitationLocal = async (email) => {
  try {
    // Get current invitations from localStorage
    const sentInvitations = JSON.parse(localStorage.getItem('sentInvitations') || '[]');
    
    // Check if invitation already sent
    const existingInvitation = sentInvitations.find(inv => inv.email.toLowerCase() === email.toLowerCase());
    
    if (existingInvitation) {
      return {
        success: true,
        isRegistered: false,
        message: 'Invitation has already been sent to this email'
      };
    }
    
    // Add new invitation
    const invitation = {
      id: Date.now(),
      email: email,
      sentAt: new Date().toISOString(),
      status: 'pending'
    };
    
    sentInvitations.push(invitation);
    localStorage.setItem('sentInvitations', JSON.stringify(sentInvitations));
    
    // In a real app, you would send an actual email here
    console.log(`Invitation sent to ${email}`);
    
    return {
      success: true,
      isRegistered: false,
      message: `Invitation has been sent to ${email}. They will be added to your friends list when they join.`
    };
    
  } catch (error) {
    console.error('Error sending invitation:', error);
    return {
      success: false,
      message: 'Failed to send invitation'
    };
  }
};

/**
 * Get sent invitations
 * @returns {Array} - Array of sent invitations
 */
export const getSentInvitationsLocal = () => {
  try {
    return JSON.parse(localStorage.getItem('sentInvitations') || '[]');
  } catch (error) {
    console.error('Error getting sent invitations:', error);
    return [];
  }
};

/**
 * Clear local friend data (for testing/reset)
 */
export const clearLocalFriendData = () => {
  localStorage.removeItem('addedFriends');
  localStorage.removeItem('sentInvitations');
};