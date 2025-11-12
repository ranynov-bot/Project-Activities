import React, { useState, useEffect, useCallback } from 'react';
import { Activity } from './types';
import { getActivities, saveActivities } from './services/geminiService';
import Header from './components/PlannerInput';
import ActivityForm from './components/WeekView';
import ActivityTable from './components/DayColumn';
import Dashboard from './components/ActivityItem';
import Modal from './components/icons/LoaderIcon';
import AuthModal from './components/AuthModal';
import { useNotifications } from './components/NotificationProvider';
import NotificationContainer from './components/NotificationContainer';

type Page = 'entry' | 'results' | 'analysis';

interface User {
  id: string;
  name: string;
  isAdmin: boolean;
}

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState<Page>('entry');
  const [user, setUser] = useState<User | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [lastAddedActivity, setLastAddedActivity] = useState<Activity | null>(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Attempt to load user session from localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setIsAuthModalOpen(true); // Open auth modal if no user session
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      setIsAuthModalOpen(true);
    }
    
    setActivities(getActivities());
  }, []);

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    if (page !== 'entry') {
      setLastAddedActivity(null);
    }
  }, [page]);

  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      const upcomingActivities = activities.filter(activity => {
        if (activity.status === 'Completed' || activity.status === 'Cancelled') {
          return false;
        }
        const startDate = new Date(activity.startDate);
        const diffHours = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 24;
      });

      upcomingActivities.forEach(activity => {
        const notificationId = `deadline-${activity.id}`;
        if (!sessionStorage.getItem(notificationId)) {
          addNotification(
            `'${activity.title}' is starting soon.`,
            'warning',
            'Upcoming Activity'
          );
          sessionStorage.setItem(notificationId, 'true');
        }
      });
    };

    if (activities.length > 0) {
      checkDeadlines();
    }
  }, [activities, addNotification]);

  const handleLogin = useCallback((isAdmin = false) => {
    const loggedInUser = { id: crypto.randomUUID(), name: isAdmin ? 'Admin User' : 'Standard User', isAdmin };
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setIsAuthModalOpen(false);
    addNotification(`Welcome, ${loggedInUser.name}!`, 'success');
  }, [addNotification]);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    setPage('entry'); // Reset to default page on logout
    setIsAuthModalOpen(true); // Show login screen after logout
  }, []);

  const handleAddActivity = useCallback((newActivity: Omit<Activity, 'id'>) => {
    // FIX: Explicitly type `activityWithId` as `Activity` to resolve type inference issues.
    const activityWithId: Activity = { ...newActivity, id: crypto.randomUUID() };
    setActivities(prev => [...prev, activityWithId]);
    addNotification('Activity added successfully!', 'success');
    setLastAddedActivity(activityWithId);
  }, [addNotification]);
  
  const handleUpdateActivity = useCallback((updatedActivity: Activity) => {
    setActivities(prev => prev.map(act => act.id === updatedActivity.id ? updatedActivity : act));
    setEditingActivity(null);
    addNotification('Activity updated successfully!', 'success');
  }, [addNotification]);

  const handleDeleteActivity = useCallback((activityId: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      setActivities(prev => prev.filter(act => act.id !== activityId));
      addNotification('Activity deleted successfully.', 'info');
    }
  }, [addNotification]);

  const renderPage = () => {
    const entryForm = (
        <ActivityForm 
            onSubmit={handleAddActivity}
            submittedActivity={lastAddedActivity}
            onClearSubmitted={() => setLastAddedActivity(null)}
            onNavigateToResults={() => setPage('results')}
            onEditNewActivity={setEditingActivity}
            isAdmin={!!user?.isAdmin}
        />
    );

    switch (page) {
      case 'entry':
        return entryForm;
      case 'results':
        return <ActivityTable activities={activities} isAdmin={!!user?.isAdmin} onEdit={setEditingActivity} onDelete={handleDeleteActivity} />;
      case 'analysis':
        return <Dashboard activities={activities} />;
      default:
        return entryForm;
    }
  };
  
  if (!user) {
    return <AuthModal onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans bg-slate-100 dark:bg-slate-900">
      <NotificationContainer />
      <Header 
        currentPage={page}
        onNavigate={setPage}
        user={user}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderPage()}
        {editingActivity && (
          <Modal title="Edit Activity" onClose={() => setEditingActivity(null)}>
            <ActivityForm 
              isEditMode={true}
              activityToEdit={editingActivity}
              // FIX: The `activity` object from the form is not correctly inferred. Spreading `editingActivity` first ensures the resulting object is a valid `Activity`.
              onSubmit={(activity) => {
                const updatedActivity: Activity = { ...editingActivity, ...activity };
                handleUpdateActivity(updatedActivity);
              }}
              onCancel={() => setEditingActivity(null)}
              isAdmin={!!user?.isAdmin}
            />
          </Modal>
        )}
      </main>
    </div>
  );
}

export default App;