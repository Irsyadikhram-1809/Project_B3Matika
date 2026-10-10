import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle, Target, Puzzle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import SegmentedControl from '@/components/SegmentedControl';

/* Utilitas: tentukan warna banner berdasarkan tipe puzzle */
function getBannerClass(type = '') {
  const t = type.toLowerCase();
  if (t.includes('cryptarithm') || t.includes('crypto')) return 'puzzle-banner-cryptarithm';
  if (t.includes('riddle') || t.includes('teka')) return 'puzzle-banner-riddle';
  return 'puzzle-banner-default';
}

/* Utilitas: Icon component mapping per tipe */
function getPuzzleIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('cryptarithm') || t.includes('crypto')) return <div className="puzzle-emoji"><Puzzle size={32} /></div>;
  if (t.includes('riddle') || t.includes('teka')) return <div className="puzzle-emoji"><Puzzle size={32} /></div>;
  if (t.includes('sudoku')) return <div className="puzzle-emoji"><Puzzle size={32} /></div>;
  if (t.includes('kenken')) return <div className="puzzle-emoji"><Puzzle size={32} /></div>;
  if (t.includes('logic')) return <div className="puzzle-emoji"><Puzzle size={32} /></div>;
  return <div className="puzzle-emoji"><Puzzle size={32} /></div>;
}

/* Label badge yang lebih bersih */
function formatType(type = '') {
  if (!type) return 'Puzzle';
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}

function getBadgeClass(type = '') {
  const t = type.toLowerCase();
  if (t.includes('cryptarithm')) return 'puzzle-badge-cryptarithm';
  if (t.includes('riddle') || t.includes('teka')) return 'puzzle-badge-riddle';
  return 'puzzle-badge-default';
}

function getDiffBadgeClass(difficulty = '') {
  const d = difficulty?.toLowerCase();
  if (d === 'hard' || d === 'sulit') return 'puzzle-diff-hard';
  if (d === 'medium' || d === 'sedang') return 'puzzle-diff-medium';
  return 'puzzle-diff-easy';
}

function getDiffLabel(difficulty = '') {
  const d = difficulty?.toLowerCase();
  if (d === 'hard') return 'Sulit';
  if (d === 'medium') return 'Sedang';
  if (d === 'easy') return 'Mudah';
  return difficulty || 'Mudah';
}

/* Skeleton card saat loading */
function PuzzleSkeleton() {
  return (
    <div className="puzzle-skeleton">
      <div className="puzzle-skeleton-banner" />
      <div className="puzzle-skeleton-body">
        <div className="skeleton skeleton-text" style={{ width: '40%' }} />
        <div className="skeleton skeleton-text" style={{ width: '80%', height: 20 }} />
        <div className="skeleton skeleton-text" style={{ width: '95%' }} />
        <div className="skeleton skeleton-text" style={{ width: '70%' }} />
      </div>
    </div>
  );
}

