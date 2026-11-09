import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import RecordFields from '../RecordFields';
const lines = ['speakerId', 'speaker', 'text'];
export default function DialoguesAdmin() {
  const [rows, setRows] = useState([]),
    [draft, setDraft] = useState(null),
    [message, setMessage] = useState('Loading…'),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    apiRequest('/dialogues?all=true')
      .then((r) => {
        setRows(r.data);
        setDraft(r.data[0]);
        setMessage(r.data.length ? '' : 'Import the existing village conversations to begin.');
      })
      .catch((e) => setMessage(e.message));
  }, []);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (draft.visible && !draft.dialogueSequence?.length)
        throw new Error('Add a line before publishing this conversation.');
      const r = await apiRequest('/dialogues/' + draft.characterId, {
        method: 'PUT',
        body: JSON.stringify(draft),
      });
      setRows(rows.map((item) => (item.characterId === draft.characterId ? r.data : item)));
      setDraft(r.data);
      setMessage('Conversation saved.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-page">
      <h1 className="page-title">NPC dialogues</h1>
      <p role="status">{message}</p>
      {draft && (
        <form className="admin-card" onSubmit={save}>
          <label>
            Character{' '}
            <select
              value={draft.characterId}
              onChange={(e) => setDraft(rows.find((r) => r.characterId === e.target.value))}
            >
              {rows.map((r) => (
                <option key={r.characterId} value={r.characterId}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <RecordFields
            label="Conversation"
            rows={draft.dialogueSequence}
            fields={lines}
            onChange={(dialogueSequence) => setDraft({ ...draft, dialogueSequence })}
          />
          <RecordFields
            label="Player choices"
            rows={draft.choices}
            fields={['text']}
            onChange={(choices) => setDraft({ ...draft, choices })}
          >
            {(choice, update) => (
              <>
                <label>
                  Destination
                  <select
                    value={choice.action || 'close'}
                    onChange={(e) => update({ action: e.target.value })}
                  >
                    {[
                      'close',
                      'open_projects',
                      'open_skills',
                      'open_resume',
                      'open_about',
                      'open_achievements',
                      'open_contact',
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <RecordFields
                  label="Reply"
                  fields={lines}
                  rows={choice.replyDialogue}
                  onChange={(replyDialogue) => update({ replyDialogue })}
                />
              </>
            )}
          </RecordFields>
          <label>
            <input
              type="checkbox"
              checked={draft.visible}
              onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
            />{' '}
            Published
          </label>{' '}
          <button className="admin-primary-btn" disabled={busy}>
            Save conversation
          </button>
        </form>
      )}
    </div>
  );
}
