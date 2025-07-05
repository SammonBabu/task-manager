import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext/TaskContext';

const QuickAddTask = () => {
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await addTask({ title: title.trim() });
      setTitle('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mb-6">
      <input
        type="text"
        className="w-full border border-gray-300 rounded-md py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Add a new task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
        disabled={loading || !title.trim()}
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
      </button>
    </form>
  );
};

export default QuickAddTask;
