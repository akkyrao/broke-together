// Test file for friend utilities
import { lookupUserByEmailLocal, addFriendLocal } from '../friendUtils';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Friend Utils', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock data.json response
    const mockData = {
      users: [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          username: 'janesmith'
        },
        {
          id: 3,
          name: 'Temp User',
          email: 'temp@example.com',
          isTemporary: true
        }
      ],
      friends: []
    };
    
    fetch.mockResolvedValue({
      json: () => Promise.resolve(mockData)
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should find existing active user', async () => {
    const result = await lookupUserByEmailLocal('john@example.com', 2);
    
    expect(result.success).toBe(true);
    expect(result.found).toBe(true);
    expect(result.user.name).toBe('John Doe');
    expect(result.isSelf).toBeFalsy();
    expect(result.isAlreadyFriend).toBeFalsy();
  });

  test('should detect self email', async () => {
    const result = await lookupUserByEmailLocal('john@example.com', 1);
    
    expect(result.success).toBe(true);
    expect(result.found).toBe(true);
    expect(result.isSelf).toBe(true);
  });

  test('should not find temporary user', async () => {
    const result = await lookupUserByEmailLocal('temp@example.com', 1);
    
    expect(result.success).toBe(true);
    expect(result.found).toBe(false);
    expect(result.message).toContain('not completed registration');
  });

  test('should not find non-existent user', async () => {
    const result = await lookupUserByEmailLocal('nonexistent@example.com', 1);
    
    expect(result.success).toBe(true);
    expect(result.found).toBe(false);
    expect(result.message).toContain('No account found');
  });

  test('should add friend successfully', async () => {
    const result = await addFriendLocal(1, 'jane@example.com');
    
    expect(result.success).toBe(true);
    expect(result.isRegistered).toBe(true);
    expect(result.friend.name).toBe('Jane Smith');
    
    // Check localStorage was updated
    const addedFriends = JSON.parse(localStorage.getItem('addedFriends') || '[]');
    expect(addedFriends).toHaveLength(2); // Bidirectional friendship
  });

  test('should send invitation for non-existent user', async () => {
    const result = await addFriendLocal(1, 'newuser@example.com');
    
    expect(result.success).toBe(true);
    expect(result.isRegistered).toBe(false);
    expect(result.message).toContain('Invitation has been sent');
    
    // Check localStorage was updated
    const sentInvitations = JSON.parse(localStorage.getItem('sentInvitations') || '[]');
    expect(sentInvitations).toHaveLength(1);
    expect(sentInvitations[0].email).toBe('newuser@example.com');
  });
});