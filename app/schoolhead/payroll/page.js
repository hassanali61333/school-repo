"use client";
import { useState } from "react";
import { Users, FileCheck2,Wallet,Info, GraduationCap, Briefcase, Loader2, Calendar, TrendingUp, X } from "lucide-react";
import { getTeachers, getstaff, savePayrollReport, getPayrollReport } from "@/app/services/schoolService";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setloginuser } from "@/app/store/userSlice";

const AVATAR_COLORS = ["bg-orange-500", "bg-blue-600", "bg-emerald-500", "bg-violet-500"];

function fmt(n) {
  return (n || 0).toLocaleString("en-PK");
}

function monthKeyToLabel(key) {
  if (!key) return "";
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString("en-PK", { month: "long", year: "numeric" }); // "August 2026"
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
  const [reportSearched, setReportSearched] = useState(false);

  // ── Previous month report state ──
  const [monthKey, setMonthKey] = useState(""); // from <input type="month">, e.g. "2026-08"
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // true only when a previous report was searched AND we actually got one back
  const viewingReport = reportSearched && !!report;

  const teacherTotal = teachers.reduce((sum, t) => sum + (t.salary || 0), 0);
  const staffTotal = staff.reduce((sum, s) => sum + (s.salary || 0), 0);
  const totalExpense = teacherTotal + staffTotal;

  // When viewing a saved report, the list should come from the report's snapshot,
  // not from the live teachers/staff arrays.
  const reportTeachers = report?.teachers || [];
  const reportStaff = report?.staff || [];

  const activeList = viewingReport
    ? (activeTab === "teachers" ? reportTeachers : reportStaff)
    : (activeTab === "teachers" ? teachers : staff);

  const activeLoading = viewingReport
    ? false
    : (activeTab === "teachers" ? loadingTeachers : loadingStaff);

  const activeTeacherCount = viewingReport ? (report?.teacherCount ?? reportTeachers.length) : teachers.length;
  const activeStaffCount = viewingReport ? (report?.staffCount ?? reportStaff.length) : staff.length;

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
      console.log("Fetched staff previous:", res.data.data);
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


  const handleLockAndSave = async () => {
  if (!schoolId) {
    showToast("error", "No school selected");
    return;
  }

  setLocked(true);

  try {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; // e.g. "2026-08"
    const monthLabel = now.toLocaleString("en-PK", { month: "long", year: "numeric" }); // e.g. "August 2026"

    const payload = {
      schoolId,
      monthKey,
      monthLabel,
      adminId: admin?.id || admin?._id || null,
      headId: admin?.headId || null,
      generatedBy: admin?.name || admin?.email || null,

      staff: staff.map((s) => ({
        id: s.id || s._id,
        name: s.name,
        role: s.role || s.designation || null,
        salary: Number(s.salary || 0),
      })),
      teachers: teachers.map((t) => ({
        id: t.id || t._id,
        name: t.name,
        subject: t.subject || null,
        salary: Number(t.salary || 0),
      })),

      staffCount: staff.length,
      staffTotal,
      teacherCount: teachers.length,
      teacherTotal,
      totalExpense,
    };

    const res = await savePayrollReport(payload);
    console.log("Payroll report saved:", res.data);
    alert("success", res.data?.message || "Payroll report saved");
  } catch (error) {
    console.error("Failed to save payroll report:", error);
    alert("error", "Failed to save payroll report");
  } finally {
    setTimeout(() => setLocked(false), 1000);
  }
};

const getreport = async () => {
  if (!schoolId || !monthKey) return;

  try {
    setLoadingReport(true);
    setReportSearched(true);

    const monthLabel = monthKeyToLabel(monthKey);
    const response = await getPayrollReport(schoolId, monthLabel);

    setReport(response.data?.data || null);

    console.log("Payroll report:", response.data);
    setPickerOpen(false);
  } catch (err) {
    setReport(null);
    setReportSearched(true);

    console.error("Failed to fetch payroll report:", err);
  } finally {
    setLoadingReport(false);
  }
};

const handleclick = (e) => {
  e.preventDefault();
  e.stopPropagation();

  console.log("X CLICKED");

  setReport(null);
  setReportSearched(false);
  setMonthKey("");
  setPickerOpen(false);
};

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto space-y-4 sm:space-y-5">

        {/* ── Header row: title + calendar picker button (top right) ── */}
        <div className="flex  flex-col items-center justify-between gap-3 relative">
          <div className="flex items-center justify-between w-full gap-3">
  <h1 className="text-lg sm:text-xl font-medium text-gray-900">Payroll</h1>
             <div className="relative">
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all"
            >
              <Calendar size={16} className="text-blue-500" />
              <span className="hidden sm:inline">Previous Reports</span>
              <span className="sm:hidden">Reports</span>
            </button>

   {/* "No report found for this month" — only when searched, nothing came back */}
     
            {pickerOpen && (
              <div className="absolute right-0 mt-2 z-20 bg-white border border-gray-100 rounded-2xl shadow-lg p-4 w-72 sm:w-80">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
                  View a saved report
                </p>
                <div className="flex flex-col gap-2.5">
                  <input
                    type="month"
                    value={monthKey}
                    onChange={(e) => setMonthKey(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    onClick={getreport}
                    disabled={!monthKey || loadingReport}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {loadingReport && <MiniLoader />}
                    View Report
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>

   {reportSearched && !report && (
          <div className="flex flex-col items-center w-full justify-center bg-white border border-gray-100 rounded-2xl py-8 text-gray-400 gap-1.5">
            <Calendar size={22} className="text-gray-300" />
            <p className="text-sm">No report found for this month</p>
          </div>
        )}
  {/* Hero: Live Estimate — hidden while viewing a previous saved report */}
  {!viewingReport  && (
    <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-5">
      {/* Hero card — 3/5 width on desktop, full width on mobile */}
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

      {/* Stat cards — 2/5 width on desktop, side-by-side on all sizes */}
      <div className="md:col-span-2 grid grid-cols-1 gap-3 sm:gap-4">
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
  )}

  {/* Banner shown instead of live estimate while viewing a saved report */}
  {viewingReport && (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 w-full">
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10"></div>
      <div className="absolute bottom-0 right-24 h-20 w-20 rounded-full bg-white/5"></div>

      <button
        type="button"
        onClick={handleclick}
        className="absolute top-4 right-4 z-50 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
      >
        <X size={16} />
      </button>

      <div className="relative p-5 sm:p-6">
        <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          <TrendingUp size={12} />
          SAVED REPORT
        </span>

        <p className="text-2xl sm:text-3xl font-bold mt-3">{report.monthLabel}</p>

        <p className="text-3xl sm:text-4xl font-extrabold mt-2">PKR {fmt(report.totalExpense)}</p>

        <p className="text-xs text-blue-100 mt-1 tracking-wide">TOTAL SALARY EXPENSE</p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-white/10 rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <GraduationCap size={14} className="text-blue-100" />
              <span className="text-[11px] font-semibold text-blue-100 uppercase tracking-wide">
                Teachers ({activeTeacherCount})
              </span>
            </div>
            <p className="text-lg font-bold">Rs {fmt(report.teacherTotal)}</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Briefcase size={14} className="text-blue-100" />
              <span className="text-[11px] font-semibold text-blue-100 uppercase tracking-wide">
                Staff ({activeStaffCount})
              </span>
            </div>
            <p className="text-lg font-bold">Rs {fmt(report.staffTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  )}

        </div>

         {/* Lock & Save — only meaningful for live data, hide while viewing a saved report */}
         {!viewingReport && (
           <button
            onClick={handleLockAndSave}
            disabled={locked}
            className="w-full md:w-auto md:px-10 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-orange-200 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            <FileCheck2 size={18} />
            {locked ? "Saved!" : "Lock & Save July 2026 Report"}
          </button>
         )}

        {/* ── Tabs (used for both live and saved-report lists) ── */}
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
              {viewingReport ? activeTeacherCount : (loadingTeachers ? <MiniLoader size={10} /> : teachers.length)}
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
              {viewingReport ? activeStaffCount : (loadingStaff ? <MiniLoader size={10} /> : staff.length)}
            </span>
          </button>
        </div>

        {/* ── List Header ── */}
        <div className="flex justify-between px-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          <span>{activeTab === "teachers" ? "Teacher" : "Staff"}</span>
          <span>Monthly Salary</span>
        </div>

        {/* ── List (live records OR the saved report's snapshot, never both) ── */}
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
                    {person.role || person.subject}
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