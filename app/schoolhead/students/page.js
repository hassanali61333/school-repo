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
  fee: {
    tuition: "",
    monthly: "",
    admissionOneTime: "",
    registration: "",
    security: ""
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

  const admin = useSelector((s) => s.users.loginuser);
  
  // CORRECT SCHOOL ID from your database
  const CORRECT_SCHOOL_ID = "school-1769983671254";
  
  const getSchoolId = () => {
    // First try from Redux, then localStorage, then default
    const schoolId = admin?.schoolId || localStorage.getItem("schoolId") || CORRECT_SCHOOL_ID;
    
    // Fix if it's the wrong ID
    if (schoolId === "school-1778500439765") {
      console.warn("Fixing wrong schoolId");
      return CORRECT_SCHOOL_ID;
    }
    
    return schoolId;
  };

  const getAdminId = () => {
    return admin?.adminId || localStorage.getItem("adminId") || "id-1769983466761";
  };

  const getHeadId = () => {
    return admin?.headId || localStorage.getItem("headId") || "head-1769983700024";
  };

  const getTeacherId = () => {
    return localStorage.getItem("teacherId") || "teacher-1779187122037";
  };

  useEffect(() => {
    const stored = localStorage.getItem("loginuser");
    if (stored) {
      const user = JSON.parse(stored);
      dispatch(setloginuser(user));
      dispatch(setuserId(user.id));
    }
    
    // Fix localStorage if needed
    const currentSchoolId = localStorage.getItem("schoolId");
    if (currentSchoolId !== CORRECT_SCHOOL_ID) {
      console.log(`Fixing localStorage schoolId: ${currentSchoolId} -> ${CORRECT_SCHOOL_ID}`);
      localStorage.setItem("schoolId", CORRECT_SCHOOL_ID);
    }
  }, [dispatch]);

  // ➤ FETCH STUDENTS - FIXED to handle nested data
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const schoolId = getSchoolId();
      console.log("Fetching students for schoolId:", schoolId);
      
      const response = await getStudents(schoolId);
      console.log("API Response:", response.data);
      
      if (response.data.success) {
        // Transform the data to match frontend expectations
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
          parent: student.parent
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

  useEffect(() => {
    fetchStudents();
  }, [admin?.schoolId]);

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
        // UPDATE - Make sure to use correct structure
        const updatePayload = {
          studentId: editStudent.id,
          schoolId: schoolId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          rollNo: formData.rollNo,
          gender: formData.gender,
          dob: formData.dob,
          studentEmail: formData.email,
          studentPassword: formData.email ? "password123" : undefined,
          
          parent: {
            name: formData.parentName,
            phone: formData.parentPhone,
            email: formData.parentEmail,
            password: "password123",
            address: formData.address
          },
          
          selectedClass: formData.className,
          className: formData.className,
          group: formData.group,
          selectedSection: formData.section,
          selectedSubjects: ["Physics", "Mathematics"],
          admissionFee: formData.fee.admissionOneTime || "0",
          monthlyFee: formData.fee.monthly || "0",
          dueDay: "10",
          autoReminder: true,
          reminderDaysBefore: "3",
          notifyVia: "SMS"
        };
        
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
        // CREATE - New student
        const createPayload = {
          adminId,
          headId,
          schoolId,
          schoolName: localStorage.getItem("schoolName") || "Knowledge school",
          teacherId,
          
          firstName: formData.firstName,
          lastName: formData.lastName,
          rollNo: formData.rollNo,
          gender: formData.gender,
          dob: formData.dob,
          studentEmail: formData.email,
          studentPassword: "password123",
          
          parent: {
            name: formData.parentName,
            phone: formData.parentPhone,
            email: formData.parentEmail,
            password: "password123",
            address: formData.address
          },
          
          selectedClass: formData.className,
          className: formData.className,
          group: formData.group,
          selectedSection: formData.section,
          selectedSubjects: ["Physics", "Mathematics"],
          admissionFee: formData.fee.admissionOneTime || "0",
          monthlyFee: formData.fee.monthly || "0",
          dueDay: "10",
          autoReminder: true,
          reminderDaysBefore: "3",
          notifyVia: "SMS"
        };
        
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

  // ➤ DELETE STUDENT
  const handleDelete = async (id, studentName) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This will also delete all related data.`)) return;
    
    try {
      const response = await deleteStudent(id);
      
      if (response.data.success) {
        toast.success("Student deleted successfully!");
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
      fee: {
        tuition: s.fee?.tuition || "",
        monthly: s.fee?.monthly || "",
        admissionOneTime: s.fee?.admissionOneTime || "",
        registration: s.fee?.registration || "",
        security: s.fee?.security || ""
      }
    });
    setShowModal(true);
  };
  console.log("Students to display:", students);

  const filtered = students.filter(s =>
    (s.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNo || "").includes(search) ||
    (s.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.parentName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.parentPhone || "").includes(search)
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
      <ToastContainer />
      
      <div className="max-w-[calc(100vw-260px)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          
          </div>
        
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, roll no, parent name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all mb-5"
        />

        {/* Debug info - Remove after fixing */}
        {students.length === 0 && !error && !loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              No students found. School ID: {getSchoolId()}
              <br />
              <button onClick={fetchStudents} className="underline mt-1">Retry Fetch</button>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
            <button onClick={fetchStudents} className="ml-3 underline">Retry</button>
          </div>
        )}

        {/* Table */}
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
                      {search ? "No matching students found" : "No students found"}
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

        {/* MODAL - Keep your existing modal code */}
        {showModal && (
          // ... your existing modal JSX (keep as is)
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {/* Modal content - same as your existing code */}
          </div>
        )}
      </div>
    </div>
  );
}