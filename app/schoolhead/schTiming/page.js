"use client";

import { useEffect, useState } from "react";
import {
  createSchoolTiming,

  getSchoolTiming,
  updateSchoolTiming,
} from "@/app/services/schoolService";

import { useDispatch, useSelector } from "react-redux";
import { setAdminID, setLoginAdmin } from "@/app/store/userSlice";

export default function SchoolTimingPage() {
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);

  const dispatch = useDispatch();
  const admin = useSelector((s) => s.users.loginAdmin);

  useEffect(() => {
    const stored = localStorage.getItem("LoginAdmin");

    if (stored) {
      const user = JSON.parse(stored);
      dispatch(setLoginAdmin(user));
      dispatch(setAdminID(user.adminId));
    }
  }, [dispatch]);

  const schoolId = admin?.schoolId;

  // FETCH
  const fetchTiming = async () => {
    if (!schoolId) return;

    setLoading(true);

    try {
      const res = await getSchoolTiming(schoolId);
      const data = res?.data?.data;
      console.log("Fetched timing:", data);

      if (data?.openTime && data?.closeTime) {
        setOpenTime(data.openTime);
        setCloseTime(data.closeTime);
        setExists(true);
      } else {
        setOpenTime("");
        setCloseTime("");
        setExists(false);
      }
    } catch (err) {
      console.error(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) fetchTiming();
  }, [schoolId]);

  // SAVE
  const handleSave = async () => {
    if (!schoolId) return alert("Admin not loaded");
    if (!openTime || !closeTime) return alert("Fill both times");

    setLoading(true);

    const payload = { schoolId, openTime, closeTime };

    try {
      if (exists) {
        await updateSchoolTiming(payload);
        alert("update successfully")
      } else {
        await createSchoolTiming(payload);
        setExists(true);
      }

      await fetchTiming();
    } catch (err) {
      console.error(err?.response?.data || err.message);
      alert("Request failed");
    } finally {
      setLoading(false);
    }
  };

  // DELETE
 

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-slate-100">
      
      <h2 className="text-2xl font-bold mb-6">School Timing</h2>

      {/* OPEN TIME */}
      <div className="mb-4">
        <label className="text-sm font-semibold">Open Time</label>
        <input
          type="time"
          value={openTime}
          onChange={(e) => setOpenTime(e.target.value)}
          disabled={loading}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>

      {/* CLOSE TIME */}
      <div className="mb-4">
        <label className="text-sm font-semibold">Close Time</label>
        <input
          type="time"
          value={closeTime}
          onChange={(e) => setCloseTime(e.target.value)}
          disabled={loading}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="white"
              strokeWidth="4"
              opacity="0.25"
            />
            <path
              d="M4 12a8 8 0 018-8"
              stroke="white"
              strokeWidth="4"
              opacity="0.75"
            />
          </svg>
        )}

        {exists ? "Update" : "Create"}
      </button>

      {/* DELETE */}
    
    </div>
  );
}