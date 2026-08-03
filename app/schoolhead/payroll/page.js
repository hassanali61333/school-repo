"use client";
import { useState } from "react";
import { Users, Wallet, FileCheck2, Info, GraduationCap, Briefcase, Loader2 } from "lucide-react";
import { getTeachers, getstaff } from "@/app/services/schoolService";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setloginuser } from "@/app/store/userSlice";

const AVATAR_COLORS = ["bg-orange-500", "bg-blue-600", "bg-emerald-500", "bg-violet-500"];

function fmt(n) {
  return (n || 0).toLocaleString("en-PK");
}

function Avatar({ name, index }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full ${color} flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0`}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

// small inline loader used in stat cards / list header
function MiniLoader({ className = "" }) {
  return <Loader2 className={`animate-spin ${className}`} size={14} />;
}

export default function Payroll() {
  const [activeTab, setActiveTab] = useState("teachers"); // "teachers" | "staff"
  const [locked, setLocked] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const teacherTotal = teachers.reduce((sum, t) => sum + (t.salary || 0), 0);
  const staffTotal = staff.reduce((sum, s) => sum + (s.salary || 0), 0);
  const totalExpense = teacherTotal + staffTotal;

  const activeList = activeTab === "teachers" ? teachers : staff;
  const activeLoading = activeTab === "teachers" ? loadingTeachers : loadingStaff;

  const handleLockAndSave = () => {
    setLocked(true);
    setTimeout(() => setLocked(false), 2000); // dummy reset, no real persistence
  };

  const dispatch = useDispatch();

  useEffect(() => {
    const stored = localStorage.getItem("loginuser");
    if (stored) {
      const user = JSON.parse(stored);
      dispatch(setloginuser(user));
    }
  }, [dispatch]);

  const admin = useSelector((s) => s.users.loginuser);
  console.log("Admin in TeacherPage:", admin);
  const schoolId = admin?.schoolId || "";

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const res = await getTeachers(schoolId);
      console.log("Fetched teachers:", res.data.data);
      setTeachers(res.data.data || []);
    } catch (error) {
      console.error("Failed to load teachers:", error);
      showToast("error", "Failed to load teacher list");
    } finally {
      setLoadingTeachers(false);
    }
  };

  useEffect(() => {
    if (schoolId) fetchTeachers();
  }, [schoolId]);

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const res = await getstaff(schoolId);
      console.log("Fetched staff:", res.data.data);
      setStaff(res.data.data || []);
    } catch (e) {
      showToast("error", "Failed to load staff list");
      console.error("Fetch error:", e);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchStaff();
    }
  }, [admin?.schoolId]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl font-medium mb-4 sm:mb-5 text-gray-900">Payroll</h1>

      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto space-y-4 sm:space-y-5">

        {/* ── Top row: Hero + Stat cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-5">

          {/* Hero: Live Estimate */}
          <div className="md:col-span-3 relative overflow-hidden rounded-3xl bg-gray-700 p-5 sm:p-6 text-white shadow-lg shadow-blue-200">
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10"></div>
            <div className="absolute top-10 right-16 h-16 w-16 rounded-full bg-white/10"></div>

            <div className="relative flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 bg-emerald-400/90 text-emerald-950 text-xs font-bold px-2.5 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-900 animate-pulse"></span>
                LIVE ESTIMATE
              </span>
              <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
                <Wallet size={18} />
              </div>
            </div>

            <p className="relative mt-4 text-sm font-medium text-blue-100">July 2026</p>
            <p className="relative text-3xl sm:text-4xl font-bold mt-1 flex items-center gap-2">
              PKR {fmt(totalExpense)}
              {(loadingTeachers || loadingStaff) && <MiniLoader className="text-blue-200" />}
            </p>
            <p className="relative text-xs text-blue-200 mt-1 tracking-wide">TOTAL SALARY EXPENSE</p>

            <div className="relative mt-4 flex items-start gap-2 bg-white/10 rounded-xl px-3.5 py-2.5 text-xs text-blue-100">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <span>Estimated payout based on current active records</span>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4">
            <div className="bg-violet-50 rounded-2xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Users size={16} className="text-violet-600" />
                </div>
                <span className="text-[11px] font-semibold text-violet-500 uppercase tracking-wide">
                  Teachers ({teachers.length})
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-violet-700 flex items-center gap-2">
                {loadingTeachers ? <MiniLoader className="text-violet-400" /> : `Rs ${fmt(teacherTotal)}`}
              </p>
            </div>

            <div className="bg-orange-50 rounded-2xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={16} className="text-orange-600" />
                </div>
                <span className="text-[11px] font-semibold text-orange-500 uppercase tracking-wide">
                  Staff ({staff.length})
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-orange-700 flex items-center gap-2">
                {loadingStaff ? <MiniLoader className="text-orange-400" /> : `Rs ${fmt(staffTotal)}`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Lock & Save Button ── */}
        <button
          onClick={handleLockAndSave}
          disabled={locked}
          className="w-full md:w-auto md:px-10 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-orange-200 transition-all active:scale-[0.98] disabled:opacity-70"
        >
          <FileCheck2 size={18} />
          {locked ? "Saved!" : "Lock & Save July 2026 Report"}
        </button>

        {/* ── Tabs ── */}
        <div className="flex gap-2 max-w-md md:max-w-xs">
          <button
            onClick={() => setActiveTab("teachers")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "teachers"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            <GraduationCap size={16} />
            Teachers
            <span className={`text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center ${
              activeTab === "teachers" ? "bg-white/25" : "bg-gray-100 text-gray-500"
            }`}>
              {loadingTeachers ? <MiniLoader size={10} /> : teachers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "staff"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            <Briefcase size={16} />
            Staff
            <span className={`text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center ${
              activeTab === "staff" ? "bg-white/25" : "bg-gray-100 text-gray-500"
            }`}>
              {loadingStaff ? <MiniLoader size={10} /> : staff.length}
            </span>
          </button>
        </div>

        {/* ── List Header ── */}
        <div className="flex justify-between px-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          <span>{activeTab === "teachers" ? "Teacher" : "Staff"}</span>
          <span>Monthly Salary</span>
        </div>

        {/* ── List ── */}
        {activeLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <MiniLoader className="text-blue-500" />
            <p className="text-sm">Loading {activeTab === "teachers" ? "teachers" : "staff"}...</p>
          </div>
        ) : activeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <p className="text-sm">No {activeTab === "teachers" ? "teachers" : "staff"} found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
            {activeList.map((person, idx) => (
              <div
                key={person.id || person._id || idx}
                className="bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3 shadow-sm"
              >
                <span className="text-xs text-gray-300 font-medium w-5 flex-shrink-0">#{idx + 1}</span>
                <Avatar name={person.name} index={idx} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{person.name}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-blue-500 mt-0.5">
                    {activeTab === "teachers" ? <GraduationCap size={12} /> : <Briefcase size={12} />}
                    {person.role}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-orange-500">{fmt(person.salary)}</p>
                  <p className="text-[10px] text-gray-400">PKR / month</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}