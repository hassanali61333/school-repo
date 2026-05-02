// "use client";
// import { useEffect, useState } from "react";
// import { getAllFees, addFees, updateFees, getAllStudents } from "@/app/services/schoolService.js";

// const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// const emptyForm = { studentId: "", month: "", year: new Date().getFullYear(), amount: "", lateFine: "0", discount: "0", paymentMethod: "cash", note: "" };

// export default function FeesPage() {
//   const [fees, setFees] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState(emptyForm);
//   const [saving, setSaving] = useState(false);
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterMonth, setFilterMonth] = useState("");

//   const schoolId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.schoolId : null;

//   useEffect(() => { fetchData(); }, []);

//   const fetchData = async () => {
//     try {
//       const [feesRes, studRes] = await Promise.all([getAllFees(schoolId), getAllStudents(schoolId)]);
//       if (feesRes.data.success) setFees(feesRes.data.fees);
//       if (studRes.data.success) setStudents(studRes.data.students);
//     } catch (err) { console.log(err.message); }
//     finally { setLoading(false); }
//   };

//   const handleSave = async () => {
//     if (!formData.studentId || !formData.month || !formData.amount) { alert("Student, Month aur Amount zaroor bharo"); return; }
//     setSaving(true);
//     try {
//       const total = Number(formData.amount) + Number(formData.lateFine) - Number(formData.discount);
//       const challanNumber = `CH-${Date.now()}`;
//       const res = await addFees({ ...formData, schoolId, totalAmount: total, challanNumber, status: "paid", paidDate: new Date() });
//       if (res.data.success) { fetchData(); setShowModal(false); setFormData(emptyForm); }
//       else alert(res.data.message || "Error aaya");
//     } catch (err) { alert("Server error"); }
//     finally { setSaving(false); }
//   };

//   const handleMarkPaid = async (id) => {
//     try {
//       const res = await updateFees(id, { status: "paid", paidDate: new Date() });
//       if (res.data.success) fetchData();
//     } catch (err) { alert("Error"); }
//   };

//   const printChallan = (fee) => {
//     const student = students.find(s => s._id === fee.studentId);
//     const win = window.open("", "_blank");
//     win.document.write(`
//       <html><head><title>Fee Challan</title>
//       <style>body{font-family:Arial;padding:20px;max-width:400px;margin:0 auto} h2{text-align:center} table{width:100%;border-collapse:collapse} td{padding:8px;border:1px solid #ddd} .total{font-weight:bold;font-size:18px}</style>
//       </head><body>
//       <h2>🎓 Fee Challan</h2>
//       <p><b>Challan #:</b> ${fee.challanNumber}</p>
//       <p><b>Date:</b> ${new Date(fee.paidDate || fee.createdAt).toLocaleDateString()}</p>
//       <hr/>
//       <table>
//         <tr><td>Student</td><td>${student?.name || fee.studentId}</td></tr>
//         <tr><td>Class</td><td>${student?.class || "-"}</td></tr>
//         <tr><td>Month</td><td>${fee.month} ${fee.year}</td></tr>
//         <tr><td>Fee Amount</td><td>Rs. ${fee.amount}</td></tr>
//         <tr><td>Late Fine</td><td>Rs. ${fee.lateFine || 0}</td></tr>
//         <tr><td>Discount</td><td>Rs. ${fee.discount || 0}</td></tr>
//         <tr><td class="total">Total</td><td class="total">Rs. ${fee.totalAmount}</td></tr>
//       </table>
//       <p style="text-align:center;margin-top:20px">Status: <b style="color:green">PAID ✅</b></p>
//       <script>window.print()</script>
//       </body></html>
//     `);
//   };

//   const filtered = fees.filter(f => {
//     if (filterStatus !== "all" && f.status !== filterStatus) return false;
//     if (filterMonth && f.month !== filterMonth) return false;
//     return true;
//   });

//   const totalCollected = fees.filter(f => f.status === "paid").reduce((s, f) => s + f.totalAmount, 0);
//   const totalPending = fees.filter(f => f.status === "unpaid").reduce((s, f) => s + f.totalAmount, 0);

//   const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box" };

//   return (
//     <div>
//       {/* Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
//         <div>
//           <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Fees Collection</h1>
//           <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Total: {fees.length} records</p>
//         </div>
//         <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", borderRadius: "8px", background: "#f59f00", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
//           + Collect Fee
//         </button>
//       </div>

