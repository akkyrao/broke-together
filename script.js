// Global variables
let currentScreen = 'splash-screen';
let currentSlide = 0;
let slideInterval;

// Data structure for the application
let appData = {
  currentUser: {
    id: 1,
    name: 'John',
    email: 'john@example.com',
    profilePic: 'https://via.placeholder.com/40'
  },
  balances: {
    youOwe: 2450,
    owedToYou: 1200,
    totalSpent: 15240,
    monthlySpent: 3450,
    weeklySpent: 850
  },
  friends: [
    {
      id: 2,
      name: 'Sarah',
      profilePic: 'https://via.placeholder.com/40',
      youOwe: 150,
      owesToYou: 0
    },
    {
      id: 3,
      name: 'Mike',
      profilePic: 'https://via.placeholder.com/40',
      youOwe: 0,
      owesToYou: 75
    }
  ],
  groups: [
    {
      id: 1,
      name: 'Roommates',
      icon: '🏠',
      totalSpent: 4200,
      progress: 70
    },
    {
      id: 2,
      name: 'Weekend Trip',
      icon: '🏖️',
      totalSpent: 2100,
      progress: 45
    },
    {
      id: 3,
      name: 'Office Lunch',
      icon: '💼',
      totalSpent: 3800,
      progress: 60
    },
    {
      id: 4,
      name: 'Movie Night',
      icon: '🎬',
      totalSpent: 1500,
      progress: 30
    }
  ],
  recentTransactions: [
    {
      id: 1,
      description: 'Dinner',
      amount: 420,
      date: '2023-05-15',
      paidBy: 'You'
    },
    {
      id: 2,
      description: 'Coffee',
      amount: 45,
      date: '2023-05-14',
      paidBy: 'You'
    },
    {
      id: 3,
      description: 'Groceries',
      amount: 1250,
      date: '2023-05-12',
      paidBy: 'Sarah'
    },
    {
      id: 4,
      description: 'Uber to Mall',
      amount: 600,
      date: '2023-05-10',
      paidBy: 'Mike'
    }
  ],
  notifications: [
    {
      id: 1,
      type: 'payment',
      message: 'Mike paid you ₹75 for Uber to Mall',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'expense',
      message: 'Sarah added "Pizza Night" - You owe ₹150',
      time: '1 day ago'
    }
  ]
};

// Load data from JSON file
function loadDataFromJson() {
    return fetch('/public/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load data.json');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data loaded from JSON file:', data);
            return data;
        })
        .catch(error => {
            console.error('Error loading data from JSON:', error);
            // Return default data if JSON loading fails
            return {
                users: []
            };
        });
}

// Save data to JSON file (in a real app with backend)
function saveDataToJson() {
    // In a real app with a backend, this would make an API call to save the data
    // For this demo, we'll just log that we would save the data
    console.log('Saving data to JSON file:', { users: window.usersData });
    
    // In a real implementation with a backend, we would do something like:
    /*
    return fetch('/api/save-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ users: window.usersData })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save data');
        }
        return response.json();
    })
    .then(result => {
        console.log('Data saved successfully:', result);
        showNotification('Data saved successfully', 'success');
        return result;
    })
    .catch(error => {
        console.error('Error saving data:', error);
        showNotification('Error saving data', 'error');
        throw error;
    });
    */
    
    // For this demo, just show a success notification
    showNotification('User data updated', 'success');
    return Promise.resolve({ success: true });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Load data from JSON before initializing the app
    loadDataFromJson()
        .then(data => {
            // Store users data for CRUD operations
            window.usersData = data.users || [];
            initializeApp();
        });
});

// App initialization
function initializeApp() {
    // Show splash screen for 3 seconds
    setTimeout(() => {
        showScreen('welcome-screen');
        startWelcomeSlideshow();
    }, 3000);
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize auth tabs
    initializeAuthTabs();
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Initialize welcome slides
    initializeWelcomeSlides();
    
    // Load dynamic data
    loadDynamicData();
}

// Function to load dynamic data into the UI
function loadDynamicData() {
    // Update user greeting
    updateUserGreeting();
    
    // Update balance cards
    updateBalanceCards();
    
    // Update friends list
    updateFriendsList();
    
    // Update groups
    updateGroups();
    
    // Update recent transactions
    updateRecentTransactions();
    
    // Update notifications
    updateNotifications();
    
    // Update profile display
    updateProfileDisplay();
}

// Update user greeting
function updateUserGreeting() {
    const greetingElement = document.querySelector('.header-content h1');
    if (greetingElement) {
        greetingElement.textContent = `Hi, ${appData.currentUser.name}!`;
    }
}

// Update balance cards
function updateBalanceCards() {
    // Update "You Owe" card
    const youOweAmount = document.querySelector('.balance-card.owed .amount');
    if (youOweAmount) {
        youOweAmount.textContent = `₹${formatNumber(appData.balances.youOwe)}`;
    }
    
    // Update "Owed to You" card
    const owedToYouAmount = document.querySelector('.balance-card.get-back .amount');
    if (owedToYouAmount) {
        owedToYouAmount.textContent = `₹${formatNumber(appData.balances.owedToYou)}`;
    }
    
    // Update total spent
    const totalSpentAmount = document.querySelector('.stats-card:nth-child(1) .amount');
    if (totalSpentAmount) {
        totalSpentAmount.textContent = `₹${formatNumber(appData.balances.totalSpent)}`;
    }
    
    // Update monthly spent
    const monthlySpentAmount = document.querySelector('.stats-card:nth-child(2) .amount');
    if (monthlySpentAmount) {
        monthlySpentAmount.textContent = `₹${formatNumber(appData.balances.monthlySpent)}`;
    }
    
    // Update weekly spent
    const weeklySpentAmount = document.querySelector('.stats-card:nth-child(3) .amount');
    if (weeklySpentAmount) {
        weeklySpentAmount.textContent = `₹${formatNumber(appData.balances.weeklySpent)}`;
    }
    
    // Update total amount in settlement screen
    const totalAmount = document.querySelector('.total-amount');
    if (totalAmount) {
        totalAmount.textContent = `₹${formatNumber(appData.balances.youOwe)}`;
    }
    
    // Update balance amounts in profile screen
    const balanceAmounts = document.querySelectorAll('.balance-amount');
    if (balanceAmounts.length >= 2) {
        balanceAmounts[0].textContent = `₹${formatNumber(appData.balances.owedToYou)}`;
        balanceAmounts[1].textContent = `₹${formatNumber(appData.balances.youOwe)}`;
    }
}

// Update friends list
function updateFriendsList() {
    const friendsList = document.querySelector('.friends-list');
    if (friendsList) {
        // Clear existing list
        friendsList.innerHTML = '';
        
        // Add friends from data
        appData.friends.forEach(friend => {
            const friendItem = document.createElement('div');
            friendItem.className = 'friend-item';
            
            const balanceClass = friend.youOwe > 0 ? 'negative' : friend.owesToYou > 0 ? 'positive' : '';
            const balanceText = friend.youOwe > 0 ? 
                `You owe ₹${formatNumber(friend.youOwe)}` : 
                friend.owesToYou > 0 ? 
                `Owes you ₹${formatNumber(friend.owesToYou)}` : 
                'Settled up';
            
            friendItem.innerHTML = `
                <div class="friend-info">
                    <img src="${friend.profilePic}" alt="${friend.name}">
                    <h3>${friend.name}</h3>
                </div>
                <span class="balance ${balanceClass}">${balanceText}</span>
            `;
            
            friendsList.appendChild(friendItem);
        });
    }
}

