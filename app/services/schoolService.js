import api from "./axios";

// ========================
// AUTH
export const signupAPI = (data) => {
  return api.post("/signup", data);
};



export const loginAPI = (data) => {
  return api.post("/login", data);
}

export const getAllSchools = () => {
  return api.get("/addschool");
};

export const addSchool = (data) => {
  return api.post("/addschool", data, {
    headers: {
      "Content-Type": "multipart/form-data", // FormData ke liye zaroori
    },
  });
};




export const deleteSchool = (schoolId) => {
  return api.delete(`/addschool?schoolId=${schoolId}`);
};


export const updateSchool = (data) => {
  return api.put("/addschool", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};


export const getAllHeads = (schoolId) => 
  api.get(schoolId ? `/addhead?schoolId=${schoolId}` : "/addhead");

export const addSchoolHead = (data) => 
  api.post("/addhead", data); // FormData automatically works

export const updateSchoolHead = (data) => 
  api.put("/addhead", data);

export const deleteSchoolHead = (headId) => 
  api.delete(`/addhead?headId=${headId}`);