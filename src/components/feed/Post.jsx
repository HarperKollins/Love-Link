import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Post = ({ post, currentUser, onReaction, onComment, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onComment(newComment.trim());
    setNewComment('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.user.photoURL || '/default-avatar.png'}
            alt={post.user.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-800">
              {post.user.displayName}
            </h3>
            <p className="text-gray-500 text-sm">
              {post.user.university} · {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-4">
          <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
          {post.imageUrl && (
            <div className="mt-3 relative">
              <img
                src={post.imageUrl}
                alt="Post content"
                className="w-full h-auto rounded-lg object-cover max-h-[500px]"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Reactions and Comments */}
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onReaction('heart')}
              className={`flex items-center space-x-2 ${post.reactions.heart.includes(currentUser?.uid) ? 'text-pink-500' : 'text-gray-500'} hover:text-pink-500 transition-colors`}
            >
              <span className="text-xl">❤️</span>
              <span className="font-medium">{post.reactions.heart.length}</span>
            </button>
            <button
              onClick={() => onReaction('fire')}
              className={`flex items-center space-x-2 ${post.reactions.fire.includes(currentUser?.uid) ? 'text-orange-500' : 'text-gray-500'} hover:text-orange-500 transition-colors`}
            >
              <span className="text-xl">🔥</span>
              <span className="font-medium">{post.reactions.fire.length}</span>
            </button>
            <button
              onClick={() => onReaction('laugh')}
              className={`flex items-center space-x-2 ${post.reactions.laugh.includes(currentUser?.uid) ? 'text-yellow-500' : 'text-gray-500'} hover:text-yellow-500 transition-colors`}
            >
              <span className="text-xl">😂</span>
              <span className="font-medium">{post.reactions.laugh.length}</span>
            </button>
          </div>
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {post.comments?.length || 0} comments
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-4">
            {post.comments?.map((comment, index) => (
              <div key={comment.id || index} className="flex items-start space-x-3">
                <img
                  src={comment.user?.photoURL || '/default-avatar.png'}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium">{comment.user?.displayName}</p>
                  <p className="text-gray-700">{comment.content}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {formatTimeAgo(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {/* New Comment Form */}
            <form onSubmit={handleComment} className="mt-4 flex items-center space-x-3">
              <img
                src={currentUser?.photoURL || '/default-avatar.png'}
                alt=""
                className="w-8 h-8 rounded-full"
              />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white"
              />
              <button
                type="submit"
                className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

Post.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    reactions: PropTypes.shape({
      heart: PropTypes.arrayOf(PropTypes.string),
      fire: PropTypes.arrayOf(PropTypes.string),
      laugh: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    comments: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        content: PropTypes.string.isRequired,
        createdAt: PropTypes.instanceOf(Date),
        user: PropTypes.shape({
          displayName: PropTypes.string,
          photoURL: PropTypes.string
        })
      })
    ),
    createdAt: PropTypes.instanceOf(Date).isRequired,
    user: PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      photoURL: PropTypes.string,
      university: PropTypes.string
    }).isRequired
  }).isRequired,
  currentUser: PropTypes.shape({
    uid: PropTypes.string,
    photoURL: PropTypes.string,
    displayName: PropTypes.string
  }),
  onReaction: PropTypes.func.isRequired,
  onComment: PropTypes.func.isRequired
};

export default Post;
