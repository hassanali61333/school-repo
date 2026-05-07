"use client"
import React, { useState, useEffect } from 'react';
import { getAllSchools, deleteSchool, updateSchool ,getheadbyid} from '@/app/services/schoolService';
import { useDispatch } from 'react-redux';
import { deleteSchool as deleteSchoolRedux, updateSchool as updateSchoolRedux } from '@/app/store/schoolSlice';

export default function AllSchools() {
  const dispatch = useDispatch();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [head, sethead] = useState(null);


  // ✅ Edit states
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  


const fetchhead =async()=>{
  try{
const res = await getheadbyid(selectedSchool?.schoolId)
sethead(res.data.data)
console.log("head by school id",res)
  }
  catch (err) {
alert("error check console")
console.log(err.message)
  }
}

useEffect(()=>{
fetchhead()
},[selectedSchool?.schoolId])

  useEffect(() => { fetchSchools(); }, []);
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await getAllSchools();
      setSchools(response.data.data);
      sethead(response.data.data)
      setError(null);
    } catch (err) {
      setError('Failed to fetch schools');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit modal open
  const openEditModal = (e, school) => {
    e.stopPropagation();
    setEditData({
      schoolId: school.schoolId,
      schoolName: school.schoolName,
      displayName: school.displayName || "",
      address: school.address,
      establishedYear: school.establishedYear,
      schoolType: school.schoolType,
      facilities: school.facilities || {},
    });
    setEditImage(null);
    setEditModal(true);
  };

  // ✅ Edit submit
  const handleUpdate = async () => {
    if (!editData.schoolName || !editData.address) {
      alert("School name aur address zaroori hai!");
      return;
    }

    setUpdating(true);

    try {
      const form = new FormData();
      form.append("schoolId", editData.schoolId);
      form.append("schoolName", editData.schoolName);
      form.append("displayName", editData.displayName);
      form.append("address", editData.address);
      form.append("establishedYear", editData.establishedYear);
      form.append("schoolType", editData.schoolType);
      form.append("facilities", JSON.stringify(editData.facilities));

      if (editImage) {
        form.append("image", editImage);
      }

      const res = await updateSchool(form);

      if (res.data.success) {
        // ✅ Local state update
        setSchools(schools.map(s =>
          s.schoolId === editData.schoolId ? res.data.data : s
        ));
        // ✅ Redux update
        dispatch(updateSchoolRedux(res.data.data));
        alert("✅ School updated successfully!");
        setEditModal(false);
      }

    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }

    setUpdating(false);
  };

  const handleDelete = async (e, schoolId) => {
    e.stopPropagation();
    if (!confirm("Is school ko delete karna chahte ho?")) return;
    setDeletingId(schoolId);
    try {
      const res = await deleteSchool(schoolId);
      if (res.data.success) {
        setSchools(schools.filter(s => s.schoolId !== schoolId));
        dispatch(deleteSchoolRedux(schoolId));
        if (selectedSchool?.schoolId === schoolId) setSelectedSchool(null);
        alert("✅ School deleted!");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
    setDeletingId(null);
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: "8px",
    border: "1px solid #e5e7eb", fontSize: "14px", outline: "none",
    boxSizing: "border-box", marginTop: "4px",
  };

  const facilityOptions = [
    { key: 'library', label: 'Library' },
    { key: 'sportsComplex', label: 'Sports Complex' },
    { key: 'hostel', label: 'Hostel' },
    { key: 'cafeteria', label: 'Cafeteria' },
    { key: 'transportation', label: 'Transportation' },
    { key: 'laboratories', label: 'Laboratories' },
    { key: 'auditorium', label: 'Auditorium' },
    { key: 'smartClassrooms', label: 'Smart Classrooms' },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">Loading schools...</p>
    </div>
  );

  console.log("schools data", selectedSchool);

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={fetchSchools} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Retry</button>
    </div>
  );

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">All Schools</h1>

        {schools.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No schools found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools?.map((school) => (
              <div key={school.schoolId}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => setSelectedSchool(school)}
              >
                {school.image ? (
                  <div className="h-48 overflow-hidden">
                    <img src={`data:${school.image.type};base64,${school.image.base64}`}
                      alt={school.schoolName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500">No Image</div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{school.displayName || school.schoolName}</h3>
                  <p className="text-gray-600 text-sm mb-2">{school.address}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">{school.schoolType}</span>
                  {school.establishedYear && (
                    <p className="text-gray-500 text-xs mb-3">Established: {school.establishedYear}</p>
                  )}

                  {/* ✅ Edit + Delete buttons */}
                  <div className="flex gap-2 mt-3">
                    <button onClick={(e) => openEditModal(e, school)}
                      className="flex-1 py-2 rounded-lg border border-blue-200 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors">
                      ✏️ Edit
                    </button>
                    <button onClick={(e) => handleDelete(e, school.schoolId)}
                      disabled={deletingId === school.schoolId}
                      className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50">
                      {deletingId === school.schoolId ? "Deleting..." : "🗑️ Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Edit Modal */}
      {editModal && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit School</h2>
              <button onClick={() => setEditModal(false)} className="text-gray-500 text-3xl leading-none">×</button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">School Name *</label>
                <input style={inputStyle} value={editData.schoolName}
                  onChange={(e) => setEditData({ ...editData, schoolName: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Display Name</label>
                <input style={inputStyle} value={editData.displayName}
                  onChange={(e) => setEditData({ ...editData, displayName: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Address *</label>
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Established Year</label>
                <input type="number" style={inputStyle} value={editData.establishedYear}
                  onChange={(e) => setEditData({ ...editData, establishedYear: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">School Type</label>
                <select style={inputStyle} value={editData.schoolType}
                  onChange={(e) => setEditData({ ...editData, schoolType: e.target.value })}>
                  <option value="">Select type</option>
                  <option value="public">Public School</option>
                  <option value="private">Private School</option>
                  <option value="international">International School</option>
                  <option value="boarding">Boarding School</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">School Image</label>
                <input type="file" accept="image/*" style={inputStyle}
                  onChange={(e) => setEditImage(e.target.files[0])} />
              </div>

              {/* Facilities */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Facilities</label>
                <div className="grid grid-cols-2 gap-2">
                  {facilityOptions.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={editData.facilities?.[key] || false}
                        onChange={(e) => setEditData({
                          ...editData,
                          facilities: { ...editData.facilities, [key]: e.target.checked }
                        })} />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={handleUpdate} disabled={updating}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                  {updating ? "Updating..." : "✅ Update School"}
                </button>
                <button onClick={() => setEditModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal — same as before */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSchool(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedSchool.displayName || selectedSchool.schoolName}</h2>
              <div className="flex gap-2">
                <button onClick={(e) => { setSelectedSchool(null); openEditModal(e, selectedSchool); }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  ✏️ Edit
                </button>
                <button onClick={(e) => handleDelete(e, selectedSchool.schoolId)}
                  disabled={deletingId === selectedSchool.schoolId}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {deletingId === selectedSchool.schoolId ? "Deleting..." : "🗑️ Delete"}
                </button>
                <button onClick={() => setSelectedSchool(null)} className="text-gray-500 text-3xl leading-none">×</button>
              </div>
            </div>
            <div className="p-6">
              {selectedSchool.image && (
                <img src={`data:${selectedSchool.image.type};base64,${selectedSchool.image.base64}`}
                  alt={selectedSchool.schoolName} className="w-full h-64 object-cover rounded-lg mb-6" />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold mb-3">School Details</h3>
                  <div><span className="text-sm text-gray-500">School ID:</span><p>{selectedSchool.schoolId}</p></div>
                  <div><span className="text-sm text-gray-500">Admin ID:</span><p>{selectedSchool.adminId}</p></div>
                  <div><span className="text-sm text-gray-500">Full Name:</span><p>{selectedSchool.schoolName}</p></div>
                  <div><span className="text-sm text-gray-500">Address:</span><p>{selectedSchool.address}</p></div>
                  <div><span className="text-sm text-gray-500">Established:</span><p>{selectedSchool.establishedYear}</p></div>
                  <div><span className="text-sm text-gray-500">School Type:</span><p>{selectedSchool.schoolType}</p></div>
                <div className="text-sm text-gray-500"><p>Head Information</p></div>
                {head? <div><p>  <span className='text-[rgb(0,32,194)] text-[16px]'>Name</span>  :{head.name}</p>
                <p> <span className='text-[rgb(0,32,194)] text-[16px]'>E-mail</span> :{head.email}</p>
                <p> <span className='text-[rgb(0,32,194)] text-[16px]'>Phone</span> :{head.phone}</p>
          

                </div> 
                :

<p className='text-[rgb(255,1,1)]'> ✗not head assign</p>

}
              
                </div>
                 



                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Facilities</h3>
                  <div className="space-y-2">
                    {facilityOptions.map(({ key, label }) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-700">{label}:</span>
                        <span className={`font-semibold ${selectedSchool.facilities?.[key] ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedSchool.facilities?.[key] ? '✓ Available' : '✗ Not Available'}
                        </span>
                      </div>
                    ))}
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