export default function PuzzleList() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('Semua');

  useEffect(() => {
    api('/puzzles')
      .then((d) => { setData(d); setLoading(false); })
      .catch((err) => { setError(err.message || 'Gagal memuat puzzle'); setLoading(false); });
  }, []);

  /* Daftar tipe unik untuk chip filter */
  const types = data
    ? ['Semua', ...new Set(data.puzzles.map((p) => formatType(p.type)))]
    : ['Semua'];

  const shown = !data
    ? []
    : filter === 'Semua'
      ? data.puzzles
      : data.puzzles.filter((p) => formatType(p.type) === filter);

  const solvedCount = data?.solved?.length ?? 0;
  const totalCount = data?.puzzles?.length ?? 0;

  return (
    <>
      {/* Page header dengan gradient */}
      <div className="puzzle-page-header">
        <span className="puzzle-header-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Puzzle size={40} />
        </span>
        <div className="puzzle-header-text">
          <h1>Puzzle Matematika</h1>
          <p className="puzzle-header-subtitle">
            Selesaikan teka-teki untuk mendapat poin tambahan dan mengasah logika.
          </p>
          {data && (
            <div className="puzzle-header-stats">
              <span className="puzzle-stat-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Package size={14} /> {totalCount} puzzle tersedia
              </span>
              {user && (
                <span className="puzzle-stat-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} /> {solvedCount} selesai
                </span>
              )}
              {user && totalCount > 0 && (
                <span className="puzzle-stat-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Target size={14} /> {Math.round((solvedCount / totalCount) * 100)}% selesai
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter chips */}
      {!loading && !error && (
        <div className="puzzle-filter" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            options={types.map(t => ({ value: t, label: t }))}
          />
        </div>
      )}

      {/* State: loading */}
      {loading && (
        <div className="puzzle-hub">
          {[...Array(6)].map((_, i) => <PuzzleSkeleton key={i} />)}
        </div>
      )}

      {/* State: error */}
      {error && !loading && (
        <div className="admin-error-state" style={{ marginTop: 12 }}>
          <span>⚠️</span>
          <div>
            <strong>Gagal memuat puzzle</strong><br />
            {error}
          </div>
          <button
            className="btn btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => { setLoading(true); setError(null); api('/puzzles').then((d) => { setData(d); setLoading(false); }).catch((e) => { setError(e.message); setLoading(false); }); }}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* State: data tersedia */}
      {!loading && !error && data && (
        <>
          {shown.length === 0 ? (
            <div className="puzzle-empty">
              <div className="puzzle-empty-icon"><Puzzle size={40} /></div>
              <h3>Tidak ada puzzle</h3>
              <p>Coba pilih kategori lain.</p>
            </div>
          ) : (
            <div className="puzzle-hub">
              {shown.map((p) => {
                const solved = data.solved?.includes(p.id);
                const bannerClass = getBannerClass(p.type);
                const typeLabel = formatType(p.type);
                const badgeClass = getBadgeClass(p.type);
                const diffClass = getDiffBadgeClass(p.difficulty);
                const diffLabel = getDiffLabel(p.difficulty);
                return (
                  <Link
                    key={p.id}
                    to={`/puzzle/${p.id}`}
                    className="puzzle-card"
                    aria-label={`${p.title} — ${typeLabel}, ${diffLabel}`}
                  >
                    {/* Banner ikon */}
                    <div className={`puzzle-card-banner ${bannerClass}`}>
                      {getPuzzleIcon(p.type)}
                    </div>

                    {/* Body */}
                    <div className="puzzle-card-body">
                      {/* Badge baris atas */}
                      <div className="puzzle-card-tags">
                        <span className={`puzzle-badge-type ${badgeClass}`}>{typeLabel}</span>
                        {p.difficulty && (
                          <span className={`puzzle-badge-diff ${diffClass}`}>{diffLabel}</span>
                        )}
                        {solved && (
                          <span className="puzzle-badge-done">✓ Selesai</span>
                        )}
                        {!solved && p.points && (
                          <span className="puzzle-badge-points">+{p.points} poin</span>
                        )}
                      </div>

                      {/* Judul */}
                      <h3 className="puzzle-card-title">{p.title}</h3>

                      {/* Deskripsi */}
                      {p.description && (
                        <p className="puzzle-card-desc">{p.description}</p>
                      )}
                    </div>

                    {/* Footer CTA */}
                    <div className="puzzle-card-footer">
                      <span className="puzzle-card-btn">
                        {solved ? '🔁 Main Lagi' : '▶ Mulai'} →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Ajakan login jika belum masuk */}
          {!user && totalCount > 0 && (
            <div className="notice" style={{ marginTop: 20, textAlign: 'center' }}>
              💡 <Link to="/masuk" style={{ fontWeight: 600, color: 'var(--blue-d)' }}>Masuk</Link> untuk menyimpan progres puzzle dan mendapatkan poin.
            </div>
          )}
        </>
      )}
    </>
  );
}
