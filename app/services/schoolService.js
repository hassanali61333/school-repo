import api from "./axios";

// ========================
// AUTH
// ========================
export const loginUser = (data) => api.post("/auth/login", data);
export const logoutUser = () => api.post("/auth/logout");

// ========================
// SUPER ADMIN
// ========================
export const getDashboard = () => api.get("/superadmin/dashboard");
export const getReports = () => api.get("/superadmin/reports");

// ========================
// SCHOOLS
// ========================
export const getAllSchools = () => api.get("/schools");
export const addSchool = (data) => api.post("/schools", data);
export const updateSchool = (id, data) => api.put(`/schools/${id}`, data);
export const deleteSchool = (id) => api.delete(`/schools/${id}`);

// ========================
// STUDENTS
// ========================
export const getAllStudents = (schoolId) => api.get(`/students?schoolId=${schoolId}`);
export const addStudent = (data) => api.post("/students", data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// ========================
// TEACHERS
// ========================
export const getAllTeachers = (schoolId) => api.get(`/teachers?schoolId=${schoolId}`);
export const addTeacher = (data) => api.post("/teachers", data);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);

// ========================
// STAFF
// ========================
export const getAllStaff = (schoolId) => api.get(`/staff?schoolId=${schoolId}`);
export const addStaff = (data) => api.post("/staff", data);
export const updateStaff = (id, data) => api.put(`/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/staff/${id}`);

// ========================
// ATTENDANCE
// ========================
export const getAttendance = (schoolId, date) => api.get(`/attendance?schoolId=${schoolId}&date=${date}`);
export const markAttendance = (data) => api.post("/attendance", data);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);

// ========================
// RESULTS
// ========================
export const getAllResults = (schoolId) => api.get(`/results?schoolId=${schoolId}`);
export const addResult = (data) => api.post("/results", data);
export const updateResult = (id, data) => api.put(`/results/${id}`, data);
export const deleteResult = (id) => api.delete(`/results/${id}`);

// ========================
// FEES
// ========================
export const getAllFees = (schoolId) => api.get(`/fees?schoolId=${schoolId}`);
export const addFees = (data) => api.post("/fees", data);
export const updateFees = (id, data) => api.put(`/fees/${id}`, data);
export const getDefaulters = (schoolId) => api.get(`/fees/defaulters?schoolId=${schoolId}`);

// ========================
// EXPENSES
// ========================
export const getAllExpenses = (schoolId) => api.get(`/expenses?schoolId=${schoolId}`);
export const addExpense = (data) => api.post("/expenses", data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// ========================
// SALARY
// ========================
export const getAllSalary = (schoolId) => api.get(`/salary?schoolId=${schoolId}`);
export const paySalary = (data) => api.post("/salary", data);
export const updateSalary = (id, data) => api.put(`/salary/${id}`, data);

// ========================
// NOTIFICATIONS
// ========================
export const getAllNotifications = (schoolId) => api.get(`/notifications?schoolId=${schoolId}`);
export const sendNotification = (data) => api.post("/notifications", data);
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// ========================
// STUDY MATERIAL
// ========================
export const getAllMaterial = (schoolId) => api.get(`/material?schoolId=${schoolId}`);
export const uploadMaterial = (data) => api.post("/material", data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const deleteMaterial = (id) => api.delete(`/material/${id}`);