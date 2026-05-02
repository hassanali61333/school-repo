// "use client";
// import { useEffect, useState } from "react";
// import { getDashboard, getDefaulters } from "@/app/services/schoolService.js";

// export default function AccountantDashboard() {
//   const [stats, setStats] = useState({ feesCollected: 0, feesPending: 0, totalExpenses: 0, netBalance: 0 });
//   const [defaulters, setDefaulters] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const schoolId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.schoolId : null;

//   useEffect(() => { fetchData(); }, []);

//   const fetchData = async () => {
//     try {
//       const [dashRes, defRes] = await Promise.all([
//         getDashboard(),
//         getDefaulters(schoolId),
//       ]);
//       if (dashRes.data.success) setStats(dashRes.data.stats);
//       if (defRes.data.success) setDefaulters(defRes.data.defaulters);
//     } catch (err) { console.log(err.message); }
//     finally { setLoading(false); }
//   };

//   const cards = [
//     { label: "Fees Collected", value: `Rs. ${stats.feesCollected?.toLocaleString()}`, icon: "💰", color: "#0ca678", bg: "#d1fae5" },
//     { label: "Fees Pending", value: `Rs. ${stats.feesPending?.toLocaleString()}`, icon: "⏳", color: "#e64980", bg: "#fee2e2" },
//     { label: "Total Expenses", value: `Rs. ${stats.totalExpenses?.toLocaleString()}`, icon: "📉", color: "#f59f00", bg: "#fef3c7" },
//     { label: "Net Balance", value: `Rs. ${stats.netBalance?.toLocaleString()}`, icon: "📈", color: "#3b5bdb", bg: "#eff6ff" },
//   ];

//   if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>Loading...</div>;

//   return (
//     <div>
//       <div style={{ marginBottom: "24px" }}>
//         <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Dashboard</h1>
//         <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Finance overview</p>
//       </div>

//       {/* Stat Cards */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
//         {cards.map(card => (
//           <div key={card.label} style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
//             <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "12px" }}>
//               {card.icon}
//             </div>
//             <div style={{ fontSize: "22px", fontWeight: "700", color: card.color }}>{card.value}</div>
//             <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{card.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* Defaulters Table */}
//       <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
//         <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>⚠️ Fee Defaulters</h2>
//           <span style={{ fontSize: "13px", color: "#e64980", fontWeight: "500" }}>{defaulters.length} students</span>
//         </div>
//         <div style={{ overflowX: "auto" }}>
//           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//             <thead>
//               <tr style={{ background: "#f9fafb" }}>
//                 {["Student", "Class", "Phone", "Pending Months", "Amount Due"].map(h => (
//                   <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {defaulters.length === 0 ? (
//                 <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Koi defaulter nahi — sab ne fees di hai ✅</td></tr>
//               ) : defaulters.map(d => (
//                 <tr key={d._id} style={{ borderTop: "1px solid #f0f0f0" }}>
//                   <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{d.name}</td>
//                   <td style={{ padding: "12px 20px", fontSize: "14px", color: "#6b7280" }}>{d.class}</td>
//                   <td style={{ padding: "12px 20px", fontSize: "14px", color: "#6b7280" }}>{d.phone}</td>
//                   <td style={{ padding: "12px 20px" }}>
//                     <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: "#fef3c7", color: "#92400e" }}>{d.pendingMonths} months</span>
//                   </td>
//                   <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: "600", color: "#e64980" }}>Rs. {d.amountDue?.toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }