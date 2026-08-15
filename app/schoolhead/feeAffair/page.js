"use client";
import { useState, useEffect, useMemo } from "react";
import { getStudents, updateStudent } from "@/app/services/schoolService";

export default function FeeAffairPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | paid | pending
  const [classFilter, setClassFilter] = useState("all");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [voucherStudent, setVoucherStudent] = useState(null);
  const [feeFields, setFeeFields] = useState({
    tuition: "",
    monthly: "",
    admissionOneTime: "",
    registration: "",
    annual: "",
    security: "",
    previousPending: "",
    other: "",
  });
  const [paidAmount, setPaidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      // "loginuser" object se schoolId nikalna — Students page wala hi tareeqa
      const stored = localStorage.getItem("loginuser");
      let schoolId = "";

      if (stored) {
        try {
          const userData = JSON.parse(stored);
          schoolId = userData.schoolId || "";
        } catch (parseErr) {
          console.error("Error parsing loginuser:", parseErr);
        }
      }

      if (!schoolId) {
        setError("School ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const res = await getStudents(schoolId);
      const studentList = res?.data?.students || res?.data || [];
      console.log("Fetched students:", studentList);

      setStudents(studentList);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const CLASS_LIST = [
    "KG",
    "Nursery",
    "Prep",
    "Hifz",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  const filteredStudents = useMemo(() => {
    let list = students;

    // Status filter
    if (statusFilter === "paid") {
      list = list.filter((s) => s.admissionPayment?.depositStatus === "paid");
    } else if (statusFilter === "pending") {
      list = list.filter((s) => s.admissionPayment?.depositStatus !== "paid");
    }

    // Class filter
    if (classFilter !== "all") {
      list = list.filter(
        (s) =>
          String(s.class ?? s.className ?? "").toUpperCase() ===
          classFilter.toUpperCase()
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const rollNo = s.rollNo?.toLowerCase() || "";
        const fatherName = s.parent?.father?.name?.toLowerCase() || "";

        return (
          fullName.includes(query) ||
          rollNo.includes(query) ||
          fatherName.includes(query)
        );
      });
    }

    return list;
  }, [students, searchQuery, statusFilter, classFilter]);

  // Stats
  const stats = useMemo(() => {
    const paid = students.filter(
      (s) => s.admissionPayment?.depositStatus === "paid"
    ).length;
    const pending = students.filter(
      (s) => s.admissionPayment?.depositStatus === "pending"
    ).length;
    const total = students.length;

    return { paid, pending, total };
  }, [students]);

  // --- Pay Fee Logic ---
  const openPayModal = (student) => {
    setSelectedStudent(student);
    setFeeFields({
      tuition: student.fee?.tuition ?? "",
      monthly: student.fee?.monthly ?? "",
      admissionOneTime: student.fee?.admissionOneTime ?? "",
      registration: student.fee?.registration ?? "",
      annual: student.fee?.annual ?? "",
      security: student.fee?.security ?? "",
      previousPending: student.fee?.previousPending ?? "",
      other: student.fee?.other ?? "",
    });
    setPaidAmount("");
  };

  const closePayModal = () => {
    if (submitting) return;
    setSelectedStudent(null);
    setFeeFields({
      tuition: "",
      monthly: "",
      admissionOneTime: "",
      registration: "",
      annual: "",
      security: "",
      previousPending: "",
      other: "",
    });
    setPaidAmount("");
  };

  const updateFeeField = (key, value) => {
    setFeeFields((prev) => ({ ...prev, [key]: value }));
  };

  const submitPayment = async () => {
    if (feeFields.tuition === "" || Number(feeFields.tuition) < 0) {
      alert("Tuition Fee is required");
      return;
    }
    if (feeFields.monthly === "" || Number(feeFields.monthly) <= 0) {
      alert("Monthly Fee is required");
      return;
    }
    const amount = Number(paidAmount) || 0;
    if (amount <= 0) {
      alert("Please enter the amount being paid");
      return;
    }
    try {
      setSubmitting(true);

      const currentPayment = selectedStudent.admissionPayment || {};

      const newTotalPaid = (currentPayment.totalPaid || 0) + amount;
      const totalDue = currentPayment.totalDue || 0;
      const newBalance = Math.max(0, totalDue - newTotalPaid);
      const newStatus = newTotalPaid >= totalDue ? "paid" : "pending";

      const updatedPayment = {
        ...currentPayment,
        totalPaid: newTotalPaid,
        balance: newBalance,
        depositStatus: newStatus,
        depositDate: new Date().toISOString().split("T")[0],
      };

      const safeFee = {
        dueDay: 5,
        outstanding: 0,
        ...selectedStudent.fee,
        tuition: Number(feeFields.tuition) || 0,
        monthly: Number(feeFields.monthly) || 0,
        admissionOneTime: Number(feeFields.admissionOneTime) || 0,
        registration: Number(feeFields.registration) || 0,
        annual: Number(feeFields.annual) || 0,
        security: Number(feeFields.security) || 0,
        previousPending: Number(feeFields.previousPending) || 0,
        other: Number(feeFields.other) || 0,
      };

      const safeReminder = {
        channel: "WhatsApp",
        daysBefore: 3,
        enabled: false,
        security: false,
        tuition: false,
        ...selectedStudent.fee?.reminder,
        ...selectedStudent.reminder,
      };

      const safeParent = {
        address: "",
        email: "",
        phone: "",
        ...selectedStudent.parent,
        father: {
          name: "",
          cnic: "",
          mobile: "",
          ...selectedStudent.parent?.father,
        },
        mother: {
          name: "",
          cnic: "",
          mobile: "",
          ...selectedStudent.parent?.mother,
        },
      };

      const fullPayload = {
        ...selectedStudent,
        fee: safeFee,
        reminder: safeReminder,
        parent: safeParent,
        admissionPayment: updatedPayment,
      };

      await updateStudent({
        studentId: selectedStudent.studentId || selectedStudent.id,
        ...fullPayload,
      });

      setStudents((prev) =>
        prev.map((s) =>
          s.id === selectedStudent.id
            ? { ...s, admissionPayment: updatedPayment }
            : s
        )
      );

      closePayModal();
    } catch (err) {
      console.error("Payment update failed:", err);
      alert("Payment update failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (student) => {
    const f = student.firstName?.[0] || "";
    const l = student.lastName?.[0] || "";
    return (f + l).toUpperCase() || "?";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading students…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center text-2xl">
          !
        </div>
        <p className="text-slate-700 font-medium">{error}</p>
        <button
          onClick={fetchStudents}
          className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-6 py-2.5 rounded-xl font-medium shadow-sm shadow-indigo-200"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-wider text-indigo-500 uppercase mb-1">
            School Head
          </p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Students Fee Affairs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track, search, and collect fee payments in one place.
          </p>
        </div>

    <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400" />
            <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Paid</p>
          </div>
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
            <p className="text-2xl font-bold text-amber-600">
              {stats.pending}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Pending
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-400" />
            <p className="text-2xl font-bold text-indigo-600">
              {stats.total}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Total</p>
          </div>
        </div>
        {/* Search Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setClassFilter("all")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              classFilter === "all"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Classes
          </button>
          {CLASS_LIST.map((cls) => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                classFilter === cls
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* Status Filter — All / Pending / Paid */}
        <div className="flex gap-2 mb-4">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "paid", label: "Paid" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                statusFilter === key
                  ? key === "paid"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : key === "pending"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Class Filter — horizontal scroll, KG to 12 */}
    

        {/* Stats */}
    
      <div className="relative mb-6">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, roll no, father…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
        </div>
        {/* Student List */}
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-3">
              🔍
            </div>
            <p className="text-slate-500 font-medium">No students found</p>
            <p className="text-slate-400 text-sm mt-1">
              Try a different name, roll number, or father's name.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredStudents.map((student) => {
              const payment = student.admissionPayment;
              const isPaid = payment?.depositStatus === "paid";
              const total = payment?.totalDue || 0;
              const paidAmt = payment?.totalPaid || 0;
              const progress =
                total > 0 ? Math.min(100, (paidAmt / total) * 100) : 0;

              return (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center font-semibold text-sm ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {getInitials(student)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-semibold text-slate-900 truncate">
                          {student.firstName} {student.lastName}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Roll {student.rollNo} · Class {student.class}-
                          {student.section}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Father: {student.parent?.father?.name || "—"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isPaid ? "Paid" : "Pending"}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isPaid ? "bg-emerald-400" : "bg-indigo-400"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 mt-3 text-center">
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Total Due
                      </p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">
                        Rs. {total.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Paid
                      </p>
                      <p className="font-bold text-emerald-600 text-sm mt-0.5">
                        Rs. {paidAmt.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Balance
                      </p>
                      <p className="font-bold text-red-500 text-sm mt-0.5">
                        Rs. {(payment?.balance ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => openPayModal(student)}
                      className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition text-white text-sm font-semibold py-2.5 rounded-xl shadow-sm shadow-indigo-200"
                    >
                      Edit Fee
                    </button>
                    <button
                      onClick={() => setVoucherStudent(student)}
                      className="bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.99] transition text-slate-700 text-sm font-semibold py-2.5 rounded-xl"
                    >
                      Voucher
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pay / Edit Fee Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={closePayModal}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-[fadeIn_0.15s_ease-out] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                {getInitials(selectedStudent)}
              </div>
              <div>
                <h2 className="font-bold text-slate-900 leading-tight">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h2>
                <p className="text-xs text-slate-500">
                  Roll {selectedStudent.rollNo}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between items-center mb-4">
              <span className="text-xs text-slate-500 font-medium">
                Current balance
              </span>
              <span className="font-bold text-red-500">
                Rs.{" "}
                {(
                  selectedStudent.admissionPayment?.balance ?? 0
                ).toLocaleString()}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {[
                { key: "tuition", label: "Tuition Fee", required: true },
                { key: "monthly", label: "Monthly Fee", required: true },
                {
                  key: "admissionOneTime",
                  label: "Admission Fee (One Time)",
                },
                { key: "registration", label: "Registration Fee" },
                { key: "annual", label: "Annual Fee" },
                { key: "security", label: "Security Fee" },
                { key: "previousPending", label: "Previous Pending" },
                { key: "other", label: "Other Fees (Optional)" },
              ].map(({ key, label, required }, i) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                      Rs.
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={feeFields[key]}
                      onChange={(e) => updateFeeField(key, e.target.value)}
                      autoFocus={i === 0}
                      className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Amount being paid now */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-indigo-600 mb-1 block">
                Amount being paid now
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  Rs.
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full border-2 border-indigo-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition bg-indigo-50/40"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={closePayModal}
                disabled={submitting}
                className="flex-1 bg-slate-100 hover:bg-slate-200 transition text-slate-700 font-semibold py-2.5 rounded-xl disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitPayment}
                disabled={submitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 transition text-white font-semibold py-2.5 rounded-xl shadow-sm shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Confirm payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
  
    </div>
  );
}