// Update groups
function updateGroups() {
    const groupsList = document.querySelector('.groups-list');
    if (groupsList) {
        // Clear existing list
        groupsList.innerHTML = '';
        
        // Add groups from data
        appData.groups.forEach(group => {
            const groupItem = document.createElement('div');
            groupItem.className = 'group-item';
            groupItem.innerHTML = `
                <div class="group-icon">${group.icon}</div>
                <div class="group-info">
                    <h3>${group.name}</h3>
                    <p>₹${formatNumber(group.totalSpent)}</p>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${group.progress}%"></div>
                    </div>
                </div>
            `;
            
            groupsList.appendChild(groupItem);
        });
    }
}

// Update recent transactions
function updateRecentTransactions() {
    const transactionsList = document.querySelector('.transactions-list');
    if (transactionsList) {
        // Clear existing list
        transactionsList.innerHTML = '';
        
        // Add transactions from data
        appData.recentTransactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            transactionItem.innerHTML = `
                <div class="transaction-info">
                    <h3>${transaction.description}</h3>
                    <p>Paid by ${transaction.paidBy}</p>
                </div>
                <span class="amount">₹${formatNumber(transaction.amount)}</span>
            `;
            
            transactionsList.appendChild(transactionItem);
        });
    }
}

// Update notifications
function updateNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    if (notificationsList) {
        // Clear existing list
        notificationsList.innerHTML = '';
        
        // Add notifications from data
        appData.notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.type}`;
            notificationItem.innerHTML = `
                <div class="notification-icon">
                    <i class="fas ${notification.type === 'payment' ? 'fa-money-bill-wave' : 'fa-receipt'}"></i>
                </div>
                <div class="notification-content">
                    <p>${notification.message}</p>
                    <span class="time">${notification.time}</span>
                </div>
            `;
            
            notificationsList.appendChild(notificationItem);
        });
        
        // Update notification badge
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            notificationBadge.textContent = appData.notifications.length;
        }
    }
}

// Helper function to format numbers with commas
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update the existing updateBalances function
function updateBalances() {
    // This would typically fetch from API
    console.log('Updating balances...');
    
    // For now, just reload our dynamic data
    loadDynamicData();
}

// Screen management
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
    
    // Update navigation active state
    updateNavigationState(screenId);
    
    // Show/hide bottom navigation
    const bottomNav = document.querySelector('.bottom-nav');
    const screensWithoutNav = ['splash-screen', 'welcome-screen', 'auth-screen'];
    
    if (screensWithoutNav.includes(screenId)) {
        bottomNav.style.display = 'none';
    } else {
        bottomNav.style.display = 'flex';
    }
}

// Navigation management
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const screenId = this.getAttribute('data-screen');
            if (screenId) {
                showScreen(screenId);
            }
        });
    });
}

function updateNavigationState(screenId) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-screen') === screenId) {
            button.classList.add('active');
        }
    });
}

// Welcome slides
function initializeWelcomeSlides() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    
    // Add click handlers for indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
        });
    });
}

function startWelcomeSlideshow() {
    slideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % 3;
        showSlide(currentSlide);
    }, 4000);
}

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
            slide.classList.add('active');
        }
    });
    
    indicators.forEach((indicator, i) => {
        indicator.classList.remove('active');
        if (i === index) {
            indicator.classList.add('active');
        }
    });
    
    currentSlide = index;
}

// Auth tabs
function initializeAuthTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabType = this.textContent.toLowerCase().replace(' ', '');
            showAuthTab(tabType);
        });
    });
}

function showAuthTab(tabType) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show selected tab and form
    event.target.classList.add('active');
    document.getElementById(tabType + '-form').classList.add('active');
}

// Form handlers
function initializeFormHandlers() {
    // Expense form
    const expenseForm = document.querySelector('.expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }
    
    // Split method buttons
    const splitButtons = document.querySelectorAll('.split-btn');
    splitButtons.forEach(button => {
        button.addEventListener('click', function() {
            splitButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Payment method buttons
    const methodButtons = document.querySelectorAll('.method-btn');
    methodButtons.forEach(button => {
        button.addEventListener('click', function() {
            methodButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Participant checkboxes
    const participantCheckboxes = document.querySelectorAll('.participant input[type="checkbox"]');
    participantCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSplitCalculation);
    });
}

function handleExpenseSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const description = document.querySelector('#expenseDescription').value;
    const amount = parseFloat(document.querySelector('#expenseAmount').value);
    const paidBy = document.querySelector('#paidBy').value;
    
    // Show loading
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        
        // In a real app, this would send the expense to a server
        // For now, just update our local data
        
        // Add to recent transactions
        appData.recentTransactions.unshift({
            id: Date.now(),
            description: description,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            paidBy: paidBy === 'you' ? 'You' : paidBy
        });
        
        // Update balances based on who paid
        if (paidBy === 'you') {
            // If you paid, others owe you
            appData.balances.owedToYou += amount;
        } else {
            // If someone else paid, you owe them
            appData.balances.youOwe += amount;
        }
        
        // Update total spent
        appData.balances.totalSpent += amount;
        appData.balances.monthlySpent += amount;
        appData.balances.weeklySpent += amount;
        
        // Reload dynamic data
        loadDynamicData();
        
        showSuccessMessage('Expense added successfully!');
        showScreen('dashboard');
    }, 1500);
}

function updateSplitCalculation() {
    const amount = parseFloat(document.querySelector('.amount-input input').value) || 0;
    const checkedParticipants = document.querySelectorAll('.participant input[type="checkbox"]:checked');
    
    if (amount > 0 && checkedParticipants.length > 0) {
        const splitAmount = amount / checkedParticipants.length;
        // Update UI to show split amounts (implementation depends on UI requirements)
        console.log(`Split amount: ₹${splitAmount.toFixed(2)} per person`);
    }
}

// Utility functions
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

function showSuccessMessage(message) {
    // Create and show success toast
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Add toast styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showErrorMessage(message) {
    // Create and show error toast
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Add toast styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--danger-color);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Settlement functions
function handleSettlement(friendId, amount) {
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        showConfetti();
        showSuccessMessage(`Successfully settled ₹${amount} with friend!`);
        updateBalances();
    }, 1500);
}

function showConfetti() {
    const colors = ['#ff6b9d', '#667eea', '#764ba2', '#28a745', '#ffc107'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

function updateBalances() {
    // This would typically fetch from API
    console.log('Updating balances...');
    
    // For now, just reload our dynamic data
    loadDynamicData();
}

// Group management
function showCreateGroup() {
    // Show create group modal/form
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create New Group</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label>Group Name</label>
                    <input type="text" placeholder="e.g., Weekend Trip" id="groupName">
                </div>
                <div class="input-group">
                    <label>Group Icon</label>
                    <div class="icon-picker">
                        <span class="icon-option" onclick="selectIcon(this)">🏖️</span>
                        <span class="icon-option" onclick="selectIcon(this)">🏠</span>
                        <span class="icon-option" onclick="selectIcon(this)">💼</span>
                        <span class="icon-option" onclick="selectIcon(this)">🍕</span>
                        <span class="icon-option" onclick="selectIcon(this)">🎉</span>
                    </div>
                </div>
                <div class="input-group">
                    <label>Add Members</label>
                    <input type="text" placeholder="Search friends..." id="memberSearch">
                    <div class="member-list">
                        <div class="member-item">
                            <img src="https://via.placeholder.com/30" alt="Sarah">
                            <span>Sarah Johnson</span>
                            <button class="add-member-btn">Add</button>
                        </div>
                        <div class="member-item">
                            <img src="https://via.placeholder.com/30" alt="Mike">
                            <span>Mike Chen</span>
                            <button class="add-member-btn">Add</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="createGroup()">Create Group</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: var(--card-background);
        border-radius: var(--border-radius);
        padding: 0;
        max-width: 400px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: var(--shadow);
    `;
}

