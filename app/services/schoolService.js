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