import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc as firestoreDoc } from 'firebase/firestore';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getFirestore,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { app } from '../../firebase';
import { useAuth } from '../AuthContext';

// Create context
const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);

  // subscribe to tasks for current user
  useEffect(() => {
    if (!user?.uid) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [db, user?.uid]);

  const addTask = useCallback(
    async ({ title, status = 'To Do', priority = 'Low', dueDate = null, description = '' }) => {
      if (!user?.uid) return;
      await addDoc(collection(db, 'tasks'), {
        title,
        status,
        priority,
        dueDate: dueDate || null,
        description,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [db, user?.uid]
  );

  const updateTask = useCallback(
    async (id, updates) => {
      if (!id) return;
      const ref = firestoreDoc(db, 'tasks', id);
      await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    },
    [db]
  );

  const deleteTaskById = useCallback(
    async (id) => {
      if (!id) return;
      const ref = firestoreDoc(db, 'tasks', id);
      await deleteDoc(ref);
    },
    [db]
  );

  const value = { tasks, loading, addTask, updateTask, deleteTask: deleteTaskById };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => useContext(TaskContext);