function logout() {
    showLogoutConfirm();
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
        // Reset step counter
        currentStep = 1;
    }
}

function selectIcon(element) {
    document.querySelectorAll('.icon-option').forEach(icon => {
        icon.classList.remove('selected');
    });
    element.classList.add('selected');
}

function createGroup() {
    const groupName = document.getElementById('groupName').value;
    const selectedIcon = document.querySelector('.icon-option.selected');
    
    if (!groupName) {
        showErrorMessage('Please enter a group name');
        return;
    }
    
    if (!selectedIcon) {
        showErrorMessage('Please select an icon');
        return;
    }
    
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        closeModal();
        showSuccessMessage('Group created successfully!');
        // Refresh groups list
        showScreen('groups');
    }, 1500);
}

// Friend management
function showAddFriend() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add Friend</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label>Search by username or email</label>
                    <input type="text" placeholder="Enter username or email" id="friendSearch">
                </div>
                <div class="search-results">
                    <div class="result-item">
                        <img src="https://via.placeholder.com/40" alt="User">
                        <div class="result-info">
                            <h4>Alex Johnson</h4>
                            <p>@alex_j</p>
                        </div>
                        <button class="btn-primary small">Add</button>
                    </div>
                </div>
                <div class="divider">or</div>
                <div class="input-group">
                    <label>Share your invite link</label>
                    <div class="invite-link">
                        <input type="text" value="https://broke.app/invite/johndoe" readonly>
                        <button class="copy-btn">Copy</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: var(--card-background);
        border-radius: var(--border-radius);
        padding: 0;
        max-width: 400px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: var(--shadow);
    `;
}

// Receipt upload
function handleReceiptUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            showLoading();
            
            // Simulate upload
            setTimeout(() => {
                hideLoading();
                showSuccessMessage('Receipt uploaded successfully!');
                
                // Update UI to show uploaded receipt
                const receiptUpload = document.querySelector('.receipt-upload');
                receiptUpload.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>Receipt uploaded</span>
                `;
                receiptUpload.style.borderColor = 'var(--success-color)';
                receiptUpload.style.color = 'var(--success-color)';
            }, 1500);
        }
    };
    input.click();
}

// Add click handler for receipt upload
document.addEventListener('DOMContentLoaded', function() {
    const receiptUpload = document.querySelector('.receipt-upload');
    if (receiptUpload) {
        receiptUpload.addEventListener('click', handleReceiptUpload);
    }
});

// Settlement handlers
document.addEventListener('DOMContentLoaded', function() {
    // Handle settle buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-settle')) {
            const activityItem = event.target.closest('.activity-item');
            const amountText = activityItem.querySelector('.activity-details p').textContent;
            const amount = amountText.match(/₹(\d+)/)[1];
            
            handleSettlement('friend-id', amount);
        }
        
        if (event.target.classList.contains('btn-pay')) {
            const settleItem = event.target.closest('.settle-item');
            const amount = settleItem.querySelector('.amount').textContent.replace('₹', '');
            
            handleSettlement('friend-id', amount);
        }
        
        if (event.target.classList.contains('btn-remind')) {
            showSuccessMessage('Reminder sent!');
        }
    });
});

// Search functionality
function initializeSearch() {
    const searchInputs = document.querySelectorAll('.search-bar input, #friendSearch, #memberSearch');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            // Implement search logic based on context
            console.log('Searching for:', searchTerm);
        });
    });
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSearch);

// Theme toggle (if needed)
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Load saved theme
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});

// Copy invite link
function copyInviteLink() {
    const inviteLink = document.querySelector('.invite-link input');
    inviteLink.select();
    document.execCommand('copy');
    showSuccessMessage('Invite link copied to clipboard!');
}

// Add event listeners for copy buttons
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('copy-btn')) {
            copyInviteLink();
        }
    });
});

// Handle back button
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('back-btn') || event.target.closest('.back-btn')) {
            const previousScreen = getPreviousScreen();
            showScreen(previousScreen);
        }
    });
});

function getPreviousScreen() {
    // Define navigation history logic
    const screenHistory = {
        'add-expense': 'dashboard',
        'settle-up': 'dashboard',
        'notifications': 'dashboard'
    };
    
    return screenHistory[currentScreen] || 'dashboard';
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Close any open modals
        closeModal();
    }
});

// Add additional animations
function addSlideAnimation(element) {
    element.style.animation = 'slideIn 0.3s ease-out';
}

function addFadeAnimation(element) {
    element.style.animation = 'fadeIn 0.3s ease-out';
}

// PWA support (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Handle network status
window.addEventListener('online', function() {
    showSuccessMessage('Back online!');
});

window.addEventListener('offline', function() {
    showErrorMessage('No internet connection');
});

// Initialize tooltips (if needed)
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const rect = this.getBoundingClientRect();
            tooltip.style.cssText = `
                position: fixed;
                top: ${rect.top - 35}px;
                left: ${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px;
                background: var(--text-primary);
                color: var(--card-background);
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 0.8rem;
                z-index: 10000;
                animation: fadeIn 0.2s ease-out;
            `;
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Initialize tooltips when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTooltips);

// Password validation functions
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    // Update requirement indicators
    updateRequirement('req-length', requirements.length);
    updateRequirement('req-upper', requirements.upper);
    updateRequirement('req-lower', requirements.lower);
    updateRequirement('req-number', requirements.number);
    updateRequirement('req-special', requirements.special);
    
    // Calculate password strength
    const passedCount = Object.values(requirements).filter(Boolean).length;
    const strengthPercentage = (passedCount / 5) * 100;
    
    // Update strength bar
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (strengthFill && strengthText) {
        strengthFill.style.width = strengthPercentage + '%';
        
        if (strengthPercentage <= 20) {
            strengthFill.className = 'strength-fill weak';
            strengthText.textContent = 'Very weak';
        } else if (strengthPercentage <= 40) {
            strengthFill.className = 'strength-fill weak';
            strengthText.textContent = 'Weak';
        } else if (strengthPercentage <= 60) {
            strengthFill.className = 'strength-fill medium';
            strengthText.textContent = 'Medium';
        } else if (strengthPercentage <= 80) {
            strengthFill.className = 'strength-fill good';
            strengthText.textContent = 'Good';
        } else {
            strengthFill.className = 'strength-fill strong';
            strengthText.textContent = 'Very strong';
        }
    }
    
    // Validate password match if confirm password exists
    validatePasswordMatch();
    
    return Object.values(requirements).every(Boolean);
}

function updateRequirement(id, passed) {
    const element = document.getElementById(id);
    if (element) {
        const icon = element.querySelector('i');
        if (passed) {
            element.classList.add('passed');
            icon.className = 'fas fa-check';
        } else {
            element.classList.remove('passed');
            icon.className = 'fas fa-times';
        }
    }
}

