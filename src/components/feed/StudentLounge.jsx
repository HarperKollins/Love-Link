import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useInView } from 'react-intersection-observer';
import CreatePost from './CreatePost';
import Post from './Post';
import { fetchPosts, createPost, toggleReaction, addComment, deletePost } from '../../services/postService';

const StudentLounge = ({ currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const lastVisibleRef = useRef(null);
  const { ref, inView } = useInView({
    threshold: 0.5
  });

  const loadPosts = useCallback(async (isInitial = false) => {
    try {
      if (!isInitial && !hasMore) return;

      const result = await fetchPosts(isInitial ? null : lastVisibleRef.current);
      if (result && result.posts) {
        setPosts(prev => isInitial ? result.posts : [...prev, ...result.posts]);
        lastVisibleRef.current = result.lastVisible;
        setHasMore(result.hasMore);
        setError('');
      }
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  }, [hasMore]);

  useEffect(() => {
    loadPosts(true);
  }, [loadPosts]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadPosts();
    }
  }, [inView, hasMore, loading, loadPosts]);

  const handlePostCreated = async (content, imageFile) => {
    try {
      const newPost = await createPost(currentUser.uid, content, imageFile, currentUser);
      setPosts(prev => [newPost, ...prev]);
      return true;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      const wasAdded = await toggleReaction(postId, currentUser.uid, reactionType);
      setPosts(prev =>
        prev.map(post => {
          if (post.id === postId) {
            const reactions = { ...post.reactions };
            if (wasAdded) {
              reactions[reactionType] = [...reactions[reactionType], currentUser.uid];
            } else {
              reactions[reactionType] = reactions[reactionType].filter(id => id !== currentUser.uid);
            }
            return { ...post, reactions };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Error updating reaction:', err);
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const newComment = await addComment(postId, content, currentUser);
      setPosts(prev =>
        prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, newComment]
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const handlePostDelete = async (postId) => {
    try {
      await deletePost(postId, currentUser.uid);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <CreatePost currentUser={currentUser} onPostCreated={handlePostCreated} />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg my-4 text-center">
          <p>{error}</p>
          <button 
            onClick={() => {
              setError('');
              loadPosts(true);
            }}
            className="text-sm text-red-700 hover:text-red-800 underline mt-2"
          >
            Try Again
          </button>
        </div>
      )}

      {loading && posts.length === 0 ? (
        <div className="text-center my-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-2">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Please log in</h3>
          <p className="text-gray-500">You need to be logged in to create posts.</p>
        </div>
      ) : (
        <CreatePost onPostCreated={handlePostCreated} currentUser={currentUser} />
      )}
      
      {error && (
        <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-6 mt-6">
        {posts.map(post => (
          <Post
            key={post.id}
            post={post}
            currentUser={currentUser}
            onReactionToggle={handleReaction}
            onCommentAdded={handleComment}
            onPostDeleted={handlePostDelete}
          />
        ))}
      </div>

      {loading && (
        <div className="text-center my-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      )}

      {hasMore && (
        <div ref={ref} style={{ height: '10px' }} />
      )}
    </div>
  );
};

StudentLounge.propTypes = {
  currentUser: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    photoURL: PropTypes.string,
    displayName: PropTypes.string,
    university: PropTypes.string
  }).isRequired
};

export default StudentLounge;
