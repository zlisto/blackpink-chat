import { useNavigate } from 'react-router-dom';

function Logout({ onLogout }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };
  return (
    <button onClick={handleLogout} style={{
      background: '#ff3ebf',
      color: 'white',
      border: 'none',
      borderRadius: 8,
      padding: '8px 20px',
      fontWeight: 'bold',
      fontSize: 16,
      marginLeft: 16,
      cursor: 'pointer'
    }}>
      Logout
    </button>
  );
}

export default Logout; 