function validatePasswordMatch() {
    const password = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('signupConfirmPassword');
    const errorElement = document.getElementById('signupConfirmPasswordError');
    
    if (password && confirmPassword && errorElement) {
        if (confirmPassword.value && password.value !== confirmPassword.value) {
            errorElement.textContent = 'Passwords do not match';
            errorElement.style.display = 'block';
            return false;
        } else {
            errorElement.style.display = 'none';
            return true;
        }
    }
    return true;
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.nextElementSibling;
    const icon = toggleBtn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Login form handler using CRUD operations
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Validate required fields
    if (!email || !password) {
        showNotification('Email and password are required', 'error');
        return false;
    }
    
    // Show loading
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        
        // In a real app, this would validate credentials with a server
        // For now, just simulate a successful login
        
        // In a real implementation, we would fetch the user from a database
        // and verify the password hash. For this demo, we'll create a mock user
        // with only the essential fields (name, user ID, email, password)
        
        // Create a mock user with only essential fields
        const mockUser = {
            id: 1,
            name: 'John',
            username: 'johndoe',
            email: email,
            password: password // In a real app, this would be hashed and verified
        };
        
        // Update current user data using our CRUD operations
        // In a real app, we would fetch the user and verify credentials
        appData.currentUser = mockUser;
        
        // Load dynamic data
        loadDynamicData();
        
        // Show dashboard
        showScreen('dashboard');
    }, 1500);
    
    return false;
}

// Signup form handler using CRUD operations
function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // Validate required fields
    if (!username || !email || !password) {
        showNotification('All fields are required', 'error');
        return false;
    }
    
    // Validate email format
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    // Show loading
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        
        // In a real app, this would register the user with a server
        // For now, just simulate a successful registration
        
        // Use our CRUD createUser function to create a new user with only essential fields
        const newUser = createUser(username, username, email, password);
        
        // Initialize with empty data for a new user
        appData.balances = {
            youOwe: 0,
            owedToYou: 0,
            totalSpent: 0,
            monthlySpent: 0,
            weeklySpent: 0
        };
        appData.friends = [];
        appData.groups = [];
        appData.recentTransactions = [];
        appData.notifications = [];
        
        // Add default profile pic (not part of essential fields but needed for UI)
        appData.currentUser.profilePic = 'https://via.placeholder.com/40';
        
        // Load dynamic data
        loadDynamicData();
        
        // Show dashboard
        showScreen('dashboard');
        
        // Show success message
        showNotification('Account created successfully!', 'success');
    }, 1500);
    
    return false;
}

// Forgot password modal
function showForgotPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Reset Password</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p>Enter your email address and we'll send you a link to reset your password.</p>
                <form id="forgotPasswordForm" onsubmit="return handleForgotPassword(event)">
                    <div class="input-group">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="forgotEmail" placeholder="Enter your email address" required>
                        <div class="input-error" id="forgotEmailError"></div>
                    </div>
                    <button type="submit" class="btn-primary">Send Reset Link</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: var(--card-background);
        border-radius: var(--border-radius);
        max-width: 400px;
        width: 90%;
        box-shadow: var(--shadow);
    `;
}

// Handle forgot password
function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    const errorElement = document.getElementById('forgotEmailError');
    
    // Clear previous errors
    errorElement.style.display = 'none';
    
    // Validate email
    if (!validateEmail(email)) {
        showFieldError('forgotEmailError', 'Please enter a valid email address');
        return false;
    }
    
    // Show loading
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        closeModal();
        showSuccessMessage('Password reset link sent to your email!');
    }, 1500);
    
    return false;
}

// Utility functions
function showFieldError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function clearErrors(errorIds) {
    errorIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Create Group Modal
function showCreateGroupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create New Group</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="creation-steps">
                    <div class="step active" data-step="1">
                        <div class="step-number">1</div>
                        <span>Group Details</span>
                    </div>
                    <div class="step" data-step="2">
                        <div class="step-number">2</div>
                        <span>Add Friends</span>
                    </div>
                    <div class="step" data-step="3">
                        <div class="step-number">3</div>
                        <span>Review</span>
                    </div>
                </div>
                
                <form id="createGroupForm">
                    <!-- Step 1: Group Details -->
                    <div class="step-content active" id="step1">
                        <div class="input-group">
                            <label>Group Name <span class="required">*</span></label>
                            <input type="text" id="groupName" placeholder="e.g., Weekend Trip, Office Lunch, Flatmates" required>
                            <small class="input-hint">Choose a name that describes your group</small>
                        </div>
                        
                        <div class="input-group">
                            <label>Choose Group Icon <span class="required">*</span></label>
                            <div class="icon-picker">
                                <span class="icon-option" onclick="selectIcon(this)" data-icon="🏖️" title="Vacation">🏖️</span>
                                <span class="icon-option" onclick="selectIcon(this)" data-icon="🏠" title="Home">🏠</span>
                                <span class="icon-option" onclick="selectIcon(this)" data-icon="💼" title="Work">💼</span>
                                <span class="icon-option" onclick="selectIcon(this)" data-icon="🍕" title="Food">🍕</span>
                                <span class="icon-option" onclick="selectIcon(this)" data-icon="🎉" title="Party">🎉</span>
                                <span class="icon-option" onclick="selectIcon(this)" data-icon="🚗" title="Travel">🚗</span>
                                <span class="icon-option" onclick="selectIcon(this)" data-icon="🎬" title="Entertainment">🎬</span>
                                <span class="icon-option" onclick="selectIcon(this)" data-icon="🏋️" title="Sports">🏋️</span>
                                <span class="icon-option" onclick="selectIcon(this)" data-icon="🎓" title="Education">🎓</span>
                                <span class="icon-option" onclick="selectIcon(this)" data-icon="🛍️" title="Shopping">🛍️</span>
                                <span class="icon-option" onclick="selectIcon(this)" data-icon="🏥" title="Health">🏥</span>
                                <span class="icon-option" onclick="selectIcon(this)" data-icon="✈️" title="Trip">✈️</span>
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label>Group Description (Optional)</label>
                            <textarea id="groupDescription" placeholder="Brief description of your group..." rows="3"></textarea>
                        </div>
                    </div>
                    
                    <!-- Step 2: Add Friends -->
                    <div class="step-content" id="step2">
                        <div class="input-group">
                            <label>Add Friends to Group <span class="required">*</span></label>
                            <div class="friend-search">
                                <i class="fas fa-search"></i>
                                <input type="text" id="friendSearch" placeholder="Search friends by name..." onkeyup="searchFriends(this.value)">
                            </div>
                        </div>
                        
                        <div class="friends-container">
                            <div class="friends-list" id="friendsList">
                                <div class="friend-item" onclick="toggleFriend(this)">
                                    <img src="https://i.ibb.co/bjKGNZFB/Screenshot-1404-04-23-at-17-28-19.png" alt="Sarah">
                                    <div class="friend-details">
                                        <span class="friend-name">Sarah Johnson</span>
                                        <small class="friend-email">sarah.j@email.com</small>
                                    </div>
                                    <div class="friend-checkbox">
                                        <input type="checkbox" id="friend-sarah">
                                        <label for="friend-sarah"></label>
                                    </div>
                                </div>
                                <div class="friend-item" onclick="toggleFriend(this)">
                                    <img src="https://i.ibb.co/bjKGNZFB/Screenshot-1404-04-23-at-17-28-19.png" alt="Mike">
                                    <div class="friend-details">
                                        <span class="friend-name">Mike Chen</span>
                                        <small class="friend-email">mike.chen@email.com</small>
                                    </div>
                                    <div class="friend-checkbox">
                                        <input type="checkbox" id="friend-mike">
                                        <label for="friend-mike"></label>
                                    </div>
                                </div>
                                <div class="friend-item" onclick="toggleFriend(this)">
                                    <img src="https://i.ibb.co/bjKGNZFB/Screenshot-1404-04-23-at-17-28-19.png" alt="Jenny">
                                    <div class="friend-details">
                                        <span class="friend-name">Jenny Wilson</span>
                                        <small class="friend-email">jenny.w@email.com</small>
                                    </div>
                                    <div class="friend-checkbox">
                                        <input type="checkbox" id="friend-jenny">
                                        <label for="friend-jenny"></label>
                                    </div>
                                </div>
                                <div class="friend-item" onclick="toggleFriend(this)">
                                    <img src="https://i.ibb.co/bjKGNZFB/Screenshot-1404-04-23-at-17-28-19.png" alt="Alex">
                                    <div class="friend-details">
                                        <span class="friend-name">Alex Johnson</span>
                                        <small class="friend-email">alex.j@email.com</small>
                                    </div>
                                    <div class="friend-checkbox">
                                        <input type="checkbox" id="friend-alex">
                                        <label for="friend-alex"></label>
                                    </div>
                                </div>
                                <div class="friend-item" onclick="toggleFriend(this)">
                                    <img src="https://i.ibb.co/bjKGNZFB/Screenshot-1404-04-23-at-17-28-19.png" alt="Emma">
                                    <div class="friend-details">
                                        <span class="friend-name">Emma Davis</span>
                                        <small class="friend-email">emma.d@email.com</small>
                                    </div>
                                    <div class="friend-checkbox">
                                        <input type="checkbox" id="friend-emma">
                                        <label for="friend-emma"></label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="selected-friends" id="selectedFriends">
                            <h4>Selected Friends (<span id="selectedCount">0</span>):</h4>
                            <div class="selected-list" id="selectedList"></div>
                        </div>
                    </div>
                    
                    <!-- Step 3: Review -->
                    <div class="step-content" id="step3">
                        <div class="review-section">
                            <h4>Review Group Details</h4>
                            <div class="review-card">
                                <div class="review-header">
                                    <div class="review-icon" id="reviewIcon">🏖️</div>
                                    <div class="review-info">
                                        <h3 id="reviewName">Group Name</h3>
                                        <p id="reviewDescription">Group Description</p>
                                    </div>
                                </div>
                                <div class="review-members">
                                    <h5>Members (<span id="reviewMemberCount">1</span>):</h5>
                                    <div class="member-avatars" id="reviewMembers">
                                        <div class="member-avatar">
                                            <img src="https://i.ibb.co/bjKGNZFB/Screenshot-1404-04-23-at-17-28-19.png" alt="You">
                                            <span>You</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-secondary" id="prevBtn" onclick="previousStep()" style="display: none;">Previous</button>
                <button class="btn-primary" id="nextBtn" onclick="nextStep()">Next</button>
                <button class="btn-primary" id="createBtn" onclick="createNewGroup()" style="display: none;">Create Group</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: var(--card-background);
        border-radius: var(--border-radius);
        padding: 0;
        max-width: 450px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: var(--shadow);
    `;
    
    updateSelectedFriends();
    updateStepButtons();
}

