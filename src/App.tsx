import React, { useState, useEffect } from 'react';
import './App.css';

const MOOD_PRESETS = [
  '😊 最高',
  '🙂 良い',
  '😐 普通',
  '😔 いまいち',
  '😢 つらい',
];

type Entry = {
  id?: number;
  date: string;
  mood: string;
  gratitude?: string;
  achievement?: string;
  createdat?: string;
  updatedat?: string;
};

declare global {
  interface Window {
    api: {
      saveEntry: (entry: Entry) => Promise<{ id: number }>;
      getEntries: () => Promise<Entry[]>;
    };
  }
}

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

const App: React.FC = () => {
  const [mood, setMood] = useState(MOOD_PRESETS[2]);
  const [gratitude, setGratitude] = useState('');
  const [achievement, setAchievement] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('Fetching entries...');
    window.api.getEntries()
      .then(entries => {
        console.log('Fetched entries:', entries);
        setEntries(entries);
      })
      .catch(error => {
        console.error('Error fetching entries:', error);
      });
  }, []);

  const handleSave = async () => {
    if (!mood) return;
    setSaving(true);
    console.log('Saving entry...');
    await window.api.saveEntry({
      date: getToday(),
      mood,
      gratitude,
      achievement,
    });
    console.log('Entry saved, fetching updated entries...');
    setMood(MOOD_PRESETS[2]);
    setGratitude('');
    setAchievement('');
    const newEntries = await window.api.getEntries();
    console.log('Updated entries:', newEntries);
    setEntries(newEntries);
    setSaving(false);
  };

  return (
    <div className="container">
      <h1>3行日記</h1>
      <div className="form">
        <label>
          今日の気分（必須）
          <select value={mood} onChange={e => setMood(e.target.value)}>
            {MOOD_PRESETS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          感謝したこと（任意, 140字まで）
          <textarea
            value={gratitude}
            onChange={e => setGratitude(e.target.value.slice(0, 140))}
            maxLength={140}
            rows={2}
          />
        </label>
        <label>
          できたこと（任意, 140字まで）
          <textarea
            value={achievement}
            onChange={e => setAchievement(e.target.value.slice(0, 140))}
            maxLength={140}
            rows={2}
          />
        </label>
        <button onClick={handleSave} disabled={saving} style={{marginTop: 8}}>
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
      <h2>過去の記録</h2>
      <ul className="entries">
        {entries.map(e => (
          <li key={e.id}>
            <b>{e.date}</b> {e.mood}<br/>
            {e.gratitude && <span>感謝: {e.gratitude}<br/></span>}
            {e.achievement && <span>できた: {e.achievement}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
