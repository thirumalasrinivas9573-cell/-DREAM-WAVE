# DREAM WAVE AI

Complete AI-powered career guidance platform with mentorship, gamification, and community features.

## 🚀 Features

- **AI Career Guidance** - Personalized goal planning with OpenAI
- **R&D Reports** - Comprehensive career research with PDF export
- **Learning Roadmaps** - Step-by-step career paths
- **Book Discovery** - Google Books API integration
- **Gamified Tasks** - Complete challenges, earn points and levels
- **Daily Life AI** - Lifestyle advice (cooking, fitness, yoga, etc.)
- **Mentor Mode** - Krishna AI with ancient wisdom and slokas
- **Community** - Social features with posts, comments, and friends
- **Profile System** - Certificates and progress tracking
- **Authentication** - JWT-based auth with AAID system

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express**
- **MongoDB Atlas** (Database)
- **JWT** (Authentication)
- **OpenAI API** (AI features)
- **PDFKit** (PDF generation)
- **Firebase** (Storage)
- **Socket.io** (Real-time features)

### Frontend
- **React** + **Vite**
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **React Query** (State management)
- **React Router** (Navigation)
- **Lucide React** (Icons)

## 📁 Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   └── server.js
├── .env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- OpenAI API key

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Setup

Create a `.env` file in the `server` directory:

```env
# MongoDB Atlas Connection
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/dreamwave

# JWT Secret Key
JWT_SECRET=your_jwt_secret_key_here

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Server Port
PORT=5000
```

### 3. Start the Application

```bash
# Start backend server (from server directory)
npm run dev

# Start frontend (from client directory)
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

### 4. Connectivity Check

- Backend test route: `GET /api/test` returns `{ message: "Backend working" }`
- In the UI, a floating badge shows backend status: "Backend Connected ✅" or "Backend Not Connected ❌".

## 🔧 Development Commands

### Backend (server/)
```bash
npm run dev    # Start with nodemon
npm start      # Production start
```

### Frontend (client/)
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm preview    # Preview production build
```

## 🌐 Deployment

### Render Deployment

1. **Backend Deployment**
   - Connect your GitHub repository
   - Set build command: `cd server && npm install`
   - Set start command: `cd server && npm start`
   - Add environment variables from `.env`

2. **Frontend Deployment**
   - Set build command: `cd client && npm install && npm run build`
   - Set publish directory: `client/dist`
   - Add environment variable: `VITE_API_URL=your_backend_url`

## ✅ Local Checklist

- Backend starts without errors on port 5000
- MongoDB connects (check console log). If it fails, a readable error is logged and server continues.
- Frontend runs on port 5173
- Visiting the app shows "Backend Connected ✅"

## 🧰 Troubleshooting

- MODULE_NOT_FOUND: Run `npm install` inside both `server/` and `client/`.
- MongoDB ECONNREFUSED: Verify `MONGODB_URL`, password correctness, and IP access (0.0.0.0/0) in Atlas.
- Env not loading: Ensure `.env` file exists under `server/` (not `.env.example`).
- CORS issues: Update `CLIENT_URL` in `server/.env` to match your frontend URL.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/aaid-login` - AAID login
- `GET /api/auth/me` - Get current user

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get user goals
- `GET /api/goals/:id` - Get specific goal

### Reports
- `POST /api/report` - Generate R&D report
- `GET /api/report` - Get user reports
- `GET /api/report/:id/download` - Download PDF

### Roadmaps
- `POST /api/roadmap` - Generate learning roadmap

### Books
- `GET /api/books` - Search books

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create task
- `POST /api/tasks/:id/complete` - Complete task
- `POST /api/tasks/generate` - Generate AI quiz

### Daily Life
- `POST /api/daily` - Get lifestyle advice

### Mentor
- `POST /api/mentor` - Get Krishna's advice

### Community
- `GET /api/community/posts` - Get posts
- `POST /api/community/posts` - Create post
- `POST /api/community/posts/:id/like` - Like post
- `POST /api/community/posts/:id/comment` - Comment on post
- `GET /api/community/friends` - Get friends
- `POST /api/community/friends/:id` - Add friend

### Profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/upload` - Upload profile image
- `POST /api/profile/certificate` - Generate certificate

## 🎨 UI Features

- **Gradient Theme**: Violet to pink gradient design
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion transitions
- **Modern Components**: Cards, modals, and interactive elements
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages

## 🏆 Gamification System

- **Points System**: Earn points for completing tasks
- **Streak Tracking**: Daily activity tracking
- **Level Progress**: Advance through levels with credits
- **Certificates**: Auto-generated achievement certificates
- **Leaderboards**: Community rankings

## 🔐 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- Secure file uploads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints above

---

**DREAM WAVE AI** - Your AI-powered career companion 🚀
