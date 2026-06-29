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




//=======================================================school timing api================================================

export const createSchoolTiming = (data) => {
  return api.post("/schTiming", data);
};

export const updateSchoolTiming = (data) => {
  return api.post("/schTiming", data); // same endpoint (create/update merge)
};

// GET
export const getSchoolTiming = (schoolId) => {
  return api.get(`/schTiming?schoolId=${schoolId}`);
};

// DELETE
export const deleteSchoolTiming = (schoolId) => {
  return api.delete(`/schTiming?schoolId=${schoolId}`);
};

//=====================================================class timetable api================================================


//=====================================================class timetable api================================================

// ---------------- CREATE / UPDATE SLOT ----------------
export const createClassTime = (data) => {
  return api.post("/classtimetable", data);
};

// ---------------- GET TIMETABLE ----------------
export const getClassTime = (schoolId, className, section) => {
  return api.get(
    `/classtimetable?schoolId=${schoolId}&class=${className}&section=${section}`
  );
};

// ---------------- DELETE SLOT ----------------
export const deleteClassTime = (slotId) => {
  return api.delete(`/classtimetable?slotId=${slotId}`);
};



export const updateClassTime = (slotId, data) => {
  return api.put('/classtimetable', { slotId, ...data });
};


//======================================================admission======================================
export const createAdmission = (data) => {
  return api.post("/admission", data);
};

// GET ALL STUDENTS
export const getStudents = (schoolId) => {
  console.log("Service: Fetching students for schoolId:", schoolId);
  return api.get(`/admission?schoolId=${schoolId}`);
};


export const updateStudent = (data) => {
  return api.put(`/admission?studentId=${data.studentId}`, data);
};  

// DELETE - Delete student (FIXED)
export const deleteStudent = (studentId) => {
  return api.delete(`/admission?studentId=${studentId}`);
};

