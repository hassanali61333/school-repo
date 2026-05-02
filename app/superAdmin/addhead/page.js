"use client";
import { useState,useEffect } from "react";
import { useSelector } from 'react-redux';
import { useRouter } from "next/navigation";
export default function SchoolHeadPage() {

  const router = useRouter();


 
  const { schools } = useSelector((state) => state.schools);
  const [formData, setFormData] = useState({
    schoolId: "",
    schoolName: "",
    headName: "",
    headPhone: "",
    headEmail: "",
    role: "",
    joiningDate: "",
    password:""
  });
  const [heads, setHeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editHead, setEditHead] = useState(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditHead(null);
    setFormData({
      schoolId: "",
      schoolName: "",
      headName: "",
      headPhone: "",
      headEmail: "",
      role: "",
      joiningDate: "",
      password:"",
    });
    setShowModal(true);
  };

  const openEdit = (head) => {
    setEditHead(head);
    setFormData(head);
    setShowModal(true);
  };

  const handleSchoolChange = (e) => {
    const schoolId = e.target.value;
    const selectedSchool = schools.find(s => s._id === schoolId);
    setFormData({
      ...formData,
      schoolId: schoolId,
      schoolName: selectedSchool?.name || ""
    });
  };

  const handleSave = () => {
    if (!formData.schoolId || !formData.headName) {
      alert("School aur Head Name zaroori hai!");
      return;
    }

    setSaving(true);
    
    setTimeout(() => {
      if (editHead) {
        setHeads(heads.map(h => h.id === editHead.id ? { ...formData, id: editHead.id } : formData));
      } else {
        const newHead = {
          id: Date.now().toString(),
          ...formData
        };
        setHeads([...heads, newHead]);
      }
      setSaving(false);
      setShowModal(false);
    }, 500);
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this head?")) return;
    setHeads(heads.filter(h => h.id !== id));
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: "8px",
    border: "1px solid #e5e7eb", fontSize: "14px", outline: "none",
    boxSizing: "border-box",
  };



  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>School Heads</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Manage school heads / principals</p>
        </div>
        <button onClick={openAdd} style={{
          padding: "10px 20px", borderRadius: "8px", background: "#3b5bdb",
          color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500",
        }}>
          + Add School Head
        </button>
      </div>

      {/* Heads Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {heads.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "#9ca3af" }}>
    No head assign
          </div>
        ) : (
          heads.map((head) => (
            <div key={head.id} style={{
              background: "#fff", borderRadius: "12px", padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "10px",
                  background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px",
                }}>👨‍🏫</div>
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>{head.headName}</h3>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 4px" }}>🏫 {head.schoolName}</p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 4px" }}>📞 {head.headPhone || "N/A"}</p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px" }}>✉️ {head.headEmail || "N/A"}</p>
              {head.role && <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 16px" }}>🎯 {head.role}</p>}
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => openEdit(head)} style={{
                  flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb",
                  background: "#fff", cursor: "pointer", fontSize: "13px", color: "#374151",
                }}>
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(head.id)} style={{
                  flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #fee2e2",
                  background: "#fff", cursor: "pointer", fontSize: "13px", color: "#dc2626",
                }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                {editHead ? "Edit School Head" : "Add New School Head"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* School Dropdown */}
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>
                  Select School *
                </label>
                <select
                  value={formData.schoolId}
                  onChange={handleSchoolChange}
                  style={inputStyle}
                >
                  <option value="">-- Select School --</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.name} - {school.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Head Fields */}
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>
                  Head Name *
                </label>
                <input
                  type="text"
                  placeholder="Principal / Director Name"
                  value={formData.headName}
                  onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>
                  Head Phone
                </label>
                <input
                  type="text"
                  placeholder="03XX-XXXXXXX"
                  value={formData.headPhone}
                  onChange={(e) => setFormData({ ...formData, headPhone: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>
                  Head Email
                </label>
                <input
                  type="email"
                  placeholder="head@school.com"
                  value={formData.headEmail}
                  onChange={(e) => setFormData({ ...formData, headEmail: e.target.value })}
                  style={inputStyle}
                />
              </div>

               <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>
                  password
                </label>
                <input
                  type="password"
                  placeholder="......"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>
                  Role / Designation
                </label>
                <input
                  type="text"
                  placeholder="Principal / Vice Principal / Coordinator"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>
                  Joining Date
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: "12px", borderRadius: "8px", background: "#3b5bdb",
                color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500",
              }}>
                {saving ? "Saving..." : editHead ? "Update" : "Add Head"}
              </button>
              <button onClick={() => setShowModal(false)} style={{
                padding: "12px 20px", borderRadius: "8px", border: "1px solid #e5e7eb",
                background: "#fff", cursor: "pointer", fontSize: "14px",
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}