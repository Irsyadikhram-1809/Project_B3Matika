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

  useEffect(() => {
    if (!cfg || !id) return;
    api(`/admin/${res}/${id}`).then(({ row }) => {
      const o = {};
      for (const [k, t] of Object.entries(cfg.fields)) o[k] = t === 'lines' ? row[k].join('\n') : t === 'json' ? JSON.stringify(row[k], null, 2) : row[k] ?? '';
      setV(o);
    });
  }, [res, id]); // eslint-disable-line
  if (!cfg) return <NotFound />;

  async function submit(e) {
    e.preventDefault();
    const body = {};
    try {
      for (const [k, t] of Object.entries(cfg.fields)) {
        if (t === 'lines') body[k] = String(v[k] || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        else if (t === 'json') body[k] = JSON.parse(v[k] || '');
        else if (t === 'number') body[k] = Number(v[k]);
        else body[k] = v[k] ?? '';
      }
    } catch { return setErr('JSON tidak valid.'); }
    try {
      await api(`/admin/${res}${id ? '/' + id : ''}`, { method: id ? 'PUT' : 'POST', body });
      nav(`/panel-rahasia/${res}`);
    } catch (e2) { setErr(e2.message); }
  }

  return (
    <AdminGuard>
      <h1>{id ? 'Ubah' : 'Tambah'} {cfg.label}</h1>
      <form className="card admin-form" onSubmit={submit}>
        {err && <div className="alert">{err}</div>}
        {Object.entries(cfg.fields).map(([k, t]) => (
          <label key={k}>{k}{t === 'lines' && ' (satu pilihan per baris)'}
            {t === 'textarea' || t === 'lines' || t === 'json'
              ? <textarea rows={t === 'textarea' ? 4 : 5} className={t === 'json' ? 'mono' : ''} value={v[k] ?? ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} required={!['explanation', 'description'].includes(k)} />
              : <input type={t} value={v[k] ?? ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} required />}
          </label>
        ))}
        {res === 'questions' && <p className="small muted">answer = indeks jawaban benar (0 = pilihan pertama).</p>}
        <div className="row"><button className="btn">Simpan</button><Link className="btn btn-outline" to={`/panel-rahasia/${res}`}>Batal</Link></div>
      </form>
    </AdminGuard>
  );
}
