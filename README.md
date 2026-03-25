# 🎯 Exam Readiness Predictor

> **AI-Powered Study Companion** - Transform your exam preparation with intelligent analytics, personalized study plans, and comprehensive progress tracking.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-blue?style=for-the-badge)](https://your-actual-netlify-url.netlify.app)
[![Backend API](https://img.shields.io/badge/🚀_API-Live_Server-green?style=for-the-badge)](https://your-actual-render-url.onrender.com)

## ✨ Features

### 📊 **Smart Analytics Dashboard**
- Real-time progress visualization with interactive charts
- Confidence level tracking across subjects
- Study session analytics and burnout indicators
- Performance trends and improvement suggestions

### 📚 **Intelligent Study Management**
- **Subject Organization**: Create and manage subjects with difficulty levels, priorities, and file attachments
- **Study Sessions**: Track hours studied, mood, and confidence levels
- **Progress Monitoring**: Visual progress bars and completion tracking

### 🎯 **Exam Preparation Tools**
- **AI-Generated Study Plans**: Weekly, monthly, and 10-day intensive plans
- **Practice Tests**: Customizable tests with instant feedback and detailed analytics
- **Exam Simulations**: Realistic exam environment with time management
- **Readiness Prediction**: AI-powered exam readiness assessment

### 👥 **Collaborative Learning**
- **Study Groups**: Create and join study groups with invite codes
- **Leaderboards**: Gamified learning with points and rankings
- **Group Analytics**: Track group performance and engagement

### 📱 **Modern User Experience**
- **Responsive Design**: Seamless experience across all devices
- **Dark/Light Themes**: Customizable interface preferences
- **Real-time Notifications**: Toast notifications for all actions
- **Intuitive Navigation**: Clean, modern UI with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Recharts** - Beautiful, responsive charts
- **Lucide React** - Modern icon library
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Secure authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/exam-readiness-predictor.git
cd exam-readiness-predictor
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

Visit `http://localhost:5173` 🎉

## 📦 Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Build settings are configured in `netlify.toml`
3. Environment variables: Set `VITE_API_URL` to your backend URL

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Auto-deploys on push to main branch

## 🎨 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/4f46e5/ffffff?text=Smart+Analytics+Dashboard)

### Study Plans
![Study Plans](https://via.placeholder.com/800x400/059669/ffffff?text=AI+Generated+Study+Plans)

### Practice Tests
![Practice Tests](https://via.placeholder.com/800x400/dc2626/ffffff?text=Interactive+Practice+Tests)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Study Sessions
- `GET /api/study-sessions` - Get all sessions
- `POST /api/study-sessions` - Create session
- `PUT /api/study-sessions/:id` - Update session

### Exams & Tests
- `GET /api/exams` - Get all exams
- `POST /api/exams/generate-plan` - Generate study plan
- `POST /api/practice-tests` - Create practice test
- `POST /api/practice-tests/:id/submit` - Submit test

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Recharts** for beautiful data visualizations
- **Lucide** for clean, modern icons
- **MongoDB Atlas** for reliable database hosting
- **Netlify & Render** for seamless deployment

## 📞 Support

- 📧 Email: support@exampredictor.com
- 💬 Discord: [Join our community](https://discord.gg/exampredictor)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/exam-readiness-predictor/issues)

---

<div align="center">

**Made with ❤️ for students worldwide**

[⭐ Star this repo](https://github.com/yourusername/exam-readiness-predictor) • [🐛 Report Bug](https://github.com/yourusername/exam-readiness-predictor/issues) • [✨ Request Feature](https://github.com/yourusername/exam-readiness-predictor/issues)

</div>