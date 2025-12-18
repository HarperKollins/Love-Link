# Love Link

A modern dating application built with React, Firebase, and Tailwind CSS.

## Features

- User authentication (email/password and Google)
- Profile management
- Match discovery
- Real-time chat
- Subscription plans
- Mobile-responsive design

## Tech Stack

- React
- Firebase (Authentication, Firestore)
- Tailwind CSS
- Vite

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/love-link.git
   cd love-link
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Firebase project and enable Authentication and Firestore.

4. Copy the `.env.example` file to `.env` and fill in your Firebase configuration:
   ```bash
   cp .env.example .env
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Project Structure

```
src/
  ├── components/     # React components
  ├── contexts/       # React contexts
  ├── firebase.js     # Firebase configuration
  └── App.jsx         # Main application component
```

## Recent Updates

### Chat Functionality Fixes (December 2024)
- Fixed chat routing to use proper `ChatList` and `ChatDetail` components
- Resolved Firestore API bug in `Chat.jsx` component
- Improved real-time message synchronization
- Enhanced chat UI responsiveness

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Firebase](https://firebase.google.com/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)