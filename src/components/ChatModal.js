import { useState, useEffect, useRef } from 'react';

function ChatModal({ member, isOpen, onClose }) {
  const [messages, setMessages] = useState({}); // Store messages per member
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  // Add state for image
  const [image, setImage] = useState(null);

  // Get current member's messages
  const currentMessages = messages[member.name] || [];

  // Scroll to bottom when messages change or modal opens
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, currentMessages.length]);

  // Load chat history from backend when modal opens
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const username = user ? user.username : null;
    if (isOpen && username && member && member.name) {
      fetch(`http://localhost:3001/api/chats/${member.name}?username=${username}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.chats)) {
            // Combine all messages from all sessions (sorted by createdAt)
            const allMessages = data.chats.flatMap(session => session.messages || []);
            setMessages(prev => ({ ...prev, [member.name]: allMessages }));
          }
        });
    }
    // eslint-disable-next-line
  }, [isOpen, member && member.name]);

  // Add image input handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  // Add paste handler for images
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImage(reader.result);
          };
          reader.readAsDataURL(file);
        }
      }
    };
    if (isOpen) {
      window.addEventListener('paste', handlePaste);
    }
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() && !image) return;

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const username = user ? user.username : null;
    const firstName = user ? user.firstName : '';

    // Support both text and image in user message
    const userMessage = image
      ? { role: 'user', content: inputMessage, image }
      : { role: 'user', content: inputMessage };
    const updatedMessages = [...currentMessages, userMessage];
    
    // Update messages for this specific member
    setMessages(prev => ({
      ...prev,
      [member.name]: updatedMessages
    }));
    
    setInputMessage('');
    setImage(null);
    setIsLoading(true);

    try {
      console.log('Sending request to server...');
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          member: member.name,
          messages: updatedMessages,
          username,
          firstName,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('Success! Adding AI reply:', data.reply);
        const aiMessage = { role: 'assistant', content: data.reply };
        setMessages(prev => ({
          ...prev,
          [member.name]: [...updatedMessages, aiMessage]
        }));
      } else {
        console.log('Server returned success: false');
        const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
        setMessages(prev => ({
          ...prev,
          [member.name]: [...updatedMessages, errorMessage]
        }));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => ({
        ...prev,
        [member.name]: [...updatedMessages, errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'black',
        border: '2px solid #ff3ebf',
        borderRadius: 16,
        width: '90%',
        maxWidth: 600,
        height: '80%',
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#ff3ebf', margin: 0 }}>Chat with AI {member.name}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff3ebf',
              fontSize: 24,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: 20,
          padding: 10,
          background: 'rgba(255,62,191,0.05)',
          borderRadius: 8,
        }}>
          {currentMessages.length === 0 && (
            <p style={{ color: '#ccc', textAlign: 'center', fontStyle: 'italic' }}>
              Start chatting with AI {member.name}!
            </p>
          )}
          {currentMessages.map((msg, index) => (
            <div key={index} style={{
              marginBottom: 12,
              textAlign: msg.role === 'user' ? 'right' : 'left',
            }}>
              <div style={{
                display: 'inline-block',
                maxWidth: '70%',
                padding: '8px 12px',
                borderRadius: 12,
                background: msg.role === 'user' ? '#ff3ebf' : 'rgba(255,62,191,0.2)',
                color: msg.role === 'user' ? 'white' : '#fff',
              }}>
                {msg.content}
              </div>
              {msg.image && (
                <div style={{ marginTop: 4 }}>
                  <img src={msg.image} alt="sent" style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, border: '2px solid #ff3ebf' }} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div style={{ textAlign: 'left' }}>
              <div style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 12,
                background: 'rgba(255,62,191,0.2)',
                color: '#fff',
              }}>
                {member.name} is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message AI ${member.name}...`}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #ff3ebf',
              background: 'black',
              color: '#fff',
              fontSize: 16,
            }}
          />
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload-input"
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload-input" style={{
            background: '#ff3ebf',
            color: 'white',
            borderRadius: 8,
            padding: '12px 16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 4,
          }}>
            📷
          </label>
          <button
            onClick={sendMessage}
            disabled={isLoading || (!inputMessage.trim() && !image)}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              background: '#ff3ebf',
              color: 'white',
              border: 'none',
              cursor: isLoading || (!inputMessage.trim() && !image) ? 'not-allowed' : 'pointer',
              opacity: isLoading || (!inputMessage.trim() && !image) ? 0.6 : 1,
              fontSize: 16,
            }}
          >
            Send
          </button>
        </div>
        {image && (
          <div style={{ marginTop: 8, marginBottom: 8, textAlign: 'left' }}>
            <img src={image} alt="preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '2px solid #ff3ebf' }} />
            <button onClick={() => setImage(null)} style={{ marginLeft: 8, color: '#ff3ebf', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatModal; 