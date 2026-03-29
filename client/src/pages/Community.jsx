import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { communityAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Users, MessageCircle, Heart, Send, UserPlus, Search } from 'lucide-react'

const Community = () => {
  const [newPost, setNewPost] = useState('')
  const [commentText, setCommentText] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [activeTab, setActiveTab] = useState('posts')
  
  const queryClient = useQueryClient()

  const { data: posts, isLoading: postsLoading } = useQuery(
    'posts',
    () => communityAPI.getPosts(),
    { refetchOnWindowFocus: false }
  )

  const { data: friends, isLoading: friendsLoading } = useQuery(
    'friends',
    () => communityAPI.getFriends(),
    { refetchOnWindowFocus: false }
  )

  const createPostMutation = useMutation(communityAPI.createPost, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts')
      toast.success('Post created successfully!')
      setNewPost('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create post')
    }
  })

  const likePostMutation = useMutation(communityAPI.likePost, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to like post')
    }
  })

  const commentPostMutation = useMutation(
    ({ id, content }) => communityAPI.commentPost(id, content),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts')
        toast.success('Comment added!')
        setCommentText('')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add comment')
      }
    }
  )

  const addFriendMutation = useMutation(communityAPI.addFriend, {
    onSuccess: () => {
      queryClient.invalidateQueries('friends')
      toast.success('Friend added successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add friend')
    }
  })

  const handleCreatePost = () => {
    if (!newPost.trim()) {
      toast.error('Please write something')
      return
    }
    createPostMutation.mutate({ content: newPost })
  }

  const handleLikePost = (postId) => {
    likePostMutation.mutate(postId)
  }

  const handleComment = (postId) => {
    if (!commentText.trim()) {
      toast.error('Please write a comment')
      return
    }
    commentPostMutation.mutate({ id: postId, content: commentText })
  }

  const handleAddFriend = (userId) => {
    addFriendMutation.mutate(userId)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Community</h1>
        <p className="text-gray-600 text-lg">Connect with like-minded individuals</p>
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Create Post</h2>
            </div>

            <div className="space-y-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your thoughts with the community..."
                className="input-field"
                rows="4"
              />
              <button
                onClick={handleCreatePost}
                disabled={createPostMutation.isLoading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {createPostMutation.isLoading ? 'Posting...' : 'Share Post'}
              </button>
            </div>
          </div>

          <div className="card mt-6">
            <h3 className="font-semibold text-gray-800 mb-4">Friends</h3>
            
            {friendsLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : friends?.data?.friends?.length > 0 ? (
              <div className="space-y-3">
                {friends.data.friends.map((friend) => (
                  <div key={friend._id} className="flex items-center space-x-3">
                    {friend.profileImage ? (
                      <img src={friend.profileImage} alt={friend.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{friend.name}</p>
                      <p className="text-xs text-gray-500">Level {friend.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No friends yet</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Community Posts</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'posts'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('discover')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'discover'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Discover
                </button>
              </div>
            </div>

            {postsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : posts?.data?.posts?.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
                <p className="text-gray-600">Be the first to share something with the community!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.data.posts.map((post) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      {post.user.profileImage ? (
                        <img src={post.user.profileImage} alt={post.user.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">{post.user.name}</h4>
                            <p className="text-xs text-gray-500">AAID: {post.user.aaid}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{post.content}</p>
                        
                        {post.image && (
                          <img src={post.image} alt="Post image" className="w-full rounded-lg mb-4" />
                        )}
                        
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLikePost(post._id)}
                            className={`flex items-center space-x-1 ${
                              post.likes.some(like => like.user._id === post.user._id)
                                ? 'text-red-600'
                                : 'text-gray-600 hover:text-red-600'
                            } transition-colors`}
                          >
                            <Heart className={`w-5 h-5 ${post.likes.some(like => like.user._id === post.user._id) ? 'fill-current' : ''}`} />
                            <span className="text-sm">{post.likes.length}</span>
                          </button>
                          
                          <button
                            onClick={() => setSelectedPost(post)}
                            className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{post.comments.length}</span>
                          </button>
                          
                          <button
                            onClick={() => handleAddFriend(post.user._id)}
                            className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
                          >
                            <UserPlus className="w-5 h-5" />
                            <span className="text-sm">Add Friend</span>
                          </button>
                        </div>
                        
                        {post.comments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {post.comments.slice(0, 2).map((comment) => (
                              <div key={comment._id} className="flex items-start space-x-2">
                                {comment.user.profileImage ? (
                                  <img src={comment.user.profileImage} alt={comment.user.name} className="w-8 h-8 rounded-full" />
                                ) : (
                                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                  <p className="text-sm font-medium text-gray-800">{comment.user.name}</p>
                                  <p className="text-sm text-gray-700">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                            {post.comments.length > 2 && (
                              <p className="text-sm text-gray-500 text-center">
                                View all {post.comments.length} comments
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {selectedPost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPost(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Post Comments</h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-start space-x-3">
                  {selectedPost.user.profileImage ? (
                    <img src={selectedPost.user.profileImage} alt={selectedPost.user.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{selectedPost.user.name}</h4>
                    <p className="text-gray-700">{selectedPost.content}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedPost.comments.map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-3">
                    {comment.user.profileImage ? (
                      <img src={comment.user.profileImage} alt={comment.user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800">{comment.user.name}</p>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 input-field"
                  />
                  <button
                    onClick={() => handleComment(selectedPost._id)}
                    className="btn-primary"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Community
