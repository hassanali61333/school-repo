"use client";
import { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { addSchool, updateSchool, deleteSchool, setLoading } from '@/app/lib/schoolSlice.js';
export default function SchoolsPage() {
const dispatch = useDispatch();
const { schools, loading } = useSelector((state) => state.schools);
  const [showModal, setShowModal] = useState(false);
  const [editSchool, setEditSchool] = useState(null);
  const [formData, setFormData] = useState({ name: "", address: "", city: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditSchool(null);
    setFormData({ name: "", address: "", city: "", phone: "", email: "" });
    setShowModal(true);
  };

  const openEdit = (school) => {
    setEditSchool(school);
    setFormData({ name: school.name, address: school.address, city: school.city, phone: school.phone, email: school.email || "" });
    setShowModal(true);
  };

 const handleSave = () => {
  if (!formData.name || !formData.city || !formData.phone) {
    alert("Name, City aur Phone zaroor bharo");
    return;
  }

  setSaving(true);
  
  setTimeout(() => {
    if (editSchool) {
      dispatch(updateSchool({ ...editSchool, ...formData }));
    } else {
      const newSchool = {
        _id: Date.now().toString(),
        ...formData,
        isActive: true
      };
      dispatch(addSchool(newSchool));
    }
    
    setSaving(false);
    setShowModal(false);
  }, 500);
};

  const handleDelete = (id) => {
    if (!confirm("Are u delete this school?")) return;
dispatch(deleteSchool(id));
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
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Schools</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Manage all schools</p>
        </div>
        <button onClick={openAdd} style={{
          padding: "10px 20px", borderRadius: "8px", background: "#3b5bdb",
          color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500",
        }}>
          + Add School
        </button>
      </div>

      {/* Schools Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>Loading...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {schools.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "#9ca3af" }}>
              Koi school nahi mili — pehli school add karo!
            </div>
          ) : (
            schools.map((school) => (
              <div key={school._id} style={{
                background: "#fff", borderRadius: "12px", padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "10px",
                    background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px",
                  }}>🏫</div>
                  <span style={{
                    padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
                    background: school.isActive ? "#d1fae5" : "#fee2e2",
                    color: school.isActive ? "#065f46" : "#991b1b",
                  }}>
                    {school.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>{school.name}</h3>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 4px" }}>📍 {school.city}</p>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px" }}>📞 {school.phone}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => openEdit(school)} style={{
                    flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb",
                    background: "#fff", cursor: "pointer", fontSize: "13px", color: "#374151",
                  }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(school._id)} style={{
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
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "460px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                {editSchool ? "School Edit Karo" : "Nayi School Add Karo"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "School Name *", key: "name", placeholder: "Al-Noor School" },
                { label: "City *", key: "city", placeholder: "Lahore" },
                { label: "Phone *", key: "phone", placeholder: "03XX-XXXXXXX" },
                { label: "Address", key: "address", placeholder: "Street, Area" },
                { label: "Email", key: "email", placeholder: "school@email.com" },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: "12px", borderRadius: "8px", background: "#3b5bdb",
                color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500",
              }}>
                {saving ? "Saving..." : editSchool ? "Update" : "Add school"}
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