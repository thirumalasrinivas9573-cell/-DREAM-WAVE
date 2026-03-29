import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from 'react-query'
import { mentorAPI } from '../services/api'
import toast from 'react-hot-toast'
import { MessageCircle, Send, Volume2, VolumeX } from 'lucide-react'

const Mentor = () => {
  const [query, setQuery] = useState('')
  const [advice, setAdvice] = useState(null)
  const [isGettingAdvice, setIsGettingAdvice] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const getAdviceMutation = useMutation(mentorAPI.getAdvice, {
    onSuccess: (response) => {
      setAdvice(response.data.advice)
      toast.success('Krishna has responded!')
      setIsGettingAdvice(false)
      // Auto-play flute sound when advice is received
      playFluteSound()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to get advice')
      setIsGettingAdvice(false)
    }
  })

  const playFluteSound = () => {
    setIsPlaying(true)
    // Simulate flute sound playing for 3 seconds
    setTimeout(() => {
      setIsPlaying(false)
    }, 3000)
  }

  const handleGetAdvice = () => {
    if (!query.trim()) {
      toast.error('Please ask Krishna a question')
      return
    }
    
    setIsGettingAdvice(true)
    getAdviceMutation.mutate({ query })
  }

  const sampleQuestions = [
    'How do I find my true purpose in life?',
    'What should I do when facing difficult decisions?',
    'How can I overcome fear and anxiety?',
    'What is the meaning of success?',
    'How do I stay motivated during tough times?',
    'What is the path to inner peace?'
  ]

  useEffect(() => {
    // Play flute sound when component mounts
    const timer = setTimeout(() => {
      playFluteSound()
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Mentor Mode</h1>
        <p className="text-gray-600 text-lg">Divine guidance from Lord Krishna</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Ask Krishna</h2>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-4xl">🕉️</span>
                </div>
                <p className="text-gray-600 text-sm">Lord Krishna, your divine mentor</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Question
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Krishna for guidance..."
                  className="input-field"
                  rows="4"
                />
              </div>

              <button
                onClick={handleGetAdvice}
                disabled={isGettingAdvice}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGettingAdvice ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Krishna is speaking...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Ask Krishna</span>
                  </>
                )}
              </button>

              {isPlaying && (
                <div className="flex items-center justify-center space-x-2 text-orange-600">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span className="text-sm">Playing flute music...</span>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Sample Questions</h3>
            <div className="space-y-2">
              {sampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(question)}
                  className="w-full text-left p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-all text-sm"
                >
                  {question}
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
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🕉️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Krishna's Wisdom</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                  <p className="text-gray-700 italic">Arjuna asks: "{query}"</p>
                </div>

                {advice.sloka && (
                  <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg p-6 border-l-4 border-orange-500">
                    <h3 className="font-semibold text-gray-800 mb-3">Sacred Sloka</h3>
                    <p className="text-gray-700 font-medium text-center text-lg leading-relaxed">
                      {advice.sloka}
                    </p>
                  </div>
                )}

                <div className="prose max-w-none">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <span className="text-3xl">🕉️</span>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {advice.response}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MessageCircle className="w-4 h-4" />
                    <span>Divine wisdom from Bhagavad Gita</span>
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
                <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-6xl">🕉️</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  Welcome to Krishna's Guidance
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
                  "As a person puts on new garments, giving up old ones, the soul similarly accepts new material bodies, giving up the old and useless ones."
                </p>
                <p className="text-gray-500 italic mb-8">- Bhagavad Gita, Chapter 2, Verse 22</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-800 mb-3">🌟 Wisdom</h4>
                    <p className="text-sm text-gray-600">
                      Ancient knowledge for modern problems
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-800 mb-3">🎯 Purpose</h4>
                    <p className="text-sm text-gray-600">
                      Find your true path and meaning
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-800 mb-3">🧘 Peace</h4>
                    <p className="text-sm text-gray-600">
                      Inner tranquility through divine guidance
                    </p>
                  </div>
                </div>

                <button
                  onClick={playFluteSound}
                  className="mt-8 btn-secondary flex items-center space-x-2 mx-auto"
                >
                  {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  <span>{isPlaying ? 'Stop Flute' : 'Play Flute Music'}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Mentor
