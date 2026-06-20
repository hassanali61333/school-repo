export default function SchoolHeadReportsPlaceholder() {
  return (
 <div className="p-6">
  <h1 className="text-2xl font-bold mb-6">
    Monthly Attendance Reports
  </h1>

  {/* Filters */}
  <div className="flex gap-4 mb-6">
    <select className="border rounded-lg px-4 py-2">
      <option>July 2026</option>
      <option>June 2026</option>
      <option>May 2026</option>
    </select>

    <select className="border rounded-lg px-4 py-2">
      <option>All Classes</option>
      <option>Nursery</option>
      <option>1</option>
      <option>2</option>
      <option>10</option>
      <option>11</option>
      <option>12</option>
    </select>
  </div>

  {/* Reports */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

    <div className="border rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-lg">Nursery - A</h3>
      <p>Students: 25</p>
      <p>Working Days: 10</p>
      <p>Attendance: 95%</p>
      <button className="mt-3 bg-blue-600 text-white px-3 py-2 rounded">
        View Report
      </button>
    </div>

    <div className="border rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-lg">Class 1 - B</h3>
      <p>Students: 30</p>
      <p>Working Days: 10</p>
      <p>Attendance: 91%</p>
      <button className="mt-3 bg-blue-600 text-white px-3 py-2 rounded">
        View Report
      </button>
    </div>

    <div className="border rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-lg">Class 10 - A</h3>
      <p>Students: 35</p>
      <p>Working Days: 10</p>
      <p>Attendance: 89%</p>
      <button className="mt-3 bg-blue-600 text-white px-3 py-2 rounded">
        View Report
      </button>
    </div>

    <div className="border rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-lg">Class 10 - B</h3>
      <p>Students: 32</p>
      <p>Working Days: 10</p>
      <p>Attendance: 93%</p>
      <button className="mt-3 bg-blue-600 text-white px-3 py-2 rounded">
        View Report
      </button>
    </div>

  </div>
</div>
  );
}
