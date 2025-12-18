import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, startAfter, getDocs, serverTimestamp, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { uploadImage, validateImage } from './uploadService';

const POSTS_COLLECTION = 'posts';
const POSTS_PER_PAGE = 10;

// Initialize posts collection with demo data if empty
const initializePostsCollection = async () => {
  try {
    const postsRef = collection(db, POSTS_COLLECTION);
    const snapshot = await getDocs(query(postsRef, limit(1)));
    
    if (snapshot.empty) {
      // Add a welcome post
      const welcomePost = {
        id: 'welcome',
        userId: 'admin',
        content: 'Welcome to Love Link! 💕\n\nThis is where you can share your thoughts, photos, and connect with other students. Start by creating your first post!',
        reactions: { heart: [], fire: [], laugh: [] },
        comments: [],
        createdAt: serverTimestamp(),
        user: {
          displayName: 'Love Link Team',
          photoURL: '/logo.png',
          university: 'Love Link HQ'
        }
      };
      
      await setDoc(doc(db, POSTS_COLLECTION, 'welcome'), welcomePost);
    }
  } catch (error) {
    console.error('Error initializing posts collection:', error);
  }
};

export const createPost = async (userId, content, imageFile = null, user) => {
  try {
    // Validate user data
    if (!userId || !user) {
      throw new Error('User data is missing');
    }

    // Handle image upload if present
    let imageUrl = null;
    if (imageFile) {
      try {
        validateImage(imageFile);
        imageUrl = await uploadImage(imageFile, 'post');
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        throw new Error('Failed to upload image. Please try again.');
      }
    }

    // Prepare post data
    const postData = {
      userId,
      content: content || '',
      imageUrl,
      reactions: {
        heart: [],
        fire: [],
        laugh: []
      },
      comments: [],
      createdAt: serverTimestamp(),
      user: {
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '/default-avatar.png',
        university: user.university || 'Unknown University'
      }
    };

    // Save to Firestore
    try {
      const docRef = await addDoc(collection(db, 'posts'), postData);
      return { 
        id: docRef.id, 
        ...postData,
        createdAt: new Date() // Replace serverTimestamp with actual date for immediate display
      };
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save post. Please check your connection and try again.');
    }
  } catch (error) {
    console.error('Error creating post:', error);
    throw error; // Throw the specific error message
  }
};

/**
 * Fetch posts with pagination
 */
export const fetchPosts = async (lastVisibleDoc = null) => {
  await initializePostsCollection(); // Initialize posts collection if empty
  try {
    let postsQuery;
    if (lastVisibleDoc) {
      postsQuery = query(
        collection(db, POSTS_COLLECTION),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisibleDoc),
        limit(POSTS_PER_PAGE)
      );
    } else {
      postsQuery = query(
        collection(db, POSTS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(POSTS_PER_PAGE)
      );
    }

    const snapshot = await getDocs(postsQuery);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If no posts, return demo data
    if (posts.length === 0) {
      return {
        posts: [
          {
            id: '1',
            content: 'Welcome to Love Link! Share your thoughts and connect with others. ❤️',
            reactions: {
              heart: [],
              fire: [],
              laugh: []
            },
            comments: [],
            createdAt: new Date().toISOString(),
            user: {
              id: 'admin',
              name: 'Love Link Team',
              photoURL: 'https://api.dicebear.com/6.x/bottts/svg?seed=admin'
            }
          },
          {
            id: '2',
            content: 'Anyone else studying Computer Science? Let\'s connect! 💻',
            reactions: {
              heart: ['user1'],
              fire: [],
              laugh: []
            },
            comments: [],
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            user: {
              id: 'user1',
              name: 'Tech Enthusiast',
              photoURL: 'https://api.dicebear.com/6.x/bottts/svg?seed=user1'
            }
          }
        ],
        lastVisible: null,
        hasMore: false
      };
    }

    return {
      posts,
      lastVisible: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === POSTS_PER_PAGE
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to load posts. Please try again.');
  }
};

export const toggleReaction = async (postId, userId, reactionType) => {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postDoc = await getDocs(postRef);
    const post = postDoc.data();

    const hasReacted = post.reactions[reactionType].includes(userId);
    await updateDoc(postRef, {
      [`reactions.${reactionType}`]: hasReacted 
        ? arrayRemove(userId)
        : arrayUnion(userId)
    });
    return !hasReacted;
  } catch (error) {
    console.error('Error toggling reaction:', error);
    throw new Error('Failed to update reaction. Please try again.');
  }
};

export const addComment = async (postId, comment, user) => {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const newComment = {
      id: Date.now().toString(),
      userId: user.uid,
      content: comment,
      createdAt: serverTimestamp(),
      user: {
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    };

    await updateDoc(postRef, {
      comments: arrayUnion(newComment)
    });

    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment. Please try again.');
  }
};

export const deletePost = async (postId, userId) => {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postDoc = await getDocs(postRef);
    const post = postDoc.data();

    if (post.userId !== userId) {
      throw new Error('You can only delete your own posts.');
    }

    await deleteDoc(postRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw new Error(error.message || 'Failed to delete post. Please try again.');
  }
};
