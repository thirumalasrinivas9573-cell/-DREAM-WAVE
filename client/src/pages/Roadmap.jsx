import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from 'react-query'
import { roadmapAPI, goalAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Map, Clock, BookOpen, Target, Zap, CheckCircle } from 'lucide-react'

const Roadmap = () => {
  const [formData, setFormData] = useState({
    goal: '',
    currentLevel: ''
  })
  const [roadmap, setRoadmap] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateRoadmapMutation = useMutation(roadmapAPI.generateRoadmap, {
    onSuccess: (response) => {
      setRoadmap(response.data.roadmap)
      toast.success('Roadmap generated successfully!')
      setIsGenerating(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate roadmap')
      setIsGenerating(false)
    }
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsGenerating(true)
    generateRoadmapMutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Learning Roadmap</h1>
        <p className="text-gray-600 text-lg">Step-by-step path to achieve your career goals</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Map className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Generate Roadmap</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Career Goal
                </label>
                <input
                  type="text"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  placeholder="e.g., Full Stack Developer"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Level
                </label>
                <select
                  name="currentLevel"
                  value={formData.currentLevel}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select your level...</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Roadmap'}
              </button>
            </form>
          </div>
        </motion.div>

        {roadmap && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Your Learning Path</h2>
              </div>

              <div className="space-y-6">
                {roadmap.roadmap?.map((phase, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="relative">
                      {index < roadmap.roadmap.length - 1 && (
                        <div className="absolute left-8 top-12 w-0.5 h-full bg-gradient-to-b from-primary-300 to-secondary-300" />
                      )}
                      
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-gradient-to-r from-green-500 to-blue-500' :
                            index === 1 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}>
                            {index === 0 ? <Zap className="w-8 h-8 text-white" /> :
                             index === 1 ? <Clock className="w-8 h-8 text-white" /> :
                             <CheckCircle className="w-8 h-8 text-white" />}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-gray-800">{phase.phase}</h3>
                              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                                {phase.duration}
                              </span>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Skills to Learn</h4>
                                <div className="flex flex-wrap gap-2">
                                  {phase.skills?.map((skill, skillIndex) => (
                                    <span
                                      key={skillIndex}
                                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Projects</h4>
                                <ul className="space-y-1">
                                  {phase.projects?.map((project, projectIndex) => (
                                    <li key={projectIndex} className="flex items-center space-x-2 text-gray-600">
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      <span>{project}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Resources</h4>
                                <div className="space-y-1">
                                  {phase.resources?.map((resource, resourceIndex) => (
                                    <div key={resourceIndex} className="flex items-center space-x-2 text-gray-600">
                                      <BookOpen className="w-4 h-4 text-blue-500" />
                                      <span>{resource}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Roadmap
