import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    cvFile: null,
    inventiveness: 50, // Default to middle value
    humor: 20 // Default to lower value
  });
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    // Test backend connection
    fetch('http://localhost:5000/api/test')
      .then(response => response.json())
      .then(data => {
        setServerStatus('connected');
      })
      .catch(error => {
        console.error('Backend connection error:', error);
        setServerStatus('error');
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        cvFile: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('jobTitle', formData.jobTitle);
      formDataToSend.append('company', formData.company);
      formDataToSend.append('inventiveness', formData.inventiveness);
      formDataToSend.append('humor', formData.humor);
      if (formData.cvFile) {
        formDataToSend.append('cv', formData.cvFile);
      }

      console.log('Sending request to backend...');
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate cover letter');
      }

      const data = await response.json();
      setCoverLetter(data.coverLetter);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Failed to connect to the server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Cover Letter Generator</h1>
        {serverStatus === 'checking' && <div className="server-status checking">Checking server connection...</div>}
        {serverStatus === 'error' && <div className="server-status error">Cannot connect to server. Please make sure the backend is running.</div>}
        {serverStatus === 'connected' && <div className="server-status connected">Server connected</div>}
      </header>
      
      <main className="App-main">
        <form onSubmit={handleSubmit} className="cover-letter-form">
          <div className="form-group">
            <label htmlFor="jobTitle">Job Title:</label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Company Name:</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cv">Upload CV (PDF):</label>
            <input
              type="file"
              id="cv"
              name="cv"
              onChange={handleFileChange}
              accept=".pdf"
            />
          </div>

          <div className="form-group slider-group">
            <label htmlFor="inventiveness">
              Inventiveness: {formData.inventiveness}%
            </label>
            <input
              type="range"
              id="inventiveness"
              name="inventiveness"
              min="0"
              max="100"
              value={formData.inventiveness}
              onChange={handleChange}
              className="slider"
            />
            <div className="slider-labels">
              <span>Conservative</span>
              <span>Creative</span>
            </div>
          </div>

          <div className="form-group slider-group">
            <label htmlFor="humor">
              Humor Level: {formData.humor}%
            </label>
            <input
              type="range"
              id="humor"
              name="humor"
              min="0"
              max="100"
              value={formData.humor}
              onChange={handleChange}
              className="slider"
            />
            <div className="slider-labels">
              <span>Professional</span>
              <span>Playful</span>
            </div>
          </div>

          <button type="submit" disabled={loading || serverStatus !== 'connected'}>
            {loading ? 'Generating...' : 'Generate Cover Letter'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {coverLetter && (
          <div className="cover-letter-result">
            <h2>Generated Cover Letter</h2>
            <div className="cover-letter-content">
              {coverLetter.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 