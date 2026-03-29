import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from 'react-query'
import { dailyAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Heart, Brain, MessageCircle, Send } from 'lucide-react'

const DailyLife = () => {
  const [selectedCategory, setSelectedCategory] = useState('cooking')
  const [query, setQuery] = useState('')
  const [advice, setAdvice] = useState(null)
  const [isGettingAdvice, setIsGettingAdvice] = useState(false)

  const getAdviceMutation = useMutation(dailyAPI.getAdvice, {
    onSuccess: (response) => {
      setAdvice(response.data.advice)
      toast.success('Advice received!')
      setIsGettingAdvice(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to get advice')
      setIsGettingAdvice(false)
    }
  })

  const categories = [
    { value: 'cooking', label: 'Cooking', icon: '🍳', color: 'from-orange-500 to-red-500' },
    { value: 'fitness', label: 'Fitness', icon: '💪', color: 'from-green-500 to-blue-500' },
    { value: 'yoga', label: 'Yoga', icon: '🧘', color: 'from-purple-500 to-pink-500' },
    { value: 'lifestyle', label: 'Lifestyle', icon: '🌟', color: 'from-blue-500 to-purple-500' }
  ]

  const sampleQueries = {
    cooking: [
      'Quick healthy breakfast ideas',
      'Meal prep for busy week',
      'Vegetarian dinner recipes'
    ],
    fitness: [
      'Home workout routine',
      'Weight loss exercises',
      'Muscle building tips'
    ],
    yoga: [
      'Morning yoga poses',
      'Stress relief yoga',
      'Beginner yoga routine'
    ],
    lifestyle: [
      'Time management tips',
      'Work-life balance',
      'Productivity hacks'
    ]
  }

  const handleGetAdvice = () => {
    if (!query.trim()) {
      toast.error('Please enter your question')
      return
    }
    
    setIsGettingAdvice(true)
    getAdviceMutation.mutate({
      category: selectedCategory,
      query
    })
  }

  const currentCategory = categories.find(cat => cat.value === selectedCategory)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Daily Life AI</h1>
        <p className="text-gray-600 text-lg">Get personalized advice for your everyday life</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-red-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Get Advice</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedCategory === category.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{category.icon}</div>
                      <div className="text-sm font-medium">{category.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Question
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Ask about ${currentCategory.label}...`}
                  className="input-field"
                  rows="4"
                />
              </div>

              <button
                onClick={handleGetAdvice}
                disabled={isGettingAdvice}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGettingAdvice ? 'Getting Advice...' : 'Get Advice'}
              </button>
            </div>
          </div>

          <div className="card mt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Sample Questions</h3>
            <div className="space-y-2">
              {sampleQueries[selectedCategory].map((sampleQuery, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(sampleQuery)}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  {sampleQuery}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          {advice ? (
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-12 h-12 bg-gradient-to-r ${currentCategory.color} rounded-lg flex items-center justify-center`}>
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">AI Advice</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">{currentCategory.icon}</span>
                    <span className="font-semibold text-gray-800 capitalize">{currentCategory.label}</span>
                  </div>
                  <p className="text-gray-700 italic">"{query}"</p>
                </div>

                <div className="prose max-w-none">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {advice.response}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MessageCircle className="w-4 h-4" />
                    <span>AI-powered advice</span>
                  </div>
                  <button
                    onClick={() => {
                      setAdvice(null)
                      setQuery('')
                    }}
                    className="btn-secondary"
                  >
                    Ask Another Question
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <div className={`w-20 h-20 bg-gradient-to-r ${currentCategory.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <span className="text-4xl">{currentCategory.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {currentCategory.label} Assistant
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Get personalized advice and tips for your {currentCategory.label.toLowerCase()} needs. 
                  Ask me anything about improving your daily routine.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Expert Guidance</h4>
                    <p className="text-sm text-gray-600">
                      Get advice from AI trained on expert knowledge
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Personalized Tips</h4>
                    <p className="text-sm text-gray-600">
                      Tailored recommendations for your lifestyle
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default DailyLife
