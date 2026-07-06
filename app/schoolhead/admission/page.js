"use client";
import { useEffect, useState } from "react";
import { createAdmission, getTeachers,addClass,getclasses } from "@/app/services/schoolService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { setloginuser, setuserId } from "@/app/store/userSlice";
import axios from "axios";

// ── Helpers ──────────────────────────────────────────────────────────────────
const onlyDigits = (str) => String(str || "").replace(/\D/g, "");

// ── Static Data ─────────────────────────────────────────────────────────────────


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



// ── Image Upload ────────────────────────────────────────────────────────────────


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

  // Student Basic Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [religion, setReligion] = useState("");
  const [studentEmail, setStudentEmail] = useState("@studyproai.com");
  const [studentPassword, setStudentPassword] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [status, setStatus] = useState("active");
  const [role, setRole] = useState("student");
  const [scholarshipPercent, setScholarshipPercent] = useState("");

  const [newClass, setNewClass] = useState("");
const [newSection, setNewSection] = useState("");

  // Parent Info
  const [parent, setParent] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    father: {
      name: "",
      cnic: "",
      mobile: ""
    },
    mother: {
      name: "",
      cnic: "",
      mobile: ""
    }
  });

  // Academic
  const [classes, setClasses] = useState([]);

  const [showClassInput, setShowClassInput] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [extraSubjects, setExtraSubjects] = useState([]);
  const [customSubject, setCustomSubject] = useState("");
  const [newclass, setnewclass] = useState([]);


  // Fee Structure
  const [fee, setFee] = useState({
    admissionOneTime: "0",
    monthly: "0",
    dueDay: "5",
    previousPending: '0',
    registration: "0",
    annual: "0",
    other: "0",
    security: "0",
    tuition: "0"
  });

  // Reminder Settings
  const [reminder, setReminder] = useState({
    enabled: true,
    daysBefore: "3",
    channel: "WhatsApp"
  });

  // Admission Payment
  const [admissionPayment, setAdmissionPayment] = useState({
    admissionPaid: "",
    annualPaid: "",
    balance: 0,
    depositDate: "",
    depositStatus: "pending",
    monthlyPaid: 0,
    prevPendingPaid: 0,
    registrationPaid: "",
    remarks: "",
    securityPaid: "",
    totalDue: 0,
    totalPaid: 0,
    tuitionPaid: 0,
    otherfeePaid: "",
     month: "",
  });

  // Teacher Info
  const [teacherName, setTeacherName] = useState("");
  const [Scholarship, setScholarship] = useState(false);


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
        console.log("Fetched teachers:", response?.data?.data || []); 
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
    return [...subjects, ...extraSubjects];
  };

  const availableSubjects = getAvailableSubjects();

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

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onloadend = () => {
    setImageFile(reader.result);
  };

  reader.readAsDataURL(file);
};


