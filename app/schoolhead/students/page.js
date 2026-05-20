"use client";
import { useState, useEffect } from "react";
import { getStudents, updateStudent, deleteStudent, createAdmission } from "@/app/services/schoolService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { setloginuser, setuserId } from "@/app/store/userSlice";

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
  dueDay: "10",
  fee: {
    tuition: "",
    monthly: "500",
    admissionOneTime: "1000",
    registration: "500",
    security: "1000"
  }
};

export default function StudentsPage() {
  const dispatch = useDispatch();
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for user data
  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [adminId, setAdminId] = useState("");
  const [headId, setHeadId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const admin = useSelector((s) => s.users.loginuser);

  // ── Load user data from localStorage and Redux ─────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("loginuser");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        dispatch(setloginuser(userData));
        dispatch(setuserId(userData.id));
        
        // Set all IDs from user data
        setSchoolId(userData.schoolId || "");
        setSchoolName(userData.schoolName || "");
        setAdminId(userData.adminId || "");
        setHeadId(userData.id || userData.headId || "");
        setTeacherId(userData.teacherId || "");
        
        // Also store in localStorage for backup
        if (userData.schoolId) localStorage.setItem("schoolId", userData.schoolId);
        if (userData.adminId) localStorage.setItem("adminId", userData.adminId);
        if (userData.headId) localStorage.setItem("headId", userData.headId);
        if (userData.teacherId) localStorage.setItem("teacherId", userData.teacherId);
        if (userData.schoolName) localStorage.setItem("schoolName", userData.schoolName);
        
        console.log("User data loaded:", {
          schoolId: userData.schoolId,
          adminId: userData.adminId,
          headId: userData.headId,
          teacherId: userData.teacherId
        });
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, [dispatch]);

  // Also update from Redux when it changes
  useEffect(() => {
    if (admin) {
      if (admin.schoolId) setSchoolId(admin.schoolId);
      if (admin.adminId) setAdminId(admin.adminId);
      if (admin.headId) setHeadId(admin.headId);
      if (admin.schoolName) setSchoolName(admin.schoolName);
    }
  }, [admin]);

  // ── Fetch Students ──────────────────────────────────────────────────────────
  const fetchStudents = async () => {
    if (!schoolId) {
      console.warn("No schoolId available yet");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      console.log("Fetching students for schoolId:", schoolId);
      
      const response = await getStudents(schoolId);
      console.log("API Response:", response.data);
      
      if (response.data.success) {
        const transformedStudents = response.data.students.map(student => ({
          id: student.id,
          rollNo: student.rollNo,
          fullName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          firstName: student.firstName,
          lastName: student.lastName,
          parentName: student.parent?.name || '',
          parentPhone: student.parent?.phone || '',
          parentEmail: student.parent?.email || '',
          email: student.email,
          className: student.className,
          section: student.section,
          group: student.group,
          gender: student.gender,
          dob: student.dob,
          address: student.parent?.address || '',
          status: student.status,
          fee: student.fee || {},
          parent: student.parent,
          dueDay: student.dueDay || "10"
        }));
        
        console.log(`Transformed ${transformedStudents.length} students`);
        setStudents(transformedStudents);
        
        if (transformedStudents.length === 0) {
          toast.info("No students found for this school");
        }
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

  // Fetch students when schoolId is available
  useEffect(() => {
    if (schoolId) {
      fetchStudents();
    }
  }, [schoolId]);

  // ── Validation Function ──────────────────────────────────────────────────────
  const validatePayload = (payload, isUpdate = false) => {
    const errors = [];

    if (!payload.studentEmail && !isUpdate) {
      errors.push("Valid student email required");
    }
    if (payload.studentEmail && !payload.studentEmail.includes('@')) {
      errors.push("Valid student email required");
    }
    if (!payload.className) errors.push("Class is required");
    if (!payload.section) errors.push("Section is required");
    if (!payload.selectedSubjects || payload.selectedSubjects.length === 0) {
      errors.push("Select at least one subject");
    }
    if (!payload.monthlyFee || parseFloat(payload.monthlyFee) <= 0) {
      errors.push("Monthly fee must be > 0");
    }
    if (!payload.dueDay || payload.dueDay < 1 || payload.dueDay > 28) {
      errors.push("Due day must be 1–28");
    }

    if (errors.length > 0) {
      toast.error(errors.join(" | "));
      return false;
    }
    return true;
  };

  // ── ADD / UPDATE STUDENT ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.firstName || !formData.parentPhone || !formData.rollNo || !formData.className) {
      toast.warning("First Name, Phone, Roll No aur Class zaroor bharo");
      return;
    }

    if (!schoolId) {
      toast.error("School ID not found. Please login again.");
      return;
    }

    setSaving(true);
    
    try {
      if (editStudent) {
        // UPDATE PAYLOAD
        const updatePayload = {
          studentId: editStudent.id,
          schoolId: schoolId,
          
          // Student basic info
          firstName: formData.firstName,
          lastName: formData.lastName,
          rollNo: formData.rollNo,
          gender: formData.gender,
          dob: formData.dob || "2000-01-01",
          studentEmail: formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@school.com`,
          
          // Class & Section
          className: formData.className,
          selectedClass: formData.className,
          section: formData.section,
          selectedSection: formData.section,
          group: formData.group || "General",
          
          // Subjects (at least one required)
          selectedSubjects: ["Mathematics"],
          
          // Parent info
          parent: {
            name: formData.parentName,
            phone: formData.parentPhone,
            email: formData.parentEmail || `${formData.parentPhone}@parent.com`,
            password: "password123",
            address: formData.address || "Address not provided"
          },
          
          // Fee structure
          admissionFee: formData.fee.admissionOneTime || "1000",
          monthlyFee: formData.fee.monthly || "500",
          registrationFee: formData.fee.registration || "500",
          securityFee: formData.fee.security || "1000",
          
          // Payment settings
          dueDay: formData.dueDay || "10",
          autoReminder: true,
          reminderDaysBefore: "3",
          notifyVia: "SMS"
        };
        
        // Validate before sending
        if (!validatePayload(updatePayload, true)) {
          setSaving(false);
          return;
        }
        
        console.log("Update payload:", updatePayload);
        const response = await updateStudent(updatePayload);
        
        if (response.data.success) {
          toast.success("Student updated successfully!");
          await fetchStudents();
          setShowModal(false);
          setFormData(emptyForm);
          setEditStudent(null);
        } else {
          throw new Error(response.data.message);
        }
      } else {
        // CREATE PAYLOAD
        const createPayload = {
          adminId: adminId,
          headId: headId,
          schoolId: schoolId,
          schoolName: schoolName || "Knowledge School",
          teacherId: teacherId,
          
          // Student basic info
          firstName: formData.firstName,
          lastName: formData.lastName,
          rollNo: formData.rollNo,
          gender: formData.gender,
          dob: formData.dob || "2000-01-01",
          studentEmail: formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@school.com`,
          studentPassword: "password123",
          
          // Class & Section
          className: formData.className,
          selectedClass: formData.className,
          section: formData.section,
          selectedSection: formData.section,
          group: formData.group || "General",
          
          // Subjects (at least one required)
          selectedSubjects: ["Mathematics"],
          
          // Parent info
          parent: {
            name: formData.parentName,
            phone: formData.parentPhone,
            email: formData.parentEmail || `${formData.parentPhone}@parent.com`,
            password: "password123",
            address: formData.address || "Address not provided"
          },
          
          // Fee structure
          admissionFee: formData.fee.admissionOneTime || "1000",
          monthlyFee: formData.fee.monthly || "500",
          registrationFee: formData.fee.registration || "500",
          securityFee: formData.fee.security || "1000",
          
          // Payment settings
          dueDay: formData.dueDay || "10",
          autoReminder: true,
          reminderDaysBefore: "3",
          notifyVia: "SMS"
        };
        
        // Validate before sending
        if (!validatePayload(createPayload)) {
          setSaving(false);
          return;
        }
        
        console.log("Create payload:", createPayload);
        const response = await createAdmission(createPayload);
        
        if (response.data.success) {
          toast.success("Student added successfully!");
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

  // ── DELETE STUDENT ──────────────────────────────────────────────────────────
  const handleDelete = async (id, studentName) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This will also delete all related data.`)) return;
    
    try {
      console.log("Deleting student with ID:", id);
      const response = await deleteStudent(id);
      
      if (response.data.success) {
        toast.success("Student deleted successfully!");
        await fetchStudents();
      } else {
        throw new Error(response.data.message || "Delete failed");
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
    console.log("Editing student:", s);
    setEditStudent(s);
    setFormData({
      firstName: s.firstName || "",
      lastName: s.lastName || "",
      parentPhone: s.parentPhone || s.parent?.phone || "",
      rollNo: s.rollNo || "",
      className: s.className || "",
      section: s.section || "",
      gender: s.gender || "",
      address: s.address || s.parent?.address || "",
      email: s.email || "",
      parentName: s.parentName || s.parent?.name || "",
      parentEmail: s.parentEmail || s.parent?.email || "",
      dob: s.dob || "",
      group: s.group || "",
      dueDay: s.dueDay || "10",
      fee: {
        tuition: s.fee?.tuition || "",
        monthly: s.fee?.monthly || "500",
        admissionOneTime: s.fee?.admissionOneTime || "1000",
        registration: s.fee?.registration || "500",
        security: s.fee?.security || "1000"
      }
    });
    setShowModal(true);
  };

  const filtered = students.filter(s =>
    (s.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNo || "").includes(search) ||
    (s.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.parentName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.parentPhone || "").includes(search)
  );

  if (loading && !schoolId) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">Loading user data...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-[calc(100vw-260px)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              School: {schoolName || "Loading..."} | ID: {schoolId}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="text-xl">+</span> Add New Student
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="🔍 Search by name, roll no, parent name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          />
        </div>

        {/* Debug Info */}
        {students.length === 0 && !error && !loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ No students found. School ID: {schoolId}
              <br />
              <button onClick={fetchStudents} className="underline mt-1 hover:text-blue-900">
                Click here to retry fetching
              </button>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              ❌ Error: {error}
              <button onClick={fetchStudents} className="ml-3 underline hover:text-red-800">
                Retry
              </button>
            </p>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      {search ? "No matching students found" : "No students found"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{s.rollNo}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.fullName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.parentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {s.className} {s.section && `- ${s.section}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.parentPhone}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.email || "-"}</td>
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
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(s.id, s.fullName)} 
                            className="px-3 py-1.5 rounded-md border border-red-200 bg-white hover:bg-red-50 text-sm text-red-600 transition-colors"
                            title="Delete Student"
                          >
                            🗑️ Delete
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

        {/* Student Count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filtered.length} of {students.length} students
        </div>
      </div>

      {/* MODAL - Add/Edit Student */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {editStudent ? "Edit Student" : "Add New Student"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in all required fields (*)
              </p>
            </div>

            {/* Modal Body - Form */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student Information Section */}
                <div className="col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">Student Information</h3>
                </div>

                <input
                  type="text"
                  placeholder="First Name *"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />

                <input
                  type="text"
                  placeholder="Roll No *"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />

                <input
                  type="text"
                  placeholder="Class * (e.g., 10, 11, 12)"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />

                <input
                  type="text"
                  placeholder="Section * (e.g., A, B, C)"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />

                <input
                  type="text"
                  placeholder="Group (Science/Commerce/Arts)"
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />

                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="date"
                  placeholder="Date of Birth"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />

                <input
                  type="email"
                  placeholder="Student Email *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />

                {/* Parent Information Section */}
                <div className="col-span-2 mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">Parent Information</h3>
                </div>

                <input
                  type="text"
                  placeholder="Parent Name *"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />

                <input
                  type="tel"
                  placeholder="Parent Phone *"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />

                <input
                  type="email"
                  placeholder="Parent Email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />

                <textarea
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  rows="2"
                />

                {/* Fee Structure Section */}
                <div className="col-span-2 mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">Fee Structure</h3>
                </div>

                <div className="text-sm text-amber-600 col-span-2 -mt-2">
                  ⚠️ Monthly fee must be greater than 0
                </div>

                <input
                  type="number"
                  placeholder="Monthly Fee * (>0)"
                  value={formData.fee.monthly}
                  onChange={(e) => setFormData({
                    ...formData,
                    fee: { ...formData.fee, monthly: e.target.value }
                  })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />

                <input
                  type="number"
                  placeholder="Admission Fee (One Time)"
                  value={formData.fee.admissionOneTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    fee: { ...formData.fee, admissionOneTime: e.target.value }
                  })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />

                <input
                  type="number"
                  placeholder="Registration Fee"
                  value={formData.fee.registration}
                  onChange={(e) => setFormData({
                    ...formData,
                    fee: { ...formData.fee, registration: e.target.value }
                  })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />

                <input
                  type="number"
                  placeholder="Security Fee"
                  value={formData.fee.security}
                  onChange={(e) => setFormData({
                    ...formData,
                    fee: { ...formData.fee, security: e.target.value }
                  })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />

                {/* Payment Settings Section */}
                <div className="col-span-2 mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">Payment Settings</h3>
                </div>

                <div className="text-sm text-amber-600 col-span-2 -mt-2">
                  ⚠️ Due day must be between 1-28
                </div>

                <input
                  type="number"
                  placeholder="Due Day (1-28) *"
                  value={formData.dueDay}
                  onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  min="1"
                  max="28"
                  required
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : (editStudent ? "Update Student" : "Save Student")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}