"use client";
import { useEffect, useState } from "react";
import { getAllStaff, addStaff, updateStaff, deleteStaff } from "@/app/services/schoolService.js";

const emptyForm = { name: "", role: "", phone: "", cnic: "", address: "", salary: "" };
const roleIcons = { clerk: "🗂️", sweeper: "🧹", guard: "💂", other: "👤" };

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const schoolId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.schoolId : null;

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      const res = await getAllStaff(schoolId);
      if (res.data.success) setStaff(res.data.staff);
    } catch (err) { console.log(err.message); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditStaff(null); setFormData(emptyForm); setShowModal(true); };
  const openEdit = (s) => { setEditStaff(s); setFormData({ name: s.name, role: s.role, phone: s.phone, cnic: s.cnic || "", address: s.address || "", salary: s.salary || "" }); setShowModal(true); };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.role) { alert("Name, Phone aur Role zaroor bharo"); return; }
    setSaving(true);
    try {
      const payload = { ...formData, schoolId };
      const res = editStaff ? await updateStaff(editStaff._id, payload) : await addStaff(payload);
      if (res.data.success) { fetchStaff(); setShowModal(false); }
      else alert(res.data.message || "Error aaya");
    } catch (err) { alert("Server error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Staff delete karna chahte ho?")) return;
    const res = await deleteStaff(id);
    if (res.data.success) fetchStaff();
  };

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Staff</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Clerk, Sweeper, Guard management</p>
        </div>
        <button onClick={openAdd} style={{ padding: "10px 20px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
          + Add Staff
        </button>
      </div>

      {/* Role filter summary */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {["clerk", "sweeper", "guard", "other"].map(role => (
          <div key={role} style={{ padding: "10px 16px", borderRadius: "10px", background: "#fff", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{roleIcons[role]}</span>
            <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500", textTransform: "capitalize" }}>{role}</span>
            <span style={{ fontSize: "13px", color: "#9ca3af" }}>({staff.filter(s => s.role === role).length})</span>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Role", "Name", "Phone", "CNIC", "Salary", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Loading...</td></tr>
              : staff.length === 0 ? <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Koi staff nahi mila</td></tr>
                : staff.map(s => (
                  <tr key={s._id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", background: "#f3f4f6", color: "#374151", textTransform: "capitalize" }}>
                        {roleIcons[s.role]} {s.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{s.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{s.phone}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{s.cnic || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#0ca678" }}>Rs. {s.salary?.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: s.status === "active" ? "#d1fae5" : "#fee2e2", color: s.status === "active" ? "#065f46" : "#991b1b" }}>{s.status}</span>
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

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "460px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>{editStaff ? "Staff Edit" : "Naya Staff Add"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Full Name *</label>
                <input placeholder="Muhammad Ali" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Role *</label>
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={inputStyle}>
                  <option value="">Select Role</option>
                  <option value="clerk">🗂️ Clerk</option>
                  <option value="sweeper">🧹 Sweeper</option>
                  <option value="guard">💂 Guard</option>
                  <option value="other">👤 Other</option>
                </select>
              </div>
              {[
                { label: "Phone *", key: "phone", placeholder: "03XX-XXXXXXX" },
                { label: "CNIC", key: "cnic", placeholder: "XXXXX-XXXXXXX-X" },
                { label: "Salary", key: "salary", placeholder: "8000" },
                { label: "Address", key: "address", placeholder: "House #, Street" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>{f.label}</label>
                  <input placeholder={f.placeholder} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
                {saving ? "Saving..." : editStaff ? "Update" : "Add Staff"}
              </button>
              <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}