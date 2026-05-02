// "use client";
// import { useEffect, useState } from "react";
// import { getDashboard } from "@/app/services/schoolService.js";

// export default function SchoolHeadDashboard() {
//   const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, totalStaff: 0, feesCollected: 0 });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { fetchDashboard(); }, []);

//   const fetchDashboard = async () => {
//     try {
//       const res = await getDashboard();
//       if (res.data.success) setStats(res.data.stats);
//     } catch (err) {
//       console.log(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const cards = [
//     { label: "Total Students", value: stats.totalStudents, icon: "👨‍🎓", color: "#3b5bdb" },
//     { label: "Total Teachers", value: stats.totalTeachers, icon: "👨‍🏫", color: "#0ca678" },
//     { label: "Total Staff", value: stats.totalStaff, icon: "👷", color: "#f59f00" },
//     { label: "Fees Collected", value: `Rs. ${stats.feesCollected?.toLocaleString()}`, icon: "💰", color: "#e64980" },
//   ];

//   if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>Loading...</div>;

//   return (
//     <div>
//       <div style={{ marginBottom: "24px" }}>
//         <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Dashboard</h1>
//         <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>School overview</p>
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
//         {cards.map((card) => (
//           <div key={card.label} style={{
//             background: "#fff", borderRadius: "12px", padding: "20px",
//             boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0",
//           }}>
//             <div style={{ fontSize: "28px", marginBottom: "12px" }}>{card.icon}</div>
//             <div style={{ fontSize: "26px", fontWeight: "700", color: card.color }}>{card.value}</div>
//             <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{card.label}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }