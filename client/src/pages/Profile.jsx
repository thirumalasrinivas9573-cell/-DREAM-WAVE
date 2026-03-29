import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { profileAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { User, Camera, Award, Download, Edit2, Save, X } from 'lucide-react'

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', bio: '' })
  const [selectedFile, setSelectedFile] = useState(null)
  
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery(
    'profile',
    () => profileAPI.getProfile(),
    { refetchOnWindowFocus: false }
  )

  const updateProfileMutation = useMutation(profileAPI.updateProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('profile')
      queryClient.invalidateQueries('auth')
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  })

  const uploadImageMutation = useMutation(profileAPI.uploadImage, {
    onSuccess: (response) => {
      queryClient.invalidateQueries('profile')
      queryClient.invalidateQueries('auth')
      toast.success('Profile picture updated!')
      setSelectedFile(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    }
  })

  const generateCertificateMutation = useMutation(profileAPI.generateCertificate, {
    onSuccess: () => {
      queryClient.invalidateQueries('profile')
      toast.success('Certificate generated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate certificate')
    }
  })

  const handleEdit = () => {
    setEditForm({
      name: profile?.data?.user?.name || user?.name || '',
      bio: profile?.data?.user?.bio || ''
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    updateProfileMutation.mutate(editForm)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const formData = new FormData()
      formData.append('image', file)
      uploadImageMutation.mutate(formData)
    }
  }

  const handleGenerateCertificate = (type) => {
    generateCertificateMutation.mutate({
      type,
      title: `${type} Certificate`
    })
  }

  const userProfile = profile?.data?.user

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Profile</h1>
        <p className="text-gray-600 text-lg">Manage your profile and achievements</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                {userProfile?.profileImage ? (
                  <img
                    src={userProfile.profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {userProfile?.name || user?.name}
              </h2>
              <p className="text-primary-600 font-semibold mb-4">AAID: {user?.aaid}</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{userProfile?.level || user?.level}</div>
                  <div className="text-sm text-gray-600">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userProfile?.credits || user?.credits}</div>
                  <div className="text-sm text-gray-600">Credits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userProfile?.streak || user?.streak}</div>
                  <div className="text-sm text-gray-600">Streak</div>
                </div>
              </div>

              <button
                onClick={handleEdit}
                className="btn-secondary w-full flex items-center justify-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          {isEditing ? (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    className="input-field"
                    rows="4"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isLoading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-800">{userProfile?.name || user?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-800">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">AAID</label>
                      <p className="text-gray-800 font-mono">{user?.aaid}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Member Since</label>
                      <p className="text-gray-800">{new Date(userProfile?.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {userProfile?.bio && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bio</label>
                      <p className="text-gray-800">{userProfile.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Certificates</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleGenerateCertificate('Goal Achievement')}
                      className="btn-secondary text-sm"
                    >
                      Generate Certificate
                    </button>
                  </div>
                </div>

                {userProfile?.certificates?.length > 0 ? (
                  <div className="space-y-3">
                    {userProfile.certificates.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Award className="w-8 h-8 text-yellow-600" />
                          <div>
                            <h3 className="font-semibold text-gray-800">{cert.title}</h3>
                            <p className="text-sm text-gray-600">
                              Issued {new Date(cert.issuedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button className="btn-secondary flex items-center space-x-2">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Certificates Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Complete goals and tasks to earn certificates
                    </p>
                    <button
                      onClick={() => handleGenerateCertificate('Goal Achievement')}
                      className="btn-primary"
                    >
                      Generate First Certificate
                    </button>
                  </div>
                )}
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Progress Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Goals Progress</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Active Goals</span>
                        <span className="font-medium">{userProfile?.goals?.length || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full"
                          style={{ width: `${Math.min((userProfile?.goals?.length || 0) * 20, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Tasks Completed</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completed Tasks</span>
                        <span className="font-medium">{userProfile?.tasks?.length || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-600 to-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((userProfile?.tasks?.length || 0) * 10, 100)}%` }}
                        />
                      </div>
                    </div>
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

export default Profile
