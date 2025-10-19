# RAG Transformer UI

A modern, multi-tenant React application for the RAG Transformer platform built with Vite, Radix UI, and React Router.

## Features

- 🎨 **Purple & Black Gradient Theme** - Beautiful color scheme with light/dark mode support
- 🔐 **OTP Authentication** - Secure login/signup with one-time passwords
- 👥 **Multi-Tenant** - Each company gets their own isolated workspace
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Fast & Modern** - Built with Vite for lightning-fast development
- 🎯 **Radix UI Components** - Accessible, customizable primitives
- 🌙 **Dark Mode** - Toggle between light and dark themes

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Radix UI** - Headless UI components
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:3000`

## Installation

1. **Install dependencies:**
   ```bash
   cd C:\work\rag_transformer_ui
   npm install
   ```

2. **Create environment file (optional):**
   ```bash
   # Create .env file
   VITE_API_URL=http://localhost:3000/api/v1
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## Project Structure

```
rag_transformer_ui/
├── public/                 # Static assets
├── src/
│   ├── api/               # API client and endpoints
│   │   ├── client.js      # Axios instance
│   │   ├── auth.js        # Auth API calls
│   │   └── clients.js     # Client/Website API calls
│   ├── components/
│   │   ├── primitives/    # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Label.jsx
│   │   └── ThemeToggle.jsx
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/             # Page components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── Dashboard.jsx
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Usage

### 1. Sign Up

1. Click "Sign up" on the login page
2. Fill in your company details:
   - Company Name
   - First & Last Name
   - Email
   - Password
3. Click "Continue" to receive OTP
4. Check console for OTP (in development)
5. Enter OTP and click "Create Account"

### 2. Login

1. Enter your email
2. Click "Send OTP"
3. Check console for OTP
4. Enter OTP and click "Verify & Login"

### 3. Dashboard

After logging in, you'll see:
- **Overview**: Stats and quick actions
- **Websites**: Manage your website content sources
- **Query & Chat**: Ask questions about your content
- **Settings**: Manage account preferences

## Default Admin Account

The backend automatically creates an admin account:
- **Email**: `admin@runit.in`
- **Password**: `admin123456`
- **User Type**: ADMIN (unlimited resources)

## Theme Customization

The app uses CSS variables for theming. Edit `src/index.css` to customize:

```css
:root {
  --purple-600: #9333ea;  /* Primary purple */
  --purple-700: #7e22ce;  /* Darker purple */
  /* ... more variables */
}
```

## API Integration

The app automatically proxies API requests to `http://localhost:3000/api/v1`.

Example API call:
```javascript
import { authAPI } from './api/auth';

// Register
const response = await authAPI.register({
  email: 'user@example.com',
  password: 'password123',
  companyName: 'My Company'
});

// Login
const loginRes = await authAPI.login({
  email: 'user@example.com',
  password: 'password123'
});
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Next Steps

1. **Install dependencies and run the app**
2. **Implement Website Management page** - Add/edit/delete client websites
3. **Implement Crawling Interface** - Start/stop crawls, view progress
4. **Implement Query/Chat Interface** - Ask questions, view responses
5. **Add Analytics Dashboard** - Usage stats, query history
6. **Implement Settings Page** - Profile management, API keys

## Troubleshooting

### Port already in use
If port 5173 is in use, Vite will automatically try the next available port.

### API connection errors
Make sure the backend server is running on `http://localhost:3000`.

### OTP not working
Check the backend console for the OTP. In development, OTPs are logged to console.

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved
