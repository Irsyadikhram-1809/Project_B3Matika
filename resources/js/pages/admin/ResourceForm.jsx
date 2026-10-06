import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import NotFound from '@/components/NotFound';
import AdminGuard from './AdminGuard';
import { RESOURCES } from './config';

export default function ResourceForm() {
  const { res, id } = useParams();
  const cfg = RESOURCES[res];
  const nav = useNavigate();
  const [v, setV] = useState({});
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!cfg || !id) return;
    setLoading(true);
    api(`/admin/${res}/${id}`).then(({ row }) => {
      const o = {};
      for (const [k, t] of Object.entries(cfg.fields)) o[k] = t === 'lines' ? row[k].join('\n') : t === 'json' ? JSON.stringify(row[k], null, 2) : row[k] ?? '';
      setV(o);
      setLoading(false);
    }).catch(e => {
      setErr(e.message || 'Gagal memuat data');
      setLoading(false);
    });
  }, [res, id]); // eslint-disable-line
  if (!cfg) return <NotFound />;

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    const body = {};
    try {
      for (const [k, t] of Object.entries(cfg.fields)) {
        if (t === 'lines') body[k] = String(v[k] || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        else if (t === 'json') body[k] = JSON.parse(v[k] || '');
        else if (t === 'number') body[k] = Number(v[k]);
        else body[k] = v[k] ?? '';
      }
    } catch { 
      setErr('Format JSON tidak valid.'); 
      setSubmitting(false);
      return; 
    }
    try {
      await api(`/admin/${res}${id ? '/' + id : ''}`, { method: id ? 'PUT' : 'POST', body });
      nav(`/panel-rahasia/${res}`);
    } catch (e2) { 
      setErr(e2.message); 
      setSubmitting(false);
    }
  }

  return (
    <AdminGuard>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{id ? 'Ubah' : 'Tambah'} {cfg.label}</h1>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0', fontSize: '0.9rem' }}>
            Isi formulir di bawah ini untuk menyimpan data {cfg.label.toLowerCase()}.
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ maxWidth: '800px' }}>
        {err && (
          <div className="admin-error-state" style={{ marginBottom: '24px' }}>
            <span>⚠️</span> <div>{err}</div>
          </div>
        )}

        {loading ? (
          <div>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <div className="skeleton skeleton-text" style={{ width: '120px', marginBottom: '8px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '100%', height: '40px' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <form className="admin-form" onSubmit={submit}>
            {Object.entries(cfg.fields).map(([k, t]) => (
              <div style={{ marginBottom: '20px' }} key={k}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, textTransform: 'capitalize' }}>
                  {k.replace(/_/g, ' ')}
                  {t === 'lines' && <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '0.85em', marginLeft: '6px' }}>(satu baris per pilihan)</span>}
                  {t === 'json' && <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '0.85em', marginLeft: '6px' }}>(format JSON valid)</span>}
                </label>
                
                {t === 'textarea' || t === 'lines' || t === 'json' ? (
                  <textarea 
                    rows={t === 'textarea' ? 4 : 6} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontFamily: t === 'json' ? 'monospace' : 'inherit' }}
                    value={v[k] ?? ''} 
                    onChange={(e) => setV({ ...v, [k]: e.target.value })} 
                    required={!['explanation', 'description', 'hint'].includes(k)} 
                  />
                ) : (
                  <input 
                    type={t === 'number' ? 'number' : 'text'} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)' }}
                    value={v[k] ?? ''} 
                    onChange={(e) => setV({ ...v, [k]: e.target.value })} 
                    required={!['image_url', 'hint'].includes(k)} 
                  />
                )}
                {res === 'questions' && k === 'answer' && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Diisi dengan indeks pilihan jawaban yang benar (0 = pilihan pertama, 1 = pilihan kedua, dsb).</p>}
              </div>
            ))}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button className="btn" style={{ background: 'var(--navy)', color: '#fff', padding: '10px 24px' }} disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan Data'}
              </button>
              <Link className="btn btn-outline" to={`/panel-rahasia/${res}`} style={{ padding: '10px 24px' }}>
                Batal
              </Link>
            </div>
          </form>
        )}
      </div>
    </AdminGuard>
  );
}
