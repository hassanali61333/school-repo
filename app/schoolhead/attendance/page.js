"use client";
import { useEffect, useState } from "react";

export default function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 👉 Fake initial load (state only)
  useEffect(() => {
    setLoading(true);

    // demo data (you can remove later)
    const demoStudents = [
      { _id: "1", name: "Ali", rollNumber: "001", class: "5", section: "A" },
      { _id: "2", name: "Ahmed", rollNumber: "002", class: "6", section: "B" },
      { _id: "3", name: "Usman", rollNumber: "003", class: "7", section: "A" }
    ];

    setTimeout(() => {
      setStudents(demoStudents);
      setLoading(false);
    }, 300);
  }, [date]);

  // 👉 Mark attendance (state only)
  const handleMark = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // 👉 Save (just UI simulation)
  const handleSave = () => {
    setSaving(true);

    setTimeout(() => {
      alert("Attendance save (demo mode)!");
      setSaving(false);
    }, 500);
  };

  const presentCount = Object.values(attendance).filter(s => s === "present").length;
  const absentCount = Object.values(attendance).filter(s => s === "absent").length;

  return (
    <div>

      {/* HEADER (UNCHANGED) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>
            Attendance
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
            Mark daily attendance
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "14px"
            }}
          />

          <button
            onClick={handleSave}
            disabled={saving}
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
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>

      {/* STATS (UNCHANGED) */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Present", count: presentCount, color: "#d1fae5", text: "#065f46" },
          { label: "Absent", count: absentCount, color: "#fee2e2", text: "#991b1b" },
          { label: "Total", count: students.length, color: "#eff6ff", text: "#1e40af" }
        ].map(s => (
          <div key={s.label} style={{ padding: "16px 24px", borderRadius: "10px", background: s.color }}>
            <div style={{ fontSize: "22px", fontWeight: "700", color: s.text }}>{s.count}</div>
            <div style={{ fontSize: "13px", color: s.text }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* STUDENT LIST (UNCHANGED UI) */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
            Loading...
          </div>
        ) : students.map((s, i) => (
          <div
            key={s._id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderTop: i > 0 ? "1px solid #f0f0f0" : "none",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>
                {s.name}
              </div>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                Roll: {s.rollNumber} | Class: {s.class} {s.section}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {["present", "absent", "leave"].map(status => (
                <button
                  key={status}
                  onClick={() => handleMark(s._id, status)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                    border: "none",
                    fontWeight: attendance[s._id] === status ? "600" : "400",
                    background:
                      attendance[s._id] === status
                        ? status === "present"
                          ? "#0ca678"
                          : status === "absent"
                          ? "#e64980"
                          : "#f59f00"
                        : "#f3f4f6",
                    color:
                      attendance[s._id] === status ? "#fff" : "#6b7280",
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}