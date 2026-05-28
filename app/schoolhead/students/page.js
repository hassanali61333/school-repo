"use client";
import { useState, useEffect } from "react";
import { getStudents, updateStudent, deleteStudent, createAdmission, getTeachers } from "@/app/services/schoolService";
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

// ── Empty Form Template ──────────────────────────────────────────────────────
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
  selectedSubjects: [],
  dueDay: "10",
  religion: "",
  fatherCnic: "",
  fatherMobile: "",
  motherName: "",
  motherCnic: "",
  motherMobile: "",
  fee: {
    tuition: "",
    monthly: "500",
    admissionOneTime: "1000",
    registration: "500",
    security: "1000",
    outstanding: "0",
    previousPending: "0",
    annual: "0",
    other: "0"
  },
  notifyVia: "SMS",
  reminderDaysBefore: 3,
  autoReminder: true,
  reminderSecurity: false,
  reminderTuition: true,
  admissionPaid: "0",
  annualPaid: "0",
  balance: "0",
  depositDate: "",
  depositStatus: "pending",
  paymentMonth: "",
  prevPendingPaid: "0",
  registrationPaid: "0",
  remarks: "",
  securityPaid: "0",
  totalDue: "0",
  totalPaid: "0"
};

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

export default function StudentsPage() {
  const dispatch = useDispatch();
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  
  // Modal states
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
  
  // State for user data
  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [adminId, setAdminId] = useState("");
  const [headId, setHeadId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  // Teachers
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Academic - Dynamic data
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [customSubjects, setCustomSubjects] = useState({});
  const [extraSections, setExtraSections] = useState({});
  
  // Image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  
  // Custom subject for current selection
  const [customSubject, setCustomSubject] = useState("");
  const [extraSubjects, setExtraSubjects] = useState([]);

  const admin = useSelector((s) => s.users.loginuser);

  const [formData, setFormData] = useState(emptyForm);

  // ── Load user data from localStorage and Redux ─────────────────────────────────
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
        setTeacherId(userData.teacherId || "");
        
        // Load saved custom data from localStorage
        const savedClasses = localStorage.getItem(`classes_${userData.schoolId}`);
        if (savedClasses) {
          setClasses(JSON.parse(savedClasses));
        } else {
          setClasses(INITIAL_CLASSES);
        }
        
        const savedSections = localStorage.getItem(`sections_${userData.schoolId}`);
        if (savedSections) {
          setExtraSections(JSON.parse(savedSections));
        }
        
        const savedSubjects = localStorage.getItem(`subjects_${userData.schoolId}`);
        if (savedSubjects) {
          setCustomSubjects(JSON.parse(savedSubjects));
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (admin) {
      if (admin.schoolId) setSchoolId(admin.schoolId);
      if (admin.adminId) setAdminId(admin.adminId);
      if (admin.headId) setHeadId(admin.headId);
      if (admin.schoolName) setSchoolName(admin.schoolName);
      if (admin.teacherId) setTeacherId(admin.teacherId);
    }
  }, [admin]);

  // ── Fetch Teachers ──────────────────────────────────────────────────────────
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

  // ── Fetch Students ──────────────────────────────────────────────────────────
  const fetchStudents = async () => {
    if (!schoolId) {
      console.warn("No schoolId available yet");
      setLoading(false);
      return;
    }
    
    setFetchingStudents(true);
    try {
      setLoading(true);
      setError("");
      const response = await getStudents(schoolId);
      
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
          dueDay: student.dueDay || "10",
          selectedSubjects: student.selectedSubjects || student.subjects || [],
          teacherId: student.teacherId,
          teacherName: student.teacherName,
          religion: student.religion,
          imageUrl: student.imageUrl,
          admissionPayment: student.admissionPayment,
          reminder: student.reminder
        }));
        
        setStudents(transformedStudents);
        
        if (transformedStudents.length === 0) {
          console.log("No students found for this school");
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
      setFetchingStudents(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchStudents();
    }
  }, [schoolId]);

  // ── Derived values for subjects ────────────────────────────────────────────
  const isHighClassSelected = HIGH_CLASSES.includes(formData.className);

  const getAvailableSubjects = () => {
    let subjects = [];
    
    if (!formData.className) return [];
    
    if (!isHighClassSelected) {
      subjects = [...(SUBJECTS_BY_CLASS[formData.className] || [])];
    } else if (formData.group) {
      if (formData.className === "9" || formData.className === "10") {
        subjects = [...(SUBJECTS_9_10[formData.group] || [])];
      } else {
        subjects = [...(SUBJECTS_11_12[formData.group] || [])];
      }
    }
    
    const classKey = `${formData.className}_${formData.group || 'nogroup'}`;
    if (customSubjects[classKey]) {
      subjects = [...subjects, ...customSubjects[classKey]];
    }
    
    if (extraSubjects.length > 0) {
      subjects = [...subjects, ...extraSubjects];
    }
    
    return subjects;
  };

  const availableSubjects = getAvailableSubjects();

  const getAvailableSections = () => {
    const sections = [...DEFAULT_SECTIONS];
    if (extraSections[formData.className]) {
      sections.push(...extraSections[formData.className]);
    }
    return sections;
  };

  const availableSections = getAvailableSections();

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleClassChange = (value) => {
    setFormData({ 
      ...formData, 
      className: value, 
      group: "", 
      section: "",
      selectedSubjects: [] 
    });
    setExtraSubjects([]);
  };

  const handleGroupChange = (value) => {
    setFormData({ ...formData, group: value, selectedSubjects: [] });
    setExtraSubjects([]);
  };

  const toggleSubject = (subj) => {
    const currentSubjects = formData.selectedSubjects || [];
    setFormData({
      ...formData,
      selectedSubjects: currentSubjects.includes(subj) 
        ? currentSubjects.filter(s => s !== subj) 
        : [...currentSubjects, subj]
    });
  };

  const addCustomSubject = () => {
    const val = customSubject.trim();
    if (!val) return;
    const formatted = val[0].toUpperCase() + val.slice(1);
    if (availableSubjects.some(s => s.toLowerCase() === formatted.toLowerCase())) {
      toast.warn(`"${formatted}" already exists.`);
      return;
    }
    setExtraSubjects(prev => [...prev, formatted]);
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
    localStorage.setItem(`classes_${schoolId}`, JSON.stringify(updatedClasses));
    
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
    
    toast.success(`Subject "${formattedSubject}" added`);
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

  // ── ADD / UPDATE STUDENT ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.firstName || !formData.parentPhone || !formData.rollNo || !formData.className) {
      toast.warning("Please fill all required fields");
      return;
    }

    if (!editStudent && (!formData.selectedSubjects || formData.selectedSubjects.length === 0)) {
      toast.warning("Please select at least one subject");
      return;
    }

    if (!formData.section) {
      toast.warning("Please select a section");
      return;
    }

    if (!schoolId) {
      toast.error("School ID not found. Please login again.");
      return;
    }

    setSaving(true);
    
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImageToServer(imageFile);
      }

      if (editStudent) {
        const updatePayload = {
          studentId: editStudent.id,
          adminId: adminId,
          headId: headId || admin?.id,
          schoolId: schoolId,
          teacherId: selectedTeacher?.teacherId || selectedTeacher?.id || teacherId,
          classId: formData.className,
          className: formData.className,
          dob: formData.dob || "2000-01-01",
          email: formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@school.com`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender,
          rollNo: formData.rollNo,
          religion: formData.religion || "",
          group: formData.group || null,
          imageUrl: imageUrl,
          schoolName: schoolName || "Knowledge School",
          section: formData.section,
          status: "active",
          role: "student",
          teacherName: selectedTeacher?.name || "",
          password: "password123",
          subjects: formData.selectedSubjects,
          fee: {
            admissionOneTime: parseInt(formData.fee.admissionOneTime) || 0,
            dueDay: parseInt(formData.dueDay) || 10,
            monthly: parseInt(formData.fee.monthly) || 0,
            outstanding: parseInt(formData.fee.outstanding) || 0,
            previousPending: parseInt(formData.fee.previousPending) || 0,
            registration: parseInt(formData.fee.registration) || 0,
            annual: parseInt(formData.fee.annual) || 0,
            other: parseInt(formData.fee.other) || 0
          },
          reminder: {
            channel: formData.notifyVia || "SMS",
            daysBefore: formData.reminderDaysBefore || 3,
            enabled: formData.autoReminder !== false,
            security: formData.reminderSecurity || false,
            tuition: formData.reminderTuition !== false
          },
          parent: {
            address: formData.address || "Address not provided",
            email: formData.parentEmail || `${formData.parentPhone}@parent.com`,
            password: "password123",
            phone: formData.parentPhone,
            father: {
              cnic: formData.fatherCnic || "",
              mobile: formData.fatherMobile || "",
              name: formData.parentName || ""
            },
            mother: {
              cnic: formData.motherCnic || "",
              mobile: formData.motherMobile || "",
              name: formData.motherName || ""
            }
          },
          admissionPayment: {
            admissionPaid: parseInt(formData.admissionPaid) || 0,
            annualPaid: parseInt(formData.annualPaid) || 0,
            balance: parseInt(formData.balance) || 0,
            depositDate: formData.depositDate || new Date().toISOString().split('T')[0],
            depositStatus: formData.depositStatus || "pending",
            month: formData.paymentMonth || new Date().toLocaleString('default', { month: 'long' }),
            prevPendingPaid: parseInt(formData.prevPendingPaid) || 0,
            registrationPaid: parseInt(formData.registrationPaid) || 0,
            remarks: formData.remarks || "",
            securityPaid: parseInt(formData.securityPaid) || 0,
            totalDue: parseInt(formData.totalDue) || 0,
            totalPaid: parseInt(formData.totalPaid) || 0
          }
        };
        
        const response = await updateStudent(updatePayload);
        
        if (response.data.success) {
          toast.success("Student updated successfully!");
          await fetchStudents();
          setShowModal(false);
          resetForm();
        } else {
          throw new Error(response.data.message);
        }
      } else {
        // Create operation
        const createPayload = {
          adminId: adminId,
          headId: headId || admin?.id,
          schoolId: schoolId,
          schoolName: schoolName || "Knowledge School",
          teacherId: selectedTeacher?.teacherId || selectedTeacher?.id || teacherId || admin?.teacherId,
          teacherName: selectedTeacher?.name || "",
          firstName: formData.firstName,
          lastName: formData.lastName,
          rollNo: formData.rollNo,
          gender: formData.gender,
          dob: formData.dob || "2000-01-01",
          email: formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@school.com`,
          password: "password123",
          religion: formData.religion || "",
          group: formData.group || null,
          subjects: formData.selectedSubjects,
          classId: formData.className,
          className: formData.className,
          section: formData.section,
          imageUrl: imageUrl,
          role: "student",
          status: "active",
          fee: {
            admissionOneTime: parseInt(formData.fee.admissionOneTime) || 0,
            dueDay: parseInt(formData.dueDay) || 10,
            monthly: parseInt(formData.fee.monthly) || 0,
            outstanding: 0,
            previousPending: 0,
            registration: parseInt(formData.fee.registration) || 0,
            annual: 0,
            other: 0
          },
          reminder: {
            channel: "SMS",
            daysBefore: 3,
            enabled: true,
            security: false,
            tuition: true
          },
          parent: {
            address: formData.address || "Address not provided",
            email: formData.parentEmail || `${formData.parentPhone}@parent.com`,
            password: "password123",
            phone: formData.parentPhone,
            father: {
              cnic: formData.fatherCnic || "",
              mobile: formData.fatherMobile || "",
              name: formData.parentName || ""
            },
            mother: {
              cnic: formData.motherCnic || "",
              mobile: formData.motherMobile || "",
              name: formData.motherName || ""
            }
          },
          admissionPayment: {
            admissionPaid: 0,
            annualPaid: 0,
            balance: 0,
            depositDate: new Date().toISOString().split('T')[0],
            depositStatus: "pending",
            month: new Date().toLocaleString('default', { month: 'long' }),
            prevPendingPaid: 0,
            registrationPaid: 0,
            remarks: "",
            securityPaid: 0,
            totalDue: parseInt(formData.fee.admissionOneTime) + parseInt(formData.fee.monthly),
            totalPaid: 0
          }
        };
        
        const response = await createAdmission(createPayload);
        
        if (response.data.success) {
          toast.success("Student added successfully!");
          await fetchStudents();
          setShowModal(false);
          resetForm();
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

  const resetForm = () => {
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setExtraSubjects([]);
    setSelectedTeacher(null);
    setCustomSubject("");
  };

  // ── DELETE STUDENT ──────────────────────────────────────────────────────────
  const handleDelete = async (id, studentName) => {
    if (!confirm(`Are you sure you want to delete ${studentName}?`)) return;
    
    setDeletingId(id);
    try {
      const response = await deleteStudent(id);
      
      if (response.data.success) {
        toast.success("Student deleted successfully!");
        await fetchStudents();
      } else {
        throw new Error(response.data.message || "Delete failed");
      }
    } catch (err) {
      console.error("Error deleting student:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to delete student");
    } finally {
      setDeletingId(null);
    }
  };

  const openAdd = () => {
    setEditStudent(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (s) => {
    console.log("Editing student:", s);
    
    let subjects = s.subjects || s.selectedSubjects || [];
    if (!Array.isArray(subjects)) {
      subjects = [];
    }
    
    // Set the selected teacher - IMPORTANT FIX
    if (s.teacherId) {
      const teacher = teachers.find(t => (t.teacherId || t.id) === s.teacherId);
      setSelectedTeacher(teacher || null);
      console.log("Found teacher:", teacher);
    } else {
      setSelectedTeacher(null);
    }
    
    // Set image preview if exists
    if (s.imageUrl) {
      setImagePreview(s.imageUrl);
    } else {
      setImagePreview("");
    }
    setImageFile(null);
    
    setEditStudent(s);
    setFormData({
      // Basic Info
      firstName: s.firstName || "",
      lastName: s.lastName || "",
      rollNo: s.rollNo || "",
      gender: s.gender || "",
      dob: s.dob || "",
      religion: s.religion || "",
      email: s.email || "",
      
      // Academic Info
      className: s.className || s.classId || "",
      section: s.section || "",
      group: s.group || "",
      selectedSubjects: subjects,
      
      // Parent/Guardian Info
      parentName: s.parent?.father?.name || s.parent?.name || "",
      parentPhone: s.parent?.phone || "",
      parentEmail: s.parent?.email || "",
      address: s.parent?.address || "",
      
      // Father Info
      fatherCnic: s.parent?.father?.cnic || "",
      fatherMobile: s.parent?.father?.mobile || "",
      
      // Mother Info
      motherName: s.parent?.mother?.name || "",
      motherCnic: s.parent?.mother?.cnic || "",
      motherMobile: s.parent?.mother?.mobile || "",
      
      // Fee Structure
      dueDay: s.fee?.dueDay || "10",
      fee: {
        admissionOneTime: s.fee?.admissionOneTime || "1000",
        monthly: s.fee?.monthly || "500",
        registration: s.fee?.registration || "500",
        security: s.fee?.security || "1000",
        tuition: s.fee?.tuition || "",
        outstanding: s.fee?.outstanding || "0",
        previousPending: s.fee?.previousPending || "0",
        annual: s.fee?.annual || "0",
        other: s.fee?.other || "0"
      },
      
      // Reminder Settings
      notifyVia: s.fee?.reminder?.channel || s.reminder?.channel || "SMS",
      reminderDaysBefore: s.fee?.reminder?.daysBefore || s.reminder?.daysBefore || 3,
      autoReminder: s.fee?.reminder?.enabled !== false && s.reminder?.enabled !== false,
      reminderSecurity: s.fee?.reminder?.security || s.reminder?.security || false,
      reminderTuition: s.fee?.reminder?.tuition !== false && s.reminder?.tuition !== false,
      
      // Admission Payment
      admissionPaid: s.admissionPayment?.admissionPaid || "0",
      annualPaid: s.admissionPayment?.annualPaid || "0",
      balance: s.admissionPayment?.balance || "0",
      depositDate: s.admissionPayment?.depositDate || "",
      depositStatus: s.admissionPayment?.depositStatus || "pending",
      paymentMonth: s.admissionPayment?.month || "",
      prevPendingPaid: s.admissionPayment?.prevPendingPaid || "0",
      registrationPaid: s.admissionPayment?.registrationPaid || "0",
      remarks: s.admissionPayment?.remarks || "",
      securityPaid: s.admissionPayment?.securityPaid || "0",
      totalDue: s.admissionPayment?.totalDue || "0",
      totalPaid: s.admissionPayment?.totalPaid || "0"
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

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  if (loading && !schoolId) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">Loading user data...</div>
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
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            + Add New Student
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

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                        <span className="text-gray-500">Loading students...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
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
                      <td className="px-4 py-3 text-sm text-gray-500">{s.teacherName || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.parentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {s.className} {s.section && `- ${s.section}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.parentPhone}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          s.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {s.status || "active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEdit(s)} 
                            disabled={saving}
                            className="px-3 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(s.id, s.fullName)} 
                            disabled={deletingId === s.id}
                            className="px-3 py-1.5 rounded-md border border-red-200 bg-white hover:bg-red-50 text-sm text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {deletingId === s.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                Deleting...
                              </>
                            ) : (
                              "🗑️ Delete"
                            )}
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

      {/* MODAL - Add/Edit Student with Full Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl my-8">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {editStudent ? "Edit Student" : "Add New Student"}
              </h2>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Teacher Incharge */}
                <div>
                  <label className={labelCls}>Teacher Incharge</label>
                  <select
                    value={selectedTeacher?.teacherId || selectedTeacher?.id || ""}
                    onChange={(e) => {
                      const t = teachers.find(t => (t.teacherId || t.id) === e.target.value);
                      setSelectedTeacher(t || null);
                    }}
                    className={inputCls}
                    disabled={teachersLoading}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => {
                      const tid = t.teacherId || t.id;
                      return <option key={tid} value={tid}>{t.name || t.teacherName}</option>;
                    })}
                  </select>
                  {teachersLoading && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                      Loading teachers...
                    </div>
                  )}
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>First Name *</label>
                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Roll Number *</label>
                    <input type="text" value={formData.rollNo} onChange={(e) => setFormData({...formData, rollNo: onlyDigits(e.target.value)})} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className={inputCls}>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Religion</label>
                    <input type="text" value={formData.religion} onChange={(e) => setFormData({...formData, religion: e.target.value})} className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Student Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Profile Photo</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm" />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-16 w-16 object-cover rounded-lg border" />}
                  </div>
                </div>

                {/* Parent Info */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Parent / Guardian</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Father Name *</label>
                      <input type="text" value={formData.parentName} onChange={(e) => setFormData({...formData, parentName: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Father Phone *</label>
                      <input type="tel" value={formData.parentPhone} onChange={(e) => setFormData({...formData, parentPhone: onlyDigits(e.target.value)})} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={labelCls}>Father CNIC</label>
                      <input type="text" value={formData.fatherCnic} onChange={(e) => setFormData({...formData, fatherCnic: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Father Mobile</label>
                      <input type="tel" value={formData.fatherMobile} onChange={(e) => setFormData({...formData, fatherMobile: onlyDigits(e.target.value)})} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className={labelCls}>Mother Name</label>
                      <input type="text" value={formData.motherName} onChange={(e) => setFormData({...formData, motherName: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Mother CNIC</label>
                      <input type="text" value={formData.motherCnic} onChange={(e) => setFormData({...formData, motherCnic: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Mother Mobile</label>
                      <input type="tel" value={formData.motherMobile} onChange={(e) => setFormData({...formData, motherMobile: onlyDigits(e.target.value)})} className={inputCls} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelCls}>Parent Email</label>
                    <input type="email" value={formData.parentEmail} onChange={(e) => setFormData({...formData, parentEmail: e.target.value})} className={inputCls} />
                  </div>
                  <div className="mt-4">
                    <label className={labelCls}>Address</label>
                    <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={2} className={inputCls} />
                  </div>
                </div>

                {/* Academic */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Academic</h3>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className={labelCls}>Class *</label>
                      <select value={formData.className} onChange={(e) => handleClassChange(e.target.value)} className={inputCls}>
                        <option value="">Select Class</option>
                        {classes && classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <button type="button" onClick={() => setShowAddClassModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm whitespace-nowrap">
                      + Add Class
                    </button>
                  </div>

                  {isHighClassSelected && (
                    <div className="mt-4">
                      <label className={labelCls}>Group *</label>
                      <select value={formData.group} onChange={(e) => handleGroupChange(e.target.value)} className={inputCls}>
                        <option value="">Select Group</option>
                        {(GROUPS_BY_CLASS[formData.className] || []).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2 items-end">
                    <div className="flex-1">
                      <label className={labelCls}>Section *</label>
                      <select value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} className={inputCls}>
                        <option value="">Select Section</option>
                        {availableSections.map(s => <option key={s} value={s}>Section {s}</option>)}
                      </select>
                    </div>
                    <button type="button" onClick={() => {
                      if (!formData.className) { toast.error("Select class first"); return; }
                      setSelectedClassForSection(formData.className);
                      setShowAddSectionModal(true);
                    }} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm whitespace-nowrap">
                      + Add Section
                    </button>
                  </div>

                  {formData.className && (!isHighClassSelected || formData.group) && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className={labelCls}>Subjects</label>
                        <button type="button" onClick={() => {
                          if (!formData.className) { toast.error("Select class first"); return; }
                          setSelectedClassForSubject(formData.className);
                          setSelectedGroupForSubject(formData.group);
                          setShowAddSubjectModal(true);
                        }} className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm">
                          + Add Subject
                        </button>
                      </div>
                      {availableSubjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {availableSubjects.map(subj => (
                            <button key={subj} type="button" onClick={() => toggleSubject(subj)}
                              className={`px-3 py-1.5 rounded-full text-sm border ${(formData.selectedSubjects || []).includes(subj) ? "bg-emerald-600 text-white" : "bg-white text-gray-700 border-gray-300"}`}>
                              {subj}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mb-2">No subjects available. Add subjects using the button above.</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <input type="text" value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} placeholder="Add custom subject..." className="flex-1 px-3 py-2 border rounded-md text-sm" />
                        <button type="button" onClick={addCustomSubject} className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm">Add</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fee */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Fee Structure</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Monthly Fee *</label>
                      <input type="number" value={formData.fee.monthly} onChange={(e) => setFormData({...formData, fee: {...formData.fee, monthly: e.target.value}})} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Admission Fee</label>
                      <input type="number" value={formData.fee.admissionOneTime} onChange={(e) => setFormData({...formData, fee: {...formData.fee, admissionOneTime: e.target.value}})} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={labelCls}>Registration Fee</label>
                      <input type="number" value={formData.fee.registration} onChange={(e) => setFormData({...formData, fee: {...formData.fee, registration: e.target.value}})} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Security Fee</label>
                      <input type="number" value={formData.fee.security} onChange={(e) => setFormData({...formData, fee: {...formData.fee, security: e.target.value}})} className={inputCls} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelCls}>Due Day (1-28)</label>
                    <select value={formData.dueDay} onChange={(e) => setFormData({...formData, dueDay: e.target.value})} className={inputCls}>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(d => <option key={d} value={d}>Day {d}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editStudent ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  editStudent ? "Update" : "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Add New Class</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Class Name" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} className={inputCls} />
              <input type="text" placeholder="Class ID" value={newClassId} onChange={(e) => setNewClassId(e.target.value)} className={inputCls} />
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleAddNewClass} className="flex-1 bg-blue-600 text-white py-2 rounded-md">Add</button>
              <button onClick={() => setShowAddClassModal(false)} className="flex-1 bg-gray-300 py-2 rounded-md">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Add New Section</h3>
            <input type="text" placeholder="Section Name (e.g., D, E)" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} className={inputCls} />
            <div className="flex gap-2 mt-6">
              <button onClick={handleAddNewSection} className="flex-1 bg-green-600 text-white py-2 rounded-md">Add</button>
              <button onClick={() => setShowAddSectionModal(false)} className="flex-1 bg-gray-300 py-2 rounded-md">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Add New Subject</h3>
            <input type="text" placeholder="Subject Name" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} className={inputCls} />
            <div className="flex gap-2 mt-6">
              <button onClick={handleAddNewSubject} className="flex-1 bg-purple-600 text-white py-2 rounded-md">Add</button>
              <button onClick={() => setShowAddSubjectModal(false)} className="flex-1 bg-gray-300 py-2 rounded-md">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}