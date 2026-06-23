# 🌊 Dream Wave AI

A comprehensive AI-powered learning and goal achievement platform with gamification features.

## 🚀 Quick Start

### Option 1: Automatic Setup (Recommended)
```bash
# Clone and navigate to project
cd dream-wave-ai

# Install all dependencies and start both servers
npm run install-all
npm run dev
```

### Option 2: Manual Setup
```bash
# Start Backend (Terminal 1)
cd dream-wave-ai/server
npm install
npm run dev

# Start Frontend (Terminal 2)
cd dream-wave-ai/client
npm install
npm run dev
```

### Option 3: Platform-specific Scripts
```bash
# Windows
./start-dev.bat

# Mac/Linux/Git Bash
./start-dev.sh
```

## 🔗 Connection Status

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API Base**: http://localhost:5000/api

### ✅ Connection Fixed!
- Vite proxy correctly configured (port 5000)
- CORS properly set up for local development
- Real-time connection status indicator in UI
- Comprehensive error handling and logging

## 🧪 Testing Connection

```bash
# Test if everything is connected
npm run test-connection

# Or manually check:
# Backend health: http://localhost:5000/health
# API test: http://localhost:5000/api/test
```

## 🛠️ Environment Setup

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
# Leave empty for local development (uses Vite proxy)
VITE_API_URL=
```

## 🎯 Features

- **AI-Powered Goal Setting**: Interactive chat-based goal creation
- **Personalized Learning Plans**: AI-generated roadmaps and tasks
- **Gamification System**: Points, levels, achievements, and streaks
- **Smart Memory System**: Context-aware AI conversations
- **Progress Tracking**: Visual journey bars and milestone tracking
- **Community Features**: Connect with other learners
- **Multi-Platform**: Web and mobile (React Native) support

## 📱 Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **OpenAI API** integration
- **Firebase Admin** for additional services

### Mobile
- **React Native** with Expo
- Cross-platform iOS/Android support

## 🔧 Development

### Available Scripts
```bash
npm run dev              # Start both frontend and backend
npm run install-all      # Install all dependencies
npm run test-connection  # Test frontend-backend connection
npm run build           # Build for production
npm start              # Start production server
```

### Project Structure
```
dream-wave-ai/
├── client/             # React frontend
├── server/             # Node.js backend
├── mobile/             # React Native app
├── START_GUIDE.md      # Detailed setup guide
├── test-connection.js  # Connection testing script
└── start-dev.*         # Platform-specific startup scripts
```

## 🐛 Troubleshooting

### Connection Issues
1. **Port conflicts**: Backend auto-retries on port 5001 if 5000 is busy
2. **CORS errors**: Verify `CLIENT_URL=http://localhost:5173` in server/.env
3. **Proxy issues**: Check Vite config points to correct backend port
4. **Network errors**: Use connection status indicator in top-right corner

### Common Solutions
- Clear browser cache and restart both servers
- Check terminal logs for specific error messages
- Verify all environment variables are set correctly
- Ensure MongoDB connection is working

## 📚 Documentation

- [Deployment Guide](DEPLOY.md)
- [Gamification System](GAMIFICATION_DOCS.md)
- [Phase 3 Features](PHASE_3_QUICK_START.md)
- [Visual Walkthrough](GAMIFICATION_VISUAL_WALKTHROUGH.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the connection with `npm run test-connection`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**🎉 All connection issues resolved! Ready to build amazing AI-powered learning experiences!**
