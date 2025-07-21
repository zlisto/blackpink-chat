import { useState, useEffect } from 'react';

function EditAgents() {
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Get logged-in user
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const username = user ? user.username : null;

  // Fetch agents on mount
  useEffect(() => {
    if (!username) return;
    fetch(`http://localhost:3001/api/agents?username=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAgents(data.agents);
      });
  }, [username]);

  // Load prompt when agent is selected
  useEffect(() => {
    if (selected && username) {
      setMsg('');
      setLoading(true);
      fetch(`http://localhost:3001/api/agents/${encodeURIComponent(selected)}?username=${encodeURIComponent(username)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setPrompt(data.agent.system_prompt);
        })
        .finally(() => setLoading(false));
    } else {
      setPrompt('');
    }
  }, [selected, username]);

  const handleUpdate = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`http://localhost:3001/api/agents/${encodeURIComponent(selected)}?username=${encodeURIComponent(username)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_prompt: prompt })
      });
      const data = await res.json();
      if (data.success) setMsg('System prompt updated!');
      else setMsg(data.error || 'Update failed.');
    } catch {
      setMsg('Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: 'black', color: '#fff', borderRadius: 12, padding: 32, border: '2px solid #ff3ebf' }}>
      <h2 style={{ color: '#ff3ebf', textAlign: 'center' }}>Edit Agents</h2>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="agent-select" style={{ fontWeight: 'bold', color: '#ff3ebf' }}>Choose an agent:</label>
        <select
          id="agent-select"
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{ marginLeft: 12, padding: 8, borderRadius: 6, fontSize: 16 }}
        >
          <option value="">-- Select --</option>
          {agents.map(agent => (
            <option key={agent.name} value={agent.name}>{agent.name}</option>
          ))}
        </select>
      </div>
      {selected && (
        <>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={8}
            style={{ width: '100%', borderRadius: 8, border: '1px solid #ff3ebf', padding: 12, fontSize: 16, background: 'black', color: '#fff', marginBottom: 16 }}
            disabled={loading}
          />
          <button
            onClick={handleUpdate}
            disabled={loading}
            style={{ background: '#ff3ebf', color: 'white', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 'bold', fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Saving...' : 'Update System Prompt'}
          </button>
          {msg && <div style={{ color: msg.includes('updated') ? '#ff3ebf' : 'red', marginTop: 12 }}>{msg}</div>}
        </>
      )}
    </div>
  );
}

export default EditAgents; 