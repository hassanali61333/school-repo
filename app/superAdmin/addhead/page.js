"use client";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getAllSchools, addSchoolHead, getAllHeads, updateHead, deleteHead } from "@/app/services/schoolService";
import { setAdminID } from "@/app/store/userSlice";

export default function HeadsPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const admin   = localStorage.getItem("LoginAdmin");
    const adminId = localStorage.getItem("AdminID");
    if (admin && adminId) dispatch(setAdminID(adminId));
  }, [dispatch]);

  const adminID = useSelector((s) => s.users.adminID);

  // ── Lists ─────────────────────────────────────────────
  const [heads,          setHeads]          = useState([]);
  const [schools,        setSchools]        = useState([]);
  const [loadingHeads,   setLoadingHeads]   = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);

  // ── Modal ─────────────────────────────────────────────
  const [showModal,    setShowModal]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors,       setErrors]       = useState({});

  // ── Edit / Delete state ───────────────────────────────
  const [editingHead,   setEditingHead]   = useState(null); // null = add mode, object = edit mode
  const [deletingId,    setDeletingId]    = useState(null); // headId being deleted
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [headToDelete,  setHeadToDelete]  = useState(null);

  // ── Form fields ───────────────────────────────────────
  const [headName,       setHeadName]       = useState("");
  const [email,          setEmail]          = useState("");
  const [password,       setPassword]       = useState("");
  const [showPass,       setShowPass]       = useState(false);
  const [phone,          setPhone]          = useState("");
  const [joiningDate,    setJoiningDate]    = useState("");
  const [designation,    setDesignation]    = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [headImage,      setHeadImage]      = useState(null);
  const [previewUrl,     setPreviewUrl]     = useState(null);

  const fileInputRef = useRef(null);

  // ── Fetch heads ───────────────────────────────────────
  useEffect(() => {
    if (!adminID) return;
    fetchHeads();
    fetchSchools();
  }, [adminID]);

  const fetchHeads = async () => {
    setLoadingHeads(true);
    try {
      const res = await getAllHeads(adminID);
      setHeads(res.data.data || []);
    } catch (err) {
      console.error("Fetch heads error:", err);
    } finally {
      setLoadingHeads(false);
    }
  };

  const fetchSchools = async () => {
    setLoadingSchools(true);
    try {
      const res = await getAllSchools(adminID);
      setSchools(res.data.data || []);
      console.log(res.data.data);
    } catch (err) {
      console.error("Schools load error:", err);
    } finally {
      setLoadingSchools(false);
    }
  };

  console.log("hasan")
  // ── Image ─────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setHeadImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ── Reset form ────────────────────────────────────────
  const resetForm = () => {
    setHeadName(""); setEmail(""); setPassword(""); setPhone("");
    setJoiningDate(""); setDesignation(""); setSelectedSchool(null);
    setHeadImage(null); setPreviewUrl(null); setErrors({});
    setShowPass(false); setEditingHead(null);
  };

  const openModal = () => { resetForm(); setShowModal(true); };
  const closeModal = () => { setShowModal(false); resetForm(); };

  // ── Open Edit Modal ───────────────────────────────────
  const openEditModal = (head) => {
    setEditingHead(head);
    setHeadName(head.name || "");
    setEmail(head.email || "");
    setPassword(""); // leave blank unless changing
    setPhone(head.phone || "");
    setJoiningDate(head.joiningDate || "");
    setDesignation(head.designation || "");
    const school = schools.find(s => s.schoolId === head.schoolId) || null;
    setSelectedSchool(school);
    // Show existing image as preview
    if (head.image?.base64) {
      setPreviewUrl(`data:${head.image.type};base64,${head.image.base64}`);
    } else {
      setPreviewUrl(null);
    }
    setHeadImage(null);
    setErrors({});
    setShowPass(false);
    setShowModal(true);
  };

  // ── Validate ──────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!selectedSchool)   errs.school   = "Please select a school";
    if (!headName.trim())  errs.headName = "Head name is required";
    if (!email.trim())     errs.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                           errs.email    = "Invalid email format";
    // Password required only on Add; optional on Edit
    if (!editingHead) {
      if (!password)         errs.password = "Password is required";
      else if (password.length < 8)
                             errs.password = "Minimum 8 characters";
    } else {
      if (password && password.length < 8)
                             errs.password = "Minimum 8 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit Add ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        adminId:     adminID,
        schoolId:    selectedSchool.schoolId,
        schoolName:  selectedSchool.schoolName,
        name:        headName.trim(),
        email:       email.trim().toLowerCase(),
        password,
        phone:       phone || "",
        role:        designation || "",
        joiningDate: joiningDate || "",
      };

    

      const res = await addSchoolHead(payload);
      if (res.data.success) {
        setHeads((prev) => [{ id: res.data.data.headId, ...res.data.data }, ...prev]);
        closeModal();
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong";
      alert(`❌ ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Submit Edit ───────────────────────────────────────
  const handleUpdate = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("headId",      editingHead.headId);
      formData.append("adminId",     adminID);
      formData.append("schoolId",    selectedSchool?.schoolId    || editingHead.schoolId);
      formData.append("schoolName",  selectedSchool?.schoolName  || editingHead.schoolName);
      formData.append("name",        headName.trim());
      formData.append("email",       email.trim().toLowerCase());
      if (password) formData.append("password", password);
      formData.append("phone",       phone || "");
      formData.append("role",        designation || "");
      formData.append("joiningDate", joiningDate || "");
      formData.append("status",      editingHead.status || "active");
      if (headImage) formData.append("image", headImage);

      const res = await updateHead(formData);
      const data = res.data;

      if (data.success) {
        setHeads((prev) =>
          prev.map((h) => h.headId === editingHead.headId ? { ...h, ...data.data } : h)
        );
        closeModal();
      } else {
        alert(`❌ ${data.error || "Update failed"}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────
  const confirmDelete = (head) => {
    setHeadToDelete(head);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!headToDelete) return;
    setDeletingId(headToDelete.headId);
    try {
      const res = await deleteHead(headToDelete.headId);
      const data = res.data;
      if (data.success) {
        setHeads((prev) => prev.filter((h) => h.headId !== headToDelete.headId));
      } else {
        alert(`❌ ${data.error || "Delete failed"}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Something went wrong");
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setHeadToDelete(null);
    }
  };

  // ── Input class helper ────────────────────────────────
  const inputCls = (field) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
      errors[field]
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-white focus:border-[#6C63FF]"
    }`;

  return (
    <div className="min-h-screen bg-[#F8F9FF]">

      {/* ── Header ── */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ background: "linear-gradient(to right, #2c2b3d, #8E85FF)" }}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-white hover:opacity-80">
            ← Back
          </button>
          <h1 className="text-white text-xl font-semibold">School Heads</h1>
        </div>
        <button
          onClick={openModal}
          className="bg-white text-[#6C63FF] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          + Add Head
        </button>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            {loadingHeads ? "Loading…" : `${heads.length} head${heads.length !== 1 ? "s" : ""} assigned`}
          </p>
        </div>

        {/* Heads Grid */}
        {loadingHeads ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <svg className="animate-spin h-5 w-5 text-[#6C63FF]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading heads…
          </div>
        ) : heads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <span className="text-6xl mb-4">👨‍🏫</span>
            <p className="text-lg font-medium">No heads assigned yet</p>
            <p className="text-sm mt-1">Click "+ Add Head" to assign one</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {heads.map((head) => (
              <div
                key={head.headId}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                {/* Card top */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#6C63FF20] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {head.image?.base64 ? (
                      <img
                        src={`data:${head.image.type};base64,${head.image.base64}`}
                        alt={head.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">👨‍🏫</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{head.name}</h3>
                    <p className="text-xs text-[#6C63FF] font-medium">{head.designation || "Head"}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600 font-medium flex-shrink-0">
                    Active
                  </span>
                </div>

                {/* Info rows */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>🏫</span>
                    <span className="truncate">{head.schoolName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>✉️</span>
                    <span className="truncate">{head.email}</span>
                  </div>
                  {head.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>📞</span>
                      <span>{head.phone}</span>
                    </div>
                  )}
                  {head.joiningDate && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>📅</span>
                      <span>{head.joiningDate}</span>
                    </div>
                  )}
                </div>

                {/* ── Edit / Delete buttons ── */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(head)}
                    className="flex-1 py-1.5 rounded-lg border border-[#6C63FF] text-[#6C63FF]
                               text-xs font-medium hover:bg-[#6C63FF10] transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(head)}
                    disabled={deletingId === head.headId}
                    className="flex-1 py-1.5 rounded-lg border border-red-300 text-red-500
                               text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === head.headId ? "Deleting…" : "🗑️ Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Modal header */}
            <div
              className="px-6 py-4 flex items-center justify-between rounded-t-2xl"
              style={{ background: "linear-gradient(to right, #6C63FF, #8E85FF)" }}
            >
              <h2 className="text-white text-lg font-semibold">
                {editingHead ? "Edit Head" : "Add New Head"}
              </h2>
              <button
                onClick={closeModal}
                className="text-white hover:opacity-70 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">

              {/* Image Upload */}
              <div className="flex flex-col items-center mb-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-[#6C63FF]
                             bg-[#6C63FF10] flex flex-col items-center justify-center
                             cursor-pointer hover:bg-[#6C63FF20] transition-colors overflow-hidden"
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="text-2xl">👤</span>
                      <span className="text-[10px] text-[#6C63FF] font-medium mt-1">Upload Photo</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Select School */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Select School <span className="text-red-500">*</span>
                </label>
                {loadingSchools ? (
                  <div className="text-sm text-gray-400 py-2">Loading schools…</div>
                ) : (
                  <select
                    value={selectedSchool?.schoolId || ""}
                    onChange={(e) => {
                      const found = schools.find(s => s.schoolId === e.target.value);
                      setSelectedSchool(found || null);
                    }}
                    className={inputCls("school")}
                  >
                    <option value="">-- Select School --</option>
                    {schools.map((s) => (
                      <option key={s.schoolId} value={s.schoolId}>
                        {s.schoolName}
                      </option>
                    ))}
                  </select>
                )}
                {errors.school && <p className="text-red-500 text-xs mt-1">{errors.school}</p>}
              </div>

              {/* Head Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Head Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter head's full name"
                  value={headName}
                  onChange={(e) => setHeadName(e.target.value)}
                  className={inputCls("headName")}
                />
                {errors.headName && <p className="text-red-500 text-xs mt-1">{errors.headName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="head@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls("email")}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password {!editingHead && <span className="text-red-500">*</span>}
                  {editingHead && <span className="text-gray-400 text-xs font-normal ml-1">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder={editingHead ? "Enter new password to change" : "Min 8 characters"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls("password")} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                <input
                  type="text"
                  placeholder="03XX-XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls("phone")}
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role / Designation</label>
                <input
                  type="text"
                  placeholder="Principal / Vice Principal / Coordinator"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className={inputCls("designation")}
                />
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Joining Date</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className={inputCls("joiningDate")}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600
                             text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingHead ? handleUpdate : handleSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all
                    ${isSubmitting
                      ? "bg-[#9d99e8] cursor-not-allowed"
                      : "bg-[#6C63FF] hover:bg-[#5a52e0]"}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      {editingHead ? "Updating…" : "Saving…"}
                    </span>
                  ) : (editingHead ? "Update Head" : "Add Head")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          DELETE CONFIRM MODAL
      ══════════════════════════════════════════ */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-5">
              <span className="text-5xl">🗑️</span>
              <h3 className="text-lg font-semibold text-gray-800 mt-3">Delete Head?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete <strong>{headToDelete?.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setHeadToDelete(null); }}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600
                           text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!!deletingId}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold
                           hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deletingId ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}