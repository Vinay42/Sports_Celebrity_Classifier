import { useMemo, useRef, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const GITHUB_URL = import.meta.env.VITE_GITHUB_URL;

const PLAYERS = [
  { id: 'lionel_messi', label: 'Lionel Messi', image: new URL('../images/messi.jpeg', import.meta.url).href },
  { id: 'maria_sharapova', label: 'Maria Sharapova', image: new URL('../images/sharapova.jpeg', import.meta.url).href },
  { id: 'roger_federer', label: 'Roger Federer', image: new URL('../images/federer.jpeg', import.meta.url).href },
  { id: 'serena_williams', label: 'Serena Williams', image: new URL('../images/serena.jpeg', import.meta.url).href },
  { id: 'virat_kohli', label: 'Virat Kohli', image: new URL('../images/virat.jpeg', import.meta.url).href },
];

const labelFromId = (id) => PLAYERS.find((player) => player.id === id)?.label ?? id.replace(/_/g, ' ');
const formatScore = (score) => Number(score || 0).toFixed(2);

function bestMatch(rows) {
  return rows.reduce((currentBest, row) => {
    const topScore = Math.max(...row.class_probability);
    if (!currentBest || topScore > currentBest.topScore) {
      return { ...row, topScore };
    }
    return currentBest;
  }, null);
}

export default function App() {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const rows = useMemo(() => {
    if (!result?.class_dictionary) return [];

    return Object.entries(result.class_dictionary)
      .sort((a, b) => a[1] - b[1])
      .map(([id, index]) => ({
        id,
        label: labelFromId(id),
        score: Number(result.class_probability?.[index] ?? 0),
      }));
  }, [result]);

  const predictedLabel = result ? labelFromId(result.class) : 'Waiting for classification';

  function showError(text) {
    setMessage(text);
    setMessageType('error');
  }

  function clearState(keepPreview = false) {
    setResult(null);
    setMessage('');
    setMessageType('info');
    if (!keepPreview) {
      setPreviewUrl('');
      setFileName('');
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleFile(file) {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      showError('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(String(reader.result || ''));
      setFileName(file.name);
      clearState(true);
    };
    reader.onerror = () => showError('Could not read that file.');
    reader.readAsDataURL(file);
  }

  async function classify() {
    if (!previewUrl) {
      showError('Choose an image first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image_data', previewUrl);

      const response = await fetch(API_URL, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        setResult(null);
        showError('Can\'t classify image. Face detection did not find a usable face and two eyes.');
        return;
      }

      setResult(bestMatch(data));
      setMessage('');
      setMessageType('info');
    } catch {
      setResult(null);
      showError('server error.');
    } finally {
      setLoading(false);
    }
  }

  function onDrop(event) {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <main className="container py-4 py-md-5">
        <section className="hero mb-4 mb-md-5">
          <div className="hero-copy">
            <span className="eyebrow">Sports celebrity recognition</span>
            <h1>Upload an image and get an instant prediction.</h1>
            
          </div>

          {/* <div className="hero-stats">
            <div className="stat-card"><strong>5</strong><span>celebrities</span></div>
            <div className="stat-card"><strong>React</strong><span>component UI</span></div>
            <div className="stat-card"><strong>Flask</strong><span>backend API</span></div>
          </div> */}
        </section>

        <section className="sample-strip mb-4 mb-md-5">
          {PLAYERS.map((player) => (
            <article key={player.id} className={`sample-card ${result?.class === player.id ? 'is-active' : ''}`}>
              <div className="sample-avatar">
                <img src={player.image} alt={player.label} />
              </div>
              <div className="sample-meta">
                <h2>{player.label}</h2>
                <span>{result?.class === player.id ? 'Predicted match' : 'Supported subject'}</span>
              </div>
            </article>
          ))}
        </section>

        <div className="row no-gutters">
          <div className="col-lg-5 pr-lg-4 mb-4 mb-lg-0">
            <div
              className={`glass-panel upload-panel ${dragActive ? 'is-dragging' : ''}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
            >
              <div className="panel-header">
                <span className="panel-tag">Step 1</span>
                <h3>Pick an image</h3>
                <p>Drop a file here or browse from your device.</p>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />

              <button type="button" className="upload-zone" onClick={() => inputRef.current?.click()}>
                <img src={new URL('../images/upload.png', import.meta.url).href} alt="Upload icon" />
                <strong>{fileName || 'Drop files here or click to upload'}</strong>
                <span>{fileName ? 'Click to choose another image' : 'JPG, PNG, or similar image files'}</span>
              </button>

              <div className="upload-actions">
                <button type="button" className="btn btn-dark btn-lg btn-block" onClick={classify} disabled={loading}>
                  {loading ? 'Classifying...' : 'Classify image'}
                </button>
                <button type="button" className="btn btn-outline-light btn-lg btn-block" onClick={() => clearState(false)}>
                  Clear
                </button>
              </div>

             
            </div>
          </div>

          <div className="col-lg-7">
            <div className="glass-panel result-panel h-100">
              <div className="panel-header d-flex align-items-start justify-content-between flex-wrap">
                <div>
                  <span className="panel-tag">Step 2</span>
                  <h3>Prediction result</h3>
                  <p>Preview the image and compare all model probabilities.</p>
                </div>
                {result ? <div className="confidence-pill">Confidence {formatScore(result.topScore)}%</div> : null}
              </div>

              {message ? <div className={`alert-panel ${messageType === 'error' ? 'is-error' : ''}`}>{message}</div> : null}

              <div className="result-grid">
                <div className="preview-card">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Selected preview" />
                  ) : (
                    <div className="preview-placeholder">
                      <span>Preview</span>
                      <p>Your selected image will appear here.</p>
                    </div>
                  )}

                  {result ? (
                    <div className="preview-badge">
                      {predictedLabel}
                      <small>{labelFromId(result.class)}</small>
                    </div>
                  ) : null}
                </div>

                <div className="result-summary">
                  <span className="summary-label">Top prediction</span>
                  <h4>{predictedLabel}</h4>
                  <p>
                    {result
                      ? `The model is leaning toward ${predictedLabel.toLowerCase()} with the strongest score.`
                      : 'No prediction yet. Upload an image and click classify.'}
                  </p>
                </div>
              </div>

              <div className="scoreboard">
                <div className="scoreboard-head">
                  <span>Probability breakdown</span>
                  <span>Score</span>
                </div>

                {rows.length ? (
                  rows.map((row) => (
                    <div key={row.id} className="score-row">
                      <div className="score-label">
                        <strong>{row.label}</strong>
                        <span>{formatScore(row.score)}%</span>
                      </div>
                      <div className="score-track">
                        <div className="score-fill" style={{ width: `${Math.max(0, Math.min(100, row.score))}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">The probability table will populate after a successful classification.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="project-footer">
        <p>Built for Sports Celebrity Face Recognition</p>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Visit GitHub profile">
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          <span>GitHub</span>
        </a>
      </footer>
    </div>
  );
}