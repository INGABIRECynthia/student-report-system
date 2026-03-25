import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/students':  'Students',
  '/subjects':  'Subjects',
  '/marks':     'Marks Entry',
  '/reports':   'Reports',
};

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const title = pageTitles[location.pathname] || 'EduReport';

  useEffect(() => {
    const socket = getSocket();

    const onMarksUpdated = (data) => {
      const msg = `Marks updated: ${data.student_name} - ${data.subject_name} (${data.score})`;
      toast.success(msg, { duration: 4000 });
      setNotifications((n) => [{ id: Date.now(), msg, type: 'marks' }, ...n.slice(0, 9)]);
    };

    const onNewReport = (data) => {
      const msg = `Report generated for ${data.studentName}`;
      toast.success(msg, { duration: 4000, icon: '📄' });
      setNotifications((n) => [{ id: Date.now(), msg, type: 'report' }, ...n.slice(0, 9)]);
    };

    socket.on('marksUpdated', onMarksUpdated);
    socket.on('newReportGenerated', onNewReport);

    return () => {
      socket.off('marksUpdated', onMarksUpdated);
      socket.off('newReportGenerated', onNewReport);
    };
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-100 z-10 flex items-center px-4 gap-4">
      {/* Hamburger */}
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        onClick={onMenuClick}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h1 className="text-lg font-semibold text-gray-900 flex-1">{title}</h1>

      {/* Notification bell */}
      <div className="relative">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {/* User avatar */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
      </div>
    </header>
  );
};

export default Navbar;
