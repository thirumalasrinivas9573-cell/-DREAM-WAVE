import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { taskAPI } from '../services/api'
import toast from 'react-hot-toast'
import { CheckSquare, Plus, Brain, Trophy, Zap, Clock } from 'lucide-react'

const Tasks = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'learning',
    difficulty: 'medium'
  })
  const [quizTopic, setQuizTopic] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [quizAnswer, setQuizAnswer] = useState('')
  
  const queryClient = useQueryClient()

  const { data: tasks, isLoading } = useQuery(
    'tasks',
    () => taskAPI.getTasks(),
    { refetchOnWindowFocus: false }
  )

  const createTaskMutation = useMutation(taskAPI.createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks')
      toast.success('Task created successfully!')
      setShowCreateForm(false)
      setFormData({ title: '', description: '', category: 'learning', difficulty: 'medium' })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create task')
    }
  })

  const completeTaskMutation = useMutation(
    ({ id, answer }) => taskAPI.completeTask(id, answer),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('tasks')
        toast.success(`Task completed! +${response.data.points} points`)
        setSelectedTask(null)
        setQuizAnswer('')
      },
      onError: (error) => {
        if (error.response?.data?.correctAnswer !== undefined) {
          toast.error(`Incorrect! Correct answer: ${error.response.data.correctAnswer}`)
        } else {
          toast.error(error.response?.data?.message || 'Failed to complete task')
        }
      }
    }
  )

  const generateTaskMutation = useMutation(taskAPI.generateTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks')
      toast.success('AI task generated successfully!')
      setQuizTopic('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate task')
    }
  })

  const handleCreateTask = (e) => {
    e.preventDefault()
    createTaskMutation.mutate(formData)
  }

  const handleCompleteTask = () => {
    if (selectedTask.category === 'quiz' && !quizAnswer) {
      toast.error('Please select an answer')
      return
    }
    
    completeTaskMutation.mutate({
      id: selectedTask._id,
      answer: parseInt(quizAnswer)
    })
  }

  const handleGenerateQuiz = () => {
    if (!quizTopic.trim()) {
      toast.error('Please enter a topic')
      return
    }
    generateTaskMutation.mutate({ topic: quizTopic, category: 'quiz' })
  }

  const activeTasks = tasks?.data?.tasks?.filter(task => !task.completed) || []
  const completedTasks = tasks?.data?.tasks?.filter(task => task.completed) || []

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Tasks & Challenges</h1>
        <p className="text-gray-600 text-lg">Complete challenges to earn points and level up</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Create Task</h2>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Task title"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Task description"
                    className="input-field"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="input-field"
                    >
                      <option value="learning">Learning</option>
                      <option value="practice">Practice</option>
                      <option value="project">Project</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="input-field"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  Create Task
                </button>
              </form>
            )}

            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Generate AI Quiz</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="Enter a topic for quiz..."
                  className="input-field"
                />
                <button
                  onClick={handleGenerateQuiz}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <Brain className="w-4 h-4" />
                  <span>Generate Quiz</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Tasks</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : activeTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No active tasks. Create or generate tasks to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTasks.map((task) => (
                    <div
                      key={task._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{task.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {task.category}
                            </span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                              {task.difficulty}
                            </span>
                            <span className="flex items-center space-x-1 text-green-600">
                              <Zap className="w-4 h-4" />
                              <span className="text-sm font-medium">{task.points} pts</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <p className="text-xs text-gray-500 mt-1">
                            Created {new Date(task.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {completedTasks.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Completed Tasks</h2>
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <div
                      key={task._id}
                      className="border border-green-200 bg-green-50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800 line-through">{task.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              Completed
                            </span>
                            <span className="flex items-center space-x-1 text-green-600">
                              <Trophy className="w-4 h-4" />
                              <span className="text-sm font-medium">+{task.points} pts earned</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-green-600">
                            Completed {new Date(task.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {selectedTask && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTask(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{selectedTask.title}</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <p className="text-gray-600 mb-6">{selectedTask.description}</p>

            {selectedTask.category === 'quiz' && selectedTask.quiz ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Quiz Question:</h4>
                <p className="text-gray-700">{selectedTask.quiz.question}</p>
                
                <div className="space-y-2">
                  {selectedTask.quiz.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="quizAnswer"
                        value={index}
                        checked={quizAnswer === index.toString()}
                        onChange={(e) => setQuizAnswer(e.target.value)}
                        className="text-primary-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Task Details</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">Complete this task to earn {selectedTask.points} points!</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedTask(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteTask}
                disabled={completeTaskMutation.isLoading}
                className="btn-primary disabled:opacity-50"
              >
                {completeTaskMutation.isLoading ? 'Completing...' : 'Complete Task'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Tasks
