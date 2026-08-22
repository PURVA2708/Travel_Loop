import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { AssistantWidget } from '@/features/assistant/AssistantWidget';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>
      <BottomNav />
      <AssistantWidget />
    </div>
  );
};