// Step Navigation
let currentStep = 1;

function nextStep() {
    if (validateCurrentStep()) {
        currentStep++;
        showStep(currentStep);
        updateStepButtons();
        
        if (currentStep === 3) {
            updateReviewSection();
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateStepButtons();
    }
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step-content').forEach(s => s.classList.remove('active'));
    
    // Show current step
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
    document.getElementById(`step${step}`).classList.add('active');
    
    currentStep = step;
}

function updateStepButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const createBtn = document.getElementById('createBtn');
    
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
        createBtn.style.display = 'none';
    } else if (currentStep === 2) {
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
        createBtn.style.display = 'none';
    } else if (currentStep === 3) {
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
        createBtn.style.display = 'inline-block';
    }
}

function validateCurrentStep() {
    if (currentStep === 1) {
        const groupName = document.getElementById('groupName').value.trim();
        const selectedIcon = document.querySelector('.icon-option.selected');
        
        if (!groupName) {
            showErrorMessage('Please enter a group name');
            return false;
        }
        
        if (!selectedIcon) {
            showErrorMessage('Please select an icon for your group');
            return false;
        }
        
        return true;
    } else if (currentStep === 2) {
        const selectedFriends = document.querySelectorAll('.friend-item input[type="checkbox"]:checked');
        
        if (selectedFriends.length === 0) {
            showErrorMessage('Please select at least one friend');
            return false;
        }
        
        return true;
    }
    
    return true;
}

function updateReviewSection() {
    const groupName = document.getElementById('groupName').value.trim();
    const groupDescription = document.getElementById('groupDescription').value.trim();
    const selectedIcon = document.querySelector('.icon-option.selected');
    const selectedFriends = document.querySelectorAll('.friend-item input[type="checkbox"]:checked');
    
    // Update review content
    document.getElementById('reviewName').textContent = groupName;
    document.getElementById('reviewDescription').textContent = groupDescription || 'No description provided';
    document.getElementById('reviewIcon').textContent = selectedIcon ? selectedIcon.dataset.icon : '🏖️';
    document.getElementById('reviewMemberCount').textContent = selectedFriends.length + 1;
    
    // Update member avatars
    const reviewMembers = document.getElementById('reviewMembers');
    reviewMembers.innerHTML = `
        <div class="member-avatar">
            <img src="https://i.ibb.co/bjKGNZFB/Screenshot-1404-04-23-at-17-28-19.png" alt="You">
            <span>You</span>
        </div>
    `;
    
    selectedFriends.forEach(checkbox => {
        const friendItem = checkbox.closest('.friend-item');
        const friendName = friendItem.querySelector('.friend-name').textContent;
        const friendImg = friendItem.querySelector('img').src;
        
        const memberAvatar = document.createElement('div');
        memberAvatar.className = 'member-avatar';
        memberAvatar.innerHTML = `
            <img src="${friendImg}" alt="${friendName}">
            <span>${friendName.split(' ')[0]}</span>
        `;
        reviewMembers.appendChild(memberAvatar);
    });
}

// Toggle friend selection
function toggleFriend(element) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    element.classList.toggle('selected', checkbox.checked);
    updateSelectedFriends();
}

// Update selected friends display
function updateSelectedFriends() {
    const selectedList = document.getElementById('selectedList');
    const selectedFriends = document.getElementById('selectedFriends');
    const selectedCount = document.getElementById('selectedCount');
    const checkboxes = document.querySelectorAll('.friend-item input[type="checkbox"]:checked');
    
    if (selectedCount) {
        selectedCount.textContent = checkboxes.length;
    }
    
    if (checkboxes.length > 0) {
        selectedFriends.style.display = 'block';
        selectedList.innerHTML = '';
        
        checkboxes.forEach(checkbox => {
            const friendItem = checkbox.closest('.friend-item');
            const friendName = friendItem.querySelector('.friend-name').textContent;
            const friendImg = friendItem.querySelector('img').src;
            
            const selectedTag = document.createElement('div');
            selectedTag.className = 'selected-tag';
            selectedTag.innerHTML = `
                <img src="${friendImg}" alt="${friendName}">
                <span>${friendName}</span>
                <button onclick="removeFriend('${checkbox.id}')" type="button">&times;</button>
            `;
            selectedList.appendChild(selectedTag);
        });
    } else {
        selectedFriends.style.display = 'none';
    }
}

// Remove friend from selection
function removeFriend(checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    checkbox.checked = false;
    const friendItem = checkbox.closest('.friend-item');
    friendItem.classList.remove('selected');
    updateSelectedFriends();
}

