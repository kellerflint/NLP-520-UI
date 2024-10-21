import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import './App.css';

function App() {
  const API = 'http://127.0.0.1:5000/predict';
  //const API = 'https://kellerflint.com:5000/predict';

  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [sessionKey, setSessionKey] = useState('');
  const [character1, setCharacter1] = useState('');
  const [character2, setCharacter2] = useState('');
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    setSessionKey(uuidv4());
  }, []);

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
    if (!message.trim() || !character1.trim() || !character2.trim() || genres.length === 0) return;

    // Add user message to conversation
    setConversation(prev => [...prev, { type: 'user', text: message }]);
    setLoading(true);

    try {
      const result = await axios.post(API, { message, sessionKey, character1, character2, genres });
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

  const formatMessage = (text) => {
    return text.split('\n').map((item, index) => (
      <React.Fragment key={index}>
        {item}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="main">
      <h1>AAI520 - Natural Language Processing</h1>
      <p>Note: It may take the bot 10-15 seconds to finish generating a response.</p>
      <div className="chat">
        {conversation.map((entry, index) => (
          <div className={"message " + entry.type} key={index}>
            <strong>{entry.type === 'user' ? 'You:' : 'Bot:'}</strong> {formatMessage(entry.text)}
          </div>
        ))}
        {loading && <div className="message loading">Waiting for response{loadingDots}</div>}
      </div>
      <form onSubmit={handleSubmit}>
        <div className='basic-inputs'>
        <div className='form-group'>
            <label>Select one or more genres:</label>
            <select multiple value={genres} onChange={(e) => setGenres([...e.target.selectedOptions].map(option => option.value))} required>
              <option value="drama">Drama</option>
              <option value="romance">Romance</option>
              <option value="comedy">Comedy</option>
            </select>
          </div>
          <div className='form-group'>
            <label>Character 1 Name:</label>
            <br />
            <input
              type="text"
              value={character1}
              onChange={(e) => setCharacter1(e.target.value)}
              placeholder="Character 1 Name"
              required
            />
          </div>
          <div className='form-group'>
            <label>Character 2 Name:</label>
            <br />
            <input
              type="text"
              value={character2}
              onChange={(e) => setCharacter2(e.target.value)}
              placeholder="Character 2 Name"
              required
            />
          </div>
        </div>
        <label>Message:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here"
          required
        />
        <br />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
}

export default App;
