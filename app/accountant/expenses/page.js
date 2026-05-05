// "use client";
// import { useEffect, useState } from "react";
// import { getAllExpenses, addExpense, deleteExpense } from "@/app/services/schoolService.js";

// const categories = ["utility", "salary", "maintenance", "stationery", "other"];
// const categoryColors = { utility: { bg: "#eff6ff", color: "#1e40af", icon: "⚡" }, salary: { bg: "#f3e8ff", color: "#6b21a8", icon: "💵" }, maintenance: { bg: "#fef3c7", color: "#92400e", icon: "🔧" }, stationery: { bg: "#d1fae5", color: "#065f46", icon: "✏️" }, other: { bg: "#f3f4f6", color: "#374151", icon: "📦" } };
// const emptyForm = { title: "", category: "", amount: "", date: new Date().toISOString().split("T")[0], note: "" };

// export default function ExpensesPage() {
//   const [expenses, setExpenses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState(emptyForm);
//   const [saving, setSaving] = useState(false);
//   const [filterCat, setFilterCat] = useState("all");

//   const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;

//   useEffect(() => { fetchExpenses(); }, []);

//   const fetchExpenses = async () => {
//     try {
//       const res = await getAllExpenses(user?.schoolId);
//       if (res.data.success) setExpenses(res.data.expenses);
//     } catch (err) { console.log(err.message); }
//     finally { setLoading(false); }
//   };

//   const handleSave = async () => {
//     if (!formData.title || !formData.amount || !formData.category) { alert("Title, Category aur Amount zaroor bharo"); return; }
//     setSaving(true);
//     try {
//       const res = await addExpense({ ...formData, schoolId: user?.schoolId, addedBy: user?._id });
//       if (res.data.success) { fetchExpenses(); setShowModal(false); setFormData(emptyForm); }
//       else alert(res.data.message || "Error aaya");
//     } catch (err) { alert("Server error"); }
//     finally { setSaving(false); }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete karna chahte ho?")) return;
//     const res = await deleteExpense(id);
//     if (res.data.success) fetchExpenses();
//   };

//   const filtered = filterCat === "all" ? expenses : expenses.filter(e => e.category === filterCat);
//   const totalAmount = filtered.reduce((s, e) => s + Number(e.amount), 0);
//   const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box" };

//   return (
//     <div>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
//         <div>
//           <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Expenses</h1>
//           <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Total: Rs. {totalAmount.toLocaleString()}</p>
//         </div>
//         <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", borderRadius: "8px", background: "#f59f00", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
//           + Add Expense
//         </button>
//       </div>

//       {/* Category Summary */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" }}>
//         {categories.map(cat => {
//           const total = expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0);
//           const c = categoryColors[cat];
//           return (
//             <div key={cat} onClick={() => setFilterCat(filterCat === cat ? "all" : cat)} style={{
//               background: filterCat === cat ? c.bg : "#fff", borderRadius: "10px", padding: "14px",
//               border: filterCat === cat ? `2px solid ${c.color}` : "1px solid #f0f0f0",
//               cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
//             }}>
//               <div style={{ fontSize: "20px", marginBottom: "6px" }}>{c.icon}</div>
//               <div style={{ fontSize: "12px", color: "#6b7280", textTransform: "capitalize", marginBottom: "4px" }}>{cat}</div>
//               <div style={{ fontSize: "14px", fontWeight: "600", color: c.color }}>Rs. {total.toLocaleString()}</div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Table */}
//       <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", overflowX: "auto" }}>
//         <table style={{ width: "100%", borderCollapse: "collapse" }}>
//           <thead>
//             <tr style={{ background: "#f9fafb" }}>
//               {["Title", "Category", "Amount", "Date", "Note", ""].map(h => (
//                 <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Loading...</td></tr>
//               : filtered.length === 0 ? <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Koi expense nahi mili</td></tr>
//                 : filtered.map(e => {
//                   const c = categoryColors[e.category];
//                   return (
//                     <tr key={e._id} style={{ borderTop: "1px solid #f0f0f0" }}>
//                       <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{e.title}</td>
//                       <td style={{ padding: "12px 20px" }}>
//                         <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: c.bg, color: c.color, textTransform: "capitalize" }}>
//                           {c.icon} {e.category}
//                         </span>
//                       </td>
//                       <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: "600", color: "#e64980" }}>Rs. {Number(e.amount).toLocaleString()}</td>
//                       <td style={{ padding: "12px 20px", fontSize: "14px", color: "#6b7280" }}>{new Date(e.date).toLocaleDateString("en-PK")}</td>
//                       <td style={{ padding: "12px 20px", fontSize: "13px", color: "#9ca3af" }}>{e.note || "-"}</td>
//                       <td style={{ padding: "12px 20px" }}>
//                         <button onClick={() => handleDelete(e._id)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #fee2e2", background: "#fff", cursor: "pointer", fontSize: "12px", color: "#dc2626" }}>🗑️</button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//           </tbody>
//         </table>
//       </div>

//       {showModal && (
//         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
//           <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "460px" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
//               <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Expense Add Karo</h2>
//               <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
//             </div>
//             <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
//               {[
//                 { label: "Title *", key: "title", placeholder: "Electricity Bill" },
//                 { label: "Amount *", key: "amount", placeholder: "5000" },
//                 { label: "Date *", key: "date", type: "date" },
//                 { label: "Note", key: "note", placeholder: "Optional detail..." },
//               ].map(f => (
//                 <div key={f.key}>
//                   <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>{f.label}</label>
//                   <input type={f.type || "text"} placeholder={f.placeholder} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} style={inputStyle} />
//                 </div>
//               ))}
//               <div>
//                 <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Category *</label>
//                 <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
//                   <option value="">Select Category</option>
//                   {categories.map(c => <option key={c} value={c}>{categoryColors[c].icon} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
//               <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#f59f00", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
//                 {saving ? "Saving..." : "Add Expense"}
//               </button>
//               <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }