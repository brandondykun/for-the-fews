# For the Fews

An exclusive, invitation-only chat application built with Next.js and Firebase. Members can engage in conversations with both other users and AI assistants in a secure, rate-limited environment.

## 🚀 Features

- **Invitation-Only Access**: Users must have a valid join code to register
- **Dual Chat Modes**: Switch between community chat and private AI conversations
- **Real-time Messaging**: Instant messaging powered by Firebase Firestore (WIP)
- **AI Integration**: Chat with AI assistants using Together AI
- **Rate Limiting**: Built-in protection against spam and abuse
- **Security-First**: Comprehensive security headers and bot protection
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Authentication**: Secure Firebase Authentication with user profiles

## 🛠️ Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI Integration**: Together AI
- **Deployment**: Vercel-ready
- **Code Quality**: ESLint, Prettier with automatic import sorting

## 🏗️ How It Works

1. **Registration**: Users register with a valid join code and create their profile
2. **Authentication**: Firebase handles secure user authentication and sessions
3. **Chat Modes**: Users can switch between community chat and AI chat
4. **Rate Limiting**: Built-in protection limits messages per user per day
5. **Real-time Updates**: Messages sync in real-time across all connected clients
6. **Security**: Comprehensive protection against common web vulnerabilities

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Firestore and Authentication enabled
- Together AI API key (for AI chat functionality)

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd for-the-fews
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (for API routes)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"

# Together AI (for AI chat)
TOGETHER_API_KEY=your_together_api_key

# Set the environment
NEXT_PUBLIC_NODE_ENV=development
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database and Authentication
3. Set up Email/Password authentication
4. Create a service account and download the JSON key
5. **Create the joinCode collection** in Firestore:
   - Go to Firestore Database in the Firebase Console
   - Create a new collection called `joinCode`
   - Add a document with the following fields:
     - `code`: `"your_secret_join_code"` (string)
     - `isActive`: `true` (boolean)
   - Users will need this code to register for the application
6. Deploy the Firestore security rules:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and deploy rules
firebase login
firebase deploy --only firestore:rules
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
for-the-fews/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── chat/              # Chat pages
│   ├── login/             # Authentication pages
│   └── register/
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── types.ts              # TypeScript type definitions
└── firestore.rules       # Firestore security rules
```

## 🔒 Security Features

- **Rate Limiting**: 100 messages per day per user, 5 registration attempts per hour per IP
- **Bot Protection**: Honeypot fields prevent automated submissions
- **Security Headers**: Comprehensive protection against XSS, clickjacking, and other attacks
- **Input Validation**: All user inputs are validated and sanitized
- **Authentication**: Secure Firebase Auth with protected routes

## 🎨 Development

### Code Formatting

The project uses ESLint and Prettier for code formatting with automatic import sorting:

```bash
# Fix linting issues and sort imports
npm run lint:fix

# Format code with Prettier
npm run format
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
```

## 🚀 Deployment

The application is configured for deployment on Vercel:

1. Connect your repository to Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

## 🤝 Contributing

1. Follow the existing code style and formatting
2. Run `npm run lint:fix` before committing
3. Ensure all tests pass and the application builds successfully
4. Write clear commit messages

## 📄 License

This project is private and proprietary.
