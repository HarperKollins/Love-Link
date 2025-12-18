import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  HeartIcon as HeartIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/matches',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      label: 'Discover',
    },
    {
      path: '/likes',
      icon: HeartIcon,
      activeIcon: HeartIconSolid,
      label: 'Likes',
    },
    {
      path: '/chat',
      icon: ChatBubbleLeftIcon,
      activeIcon: ChatBubbleLeftIconSolid,
      label: 'Chat',
    },
    {
      path: '/profile',
      icon: UserIcon,
      activeIcon: UserIconSolid,
      label: 'Profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-pink-500' : 'text-gray-400'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
