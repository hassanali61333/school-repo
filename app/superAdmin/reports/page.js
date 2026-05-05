"use client";
import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [report, setReport] = useState(null);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 m-0">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">All schools combined report</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Fees Collected", value: `Rs. ${report?.totalFees?.toLocaleString() || 0}`, icon: "💰", color: "text-[#0ca678]" },
          { label: "Total Expenses",       value: `Rs. ${report?.totalExpenses?.toLocaleString() || 0}`, icon: "📉", color: "text-[#e64980]" },
          { label: "Net Balance",          value: `Rs. ${((report?.totalFees || 0) - (report?.totalExpenses || 0)).toLocaleString()}`, icon: "📈", color: "text-[#3b5bdb]" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Per School Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 m-0">School-wise Report</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: "600px" }}>
            <thead>
              <tr className="bg-gray-50">
                {["School", "Students", "Teachers", "Fees Collected", "Expenses", "Balance"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!report?.schools || report.schools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    Koi data nahi
                  </td>
                </tr>
              ) : (
                report.schools.map((s) => (
                  <tr key={s._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{s.name}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-500">{s.students}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-500">{s.teachers}</td>
                    <td className="px-6 py-3.5 text-sm text-[#0ca678]">Rs. {s.fees?.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-sm text-[#e64980]">Rs. {s.expenses?.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-[#3b5bdb]">
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