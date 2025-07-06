// Fișier: src/app/page.js - VERSIUNE FINALĂ ȘI CURĂȚATĂ PENTRU PUBLICARE

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Format de fișier nevalid. Vă rugăm încărcați un .pdf sau .txt.');
        setFile(null);
      }
    }
  };

  const handleBuildResource = async () => {
    if (!file) {
      setError('Vă rugăm să încărcați un document mai întâi.');
      return;
    }
    setIsLoading(true);
    setError('');
    setProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressIntervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 100);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });
      setProgress(100);
      clearInterval(progressIntervalRef.current);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'A apărut o eroare necunoscută.');
      }
      localStorage.setItem('ai_result', result.data);
      localStorage.setItem('original_file_name', file.name);
      router.push('/processing');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setIsLoading(false);
      setProgress(0);
      clearInterval(progressIntervalRef.current);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf,.txt"
      />
      
      <header className="full-width-header">
        <h1>
          Hello Business - Knowledge Architect
          <span>(creator de resurse acționabile pentru asistenți și agenți AI)</span>
        </h1>
        <h2>Nu toată informația e putere. Doar informația cu sens și coerență. Asistentul tău merită resurse, nu doar date.</h2>
      </header>

      <main className="container">
        <section id="explanation">
          <h3>De la Informație la Înțelepciune Acționabilă</h3>
          <p>
            Trăim în era informației, dar nu suntem conștienți de puterea și valoarea ei. Cărțile, documentele și articolele conțin cunoștințe valoroase, dar extragerea lor manuală este un proces lent și ineficient. Rezumatele standard oferă o imagine de suprafață, omițând esența: modelele mentale, principiile fundamentale și tehnicile cu adevărat acționabile.
          </p>
          <p>
            Dacă vorbim de un asistent AI, el este la fel de bun pe cât sunt resursele cu care este alimentat. A-l hrăni cu rezumate simple sau cu tone de cărți are ca efect fie să nu îl folosești la întregul său potențial, fie să îl copleșești cu zgomot și gunoi informațional.
          </p>
          <p>
            <strong>Knowledge Architect</strong> s-a născut din această nevoie. Nu este un simplu "summarizer". Aplicația folosește un metaprompt avansat și un proces de raționament AI iterativ pentru a acționa ca un veritabil Arhitect de Cunoștințe. Acesta citește, analizează și filtrează materialul sursă prin șase lentile critice:
          </p>
          <ul className="feature-list">
            <li>modele mentale</li>
            <li>principii fundamentale</li>
            <li>tehnici specifice</li>
            <li>euristici (reguli practice)</li>
            <li>checklists & întrebări cheie</li>
            <li>anti-modele (erori de evitat)</li>
          </ul>
          <p style={{ marginTop: '1.5rem' }}>
            Rezultatul nu este o listă de fapte, ci o bază de cunoștințe structurată, densă și contextualizată, gata să transforme orice asistent într-un expert veritabil.
          </p>
        </section>

        <section id="instructions">
            <h3>4 pași simpli spre cunoaștere distilată</h3>
            <ol className="instructions-list">
                <li>
                    <strong>Încarcă documentul</strong>
                    Alege sau trage aici cartea sau documentul tău în format .pdf sau .txt. (dacă documentul tău are textul format imagine, convertește-l întâi cu ocr). Metapromptul nostru recomandat este deja pregătit pentru tine.
                </li>
                <li>
                    <strong>Pornește Arhitectul</strong>
                    {/* Aici am folosit apostrofuri, care sunt sigure */}
                    Apasă pe butonul 'Construiește resursa' și în scurt timp AI-ul analizează, iterează și construiește baza ta de cunoștințe, pas cu pas.
                </li>
                <li>
                    <strong>Interacționează și explorează</strong>
                    Când procesul este gata se va deschide o pagină unde resursa ta este gata de a fi utilizată. Mai mult ai la dispoziție un chat de dialog, dacă vrei să dezvolți o anumită idee din material. Ai va dialoga cu tine doar în contextul informațiilor analizate.
                </li>
                 <li>
                    <strong>Descarcă și Integrează</strong>
                    La final, descarcă fișierul .txt perfect formatat pentru a deveni fișier resursă. Copiază și conținutul relevant din interacțiunea cu Arhitectul pe marginea materialului procesat.
                </li>
            </ol>
        </section>

        <section id="actions" style={{ background: 'none', boxShadow: 'none', padding: '0' }}>
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
            {file && !isLoading && <p style={{ textAlign: 'center', marginBottom: '1rem' }}>Fișier selectat: <strong>{file.name}</strong></p>}
            {isLoading && (
              <div style={{width: '100%', marginBottom: '1rem'}}>
                <p style={{textAlign: 'center', marginBottom: '0.5rem'}}>Se procesează: {file.name}</p>
                <div style={{height: '20px', backgroundColor: '#e9ecef', borderRadius: '10px', overflow: 'hidden'}}>
                  <div style={{width: `${progress}%`, height: '100%', backgroundColor: 'var(--color-strong-blue)', transition: 'width 0.1s linear'}}></div>
                </div>
              </div>
            )}
            <div className="actions-container">
                <button className="btn" onClick={handleUploadClick} disabled={isLoading}>
                    Încarcă Documentul (.pdf, .txt)
                </button>
                <button className="btn" onClick={handleBuildResource} disabled={isLoading || !file}>
                    {isLoading ? 'Se construiește...' : 'Construiește Resursa'}
                </button>
            </div>
        </section>
      </main>

      <footer>
        <p>© Dănuț Mitruț - HB Ecosystem</p>
      </footer>
    </>
  );
}