import { useState } from "react";
import { ArrowRight, Copy, FileCode, GitCompareArrows } from "lucide-react";
import "../styles/audit-details.css";

function parsePayload(value) {
  if (value == null || value === "") return { value: undefined };
  if (typeof value !== "string") return { value };
  try { return { value: JSON.parse(value) }; }
  catch { return { value, invalid: true }; }
}

function sameValue(before, after) {
  if (Object.is(before, after)) return true;
  if (!before || !after || typeof before !== "object" || typeof after !== "object") return false;
  if (Array.isArray(before) !== Array.isArray(after)) return false;
  const keys = Object.keys(before);
  return keys.length === Object.keys(after).length && keys.every((key) => Object.hasOwn(after, key) && sameValue(before[key], after[key]));
}

function fieldLabel(key) {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/\bId\b/g, "ID").replace(/^./, (letter) => letter.toUpperCase());
}

function Value({ value }) {
  if (value === undefined) return <span className="audit-value-empty">Not recorded</span>;
  if (value === null) return <span className="audit-value-empty">Not set</span>;
  if (value === "") return <span className="audit-value-empty">Empty text</span>;
  if (typeof value === "boolean") return <span className={`audit-boolean ${value ? "is-true" : ""}`}>{value ? "Yes" : "No"}</span>;
  if (Array.isArray(value)) return value.length ? <ul className="audit-value-list">{value.map((item, index) => <li key={index}><Value value={item} /></li>)}</ul> : <span className="audit-value-empty">Empty list</span>;
  if (typeof value === "object") return Object.keys(value).length ? <dl className="audit-value-object">{Object.entries(value).map(([key, item]) => <div key={key}><dt>{fieldLabel(key)}</dt><dd><Value value={item} /></dd></div>)}</dl> : <span className="audit-value-empty">Empty object</span>;
  return <span>{String(value)}</span>;
}

function rawPayload(value) {
  if (value == null || value === "") return "No payload recorded.";
  try { return JSON.stringify(typeof value === "string" ? JSON.parse(value) : value, null, 2); }
  catch { return String(value); }
}

export default function AuditChangeDetails({ entry }) {
  const [showAll, setShowAll] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const before = parsePayload(entry.oldValues);
  const after = parsePayload(entry.newValues);
  const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const asFields = (value) => value === undefined ? {} : isRecord(value) ? value : { Value: value };
  const oldFields = asFields(before.value);
  const newFields = asFields(after.value);
  const fields = [...new Set([...Object.keys(oldFields), ...Object.keys(newFields)])].map((key) => ({
    key, before: oldFields[key], after: newFields[key],
    changed: !sameValue(oldFields[key], newFields[key]),
    kind: !Object.hasOwn(oldFields, key) ? "Added" : !Object.hasOwn(newFields, key) ? "Removed" : "Updated",
  }));
  const changed = fields.filter((field) => field.changed);
  const visible = showAll ? fields : changed;
  const requestId = entry.requestId == null ? "" : String(entry.requestId).trim();

  async function copyId() {
    try { await navigator.clipboard.writeText(requestId); setCopyStatus("Request ID copied."); }
    catch { setCopyStatus("Could not copy. Select the ID to copy it manually."); }
  }

  return <section className="audit-detail" aria-label={`Changes for audit event ${entry.id}`}>
    <header className="audit-detail-header">
      <div className="audit-detail-title"><span className="audit-detail-icon"><GitCompareArrows size={20} /></span><div><h3>Change summary</h3><p>{entry.entityType || "Record"} · #{entry.entityId ?? "—"} · {changed.length} changed {changed.length === 1 ? "field" : "fields"}</p></div></div>
      <div className="audit-request"><span>Request ID</span><div>{requestId ? <><code>{requestId}</code><button type="button" onClick={copyId} aria-label="Copy request ID"><Copy size={14} /></button></> : <span className="audit-value-empty">Not recorded</span>}</div>{copyStatus && <small role="status">{copyStatus}</small>}</div>
    </header>
    <div className="audit-detail-toolbar"><span>Compare recorded values <ArrowRight size={14} /></span><label><input type="checkbox" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} />Show unchanged fields ({fields.length - changed.length})</label></div>
    {(before.invalid || after.invalid) && <p className="audit-detail-notice">Some recorded values are plain text and cannot be compared field by field.</p>}
    <div className="audit-change-head" aria-hidden="true"><span>Field</span><span>Before</span><span>After</span></div>
    {visible.map((field) => <div className={`audit-change-row ${field.changed ? "is-changed" : ""}`} key={field.key}>
      <div className="audit-field-name"><strong>{fieldLabel(field.key)}</strong><small>{field.changed ? field.kind : "Unchanged"}</small></div>
      <div className="audit-before"><span className="audit-mobile-label">Before</span><Value value={field.before} /></div>
      <div className="audit-after"><span className="audit-mobile-label">After</span><Value value={field.after} /></div>
    </div>)}
    {!visible.length && <div className="audit-no-changes">{fields.length ? "No field changes detected in the recorded values. Enable “Show unchanged fields” to inspect them." : "No before or after values were recorded for this event."}</div>}
    <details className="audit-raw"><summary><FileCode size={15} />View original JSON</summary><div className="audit-raw-grid">{[["Before", entry.oldValues], ["After", entry.newValues]].map(([label, value]) => <div key={label}><h4>{label}</h4><pre>{rawPayload(value)}</pre></div>)}</div></details>
  </section>;
}
