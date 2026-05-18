"use client";
import { useState, useEffect } from "react";
import { getStudents, updateStudent, deleteStudent, createAdmission } from "@/app/services/schoolService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const emptyForm = {
  firstName: "", 
  lastName: "", 
  parentPhone: "", 
  rollNo: "",
  className: "", 
  section: "", 
  gender: "", 
  address: "", 
  email: "",
  parentName: "",
  parentEmail: "",
  dob: "",
  group: "",
  fee: {
    tuition: "",
    monthly: "",
    admissionOneTime: "",
    registration: "",
    security: ""
  }
};

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get schoolId and adminId from localStorage
  const getSchoolId = () => {
    return localStorage.getItem("schoolId") || "school-1778500439765";
  };

  const getAdminId = () => {
    return localStorage.getItem("adminId") || "admin-1778500288036";
  };

  const getHeadId = () => {
    return localStorage.getItem("headId") || "head-1778500679953";
  };

  const getTeacherId = () => {
    return localStorage.getItem("teacherId") || "teacher-1778661829355";
  };

  // ➤ FETCH STUDENTS
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const schoolId = getSchoolId();
      const response = await getStudents(schoolId);
      
      if (response.data.success) {
        setStudents(response.data.students);
      } else {
        setError(response.data.message || "Failed to fetch students");
        toast.error(response.data.message || "Failed to fetch students");
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      const errorMsg = err.response?.data?.message || "Network error. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ➤ ADD / UPDATE STUDENT
  const handleSave = async () => {
    if (!formData.firstName || !formData.parentPhone || !formData.rollNo || !formData.className) {
      toast.warning("First Name, Phone, Roll No aur Class zaroor bharo");
      return;
    }

    setSaving(true);
    
    try {
      const schoolId = getSchoolId();
      const adminId = getAdminId();
      const headId = getHeadId();
      const teacherId = getTeacherId();
      
      if (editStudent) {
        // UPDATE - Make sure to include studentId and schoolId
        const updatePayload = {
          studentId: editStudent.id,
          schoolId: schoolId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          rollNo: formData.rollNo,
          gender: formData.gender,
          dob: formData.dob,
          studentEmail: formData.email,
          parentName: formData.parentName,
          parentPhone: formData.parentPhone,
          parentEmail: formData.parentEmail,
          parentAddress: formData.address,
          selectedClass: formData.className,
          className: formData.className,
          selectedSection: formData.section,
          group: formData.group,
          selectedSubjects: ["Physics", "Mathematics"],
          tuitionFee: formData.fee.tuition || "0",
          monthlyFee: formData.fee.monthly || "0",
          admissionFee: formData.fee.admissionOneTime || "0",
          registrationFee: formData.fee.registration || "0",
          securityFee: formData.fee.security || "0",
          annualFee: "0",
          otherFeeLabel: "",
          otherFeeAmount: "0",
          dueDay: "10",
          autoReminder: true,
          reminderDaysBefore: "3",
          notifyVia: "SMS"
        };
        
        const response = await updateStudent(updatePayload);
        
        if (response.data.success) {
          toast.success(response.data.message || "Student updated successfully!");
          await fetchStudents();
          setShowModal(false);
          setFormData(emptyForm);
          setEditStudent(null);
        } else {
          throw new Error(response.data.message);
        }
      } else {
        // CREATE - New student
        const createPayload = {
          adminId,
          headId,
          schoolId,
          schoolName: localStorage.getItem("schoolName") || "School Name",
          teacherId,
          teacherName: localStorage.getItem("teacherName") || "Teacher Name",
          firstName: formData.firstName,
          lastName: formData.lastName,
          rollNo: formData.rollNo,
          gender: formData.gender,
          dob: formData.dob,
          studentEmail: formData.email,
          studentPassword: "password123",
          parentName: formData.parentName,
          parentPhone: formData.parentPhone,
          parentEmail: formData.parentEmail,
          parentPassword: "password123",
          parentAddress: formData.address,
          selectedClass: formData.className,
          className: formData.className,
          group: formData.group,
          selectedSection: formData.section,
          selectedSubjects: ["Physics", "Mathematics"],
          tuitionFee: formData.fee.tuition || "0",
          monthlyFee: formData.fee.monthly || "0",
          admissionFee: formData.fee.admissionOneTime || "0",
          registrationFee: formData.fee.registration || "0",
          securityFee: formData.fee.security || "0",
          dueDay: "10",
          autoReminder: true,
          reminderDaysBefore: "3",
          notifyVia: "SMS"
        };
        
        const response = await createAdmission(createPayload);
        
        if (response.data.success) {
          toast.success(response.data.message || "Student added successfully!");
          await fetchStudents();
          setShowModal(false);
          setFormData(emptyForm);
        } else {
          throw new Error(response.data.message);
        }
      }
    } catch (err) {
      console.error("Error saving student:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to save student";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // ➤ DELETE STUDENT
  const handleDelete = async (id, studentName) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This will also delete all related data.`)) return;
    
    try {
      const response = await deleteStudent(id);
      
      if (response.data.success) {
        toast.success(response.data.message || "Student deleted successfully!");
        await fetchStudents();
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error("Error deleting student:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete student";
      toast.error(errorMessage);
    }
  };

  const openAdd = () => {
    setEditStudent(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditStudent(s);
    setFormData({
      firstName: s.firstName || "",
      lastName: s.lastName || "",
      parentPhone: s.parentPhone || "",
      rollNo: s.rollNo || "",
      className: s.className || "",
      section: s.section || "",
      gender: s.gender || "",
      address: s.address || "",
      email: s.email || "",
      parentName: s.parentName || "",
      parentEmail: s.parentEmail || "",
      dob: s.dob || "",
      group: s.group || "",
      fee: s.fee || {
        tuition: "",
        monthly: "",
        admissionOneTime: "",
        registration: "",
        security: ""
      }
    });
    setShowModal(true);
  };

  const filtered = students.filter(s =>
    (s.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNo || "").includes(search) ||
    (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="max-w-[calc(100vw-260px)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-sm text-gray-500 mt-1">Total: {students.length}</p>
          </div>
          <button 
            onClick={openAdd} 
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
          >
            + Add Student
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, roll no or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all mb-5"
        />

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Table - Responsive */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Roll No", "Full Name", "Parent Name", "Class", "Phone", "Email", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">{s.rollNo}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.fullName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.parentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.className} {s.section}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.parentPhone}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          s.status === "active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {s.status || "active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEdit(s)} 
                            className="px-3 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-sm transition-colors"
                            title="Edit Student"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(s.id, s.fullName)} 
                            className="px-3 py-1.5 rounded-md border border-red-200 bg-white hover:bg-red-50 text-sm text-red-600 transition-colors"
                            title="Delete Student"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL - Responsive for sidebar */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ marginLeft: 0 }}>
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-7">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editStudent ? "Edit Student" : "Add New Student"}
                  </h2>
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name *
                    </label>
                    <input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name
                    </label>
                    <input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Roll No *
                    </label>
                    <input
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Class *
                    </label>
                    <input
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Section
                    </label>
                    <input
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Group
                    </label>
                    <select
                      value={formData.group}
                      onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    >
                      <option value="">Select Group</option>
                      <option value="Science">Science</option>
                      <option value="Arts">Arts</option>
                      <option value="Commerce">Commerce</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone *
                    </label>
                    <input
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Parent Name
                    </label>
                    <input
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Parent Email
                    </label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>

                  {/* Fee Section */}
                  <div className="sm:col-span-2">
                    <h3 className="text-md font-semibold text-gray-800 mb-3 mt-2">Fee Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Tuition Fee
                        </label>
                        <input
                          type="number"
                          value={formData.fee.tuition}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            fee: { ...formData.fee, tuition: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Monthly Fee
                        </label>
                        <input
                          type="number"
                          value={formData.fee.monthly}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            fee: { ...formData.fee, monthly: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Admission Fee
                        </label>
                        <input
                          type="number"
                          value={formData.fee.admissionOneTime}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            fee: { ...formData.fee, admissionOneTime: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Registration Fee
                        </label>
                        <input
                          type="number"
                          value={formData.fee.registration}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            fee: { ...formData.fee, registration: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Security Fee
                        </label>
                        <input
                          type="number"
                          value={formData.fee.security}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            fee: { ...formData.fee, security: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {saving ? "Saving..." : editStudent ? "Update Student" : "Add Student"}
                  </button>
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}