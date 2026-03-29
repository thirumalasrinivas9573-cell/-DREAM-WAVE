import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { reportAPI, goalAPI } from '../services/api'
import toast from 'react-hot-toast'
import { FileText, Download, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react'

const Reports = () => {
  const [selectedGoal, setSelectedGoal] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  const queryClient = useQueryClient()

  const { data: goals } = useQuery(
    'goals',
    () => goalAPI.getGoals(),
    { refetchOnWindowFocus: false }
  )

  const { data: reports, isLoading } = useQuery(
    'reports',
    () => reportAPI.getReports(),
    { refetchOnWindowFocus: false }
  )

  const generateReportMutation = useMutation(reportAPI.generateReport, {
    onSuccess: () => {
      queryClient.invalidateQueries('reports')
      toast.success('Report generated successfully!')
      setIsGenerating(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate report')
      setIsGenerating(false)
    }
  })

  const handleGenerateReport = () => {
    if (!selectedGoal) {
      toast.error('Please select a goal')
      return
    }
    
    setIsGenerating(true)
    generateReportMutation.mutate({ goal: selectedGoal })
  }

  const handleDownloadPDF = async (reportId, goal) => {
    try {
      const response = await reportAPI.downloadPDF(reportId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `R&D_Report_${goal}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download PDF')
    }
  }

  const latestReport = reports?.data?.reports?.[0]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">R&D Reports</h1>
        <p className="text-gray-600 text-lg">Comprehensive career research and analysis</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Generate Report</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Goal
                </label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="input-field"
                >
                  <option value="">Choose a goal...</option>
                  {goals?.data?.goals?.map((goal) => (
                    <option key={goal._id} value={goal.goal}>
                      {goal.goal}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || !selectedGoal}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </motion.div>

        {latestReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Latest Report</h2>
                </div>
                <button
                  onClick={() => handleDownloadPDF(latestReport._id, latestReport.goal)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download PDF</span>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Career Overview</h3>
                  <p className="text-gray-600">{latestReport.report?.careerOverview || 'Loading...'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-800">Market Demand</span>
                    </div>
                    <p className="text-gray-600 text-sm">{latestReport.report?.demand || 'Loading...'}</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-800">Required Skills</span>
                    </div>
                    <p className="text-gray-600 text-sm">{latestReport.report?.skills || 'Loading...'}</p>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-gray-800">Learning Path</span>
                    </div>
                    <p className="text-gray-600 text-sm">{latestReport.report?.learningPath || 'Loading...'}</p>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-gray-800">Potential Risks</span>
                    </div>
                    <p className="text-gray-600 text-sm">{latestReport.report?.risks || 'Loading...'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Salary Expectations</h3>
                  <p className="text-gray-600">{latestReport.report?.salary || 'Loading...'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Growth Opportunities</h3>
                  <p className="text-gray-600">{latestReport.report?.growth || 'Loading...'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Final Decision</h3>
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4">
                    <p className="text-gray-700 font-medium">{latestReport.report?.finalDecision || 'Loading...'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {reports?.data?.reports?.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Previous Reports</h2>
            <div className="space-y-3">
              {reports.data.reports.slice(1).map((report) => (
                <div key={report._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-800">{report.goal}</h3>
                    <p className="text-sm text-gray-600">Generated {new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF(report._id, report.goal)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Reports
