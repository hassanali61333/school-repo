"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { addSchool } from "../services/schoolService";
import { useSelector } from "react-redux";
const statCards = [
  { label: "Total Schools", key: "totalSchools", icon: "🏫", color: "#3b5bdb" },
  { label: "Total Students", key: "totalStudents", icon: "👨‍🎓", color: "#0ca678" },
  { label: "Total Teachers", key: "totalTeachers", icon: "👨‍🏫", color: "#f59f00" },
  { label: "Fees Collected", key: "feesCollected", icon: "💰", color: "#e64980" },
];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    feesCollected: 0,
  });
  const { schools } = useSelector((state) => state.schools);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/superadmin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setSchools(data.schools);
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ fontSize: "16px", color: "#6b7280" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Dashboard</h1>
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Welcome back, Super Admin</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {statCards.map((card) => (
          <div key={card.key} style={{
            background: "#fff", borderRadius: "12px", padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "24px" }}>{card.icon}</span>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: card.color }} />
            </div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#111827" }}>
              {card.key === "feesCollected" ? `Rs. ${stats[card.key]?.toLocaleString()}` : stats[card.key]}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Schools Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>All Schools</h2>
   
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["School Name", "City", "Students", "Teachers", "Head", "Status"].map((h) => (
                  <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schools.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                    No schools added yet
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr key={school._id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "14px 24px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{school.name}</td>
                    <td style={{ padding: "14px 24px", fontSize: "14px", color: "#6b7280" }}>{school.city}</td>
                    <td style={{ padding: "14px 24px", fontSize: "14px", color: "#6b7280" }}>{school.studentCount || 0}</td>
                    <td style={{ padding: "14px 24px", fontSize: "14px", color: "#6b7280" }}>{school.teacherCount || 0}</td>
                    <td style={{ padding: "14px 24px", fontSize: "14px", color: "#6b7280" }}>{school.headName || "Not Assigned"}</td>
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                        background: school.isActive ? "#d1fae5" : "#fee2e2",
                        color: school.isActive ? "#065f46" : "#991b1b",
                      }}>
                        {school.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}