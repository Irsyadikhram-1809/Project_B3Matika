import { Component } from 'react';

/**
 * ErrorBoundary — menangkap error render di mana pun dalam pohon komponen.
 * Dipasang di root (main.jsx) agar layar kosong tidak pernah terjadi lagi.
 *
 * React class component diperlukan karena getDerivedStateFromError &
 * componentDidCatch hanya tersedia di class, bukan hooks.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log ke console (bisa diganti dengan Sentry dll di masa depan)
    console.error('[ErrorBoundary] Uncaught render error:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = import.meta.env.DEV;

    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg, #0f172a)',
          color: 'var(--text, #f1f5f9)',
          fontFamily: 'Poppins, Inter, sans-serif',
          gap: '1.25rem',
        }}
      >
        {/* Ikon */}
        <div style={{ fontSize: '4rem', lineHeight: 1 }}>⚠️</div>

        {/* Judul */}
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--primary, #6366f1)',
            margin: 0,
          }}
        >
          Oops, ada yang tidak beres!
        </h1>

        {/* Deskripsi */}
        <p style={{ maxWidth: '480px', color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
          B3Matika mengalami kesalahan yang tidak terduga. Silakan muat ulang
          halaman atau coba beberapa saat lagi.
        </p>

        {/* Detail error — hanya tampil di mode development */}
        {isDev && this.state.error && (
          <details
            style={{
              maxWidth: '600px',
              width: '100%',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'left',
              fontSize: '0.8rem',
              color: '#fca5a5',
              cursor: 'pointer',
            }}
          >
            <summary style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              🛠 Detail Error (dev only)
            </summary>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
              {this.state.error.toString()}
              {'\n'}
              {this.state.error.stack}
            </pre>
          </details>
        )}

        {/* Tombol aksi */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={this.handleReload}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              background: 'var(--primary, #6366f1)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            🔄 Muat Ulang Halaman
          </button>

          <button
            onClick={this.handleReset}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '9999px',
              border: '1px solid var(--primary, #6366f1)',
              background: 'transparent',
              color: 'var(--primary, #6366f1)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            ↩ Coba Lagi
          </button>
        </div>

        {/* Footer link */}
        <a
          href="/"
          style={{
            color: 'var(--text-muted, #94a3b8)',
            fontSize: '0.85rem',
            textDecoration: 'underline',
          }}
        >
          Kembali ke Beranda
        </a>
      </div>
    );
  }
}
