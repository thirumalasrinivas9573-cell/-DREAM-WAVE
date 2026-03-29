import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { goalAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Target, Brain, TrendingUp, Award, Clock } from 'lucide-react'

const Goals = () => {
  const [formData, setFormData] = useState({
    goal: '',
    age: '',
    education: '',
    skills: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const queryClient = useQueryClient()

  const { data: goals, isLoading } = useQuery(
    'goals',
    () => goalAPI.getGoals(),
    { refetchOnWindowFocus: false }
  )

  const createGoalMutation = useMutation(goalAPI.createGoal, {
    onSuccess: () => {
      queryClient.invalidateQueries('goals')
      toast.success('Goal created successfully!')
      setFormData({ goal: '', age: '', education: '', skills: '' })
      setIsSubmitting(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create goal')
      setIsSubmitting(false)
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
    setIsSubmitting(true)
    
    const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
    
    createGoalMutation.mutate({
      ...formData,
      age: parseInt(formData.age),
      skills: skillsArray
    })
  }

  const currentGoal = goals?.data?.goals?.find(goal => goal.status === 'active')

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Career Goals</h1>
        <p className="text-gray-600 text-lg">Define your career path with AI guidance</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Set Your Goal</h2>
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
                  placeholder="e.g., Software Engineer, Data Scientist, Doctor"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Your age"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Level
                </label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Skills (comma separated)
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., JavaScript, Python, Communication, Leadership"
                  className="input-field"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Goal...' : 'Create Goal'}
              </button>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {currentGoal && (
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">AI Recommendation</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Career Path</h3>
                  <p className="text-gray-600">{currentGoal.aiResponse?.careerPath || 'Loading...'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Timeline</h3>
                  <p className="text-gray-600">{currentGoal.aiResponse?.timeline || 'Loading...'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentGoal.aiResponse?.requiredSkills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Milestones</h3>
                  <ul className="space-y-2">
                    {currentGoal.aiResponse?.milestones?.map((milestone, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-600">{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-800">Potential Salary</span>
                    </div>
                    <p className="text-gray-600">{currentGoal.aiResponse?.potentialSalary || 'Loading...'}</p>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-gray-800">Growth</span>
                    </div>
                    <p className="text-gray-600">{currentGoal.aiResponse?.growthOpportunities?.[0] || 'Loading...'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {goals?.data?.goals?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Previous Goals</h2>
            <div className="space-y-3">
              {goals.data.goals
                .filter(goal => goal.status === 'completed')
                .map((goal, index) => (
                  <div key={goal._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-800">{goal.goal}</h3>
                      <p className="text-sm text-gray-600">Completed {new Date(goal.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-green-600">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Completed</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Goals
