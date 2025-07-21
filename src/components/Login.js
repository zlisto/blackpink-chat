import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onLogin) onLogin(data.user);
        navigate('/'); // Redirect to Home
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (err) {
      setError('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', background: 'black', color: '#fff', borderRadius: 12, padding: 32, border: '2px solid #ff3ebf' }}>
      <h2 style={{ color: '#ff3ebf', textAlign: 'center' }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required style={inputStyle} />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required style={inputStyle} />
        <button type="submit" disabled={loading} style={buttonStyle}>{loading ? 'Logging in...' : 'Login'}</button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 10px',
  margin: '10px 0',
  borderRadius: 8,
  border: '1px solid #ff3ebf',
  background: 'black',
  color: '#fff',
  fontSize: 16
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: 8,
  background: '#ff3ebf',
  color: 'white',
  border: 'none',
  fontWeight: 'bold',
  fontSize: 18,
  marginTop: 10,
  cursor: 'pointer'
};

export default Login; 