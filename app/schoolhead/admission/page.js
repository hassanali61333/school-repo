"use client";
import { useEffect, useState } from "react";
import { createAdmission, getTeachers } from "@/app/services/schoolService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { setloginuser, setuserId } from "@/app/store/userSlice";
import axios from "axios";

// ── Helpers ──────────────────────────────────────────────────────────────────
const onlyDigits = (str) => String(str || "").replace(/\D/g, "");

const isValidEmail = (e) => {
  if (!e) return false;
  const at = e.indexOf("@");
  if (at <= 0 || at !== e.lastIndexOf("@")) return false;
  const domain = e.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  return !!(e.slice(0, at) && dot > 0 && dot < domain.length - 1);
};

// ── Static Data ─────────────────────────────────────────────────────────────────
const CLASSES = [
  { id: "nursery", name: "Nursery" },
  { id: "prep", name: "Prep" },
  { id: "kg", name: "KG" },
  { id: "1", name: "Class 1" },
  { id: "2", name: "Class 2" },
  { id: "3", name: "Class 3" },
  { id: "4", name: "Class 4" },
  { id: "5", name: "Class 5" },
  { id: "6", name: "Class 6" },
  { id: "7", name: "Class 7" },
  { id: "8", name: "Class 8" },
  { id: "9", name: "9th" },
  { id: "10", name: "10th" },
  { id: "11", name: "11th" },
  { id: "12", name: "12th" },
];
const CLASS_MAP = Object.fromEntries(CLASSES.map((c) => [c.id, c.name]));

const HIGH_CLASSES = ["9", "10", "11", "12"];

const GROUPS_BY_CLASS = {
  9: ["Science", "Arts", "Commerce"],
  10: ["Science", "Arts", "Commerce"],
  11: ["Pre-Eng", "Pre-Med", "Commerce", "ICS"],
  12: ["Pre-Eng", "Pre-Med", "Commerce", "ICS"],
};

const MC = ["English", "Urdu", "Islamiyat", "Ethics", "Pakistan Studies"];

const SUBJECTS_BY_CLASS = {
  nursery: ["English Phonics", "Math Basics", "Urdu Nazra"],
  prep: ["English", "Math", "Urdu", "General Knowledge"],
  kg: ["English", "Math", "Urdu", "General Knowledge"],
  1: ["English", "Urdu", "Math", "Islamiyat", "Computer"],
  2: ["English", "Urdu", "Math", "Islamiyat", "Computer"],
  3: ["English", "Urdu", "Math", "Science", "Islamiyat", "Computer"],
  4: ["English", "Urdu", "Math", "Science", "Social Studies", "Computer"],
  5: ["English", "Urdu", "Math", "Science", "Social Studies", "Computer"],
  6: ["English", "Urdu", "Math", "General Science", "History", "Geography", "Computer"],
  7: ["English", "Urdu", "Math", "General Science", "History", "Geography", "Computer"],
  8: ["English", "Urdu", "Math", "General Science", "History", "Geography", "Computer"],
};

const SUBJECTS_9_10 = {
  Science: [...MC, "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
  Arts: [...MC, "General Mathematics", "General Science", "Civics", "Islamic History", "Home Economics", "Fine Arts"],
  Commerce: [...MC, "Principles of Commerce", "Banking", "Accounting", "Business Math", "Economics"],
};

const SUBJECTS_11_12 = {
  "Pre-Eng": [...MC, "Mathematics", "Physics", "Chemistry"],
  "Pre-Med": [...MC, "Biology", "Physics", "Chemistry"],
  Commerce: [...MC, "Principles of Accounting", "Principles of Economics", "Business Math", "Statistics"],
  ICS: [...MC, "Computer Science", "Mathematics", "Physics"],
};

const DEFAULT_SECTIONS = ["A", "B", "C"];

// ── Image Upload ────────────────────────────────────────────────────────────────
const uploadImageToServer = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  try {
    const res = await axios.post(
      "https://futureittechnology.com/picuplode.php",
      formData,
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 30000 }
    );
    const raw =
      typeof res.data === "string"
        ? res.data.trim()
        : res.data?.url || res.data?.imageUrl || res.data?.path || res.data?.data || null;
    if (!raw) throw new Error("No filename returned");
    return raw.split("/").pop();
  } catch {
    toast.warn("Image upload failed. Saving without photo.");
    return null;
  }
};