// Search friends
function searchFriends(query) {
    const friendItems = document.querySelectorAll('.friend-item');
    
    friendItems.forEach(item => {
        const friendName = item.querySelector('span').textContent.toLowerCase();
        if (friendName.includes(query.toLowerCase())) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Select icon for group
function selectIcon(element) {
    // Remove selected class from all icons
    document.querySelectorAll('.icon-option').forEach(icon => {
        icon.classList.remove('selected');
    });
    
    // Add selected class to clicked icon
    element.classList.add('selected');
}

// Create new group
function createNewGroup() {
    const groupName = document.getElementById('groupName').value.trim();
    const selectedIcon = document.querySelector('.icon-option.selected');
    const selectedFriends = document.querySelectorAll('.friend-item input[type="checkbox"]:checked');
    
    // Validation
    if (!groupName) {
        showErrorMessage('Please enter a group name');
        return;
    }
    
    if (!selectedIcon) {
        showErrorMessage('Please select an icon for your group');
        return;
    }
    
    if (selectedFriends.length === 0) {
        showErrorMessage('Please select at least one friend');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        closeModal();
        
        // Add the new group to the groups list
        addGroupToList(groupName, selectedIcon.dataset.icon, selectedFriends.length);
        
        showSuccessMessage(`Group "${groupName}" created successfully!`);
        showScreen('groups');
    }, 1500);
}

// Add group to the groups list
function addGroupToList(groupName, icon, memberCount) {
    const groupsList = document.querySelector('.groups-list');
    
    const newGroup = document.createElement('div');
    newGroup.className = 'group-card';
    newGroup.innerHTML = `
        <div class="group-header">
            <div class="group-icon">
                <span style="font-size: 2rem;">${icon}</span>
            </div>
            <div class="group-info">
                <h3>${groupName}</h3>
                <p>${memberCount + 1} members</p>
            </div>
            <div class="group-balance">
                <span class="balance settled">New</span>
            </div>
        </div>
        <div class="group-activity">
            <span>Last activity: Group created</span>
        </div>
    `;
    
    groupsList.insertBefore(newGroup, groupsList.firstChild);
}

// Profile Management Functions
let isEditMode = false;

// Toggle between view and edit mode
function toggleEditMode() {
    const profileView = document.getElementById('profile-view');
    const profileEdit = document.getElementById('profile-edit');
    const editBtn = document.querySelector('.edit-btn');
    
    if (!isEditMode) {
        // Switch to edit mode
        profileView.style.display = 'none';
        profileEdit.style.display = 'block';
        editBtn.innerHTML = '<i class="fas fa-times"></i>';
        isEditMode = true;
        
        // Load current data into form
        loadProfileData();
    } else {
        // Switch to view mode
        cancelEdit();
    }
}

// Load current profile data into edit form
// CRUD Operations for User Data (only name, user ID, password, and email)

// Create - Create a new user with only essential fields
function createUser(name, username, email, password) {
    // In a real app, this would send data to a server
    // For now, just simulate creating a user locally
    const newUser = {
        id: generateUserId(), // Function to generate unique ID
        name: name,
        username: username,
        email: email,
        password: password // In a real app, this would be hashed
    };
    
    // Store the new user in our JSON data
    window.usersData.push(newUser);
    
    // Also update appData for current session
    appData.currentUser = newUser;
    
    // Save changes to JSON
    saveDataToJson();
    
    console.log('User added to JSON data:', newUser);
    
    return newUser;
}

// Read - Get user data with only essential fields
function getUser(userId) {
    // First check in our JSON data
    const userFromJson = window.usersData.find(user => user.id === userId);
    
    if (userFromJson) {
        // Return only the essential fields from JSON data
        return {
            id: userFromJson.id,
            name: userFromJson.name,
            username: userFromJson.username,
            email: userFromJson.email
            // Note: password is not returned for security reasons
        };
    }
    
    // Fallback to appData if not found in JSON
    if (appData.currentUser && appData.currentUser.id === userId) {
        // Return only the essential fields
        return {
            id: appData.currentUser.id,
            name: appData.currentUser.name,
            username: appData.currentUser.username,
            email: appData.currentUser.email
            // Note: password is not returned for security reasons
        };
    }
    
    return null; // User not found
}

// Update - Update user data with only essential fields
function updateUser(userId, updates) {
    // First try to find and update in JSON data
    const userIndex = window.usersData.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
        // Only update the allowed fields in JSON data
        if (updates.name) window.usersData[userIndex].name = updates.name;
        if (updates.username) window.usersData[userIndex].username = updates.username;
        if (updates.email) window.usersData[userIndex].email = updates.email;
        if (updates.password) window.usersData[userIndex].password = updates.password; // In real app, would be hashed
        
        // Save changes to JSON
        saveDataToJson();
        
        console.log('Updated user in JSON data:', window.usersData[userIndex]);
        
        // If this is also the current user, update appData
        if (appData.currentUser && appData.currentUser.id === userId) {
            if (updates.name) appData.currentUser.name = updates.name;
            if (updates.username) appData.currentUser.username = updates.username;
            if (updates.email) appData.currentUser.email = updates.email;
            if (updates.password) appData.currentUser.password = updates.password;
            
            // Update UI if needed
            updateProfileDisplay();
        }
        
        return true; // Update successful
    }
    
    // Fallback to appData if not found in JSON
    if (appData.currentUser && appData.currentUser.id === userId) {
        // Only update the allowed fields
        if (updates.name) appData.currentUser.name = updates.name;
        if (updates.username) appData.currentUser.username = updates.username;
        if (updates.email) appData.currentUser.email = updates.email;
        if (updates.password) appData.currentUser.password = updates.password; // In real app, would be hashed
        
        // Update UI if needed
        updateProfileDisplay();
        
        return true; // Update successful
    }
    
    return false; // User not found
}

// Delete - Delete a user
function deleteUser(userId) {
    // First try to find and delete from JSON data
    const userIndex = window.usersData.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
        // Remove from JSON data
        const deletedUser = window.usersData.splice(userIndex, 1)[0];
        
        // Save changes to JSON
        saveDataToJson();
        
        console.log('Deleted user from JSON data:', deletedUser);
        
        // If this is also the current user, clear appData
        if (appData.currentUser && appData.currentUser.id === userId) {
            // Clear user data
            appData.currentUser = {};
            
            // In a real app, you might redirect to login screen
            showScreen('login-screen');
        }
        
        return true; // Delete successful
    }
    
    // Fallback to appData if not found in JSON
    if (appData.currentUser && appData.currentUser.id === userId) {
        // Clear user data
        appData.currentUser = {};
        
        // In a real app, you might redirect to login screen
        showScreen('login-screen');
        
        return true; // Delete successful
    }
    
    return false; // User not found
}

// Helper function to generate a unique user ID
function generateUserId() {
    // Find the highest ID in the JSON data
    let highestId = 0;
    
    if (window.usersData && window.usersData.length > 0) {
        highestId = window.usersData.reduce((max, user) => {
            return user.id > max ? user.id : max;
        }, 0);
    }
    
    // Return the next ID (highest + 1)
    return highestId + 1;
}

// Modified loadProfileData to use our CRUD operations
function loadProfileData() {
    // Get current user data using our Read operation
    const userData = appData.currentUser ? getUser(appData.currentUser.id) : null;
    
    // Use userData if available, otherwise fall back to display elements
    const name = userData ? userData.name : document.getElementById('display-name').textContent;
    const username = userData ? userData.username : 
                    document.getElementById('display-username').textContent.substring(1); // Remove @
    const email = userData ? userData.email : document.getElementById('display-email').textContent;
    
    // Set values in the form
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-username').value = username;
    document.getElementById('edit-email').value = email;
    
    // For fields not in our CRUD operations, fall back to original method
    const phone = appData.currentUser.phone || document.getElementById('display-phone').textContent;
    const bio = appData.currentUser.bio || document.getElementById('display-bio').textContent;
    document.getElementById('edit-phone').value = phone;
    document.getElementById('edit-bio').value = bio;
}

