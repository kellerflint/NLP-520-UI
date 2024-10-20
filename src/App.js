import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './App.css';

function App() {
  const API = 'http://143.198.52.60:5000/predict';

  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingDots(prev => (prev.length < 3 ? prev + '.' : ''));
      }, 500);
    } else {
      setLoadingDots('');
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to conversation
    setConversation(prev => [...prev, { type: 'user', text: message }]);
    setLoading(true);

    try {
      const result = await axios.post(API, { message });
      // Add API response to conversation
      setConversation(prev => [...prev, { type: 'bot', text: result.data.response }]);
      console.log(result.data.response);
      setMessage('');
    } catch (error) {
      console.error('Error calling API:', error);
      setConversation(prev => [...prev, { type: 'error', text: 'Error: Could not get response from server' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <h1>AAI520 - Natural Language Processing</h1>
      <div className="chat">
        {conversation.map((entry, index) => (
          <div className={"message " + entry.type} key={index}>
            <strong>{entry.type === 'user' ? 'You:' : 'Bot:'}</strong> {entry.text}
          </div>
        ))}
        {loading && <div className="message loading">Waiting for response{loadingDots}</div>}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here"
          rows={4}
          cols={50}
        />
        <br />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
}

export default App;
