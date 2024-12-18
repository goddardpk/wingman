# Wingman

Wingman is a desktop application for managing drivers and user accounts in a ride-sharing platform. Built with Electron and SQLite, it provides a robust interface for handling driver statuses, user accounts, and payment methods.

## Features

### Driver Management
- Real-time driver status tracking (Active, Available, On Break)
- Driver search functionality
- Service type categorization (Economy, Comfort, Premium)
- Status filtering and quick view options

### Account Management
- User profile management
- Multiple payment method support (Credit Card, PayPal)
- Account preferences and settings
- Notification preferences

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Electron
- Database: SQLite
- Authentication: GitHub SSH

## Getting Started

### Prerequisites
- Node.js (Latest LTS version recommended)
- npm (Comes with Node.js)
- Git

### Installation

1. Clone the repository:
```bash
git clone git@github.com:goddardpk/wingman.git
```

2. Navigate to project directory:
```bash
cd wingman
```

3. Install dependencies:
```bash
npm install
```

4. Start the application:
```bash
# For development with DevTools:
npm run dev

# For regular use:
npm start
```

## Project Structure
```
wingman/
├── main.js           # Electron main process
├── preload.js        # Electron preload script
├── db.js            # Database operations
├── index.html       # Main application page
├── accounts.html    # Account management page
├── drivers.html     # Driver management page
├── styles.css       # Application styles
└── package.json     # Project configuration
```

## Database Schema

### Accounts Table
- id (Primary Key)
- full_name
- email
- phone
- timestamps

### Payment Methods Table
- id (Primary Key)
- account_id (Foreign Key)
- type (card/paypal)
- is_primary
- last_four/email
- timestamp

### Drivers Table
- id (Primary Key)
- full_name
- driver_id
- service_type
- status
- timestamps

### Account Preferences Table
- id (Primary Key)
- account_id (Foreign Key)
- notifications_enabled
- preferred_language
- timestamps

## Development

To run the application in development mode with DevTools:
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
