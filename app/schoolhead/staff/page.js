"use client";
import { useState } from "react";

const emptyForm = { name: "", role: "", phone: "", cnic: "", address: "", salary: "" };
const roleIcons = { clerk: "🗂️", sweeper: "🧹", guard: "💂", other: "👤" };

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  // ➤ ADD / UPDATE (STATE ONLY)
  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.role) {
      alert("Name, Phone aur Role zaroor bharo");
      return;
    }

    if (editStaff) {
      setStaff(prev =>
        prev.map(s =>
          s._id === editStaff._id ? { ...s, ...formData } : s
        )
      );
    } else {
      const newStaff = {
        ...formData,
        _id: Date.now().toString(),
        status: "active"
      };
      setStaff(prev => [...prev, newStaff]);
    }

    setFormData(emptyForm);
    setEditStaff(null);
    setShowModal(false);
  };

  const openAdd = () => {
    setEditStaff(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditStaff(s);
    setFormData(s);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setStaff(prev => prev.filter(s => s._id !== id));
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box"
  };

  return (
    <div>
      {/* HEADER (UNCHANGED UI) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Staff</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
            Clerk, Sweeper, Guard management
          </p>
        </div>

        <button onClick={openAdd} style={{ padding: "10px 20px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none" }}>
          + Add Staff
        </button>
      </div>

      {/* ROLE SUMMARY (UNCHANGED UI) */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {["clerk", "sweeper", "guard", "other"].map(role => (
          <div key={role} style={{ padding: "10px 16px", borderRadius: "10px", background: "#fff", border: "1px solid #f0f0f0" }}>
            {roleIcons[role]} {role} ({staff.filter(s => s.role === role).length})
          </div>
        ))}
      </div>

      {/* TABLE (UNCHANGED UI) */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #f0f0f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Role", "Name", "Phone", "CNIC", "Salary", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                  No staff found
                </td>
              </tr>
            ) : (
              staff.map(s => (
                <tr key={s._id} style={{ borderTop: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "12px 16px" }}>
                    {roleIcons[s.role]} {s.role}
                  </td>
                  <td>{s.name}</td>
                  <td>{s.phone}</td>
                  <td>{s.cnic || "-"}</td>
                  <td>Rs. {s.salary}</td>
                  <td>{s.status}</td>
                  <td>
                   <button
  onClick={() => openEdit(s)}
  className="px-3 py-1 text-xs font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition"
>
  Edit
</button>

<button
  onClick={() => handleDelete(s._id)}
  className="px-3 py-1 text-xs font-medium rounded-md border border-red-200 text-red-600 bg-white hover:bg-red-50 transition"
>
  Delete
</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL (UNCHANGED UI STRUCTURE) */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: 28, borderRadius: 16, width: 460 }}>

            <h2>{editStaff ? "Edit Staff" : "Add Staff"}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />

              <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={inputStyle}>
                <option value="">Role</option>
                <option value="clerk">Clerk</option>
                <option value="sweeper">Sweeper</option>
                <option value="guard">Guard</option>
                <option value="other">Other</option>
              </select>

              <input placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
              <input placeholder="CNIC" value={formData.cnic} onChange={e => setFormData({ ...formData, cnic: e.target.value })} style={inputStyle} />
              <input placeholder="Salary" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} style={inputStyle} />
              <input placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} />
            </div>

            {/* BUTTONS (UNCHANGED UI) */}
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={handleSave}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none" }}
              >
                {editStaff ? "Update" : "Add Staff"}
              </button>

              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff" }}
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