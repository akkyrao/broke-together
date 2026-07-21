# Broke Together - Expense Tracking App

A social-first expense tracking app built to remove the awkwardness of splitting bills among friends. Whether it's a trip, a party, or daily chai, the app helps users track, split, and settle shared expenses.

## 🚀 Features

### ✅ Implemented
- **User Authentication** - Login/Signup with email and Google OAuth
- **Dashboard** - Overview of balances, recent activity, and quick actions
- **Expense Management** - Add, track, and split expenses with friends
- **Group Management** - Create groups for events like trips, flatmates, etc.
- **Friend Management** - Add friends, view balances, and manage relationships
- **Settlement System** - Easy settlement with payment method options
- **Notifications** - Activity updates and reminders
- **Profile Management** - User profile with stats and settings
- **Responsive Design** - Works on all devices
- **Dark Mode Support** - Automatic theme switching

### 🎨 Design Features
- Clean, minimal, and friendly interface
- Rounded cards with soft shadows
- Emojis and playful animations
- Brand color palette (pastel pink + soft blue)
- Confetti animations on settlement celebrations
- Smooth transitions and micro-interactions

## 📱 Screens

1. **Splash Screen** - App loading with animated logo
2. **Welcome Screen** - Onboarding slides with features
3. **Authentication** - Login/Signup with Google OAuth
4. **Dashboard** - Home screen with balances and activities
5. **Add Expense** - Form to create new shared expenses
6. **Groups** - Manage expense groups and events
7. **Friends** - Friend list and management
8. **Settle Up** - Payment settlement interface
9. **Notifications** - Activity feed and reminders
10. **Profile** - User profile and app settings

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Icons**: Font Awesome
- **Design**: CSS Grid, Flexbox, Custom CSS Variables
- **Animations**: CSS Animations & Transitions
- **Storage**: LocalStorage for theme preferences
- **PWA Ready**: Service Worker support included

## 🚀 Getting Started

1. **Download the files** to your local machine
2. **Open index.html** in a web browser
3. **Navigate through the app** using the bottom navigation
4. **Test different features** like adding expenses, creating groups, etc.

## 📂 File Structure

```
broke/
├── index.html          # Main HTML file with all screens
├── styles.css          # Complete CSS styling
├── script.js           # JavaScript functionality
└── README.md          # This file
```

## 🎯 Usage Instructions

### Navigation
- Use the bottom navigation bar to switch between screens
- Home, Groups, Friends, and Profile tabs
- Central "+" button for adding expenses
- Back buttons on secondary screens

### Adding Expenses
1. Click the "+" button or "Add Expense" quick action
2. Fill in expense details (title, amount, payer)
3. Select participants and split method
4. Add optional notes or receipt
5. Save the expense

### Managing Groups
1. Go to Groups tab
2. Click "+" to create a new group
3. Enter group name and select icon
4. Add members from your friends list
5. Track group expenses and settle balances

### Settling Up
1. Use "Settle Up" from dashboard or activity items
2. Select payment method (Cash, UPI, Bank Transfer)
3. Confirm settlement
4. Enjoy the confetti celebration! 🎉

## 🎨 Customization

### Colors
Modify CSS variables in `styles.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #ff6b9d;
    /* ... more colors */
}
```

### Themes
- Automatic dark mode support
- Manual theme toggle available
- Theme preference saved in localStorage

### Animations
- Disable animations for reduced motion users
- Customizable animation durations
- Confetti celebration on settlements

## 📱 Responsive Design

- Mobile-first design approach
- Responsive grid layouts
- Touch-friendly interface
- Optimized for various screen sizes

## 🔧 Advanced Features

### PWA Support
- Service Worker ready
- Offline functionality support
- App-like experience

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Reduced motion preferences

### Performance
- Efficient DOM manipulation
- Optimized CSS animations
- Lazy loading for images
- Minimal JavaScript footprint

## 🚀 Future Enhancements

- Chat within groups
- Receipt OCR scanning
- Export reports as PDF
- Recurring expense tracking
- Advanced analytics
- Multi-currency support
- Bank integration
- Push notifications

## 🛡️ Security Considerations

- Input validation and sanitization
- XSS prevention
- CSRF protection ready
- Secure authentication flows
- Data encryption for sensitive information

## 🐛 Known Issues

- Some animations may not work on older browsers
- Receipt upload is simulated (requires backend)
- Payment processing is simulated
- User data is not persisted (requires backend)

## 🤝 Contributing

Feel free to contribute to this project by:
1. Reporting bugs
2. Suggesting new features
3. Improving the UI/UX
4. Adding new functionality
5. Optimizing performance

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the FAQ section
- Contact the development team

---

## 🎉 Enjoy staying broke, but together!

The app is designed to make expense splitting fun and social. The playful design, smooth animations, and celebration effects make managing shared expenses an enjoyable experience rather than a chore.

**Happy Splitting!** 💸