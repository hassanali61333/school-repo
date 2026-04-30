"use client";
import { useEffect, useState } from "react";
import { getAllResults, addResult, deleteResult } from "@/app/services/schoolService.js";

const emptyForm = { studentId: "", class: "", exam: "", year: new Date().getFullYear(), subjects: [{ name: "", totalMarks: "", obtainedMarks: "" }] };

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const schoolId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.schoolId : null;

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const res = await getAllResults(schoolId);
      if (res.data.success) setResults(res.data.results);
    } catch (err) { console.log(err.message); }
    finally { setLoading(false); }
  };

  const addSubject = () => setFormData(prev => ({ ...prev, subjects: [...prev.subjects, { name: "", totalMarks: "", obtainedMarks: "" }] }));
  const removeSubject = (i) => setFormData(prev => ({ ...prev, subjects: prev.subjects.filter((_, idx) => idx !== i) }));
  const updateSubject = (i, key, val) => setFormData(prev => {
    const subs = [...prev.subjects];
    subs[i] = { ...subs[i], [key]: val };
    return { ...prev, subjects: subs };
  });

  const handleSave = async () => {
    if (!formData.studentId || !formData.exam || !formData.class) { alert("Saari fields bharo"); return; }
    setSaving(true);
    try {
      const totalMarks = formData.subjects.reduce((s, sub) => s + Number(sub.totalMarks || 0), 0);
      const obtainedMarks = formData.subjects.reduce((s, sub) => s + Number(sub.obtainedMarks || 0), 0);
      const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(1) : 0;
      const grade = percentage >= 80 ? "A" : percentage >= 60 ? "B" : percentage >= 45 ? "C" : "F";
      const res = await addResult({ ...formData, schoolId, totalMarks, obtainedMarks, percentage, grade, status: percentage >= 45 ? "pass" : "fail" });
      if (res.data.success) { fetchResults(); setShowModal(false); setFormData(emptyForm); }
    } catch (err) { alert("Error aaya"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete karna chahte ho?")) return;
    const res = await deleteResult(id);
    if (res.data.success) fetchResults();
  };

  const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Results</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Student exam results</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
          + Add Result
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Student", "Class", "Exam", "Marks", "Percentage", "Grade", "Status", ""].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Loading...</td></tr>
              : results.length === 0 ? <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Koi result nahi</td></tr>
                : results.map(r => (
                  <tr key={r._id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{r.studentId?.name || r.studentId}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{r.class}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{r.exam}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{r.obtainedMarks}/{r.totalMarks}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{r.percentage}%</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#3b5bdb" }}>{r.grade}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: r.status === "pass" ? "#d1fae5" : "#fee2e2", color: r.status === "pass" ? "#065f46" : "#991b1b" }}>{r.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => handleDelete(r._id)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #fee2e2", background: "#fff", cursor: "pointer", fontSize: "12px", color: "#dc2626" }}>🗑️</button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "540px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Add Result</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {[
                { label: "Student ID *", key: "studentId", placeholder: "Student ID daalo" },
                { label: "Class *", key: "class", placeholder: "5" },
                { label: "Exam *", key: "exam", placeholder: "Mid Term / Final" },
                { label: "Year *", key: "year", placeholder: "2025" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} style={inputStyle} />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>Subjects</label>
                <button onClick={addSubject} style={{ padding: "4px 12px", borderRadius: "6px", background: "#eff6ff", border: "none", color: "#3b5bdb", cursor: "pointer", fontSize: "13px" }}>+ Add</button>
              </div>
              {formData.subjects.map((sub, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                  <input placeholder="Subject name" value={sub.name} onChange={e => updateSubject(i, "name", e.target.value)} style={inputStyle} />
                  <input placeholder="Total" value={sub.totalMarks} onChange={e => updateSubject(i, "totalMarks", e.target.value)} style={inputStyle} />
                  <input placeholder="Obtained" value={sub.obtainedMarks} onChange={e => updateSubject(i, "obtainedMarks", e.target.value)} style={inputStyle} />
                  {i > 0 && <button onClick={() => removeSubject(i)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "18px" }}>×</button>}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
                {saving ? "Saving..." : "Save Result"}
              </button>
              <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}