useEffect(() => {
  const totalDue =
    Number(fee.tuition || 0) +
    Number(fee.monthly || 0) +
    Number(fee.admissionOneTime || 0) +
    Number(fee.registration || 0) +
    Number(fee.annual || 0) +
    Number(fee.security || 0) +
    Number(fee.previousPending || 0) +
    Number(fee.other || 0);

  const totalPaid =
    Number(admissionPayment.admissionPaid || 0) +
    Number(admissionPayment.registrationPaid || 0) +
    Number(admissionPayment.securityPaid || 0) +
    Number(admissionPayment.annualPaid || 0) +
    Number(admissionPayment.prevPendingPaid || 0) +
    Number(admissionPayment.tuitionPaid || 0) +
    Number(admissionPayment.otherfeePaid || 0) +
    Number(admissionPayment.monthlyPaid || 0);

  const balance = totalDue - totalPaid;

  setAdmissionPayment((prev) => ({
    ...prev,
    totalDue,
    totalPaid,
    balance,
  }));
}, [
  fee.tuition,
  fee.monthly,
  fee.admissionOneTime,
  fee.registration,
  fee.annual,
  fee.security,
  fee.previousPending,
  fee.other,

  // only these (paid inputs)
  admissionPayment.admissionPaid,
  admissionPayment.registrationPaid,
  admissionPayment.securityPaid,
  admissionPayment.annualPaid,
  admissionPayment.prevPendingPaid,
  admissionPayment.tuitionPaid,
  admissionPayment.otherfeePaid,
  admissionPayment.monthlyPaid,
]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
    
if(religion == ""){
  toast.error("Please select religion");
  return;
}


if(!imageFile && imageFile == null){
toast.error("Please upload profile photo");
return;
}

      const isFullScholarship =
  Scholarship && Number(scholarshipPercent) === 100;

if (!isFullScholarship) {

  if (!fee.tuition) {
    toast.error("Tuition Fee is required");
    setLoading(false);
    return;
  }

  if (!admissionPayment.tuitionPaid) {
    toast.error("Tuition Fee Paid is required");
    setLoading(false);
    return;
  }

  if (!fee.monthly) {
    toast.error("Monthly Fee is required");
    setLoading(false);
    return;
  }

  if (!admissionPayment.monthlyPaid) {
    toast.error("Monthly Fee Paid is required");
    setLoading(false);
    return;
  }

  if (!fee.admissionOneTime) {
    toast.error("Admission Fee is required");
    setLoading(false);
    return;
  }

  if (!admissionPayment.admissionPaid) {
    toast.error("Admission Fee Paid is required");
    setLoading(false);
    return;
  }

  if (!fee.registration) {
    toast.error("Registration Fee is required");
    setLoading(false);
    return;
  }

  if (!admissionPayment.registrationPaid) {
    toast.error("Registration Fee Paid is required");
    setLoading(false);
    return;
  }

  if (!fee.annual) {
    toast.error("Annual Fee is required");
    setLoading(false);
    return;
  }

  if (!admissionPayment.annualPaid) {
    toast.error("Annual Fee Paid is required");
    setLoading(false);
    return;
  }

  if (!fee.security) {
    toast.error("Security Fee is required");
    setLoading(false);
    return;
  }

  if (!admissionPayment.securityPaid) {
    toast.error("Security Fee Paid is required");
    setLoading(false);
    return;
  }
}


      const payload = {
        adminId: user?.adminId || adminId,
        headId: user?.id || headId,
        schoolId: user?.schoolId || schoolId,
        schoolName: user?.schoolName || schoolName,
        
        
        teacherId: selectedTeacher?.teacherId || selectedTeacher?.id || "",
        teacherName: teacherName || selectedTeacher?.name || selectedTeacher?.teacherName || "",
          scholarship: Scholarship,
  percentage: Scholarship ? Number(scholarshipPercent) : 0,
        // Student Basic Info
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        rollNo: onlyDigits(rollNo),
        gender: gender,
        dob: dob || "",
        religion: religion || "",
        email: studentEmail.trim().toLowerCase(),
        password: studentPassword, 
        imageUrl: imageFile,
        role: role,
        status: status,
        
        // Parent Info with Father & Mother
        parent: {
          name: parent.name.trim(),
          phone: onlyDigits(parent.phone),
          email: parent.email.trim().toLowerCase(),
          password: parent.password,
          address: parent.address.trim() || "",
          father: {
            name: parent.father.name,
            cnic: parent.father.cnic,
            mobile: onlyDigits(parent.father.mobile)
          },
          mother: {
            name: parent.mother.name,
            cnic: parent.mother.cnic,
            mobile: onlyDigits(parent.mother.mobile)
          }
        },
        
        // Academic Info
        classId: selectedClass,
        className: classes.find(c => c.id === selectedClass)?.name || selectedClass,
        group: isHighClassSelected ? selectedGroup : null,
        section: selectedSection,
        subjects: selectedSubjects,
        
        // Fee Structure
        fee: {
          admissionOneTime: parseInt(fee.admissionOneTime) || 0,
          security :parseInt(fee.security),
          tuition: parseInt(fee.tuition),
          dueDay: parseInt(fee.dueDay),
          monthly: parseInt(fee.monthly),
          previousPending: parseInt(fee.previousPending) || 0,
          registration: parseInt(fee.registration) || 0,
          annual: parseInt(fee.annual) || 0,
          other: parseInt(fee.other) || 0,
          
        },
        
        // Reminder Settings
        reminder: {
          enabled: reminder.enabled,
          daysBefore: reminder.enabled ? parseInt(reminder.daysBefore) : 0,
          channel: reminder.channel,
          security: reminder.security,
          tuition: reminder.tuition
        },
        
        // Admission Payment
        admissionPayment: {
          admissionPaid: parseInt(admissionPayment.admissionPaid) || 0,
          annualPaid: parseInt(admissionPayment.annualPaid) || 0,
          balance: admissionPayment.balance,
          depositDate: admissionPayment.depositDate || null,
          depositStatus: admissionPayment.depositStatus,
          monthlyPaid: parseInt(admissionPayment.monthlyPaid) || 0,
          
          prevPendingPaid: parseInt(admissionPayment.prevPendingPaid) || 0,
          registrationPaid: parseInt(admissionPayment.registrationPaid) || 0,
          remarks: admissionPayment.remarks || "",
          securityPaid: parseInt(admissionPayment.securityPaid) || 0,
          totalDue: admissionPayment.totalDue,
          totalPaid: admissionPayment.totalPaid,
             tuitionPaid: parseInt(admissionPayment.tuitionPaid) || 0,
  otherfeePaid: parseInt(admissionPayment.otherfeePaid) || 0,
    month: admissionPayment.month || null
        }
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
      setReligion("");
      setStudentEmail("");
      setStudentPassword("");
      setImageFile(null);
      setImagePreview("");
      setStatus("active");
      setSelectedTeacher(null);
      setTeacherName("");
     
      setParent({
        name: "", phone: "", email: "", password: "", address: "",
        father: { name: "", cnic: "", mobile: "" },
        mother: { name: "", cnic: "", mobile: "" }
      });
      
      setSelectedClass("");
      setSelectedGroup("");
      setSelectedSection("");
      setSelectedSubjects([]);
      setExtraSubjects([]);
      
      setFee({
        admissionOneTime: "",
        monthly: "",
        dueDay: "5",
        outstanding: 0,
        previousPending: 0,
        registration: "",
        annual: "",
        other: "",
          security: "",
  tuition: ""
      });
      
      setReminder({
        enabled: true,
        daysBefore: "3",
        channel: "WhatsApp",
        security: false,
        tuition: true
      });
      
      setAdmissionPayment({
     admissionPaid: "",
    annualPaid: "",
    balance: 0,
    depositDate: "",
    depositStatus: "",
    monthlyPaid: 0,
    prevPendingPaid: 0,
    registrationPaid: "",
    remarks: "",
    securityPaid: "",
    totalDue: 0,
    totalPaid: 0,
    tuitionPaid: 0,
    otherfeePaid: "",
     month: "",
      });
      
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



const fetchClasses= async()=>{

  try{
const res= await getclasses(schoolId)
console.log("my classes",res.data.data)
setClasses(res.data.data)
  }
  catch (err) {
    console.log(err)
  }
}

useEffect(() => {
  if (schoolId) {
    fetchClasses();
  }
}, [schoolId]);


const handleAddClass = async () => {
  try {
    if (!newClass.trim()) {
      return alert("Please enter class");
    }

    if (!newSection.trim()) {
      return alert("Please enter section");
    }

    const payload = {
      adminId: user?.adminId || adminId,
      headId: user?.id || headId,
      schoolId: user?.schoolId || schoolId,
      class: newClass.trim(),
      section: newSection.trim(),
    };

    const res = await addClass(payload);

    alert(res.data.message);

    // Refresh dropdown
    fetchClasses();

    // Reset inputs
    setNewClass("");
    setNewSection("");
  } catch (err) {
    console.error(err);

    alert(err?.response?.data?.error || "Something went wrong");
  }
};

const classSectionMap = classes.reduce((acc, c) => {
  const clsName = String(c.class).trim();      // exact class name
  const sec = String(c.section).trim();        // exact section

  if (!acc[clsName]) acc[clsName] = [];
  if (!acc[clsName].includes(sec)) {
    acc[clsName].push(sec);
  }
  return acc;
}, {});



  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer position="top-right" autoClose={5000} theme="light" />

      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Admission</h1>
          <p className="text-gray-500 mt-1 text-sm">{schoolName || "School Management System"}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          
          {/* Teacher Incharge */}
          <div className="border-b pb-4">
            <div  className="flex items-center gap-2">

              <div className="w-3 h-3 rounded-full bg-[rgb(209,37,37)] flex items-center justify-center text-white text-xs">
  
</div>
   <h2 className="text-lg font-semibold ">Teacher Assignment</h2>
            </div>
         
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Teacher Incharge *</label>
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
                      setTeacherName(t?.name || t?.teacherName || "");
                    }}
                    className={inputCls}
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => {
                      const tid = t.teacherId || t.id || t.docId;
                      const name = t.name || t.teacherName || tid;
                      return <option key={tid} value={tid}>{name} - Class:  {t.class}{t.section}  </option>;
                    })}
                  </select>
                )}
              </div>
              <div>
                <label className={labelCls}>Teacher Name</label>
                <input type="text" value={teacherName} readOnly className={`${inputCls} bg-gray-100`} />
              </div>
            </div>
          </div>

          {/* Student Basic Info */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4">Student Information</h2>
     
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             
              <div> 
               
 
      <label className={labelCls}>  First Name *</label>
               
          
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputCls} />
              </div>
              <div> 
                <label className={labelCls}>Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
              </div>
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
              <div>
                <label className={labelCls}>Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} />
              </div>
           <div>
  <label className={labelCls}>Religion</label>

  <select
    value={religion}
    onChange={(e) => setReligion(e.target.value)}
    className={inputCls}
  >
    <option value="">Select Religion</option>
    <option value="Islam">Islam</option>
    <option value="Christianity">Christianity</option>
    <option value="Hinduism">Hinduism</option>
    <option value="Buddhism">Buddhism</option>
    <option value="Sikhism">Sikhism</option>
    <option value="Judaism">Judaism</option>
    <option value="Jainism">Jainism</option>
    <option value="Other">Other</option>
  </select>
