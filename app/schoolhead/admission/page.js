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

  // Account info (from logged-in head)
  const [adminId, setAdminId] = useState("");
  const [headId, setHeadId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");

  // Teachers
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Student
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Parent
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

  // Fee
  const [monthlyFee, setMonthlyFee] = useState("");
  const [admissionFee, setAdmissionFee] = useState("");
  
  // Reminder
  const [dueDay, setDueDay] = useState("5");
  const [autoReminder, setAutoReminder] = useState(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState("3");
  const [notifyVia, setNotifyVia] = useState("WhatsApp");

  // ── Load user from localStorage ─────────────────────────────────────────────
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

  // ── Fetch teachers ──────────────────────────────────────────────────────────
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

  // ── Derived values ──────────────────────────────────────────────────────────
  const isHighClass = HIGH_CLASSES.includes(selectedClass);

  const availableSubjects = [
    ...getSubjectsForClass(selectedClass, selectedGroup),
    ...extraSubjects,
  ];

  const availableSections = [
    ...DEFAULT_SECTIONS,
    ...(extraSections[selectedClass] || []),
  ];

  // ── Handlers ────────────────────────────────────────────────────────────────
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

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImageToServer(imageFile);
      }

      const payload = {
        adminId: user?.adminId || adminId,
        headId: user?.id || headId,
        schoolId: user?.schoolId || schoolId,
        schoolName: user?.schoolName || schoolName,
        teacherId: selectedTeacher?.teacherId || selectedTeacher?.id || "",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        rollNo: onlyDigits(rollNo),
        gender: gender,
        dob: dob || "",
        studentEmail: studentEmail.trim().toLowerCase(),
        studentPassword: studentPassword,
        imageUrl: imageUrl,
        parent: {
          name: parent.name.trim(),
          phone: onlyDigits(parent.phone),
          email: parent.email.trim().toLowerCase(),
          password: parent.password,
          address: parent.address.trim() || "",
        },
        selectedClass: selectedClass,
        className: CLASS_MAP[selectedClass] || selectedClass,
        group: isHighClass ? selectedGroup : null,
        selectedSection: selectedSection,
        selectedSubjects: selectedSubjects,
        admissionFee: parseInt(admissionFee) || 0,
        monthlyFee: parseInt(monthlyFee),
        dueDay: parseInt(dueDay),
        autoReminder: autoReminder,
        reminderDaysBefore: autoReminder ? parseInt(reminderDaysBefore) : 0,
        notifyVia: notifyVia,
      };

      const response = await createAdmission(payload);

      if (response.data?.success === false) {
        toast.error(response.data.message);
        return;
      }

      toast.success(response.data?.message || "Student successfully admitted!");
      
      // Reset form
      setFirstName("");
      setLastName("");
      setRollNo("");
      setGender("Male");
      setDob("");
      setStudentEmail("");
      setStudentPassword("");
      setImageFile(null);
      setImagePreview("");
      setParent({ name: "", phone: "", email: "", password: "", address: "" });
      setSelectedClass("");
      setSelectedGroup("");
      setSelectedSection("");
      setSelectedSubjects([]);
      setMonthlyFee("");
      setAdmissionFee("");
      setDueDay("5");
      setSelectedTeacher(null);
      
    } catch (err) {
      console.error("Submission error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to submit.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer position="top-right" autoClose={5000} theme="light" />

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Admission</h1>
          <p className="text-gray-500 mt-1 text-sm">{schoolName || "School Management System"}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          
          {/* Teacher Incharge */}
          <div>
            <label className={labelCls}>Teacher Incharge</label>
            {teachersLoading ? (
              <p className="text-sm text-gray-400">Loading teachers…</p>
            ) : teachers.length === 0 ? (
              <p className="text-sm text-red-400">No teachers found.</p>
            ) : (
              <select
                value={selectedTeacher?.teacherId || selectedTeacher?.id || ""}
                onChange={(e) => {
                  const t = teachers.find((t) => (t.teacherId || t.id || t.docId) === e.target.value);
                  setSelectedTeacher(t || null);
                }}
                className={inputCls}
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => {
                  const tid = t.teacherId || t.id || t.docId;
                  const name = t.name || t.teacherName || tid;
                  return <option key={tid} value={tid}>{name}</option>;
                })}
              </select>
            )}
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>First Name *</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Roll Number *</label>
              <input type="text" value={rollNo} onChange={(e) => setRollNo(onlyDigits(e.target.value))} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputCls}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Profile Photo</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm" />
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-16 w-16 object-cover rounded-lg border" />}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Student Email *</label>
              <input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password *</label>
              <input type="password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} required className={inputCls} />
            </div>
          </div>

          {/* Parent Info */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-4">Parent / Guardian</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input type="text" value={parent.name} onChange={(e) => setParent({...parent, name: e.target.value})} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <input type="tel" value={parent.phone} onChange={(e) => setParent({...parent, phone: onlyDigits(e.target.value)})} required className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" value={parent.email} onChange={(e) => setParent({...parent, email: e.target.value})} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Password *</label>
                <input type="password" value={parent.password} onChange={(e) => setParent({...parent, password: e.target.value})} required className={inputCls} />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Address</label>
              <textarea value={parent.address} onChange={(e) => setParent({...parent, address: e.target.value})} rows={2} className={inputCls} />
            </div>
          </div>

          {/* Academic */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-4">Academic</h2>
            <div>
              <label className={labelCls}>Class *</label>
              <select value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} required className={inputCls}>
                <option value="">Select Class</option>
                {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {isHighClass && (
              <div className="mt-4">
                <label className={labelCls}>Group *</label>
                <select value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)} required className={inputCls}>
                  <option value="">Select Group</option>
                  {(GROUPS_BY_CLASS[selectedClass] || []).map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            )}

            <div className="mt-4">
              <label className={labelCls}>Section *</label>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} required className={inputCls}>
                <option value="">Select Section</option>
                {availableSections.map((s) => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>

            {selectedClass && (!isHighClass || selectedGroup) && (
              <div className="mt-4">
                <label className={labelCls}>Subjects</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableSubjects.map((subj) => (
                    <button key={subj} type="button" onClick={() => toggleSubject(subj)}
                      className={`px-3 py-1.5 rounded-full text-sm border ${selectedSubjects.includes(subj) ? "bg-blue-600 text-white" : "bg-white text-gray-700 border-gray-300"}`}>
                      {subj}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fee */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-4">Fee</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Monthly Fee *</label>
                <input type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Admission Fee</label>
                <input type="number" value={admissionFee} onChange={(e) => setAdmissionFee(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Due Day</label>
              <select value={dueDay} onChange={(e) => setDueDay(e.target.value)} className={inputCls}>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>Day {d}</option>)}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-semibold disabled:opacity-50">
              {loading ? "Submitting..." : "Confirm Admission"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}