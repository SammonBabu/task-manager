import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Loader2 } from 'lucide-react';

const NameStep = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // In a real app, you would save this to your backend
      // For now, we'll just store it in the auth context
      window.localStorage.setItem('onboard_name', name);
      const { success, error } = await completeOnboarding({ name });
      
      if (success) {
        navigate('/onboarding/workspace');
      } else {
        setError(error || 'Failed to save your name. Please try again.');
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
            What's your name?
          </h1>
          <p className="text-gray-600">
            This is how you'll appear to others in the app.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="John Doe"
              autoFocus
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Continuing...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NameStep;