</div>
              <div>
                <label className={labelCls}>Student Email *</label>
                <input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Password *</label>
                <input type="password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Profile Photo</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm" />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>
            </div>
          </div>

          {/* Parent Info */}
          <div className="border-b pb-4 ">

               <div  className="flex items-center gap-2  mb-3">

              <div className="w-3 h-3 rounded-full bg-[rgb(0,0,0)] flex items-center justify-center text-white text-xs">
  
</div>
  <h2 className="text-lg font-semibold">Parent / Guardian Information</h2>
            </div>
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input type="text" value={parent.name} onChange={(e) => setParent({...parent, name: e.target.value})} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <input type="tel" value={parent.phone} onChange={(e) => setParent({...parent, phone: onlyDigits(e.target.value)})} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" value={parent.email} onChange={(e) => setParent({...parent, email: e.target.value})} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Password *</label>
                <input type="password" value={parent.password} onChange={(e) => setParent({...parent, password: e.target.value})} required className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Address</label>
                <textarea value={parent.address} onChange={(e) => setParent({...parent, address: e.target.value})} rows={2} className={inputCls} />
              </div>
            </div>

            {/* Father Info */}
            <h3 className="text-md font-semibold mt-4 mb-2">Father's Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Father Name</label>
                <input type="text" value={parent.father.name} onChange={(e) => setParent({...parent, father: {...parent.father, name: e.target.value}})} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>CNIC</label>
                <input type="text" value={parent.father.cnic} onChange={(e) => setParent({...parent, father: {...parent.father, cnic: e.target.value}})} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mobile</label>
                <input type="tel" value={parent.father.mobile} onChange={(e) => setParent({...parent, father: {...parent.father, mobile: onlyDigits(e.target.value)}})} className={inputCls} />
              </div>
            </div>

            {/* Mother Info */}
            <h3 className="text-md font-semibold mt-4 mb-2">Mother's Information <span className="text-[rgb(90,88,74)]">(optional)</span> </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Mother Name </label>
                <input type="text" value={parent.mother.name} onChange={(e) => setParent({...parent, mother: {...parent.mother, name: e.target.value}})} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>CNIC</label>
                <input type="text" value={parent.mother.cnic} onChange={(e) => setParent({...parent, mother: {...parent.mother, cnic: e.target.value}})} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mobile</label>
                <input type="tel" value={parent.mother.mobile} onChange={(e) => setParent({...parent, mother: {...parent.mother, mobile: onlyDigits(e.target.value)}})} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="border-b pb-4">

                <div  className="flex items-center gap-2  mb-3">

              <div className="w-3 h-3 rounded-full bg-[rgb(255,0,191)] flex items-center justify-center text-white text-xs">
  
