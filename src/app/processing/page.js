// Fișier: src/app/processing/page.js - VERSIUNEA FINALĂ CU SCROLL INTERN

'use client';

import { useEffect, useState, useRef } from 'react';

// NOU: Am adăugat componenta GlobalStyles pentru a stiliza scrollbar-ul
const GlobalStyles = () => (
  <style jsx global>{`
    /* Stil personalizat pentru scrollbar */
    /* Funcționează pe Chrome, Edge, Safari */
    ::-webkit-scrollbar {
      width: 12px; /* Lățimea scrollbar-ului */
    }
    ::-webkit-scrollbar-track {
      background: #f1f1f1; /* Culoarea fundalului track-ului */
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: var(--color-strong-blue); /* Culoarea scrollbar-ului */
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--color-dark-blue); /* Culoarea la hover */
    }
    /* Pentru Firefox (mai limitat) */
    * {
      scrollbar-width: thin;
      scrollbar-color: var(--color-strong-blue) #f1f1f1;
    }
  `}</style>
);


export default function ProcessingPage() {
  const [summary, setSummary] = useState('Se încarcă rezumatul...');
  const [originalFileName, setOriginalFileName] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const storedResult = localStorage.getItem('ai_result');
    const fileName = localStorage.getItem('original_file_name');
    if (storedResult) {
      setSummary(storedResult);
    } else {
      setSummary('Nu s-a găsit niciun rezultat. Vă rugăm reveniți la pagina principală.');
    }
    if (fileName) {
      setOriginalFileName(fileName);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    const newHumanMessage = { role: 'user', content: userInput };
    setIsLoading(true);
    setChatHistory(prev => [...prev, newHumanMessage]);
    const currentInput = userInput;
    setUserInput('');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalText: summary, question: currentInput }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Eroare la AI');
      const newAiMessage = { role: 'ai', content: result.data };
      setChatHistory(prev => [...prev, newAiMessage]);
    } catch (error) {
      const errorMsg = { role: 'ai', content: `A apărut o eroare: ${error.message}` };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resursa_din_${originalFileName.split('.')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    // Containerul principal rămâne la fel
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
      <GlobalStyles /> {/* Adăugăm stilurile globale pentru scrollbar aici */}
      
      <div style={styles.card}>
        <div style={styles.container}>
          {/* Coloana din stânga: Rezumatul */}
          <div style={styles.summaryPanel}>
            <h2>Bază de Cunoștințe</h2>
            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>Sursă: <strong>{originalFileName}</strong></p>
            <button className="btn" onClick={handleSaveSummary} style={{width: '100%', marginBottom: '1rem'}}>
              Descarcă Resursa (.txt)
            </button>
            
            {/* NOU: Am împachetat <pre> într-un div cu overflow */}
            <div style={styles.scrollableContent}>
              <pre style={styles.summaryContent}>
                {summary}
              </pre>
            </div>
          </div>

          {/* Coloana din dreapta: Chat-ul */}
          <div style={styles.chatPanel}>
            <div style={styles.chatHistory}>
              <div style={styles.aiMessage}>
                <p>Salut! Sunt expertul tău personal pe acest document. Pune-mi orice întrebare despre conținutul extras.</p>
              </div>
              {chatHistory.map((msg, index) => (
                <div key={index} style={msg.role === 'user' ? styles.userMessage : styles.aiMessage}>
                  <p>{msg.content}</p>
                </div>
              ))}
              {isLoading && (
                <div style={styles.aiMessage}>
                  <p><i>Se gândește...</i></p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={styles.chatInputArea}>
              <textarea
                style={styles.chatInput}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Dezvoltă ideea despre..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button style={styles.sendButton} onClick={handleSendMessage} disabled={isLoading || !userInput.trim()}>
                Trimite
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ width: '100%', textAlign: 'center', padding: '2rem 0 1rem 0', color: 'var(--color-text-dark)' }}>
        <p>© Dănuț Mitruț - HB Ecosystem</p>
      </footer>
    </div>
  );
}

// Stilurile CSS-in-JS actualizate cu modificările cheie
const styles = {
  card: {
    width: '100%',
    maxWidth: '1400px',
    // NOU: Am schimbat height pentru a se întinde pe tot ecranul
    height: 'calc(100vh - 7rem)', // Înălțimea ecranului minus padding-ul și footer-ul
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px solid var(--color-strong-blue)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    overflow: 'hidden'
  },
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  summaryPanel: {
    width: '40%',
    padding: '1.5rem',
    borderRight: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa',
    // NOU: Structură flex pentru a permite scroll-ul intern
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  // NOU: Acest container va avea scroll
  scrollableContent: {
    flexGrow: 1, // Ocupă spațiul rămas
    overflowY: 'auto', // Adaugă scroll vertical DOAR CÂND E NEVOIE
    marginRight: '-10px', // Compensează pentru lățimea scrollbar-ului
    paddingRight: '10px'
  },
  summaryContent: {
    whiteSpace: 'pre-wrap', 
    wordWrap: 'break-word',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    lineHeight: '1.6'
  },
  chatPanel: {
    width: '60%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%', // NOU: Asigurăm că panoul de chat ocupă toată înălțimea
  },
  chatHistory: {
    flexGrow: 1,
    padding: '1.5rem',
    overflowY: 'auto', // NOU: Adăugăm scroll și aici
    display: 'flex',
    flexDirection: 'column',
  },
  // Restul stilurilor rămân în mare parte neschimbate
  userMessage: { backgroundColor: 'var(--color-dark-blue)', color: 'white', padding: '0.75rem 1rem', borderRadius: '1.2rem 1.2rem 0.2rem 1.2rem', maxWidth: '80%', alignSelf: 'flex-end', marginBottom: '1rem', flexShrink: 0 },
  aiMessage: { backgroundColor: '#e9ecef', color: '#333', padding: '0.75rem 1rem', borderRadius: '1.2rem 1.2rem 1.2rem 0.2rem', maxWidth: '80%', alignSelf: 'flex-start', marginBottom: '1rem', flexShrink: 0 },
  chatInputArea: { display: 'flex', padding: '1rem', borderTop: '1px solid #e0e0e0', backgroundColor: '#f8f9fa' },
  chatInput: { flexGrow: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'none', marginRight: '1rem', fontFamily: "'Inter', sans-serif" },
  sendButton: { padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', backgroundColor: 'var(--color-dark-blue)', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
};