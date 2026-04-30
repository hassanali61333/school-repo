"use client";
import { useEffect, useState } from "react";
import { getAllStudents, addStudent, updateStudent, deleteStudent } from "@/app/services/schoolService.js";

const emptyForm = {
  name: "", fatherName: "", phone: "", rollNumber: "",
  class: "", section: "", gender: "", address: "", monthlyFee: ""
};

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const schoolId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.schoolId : null;

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await getAllStudents(schoolId);
      if (res.data.success) setStudents(res.data.students);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditStudent(null); setFormData(emptyForm); setShowModal(true); };
  const openEdit = (s) => { setEditStudent(s); setFormData({ name: s.name, fatherName: s.fatherName, phone: s.phone, rollNumber: s.rollNumber, class: s.class, section: s.section || "", gender: s.gender || "", address: s.address || "", monthlyFee: s.monthlyFee || "" }); setShowModal(true); };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.rollNumber || !formData.class) {
      alert("Name, Phone, Roll No aur Class zaroor bharo"); return;
    }
    setSaving(true);
    try {
      const payload = { ...formData, schoolId };
      const res = editStudent
        ? await updateStudent(editStudent._id, payload)
        : await addStudent(payload);
      if (res.data.success) { fetchStudents(); setShowModal(false); }
      else alert(res.data.message || "Error aaya");
    } catch (err) {
      alert("Server error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Student delete karna chahte ho?")) return;
    try {
      const res = await deleteStudent(id);
      if (res.data.success) fetchStudents();
    } catch (err) { alert("Delete error"); }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.includes(search)
  );

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box" };
  const labelStyle = { fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Students</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Total: {students.length}</p>
        </div>
        <button onClick={openAdd} style={{ padding: "10px 20px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
          + Add Student
        </button>
      </div>

      {/* Search */}
      <input
        type="text" placeholder="Search by name or roll no..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        style={{ ...inputStyle, marginBottom: "20px", maxWidth: "360px" }}
      />

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Roll No", "Name", "Father Name", "Class", "Phone", "Fee", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Koi student nahi mila</td></tr>
            ) : filtered.map((s) => (
              <tr key={s._id} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{s.rollNumber}</td>
                <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{s.name}</td>
                <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{s.fatherName}</td>
                <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{s.class} {s.section}</td>
                <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{s.phone}</td>
                <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>Rs. {s.monthlyFee}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: s.status === "active" ? "#d1fae5" : "#fee2e2", color: s.status === "active" ? "#065f46" : "#991b1b" }}>
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => openEdit(s)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "12px" }}>✏️</button>
                    <button onClick={() => handleDelete(s._id)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #fee2e2", background: "#fff", cursor: "pointer", fontSize: "12px", color: "#dc2626" }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>{editStudent ? "Student Edit" : "Naya Student Add"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { label: "Full Name *", key: "name", placeholder: "Ali Ahmed" },
                { label: "Father Name *", key: "fatherName", placeholder: "Ahmed Khan" },
                { label: "Phone *", key: "phone", placeholder: "03XX-XXXXXXX" },
                { label: "Roll Number *", key: "rollNumber", placeholder: "001" },
                { label: "Class *", key: "class", placeholder: "5" },
                { label: "Section", key: "section", placeholder: "A" },
                { label: "Address", key: "address", placeholder: "House #, Street" },
                { label: "Monthly Fee", key: "monthlyFee", placeholder: "2000" },
              ].map((field) => (
                <div key={field.key}>
                  <label style={labelStyle}>{field.label}</label>
                  <input type="text" placeholder={field.placeholder} value={formData[field.key]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Gender</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} style={inputStyle}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
                {saving ? "Saving..." : editStudent ? "Update" : "Add Student"}
              </button>
              <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}