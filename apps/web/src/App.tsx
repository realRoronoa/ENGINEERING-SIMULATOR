import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function HomePage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header
        style={{ borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '2rem' }}
      >
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#38bdf8' }}>Engineering Simulator</h1>
        <p style={{ color: '#94a3b8' }}>
          Real-world software engineering debugging and system simulation platform
        </p>
      </header>

      <main>
        <section
          style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ marginTop: 0 }}>System Status</h2>
          <p>
            <strong>Foundation Status:</strong> Active (Minimal Shell)
          </p>
          <p>
            <strong>Planned Reference System:</strong> Shopverse
          </p>
        </section>

        <nav>
          <Link to="/" style={{ color: '#38bdf8', marginRight: '1rem' }}>
            Home
          </Link>
          <Link to="/about" style={{ color: '#38bdf8' }}>
            About
          </Link>
        </nav>
      </main>
    </div>
  );
}

function AboutPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>About Engineering Simulator</h1>
      <p style={{ color: '#94a3b8' }}>
        Engineering Simulator trains software engineers by putting them in realistic codebases with
        real failure modes.
      </p>
      <Link to="/" style={{ color: '#38bdf8' }}>
        Back to Home
      </Link>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
