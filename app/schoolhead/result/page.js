"use client";
import { useEffect, useState } from "react";

const emptyForm = {
  studentId: "",
  class: "",
  exam: "",
  year: new Date().getFullYear(),
  subjects: [{ name: "", totalMarks: "", obtainedMarks: "" }]
};

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);

    const demo = [
      {
        _id: "1",
        studentId: { name: "Ali" },
        class: "5",
        exam: "Mid Term",
        totalMarks: 200,
        obtainedMarks: 170,
        percentage: 85,
        grade: "A",
        status: "pass"
      }
    ];

    setTimeout(() => {
      setResults(demo);
      setLoading(false);
    }, 300);
  }, []);

  const addSubject = () =>
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { name: "", totalMarks: "", obtainedMarks: "" }]
    }));

  const removeSubject = (i) =>
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, idx) => idx !== i)
    }));

  const updateSubject = (i, key, val) =>
    setFormData(prev => {
      const subs = [...prev.subjects];
      subs[i] = { ...subs[i], [key]: val };
      return { ...prev, subjects: subs };
    });

  const handleSave = () => {
    if (!formData.studentId || !formData.exam || !formData.class) {
      alert("fill all feild");
      return;
    }

    setSaving(true);

    const totalMarks = formData.subjects.reduce(
      (s, sub) => s + Number(sub.totalMarks || 0),
      0
    );

    const obtainedMarks = formData.subjects.reduce(
      (s, sub) => s + Number(sub.obtainedMarks || 0),
      0
    );

    const percentage =
      totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(1) : 0;

    const grade =
      percentage >= 80 ? "A" :
      percentage >= 60 ? "B" :
      percentage >= 45 ? "C" : "F";

    const newResult = {
      _id: Date.now().toString(),
      studentId: { name: formData.studentId },
      class: formData.class,
      exam: formData.exam,
      totalMarks,
      obtainedMarks,
      percentage,
      grade,
      status: percentage >= 45 ? "pass" : "fail"
    };

    setResults(prev => [newResult, ...prev]);
    setFormData(emptyForm);
    setShowModal(false);
    setSaving(false);
  };

  const handleDelete = (id) => {
    setResults(prev => prev.filter(r => r._id !== id));
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box"
  };

  return (
    <div>

      {/* HEADER (SAME) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>
            Results
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
            Student exam results
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            background: "#0ca678",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          + Add Result
        </button>
      </div>

      {/* TABLE (SAME UI) */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Student", "Class", "Exam", "Marks", "Percentage", "Grade", "Status", ""].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center" }}>Loading...</td></tr>
            ) : results.map(r => (
              <tr key={r._id} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 16px" }}>{r.studentId?.name}</td>
                <td style={{ padding: "12px 16px" }}>{r.class}</td>
                <td style={{ padding: "12px 16px" }}>{r.exam}</td>
                <td style={{ padding: "12px 16px" }}>{r.obtainedMarks}/{r.totalMarks}</td>
                <td style={{ padding: "12px 16px" }}>{r.percentage}%</td>
                <td style={{ padding: "12px 16px", fontWeight: "600" }}>{r.grade}</td>
                <td style={{ padding: "12px 16px" }}>{r.status}</td>
                <td>
                  <button onClick={() => handleDelete(r._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 EXACT SAME POPUP (NO CHANGE IN UI) */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "28px",
            width: "540px",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                Add Result
              </h2>

              <button onClick={() => setShowModal(false)} style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer"
              }}>✕</button>
            </div>

            {/* FORM (UNCHANGED STYLE) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

              <input placeholder="Student ID"
                value={formData.studentId}
                onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                style={inputStyle}
              />

              <input placeholder="Class"
                value={formData.class}
                onChange={e => setFormData({ ...formData, class: e.target.value })}
                style={inputStyle}
              />

              <input placeholder="Exam"
                value={formData.exam}
                onChange={e => setFormData({ ...formData, exam: e.target.value })}
                style={inputStyle}
              />

            </div>

            {/* SUBJECTS (SAME LOGIC) */}
            <div style={{ marginTop: "12px" }}>
              {formData.subjects.map((s, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "8px", marginBottom: "8px" }}>
                  <input placeholder="Subject"
                    value={s.name}
                    onChange={e => updateSubject(i, "name", e.target.value)}
                    style={inputStyle}
                  />
                  <input placeholder="Total"
                    onChange={e => updateSubject(i, "totalMarks", e.target.value)}
                    style={inputStyle}
                  />
                  <input placeholder="Obtained"
                    onChange={e => updateSubject(i, "obtainedMarks", e.target.value)}
                    style={inputStyle}
                  />

                  {i > 0 && (
                    <button onClick={() => removeSubject(i)}>❌</button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addSubject}>+ Add Subject</button>

           <div className="flex gap-3 mt-3">

  {/* SAVE BUTTON */}
  <button
    onClick={handleSave}
    disabled={saving}
    className="flex-1 px-4 py-3 rounded-lg bg-emerald-600 text-white font-semibold text-sm
               hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {saving ? "Saving..." : "Save Result"}
  </button>

  {/* CANCEL BUTTON */}
  <button
    onClick={() => setShowModal(false)}
    className="px-5 py-3 rounded-lg border border-gray-200 bg-white text-gray-600 font-medium text-sm
               hover:bg-gray-100 hover:text-gray-900 transition"
  >
    Cancel
  </button>

</div>

          </div>
        </div>
      )}

    </div>
  );
}