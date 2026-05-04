"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from "next/navigation";
import { getAllSchools, addSchoolHead } from "@/app/services/schoolService";
import { setAdminID } from "@/app/store/userSlice";
export default function SchoolHeadPage() {
  const router = useRouter();

  const dispatch=useDispatch()
  useEffect(() => {
    const admin = localStorage.getItem("LoginAdmin");
    const adminId = localStorage.getItem("AdminID");
    
    if (admin && adminId) {
      dispatch(setAdminID(adminId));
      console.log("AdminID loaded to Redux:", adminId);
    }
  }, [dispatch]);

  // ✅ Get adminID from Redux
  const adminID = useSelector((state) => state.users.adminID);
  console.log("AdminID from Redux:", adminID);

  const [schoolsList, setSchoolsList] = useState([]);
  const [formData, setFormData] = useState({
    schoolId: "",
    schoolName: "",
    headName: "",
    headPhone: "",
    headEmail: "",
    role: "",
    joiningDate: "",
    password: ""
  });
  const [heads, setHeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editHead, setEditHead] = useState(null);
  const [saving, setSaving] = useState(false);

  // ✅ Schools fetch on mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await getAllSchools();
        setSchoolsList(res.data.data || []);
      } catch (err) {
        console.error("Schools load error:", err);
      }
    };
    fetchSchools();
  }, []);

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
      password: "",
    });
    setShowModal(true);
  };

  const openEdit = (head) => {
    setEditHead(head);
    setFormData(head);
    setShowModal(true);
  };

  // ✅ Single handleSchoolChange — schoolId aur schoolName dono set hote hain
  const handleSchoolChange = (e) => {
    const schoolId = e.target.value;
    const selected = schoolsList.find(s => s.schoolId === schoolId);
    setFormData({
      ...formData,
      schoolId: schoolId,
      schoolName: selected?.schoolName || "",
    });
  };

  // ✅ handleSave — API call with schoolId + schoolName
const handleSave = async () => {
  if (!formData.schoolId || !formData.headName) {
    alert("School aur Head Name zaroori hai!");
    return;
  }
  if (!formData.headEmail || !formData.password) {
    alert("Email aur Password zaroori hai!");
    return;
  }

  setSaving(true);

  try {
    const data = new FormData();

    data.append("adminId", adminID);
    data.append("schoolId", formData.schoolId);
    data.append("schoolName", formData.schoolName);
    data.append("name", formData.headName);
    data.append("email", formData.headEmail);
    data.append("phone", formData.headPhone);
    data.append("role", formData.role);
    data.append("joiningDate", formData.joiningDate);
    data.append("password", formData.password);

    const res = await addSchoolHead(data);

    console.log(res);

    if (res.data.success) {
      setHeads([...heads, { id: res.data.data.headId, ...res.data.data }]);
      alert("✅ Head added!");
      setShowModal(false);
    }
  } catch (err) {
    alert(err.response?.data?.error || "Something went wrong");
  }

  setSaving(false);
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

              {/* ✅ School Dropdown */}
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>
                  Select School *
                </label>
                <select value={formData.schoolId} onChange={handleSchoolChange} style={inputStyle}>
                  <option value="">-- Select School --</option>
                  {schoolsList.map((school) => (
                    <option key={school.schoolId} value={school.schoolId}>
                      {school.schoolName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Head Name *</label>
                <input type="text" placeholder="Principal / Director Name" value={formData.headName}
                  onChange={(e) => setFormData({ ...formData, headName: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Head Phone</label>
                <input type="text" placeholder="03XX-XXXXXXX" value={formData.headPhone}
                  onChange={(e) => setFormData({ ...formData, headPhone: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Head Email</label>
                <input type="email" placeholder="head@school.com" value={formData.headEmail}
                  onChange={(e) => setFormData({ ...formData, headEmail: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Password</label>
                <input type="password" placeholder="......" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Role / Designation</label>
                <input type="text" placeholder="Principal / Vice Principal / Coordinator" value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Joining Date</label>
                <input type="date" value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })} style={inputStyle} />
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