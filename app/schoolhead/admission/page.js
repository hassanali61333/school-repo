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

// ── Static Data ─────────────────────────────────────────────────────────────────
const INITIAL_CLASSES = [
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
const getSubjectsForClass = (classId, group, customSubjects) => {
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
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  
  // New Class State
  const [newClassName, setNewClassName] = useState("");
  const [newClassId, setNewClassId] = useState("");
  const [isHighClass, setIsHighClass] = useState(false);
  
  // New Section State
  const [newSectionName, setNewSectionName] = useState("");
  const [selectedClassForSection, setSelectedClassForSection] = useState("");
  
  // New Subject State
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedClassForSubject, setSelectedClassForSubject] = useState("");
  const [selectedGroupForSubject, setSelectedGroupForSubject] = useState("");

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

  // Academic - Dynamic data
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [customSubjects, setCustomSubjects] = useState({});
  const [extraSections, setExtraSections] = useState({});
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [customSubject, setCustomSubject] = useState("");
  const [extraSubjects, setExtraSubjects] = useState([]);

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
        
        // Load saved custom data from localStorage
        const savedClasses = localStorage.getItem(`classes_${userData.schoolId}`);
        if (savedClasses) {
          setClasses(JSON.parse(savedClasses));
        }
        
        const savedSections = localStorage.getItem(`sections_${userData.schoolId}`);
        if (savedSections) {
          setExtraSections(JSON.parse(savedSections));
        }
        
        const savedSubjects = localStorage.getItem(`subjects_${userData.schoolId}`);
        if (savedSubjects) {
          setCustomSubjects(JSON.parse(savedSubjects));
        }
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
  const isHighClassSelected = HIGH_CLASSES.includes(selectedClass);

  const getAvailableSubjects = () => {
    let subjects = [];
    if (!isHighClassSelected) {
      subjects = [...(SUBJECTS_BY_CLASS[selectedClass] || [])];
    } else if (selectedGroup) {
      if (selectedClass === "9" || selectedClass === "10") {
        subjects = [...(SUBJECTS_9_10[selectedGroup] || [])];
      } else {
        subjects = [...(SUBJECTS_11_12[selectedGroup] || [])];
      }
    }
    
    // Add custom subjects for this class
    const classKey = `${selectedClass}_${selectedGroup || 'nogroup'}`;
    if (customSubjects[classKey]) {
      subjects = [...subjects, ...customSubjects[classKey]];
    }
    
    return [...subjects, ...extraSubjects];
  };

  const availableSubjects = getAvailableSubjects();

  const getAvailableSections = () => {
    const sections = [...DEFAULT_SECTIONS];
    if (extraSections[selectedClass]) {
      sections.push(...extraSections[selectedClass]);
    }
    return sections;
  };

  const availableSections = getAvailableSections();

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

  // Add New Class
  const handleAddNewClass = () => {
    if (!newClassName.trim()) {
      toast.error("Please enter class name");
      return;
    }
    if (!newClassId.trim()) {
      toast.error("Please enter class ID");
      return;
    }
    
    const newClass = {
      id: newClassId.toLowerCase(),
      name: newClassName.trim()
    };
    
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    
    // Save to localStorage
    localStorage.setItem(`classes_${schoolId}`, JSON.stringify(updatedClasses));
    
    // Here you can also make an API call to save to database
    // await addClassToSchool(schoolId, newClass);
    
    toast.success(`Class "${newClassName}" added successfully!`);
    setShowAddClassModal(false);
    setNewClassName("");
    setNewClassId("");
    setIsHighClass(false);
  };

  // Add New Section
  const handleAddNewSection = () => {
    if (!selectedClassForSection) {
      toast.error("Please select a class first");
      return;
    }
    if (!newSectionName.trim()) {
      toast.error("Please enter section name");
      return;
    }
    
    const formattedSection = newSectionName.trim().toUpperCase();
    const currentSections = extraSections[selectedClassForSection] || [];
    
    if (currentSections.includes(formattedSection)) {
      toast.warn(`Section "${formattedSection}" already exists for this class`);
      return;
    }
    
    const updatedSections = {
      ...extraSections,
      [selectedClassForSection]: [...currentSections, formattedSection]
    };
    
    setExtraSections(updatedSections);
    localStorage.setItem(`sections_${schoolId}`, JSON.stringify(updatedSections));
    
    toast.success(`Section "${formattedSection}" added for class ${selectedClassForSection}`);
    setShowAddSectionModal(false);
    setNewSectionName("");
    setSelectedClassForSection("");
  };

  // Add New Subject
  const handleAddNewSubject = () => {
    if (!selectedClassForSubject) {
      toast.error("Please select a class");
      return;
    }
    if (!newSubjectName.trim()) {
      toast.error("Please enter subject name");
      return;
    }
    
    const classKey = `${selectedClassForSubject}_${selectedGroupForSubject || 'nogroup'}`;
    const currentSubjects = customSubjects[classKey] || [];
    const formattedSubject = newSubjectName.trim();
    
    if (currentSubjects.includes(formattedSubject)) {
      toast.warn(`Subject "${formattedSubject}" already exists for this class/group`);
      return;
    }
    
    const updatedSubjects = {
      ...customSubjects,
      [classKey]: [...currentSubjects, formattedSubject]
    };
    
    setCustomSubjects(updatedSubjects);
    localStorage.setItem(`subjects_${schoolId}`, JSON.stringify(updatedSubjects));
    
    toast.success(`Subject "${formattedSubject}" added for ${selectedClassForSubject}${selectedGroupForSubject ? ` - ${selectedGroupForSubject}` : ''}`);
    setShowAddSubjectModal(false);
    setNewSubjectName("");
    setSelectedClassForSubject("");
    setSelectedGroupForSubject("");
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
        className: classes.find(c => c.id === selectedClass)?.name || selectedClass,
        group: isHighClassSelected ? selectedGroup : null,
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
      setExtraSubjects([]);
      
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
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className={labelCls}>Class *</label>
                <select value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} required className={inputCls}>
                  <option value="">Select Class</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm whitespace-nowrap"
                >
                  + Add New Class
                </button>
              </div>
            </div>

            {isHighClassSelected && (
              <div className="mt-4">
                <label className={labelCls}>Group *</label>
                <select value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)} required className={inputCls}>
                  <option value="">Select Group</option>
                  {(GROUPS_BY_CLASS[selectedClass] || []).map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            )}

            <div className="mt-4 flex gap-2 items-end">
              <div className="flex-1">
                <label className={labelCls}>Section *</label>
                <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} required className={inputCls}>
                  <option value="">Select Section</option>
                  {availableSections.map((s) => <option key={s} value={s}>Section {s}</option>)}
                </select>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedClass) {
                      toast.error("Please select a class first");
                      return;
                    }
                    setSelectedClassForSection(selectedClass);
                    setShowAddSectionModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm whitespace-nowrap"
                >
                  + Add Section
                </button>
              </div>
            </div>

            {selectedClass && (!isHighClassSelected || selectedGroup) && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className={labelCls}>Subjects</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedClass) {
                        toast.error("Please select a class first");
                        return;
                      }
                      setSelectedClassForSubject(selectedClass);
                      setSelectedGroupForSubject(selectedGroup);
                      setShowAddSubjectModal(true);
                    }}
                    className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                  >
                    + Add Subject
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableSubjects.map((subj) => (
                    <button key={subj} type="button" onClick={() => toggleSubject(subj)}
                      className={`px-3 py-1.5 rounded-full text-sm border ${
                        selectedSubjects.includes(subj) 
                          ? "bg-blue-600 text-white" 
                          : "bg-white text-gray-700 border-gray-300"
                      }`}>
                      {subj}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Add custom subject..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCustomSubject}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Add
                  </button>
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

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Class</h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Class Name *</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g., Class 13, Pre-School"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Class ID *</label>
                <input
                  type="text"
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  placeholder="e.g., 13, preschool"
                  className={inputCls}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="isHighClass"
                  checked={isHighClass}
                  onChange={(e) => setIsHighClass(e.target.checked)}
                />
                <label htmlFor="isHighClass">Is this a high class (9-12)?</label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddNewClass}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Add Class
              </button>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Section</h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Class</label>
                <input
                  type="text"
                  value={classes.find(c => c.id === selectedClassForSection)?.name || selectedClassForSection}
                  disabled
                  className={`${inputCls} bg-gray-100`}
                />
              </div>
              <div>
                <label className={labelCls}>Section Name *</label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g., D, E, F"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddNewSection}
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
              >
                Add Section
              </button>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Subject</h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Class</label>
                <input
                  type="text"
                  value={classes.find(c => c.id === selectedClassForSubject)?.name || selectedClassForSubject}
                  disabled
                  className={`${inputCls} bg-gray-100`}
                />
              </div>
              {isHighClassSelected && selectedGroupForSubject && (
                <div>
                  <label className={labelCls}>Group</label>
                  <input
                    type="text"
                    value={selectedGroupForSubject}
                    disabled
                    className={`${inputCls} bg-gray-100`}
                  />
                </div>
              )}
              <div>
                <label className={labelCls}>Subject Name *</label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g., Biology, Chemistry"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddNewSubject}
                className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700"
              >
                Add Subject
              </button>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}