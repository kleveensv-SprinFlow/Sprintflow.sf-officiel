import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SprintyProvider } from './context/SprintyContext.tsx';
import SprintyChatView from './components/chat/sprinty/SprintyChatView.tsx';
import TabBar from './components/TabBar.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// MOCK: SprintyChatView for visualization
// We are importing the REAL one, but we must MOCK it in the file itself or here.
// But we can't easily mock imports here without Jest/Vitest.
// So we modified SprintyChatView.tsx to have mock data? NO I haven't yet.

// I will modify App.tsx to JUST render the Sprinty View, bypassing Auth.
// And I will modify SprintyChatView.tsx to use static data.

function App() {
  return (
    <SprintyProvider>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<TestLayout />} />
          </Routes>
      </BrowserRouter>
    </SprintyProvider>
  );
}

function TestLayout() {
  // Simulate the App's structure for Sprinty page
  return (
    <div className="min-h-screen bg-sprint-light-background dark:bg-sprint-dark-background text-sprint-light-text-primary dark:text-sprint-dark-text-primary flex flex-col">
       {/* Main Content Area */}
       <main className="flex-1 overflow-hidden">
          <div className="px-4">
             <SprintyChatView />
          </div>
       </main>

       {/* TabBar */}
       <TabBar
          activeTab="sprinty"
          onTabChange={() => {}}
          onFabClick={() => {}}
          userRole="athlete"
       />
       <ToastContainer />
    </div>
  );
}

export default App;
