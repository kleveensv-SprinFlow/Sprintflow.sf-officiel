import React from 'react';
import { IndividualChatView } from '../chat/IndividualChatView';
import { useAuth } from '../../hooks/useAuth';
import { Conversation } from '../../types'; // This should be correct now if types/index.ts exports it

const SprintyPage: React.FC = () => {
  const { user } = useAuth();

  // Construct a dummy conversation object for Sprinty
  const sprintyConversation: any = {
    id: 'sprinty-chat', 
    user_id: user?.id || '',
    title: 'Sprinty',
    is_pinned: true,
    created_at: new Date().toISOString(),
    partner_id: '00000000-0000-0000-0000-000000000000',
    conversation_name: 'Sprinty',
    conversation_photo_url: 'https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/sprinty-avatar.png', 
    conversation_type: 'individual',
    unread_count: 0,
    last_message_content: '',
    last_message_at: '',
    last_message_sender_name: ''
  };

  return (
    <div className="h-full flex flex-col">
      <IndividualChatView 
        conversation={sprintyConversation} 
        onBack={() => {
            window.history.back();
        }} 
      />
    </div>
  );
};

export default SprintyPage;
