import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../../services/authService';
import { Check, Loader2 } from 'lucide-react';

const WorkspaceStep = () => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // In a real app, you would save this to your backend
      const fullName = window.localStorage.getItem('onboard_name') || '';
      const { success, error } = await updateProfile({ fullName, workspaceName });
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError(error || 'Failed to create workspace. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            What's your workspace name?
          </h1>
          <p className="text-gray-600">
            This is the name of your team or company. You can change it later.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="workspace" className="block text-sm font-medium text-gray-700 mb-1">
              Workspace Name
            </label>
            <input
              id="workspace"
              name="workspace"
              type="text"
              required
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="input"
              placeholder="Acme Inc."
              autoFocus
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !workspaceName.trim()}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Creating workspace...
                </>
              ) : (
                <>
                  Create Workspace
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceStep;