//       {/* Summary */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
//         <div style={{ background: "#d1fae5", borderRadius: "12px", padding: "16px 20px" }}>
//           <div style={{ fontSize: "13px", color: "#065f46", marginBottom: "4px" }}>Total Collected</div>
//           <div style={{ fontSize: "24px", fontWeight: "700", color: "#065f46" }}>Rs. {totalCollected.toLocaleString()}</div>
//         </div>
//         <div style={{ background: "#fee2e2", borderRadius: "12px", padding: "16px 20px" }}>
//           <div style={{ fontSize: "13px", color: "#991b1b", marginBottom: "4px" }}>Total Pending</div>
//           <div style={{ fontSize: "24px", fontWeight: "700", color: "#991b1b" }}>Rs. {totalPending.toLocaleString()}</div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
//         {["all", "paid", "unpaid"].map(s => (
//           <button key={s} onClick={() => setFilterStatus(s)} style={{
//             padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "500",
//             background: filterStatus === s ? "#f59f00" : "#fff",
//             color: filterStatus === s ? "#fff" : "#6b7280",
//             boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
//           }}>
//             {s.charAt(0).toUpperCase() + s.slice(1)}
//           </button>
//         ))}
//         <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
//           style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", background: "#fff", cursor: "pointer" }}>
//           <option value="">All Months</option>
//           {months.map(m => <option key={m} value={m}>{m}</option>)}
//         </select>
//       </div>

//       {/* Table */}
//       <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", overflowX: "auto" }}>
//         <table style={{ width: "100%", borderCollapse: "collapse" }}>
//           <thead>
//             <tr style={{ background: "#f9fafb" }}>
//               {["Challan #", "Student", "Month", "Amount", "Fine", "Total", "Status", "Actions"].map(h => (
//                 <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Loading...</td></tr>
//               : filtered.length === 0 ? <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Koi record nahi mila</td></tr>
//                 : filtered.map(f => {
//                   const student = students.find(s => s._id === f.studentId);
//                   return (
//                     <tr key={f._id} style={{ borderTop: "1px solid #f0f0f0" }}>
//                       <td style={{ padding: "12px 16px", fontSize: "12px", color: "#9ca3af" }}>{f.challanNumber}</td>
//                       <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{student?.name || "-"}</td>
//                       <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{f.month} {f.year}</td>
//                       <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>Rs. {f.amount}</td>
//                       <td style={{ padding: "12px 16px", fontSize: "14px", color: "#e64980" }}>Rs. {f.lateFine || 0}</td>
//                       <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#111827" }}>Rs. {f.totalAmount}</td>
//                       <td style={{ padding: "12px 16px" }}>
//                         <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: f.status === "paid" ? "#d1fae5" : "#fee2e2", color: f.status === "paid" ? "#065f46" : "#991b1b" }}>
//                           {f.status}
//                         </span>
//                       </td>
//                       <td style={{ padding: "12px 16px" }}>
//                         <div style={{ display: "flex", gap: "6px" }}>
//                           {f.status === "unpaid" && (
//                             <button onClick={() => handleMarkPaid(f._id)} style={{ padding: "5px 10px", borderRadius: "6px", border: "none", background: "#d1fae5", color: "#065f46", cursor: "pointer", fontSize: "12px" }}>✅ Paid</button>
//                           )}
//                           <button onClick={() => printChallan(f)} style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "12px" }}>🖨️</button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
//           <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "480px", maxHeight: "90vh", overflowY: "auto" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
//               <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Fee Collect Karo</h2>
//               <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
//             </div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
//               <div style={{ gridColumn: "1/-1" }}>
//                 <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Student *</label>
//                 <select value={formData.studentId} onChange={e => {
//                   const s = students.find(s => s._id === e.target.value);
//                   setFormData({ ...formData, studentId: e.target.value, amount: s?.monthlyFee || "" });
//                 }} style={inputStyle}>
//                   <option value="">Student select karo</option>
//                   {students.map(s => <option key={s._id} value={s._id}>{s.name} — Class {s.class}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Month *</label>
//                 <select value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })} style={inputStyle}>
//                   <option value="">Select Month</option>
//                   {months.map(m => <option key={m} value={m}>{m}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Year *</label>
//                 <input type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} style={inputStyle} />
//               </div>
//               {[
//                 { label: "Fee Amount *", key: "amount", placeholder: "2000" },
//                 { label: "Late Fine", key: "lateFine", placeholder: "0" },
//                 { label: "Discount", key: "discount", placeholder: "0" },
//               ].map(f => (
//                 <div key={f.key}>
//                   <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>{f.label}</label>
//                   <input type="number" placeholder={f.placeholder} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} style={inputStyle} />
//                 </div>
//               ))}
//               <div>
//                 <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Payment Method</label>
//                 <select value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} style={inputStyle}>
//                   <option value="cash">Cash</option>
//                   <option value="bank">Bank</option>
//                 </select>
//               </div>
//               <div style={{ gridColumn: "1/-1" }}>
//                 <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
//                   <span style={{ fontSize: "14px", color: "#374151" }}>Total Amount</span>
//                   <span style={{ fontSize: "16px", fontWeight: "700", color: "#0ca678" }}>
//                     Rs. {(Number(formData.amount || 0) + Number(formData.lateFine || 0) - Number(formData.discount || 0)).toLocaleString()}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
//               <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#f59f00", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
//                 {saving ? "Saving..." : "💰 Collect Fee"}
//               </button>
//               <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }