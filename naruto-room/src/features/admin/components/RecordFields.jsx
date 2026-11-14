import React from 'react';
export default function RecordFields({ label, rows = [], fields, onChange, children }) {
  function move(from, to) {
    const next = rows.slice();
    next.splice(to, 0, ...next.splice(from, 1));
    onChange(next);
  }
  return (
    <fieldset>
      <legend>{label}</legend>
      {rows.map((row, i) => {
        const update = (patch) => onChange(rows.map((r, n) => (n === i ? { ...r, ...patch } : r)));
        return (
          <fieldset key={i}>
            <legend>{i + 1}</legend>
            <div className="cms-row">
              {fields.map((key) => (
                <label key={key}>
                  {key}
                  <input value={row[key] ?? ''} onChange={(e) => update({ [key]: e.target.value })} />
                </label>
              ))}
            </div>
            {children?.(row, update)}
            <div className="cms-toolbar">
              <button type="button" disabled={!i} onClick={() => move(i, i - 1)}>
                Move up
              </button>
              <button type="button" disabled={i === rows.length - 1} onClick={() => move(i, i + 1)}>
                Move down
              </button>
              <button type="button" onClick={() => onChange(rows.filter((_, n) => n !== i))}>
                Remove
              </button>
            </div>
          </fieldset>
        );
      })}
      <button type="button" onClick={() => onChange([...rows, { id: crypto.randomUUID() }])}>
        Add item
      </button>
    </fieldset>
  );
}
