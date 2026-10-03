import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import NotFound from '@/components/NotFound';
import AdminGuard from './AdminGuard';
import { RESOURCES } from './config';

export default function ResourceList() {
  const { res } = useParams();
  const cfg = RESOURCES[res];
  const [rows, setRows] = useState([]);
  const load = () => api(`/admin/${res}`).then((d) => setRows(d.rows)).catch(() => {});
  useEffect(() => { if (cfg) load(); }, [res]); // eslint-disable-line
  if (!cfg) return <NotFound />;
  const short = (v) => (typeof v === 'string' && v.length > 70 ? v.slice(0, 70) + '…' : v);
  return (
    <AdminGuard>
      <div className="row between"><h1>{cfg.label}</h1><Link className="btn" to={`/panel-rahasia/${res}/create`}>+ Tambah</Link></div>
      <div className="card table-wrap mt">
        <table>
          <thead><tr>{cfg.cols.map((c) => <th key={c}>{c}</th>)}<th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {cfg.cols.map((c) => <td key={c}>{short(r[c])}</td>)}
                <td className="row">
                  <Link className="btn btn-sm btn-outline" to={`/panel-rahasia/${res}/${r.id}/edit`}>Ubah</Link>
                  <button className="btn btn-sm btn-danger" onClick={async () => { if (confirm('Hapus data ini?')) { await api(`/admin/${res}/${r.id}`, { method: 'DELETE' }); load(); } }}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminGuard>
  );
}
