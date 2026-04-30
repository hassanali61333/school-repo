"use client";
import { useEffect, useState } from "react";
import { getAllSalary, paySalary, getAllTeachers, getAllStaff } from "@/app/services/schoolService.js";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const emptyForm = { personId: "", personType: "teacher", month: "", year: new Date().getFullYear(), basicSalary: "", bonus: "0", deduction: "0", note: "" };

export default function SalaryPage() {
  const [salaries, setSalaries] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterMonth, setFilterMonth] = useState("");

  const schoolId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.schoolId : null;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [salRes, tchRes, stfRes] = await Promise.all([
        getAllSalary(schoolId),
        getAllTeachers(schoolId),
        getAllStaff(schoolId),
      ]);
      if (salRes.data.success) setSalaries(salRes.data.salaries);
      if (tchRes.data.success) setTeachers(tchRes.data.teachers);
      if (stfRes.data.success) setStaff(stfRes.data.staff);
    } catch (err) { console.log(err.message); }
    finally { setLoading(false); }
  };

  const getPersonList = () => formData.personType === "teacher" ? teachers : staff;

  const handlePersonChange = (id) => {
    const list = getPersonList();
    const person = list.find(p => p._id === id);
    setFormData({ ...formData, personId: id, basicSalary: person?.salary || "" });
  };

  const handleSave = async () => {
    if (!formData.personId || !formData.month || !formData.basicSalary) { alert("Saari fields zaroor bharo"); return; }
    setSaving(true);
    try {
      const total = Number(formData.basicSalary) + Number(formData.bonus || 0) - Number(formData.deduction || 0);
      const res = await paySalary({ ...formData, schoolId, totalSalary: total, status: "paid", paidDate: new Date() });
      if (res.data.success) { fetchData(); setShowModal(false); setFormData(emptyForm); }
      else alert(res.data.message || "Error aaya");
    } catch (err) { alert("Server error"); }
    finally { setSaving(false); }
  };

  const getPersonName = (sal) => {
    const list = sal.personType === "teacher" ? teachers : staff;
    return list.find(p => p._id === sal.personId)?.name || "-";
  };

  const filtered = filterMonth ? salaries.filter(s => s.month === filterMonth) : salaries;
  const totalPaid = filtered.filter(s => s.status === "paid").reduce((sum, s) => sum + s.totalSalary, 0);
  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Salary</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Teachers & Staff salary management</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", borderRadius: "8px", background: "#f59f00", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
          + Pay Salary
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Teachers", value: teachers.length, icon: "👨‍🏫", color: "#3b5bdb", bg: "#eff6ff" },
          { label: "Total Staff", value: staff.length, icon: "👷", color: "#f59f00", bg: "#fef3c7" },
          { label: "Salary Paid (filtered)", value: `Rs. ${totalPaid.toLocaleString()}`, icon: "💵", color: "#0ca678", bg: "#d1fae5" },
        ].map(c => (
          <div key={c.label} style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "10px" }}>{c.icon}</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: c.color }}>{c.value}</div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: "20px" }}>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", background: "#fff" }}>
          <option value="">All Months</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Name", "Type", "Month", "Basic", "Bonus", "Deduction", "Total", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Loading...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Koi salary record nahi</td></tr>
                : filtered.map(s => (
                  <tr key={s._id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{getPersonName(s)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: s.personType === "teacher" ? "#eff6ff" : "#fef3c7", color: s.personType === "teacher" ? "#1e40af" : "#92400e", textTransform: "capitalize" }}>
                        {s.personType === "teacher" ? "👨‍🏫" : "👷"} {s.personType}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{s.month} {s.year}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>Rs. {s.basicSalary?.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#0ca678" }}>+Rs. {s.bonus || 0}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#e64980" }}>-Rs. {s.deduction || 0}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#111827" }}>Rs. {s.totalSalary?.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: s.status === "paid" ? "#d1fae5" : "#fee2e2", color: s.status === "paid" ? "#065f46" : "#991b1b" }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "480px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Salary Pay Karo</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Type *</label>
                <select value={formData.personType} onChange={e => setFormData({ ...formData, personType: e.target.value, personId: "", basicSalary: "" })} style={inputStyle}>
                  <option value="teacher">👨‍🏫 Teacher</option>
                  <option value="staff">👷 Staff</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Person *</label>
                <select value={formData.personId} onChange={e => handlePersonChange(e.target.value)} style={inputStyle}>
                  <option value="">Select</option>
                  {getPersonList().map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Month *</label>
                <select value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })} style={inputStyle}>
                  <option value="">Select</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Year</label>
                <input type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} style={inputStyle} />
              </div>
              {[
                { label: "Basic Salary *", key: "basicSalary", placeholder: "15000" },
                { label: "Bonus", key: "bonus", placeholder: "0" },
                { label: "Deduction", key: "deduction", placeholder: "0" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>{f.label}</label>
                  <input type="number" placeholder={f.placeholder} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} style={inputStyle} />
                </div>
              ))}
              <div style={{ gridColumn: "1/-1" }}>
                <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "14px", color: "#374151" }}>Total Salary</span>
                  <span style={{ fontSize: "16px", fontWeight: "700", color: "#0ca678" }}>
                    Rs. {(Number(formData.basicSalary || 0) + Number(formData.bonus || 0) - Number(formData.deduction || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#f59f00", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
                {saving ? "Saving..." : "💵 Pay Salary"}
              </button>
              <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}