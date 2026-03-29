import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Target,
  FileText,
  Map,
  Book,
  CheckSquare,
  Heart,
  MessageCircle,
  Users,
  User,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react'

const Dashboard = () => {
  const cards = [
    {
      title: 'Set Goal',
      description: 'Define your career aspirations with AI guidance',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      link: '/goals'
    },
    {
      title: 'R&D Report',
      description: 'Generate comprehensive career research reports',
      icon: FileText,
      color: 'from-blue-500 to-purple-500',
      link: '/reports'
    },
    {
      title: 'Roadmap',
      description: 'Get step-by-step learning paths',
      icon: Map,
      color: 'from-green-500 to-blue-500',
      link: '/roadmap'
    },
    {
      title: 'Books',
      description: 'Discover relevant books for your goals',
      icon: Book,
      color: 'from-yellow-500 to-orange-500',
      link: '/books'
    },
    {
      title: 'Tasks',
      description: 'Complete challenges and earn rewards',
      icon: CheckSquare,
      color: 'from-pink-500 to-red-500',
      link: '/tasks'
    },
    {
      title: 'Daily Life',
      description: 'Get AI advice for everyday life',
      icon: Heart,
      color: 'from-indigo-500 to-purple-500',
      link: '/daily-life'
    },
    {
      title: 'Mentor Mode',
      description: 'Chat with Krishna AI for wisdom',
      icon: MessageCircle,
      color: 'from-teal-500 to-green-500',
      link: '/mentor'
    },
    {
      title: 'Community',
      description: 'Connect with like-minded individuals',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      link: '/community'
    },
    {
      title: 'Profile',
      description: 'Manage your profile and certificates',
      icon: User,
      color: 'from-cyan-500 to-blue-500',
      link: '/profile'
    }
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Welcome to DREAM WAVE AI</h1>
        <p className="text-gray-600 text-lg">Your personal AI-powered career companion</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <Link key={index} to={card.link}>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card cursor-pointer group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-gray-600">{card.description}</p>
              </motion.div>
            </Link>
          )
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Today's Progress</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasks Completed</span>
              <span className="font-semibold text-green-600">3/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Achievements</h3>
            <Award className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Level</span>
              <span className="font-semibold text-yellow-600">Level 5</span>
            </div>
            <div className="flex space-x-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < 5 ? 'bg-yellow-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Current Streak</h3>
            <Zap className="w-5 h-5 text-orange-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Days Active</span>
              <span className="font-semibold text-orange-600">15 days</span>
            </div>
            <div className="flex space-x-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < 5 ? 'bg-orange-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