// Cancel edit mode
function cancelEdit() {
    const profileView = document.getElementById('profile-view');
    const profileEdit = document.getElementById('profile-edit');
    const editBtn = document.querySelector('.edit-btn');
    
    profileView.style.display = 'block';
    profileEdit.style.display = 'none';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    isEditMode = false;
    
    // Clear any error messages
    clearProfileErrors();
}

// Clear all profile validation errors
function clearProfileErrors() {
    const errorElements = ['nameError', 'usernameError', 'emailError', 'phoneError'];
    errorElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    });
}

// Show error message
function showProfileError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Hide error message
function hideProfileError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// Validate username
function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    
    // Clear previous errors
    hideProfileError('usernameError');
    
    if (username.length < 3) {
        showProfileError('usernameError', 'Username must be at least 3 characters long');
        return false;
    }
    
    if (username.length > 30) {
        showProfileError('usernameError', 'Username must be less than 30 characters');
        return false;
    }
    
    if (!usernameRegex.test(username)) {
        showProfileError('usernameError', 'Username can only contain letters, numbers, and underscores');
        return false;
    }
    
    // Check if username is already taken (simulated)
    const reservedUsernames = ['admin', 'broke', 'together', 'system', 'support'];
    if (reservedUsernames.includes(username.toLowerCase())) {
        showProfileError('usernameError', 'This username is not available');
        return false;
    }
    
    return true;
}

// Validate email
function validateProfileEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Clear previous errors
    hideProfileError('emailError');
    
    if (!emailRegex.test(email)) {
        showProfileError('emailError', 'Please enter a valid email address');
        return false;
    }
    
    return true;
}

// Validate phone number
function validatePhone(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    
    // Clear previous errors
    hideProfileError('phoneError');
    
    // Remove spaces and dashes for validation
    const cleanPhone = phone.replace(/[\s-]/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
        showProfileError('phoneError', 'Please enter a valid phone number with country code');
        return false;
    }
    
    if (cleanPhone.length < 10) {
        showProfileError('phoneError', 'Phone number is too short');
        return false;
    }
    
    if (cleanPhone.length > 15) {
        showProfileError('phoneError', 'Phone number is too long');
        return false;
    }
    
    return true;
}

// Update bio character counter
function updateBioCounter(bio) {
    const counter = document.getElementById('bioCounter');
    if (counter) {
        counter.textContent = bio.length;
        
        // Change color when approaching limit
        if (bio.length > 120) {
            counter.style.color = '#ff6b6b';
        } else if (bio.length > 100) {
            counter.style.color = '#ffa726';
        } else {
            counter.style.color = '#757575';
        }
    }
}

// Handle avatar change
function changeAvatar() {
    document.getElementById('avatarInput').click();
}

// Preview new avatar
function previewAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarImg = document.querySelector('#profile-edit .profile-avatar');
            if (avatarImg) {
                avatarImg.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
}

// Handle profile update form submission using CRUD operations
function handleProfileUpdate(event) {
    event.preventDefault();
    
    // Get form values - focus on essential fields
    const name = document.getElementById('edit-name').value.trim();
    const username = document.getElementById('edit-username').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    // Get non-essential fields for UI updates
    const phone = document.getElementById('edit-phone').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    
    // Clear previous errors
    clearProfileErrors();
    
    let isValid = true;
    
    // Validate name
    if (name.length < 2) {
        showProfileError('nameError', 'Name must be at least 2 characters long');
        isValid = false;
    } else if (name.length > 50) {
        showProfileError('nameError', 'Name must be less than 50 characters');
        isValid = false;
    }
    
    // Validate username
    if (!validateUsername(username)) {
        isValid = false;
    }
    
    // Validate email
    if (!validateProfileEmail(email)) {
        isValid = false;
    }
    
    // Validate phone (non-essential but still in UI)
    if (!validatePhone(phone)) {
        isValid = false;
    }
    
    if (!isValid) {
        return false;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Create update object with only essential fields
        const userUpdates = {
            name: name,
            username: username,
            email: email
            // Note: password is not updated here as it would require separate flow with current password verification
        };
        
        // Use our CRUD update operation
        if (appData.currentUser && appData.currentUser.id) {
            // Update essential fields using CRUD operation
            updateUser(appData.currentUser.id, userUpdates);
            
            // Update non-essential fields directly (not part of CRUD)
            appData.currentUser.phone = phone;
            appData.currentUser.bio = bio;
            
            // Update display values
            document.getElementById('display-name').textContent = name;
            document.getElementById('display-username').textContent = '@' + username;
            document.getElementById('display-email').textContent = email;
            document.getElementById('display-phone').textContent = phone;
            
            // Update avatar if changed
            const avatarInput = document.getElementById('avatarInput');
            if (avatarInput.files.length > 0) {
                const newAvatarSrc = document.querySelector('#profile-edit .profile-avatar').src;
                document.querySelector('#profile-view .profile-avatar').src = newAvatarSrc;
                appData.currentUser.profilePic = newAvatarSrc;
            }
            
            // Update user greeting on dashboard
            updateUserGreeting();
            
            // Show success message
            showNotification('Profile updated successfully!', 'success');
        } else {
            // User not found
            showNotification('Error updating profile. User not found.', 'error');
        }
        
        // Reset form
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Switch back to view mode
        cancelEdit();
        
    }, 1500);
    
    return false;
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Update profile display with user data using CRUD operations
function updateProfileDisplay() {
    // Get only essential user data using our CRUD Read operation
    const userData = appData.currentUser && appData.currentUser.id ? 
                    getUser(appData.currentUser.id) : null;
    
    if (!userData) return; // No user data available
    
    // Update profile header with essential fields only
    const displayName = document.getElementById('display-name');
    const displayUsername = document.getElementById('display-username');
    const displayEmail = document.getElementById('display-email');
    
    if (displayName && userData.name) {
        displayName.textContent = userData.name;
    }
    
    if (displayUsername && userData.username) {
        displayUsername.textContent = '@' + userData.username;
    } else if (displayUsername && userData.name) {
        // Create username from name if not available
        const username = userData.name.toLowerCase().replace(/\s+/g, '');
        displayUsername.textContent = '@' + username;
    }
    
    if (displayEmail && userData.email) {
        displayEmail.textContent = userData.email;
    }
    
    // Update profile avatar if available (not part of essential fields but needed for UI)
    const profileAvatar = document.querySelector('.profile-header .profile-avatar');
    if (profileAvatar && appData.currentUser.profilePic) {
        profileAvatar.src = appData.currentUser.profilePic;
    }
}

