import React from 'react';
import PropTypes from 'prop-types';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const ProfileCard = ({
  name,
  age,
  location,
  bio,
  imageUrl,
  onLike,
  onMessage,
  interests = [],
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Profile Image */}
      <div className="relative h-96 w-full">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-2xl font-bold">{name}, {age}</h2>
              <p className="text-white/80">{location}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onLike}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                aria-label="Like profile"
              >
                <HeartIcon className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={onMessage}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                aria-label="Message profile"
              >
                <ChatBubbleLeftIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bio and Interests */}
      <div className="p-4">
        <p className="text-gray-600 mb-4">{bio}</p>
        
        {/* Interests Tags */}
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

ProfileCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
  location: PropTypes.string.isRequired,
  bio: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  onLike: PropTypes.func.isRequired,
  onMessage: PropTypes.func.isRequired,
  interests: PropTypes.arrayOf(PropTypes.string),
};

export default ProfileCard; 