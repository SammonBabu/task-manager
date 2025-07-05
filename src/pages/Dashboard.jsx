import { useEffect } from 'react';
import QuickAddTask from '../components/QuickAddTask';
import TaskListItem from '../components/TaskListItem';
import { useTasks } from '../context/TaskContext/TaskContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if user is not logged in
    if (!user) {
      navigate('/auth');
    }
    // Redirect to onboarding if user hasn't completed it
    else if (user?.isNewUser) {
      navigate('/onboarding/name');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { tasks, loading } = useTasks();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Task Manager</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome{user.name ? `, ${user.name}` : ''}!</h2>
          
          {user.workspaceName && (
            <div className="mb-6">
              <p className="text-sm text-gray-500">Workspace</p>
              <p className="text-gray-900 font-medium">{user.workspaceName}</p>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Getting Started</h3>
            <p className="text-sm text-gray-600 mb-4">
              This is your dashboard. You can start by creating your first task or project.
            </p>
            <QuickAddTask />
            {loading ? (
              <p className="text-gray-500">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-gray-500">No tasks yet. Add one above!</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {tasks.map((t) => (
                  <TaskListItem key={t.id} task={t} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
