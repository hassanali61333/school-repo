"use client";
import { useState } from "react";

const emptyForm = {
  name: "", fatherName: "", phone: "", email: "",
  subject: "", qualification: "", salary: "",
  gender: "", address: ""
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState("");

  // ➤ SAVE (STATE ONLY)
  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      alert("Name aur Phone zaroor bharo");
      return;
    }

    if (editTeacher) {
      setTeachers(prev =>
        prev.map(t =>
          t._id === editTeacher._id ? { ...t, ...formData } : t
        )
      );
    } else {
      setTeachers(prev => [
        ...prev,
        { ...formData, _id: Date.now().toString(), status: "active" }
      ]);
    }

    setFormData(emptyForm);
    setEditTeacher(null);
    setShowModal(false);
  };

  const openAdd = () => {
    setEditTeacher(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditTeacher(t);
    setFormData(t);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setTeachers(prev => prev.filter(t => t._id !== id));
  };

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box"
  };

  const labelStyle = {
    fontSize: "13px",
    color: "#374151",
    fontWeight: "500",
    display: "block",
    marginBottom: "6px"
  };

  return (
    <div>

      {/* HEADER SAME */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>
            Teachers
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
            Total: {teachers.length}
          </p>
        </div>

        <button onClick={openAdd}
          style={{ padding: "10px 20px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none" }}>
          + Add Teacher
        </button>
      </div>

      {/* SEARCH SAME */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name..."
        style={{ ...inputStyle, marginBottom: "20px", maxWidth: "360px" }}
      />

      {/* GRID SAME */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {filtered.map(t => (
          <div key={t._id} style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #f0f0f0" }}>
            <h3> <span className="text-blue-900"> Name </span>:{t.name}</h3>
            <p>  <span className="text-blue-900"> phone</span>: {t.phone}</p>
            <p>  <span className="text-blue-900">subject</span> : {t.subject}</p>

<div className="flex gap-2 mt-3">

  {/* EDIT BUTTON */}
  <button
    onClick={() => openEdit(t)}
    className="flex-1 px-3 py-2 rounded-md text-sm font-medium
               bg-blue-50 text-blue-600 border border-blue-200
               hover:bg-blue-100 transition"
  >
    Edit
  </button>

  {/* DELETE BUTTON */}
  <button
    onClick={() => handleDelete(t._id)}
    className="flex-1 px-3 py-2 rounded-md text-sm font-medium
               bg-red-50 text-red-600 border border-red-200
               hover:bg-red-100 transition"
  >
    Delete
  </button>

</div>
          </div>
        ))}
      </div>

      {/* ✅ EXACT SAME POPUP UI (UNCHANGED STRUCTURE) */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "500px", maxHeight: "90vh", overflowY: "auto" }}>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                {editTeacher ? "Teacher Edit" : "Naya Teacher Add"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px" }}>✕</button>
            </div>

            {/* ✅ EXACT SAME FIELDS */}
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
                  <label style={labelStyle}>{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={formData[f.key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [f.key]: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>
              ))}

              <div>
                <label style={labelStyle}>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

            </div>

            {/* BUTTONS SAME STYLE */}
          <div className="flex gap-3 mt-6">

  {/* PRIMARY BUTTON */}
  <button
    onClick={handleSave}
    className="flex-1 px-4 py-3 rounded-lg bg-emerald-600 text-white text-sm font-semibold
               hover:bg-emerald-700 transition"
  >
    {editTeacher ? "Update" : "Add Teacher"}
  </button>

  {/* SECONDARY BUTTON */}
  <button
    onClick={() => setShowModal(false)}
    className="px-5 py-3 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium
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