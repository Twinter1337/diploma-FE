import { useState, useEffect, useCallback } from 'react';
import type { SessionNote } from '../types';
import {
  getSessionNotes,
  createSessionNote,
  patchSessionNote,
  deleteSessionNote,
} from '../services/sessionNotesService';

interface Props {
  bookingId: string;
  currentUserId: string;
}

function LockIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={11} width={18} height={11} rx={2} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <line x1={12} y1={5} x2={12} y2={19} /><line x1={5} y1={12} x2={19} y2={12} />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

const textareaStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #D9DCE2',
  borderRadius: 8, fontSize: 13.5, fontFamily: 'inherit',
  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
  background: 'white', color: '#0F172A', lineHeight: 1.5,
};

const btnSmallPrimary: React.CSSProperties = {
  padding: '6px 13px', background: 'var(--accent-600)', color: 'white',
  border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
};

const btnSmallGhost: React.CSSProperties = {
  padding: '6px 13px', background: 'white', color: '#3F4651',
  border: '1.5px solid #E7E9EE', borderRadius: 7,
  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};

export default function SessionNotes({ bookingId, currentUserId }: Props) {
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSessionNotes(bookingId);
      setNotes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка завантаження нотаток');
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleAdd = async () => {
    const content = newContent.trim();
    if (!content) return;
    setIsAdding(true);
    setAddError(null);
    try {
      const note = await createSessionNote({ bookingId, content, isPrivate: newIsPrivate });
      setNotes(prev => [note, ...prev]);
      setNewContent('');
      setNewIsPrivate(false);
      setShowAddForm(false);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Не вдалося додати нотатку');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (note: SessionNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditIsPrivate(note.isPrivate);
    setEditError(null);
  };

  const handleSaveEdit = async (noteId: string) => {
    const content = editContent.trim();
    if (!content) return;
    setIsSaving(true);
    setEditError(null);
    try {
      const updated = await patchSessionNote(noteId, { content, isPrivate: editIsPrivate });
      setNotes(prev => prev.map(n => (n.id === noteId ? updated : n)));
      setEditingId(null);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Не вдалося зберегти нотатку');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('Видалити цю нотатку?')) return;
    setDeletingId(noteId);
    try {
      await deleteSessionNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не вдалося видалити нотатку');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid #EDEFF3', paddingTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Нотатки{notes.length > 0 ? ` · ${notes.length}` : ''}
        </span>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{ ...btnSmallGhost, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', fontSize: 12.5 }}
          >
            <PlusIcon /> Додати
          </button>
        )}
      </div>

      {isLoading && (
        <div style={{ height: 32, background: '#F8F9FB', borderRadius: 8, marginBottom: 4 }} />
      )}

      {!isLoading && error && (
        <div style={{ fontSize: 13, color: '#DC2626', padding: '4px 0 8px' }}>{error}</div>
      )}

      {!isLoading && !error && notes.length === 0 && !showAddForm && (
        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#9CA3AF' }}>Нотаток немає</p>
      )}

      {!isLoading && !error && notes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: showAddForm ? 12 : 0, maxHeight: 320, overflowY: 'auto', paddingRight: 2 }}>
          {notes.map(note => {
            const isMine = note.authorId === currentUserId;
            return (
            <div key={note.id} style={{
              padding: '10px 12px',
              background: isMine ? 'var(--accent-50)' : 'white',
              border: isMine ? '1px solid var(--accent-200)' : '1px solid #E7E9EE',
              borderLeft: isMine ? '3px solid var(--accent-500)' : '3px solid #D1D5DB',
              borderRadius: 10,
            }}>
              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    maxLength={5000}
                    rows={3}
                    style={{ ...textareaStyle, minHeight: 72 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#6B7280', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editIsPrivate}
                        onChange={e => setEditIsPrivate(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      Приватна
                    </label>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                      <button
                        onClick={() => handleSaveEdit(note.id)}
                        disabled={!editContent.trim() || isSaving}
                        style={{ ...btnSmallPrimary, opacity: editContent.trim() && !isSaving ? 1 : 0.5, cursor: editContent.trim() && !isSaving ? 'pointer' : 'not-allowed' }}
                      >
                        {isSaving ? 'Збереження…' : 'Зберегти'}
                      </button>
                      <button onClick={() => setEditingId(null)} style={btnSmallGhost}>Скасувати</button>
                    </div>
                  </div>
                  {editError && <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#DC2626' }}>{editError}</p>}
                </div>
              ) : (
                <div>
                  <p style={{ margin: 0, fontSize: 13.5, color: '#0F172A', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {note.content}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    {isMine && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 7px',
                        background: 'var(--accent-100)', color: 'var(--accent-700)',
                        borderRadius: 999, letterSpacing: '0.02em',
                      }}>
                        Ви
                      </span>
                    )}
                    {note.isPrivate && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#9CA3AF' }}>
                        <LockIcon /> Приватна
                      </span>
                    )}
                    {isMine && (
                      <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
                        <button
                          onClick={() => handleStartEdit(note)}
                          title="Редагувати"
                          style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#9CA3AF', borderRadius: 5, display: 'flex', alignItems: 'center' }}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          disabled={deletingId === note.id}
                          title="Видалити"
                          style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#9CA3AF', borderRadius: 5, display: 'flex', alignItems: 'center', opacity: deletingId === note.id ? 0.5 : 1 }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {showAddForm && (
        <div style={{ padding: '12px 14px', background: 'var(--accent-50)', borderRadius: 10, border: '1px solid var(--accent-100)' }}>
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="Напишіть нотатку…"
            maxLength={5000}
            rows={3}
            style={{ ...textareaStyle, minHeight: 80 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#6B7280', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={newIsPrivate}
                onChange={e => setNewIsPrivate(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Приватна
            </label>
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              <button
                onClick={handleAdd}
                disabled={!newContent.trim() || isAdding}
                style={{ ...btnSmallPrimary, opacity: newContent.trim() && !isAdding ? 1 : 0.5, cursor: newContent.trim() && !isAdding ? 'pointer' : 'not-allowed' }}
              >
                {isAdding ? 'Додавання…' : 'Зберегти'}
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewContent(''); setNewIsPrivate(false); setAddError(null); }}
                style={btnSmallGhost}
              >
                Скасувати
              </button>
            </div>
          </div>
          {addError && <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#DC2626' }}>{addError}</p>}
        </div>
      )}
    </div>
  );
}