// ── Subjects helper ───────────────────────────────────────────────────────────
const getSubjectsForClass = (classId, group) => {
  if (!classId) return [];
  if (!HIGH_CLASSES.includes(classId)) {
    return SUBJECTS_BY_CLASS[classId] || [];
  }
  if (!group) return [];
  if (classId === "9" || classId === "10") return SUBJECTS_9_10[group] || [];
  return SUBJECTS_11_12[group] || [];
};

// ─────────────────────────────────────────────────────────────────────────────
export default function AdmissionScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.loginuser);

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Account info (from logged-in head)
  const [adminId, setAdminId] = useState("");
  const [headId, setHeadId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");

  // Teachers
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Student - matches schema exactly
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Parent - matches schema nested object
  const [parent, setParent] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    address: "",
  });

  // Academic
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [customSubject, setCustomSubject] = useState("");
  const [extraSubjects, setExtraSubjects] = useState([]);
  const [extraSections, setExtraSections] = useState({});
  const [customSection, setCustomSection] = useState("");

  // Fee - matches schema flat fields
  const [monthlyFee, setMonthlyFee] = useState("");
  const [admissionFee, setAdmissionFee] = useState("");  // Changed from admissionOneTime
  
  // Reminder - matches schema flat fields
  const [dueDay, setDueDay] = useState("5");
  const [autoReminder, setAutoReminder] = useState(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState("3");
  const [notifyVia, setNotifyVia] = useState("WhatsApp");

  // ── Load user from localStorage on mount ────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("loginuser");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        dispatch(setloginuser(userData));
        dispatch(setuserId(userData.id));
        setSchoolId(userData.schoolId || "");
        setSchoolName(userData.schoolName || "");
        setAdminId(userData.adminId || "");
        setHeadId(userData.id || userData.headId || "");
      } catch {}
    }
  }, [dispatch]);

  // ── Fetch teachers ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!schoolId) return;
    const fetchTeachers = async () => {
      setTeachersLoading(true);
      try {
        const response = await getTeachers(schoolId);
        setTeachers(response?.data?.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message);
      } finally {
        setTeachersLoading(false);
      }
    };
    fetchTeachers();
  }, [schoolId]);

  // ── Derived values ───────────────────────────────────────────────────────────
  const isHighClass = HIGH_CLASSES.includes(selectedClass);

  const availableSubjects = [
    ...getSubjectsForClass(selectedClass, selectedGroup),
    ...extraSubjects,
  ];

  const availableSections = [
    ...DEFAULT_SECTIONS,
    ...(extraSections[selectedClass] || []),
  ];

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleClassChange = (value) => {
    setSelectedClass(value);
    setSelectedGroup("");
    setSelectedSection("");
    setSelectedSubjects([]);
    setExtraSubjects([]);
  };

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
    setSelectedSubjects([]);
    setExtraSubjects([]);
  };

  const toggleSubject = (subj) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const addCustomSubject = () => {
    const val = customSubject.trim();
    if (!val) return;
    const formatted = val[0].toUpperCase() + val.slice(1);
    if (availableSubjects.some((s) => s.toLowerCase() === formatted.toLowerCase())) {
      toast.warn(`"${formatted}" already exists.`);
      return;
    }
    setExtraSubjects((prev) => [...prev, formatted]);
    setCustomSubject("");
  };

  const addCustomSection = () => {
    if (!selectedClass) { toast.warn("Select a class first."); return; }
    const val = customSection.trim();
    if (!val) return;
    const formatted = val.length === 1 ? val.toUpperCase() : val[0].toUpperCase() + val.slice(1);
    const existing = availableSections;
    if (existing.some((s) => s.toLowerCase() === formatted.toLowerCase())) {
      toast.warn(`Section "${formatted}" already exists.`);
      return;
    }
    setExtraSections((prev) => ({
      ...prev,
      [selectedClass]: [...(prev[selectedClass] || []), formatted],
    }));
    setCustomSection("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Step validation ──────────────────────────────────────────────────────────
  const validateStep = (step) => {
    if (step === 1) {
      if (!selectedTeacher) { toast.error("Select a Teacher Incharge."); return false; }
      if (!firstName.trim()) { toast.error("First name is required."); return false; }
      const rd = onlyDigits(rollNo);
      if (!rd || rd.length < 1 || rd.length > 10) { toast.error("Roll number must be 1–10 digits."); return false; }
      if (!isValidEmail(studentEmail)) { toast.error("Enter a valid student email."); return false; }
      if (!studentPassword || studentPassword.length < 6) { toast.error("Student password min 6 characters."); return false; }
    }
    if (step === 2) {
      if (!parent.name.trim()) { toast.error("Parent name is required."); return false; }
      const pd = onlyDigits(parent.phone);
      if (pd.length < 10 || pd.length > 14) { toast.error("Parent phone must be 10–14 digits."); return false; }
      if (!isValidEmail(parent.email)) { toast.error("Enter a valid parent email."); return false; }
      if (!parent.password || parent.password.length < 6) {
        toast.error("Parent password min 6 characters.");
        return false;
      }
    }
    if (step === 3) {
      if (!selectedClass) { toast.error("Select a class."); return false; }
      if (isHighClass && !selectedGroup) { toast.error("Select a group for class 9–12."); return false; }
      if (!selectedSection) { toast.error("Select a section."); return false; }
      if (selectedSubjects.length === 0) { toast.error("Select at least one subject."); return false; }
    }
    if (step === 4) {
      if (!monthlyFee || parseFloat(monthlyFee) <= 0) { toast.error("Monthly fee must be greater than 0."); return false; }
      const dd = parseInt(dueDay, 10);
      if (!(dd >= 1 && dd <= 28)) { toast.error("Due day must be between 1 and 28."); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => s + 1);
      window.scrollTo(0, 0);
    }
  };
  const prevStep = () => { setCurrentStep((s) => s - 1); window.scrollTo(0, 0); };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload image
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImageToServer(imageFile);
      }

      // 2. Build payload EXACTLY matching backend schema (flat structure)
      const payload = {
        // Admin/School info
        adminId: user?.adminId || adminId,
        headId: user?.id || headId,
        schoolId: user?.schoolId || schoolId,
        schoolName: user?.schoolName || schoolName,
        
        // Teacher
        teacherId: selectedTeacher?.teacherId || selectedTeacher?.id || "",
        
        // Student basic
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        rollNo: onlyDigits(rollNo),
        gender: gender,
        dob: dob || "",
        studentEmail: studentEmail.trim().toLowerCase(),  // Note: backend expects 'studentEmail'
        studentPassword: studentPassword,                 // Note: backend expects 'studentPassword'
        imageUrl: imageUrl,
        
        // Parent nested object (backend expects 'parent')
        parent: {
          name: parent.name.trim(),
          phone: onlyDigits(parent.phone),
          email: parent.email.trim().toLowerCase(),
          password: parent.password,
          address: parent.address.trim() || "",
        },
        
        // Academic
        selectedClass: selectedClass,      // stored as classId in backend
        className: CLASS_MAP[selectedClass] || selectedClass,
        group: isHighClass ? selectedGroup : null,
        selectedSection: selectedSection,  // stored as section in backend
        selectedSubjects: selectedSubjects, // stored as subjects[] in backend
        
        // Fee flat fields (backend does NOT expect nested 'fee' object)
        admissionFee: parseInt(admissionFee) || 0,
        monthlyFee: parseInt(monthlyFee),
        
        // Billing settings flat fields
        dueDay: parseInt(dueDay),
        autoReminder: autoReminder,
        reminderDaysBefore: autoReminder ? parseInt(reminderDaysBefore) : 0,
        notifyVia: notifyVia,
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await createAdmission(payload);

      if (response.data?.success === false) {
        toast.error(response.data.message);
        return;
      }

      toast.success(response.data?.message || "Student successfully admitted!");
      setTimeout(() => resetForm(), 3000);
    } catch (err) {
      console.error("Submission error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to submit. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFirstName(""); setLastName(""); setRollNo(""); setGender("Male");
    setDob(""); setStudentEmail(""); setStudentPassword("");
    setImageFile(null); setImagePreview("");
    setParent({ name: "", phone: "", email: "", password: "", address: "" });
    setSelectedClass(""); setSelectedGroup(""); setSelectedSection("");
    setSelectedSubjects([]); setExtraSubjects([]); setExtraSections({});
    setMonthlyFee(""); setAdmissionFee("");
    setDueDay("5");
    setAutoReminder(true); setReminderDaysBefore("3");
    setNotifyVia("WhatsApp"); setSelectedTeacher(null); setCurrentStep(1);
  };

  // ── UI helpers ───────────────────────────────────────────────────────────────
  const stepLabels = ["Student Info", "Parent Info", "Class & Subjects", "Fees", "Review"];

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer position="top-right" autoClose={5000} theme="light" />

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">New Student Admission</h1>
          <p className="text-gray-500 mt-1 text-sm">{schoolName || "School Management System"}</p>

          {/* Step indicator */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                    ${currentStep > step ? "bg-green-500 text-white" :
                      currentStep === step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  {currentStep > step ? "✓" : step}
                </div>
                {step < 5 && (
                  <div className={`flex-1 h-1 mx-1 ${currentStep > step ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {stepLabels.map((l) => <span key={l}>{l}</span>)}
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* STEP 1 — Student Info + Teacher Incharge */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Student Information</h2>

              {/* Teacher Incharge */}
              <div>
                <label className={labelCls}>Teacher Incharge *</label>
                {teachersLoading ? (
                  <p className="text-sm text-gray-400">Loading teachers…</p>
                ) : teachers.length === 0 ? (
                  <p className="text-sm text-red-400">No teachers found. Add teachers first.</p>
                ) : (
                  <select
                    value={selectedTeacher?.teacherId || selectedTeacher?.id || ""}
                    onChange={(e) => {
                      const t = teachers.find(
                        (t) => (t.teacherId || t.id || t.docId) === e.target.value
                      );
                      setSelectedTeacher(t || null);
                    }}
                    className={inputCls}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => {
                      const tid = t.teacherId || t.id || t.docId;
                      const name = t.name || t.teacherName || tid;
                      const cls = t.class ? CLASS_MAP[t.class] || t.class : null;
                      const sec = t.section || null;
                      const label = [name, cls && `Class ${cls}`, sec && `Sec ${sec}`]
                        .filter(Boolean).join(" — ");
                      return <option key={tid} value={tid}>{label}</option>;
                    })}
                  </select>
                )}
              </div>

              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name *</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Hassan" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ali" className={inputCls} />
                </div>
              </div>

              {/* Roll + Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Roll Number * (1–10 digits)</label>
                  <input type="text" value={rollNo}
                    onChange={(e) => { const v = onlyDigits(e.target.value); if (v.length <= 10) setRollNo(v); }}
                    placeholder="e.g. 1" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Gender *</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputCls}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* DOB + Photo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="text" value={dob} onChange={(e) => setDob(e.target.value)}
                    placeholder="20.5.2015" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Profile Photo (max 2MB)</label>
                  <input type="file" accept="image/*" onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 h-16 w-16 object-cover rounded-lg border" />
                  )}
                </div>
              </div>

              {/* Email + Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Student Email *</label>
                  <input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="hassan.test@gmail.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Password * (min 6 chars)</label>
                  <input type="password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)}
                    className={inputCls} />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="button" onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Parent / Guardian */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Parent / Guardian</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input type="text" value={parent.name}
                    onChange={(e) => setParent({ ...parent, name: e.target.value })}
                    placeholder="Ali" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone * (10–14 digits)</label>
                  <input type="tel" value={parent.phone}
                    onChange={(e) => { const v = onlyDigits(e.target.value); if (v.length <= 14) setParent({ ...parent, phone: v }); }}
                    placeholder="0321508963" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Email *</label>
                  <input type="email" value={parent.email}
                    onChange={(e) => setParent({ ...parent, email: e.target.value })}
                    placeholder="ali.test@gmail.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Password * (min 6 chars)</label>
                  <input type="password" value={parent.password}
                    onChange={(e) => setParent({ ...parent, password: e.target.value })}
                    className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Address</label>
                <textarea value={parent.address}
                  onChange={(e) => setParent({ ...parent, address: e.target.value })}
                  rows={3} placeholder="4.20 b"
                  className={`${inputCls} resize-none`} />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-700">
                  If this parent already has a child enrolled in this school, the backend will
                  reuse their existing account automatically.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button type="button" onClick={prevStep}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 font-medium">
                  ← Back
                </button>
                <button type="button" onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Class, Group, Section, Subjects */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Academic Placement</h2>

              {/* Class */}
              <div>
                <label className={labelCls}>Class *</label>
                <select value={selectedClass} onChange={(e) => handleClassChange(e.target.value)}
                  className={inputCls}>
                  <option value="">Select Class</option>
                  {CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Group (only for 9–12) */}
              {isHighClass && (
                <div>
                  <label className={labelCls}>Group *</label>
                  <select value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)}
                    className={inputCls}>
                    <option value="">Select Group</option>
                    {(GROUPS_BY_CLASS[selectedClass] || []).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Section */}
              <div>
                <label className={labelCls}>Section *</label>
                <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass} className={`${inputCls} disabled:opacity-50`}>
                  <option value="">Select Section</option>
                  {availableSections.map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
                <div className="flex gap-2 mt-2">
                  <input type="text" value={customSection} onChange={(e) => setCustomSection(e.target.value)}
                    placeholder="Add section (e.g. D)" className={`${inputCls} flex-1`} />
                  <button type="button" onClick={addCustomSection}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                    Add
                  </button>
                </div>
              </div>

              {/* Subjects */}
              {selectedClass && (!isHighClass || selectedGroup) && (
                <div>
                  <label className={labelCls}>
                    Subjects * <span className="text-gray-400 font-normal">(select all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {availableSubjects.map((subj) => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleSubject(subj)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                          ${selectedSubjects.includes(subj)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"}`}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Add custom subject" className={`${inputCls} flex-1`} />
                    <button type="button" onClick={addCustomSubject}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                      Add
                    </button>
                  </div>
                  {selectedSubjects.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              )}

              {isHighClass && !selectedGroup && selectedClass && (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                  Select a group to load subjects.
                </p>
              )}

              <div className="flex justify-between pt-2">
                <button type="button" onClick={prevStep}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 font-medium">
                  ← Back
                </button>
                <button type="button" onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Fee & Billing */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Fee & Billing</h2>
              <p className="text-xs text-gray-400">All amounts in Pakistani Rupees (Rs)</p>

              {/* Fee Structure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Monthly Fee * (Rs)</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)} 
                    className={inputCls} 
                    placeholder="e.g. 5000" 
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Admission One-Time Fee (Rs)</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={admissionFee}
                    onChange={(e) => setAdmissionFee(e.target.value)} 
                    className={inputCls} 
                    placeholder="e.g. 1000" 
                  />
                </div>
              </div>

              {/* Billing settings */}
              <div>
                <label className={labelCls}>Fee Due Day (1–28) *</label>
                <select 
                  value={dueDay} 
                  onChange={(e) => setDueDay(e.target.value)} 
                  className={inputCls}
                  required
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={String(d)}>Day {d}</option>
                  ))}
                </select>
              </div>

              {/* Reminder Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md border flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={autoReminder} 
                      onChange={(e) => setAutoReminder(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Monthly Fee Reminder</span>
                  </label>
                  {autoReminder && (
                    <>
                      <div className="flex items-center gap-2">
                        <label className={labelCls + " mb-0 whitespace-nowrap"}>Days before:</label>
                        <select 
                          value={reminderDaysBefore}
                          onChange={(e) => setReminderDaysBefore(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          {["0", "1", "2", "3", "5", "7", "10", "14"].map((d) => (
                            <option key={d} value={d}>{d === "0" ? "Same day" : `${d} day${d !== "1" ? "s" : ""}`}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className={labelCls + " mb-0"}>Channel:</label>
                        <select 
                          value={notifyVia} 
                          onChange={(e) => setNotifyVia(e.target.value)} 
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="SMS">SMS</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Email">Email</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button type="button" onClick={prevStep}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 font-medium">
                  ← Back
                </button>
                <button type="button" onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 — Review & Submit */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Review & Confirm</h2>

              <ReviewBlock title="Student">
                <ReviewRow label="Name" value={`${firstName} ${lastName}`.trim()} />
                <ReviewRow label="Roll No" value={rollNo} />
                <ReviewRow label="Gender" value={gender} />
                <ReviewRow label="DOB" value={dob || "—"} />
                <ReviewRow label="Email" value={studentEmail} />
                <ReviewRow label="Teacher" value={selectedTeacher?.name || selectedTeacher?.teacherName || "—"} />
                {imagePreview && (
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-sm text-gray-500 w-28">Photo</span>
                    <img src={imagePreview} alt="photo" className="h-10 w-10 rounded object-cover" />
                  </div>
                )}
              </ReviewBlock>

              <ReviewBlock title="Parent / Guardian">
                <ReviewRow label="Name" value={parent.name} />
                <ReviewRow label="Phone" value={parent.phone} />
                <ReviewRow label="Email" value={parent.email} />
                {parent.address && <ReviewRow label="Address" value={parent.address} />}
              </ReviewBlock>

              <ReviewBlock title="Academic">
                <ReviewRow label="Class" value={CLASS_MAP[selectedClass] || selectedClass} />
                {selectedGroup && <ReviewRow label="Group" value={selectedGroup} />}
                <ReviewRow label="Section" value={`Section ${selectedSection}`} />
                <ReviewRow label="Subjects" value={selectedSubjects.join(", ") || "—"} />
              </ReviewBlock>

              <ReviewBlock title="Fee Structure">
                <ReviewRow label="Monthly Fee" value={`Rs ${monthlyFee}`} />
                {admissionFee && admissionFee !== "0" && admissionFee !== 0 && 
                  <ReviewRow label="Admission One-Time" value={`Rs ${admissionFee}`} />
                }
                <ReviewRow label="Due Day" value={`Day ${dueDay} of each month`} />
              </ReviewBlock>

              <ReviewBlock title="Reminder Settings">
                <ReviewRow label="Enabled" value={autoReminder ? "Yes" : "No"} />
                {autoReminder && (
                  <>
                    <ReviewRow label="Days Before" value={reminderDaysBefore === "0" ? "Same day" : `${reminderDaysBefore} days before`} />
                    <ReviewRow label="Channel" value={notifyVia} />
                  </>
                )}
              </ReviewBlock>

              <div className="flex justify-between pt-2">
                <button type="button" onClick={prevStep}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 font-medium">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 font-semibold disabled:opacity-50 flex items-center gap-2">
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? "Submitting…" : "✓ Confirm Admission"}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}

// ── Small review helpers ──────────────────────────────────────────────────────
function ReviewBlock({ title, children }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">{title}</h3>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex py-1 gap-2">
      <span className="text-sm text-gray-500 w-28 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium break-all">{value}</span>
    </div>
  );
}