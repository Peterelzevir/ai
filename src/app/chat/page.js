'use client';

import { ChatProvider } from '@/context/ChatContext';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <ChatProvider>
      <div className="min-h-screen flex flex-col dark:bg-black bg-white pt-16">
        <div className="flex-grow container mx-auto px-4 py-4">
          <ChatInterface />
        </div>
      </div>
    </ChatProvider>
  );
}