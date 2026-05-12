"use client";

import { useDispatch, useSelector } from "react-redux";
import { getSchoolByHeadId } from "../services/schoolService";
import { setAdminID, setLoginAdmin } from "../store/userSlice";
import { useEffect } from "react";
export default function SchoolHeadDashboard() {
const dispatch = useDispatch();

   useEffect(() => {
    const storedUser = localStorage.getItem("LoginAdmin");

    if (storedUser) {
      const user = JSON.parse(storedUser);

      // redux state set again
      dispatch(setLoginAdmin(user));

      // agar alag admin id store karni hai
      dispatch(setAdminID(user.adminId));
    }
  }, []);

const admin = useSelector((state) => state.users.loginAdmin);
console.log("Admin from Redux:", admin);
  const schoolData = [
    {
      schoolName: "Greenwood International School",
      schoolId: "SCH-001",
      totalStaff: 45,
      totalTeachers: 28
    }
  ];

//   const fetchschool =async () => {
//     try {
//       const response = await getSchoolByHeadId();
// console.log("Schools for Head:", response.data);
         
//     } catch (error) {
//       console.error("Error fetching schools:", error);
//     }   };

//     useEffect(() => {
//       if (adminID) {
//         fetchschool();
//       } else {
//         console.warn("Admin ID not found. Cannot fetch schools.");
//       }   
//     }, [adminID]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                School Head Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's your school overview</p>
            </div>
            <div className="bg-white rounded-full p-3 shadow-md">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">SH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards - Using Array Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schoolData.map((school, index) => (
            <div key={index}>
              {/* Card 1: School Name & ID */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <h3 className="text-white font-semibold text-lg">School Information</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">School Name</p>
                      <p className="text-xl font-bold text-gray-800">{school.schoolName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 rounded-lg p-2">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">School ID</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-gray-800 font-mono">{school.schoolId}</p>
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Staff */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                  <h3 className="text-white font-semibold text-lg">Total Staff</h3>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 mb-1">All Staff Members</p>
                    <p className="text-4xl font-bold text-gray-800">{school.totalStaff}</p>
                    <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 3: Total Teachers */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                  <h3 className="text-white font-semibold text-lg">Total Teachers</h3>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 mb-1">Teaching Faculty</p>
                    <p className="text-4xl font-bold text-gray-800">{school.totalTeachers}</p>
                    <p className="text-sm text-purple-600 mt-2">↑ 5% from last month</p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Add Staff</span>
            </div>
          </button>
          
          <button className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">View Reports</span>
            </div>
          </button>
          
          <button className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Calendar</span>
            </div>
          </button>
          
          <button className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Settings</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}