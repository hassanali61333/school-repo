
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux'; // ✅ Added useDispatch
import { setAdminID } from '@/app/store/userSlice';
import { addSchool } from '@/app/services/schoolService.js';

// --- Helper Components (same as before) ---
const InputField = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '', error }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        placeholder={placeholder}
        className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
      />
    )}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const CheckboxCard = ({ label, checked, onChange, icon }) => (
  <div
    onClick={onChange}
    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
      checked
        ? 'border-blue-500 bg-blue-50 shadow-sm'
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
  >
    <div className={`text-2xl ${checked ? 'text-blue-600' : 'text-gray-400'}`}>{icon}</div>
    <span className={`text-sm font-medium ${checked ? 'text-blue-700' : 'text-gray-700'}`}>
      {label}
    </span>
    <div className="ml-auto">
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
        }`}
      >
        {checked && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </div>
  </div>
);

// --- Main Component ---
export default function SchoolRegistrationForm() {
  const router = useRouter();
  const dispatch = useDispatch(); // ✅ Added dispatch

  // ✅ Load adminId from localStorage to Redux on component mount
  useEffect(() => {
    const admin = localStorage.getItem("LoginAdmin");
    const adminId = localStorage.getItem("AdminID");
    
    if (admin && adminId) {
      dispatch(setAdminID(adminId));
      console.log("AdminID loaded to Redux:", adminId);
    }
  }, []);

  // ✅ Get adminID from Redux
  const adminID = useSelector((state) => state.users.adminID);
  console.log("AdminID from Redux:", adminID);

  const [formData, setFormData] = useState({
    schoolId: '',
    schoolName: '',
    displayName: '',
    address: '',
    establishedYear: '',
    schoolType: '',
    imageName: '',
    facilities: {
      library: false,
      sportsComplex: false,
      hostel: false,
      cafeteria: false,
      transportation: false,
      laboratories: false,
      auditorium: false,
      smartClassrooms: false,
    },
  });
const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Validation
  const validate = useCallback(() => {
    const newErrors = {};
    const currentYear = new Date().getFullYear();

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'School name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.establishedYear) {
      newErrors.establishedYear = 'Established year is required';
    } else {
      const year = parseInt(formData.establishedYear);
      if (isNaN(year) || year < 1850 || year > currentYear) {
        newErrors.establishedYear = `Year must be between 1850 and ${currentYear}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle facility toggle
  const toggleFacility = (facility) => {
    setFormData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [facility]: !prev.facilities[facility],
      },
    }));
  };

  // Handle form submission
 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!adminID) {
    alert("Admin not logged in");
    return;
  }

  setIsLoading(true);

  try {
    const data = new FormData();

    data.append("schoolName", formData.schoolName);
    data.append("address", formData.address);
    data.append("establishedYear", formData.establishedYear);
    data.append("schoolType", formData.schoolType);
    data.append("adminId", adminID);
    data.append("displayName",formData.displayName)
data.append("facilities", JSON.stringify(formData.facilities)); 
    // ✅ IMAGE FILE
    if (imageFile) {
      data.append("image", imageFile);
    }

    const res = await addSchool(data)
console.log("addschool",res.data.data.message)



if (res.data.success) {
  alert(res.data.data.message || "School added successfully");
} 


router.push("/superAdmin/allschool")
  

  } catch (err) {
   const message = err.response?.data?.error || "Something went wrong";
  alert(message);
    console.log(err);
  }

  setIsLoading(false);
};

  // Facility icons and labels
  const facilityOptions = [
    { key: 'library', label: 'Library', icon: '📚' },
    { key: 'sportsComplex', label: 'Sports Complex', icon: '⚽' },
    { key: 'hostel', label: 'Hostel', icon: '🏠' },
    { key: 'cafeteria', label: 'Cafeteria', icon: '🍔' },
    { key: 'transportation', label: 'Transportation', icon: '🚌' },
    { key: 'laboratories', label: 'Laboratories', icon: '🔬' },
    { key: 'auditorium', label: 'Auditorium', icon: '🎭' },
    { key: 'smartClassrooms', label: 'Smart Classrooms', icon: '📱' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Register New School</h1>
          <p className="mt-2 text-gray-500">Add a new educational institution to the platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-8 space-y-8">
              {/* Basic Information Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="School Name"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    placeholder="e.g., Springdale International School"
                    required
                    error={errors.schoolName}
                  />
                  <InputField
                    label="Display Name (Optional)"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="e.g., Springdale"
                  />
                  <div className="md:col-span-2">
                    <InputField
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      type="textarea"
                      placeholder="Full address of the school"
                      required
                      error={errors.address}
                    />
                  </div>
                  <InputField
                    label="Established Year"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleChange}
                    type="number"
                    placeholder="e.g., 1995"
                    required
                    error={errors.establishedYear}
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      School Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="schoolType"
                      value={formData.schoolType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="public">Public School</option>
                      <option value="private">Private School</option>
                      <option value="international">International School</option>
                      <option value="boarding">Boarding School</option>
                    </select>
                  </div>
                <div>
  <label className="text-sm font-medium text-gray-700 mb-1 block">
    School Image
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => setImageFile(e.target.files[0])}
    className="w-full border p-2 rounded-lg"
  />
</div>
                

                    <InputField
                    label="School ID (Optional - Auto-generated)"
                    name="schoolId"
                    value={formData.schoolId}
                    onChange={handleChange}
                    placeholder="Leave empty to auto-generate"
                  />
                </div>
              </div>

              {/* Facilities Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                  Facilities & Amenities
                </h2>
                <p className="text-sm text-gray-500 mb-4">Select all facilities available at the school</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {facilityOptions.map((facility) => (
                    <CheckboxCard
                      key={facility.key}
                      label={facility.label}
                      icon={facility.icon}
                      checked={formData.facilities[facility.key]}
                      onChange={() => toggleFacility(facility.key)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Register School
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}
      </div>
    </div>
  );
}