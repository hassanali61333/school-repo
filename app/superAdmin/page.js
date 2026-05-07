"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { addSchool } from "../services/schoolService";
import { useSelector } from "react-redux";
import { getAllSchools } from "../services/schoolService";
const statCards = [
  { label: "Total Schools", key: "totalSchools", icon: "🏫", color: "#3b5bdb" },
  { label: "Total Students", key: "totalStudents", icon: "👨‍🎓", color: "#0ca678" },
  { label: "Total Teachers", key: "totalTeachers", icon: "👨‍🏫", color: "#f59f00" },
  { label: "Fees Collected", key: "feesCollected", icon: "💰", color: "#e64980" },
];

export default function SuperAdminDashboard() {

  const [totalSchools,settotalSchools] = useState(0);
  const [totalStudents, settotalStudents] = useState(0);
  const [totalTeachers, settotalTeachers] = useState(0);
  const [feesCollected, setfeesCollected] = useState(0);

  const [school, setSchool] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false); // ← added

console.log("hassan")

  useEffect(()=>{
          fetchschool()
  },[])

  const fetchschool = async()=>{
    setLoadingSchools(true); // ← added
    try{
      const resposese= await getAllSchools()
      setSchool(resposese.data.data)
      settotalSchools(resposese.data.data.length)
      console.log("all school",resposese.data.data.length)
    }
    catch(err) {
      alert("error check console")
      console.log(err.message)
    } finally {
      setLoadingSchools(false); // ← added
    }
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

  {/* Total Schools */}
  <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
      <span style={{ fontSize: "24px" }}>🏫</span>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b5bdb" }} />
    </div>
    <div style={{ fontSize: "28px", fontWeight: "700" }}>
      {totalSchools}
    </div>
    <div style={{ fontSize: "13px", color: "#6b7280" }}>Total Schools</div>
  </div>

  {/* Total Students */}
  <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
      <span style={{ fontSize: "24px" }}>👨‍🎓</span>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0ca678" }} />
    </div>
    <div style={{ fontSize: "28px", fontWeight: "700" }}>
      {totalStudents}
    </div>
    <div style={{ fontSize: "13px", color: "#6b7280" }}>Total Students</div>
  </div>

  {/* Total Teachers */}
  <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
      <span style={{ fontSize: "24px" }}>👨‍🏫</span>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59f00" }} />
    </div>
    <div style={{ fontSize: "28px", fontWeight: "700" }}>
      {totalTeachers}
    </div>
    <div style={{ fontSize: "13px", color: "#6b7280" }}>Total Teachers</div>
  </div>

  {/* Fees Collected */}
  <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
      <span style={{ fontSize: "24px" }}>💰</span>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e64980" }} />
    </div>
    <div style={{ fontSize: "28px", fontWeight: "700" }}>
      Rs. {feesCollected.toLocaleString()}
    </div>
    <div style={{ fontSize: "13px", color: "#6b7280" }}>Fees Collected</div>
  </div>

</div>

      {/* Schools Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>All Schools</h2>
        </div>

{
<div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
  
  {/* Header */}
  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
    <h2 className="text-lg font-semibold text-gray-800">All Schools</h2>
  </div>

  <table className="min-w-full text-sm text-left">
    
    {/* THEAD */}
    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
      <tr>
        <th className="px-6 py-3">School Name</th>
        <th className="px-6 py-3">Address</th>
        <th className="px-6 py-3">Year</th>
        <th className="px-6 py-3">Type</th>
        <th className="px-6 py-3">Status</th>
      </tr>
    </thead>

    {/* TBODY */}
    <tbody className="divide-y divide-gray-100">
      {/* ── Loader row ── */}
      {loadingSchools ? (
        <tr>
          <td colSpan={5} className="py-12 text-center">
            <div className="flex items-center justify-center gap-3 text-gray-400">
              <svg className="animate-spin h-5 w-5 text-[#3b5bdb]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span className="text-sm">Loading schools…</span>
            </div>
          </td>
        </tr>
      ) : school.length === 0 ? (
        <tr>
          <td colSpan={5} className="text-center py-10 text-gray-400">
            No schools added yet
          </td>
        </tr>
      ) : (
        school.map((item) => (
          <tr key={item.schoolId} className="hover:bg-gray-50 transition">
            
            {/* Name */}
            <td className="px-6 py-4 font-medium text-gray-800">
              {item.schoolName}
            </td>

            {/* Address */}
            <td className="px-6 py-4 text-gray-600">
              {item.address}
            </td>

            {/* Year */}
            <td className="px-6 py-4 text-gray-600">
              {item.establishedYear}
            </td>

            {/* Type */}
            <td className="px-6 py-4 text-gray-600 capitalize">
              {item.schoolType}
            </td>

            {/* Status */}
            <td className="px-6 py-4">
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  item.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            </td>

          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
}
      
      </div>
    </div>
  );
}