import api from "./axios";

// ========================
// AUTH
export const signupAPI = (data) => {
  return api.post("/signup", data);
};



export const loginAPI = (data) => {
  return api.post("/login", data);
}

export const getAllSchools = (adminId) => {
  return api.get(`/addschool?adminId=${adminId}`);
};
export const addSchool = (data) => {
  return api.post("/addschool", data, {
    headers: {
      "Content-Type": "multipart/form-data", // FormData ke liye zaroori
    },
  });
};
export const getSchoolById = (schoolId) => {
  return api.get(`/sch-by-schId?schoolId=${schoolId}`);
}





export const deleteSchool = (schoolId) => {
  return api.delete(`/addschool?schoolId=${schoolId}`);
};


export const updateSchool = (data) => {
  return api.put("/addschool", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};


export const addSchoolHead = (data) => api.post("/addhead", data, { headers: {
      "Content-Type": "multipart/form-data", // FormData ke liye zaroori
    }},);
export const getAllHeads = (adminId) =>
  api.get(`/addhead?adminId=${adminId}`,);

export const getheadbyid = (schoolId) =>
  api.get(`/head-by-schId?schoolId=${schoolId}`);

export const deleteHead = (headId) =>
  api.delete(`/addhead?headId=${headId}`);

export const updateHead = (data) =>
  api.put("/addhead", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const addstaff = (data) =>
  api.post("/staff", data);


export const getstaff = (schoolId) =>
  api.get(`/staff?schoolId=${schoolId}`);


export const deletestaff = (docId) =>
  api.delete(`/staff?docId=${docId}`);


export const updatestaff = (data) =>
  api.put("/staff", data);


//===============================================teacher api================================================

export const addTeacher = (data) => {
  return api.post("/teacher", data);
};


export const getTeachers = (schoolId) => {
  return api.get(`/teacher?schoolId=${schoolId}`);
};


export const updateTeacher = (data) => {
  return api.put("/teacher", data);
};


export const deleteTeacher = (docId) => {
  return api.delete(`/teacher?docId=${docId}`);
};


//=====================================================students api================================================



// ---------------- GET ALL STUDENTS ----------------
export const getAllStudents = (schoolId) => {
  return api.get(`/students?schoolId=${schoolId}`);
};

// ---------------- GET STUDENT BY ID ----------------
export const getStudentById = (id) => {
  return api.get(`/studentbyId?id=${id}`);
};

// ---------------- CREATE STUDENT ----------------
export const createStudent = (data) => {
  return api.post("/students", data);
};

// ---------------- UPDATE STUDENT ----------------
export const updateStudent = (id, data) => {
  return api.put(`/studentbyId?id=${id}`, data);
};

// ---------------- DELETE STUDENT ----------------
export const deleteStudent = (id) => {
  return api.delete(`/studentbyId?id=${id}`);
};