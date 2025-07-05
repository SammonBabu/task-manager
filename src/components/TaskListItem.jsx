import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext/TaskContext';

const statusColors = {
  'To Do': 'text-gray-500 bg-gray-100',
  'In Progress': 'text-blue-600 bg-blue-50',
  Done: 'text-green-600 bg-green-50',
};

const TaskListItem = ({ task }) => {
  const { deleteTask, updateTask } = useTasks();
  const [deleting, setDeleting] = useState(false);

  const toggleStatus = () => {
    const next = {
      'To Do': 'In Progress',
      'In Progress': 'Done',
      Done: 'To Do',
    }[task.status] || 'To Do';
    updateTask(task.id, { status: next });
  };

  const handleDelete = () => {
    setDeleting(true);
    // wait for CSS transition before deleting from Firestore to let animation play
    setTimeout(() => deleteTask(task.id), 200);
  };

  const pillClass = `${statusColors[task.status] || 'text-gray-500 bg-gray-100'} px-2 py-0.5 rounded-full ml-2 text-xs capitalize`;

  return (
    <li
      className={`py-2 flex items-center justify-between transition duration-200 ease-in-out ${
        deleting ? 'opacity-0 scale-95' : 'opacity-100'
      }`}
    >
      <button onClick={toggleStatus} className="text-left flex-1">
        <span>{task.title}</span>
        <span className={pillClass}>{task.status}</span>
      </button>
      <button
        onClick={handleDelete}
        className="p-1 rounded hover:bg-red-50 text-red-500"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
};

export default TaskListItem;
