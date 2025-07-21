import { useState } from 'react';

function Register({ onRegister }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Account created! You can now log in.');
        setForm({ username: '', password: '', firstName: '', lastName: '', email: '' });
        if (onRegister) onRegister();
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', background: 'black', color: '#fff', borderRadius: 12, padding: 32, border: '2px solid #ff3ebf' }}>
      <h2 style={{ color: '#ff3ebf', textAlign: 'center' }}>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required style={inputStyle} />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required style={inputStyle} />
        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required style={inputStyle} />
        <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required style={inputStyle} />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email Address" required style={inputStyle} />
        <button type="submit" disabled={loading} style={buttonStyle}>{loading ? 'Registering...' : 'Register'}</button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        {success && <div style={{ color: '#ff3ebf', marginTop: 10 }}>{success}</div>}
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

export default Register; 