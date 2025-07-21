import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  Link,
} from 'react-router-dom';
import { useState } from 'react';
import ChatModal from './components/ChatModal';
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import EditAgents from './components/EditAgents';
import './App.css';

const members = [
  {
    name: 'Jisoo',
    image: '/jisoo.png',
    quote: 'I want to show a new side of myself.',
    bio: 'Jisoo is a South Korean singer and actress. She is the oldest member of BlackPink and is known for her powerful vocals and charismatic stage presence. She debuted with BlackPink in 2016 and has since become a global icon.'
  },
  {
    name: 'Jennie',
    image: '/jennie.jpg',
    quote: 'I want to be remembered as an artist who gave her all.',
    bio: 'Jennie is a South Korean rapper and singer. She is known for her fierce rap skills and unique fashion sense. Jennie debuted as a member of BlackPink in 2016 and has also released solo music.'
  },
  {
    name: 'Rosé',
    image: '/rose.jpg',
    quote: 'Music is my life, my passion, my everything.',
    bio: 'Rosé is a New Zealand-born Australian singer and dancer based in South Korea. She is the main vocalist of BlackPink and is known for her distinctive voice and emotional performances.'
  },
  {
    name: 'Lisa',
    image: '/lisa.jpg',
    quote: 'I want to break boundaries and inspire others.',
    bio: 'Lisa is a Thai rapper, singer, and dancer. She is the main dancer and lead rapper of BlackPink, recognized for her incredible dance skills and charismatic stage presence.'
  },
  {
    name: 'Bret Hart',
    image: '/bret_hart.jpg',
    quote: 'I am the best there is, the best there was, and the best there ever will be.',
    bio: 'Bret "The Hitman" Hart is a Canadian-American retired professional wrestler. Known for his excellence of execution and his iconic black and pink ring attire, Bret is a legend in the world of wrestling. Now, he joins BlackPink as the group\'s honorary member, bringing a touch of wrestling royalty to the K-pop world.'
  },
];

function Navbar({ user, onLogout }) {
  return (
    <nav style={{
      background: 'black',
      padding: '16px 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottom: '2px solid #ff3ebf',
      marginBottom: 32,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <Link
        to="/"
        style={{
          color: '#ff3ebf',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: 18,
          margin: '0 24px',
          letterSpacing: 1,
          transition: 'color 0.2s',
        }}
      >
        Home
      </Link>
      {members.map((member) => (
        <Link
          key={member.name}
          to={`/member/${member.name.toLowerCase()}`}
          style={{
            color: '#ff3ebf',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: 18,
            margin: '0 24px',
            letterSpacing: 1,
            transition: 'color 0.2s',
          }}
        >
          {member.name}
        </Link>
      ))}
      {user && (
        <Link to="/edit-agents" style={{ color: '#ff3ebf', margin: '0 24px', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }}>Edit Agents</Link>
      )}
      <div style={{ marginLeft: 'auto', marginRight: 24, display: 'flex', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ color: '#ff3ebf', fontWeight: 'bold', marginRight: 12 }}>{user.username}</span>
            <Logout onLogout={onLogout} />
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#ff3ebf', marginLeft: 16, fontWeight: 'bold' }}>Login</Link>
            <Link to="/register" style={{ color: '#ff3ebf', marginLeft: 16, fontWeight: 'bold' }}>Create Account</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div className="App">
      <h1 style={{ color: '#ff3ebf', fontSize: 48, marginBottom: 16, fontFamily: 'Montserrat, Arial, sans-serif', letterSpacing: 2 }}>BlackPink Chat</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {members.map((member) => (
          <div key={member.name} style={{ margin: 20, textAlign: 'center', width: 200, background: 'rgba(255,62,191,0.08)', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', padding: 16 }}>
            <Link to={`/member/${member.name.toLowerCase()}`} style={{ textDecoration: 'none' }}>
              <img
                src={member.image}
                alt={member.name}
                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%', border: '3px solid #ff3ebf', marginBottom: 12, cursor: 'pointer' }}
              />
            </Link>
            <h2 style={{ color: '#ff3ebf', fontSize: 22, margin: '12px 0 8px 0', fontFamily: 'Montserrat, Arial, sans-serif' }}>
              <Link to={`/member/${member.name.toLowerCase()}`} style={{ color: '#ff3ebf', textDecoration: 'none' }}>{member.name}</Link>
            </h2>
            <p style={{ fontStyle: 'italic', color: '#fff', fontSize: 15 }}>&quot;{member.quote}&quot;</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemberBio() {
  const { name } = useParams();
  const [showChat, setShowChat] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');
  const member = members.find(
    (m) => m.name.toLowerCase() === name.toLowerCase()
  );
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleDeleteMemories = async () => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete all your memories with ${member.name}? This cannot be undone.`)) return;
    setDeleting(true);
    setDeleteMsg('');
    try {
      const res = await fetch(`http://localhost:3001/api/chats/${member.name}?username=${user.username}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDeleteMsg('All memories deleted!');
        // Optionally, clear chat history in ChatModal if open
      } else {
        setDeleteMsg('Failed to delete memories.');
      }
    } catch (err) {
      setDeleteMsg('Failed to delete memories.');
    } finally {
      setDeleting(false);
    }
  };

  if (!member) {
    return (
      <div className="App">
        <h2 style={{ color: '#ff3ebf' }}>Member not found</h2>
        <Link to="/" style={{ color: '#ff3ebf' }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="App" style={{ textAlign: 'center' }}>
      <h1 style={{ color: '#ff3ebf', fontSize: 40, fontFamily: 'Montserrat, Arial, sans-serif', marginBottom: 16 }}>{member.name}</h1>
      <img
        src={member.image}
        alt={member.name}
        style={{ width: 300, height: 300, objectFit: 'cover', borderRadius: 20, margin: 20, border: '4px solid #ff3ebf' }}
      />
      <p style={{ maxWidth: 500, margin: '0 auto', fontSize: 20, color: '#fff', background: 'rgba(255,62,191,0.08)', borderRadius: 12, padding: 20 }}>{member.bio}</p>
      {user && (
        <>
          {/* Button Row: Side by side */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24, marginBottom: 24 }}>
            <button
              onClick={handleDeleteMemories}
              disabled={deleting}
              style={{ padding: '10px 28px', borderRadius: 8, background: '#ff3ebf', color: 'white', border: 'none', fontWeight: 'bold', fontSize: 16, cursor: deleting ? 'not-allowed' : 'pointer', maxWidth: 180, whiteSpace: 'normal', lineHeight: 1.2 }}
            >
              {deleting ? 'Deleting...' : (<><span>Delete Memories</span><br /><span>with {member.name}</span></>)}
            </button>
            <button 
              onClick={() => setShowChat(true)}
              style={{ padding: '12px 32px', fontSize: 20, borderRadius: 8, background: '#ff3ebf', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', letterSpacing: 1, maxWidth: 180, whiteSpace: 'normal', lineHeight: 1.2 }}
            >
              <span>Talk to AI</span><br /><span>{member.name}</span>
            </button>
          </div>
          {deleteMsg && <div style={{ color: '#ff3ebf', marginTop: 8 }}>{deleteMsg}</div>}
        </>
      )}
      <ChatModal member={member} isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (user) => setUser(user);
  const handleLogout = () => setUser(null);

  return (
    <Router>
      <div style={{ minHeight: '100vh', background: 'black', fontFamily: 'Montserrat, Arial, sans-serif' }}>
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/member/:name" element={<MemberBio />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/edit-agents" element={<EditAgents />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
