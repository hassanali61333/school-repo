// app/schoolhead/classstime/page.js
'use client';

import React, { useState, useEffect } from 'react';
import {
  getTeachers,
  deleteClassTime,
  createClassTime,
  updateClassTime,
  getClassTime,
  getSchoolTiming,
  updateSchoolTiming,
  createSchoolTiming,
} from '@/app/services/schoolService';
import { setAdminID, setLoginAdmin, setloginuser, setuserId } from '@/app/store/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Add Font Awesome
import { data } from 'autoprefixer';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function ClassTimePage() {
  const dispatch = useDispatch();
  const admin = useSelector((s) => s.users.loginuser);

  // ========== SEPARATE STATE VARIABLES ==========
  
  // Filters
  const [schoolId, setSchoolId] = useState('');
  const [classValue, setClassValue] = useState('');
  const [section, setSection] = useState('');
  const [activeDay, setActiveDay] = useState('Monday');

  // Data states
  const [timetable, setTimetable] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [schoolTiming, setSchoolTiming] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ========== SEPARATE FORM STATES FOR CLASS TIME MODAL ==========
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  
  // Individual form fields for class time
  const [formDay, setFormDay] = useState('Monday');
  const [formPeriod, setFormPeriod] = useState(1);
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formTeacherName, setFormTeacherName] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('09:00');

  // ========== SEPARATE STATES FOR SCHOOL TIMING MODAL ==========
  const [isTimingModalOpen, setIsTimingModalOpen] = useState(false);
  const [timingExists, setTimingExists] = useState(false);
  
  // Individual form fields for school timing
  const [timingStartTime, setTimingStartTime] = useState('08:00');
  const [timingEndTime, setTimingEndTime] = useState('14:00');
  const [timingBreakStart, setTimingBreakStart] = useState('11:00');
  const [timingBreakEnd, setTimingBreakEnd] = useState('11:30');
  const [timingPeriodDuration, setTimingPeriodDuration] = useState(45);
  const [timingTotalPeriods, setTimingTotalPeriods] = useState(6);

  useEffect(() => {
    const stored = localStorage.getItem("loginuser");
    if (stored) {
      const user = JSON.parse(stored);
      dispatch(setloginuser(user));
      dispatch(setuserId(user.id));
      // Auto-set schoolId from admin
      if (user.schoolId) {
        setSchoolId(user.schoolId);
      }
    }
  }, [dispatch]);
  

  // Show notification using toast
  const showNotification = (message, type = 'success') => {
    switch(type) {
      case 'success':
        toast.success(message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      case 'error':
        toast.error(message, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      case 'info':
        toast.info(message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      default:
        toast(message);
    }
  };

  // ========== FETCH TEACHERS ==========
  const fetchTeachers = async () => {
    try {
      const response = await getTeachers(admin?.schoolId);
      const teachersList = response.data?.data || [];
      setTeachers(teachersList);
      console.log("Fetched teachers:", teachersList);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      setTeachers([]);
      showNotification('Failed to fetch teachers', 'error');
    }
  };

  useEffect(() => {
    if (admin?.schoolId) {
      fetchTeachers();
    }
  }, [admin?.schoolId]);

  // ========== FETCH SCHOOL TIMING ==========
  const fetchSchoolTiming = async () => {
    try {
      const response = await getSchoolTiming(admin?.schoolId);
      console.log("Fetched school timing:", response.data?.data);
      
      const data = response.data?.data;
      if (data && data.openTime) {
        setTimingStartTime(data.openTime);
        setTimingEndTime(data.closeTime);
        setTimingBreakStart(data.breakStart || '11:00');
        setTimingBreakEnd(data.breakEnd || '11:30');
        setTimingPeriodDuration(data.periodDuration || 45);
        setTimingTotalPeriods(data.totalPeriods || 6);
        setTimingExists(true);
      } else {
        setTimingExists(false);
      }
    } catch (error) {
      console.error('Failed to fetch school timing:', error);
      setTimingExists(false);
    }
  };

  useEffect(() => {
    if (admin?.schoolId) {
      fetchSchoolTiming();
    }
  }, [admin?.schoolId]);

  // ========== FETCH TIMETABLE ==========
  const fetchTimetable = async () => {
    if (!schoolId || !classValue || !section) return;
    
    setLoading(true);
    try {
      const response = await getClassTime(schoolId, classValue, section);
      console.log("Fetched timetable response:", response);
      
      // Handle different response formats
      let timetableData = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        timetableData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        timetableData = response.data;
      } else if (Array.isArray(response)) {
        timetableData = response;
      }
      
      setTimetable(timetableData);
      console.log("Set timetable data:", timetableData);
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
      setTimetable([]);
      showNotification('Failed to fetch timetable', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId && classValue && section) {
      fetchTimetable();
    }
  }, [schoolId, classValue, section]);

  // ========== RESET CLASS TIME FORM ==========
  const resetClassTimeForm = () => {
    setFormDay('Monday');
    setFormPeriod(1);
    setFormTeacherId('');
    setFormTeacherName('');
    setFormSubject('');
    setFormStartTime('08:00');
    setFormEndTime('09:00');
    setEditingSlot(null);
  };

  // ========== HANDLE ADD/EDIT CLASS TIME ==========
  const createslot = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Find selected teacher using teacherId
      const selectedTeacher = teachers.find(t => t.teacherId === formTeacherId);
      
      const slotData = {
        schoolId: admin?.schoolId,
        class: classValue,
        section: section,
        day: formDay,
        period: formPeriod,
        teacherId: formTeacherId,
        teacherName: selectedTeacher?.name || formTeacherName,
        subject: formSubject,
        startTime: formStartTime,
        endTime: formEndTime,
      };

      console.log("Saving slot data:", slotData);

      let response;
      if (editingSlot) {
        // UPDATE existing slot
        response = await updateClassTime(editingSlot.slotId || editingSlot.id, slotData);
        console.log("Update response:", response);
      } else {
        // CREATE new slot
        response = await createClassTime(slotData);
        console.log("Create response:", response);
      }
      
      if (response?.success || response?.data?.success) {
        showNotification(editingSlot ? 'Slot updated successfully!' : 'Slot added successfully!', 'success');
        setIsModalOpen(false);
        resetClassTimeForm();
        await fetchTimetable();
      } else {
        // Show error from backend
        showNotification(response?.error || 'Something went wrong', 'error');
      }
    } catch (error) {
      console.error('Failed to save slot:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Something went wrong';
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ========== HANDLE DELETE SLOT ==========
  const handleDeleteSlot = async (slot) => {
    if (!confirm(`Delete ${slot.subject} slot on ${slot.day} Period ${slot.period}?`)) return;

    try {
      const response = await deleteClassTime(slot.slotId || slot.id);
      console.log("Delete response:", response);
      
      if (response?.data?.success) {
        showNotification('Slot deleted successfully!', 'success');
        await fetchTimetable(); // Refresh the timetable
      } else {
        showNotification(response?.data?.error,  'error'); 

      }
    } catch (error) {
      console.error('Failed to delete slot:', error);
      showNotification('Failed to delete slot. Please try again.', 'error');
    }
  };

  // ========== HANDLE EDIT CLICK ==========
  const handleEditClick = (slot) => {
    console.log("Editing slot:", slot);
    setEditingSlot(slot);
    setFormDay(slot.day);
    setFormPeriod(slot.period);
    setFormTeacherId(slot.teacherId);
    setFormTeacherName(slot.teacherName || '');
    setFormSubject(slot.subject);
    setFormStartTime(slot.startTime || '08:00');
    setFormEndTime(slot.endTime || '09:00');
    setIsModalOpen(true);
  };

  // ========== HANDLE ADD CLICK ==========
  const handleAddClick = (day, period) => {
    resetClassTimeForm();
    setFormDay(day);
    setFormPeriod(period);
    setIsModalOpen(true);
  };

  // ========== HANDLE SCHOOL TIMING SAVE ==========
  const handleSchoolTimingSave = async () => {
    setSubmitting(true);
    
    try {
      const timingData = {
        schoolId: admin?.schoolId,
        openTime: timingStartTime,
        closeTime: timingEndTime,
        breakStart: timingBreakStart,
        breakEnd: timingBreakEnd,
        periodDuration: timingPeriodDuration,
        totalPeriods: timingTotalPeriods,
      };

      let response;
      if (timingExists) {
        response = await updateSchoolTiming(timingData);
      } else {
        response = await createSchoolTiming(timingData);
      }
      
      if (response?.success) {
        showNotification(timingExists ? 'School timing updated successfully!' : 'School timing created successfully!', 'success');
        setIsTimingModalOpen(false);
        fetchSchoolTiming();
      } else {
        throw new Error('Failed to save timing');
      }
    } catch (error) {
      console.error('Failed to save timing:', error);
      showNotification('Failed to save school timing.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getSlotForPeriod = (day, period) => {
    const slot = timetable.find(slot => slot.day === day && slot.period === period);
    return slot;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📚 Timetable Manager</h1>
              <p className="text-sm text-gray-500 mt-1">Manage class schedules and teacher assignments</p>
            </div>
            <button
              onClick={() => setIsTimingModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
                   <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Start Time</label>
                <input
                  type="time"
                  value={timingStartTime}
                  onChange={(e) => setTimingStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School End Time</label>
                <input
                  type="time"
                  value={timingEndTime}
                  onChange={(e) => setTimingEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <input
                type="text"
                value={classValue}
                onChange={(e) => setClassValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., A"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  if ( !classValue || !section) {
                    showNotification('Please enter  Class, and Section first', 'error');
                    return;
                  }
                  resetClassTimeForm();
                  setIsModalOpen(true);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i> Add Slot
              </button>
            </div>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeDay === day
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : !schoolId || !classValue || !section ? (
            <div className="flex justify-center items-center py-20 text-gray-500">
              <div className="text-center">
                <i className="fas fa-school text-4xl mb-3 opacity-50"></i>
                <p>Enter School ID, Class, and Section to view timetable</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {PERIODS.map((period) => {
                    const slot = getSlotForPeriod(activeDay, period);
                    return (
                      <tr key={period} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {period}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {slot?.startTime && slot?.endTime 
                            ? `${slot.startTime} - ${slot.endTime}`
                            : '--:-- - --:--'}
                        </td>
                        <td className="px-4 py-3">
                          {slot ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {slot.subject}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Not assigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {slot?.teacherName || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {slot ? (
                              <>
                                <button
                                  onClick={() => handleEditClick(slot)}
                                  className="text-indigo-600 hover:text-indigo-800 transition-colors p-1"
                                  title="Edit"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(slot)}
                                  className="text-red-600 hover:text-red-800 transition-colors p-1"
                                  title="Delete"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleAddClick(activeDay, period)}
                                className="text-green-600 hover:text-green-800 transition-colors p-1"
                                title="Add"
                              >
                                <i className="fas fa-plus-circle"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Quick Tips:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                <li>Enter Class and Section to load timetable</li>
                <li>Click <i className="fas fa-plus-circle"></i> to add a new slot for any period</li>
                <li>Click <i className="fas fa-edit"></i> to modify an existing slot</li>
                <li>Click <i className="fas fa-trash"></i> to remove a slot</li>
                <li>Use the School Timing button to configure period durations and break times</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingSlot ? 'Edit Slot' : 'Add New Slot'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetClassTimeForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={createslot} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select
                  value={formPeriod}
                  onChange={(e) => setFormPeriod(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {PERIODS.map(p => (
                    <option key={p} value={p}>Period {p}</option>
                  ))}
                </select>
              </div>
          
         <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
  <select
    value={formTeacherId}
    onChange={(e) => {
      const teacherId = e.target.value;
      const selectedTeacher = teachers.find(t => t.teacherId === teacherId);
      setFormTeacherId(teacherId);
      setFormTeacherName(selectedTeacher?.name || '');
      // Auto-fill subject when teacher is selected
      if (selectedTeacher?.primarySubject) {
        setFormSubject(selectedTeacher.primarySubject);
      } else {
        setFormSubject(''); // Clear subject if no primary subject
      }
    }}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
    required
  >
    <option value="">Select Teacher</option>
    {teachers.map(teacher => (
      <option key={teacher.teacherId} value={teacher.teacherId}>
        {teacher.name} {teacher.primarySubject ? `- ${teacher.primarySubject}` : ''}
      </option>
    ))}
  </select>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
  <input
    type="text"
    value={formSubject}
    onChange={(e) => setFormSubject(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
    placeholder="e.g., Mathematics"
    required
  />
</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetClassTimeForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingSlot ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* School Timing Modal */}
   
    </div>
  );
}