// Demonstrate CRUD operations with essential fields only
function demonstrateCrudOperations() {
    console.log('Demonstrating CRUD operations with essential fields only');
    console.log('Current users in JSON data:', window.usersData);
    
    // CREATE - Create a new user with only essential fields
    console.log('\n1. Creating a new user with essential fields only...');
    const newUser = createUser('Jane Doe', 'janedoe', 'jane@example.com', 'securepassword123');
    console.log('User created:', newUser);
    console.log('Updated users in JSON data:', window.usersData);
    
    // READ - Get user data with only essential fields
    console.log('\n2. Reading user data with essential fields only...');
    const userData = getUser(newUser.id);
    console.log('User data retrieved:', userData);
    console.log('Note: Password is not returned for security reasons');
    
    // UPDATE - Update user data with only essential fields
    console.log('\n3. Updating user data with essential fields only...');
    const updates = {
        name: 'Jane Smith',
        email: 'janesmith@example.com'
    };
    const updateResult = updateUser(newUser.id, updates);
    console.log('Update successful:', updateResult);
    console.log('Updated users in JSON data:', window.usersData);
    
    // READ AGAIN - Verify the update
    console.log('\n4. Reading updated user data...');
    const updatedUserData = getUser(newUser.id);
    console.log('Updated user data:', updatedUserData);
    
    // DELETE - Delete the user
    console.log('\n5. Deleting user...');
    const deleteResult = deleteUser(newUser.id);
    console.log('Delete successful:', deleteResult);
    console.log('Updated users in JSON data after deletion:', window.usersData);
    
    console.log('\nCRUD operations demonstration complete');
    return 'CRUD operations demonstration complete';
}

// Function to select and display only essential user fields (name, user ID, password, email)
function selectEssentialUserFields(userId) {
    // First try to find user in JSON data
    const userFromJson = window.usersData.find(user => user.id === userId);
    
    // If found in JSON data, use that
    let user = userFromJson;
    
    // If not found in JSON, try appData
    if (!user) {
        user = appData.currentUser && appData.currentUser.id === userId ? 
                    appData.currentUser : null;
    }
    
    if (!user) {
        console.error('User not found');
        return null;
    }
    
    // Select only the essential fields
    const essentialFields = {
        id: user.id,
        name: user.name,
        username: user.username || '',
        email: user.email,
        password: '********' // Password is masked for security
    };
    
    // Display the essential fields (for demonstration)
    console.log('Essential User Fields:');
    console.log('User ID:', essentialFields.id);
    console.log('Name:', essentialFields.name);
    console.log('Username:', essentialFields.username);
    console.log('Email:', essentialFields.email);
    console.log('Password:', essentialFields.password);
    
    return essentialFields;
}

// Function to show settings screen
function showSettings() {
    showScreen('settings-screen');
    
    // Initialize theme toggle based on current theme
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = document.body.classList.contains('dark-theme');
        
        // Add event listener for theme toggle
        themeToggle.addEventListener('change', function() {
            toggleTheme();
        });
    }
}

// Export functions for global use
window.showScreen = showScreen;
window.showAuthTab = showAuthTab;
window.showCreateGroup = showCreateGroup;
window.showCreateGroupModal = showCreateGroupModal;
window.showAddFriend = showAddFriend;
window.closeModal = closeModal;
window.selectIcon = selectIcon;
window.createGroup = createGroup;
window.createNewGroup = createNewGroup;
window.toggleFriend = toggleFriend;
window.removeFriend = removeFriend;
window.searchFriends = searchFriends;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.validatePassword = validatePassword;
window.validatePasswordMatch = validatePasswordMatch;
window.togglePassword = togglePassword;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.showForgotPasswordModal = showForgotPasswordModal;
window.handleForgotPassword = handleForgotPassword;
window.toggleTheme = toggleTheme;
window.toggleEditMode = toggleEditMode;
window.cancelEdit = cancelEdit;
window.validateUsername = validateUsername;
window.validateEmail = validateProfileEmail;
window.validatePhone = validatePhone;
window.updateBioCounter = updateBioCounter;
window.changeAvatar = changeAvatar;
window.previewAvatar = previewAvatar;
window.handleProfileUpdate = handleProfileUpdate;
window.changeCover = changeCover;
window.previewCover = previewCover;
window.shareProfile = shareProfile;
window.showNotificationSettings = showNotificationSettings;
window.showPrivacySettings = showPrivacySettings;
window.showThemeSettings = showThemeSettings;
window.showHelpCenter = showHelpCenter;
window.rateApp = rateApp;
window.showLogoutConfirm = showLogoutConfirm;
window.logout = logout;
window.selectEssentialUserFields = selectEssentialUserFields;
window.demonstrateCrudOperations = demonstrateCrudOperations;
window.showSettings = showSettings;

// Additional profile functions
function changeCover() {
    document.getElementById('coverInput').click();
}

function previewCover(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select a valid image file', 'error');
            return;
        }
        
        // Validate file size (max 10MB for cover)
        if (file.size > 10 * 1024 * 1024) {
            showNotification('Cover image size must be less than 10MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const coverElement = document.querySelector('.profile-cover');
            if (coverElement) {
                coverElement.style.backgroundImage = `url(${e.target.result})`;
                coverElement.style.backgroundSize = 'cover';
                coverElement.style.backgroundPosition = 'center';
            }
        };
        reader.readAsDataURL(file);
        
        showNotification('Cover photo updated successfully!', 'success');
    }
}

function shareProfile() {
    if (navigator.share) {
        navigator.share({
            title: 'Check out my Broke Together profile!',
            text: 'Join me on Broke Together for easy expense splitting with friends!',
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback for browsers that don't support Web Share API
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Profile link copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Could not copy link', 'error');
        });
    }
}

function showNotificationSettings() {
    showNotification('Notification settings coming soon!', 'info');
}

function showPrivacySettings() {
    showNotification('Privacy settings coming soon!', 'info');
}

function showThemeSettings() {
    // Simple theme toggle for now
    const isDark = document.body.classList.contains('dark-theme');
    if (isDark) {
        document.body.classList.remove('dark-theme');
        showNotification('Switched to light theme', 'success');
    } else {
        document.body.classList.add('dark-theme');
        showNotification('Switched to dark theme', 'success');
    }
}

function showHelpCenter() {
    showNotification('Help center coming soon!', 'info');
}

function rateApp() {
    // Create rating modal
    const modal = document.createElement('div');
    modal.className = 'modal rating-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Rate Broke Together</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p>How would you rate your experience with Broke Together?</p>
                <div class="star-rating">
                    <span class="star" data-rating="1">⭐</span>
                    <span class="star" data-rating="2">⭐</span>
                    <span class="star" data-rating="3">⭐</span>
                    <span class="star" data-rating="4">⭐</span>
                    <span class="star" data-rating="5">⭐</span>
                </div>
                <textarea placeholder="Tell us what you think..." id="reviewText"></textarea>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="submitRating()">Submit Rating</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click handlers for stars
    const stars = modal.querySelectorAll('.star');
    let selectedRating = 0;
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            stars.forEach((s, i) => {
                if (i < selectedRating) {
                    s.style.color = '#ffc107';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });
    });
    
    // Submit rating function
    window.submitRating = function() {
        if (selectedRating === 0) {
            showNotification('Please select a rating', 'error');
            return;
        }
        
        const review = document.getElementById('reviewText').value;
        
        // Simulate API call
        setTimeout(() => {
            closeModal();
            showNotification(`Thank you for your ${selectedRating}-star rating!`, 'success');
        }, 1000);
    };
    
    // Style the modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
}

function showLogoutConfirm() {
    const modal = document.createElement('div');
    modal.className = 'modal logout-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Confirm Logout</h3>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to log out of your account?</p>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-danger" onclick="confirmLogout()">Logout</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    window.confirmLogout = function() {
        showLoading();
        setTimeout(() => {
            hideLoading();
            closeModal();
            showNotification('Logged out successfully', 'success');
            // Redirect to auth screen
            setTimeout(() => {
                showScreen('auth-screen');
            }, 1000);
        }, 1500);
    };
    
    // Style the modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
}

function logout() {
    showLogoutConfirm();
}