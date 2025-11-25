// src/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import BottomNavBar from '../components/navigation/BottomNavBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-sprint-dark-background text-sprint-dark-text-primary flex flex-col">
      <main className="flex-1 overflow-x-hidden overflow-y-auto pb-28">
        <Outlet />
      </main>
      <BottomNavBar />
      <ToastContainer position="bottom-center" autoClose={3000} theme="dark" />
    </div>
  );
};

export default MainLayout;