</div>
             <h2 className="text-lg font-semibold ">Academic Information</h2>
            </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  {/* Class */}
  <div>
    <label className={labelCls}>Class *</label>

  <select
  value={selectedClass}
  onChange={(e) => {
    setSelectedClass(e.target.value);
    handleClassChange(e.target.value);
  }}
  className={inputCls}
  required
>
  <option value="">Select Class</option>
  {Object.keys(classSectionMap).map((cls) => (
    <option key={cls} value={cls}>
      {cls}
    </option>
  ))}
</select>

    <input
      type="text"
      placeholder="Add New Class"
      value={newClass}
      onChange={(e) => setNewClass(e.target.value)}
      className={`${inputCls} mt-2`}
    />
  </div>

  {/* Section */}
  <div>
    <label className={labelCls}>Section *</label>

<select
  value={selectedSection}
  onChange={(e) => setSelectedSection(e.target.value)}
  className={inputCls}
  required
>
  <option value="">Select Section</option>
  {(classSectionMap[selectedClass] || []).map((s) => (
    <option key={s} value={s}>
      {s}
    </option>
  ))}
</select>

  <input
  type="text"
  placeholder="Add New Section"
  value={newSection}
  maxLength={1}
  onChange={(e) =>
    setNewSection(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase())
  }
  className={`${inputCls} mt-2`}
