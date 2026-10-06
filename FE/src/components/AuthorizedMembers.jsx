import { useEffect, useRef, useState } from "react";
import rentalService from "../api/rentalService";
import AddAuthorizedMember from "./AddAuthorizedMember";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-GB");
}

export default function AuthorizedMembers({ agreementId, unitCode }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const revokeLock = useRef(false);
  const [revokingId, setRevokingId] = useState(null);
  const [revokeError, setRevokeError] = useState("");
  const [revokeSuccess, setRevokeSuccess] = useState("");

  async function revoke(member) {
    if (revokeLock.current || loading) return;
    revokeLock.current = true;
    setRevokingId(member.id);
    setRevokeError("");
    setRevokeSuccess("");
    try {
      await rentalService.revokeAuthorizedMember(agreementId, member.id);
      setMembers((current) => current.map((item) => item.id === member.id ? { ...item, status: "revoked" } : item));
      setRevokeSuccess(`Authorization revoked for ${member.fullName}.`);
      refresh();
    } catch (err) {
      setRevokeError(err.status === 404 ? "This member was not found or is no longer active. Refresh the list to check." : err.message || "Unable to revoke authorization. Please try again.");
    } finally {
      revokeLock.current = false;
      setRevokingId(null);
    }
  }

  useEffect(() => {
    let active = true;
    rentalService.getAuthorizedMembers(agreementId)
      .then((data) => { if (active) setMembers(data); })
      .catch((err) => { if (active) setError(err.status === 404 ? "Rental agreement not found." : err.message || "Unable to load authorized members."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [agreementId, attempt]);

  function refresh() {
    setLoading(true);
    setError("");
    setAttempt((value) => value + 1);
  }

  return <section aria-label={`Authorized members for Unit ${unitCode}`} aria-busy={loading} className="mt-6 rounded-2xl border border-[#dfe7f5] bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-base font-bold">Authorized members · Unit {unitCode}</h2>
      <button type="button" onClick={refresh} disabled={loading || revokingId != null} className="rounded-lg border border-[#dfe7f5] px-3 py-2 text-xs font-semibold text-[#1d5fe5] disabled:opacity-50">Refresh</button>
    </div>
    {loading ? <p role="status" className="mt-4 text-sm">Loading authorized members...</p> : error ? <div className="mt-4"><p role="alert" className="text-sm text-red-600">{error}</p><button type="button" onClick={refresh} className="mt-2 text-sm text-[#1d5fe5] underline">Try again</button></div> : members.length === 0 ? <p className="mt-4 text-sm text-[#58657a]">No authorized members for this unit.</p> : <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {members.map((member) => <li key={member.id} className="min-w-0 rounded-xl border border-[#eef1f8] bg-[#f8faff] p-4 text-sm">
        <div className="flex flex-wrap justify-between gap-2"><h3 className="break-words font-semibold">{member.fullName}</h3><span className="rounded-full bg-[#eef4ff] px-2 py-1 text-xs">{member.status}</span></div>
        <dl className="mt-3 space-y-2">
          {[["Relationship", member.relationshipToCustomer], ["Identity fingerprint", member.identityFingerprint], ["Valid from", formatDate(member.validFrom)], ["Valid until", member.validTo ? formatDate(member.validTo) : "No end date"], ["Created", formatDate(member.createdAt)]].map(([label, value]) => <div key={label}><dt className="text-xs text-[#58657a]">{label}</dt><dd className="break-words">{value || "—"}</dd></div>)}
        </dl>
        {member.status === "active" && <button type="button" onClick={() => revoke(member)} disabled={revokingId != null || loading} className="mt-3 rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-600 disabled:opacity-50">{revokingId === member.id ? "Revoking..." : "Revoke access"}</button>}
      </li>)}
    </ul>}
    {!loading && !error && <AddAuthorizedMember disabled={revokingId != null} agreementId={agreementId} onAdded={(member) => { setMembers((current) => [...current.filter((item) => item.id !== member.id), member]); }} />}
    {revokeError && <p role="alert" className="mt-3 text-sm text-red-600">{revokeError}</p>}
    {revokeSuccess && <p role="status" className="mt-3 text-sm text-green-700">{revokeSuccess}</p>}
  </section>;
}
