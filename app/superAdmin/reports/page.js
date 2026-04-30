"use client";
import { useEffect, useState } from "react";
import { getReports } from "@/app/services/schoolService.js";

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReport(); }, []);

  const fetchReport = async () => {
    try {
      const res = await getReports();
      if (res.data.success) setReport(res.data.report);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Reports</h1>
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>All schools combined report</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Fees Collected", value: `Rs. ${report?.totalFees?.toLocaleString() || 0}`, icon: "💰", color: "#0ca678" },
          { label: "Total Expenses", value: `Rs. ${report?.totalExpenses?.toLocaleString() || 0}`, icon: "📉", color: "#e64980" },
          { label: "Net Balance", value: `Rs. ${((report?.totalFees || 0) - (report?.totalExpenses || 0)).toLocaleString()}`, icon: "📈", color: "#3b5bdb" },
        ].map((card) => (
          <div key={card.label} style={{
            background: "#fff", borderRadius: "12px", padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0",
          }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{card.icon}</div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: card.color }}>{card.value}</div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Per School Report Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>School-wise Report</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["School", "Students", "Teachers", "Fees Collected", "Expenses", "Balance"].map((h) => (
                  <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report?.schools?.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Koi data nahi</td>
                </tr>
              ) : (
                report?.schools?.map((s) => (
                  <tr key={s._id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "14px 24px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{s.name}</td>
                    <td style={{ padding: "14px 24px", fontSize: "14px", color: "#6b7280" }}>{s.students}</td>
                    <td style={{ padding: "14px 24px", fontSize: "14px", color: "#6b7280" }}>{s.teachers}</td>
                    <td style={{ padding: "14px 24px", fontSize: "14px", color: "#0ca678" }}>Rs. {s.fees?.toLocaleString()}</td>
                    <td style={{ padding: "14px 24px", fontSize: "14px", color: "#e64980" }}>Rs. {s.expenses?.toLocaleString()}</td>
                    <td style={{ padding: "14px 24px", fontSize: "14px", fontWeight: "600", color: "#3b5bdb" }}>
                      Rs. {(s.fees - s.expenses)?.toLocaleString()}
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