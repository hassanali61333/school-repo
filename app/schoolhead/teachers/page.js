"use client";
import { useEffect, useState } from "react";
import { getAllTeachers, addTeacher, updateTeacher, deleteTeacher } from "@/app/services/schoolService.js";

const emptyForm = { name: "", fatherName: "", phone: "", email: "", subject: "", qualification: "", salary: "", gender: "", address: "" };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const schoolId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.schoolId : null;

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      const res = await getAllTeachers(schoolId);
      if (res.data.success) setTeachers(res.data.teachers);
    } catch (err) { console.log(err.message); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditTeacher(null); setFormData(emptyForm); setShowModal(true); };
  const openEdit = (t) => { setEditTeacher(t); setFormData({ name: t.name, fatherName: t.fatherName || "", phone: t.phone, email: t.email || "", subject: t.subject || "", qualification: t.qualification || "", salary: t.salary || "", gender: t.gender || "", address: t.address || "" }); setShowModal(true); };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) { alert("Name aur Phone zaroor bharo"); return; }
    setSaving(true);
    try {
      const payload = { ...formData, schoolId };
      const res = editTeacher ? await updateTeacher(editTeacher._id, payload) : await addTeacher(payload);
      if (res.data.success) { fetchTeachers(); setShowModal(false); }
      else alert(res.data.message || "Error aaya");
    } catch (err) { alert("Server error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Teacher delete karna chahte ho?")) return;
    const res = await deleteTeacher(id);
    if (res.data.success) fetchTeachers();
  };

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Teachers</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Total: {teachers.length}</p>
        </div>
        <button onClick={openAdd} style={{ padding: "10px 20px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
          + Add Teacher
        </button>
      </div>

      <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ ...inputStyle, marginBottom: "20px", maxWidth: "360px" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {loading ? <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#9ca3af" }}>Loading...</div>
          : filtered.length === 0 ? <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#9ca3af" }}>Koi teacher nahi mila</div>
            : filtered.map(t => (
              <div key={t._id} style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    👨‍🏫
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", background: t.status === "active" ? "#d1fae5" : "#fee2e2", color: t.status === "active" ? "#065f46" : "#991b1b" }}>
                    {t.status}
                  </span>
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>{t.name}</h3>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 2px" }}>📚 {t.subject || "N/A"}</p>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 2px" }}>📞 {t.phone}</p>
                <p style={{ fontSize: "13px", color: "#0ca678", margin: "0 0 16px", fontWeight: "500" }}>💰 Rs. {t.salary?.toLocaleString()}/month</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => openEdit(t)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "13px" }}>✏️ Edit</button>
                  <button onClick={() => handleDelete(t._id)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #fee2e2", background: "#fff", cursor: "pointer", fontSize: "13px", color: "#dc2626" }}>🗑️ Delete</button>
                </div>
              </div>
            ))}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>{editTeacher ? "Teacher Edit" : "Naya Teacher Add"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { label: "Full Name *", key: "name", placeholder: "Ustad Ahmed" },
                { label: "Phone *", key: "phone", placeholder: "03XX-XXXXXXX" },
                { label: "Subject", key: "subject", placeholder: "Math" },
                { label: "Qualification", key: "qualification", placeholder: "M.Sc" },
                { label: "Salary", key: "salary", placeholder: "15000" },
                { label: "Email", key: "email", placeholder: "teacher@email.com" },
                { label: "Father Name", key: "fatherName", placeholder: "Khan Sahab" },
                { label: "Address", key: "address", placeholder: "House #, Street" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Gender</label>
                <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} style={inputStyle}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
                {saving ? "Saving..." : editTeacher ? "Update" : "Add Teacher"}
              </button>
              <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}