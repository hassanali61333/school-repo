"use client";
import { useState } from "react";

const classes = [
  { label: "Nursery — A", students: 25, workingDays: 22, attendance: 95, pass: 90, distinctions: 18, fail: 10 },
  { label: "KG — A",      students: 28, workingDays: 22, attendance: 88, pass: 85, distinctions: 15, fail: 15 },
  { label: "Class 1 — B", students: 30, workingDays: 22, attendance: 91, pass: 87, distinctions: 22, fail: 13 },
  { label: "Class 5 — A", students: 32, workingDays: 22, attendance: 74, pass: 70, distinctions: 10, fail: 30 },
  { label: "Class 10 — A",students: 35, workingDays: 22, attendance: 89, pass: 83, distinctions: 20, fail: 17 },
  { label: "Class 12 — B",students: 33, workingDays: 22, attendance: 93, pass: 91, distinctions: 28, fail: 9  },
];

function getBadge(pct) {
  if (pct >= 90) return "bg-green-100 text-green-800";
  if (pct >= 80) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

function getBarColor(pct) {
  if (pct >= 90) return "bg-green-500";
  if (pct >= 80) return "bg-yellow-500";
  return "bg-red-500";
}

export default function SchoolHeadReports() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium mb-5">Monthly attendance reports</h1>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-5">
        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>June 2026</option>
          <option>May 2026</option>
          <option>April 2026</option>
        </select>
        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>All classes</option>
          <option>KG</option>
          <option>Nursery</option>
          <option>Class 1</option>
          <option>Class 5</option>
          <option>Class 10</option>
          <option>Class 12</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div key={cls.label} className="border rounded-xl p-4 bg-white shadow-sm">
            <p className="font-medium text-sm mb-1">{cls.label}</p>
            <p className="text-xs text-gray-500 mb-3">
              {cls.students} students · {cls.workingDays} days
            </p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${getBarColor(cls.attendance)}`}
                  style={{ width: `${cls.attendance}%` }}
                />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${getBadge(cls.attendance)}`}>
                {cls.attendance}%
              </span>
            </div>
            <button
              onClick={() => setSelected(cls)}
              className="w-full border rounded-lg py-1.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 transition"
            >
              View report
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl border w-80 max-w-full p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <p className="font-medium text-sm">{selected.label}</p>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Attendance</p>
            {[
              ["Total students", selected.students],
              ["Working days", selected.workingDays],
              ["Present avg", `${Math.round(selected.workingDays * selected.attendance / 100)} days`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium">{val}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm py-1.5 mb-4">
              <span className="text-gray-500">Overall</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${getBarColor(selected.attendance)}`}
                    style={{ width: `${selected.attendance}%` }}
                  />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${getBadge(selected.attendance)}`}>
                  {selected.attendance}%
                </span>
              </div>
            </div>

            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Result summary</p>
            {[
              ["Pass rate",     selected.pass,         getBadge(selected.pass)],
              ["Distinctions",  selected.distinctions,  "bg-yellow-100 text-yellow-800"],
              ["Fail",          selected.fail,          getBadge(100 - selected.fail)],
            ].map(([label, val, badge]) => (
              <div key={label} className="flex justify-between items-center text-sm py-1.5 border-b last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${badge}`}>{val}%</span>
              </div>
            ))}

            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Students passed</p>
              <p className="font-medium">
                {Math.round(selected.students * selected.pass / 100)}{" "}
                <span className="text-xs text-gray-500">/ {selected.students}</span>
              </p>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full border rounded-lg py-1.5 text-sm hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}