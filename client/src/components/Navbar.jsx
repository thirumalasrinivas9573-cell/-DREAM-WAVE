import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { User, LogOut, Award, Zap } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-lg"
    >
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">DW</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">DREAM WAVE AI</h1>
        </div>

        {user && (
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-primary-50 px-3 py-1 rounded-lg">
                <Zap className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">Streak: {user.streak}</span>
              </div>
              <div className="flex items-center space-x-2 bg-secondary-50 px-3 py-1 rounded-lg">
                <Award className="w-4 h-4 text-secondary-600" />
                <span className="text-sm font-semibold text-secondary-700">Level {user.level}</span>
              </div>
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-lg">
                <span className="text-sm font-semibold text-green-700">Credits: {user.credits}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="w-8 h-8 text-gray-600" />
                )}
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar
