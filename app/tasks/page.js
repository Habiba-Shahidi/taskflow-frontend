'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  async function loadTasks() {
    const res = await fetch(`${API}/tasks`, { headers: authHeaders() });
    if (res.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }
    if (!res.ok) {
      setError('Could not load tasks');
      return;
    }
    setTasks(await res.json());
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    loadTasks();
  }, []);

  async function addTask(e) {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    setTitle('');
    loadTasks();
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditTitle(task.title);
  }

  async function saveEdit(id) {
    setError('');
    const res = await fetch(`${API}/tasks/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ title: editTitle }),
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    setEditingId(null);
    loadTasks();
  }

  async function deleteTask(id) {
    await fetch(`${API}/tasks/${id}`, { method: 'DELETE', headers: authHeaders() });
    loadTasks();
  }

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  return (
    <div>
      <h1>My Tasks</h1>
      <button onClick={logout}>Log out</button>

      <form onSubmit={addTask}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task" />
        <button type="submit">Add</button>
      </form>
      {error && <p>{error}</p>}

      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {editingId === t.id ? (
              <>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <button onClick={() => saveEdit(t.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {t.title}
                <button onClick={() => startEdit(t)}>Edit</button>
                <button onClick={() => deleteTask(t.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}