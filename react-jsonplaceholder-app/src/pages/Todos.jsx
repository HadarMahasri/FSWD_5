import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Trash2, Plus, Check } from 'lucide-react';
import './Todos.css';

const Todos = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and Sort
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, active
  const [sortBy, setSortBy] = useState('id'); // id, title, completed

  const [newTodoTitle, setNewTodoTitle] = useState('');

  useEffect(() => {
    fetchTodos();
  }, [user.id]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`http://localhost:5000/todos?userId=${user.id}`);
      setTodos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    
    const newTodo = {
      userId: user.id,
      title: newTodoTitle,
      completed: false
    };

    try {
      const savedTodo = await apiFetch('http://localhost:5000/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      });
      setTodos([...todos, savedTodo]);
      setNewTodoTitle('');
    } catch (error) {
      console.error(error);
    }
  };

  const toggleComplete = async (todo) => {
    try {
      const updatedTodo = await apiFetch(`http://localhost:5000/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });
      
      setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await apiFetch(`http://localhost:5000/todos/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const updateTodoTitle = async (id, newTitle) => {
    try {
      const updatedTodo = await apiFetch(`http://localhost:5000/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (error) {
      console.error(error);
    }
  };

  // Derived state for display
  const filteredAndSortedTodos = todos
    .filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(search.toLowerCase()) || 
                            todo.id.toString().includes(search);
      const matchesStatus = filterStatus === 'all' ? true : 
                            filterStatus === 'completed' ? todo.completed : !todo.completed;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'completed') return (a.completed === b.completed) ? 0 : a.completed ? -1 : 1;
      return a.id - b.id; // default ID sort
    });

  return (
    <div className="todos-page">
      <div className="page-header">
        <h1>My Todos</h1>
      </div>

      <div className="card add-todo-card">
        <form onSubmit={handleAddTodo} className="add-todo-form">
          <input 
            type="text" 
            placeholder="Add a new task..." 
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
          />
          <button type="submit" className="btn btn-primary"><Plus size={18} /> Add</button>
        </form>
      </div>

      <div className="filters-bar card">
        <div className="input-group search-group">
          <label>Search (ID or Title)</label>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
        </div>
        <div className="input-group">
          <label>Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="input-group">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="id">ID</option>
            <option value="title">Title</option>
            <option value="completed">Completion</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loader" style={{marginTop: '2rem'}}></div>
      ) : (
        <ul className="todo-list">
          {filteredAndSortedTodos.length === 0 ? (
            <p className="empty-msg">No todos found.</p>
          ) : (
            filteredAndSortedTodos.map(todo => (
              <li key={todo.id} className={`todo-item card ${todo.completed ? 'completed' : ''}`}>
                <div className="todo-checkbox" onClick={() => toggleComplete(todo)}>
                  {todo.completed && <Check size={14} color="white" />}
                </div>
                <div className="todo-content">
                  <span className="todo-id">#{todo.id}</span>
                  <input 
                    type="text" 
                    value={todo.title}
                    onChange={(e) => {
                      const newTodos = [...todos];
                      const t = newTodos.find(x => x.id === todo.id);
                      t.title = e.target.value;
                      setTodos(newTodos);
                    }}
                    onBlur={(e) => updateTodoTitle(todo.id, e.target.value)}
                    className="todo-title-input"
                  />
                </div>
                <button className="btn-icon delete-btn" onClick={() => deleteTodo(todo.id)}>
                  <Trash2 size={18} />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default Todos;
