import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import KilatHitung from './games/KilatHitung';
import Game2048 from './games/Game2048';
import Threes from './games/Threes';
import MathRiddles from './games/MathRiddles';
import CryptarithmBasic from './games/CryptarithmBasic';
import Sudoku from './games/Sudoku';
import KenKen from './games/KenKen';
import Calculords from './games/Calculords';
import CryptarithmAdvanced from './games/CryptarithmAdvanced';
import IconTile from '@/components/IconTile';
import SegmentedControl from '@/components/SegmentedControl';
import { Gamepad2, Info, GraduationCap, Lightbulb, Zap, Grid3x3, Grip, MessageCircleQuestion, KeyRound, LayoutGrid, TableCellsMerge, Calculator, ShieldQuestion, Trophy } from 'lucide-react';

const GAME_ICON_MAP = {
  'kilat': Zap,
  '2048': Grid3x3,
  'threes': Grip,
  'riddle': MessageCircleQuestion,
  'crypt_basic': KeyRound,
  'sudoku': LayoutGrid,
  'kenken': TableCellsMerge,
  'calculords': Calculator,
  'crypt_adv': ShieldQuestion,
};

const GAME_COLOR_MAP = {
  'kilat': 'orange',
  '2048': 'blue',
  'threes': 'green',
  'riddle': 'red',
  'crypt_basic': 'purple',
  'sudoku': 'blue',
  'kenken': 'green',
  'calculords': 'orange',
  'crypt_adv': 'purple',
};

function GameTutorialPanel({ game }) {
  const [open, setOpen] = useState(true);
  const GameIcon = GAME_ICON_MAP[game.id] || Gamepad2;
  const gameColor = GAME_COLOR_MAP[game.id] || 'blue';
  return (
    <div className={`game-tutorial-panel ${open ? 'open' : ''}`}>
      <button className="game-tutorial-toggle" onClick={() => setOpen(o => !o)}>
        <span className="tutorial-toggle-icon"><IconTile icon={GameIcon} color={gameColor} /></span>
        <span className="tutorial-toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Info size={16} /> Cara Bermain & Tujuan Belajar</span>
        <span className="tutorial-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="game-tutorial-body">
          <div className="game-tutorial-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Gamepad2 size={16} /> Cara Bermain</h4>
            <p>{game.tutorial}</p>
          </div>
          <div className="game-tutorial-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><GraduationCap size={16} /> Tujuan Belajar</h4>
            <p>{game.learningGoal}</p>
          </div>
          {game.tips && (
            <div className="game-tutorial-section">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lightbulb size={16} /> Tips Strategi</h4>
              <ul className="tutorial-tips-list">
                {game.tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const COMPONENT_MAP = {
  'kilat': KilatHitung,
  '2048': Game2048,
  'threes': Threes,
  'riddle': MathRiddles,
  'crypt_basic': CryptarithmBasic,
  'sudoku': Sudoku,
  'kenken': KenKen,
  'calculords': Calculords,
  'crypt_adv': CryptarithmAdvanced,
};

export default function Games() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get('game');
  const [myScores, setMyScores] = useState({});
  const [filter, setFilter] = useState('Semua');
  const [gamesList, setGamesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/games')
      .then(d => {
        setGamesList(d.games || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    if (user) {
      api('/games/my-scores').then(d => setMyScores(d.scores || {})).catch(() => {});
    }
  }, [user]);

  const submitScore = useCallback(async (gameType, score) => {
    if (!user) return;
    try {
      const d = await api('/games/score', { method: 'POST', body: { game_type: gameType, score } });
      setUser(d.user);
      setMyScores(prev => ({
        ...prev,
        [gameType]: { best_score: Math.max(score, prev[gameType]?.best_score || 0) },
      }));
      return d;
    } catch { return null; }
  }, [user, setUser]);

  if (selected) {
    const game = gamesList.find(g => g.id === selected) || {};
    const Comp = COMPONENT_MAP[selected];

    if (!Comp) {
      return <div className="card">Game tidak ditemukan.</div>;
    }
    return (
      <>
        <button
          className="back btn-ghost"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--blue-d)', fontWeight: 600 }}
          onClick={(e) => { e.preventDefault(); nav(-1); }}
        >
          ← Semua Game
        </button>
        <GameTutorialPanel game={game} />
        <Comp
          user={user}
          submitScore={(score) => submitScore(game.id, score)}
          bestScore={myScores[selected]?.best_score}
          nav={nav}
        />
      </>
    );
  }

  const levels = ['Semua', 'Sederhana', 'Sulit'];
  const shown = filter === 'Semua' ? gamesList : gamesList.filter(g => g.level === filter);

  if (loading) return <div className="card text-center muted" style={{ marginTop: 20 }}>Memuat game...</div>;

  return (
    <>
      <div className="games-page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><IconTile icon={Gamepad2} color="blue" /> Game Matematika</h1>
        <p className="muted">Latih kemampuan matematika dan logikamu sambil bermain! Setiap game dirancang untuk mengasah konsep matematika tertentu.</p>
      </div>

      <div className="games-legend">
        <div className="legend-item">
          <span className="tag tag-level-easy">Sederhana</span>
          <span className="legend-desc">Cocok untuk aritmetika dasar & pengenalan pola</span>
        </div>
        <div className="legend-item">
          <span className="tag tag-level-hard">Sulit</span>
          <span className="legend-desc">Deduksi multi-langkah, kombinatorika & geometri</span>
        </div>
      </div>

      <div className="game-filter" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={levels.map(l => ({ value: l, label: l }))}
        />
      </div>

      <div className="game-hub">
        {shown.map(g => {
          const GI = GAME_ICON_MAP[g.id] || Gamepad2;
          const gc = GAME_COLOR_MAP[g.id] || 'blue';
          return (
          <button key={g.id} className="game-card" onClick={() => setSearchParams({ game: g.id })} aria-label={`Mainkan ${g.label}`}>
            <span className="game-card-emoji"><IconTile icon={GI} color={gc} /></span>
            <div className="game-card-info">
              <h3>{g.label}</h3>
              <p className="game-card-desc">{g.desc}</p>
            </div>
            <div className="game-card-meta">
              <span className={`tag tag-level-${g.level === 'Sulit' ? 'hard' : 'easy'}`}>{g.level}</span>
              {myScores[g.id] && (
                <span className="pts" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trophy size={14} className="text-orange" /> {myScores[g.id].best_score}</span>
              )}
            </div>
          </button>
        )})}
      </div>
    </>
  );
}
