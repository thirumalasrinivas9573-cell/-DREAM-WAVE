import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  Target,
  FileText,
  Map,
  Book,
  CheckSquare,
  Heart,
  MessageCircle,
  Users,
  User
} from 'lucide-react'

const menuItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/goals', icon: Target, label: 'Set Goal' },
  { path: '/reports', icon: FileText, label: 'R&D Report' },
  { path: '/roadmap', icon: Map, label: 'Roadmap' },
  { path: '/books', icon: Book, label: 'Books' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/daily-life', icon: Heart, label: 'Daily Life' },
  { path: '/mentor', icon: MessageCircle, label: 'Mentor Mode' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/profile', icon: User, label: 'Profile' },
]

const Sidebar = () => {
  const location = useLocation()

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-16 h-full w-64 bg-white shadow-xl z-40"
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-800 mb-2">Your Progress</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full"
              style={{ width: `${Math.min((location.pathname === '/' ? 10 : 50), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar
