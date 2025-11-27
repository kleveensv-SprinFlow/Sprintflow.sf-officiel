// src/pages/ChatPage.tsx
import React from 'react';
import SprintyChatView from '../components/chat/sprinty/SprintyChatView';

const ChatPage: React.FC = () => {
  return (
    // On utilise 'fixed inset-0' et un z-index élevé pour que cette page 
    // passe par dessus le layout standard et son header
    <div className="fixed inset-0 z-50 bg-sprint-dark-background flex flex-col">
      <SprintyChatView />
    </div>
  );
};

export default ChatPage;