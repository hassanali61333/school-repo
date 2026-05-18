// pages/admission.js
"use client";
import { use, useEffect, useState } from "react";
import { createAdmission, getSchoolTiming, getTeachers } from "@/app/services/schoolService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { setloginuser, setuserId } from "@/app/store/userSlice";

export default function AdmissionScreen() {
  // Loading & UI States
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Account Info
  const [adminId, setAdminId] = useState("");
  const [headId, setHeadId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");

  // Teacher Info
  const [teacherId, setTeacherId] = useState("teacher789");
  const [teacherName, setTeacherName] = useState("Ms. Sarah Johnson");

  // Student Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // Parent Info
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [parentAddress, setParentAddress] = useState("");

  // Class Info
  const [selectedClass, setSelectedClass] = useState("");
  const [className, setClassName] = useState("");
  const [group, setGroup] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Image
  const [imageBase64, setImageBase64] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // Fees
  const [tuitionFee, setTuitionFee] = useState("0");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [admissionFee, setAdmissionFee] = useState("0");
  const [registrationFee, setRegistrationFee] = useState("0");
  const [securityFee, setSecurityFee] = useState("0");
  const [annualFee, setAnnualFee] = useState("0");
  const [otherFeeLabel, setOtherFeeLabel] = useState("");
  const [otherFeeAmount, setOtherFeeAmount] = useState("0");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Reminder
  const [dueDay, setDueDay] = useState("10");
  const [autoReminder, setAutoReminder] = useState(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState("3");
  const [notifyVia, setNotifyVia] = useState("SMS");
  const dispatch = useDispatch();

  useEffect(() => {
    const stored = localStorage.getItem("loginuser");
    if (stored) {
      const user = JSON.parse(stored);
      dispatch(setloginuser(user));
      dispatch(setuserId(user.id));
      // Auto-set schoolId from admin
      if (user.schoolId) {
        setSchoolId(user.schoolId);
      }
    }
  }, [dispatch]);
  const user = useSelector((state) => state.users.loginuser);





 
  const classes = [
    "Nursery",
    "KG",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
  ];
  const sections = ["A", "B", "C"];
  const groups = ["Science", "Commerce", "Arts"];

  const subjectsByGroup = {
    Science: [
      "Physics",
      "Chemistry",
      "Biology",
      "Mathematics",
      "Computer Science",
    ],
    Commerce: [
      "Accounting",
      "Economics",
      "Business Studies",
      "Mathematics",
      "Computer Science",
    ],
    Arts: [
      "History",
      "Geography",
      "Political Science",
      "Sociology",
      "Psychology",
    ],
  };

  // Helper functions
  const onlyDigits = (str) => {
    if (!str) return "";
    return String(str).replace(/\D/g, "");
  };

  const handleRollNoChange = (e) => {
    const value = onlyDigits(e.target.value);
    if (value.length <= 10) {
      setRollNo(value);
    }
  };

  const handlePhoneChange = (e) => {
    const value = onlyDigits(e.target.value);
    if (value.length <= 14) {
      setParentPhone(value);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClassChange = (e) => {
    const value = e.target.value;
    setSelectedClass(value);
    setClassName(value);
    setGroup("");
    setSelectedSubjects([]);
  };

  const handleGroupChange = (e) => {
    const value = e.target.value;
    setGroup(value);
    setSelectedSubjects([]);
  };

  const handleSubjectToggle = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!rollNo) newErrors.rollNo = "Roll number is required";
    if (rollNo.length < 1 || rollNo.length > 10)
      newErrors.rollNo = "Roll number must be 1-10 digits";
    if (!studentEmail) newErrors.studentEmail = "Student email is required";
    if (!studentEmail.includes("@"))
      newErrors.studentEmail = "Invalid email format";
    if (!studentPassword || studentPassword.length < 6)
      newErrors.studentPassword = "Password must be at least 6 characters";

    if (!parentName.trim()) newErrors.parentName = "Parent name is required";
    if (!parentPhone) newErrors.parentPhone = "Parent phone is required";
    if (parentPhone.length < 10 || parentPhone.length > 14)
      newErrors.parentPhone = "Phone must be 10-14 digits";
    if (!parentEmail) newErrors.parentEmail = "Parent email is required";
    if (!parentEmail.includes("@"))
      newErrors.parentEmail = "Invalid email format";
    if (!parentPassword || parentPassword.length < 6)
      newErrors.parentPassword = "Password must be at least 6 characters";

    if (!selectedClass) newErrors.selectedClass = "Class is required";
    if (!selectedSection) newErrors.selectedSection = "Section is required";
    if (selectedSubjects.length === 0)
      newErrors.selectedSubjects = "Select at least one subject";
    if (!monthlyFee || parseFloat(monthlyFee) <= 0)
      newErrors.monthlyFee = "Monthly fee must be greater than 0";

    const dd = parseInt(dueDay);
    if (dd < 1 || dd > 28) newErrors.dueDay = "Due day must be 1-28";

    return newErrors;
  };
  //============================================get taeachers===========================================

  const fetchTeachers = async () => {
    try {
      const response = await getTeachers(schoolId);

      console.log("Teachers fetched:", response.data);
      setTeachers(response?.data?.data || []);
    } catch (err) {
      showErrorToast(err?.response?.data || err.message);
      console.log(err?.response?.data || err.message);
    }
  };
  useEffect(() => {
    if (schoolId) fetchTeachers();
  }, [schoolId]);
console.log("Teachers in state:", selectedTeacher);
  //============================================craeate student===========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const errorMessage = Object.values(validationErrors).join("\n");
      setError(errorMessage);
      alert("❌ Validation Error:\n\n" + errorMessage);
      return;
    }

    setLoading(true);

    const payload = {
      adminId: user.adminId,
      headId: user.id,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
      teacherId: selectedTeacher?.teacherId ,
  teacherName: selectedTeacher?.name,
      firstName,
      lastName,
      rollNo, 
      gender,
      dob,
      studentEmail,
      studentPassword,
      parentName,
      parentPhone,
      parentEmail,
      parentPassword,
      parentAddress,
      selectedClass,
      className,
      group,
      selectedSection,
      selectedSubjects,
      imageBase64: imageBase64 || null,
      tuitionFee,
      monthlyFee,
      admissionFee,
      registrationFee,
      securityFee,
      annualFee,
      otherFeeLabel,
      otherFeeAmount,
      dueDay,
      autoReminder,
      reminderDaysBefore,
      notifyVia,
    };

    try {
      const response = await createAdmission(payload);

      // Check if response contains backend validation errors
      if (response.data && response.data.success === false) {
        setError(response.data.message);
        setLoading(false);
        return;
      }

      // Success case
      const successMsg =
        response.data.message || "Student successfully admitted!";
      setSuccessMessage(successMsg);
      toast.success(successMsg);
      alert("✅ Success!\n\n" + successMsg);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFirstName("");
        setLastName("");
        setRollNo("");
        setGender("Male");
        setDob("");
        setStudentEmail("");
        setStudentPassword("");
        setParentName("");
        setParentPhone("");
        setParentEmail("");
        setParentPassword("");
        setParentAddress("");
        setSelectedClass("");
        setClassName("");
        setGroup("");
        setSelectedSection("A");
        setSelectedSubjects([]);
        setImageBase64("");
        setImagePreview("");
        setMonthlyFee("");
        setTuitionFee("0");
        setAdmissionFee("0");
        setRegistrationFee("0");
        setSecurityFee("0");
        setAnnualFee("0");
        setOtherFeeLabel("");
        setOtherFeeAmount("0");
        setDueDay("10");
        setAutoReminder(true);
        setReminderDaysBefore("3");
        setNotifyVia("SMS");
        setCurrentStep(1);
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Admission error:", err);

      // Extract backend error message
      let errorMsg = "Failed to submit admission. Please try again.";

      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }

      // Handle specific error types with alert
      if (errorMsg.includes("Roll no") && errorMsg.includes("already exists")) {
        alert("❌ " + errorMsg);
      } else if (errorMsg.includes("email already exists")) {
        alert("❌ " + errorMsg);
      } else if (errorMsg.includes("password")) {
        alert("❌ Password validation failed:\n\n" + errorMsg);
      } else {
        alert("❌ Error:\n\n" + errorMsg);
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!firstName.trim()) {
        alert("Please enter student first name");
        return;
      }
      if (!rollNo) {
        alert("Please enter roll number");
        return;
      }
      if (!studentEmail) {
        alert("Please enter student email");
        return;
      }
      if (!studentEmail.includes("@")) {
        alert("Please enter valid student email");
        return;
      }
      if (!studentPassword || studentPassword.length < 6) {
        alert("Student password must be at least 6 characters");
        return;
      }
    }

    if (currentStep === 2) {
      if (!parentName.trim()) {
        alert("Please enter parent name");
        return;
      }
      if (!parentPhone) {
        alert("Please enter parent phone number");
        return;
      }
      if (parentPhone.length < 10 || parentPhone.length > 14) {
        alert("Parent phone must be 10-14 digits");
        return;
      }
      if (!parentEmail) {
        alert("Please enter parent email");
        return;
      }
      if (!parentEmail.includes("@")) {
        alert("Please enter valid parent email");
        return;
      }
      if (!parentPassword || parentPassword.length < 6) {
        alert("Parent password must be at least 6 characters");
        return;
      }
    }

    if (currentStep === 3) {
      if (!selectedClass) {
        alert("Please select a class");
        return;
      }
      if (!selectedSection) {
        alert("Please select a section");
        return;
      }
      if (selectedSubjects.length === 0) {
        alert("Please select at least one subject");
        return;
      }
    }

    if (currentStep === 4) {
      if (!monthlyFee || parseFloat(monthlyFee) <= 0) {
        alert("Monthly fee must be greater than 0");
        return;
      }
      const dd = parseInt(dueDay);
      if (dd < 1 || dd > 28) {
        alert("Due day must be between 1 and 28");
        return;
      }
    }

    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            New Student Admission
          </h1>
          <p className="text-gray-600 mt-1">
            Fill in the details to admit a new student
          </p>

          {/* Steps Indicator */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-semibold
                  ${currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}
                `}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${currentStep > step ? "bg-blue-600" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Student Info</span>
            <span>Parent Info</span>
            <span>Class & Subjects</span>
            <span>Fees</span>
            <span>Review</span>
          </div>
        </div>

    

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Student Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Student Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Assigning Teacher
  </label>

  <select
    value={selectedTeacher?.teacherId || ""}
    onChange={(e) => {
      const teacher = teachers.find(
        (t) => t.teacherId === e.target.value
      );

      setSelectedTeacher(teacher);
    }}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select Teacher</option>

    {teachers.map((teacher) => (
      <option key={teacher.teacherId} value={teacher.teacherId}>
        {teacher.name} - Class {teacher.class} ({teacher.section})
      </option>
    ))}
  </select>
</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll Number * (1-10 digits)
                    </label>
                    <input
                      type="text"
                      value={rollNo}
                      onChange={handleRollNoChange}
                      placeholder="e.g., 101"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Photo (Optional, max 2MB)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mt-2 h-20 w-20 object-cover rounded"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Email *
                    </label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Password * (min 6 chars)
                    </label>
                    <input
                      type="password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Parent Information */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Parent/Guardian Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Name *
                    </label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Phone * (10-14 digits)
                    </label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={handlePhoneChange}
                      placeholder="e.g., 03001234567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Email *
                    </label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Password * (min 6 chars)
                    </label>
                    <input
                      type="password"
                      value={parentPassword}
                      onChange={(e) => setParentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Address
                  </label>
                  <textarea
                    value={parentAddress}
                    onChange={(e) => setParentAddress(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Class & Subjects */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Class & Subjects</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class *
                    </label>
                    <select
                      value={selectedClass}
                      onChange={handleClassChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                   section *
                  </label>
                  <input
                    type="text"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    placeholder="e.g., A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                </div>

                {selectedClass && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group (for Class 9-10)
                    </label>
                    <select
                      value={group}
                      onChange={handleGroupChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Group</option>
                      {groups.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {group && subjectsByGroup[group] && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Subjects * (at least 1)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {subjectsByGroup[group].map((subject) => (
                        <label
                          key={subject}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubjects.includes(subject)}
                            onChange={() => handleSubjectToggle(subject)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{subject}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {!group && selectedClass && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Subjects *
                    </label>
                    <div className="text-gray-500 text-sm">
                      Subjects will be assigned by the school administrator
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Fees */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Fee Structure</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Fee *
                    </label>
                    <input
                      type="number"
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tuition Fee
                    </label>
                    <input
                      type="number"
                      value={tuitionFee}
                      onChange={(e) => setTuitionFee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Fee (One-time)
                    </label>
                    <input
                      type="number"
                      value={admissionFee}
                      onChange={(e) => setAdmissionFee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Fee
                    </label>
                    <input
                      type="number"
                      value={registrationFee}
                      onChange={(e) => setRegistrationFee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Security Fee
                    </label>
                    <input
                      type="number"
                      value={securityFee}
                      onChange={(e) => setSecurityFee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Fee
                    </label>
                    <input
                      type="number"
                      value={annualFee}
                      onChange={(e) => setAnnualFee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Fee Label
                    </label>
                    <input
                      type="text"
                      value={otherFeeLabel}
                      onChange={(e) => setOtherFeeLabel(e.target.value)}
                      placeholder="e.g., Library Fee"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Fee Amount
                    </label>
                    <input
                      type="number"
                      value={otherFeeAmount}
                      onChange={(e) => setOtherFeeAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fee Due Day (1-28) *
                    </label>
                    <input
                      type="number"
                      value={dueDay}
                      onChange={(e) => setDueDay(e.target.value)}
                      min="1"
                      max="28"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reminder Days Before Due
                    </label>
                    <input
                      type="number"
                      value={reminderDaysBefore}
                      onChange={(e) => setReminderDaysBefore(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={autoReminder}
                      onChange={(e) => setAutoReminder(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Enable Auto Reminder</span>
                  </label>

                  <select
                    value={notifyVia}
                    onChange={(e) => setNotifyVia(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SMS">SMS</option>
                    <option value="Email">Email</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold text-lg mb-2">
                    Student Details
                  </h3>
                  <p>
                    <strong>Name:</strong> {firstName} {lastName}
                  </p>
                  <p>
                    <strong>Roll No:</strong> {rollNo}
                  </p>
                  <p>
                    <strong>Gender:</strong> {gender}
                  </p>
                  <p>
                    <strong>Email:</strong> {studentEmail}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold text-lg mb-2">Parent Details</h3>
                  <p>
                    <strong>Name:</strong> {parentName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {parentPhone}
                  </p>
                  <p>
                    <strong>Email:</strong> {parentEmail}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold text-lg mb-2">
                    Academic Details
                  </h3>
                  <p>
                    <strong>Class:</strong> {selectedClass} - Section{" "}
                    {selectedSection}
                  </p>
                  {group && (
                    <p>
                      <strong>Group:</strong> {group}
                    </p>
                  )}
                  <p>
                    <strong>Subjects:</strong>{" "}
                    {selectedSubjects.join(", ") || "To be assigned"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold text-lg mb-2">Fee Details</h3>
                  <p>
                    <strong>Monthly Fee:</strong> PKR {monthlyFee}
                  </p>
                  <p>
                    <strong>Due Day:</strong> {dueDay} of each month
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "✓ Submit Admission"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
