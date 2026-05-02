
"use client"
import React, { useState, useEffect } from 'react';
import { getAllSchools } from '@/app/services/schoolService';

export default function AllSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await getAllSchools();
      console.log("schools",response.data.data)
      setSchools(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch schools');
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolClick = (school) => {
    setSelectedSchool(school);
  };

  const closeModal = () => {
    setSelectedSchool(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading schools...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchSchools} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          All Schools
        </h1>
        
        {schools.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No schools found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools?.map((school) => (
              <div 
                key={school.schoolId} 
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => handleSchoolClick(school)}
              >
{school.imageName ? (
  <div className="h-48 overflow-hidden">
    <img 
      src={`/api/images/${school.imageName}`}  
      alt={school.schoolName}                  
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.onerror = null;          
        e.target.style.display = 'none';      
        e.target.parentElement.innerHTML = '<div class="h-full flex items-center justify-center bg-gray-100 text-gray-500">Image not found</div>';
      }}
    />
  </div>
) : (
  <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500">
    Image not found
  </div>
)}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {school.displayName || school.schoolName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{school.address}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                    {school.schoolType}
                  </span>
                  {school.establishedYear && (
                    <p className="text-gray-500 text-xs mb-3">
                      Established: {school.establishedYear}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(school.facilities || {})
                      .filter(([_, value]) => value === true)
                      .slice(0, 3)
                      .map(([key]) => (
                        <span key={key} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      ))}
                    {Object.entries(school.facilities || {})
                      .filter(([_, value]) => value === true).length > 3 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        +{Object.entries(school.facilities).filter(([_, v]) => v === true).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for detailed view */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedSchool.displayName || selectedSchool.schoolName}
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {selectedSchool.imageName && (
                <div className="mb-6">
                  <img 
                    src={`/api/images/${selectedSchool.imageName}`}
                    alt={selectedSchool.schoolName}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">School Details</h3>
                  <div>
                    <span className="text-sm text-gray-500">School ID:</span>
                    <p className="text-gray-900">{selectedSchool.schoolId}</p>
                  </div>

                   <div>
                    <span className="text-sm text-gray-500">Admin ID:</span>
                    <p className="text-gray-900">{selectedSchool.adminId}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Full Name:</span>
                    <p className="text-gray-900">{selectedSchool.schoolName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Address:</span>
                    <p className="text-gray-900">{selectedSchool.address}</p>
                  </div>
                  {selectedSchool.establishedYear && (
                    <div>
                      <span className="text-sm text-gray-500">Established:</span>
                      <p className="text-gray-900">{selectedSchool.establishedYear}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-500">School Type:</span>
                    <p className="text-gray-900">{selectedSchool.schoolType}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Facilities</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Library:</span>
                      <span className={`font-semibold ${selectedSchool.facilities?.library ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedSchool.facilities?.library ? '✓ Available' : '✗ Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Sports Complex:</span>
                      <span className={`font-semibold ${selectedSchool.facilities?.sportsComplex ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedSchool.facilities?.sportsComplex ? '✓ Available' : '✗ Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Hostel:</span>
                      <span className={`font-semibold ${selectedSchool.facilities?.hostel ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedSchool.facilities?.hostel ? '✓ Available' : '✗ Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Cafeteria:</span>
                      <span className={`font-semibold ${selectedSchool.facilities?.cafeteria ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedSchool.facilities?.cafeteria ? '✓ Available' : '✗ Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Transportation:</span>
                      <span className={`font-semibold ${selectedSchool.facilities?.transportation ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedSchool.facilities?.transportation ? '✓ Available' : '✗ Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Laboratories:</span>
                      <span className={`font-semibold ${selectedSchool.facilities?.laboratories ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedSchool.facilities?.laboratories ? '✓ Available' : '✗ Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Auditorium:</span>
                      <span className={`font-semibold ${selectedSchool.facilities?.auditorium ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedSchool.facilities?.auditorium ? '✓ Available' : '✗ Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Smart Classrooms:</span>
                      <span className={`font-semibold ${selectedSchool.facilities?.smartClassrooms ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedSchool.facilities?.smartClassrooms ? '✓ Available' : '✗ Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}