/>
  </div>

</div>

<div className="mt-4">
  <button
    type="button"
    onClick={handleAddClass}
    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    Add Class
  </button>
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

            {selectedClass && (!isHighClassSelected || selectedGroup) && (
              <div className="mt-4">
                <label className={labelCls}>Subjects*</label>
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

          {/* Fee Structure */}
          <div className="border-b pb-4">

  <div  className="flex items-center gap-2  mb-3">

              <div className="w-3 h-3 rounded-full bg-[rgb(245,167,0)] flex items-center justify-center text-white text-xs">
  
</div>
           <h2 className="text-lg font-semibold ">Fee Structure</h2>
            </div>

          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className={labelCls}>Tuition Fee *</label>
               <input
  type="number"
  value={fee.tuition || ""}
  onChange={(e) =>
    setFee({ ...fee, tuition: e.target.value })
  }
  required
  className={inputCls}
/>
              </div>
              <div> 
                <label className={labelCls}>Monthly Fee *</label>
                <input type="number" value={fee.monthly} onChange={(e) => setFee({...fee, monthly: e.target.value})} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Admission Fee (One Time)</label>
                <input type="number" value={fee.admissionOneTime} onChange={(e) => setFee({...fee, admissionOneTime: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Registration Fee</label>
                <input type="number" value={fee.registration} onChange={(e) => setFee({...fee, registration: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Annual Fee</label>
                <input type="number" value={fee.annual} onChange={(e) => setFee({...fee, annual: e.target.value})} className={inputCls} />
              </div>

                 <div>
                <label className={labelCls}>Security Fee</label>
                <input type="number" value={fee.security} onChange={(e) => setFee({...fee, security: e.target.value})} className={inputCls} />
              </div>
           
              <div>
                <label className={labelCls}>Previous Pending</label>
                <input type="number" value={fee.previousPending} onChange={(e) => setFee({...fee, previousPending: e.target.value})} className={inputCls} />
              </div>
                 <div>
                <label className={labelCls}>Other Fees (Optional)</label>
                <input type="number" value={fee.other} onChange={(e) => setFee({...fee, other: e.target.value})} className={inputCls} />
              </div>
            
            
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="border-b pb-4">

            
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              
              <div className="flex flex-col gap-4">
<div className="space-y-3">
  <label className="flex items-center gap-3 cursor-pointer">
    <span className="text-sm font-medium">Scholarship</span>

    <button
      type="button"
      onClick={() => {
        setScholarship(!Scholarship);

        if (Scholarship) {
          setScholarshipPercent("");
        }
      }}
      className={`relative w-8 h-4 rounded-full transition ${
        Scholarship ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition ${
        Scholarship ? "left-4" : "left-0.5"
        }`}
      />
    </button>
  </label>

  {Scholarship && (
    <select
      value={scholarshipPercent}
      onChange={(e) => setScholarshipPercent(e.target.value)}
      className={inputCls}
    >
      <option value="">Select Scholarship</option>
      <option value="25">25%</option>
      <option value="50">50%</option>
      <option value="75">75%</option>
      <option value="100">100%</option>
    </select>
  )}
</div>


                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={reminder.enabled} onChange={(e) => setReminder({...reminder, enabled: e.target.checked})} />
                  Enable Auto Reminder
                </label>  



              </div>
              {reminder.enabled && (
                <>
                  <div>
                <label className={labelCls}>Due Day *</label>
                <select value={fee.dueDay} onChange={(e) => setFee({...fee, dueDay: e.target.value})} className={inputCls}>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>Day {d}</option>)}
                </select>
              </div>
                  <div>
                    <label className={labelCls}>Days Before Due</label>
                    <input type="number" value={reminder.daysBefore} onChange={(e) => setReminder({...reminder, daysBefore: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Notification Channel</label>
                    <select value={reminder.channel} onChange={(e) => setReminder({...reminder, channel: e.target.value})} className={inputCls}>
                      <option>WhatsApp</option>
                      <option>SMS</option>
                      <option>Email</option>
                      <option>All</option>
                    </select>
                  </div>
                 
                
                </>
              )}
            </div>
          </div>

          {
            Scholarship && 
            <div className="border-b pb-4">
  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border rounded-xl p-4 md:p-6 shadow-sm">
    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
      Payment Deductions
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Total Due */}
      <div className="bg-white rounded-lg p-4 border">
        <p className="text-sm text-gray-500">Total Due</p>
        <p className="text-2xl font-bold text-red-600">
          Rs. {admissionPayment.totalDue || 0}
        </p>
      </div>

      {/* After Scholarship */}
      <div className="bg-white rounded-lg p-4 border">
        <p className="text-sm text-gray-500">
         Due After {scholarshipPercent || 0}% Scholarship
        </p>
        <p className="text-2xl font-bold text-green-600">
       
   {(
  Number(admissionPayment.totalDue || 0) -
  (Number(admissionPayment.totalDue || 0) * Number(scholarshipPercent || 0)) / 100
)}
   
        </p>
      </div>
    </div>

    {/* Scholarship Amount */}
    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-purple-100 rounded-lg p-3">
      <span className="text-sm font-medium text-purple-700">
        Scholarship Deduction
      </span>

      <span className="text-lg font-bold text-purple-800">
        - Rs.{" "}
       {
                (Number(admissionPayment.totalDue || 0) * Number(scholarshipPercent || 0)) / 100
       }
      </span>
    </div>
  </div> 
</div>
          }


          {/* Admission Payment */}
          <div className="border-b pb-4">

  <div  className="flex items-center gap-2  mb-3">

              <div className="w-3 h-3 rounded-full bg-[rgb(120,12,221)] flex items-center justify-center text-white text-xs">
  
</div>
          <h2 className="text-lg font-semibold ">Admission Payment Details</h2>
            </div>

         
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
   <div>
    <div>
<label className={labelCls}>Tuition Fee Paid</label>
<p className="text-[rgb(255,5,5)] text-[12px] font-bold">
  Due : {
    Scholarship
      ? (Number(fee.tuition || 0) -
         (Number(fee.tuition || 0) * Number(scholarshipPercent || 0)) / 100)
      : Number(fee.tuition || 0)
  }
</p>

    </div>
                
                
                <input type="number" value={admissionPayment.tuitionPaid} onChange={(e) => setAdmissionPayment({...admissionPayment, tuitionPaid: e.target.value})} className={inputCls} />
              </div>

                     <div>
                      <div>
                <label className={labelCls}>Monthly Fee Paid</label>
<p className="text-[rgb(255,5,5)] text-[12px] font-bold">
  Due : {
    Scholarship
      ? (Number(fee.monthly || 0) -
         (Number(fee.monthly || 0) * Number(scholarshipPercent || 0)) / 100)
      : Number(fee.monthly || 0)
  }
</p>

                      </div>
                <input type="number"  value={admissionPayment.monthlyPaid ?? ""} onChange={(e) => setAdmissionPayment({...admissionPayment, monthlyPaid: e.target.value})} className={inputCls} />
              </div>

              <div>
                <div>
                <label className={labelCls}>Admission Fee Paid</label>
<p className="text-[rgb(255,5,5)] text-[12px] font-bold">
  Due : {
    Scholarship
      ? (Number(fee.admissionOneTime || 0) -
         (Number(fee.admissionOneTime || 0) * Number(scholarshipPercent || 0)) / 100)
      : Number(fee.admissionOneTime || 0)
  }
</p>

                </div>
                <input type="number" value={admissionPayment.admissionPaid} onChange={(e) => setAdmissionPayment({...admissionPayment, admissionPaid: e.target.value})} className={inputCls} />
              </div>
              <div>
                <div>
                <label className={labelCls}>Registration Fee Paid</label>
<p className="text-[rgb(255,5,5)] text-[12px] font-bold">
  Due : {
    Scholarship
      ? (Number(fee.registration || 0) -
         (Number(fee.registration || 0) * Number(scholarshipPercent || 0)) / 100)
      : Number(fee.registration || 0)
  }
</p>

                </div>
                <input type="number" value={admissionPayment.registrationPaid} onChange={(e) => setAdmissionPayment({...admissionPayment, registrationPaid: e.target.value})} className={inputCls} />
              </div>

               <div>


                <div>
                <label className={labelCls}>Annual Fee Paid</label>
<p className="text-[rgb(255,5,5)] text-[12px] font-bold">
  Due : {
    Scholarship
      ? (Number(fee.annual || 0) -
         (Number(fee.annual || 0) * Number(scholarshipPercent || 0)) / 100)
      : Number(fee.annual || 0)
  }
  </p>
                </div>
                <input type="number" value={admissionPayment.annualPaid} onChange={(e) => setAdmissionPayment({...admissionPayment, annualPaid: e.target.value})} className={inputCls} />
              </div>
              <div>
                <div>
                <label className={labelCls}>Security Fee Paid</label>
<p className="text-[rgb(255,5,5)] text-[12px] font-bold">
  Due : {
    Scholarship
      ? (Number(fee.security || 0) -
         (Number(fee.security || 0) * Number(scholarshipPercent || 0)) / 100)
      : Number(fee.security || 0)
  }
  </p>
                </div>
                <input type="number" value={admissionPayment.securityPaid} onChange={(e) => setAdmissionPayment({...admissionPayment, securityPaid: e.target.value})} className={inputCls} />
              </div>

            
             
              <div>
                <div>
                <label className={labelCls}>Previous Pending Paid</label>
<p className="text-[rgb(255,5,5)] text-[12px] font-bold">
  Due : {
    Scholarship
      ? (Number(fee.previousPending || 0) -
         (Number(fee.previousPending || 0) * Number(scholarshipPercent || 0)) / 100)
      : Number(fee.previousPending || 0)
  }
</p>
                </div>
                <input type="number" value={admissionPayment.prevPendingPaid} onChange={(e) => setAdmissionPayment({...admissionPayment, prevPendingPaid: e.target.value})} className={inputCls} />
              </div>

           

                 <div>
                  <div>
                <label className={labelCls}>Other Fee Paid</label>
<p className="text-[rgb(255,5,5)] text-[12px] font-bold">
  Due : {
    Scholarship
      ? (Number(fee.other || 0) -
         (Number(fee.other || 0) * Number(scholarshipPercent || 0)) / 100)
      : Number(fee.other || 0)
  }
</p>
                  </div>
                <input type="number" value={admissionPayment.otherfeePaid} onChange={(e) => setAdmissionPayment({...admissionPayment, otherfeePaid: e.target.value})} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Deposit Date</label>
                <input type="date" value={admissionPayment.depositDate} onChange={(e) => setAdmissionPayment({...admissionPayment, depositDate: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Deposit Status</label>
                <select value={admissionPayment.depositStatus} onChange={(e) => setAdmissionPayment({...admissionPayment, depositStatus: e.target.value})} className={inputCls}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Month and year</label>
                <input type="text" value={admissionPayment.month} onChange={(e) => 
                  setAdmissionPayment({...admissionPayment, month: e.target.value})} placeholder=" eg :January  2026" className={inputCls} />
              </div>





              <div className="md:col-span-2">
                <label className={labelCls}>Remarks</label>
                <textarea value={admissionPayment.remarks} onChange={(e) => setAdmissionPayment({...admissionPayment, remarks: e.target.value})} rows={2} className={inputCls} />
              </div>
            </div>
            
            {/* Payment Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Payment Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
  <span className="text-gray-600">Total Due:</span>
  <span className="font-bold">
    Rs. {
      Scholarship
        ? admissionPayment.totalDue -
          ((Number(admissionPayment.totalDue || 0) * Number(scholarshipPercent || 0)) / 100)
        : admissionPayment.totalDue
    }
  </span>
</div>
                <div><span className="text-gray-600">Total Paid:</span> <span className="font-bold text-green-600">Rs. {admissionPayment.totalPaid}</span></div>
              <div>
  <span className="text-gray-600">Balance:</span>
  <span
    className={`font-bold ${
      admissionPayment.balance > 0 ? "text-red-600" : "text-green-600"
    }`}
  >
    Rs. {
      admissionPayment.totalDue -
          ((Number(admissionPayment.totalDue || 0) * Number(scholarshipPercent || 0)) / 100) - admissionPayment.totalPaid
     
    }
  </span>
</div>
              </div>
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