"use client";

import { useDispatch, useSelector } from "react-redux";
import { getSchoolById ,getstaff} from "../services/schoolService";
import { setAdminID, setLoginAdmin } from "../store/userSlice";
import { useEffect, useState } from "react";

export default function SchoolHeadDashboard() {
  const dispatch = useDispatch();
  const [toast,       setToast]       = useState(null);
  const [school, setSchool] = useState([]);
  const [staff, setStaff] = useState([]);
  

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("LoginAdmin");

    if (storedUser) {
      const user = JSON.parse(storedUser);

      dispatch(setLoginAdmin(user));
      dispatch(setAdminID(user.adminId));
    }
  }, [dispatch]);
  const admin = useSelector((state) => state.users.loginAdmin);
  const fetchschool = async () => {
    try {
      const response = await getSchoolById(admin.schoolId);

      setSchool(response.data.data);

      console.log("School for Head:", response.data.data);
    } catch (error) {
      console.error("Error fetching school:", error);
    }
  };

  useEffect(() => {
    if (admin?.schoolId) {
      fetchschool();
    }
  }, [admin]);

   const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

const fetchStaff = async () => {
  try {
    if (!admin?.schoolId) return;

    const res = await getstaff(admin.schoolId);

    console.log("Fetched staff:", res.data);
    setStaff(res.data.data || []);
  } catch (e) {
    console.log("Error fetching staff:", e);
  }
};

useEffect(() => {
  if (admin?.schoolId) {
    fetchStaff();
  }
}, [admin?.schoolId]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        School Head Dashboard
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* School Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:scale-105 transition duration-300">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            School Information
          </h2>


       <div className="space-y-4">
  {school?.map((item) => (
    <div key={item.schoolId}>
      <p className="text-gray-600">
        <span className="font-bold">School Name:</span>{" "}
        {item.schoolName}
      </p>

      <p className="text-gray-600">
        <span className="font-bold">School ID:</span>{" "}
        {item.schoolId}
      </p>
    </div>
  ))}
</div>
        </div>

        {/* Total Staff */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:scale-105 transition duration-300">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Total Staff
          </h2>

          <div className="flex items-center justify-center h-32">
            <span className="text-5xl font-bold text-green-600">
              {staff.length}
            </span>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:scale-105 transition duration-300">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Total Teachers
          </h2>

          <div className="flex items-center justify-center h-32">
            <span className="text-5xl font-bold text-purple-600">
              {school?.totalTeachers || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}