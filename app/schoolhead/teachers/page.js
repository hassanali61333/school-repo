'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAdminID, setLoginAdmin } from '@/app/store/userSlice';
import { addTeacher, getTeachers, updateTeacher, deleteTeacher } from '@/app/services/schoolService';

/* ── Constants ────────────────────────────────────────── */
const CLASS_OPTIONS = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const SECTION_OPTIONS = ['A','B','C','D','E'];
const SUBJECT_OPTIONS = [
  'Mathematics','English','Urdu','Physics','Chemistry','Biology',
  'Computer Science','Islamiat','Pakistan Studies','History',
  'Geography','Economics','Accounting','Art','Physical Education',
];

const EMPTY_FORM = {
  name: '',
  qualification: '',
  contactNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
  imageUrl: '',
  class: '',
  section: '',
  subjects: [],
  primarySubject: '',
  isClassIncharge: false,
  salary: '',
};


/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function TeacherPage() {
  const dispatch = useDispatch();

  const [teacherList,  setTeacherList]  = useState([]);
  const [loadingList,  setLoadingList]  = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(null);
  const [view,         setView]         = useState('list'); // 'list' | 'add' | 'edit'
  const [editTarget,   setEditTarget]   = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [showPw,       setShowPw]       = useState(false);
  const [showCpw,      setShowCpw]      = useState(false);
  const [toast,        setToast]        = useState(null);
  const [search,       setSearch]       = useState('');

  /* ── restore admin from localStorage ── */
  useEffect(() => {
    const stored = localStorage.getItem('LoginAdmin');
    if (stored) {
      const user = JSON.parse(stored);
      dispatch(setLoginAdmin(user));
      dispatch(setAdminID(user.adminId));
    }
  }, [dispatch]);

  const admin      = useSelector((s) => s.users.loginAdmin);
  const schoolId   = admin?.schoolId   || '';
  const adminId    = admin?.adminId    || '';
  const headId     = admin?.id         || '';
  const schoolName = admin?.schoolName || 'Demo School';

  /* ── toast ── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── fetch list ── */
  const fetchTeachers = async () => {
    setLoadingList(true);
    try {
      const res = await getTeachers(schoolId);
      setTeacherList(res.data.data || []);
    } catch {
      showToast('error', 'Failed to load teacher list');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (schoolId) fetchTeachers();
  }, [admin?.schoolId]);

  /* ── open add ── */
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setView('add');
  };

  /* ── open edit ── */
  const openEdit = (teacher) => {
    setEditTarget(teacher);
    setForm({
      docId:          teacher.docId,
      name:           teacher.name           || '',
      qualification:  teacher.qualification  || '',
      contactNumber:  teacher.contactNumber  || '',
      email:          teacher.email          || '',
      imageUrl:       teacher.imageUrl       || '',
      class:          teacher.class          || '',
      section:        teacher.section        || '',
      subjects:       teacher.subjects       || [],
      primarySubject: teacher.primarySubject || '',
      isClassIncharge:teacher.isClassIncharge|| false,
      salary:         teacher.salary         || '',
      status:         teacher.status         || 'active',
    });
    setView('edit');
  };

  /* ── save ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      if (form.password !== form.confirmPassword) {
        showToast('error', 'Passwords do not match');
        return;
      }
      await addTeacher({ ...form, adminId, headId, schoolId, schoolName });
      showToast('success', 'Teacher registered successfully!');
      fetchTeachers();
      setForm(EMPTY_FORM);
      setView('list');
    } catch (e) {
      showToast('error', e.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  /* ── update ── */
  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateTeacher({
        docId:          form.docId,
        name:           form.name,
        qualification:  form.qualification,
        contactNumber:  form.contactNumber,
        email:          form.email,
        imageUrl:       form.imageUrl,
        class:          form.class,
        section:        form.section,
        subjects:       form.subjects,
        primarySubject: form.primarySubject,
        isClassIncharge:form.isClassIncharge,
        salary:         form.salary,
        status:         form.status,
      });
      showToast('success', 'Teacher updated successfully');
      fetchTeachers();
      setView('list');
      setEditTarget(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      showToast('error', e.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (docId) => {
    setDeleting(docId);
    try {
      await deleteTeacher(docId);
      showToast('success', 'Teacher deleted');
      fetchTeachers();
    } catch (e) {
      showToast('error', e.response?.data?.error || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  /* ── subject toggle ── */
  const toggleSubject = (subject) => {
    setForm((f) => {
      const exists = f.subjects.includes(subject);
      const updated = exists
        ? f.subjects.filter((s) => s !== subject)
        : [...f.subjects, subject];
      return {
        ...f,
        subjects: updated,
        primarySubject: updated.includes(f.primarySubject)
          ? f.primarySubject
          : updated[0] || '',
      };
    });
  };

  /* ── filtered list ── */
  const filtered = teacherList.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.primarySubject?.toLowerCase().includes(search.toLowerCase()) ||
      t.class?.toString().includes(search) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  );

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold transition-all
          ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {view !== 'list' ? (
            <button
              onClick={() => setView('list')}
              className="text-white/80 hover:text-white flex items-center gap-1 text-sm font-medium"
            >
              ← Back
            </button>
          ) : <span />}
          <h1 className="text-white text-xl font-bold tracking-tight">
            {view === 'list' ? '🎓 Teacher Management'
              : view === 'add' ? '➕ Add Teacher'
              : '✏️ Edit Teacher'}
          </h1>
          {view === 'list' ? (
            <button
              onClick={openAdd}
              className="bg-white text-indigo-600 text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-50 transition shadow"
            >
              + Add Teacher
            </button>
          ) : <span />}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ═══════════ LIST VIEW ═══════════ */}
        {view === 'list' && (
          <>
            {/* Search */}
            <div className="relative mb-5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Search by name, subject, class, or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loadingList ? (
              <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm">Loading teachers…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-2 text-slate-400">
                <span className="text-5xl">🎓</span>
                <p className="font-semibold">No teachers found</p>
                <p className="text-sm">Add your first teacher.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filtered.map((teacher) => (
                  <div
                    key={teacher.docId}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md transition"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                      {teacher.imageUrl
                        ? <img src={teacher.imageUrl} alt="" className="w-full h-full object-cover" />
                        : '👩‍🏫'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{teacher.name}</p>
                      <p className="text-xs text-indigo-500 font-semibold">
                        {teacher.primarySubject}
                        {teacher.class && teacher.section
                          ? ` · Class ${teacher.class}-${teacher.section}` : ''}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span>📧 {teacher.email}</span>
                        <span>💰 PKR {Number(teacher.salary).toLocaleString()}</span>
                        {teacher.isClassIncharge && (
                          <span className="text-amber-500 font-semibold">⭐ Class Incharge</span>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    <span className={`hidden sm:inline-flex text-xs font-bold px-3 py-1 rounded-full
                      ${teacher.status === 'active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-red-100 text-red-500'}`}>
                      {teacher.status || 'active'}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEdit(teacher)}
                        className="w-9 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition"
                        title="Edit"
                      >✏️</button>
                      <button
                        onClick={() => handleDelete(teacher.docId)}
                        disabled={deleting === teacher.docId}
                        className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === teacher.docId
                          ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : '🗑️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══════════ ADD / EDIT FORM ═══════════ */}
        {(view === 'add' || view === 'edit') && (
          <div className="space-y-6">

            {/* ── Personal Info ── */}
            <SectionCard title="👤 Personal Information">
              <Field label="Full Name">
                <Input icon="👤" placeholder="Teacher full name" value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Qualification">
                  <Input icon="🎓" placeholder="e.g. B.Ed, M.Sc" value={form.qualification}
                    onChange={(v) => setForm((f) => ({ ...f, qualification: v }))} />
                </Field>
                <Field label="Contact Number">
                  <Input icon="📞" placeholder="03XXXXXXXXX" maxLength={11} inputMode="numeric"
                    value={form.contactNumber}
                    onChange={(v) => setForm((f) => ({ ...f, contactNumber: v.replace(/\D/g, '') }))} />
                </Field>
              </div>

              <Field label="Email Address">
                <Input icon="📧" placeholder="teacher@school.com" type="email"
                  value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
              </Field>

              <Field label="Profile Image URL (optional)">
                <Input icon="🖼️" placeholder="https://…" value={form.imageUrl}
                  onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} />
              </Field>
            </SectionCard>

            {/* ── Class & Section ── */}
            <SectionCard title="🏫 Class Assignment">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Class">
                  <select
                    value={form.class}
                    onChange={(e) => setForm((f) => ({ ...f, class: e.target.value }))}
                    className="w-full h-12 border border-slate-200 rounded-xl px-3 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">— Select Class —</option>
                    {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Section">
                  <select
                    value={form.section}
                    onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                    className="w-full h-12 border border-slate-200 rounded-xl px-3 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">— Select Section —</option>
                    {SECTION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              {/* Class Incharge toggle */}
              <button
                onClick={() => setForm((f) => ({ ...f, isClassIncharge: !f.isClassIncharge }))}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 transition text-sm font-semibold
                  ${form.isClassIncharge
                    ? 'bg-amber-50 border-amber-400 text-amber-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <span className="text-xl">⭐</span>
                <span>Assign as Class Incharge</span>
                <span className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${form.isClassIncharge ? 'bg-amber-400 border-amber-400' : 'border-slate-300'}`}>
                  {form.isClassIncharge && <span className="text-white text-xs">✓</span>}
                </span>
              </button>
            </SectionCard>

            {/* ── Subjects ── */}
            <SectionCard title="📚 Subjects">
              <p className="text-xs text-slate-400 mb-2">Tap to select one or more subjects</p>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_OPTIONS.map((subject) => {
                  const selected = form.subjects.includes(subject);
                  return (
                    <button
                      key={subject}
                      onClick={() => toggleSubject(subject)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition
                        ${selected
                          ? 'bg-indigo-500 border-indigo-500 text-white shadow-sm shadow-indigo-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>

              {/* Primary subject picker */}
              {form.subjects.length > 1 && (
                <Field label="Primary Subject">
                  <select
                    value={form.primarySubject}
                    onChange={(e) => setForm((f) => ({ ...f, primarySubject: e.target.value }))}
                    className="w-full h-12 border border-slate-200 rounded-xl px-3 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 mt-2"
                  >
                    {form.subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              )}
            </SectionCard>

            {/* ── Salary ── */}
            <SectionCard title="💰 Compensation">
              <Field label="Monthly Salary (PKR)">
                <Input icon="💰" placeholder="e.g. 35000" inputMode="numeric"
                  value={form.salary}
                  onChange={(v) => setForm((f) => ({ ...f, salary: v.replace(/\D/g, '') }))} />
              </Field>
            </SectionCard>

            {/* ── Credentials (add only) ── */}
            {view === 'add' && (
              <SectionCard title="🔐 Login Credentials">
                <Field label="Password">
                  <PasswordInput
                    placeholder="Min. 8 characters"
                    show={showPw}
                    toggle={() => setShowPw((p) => !p)}
                    value={form.password}
                    onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                  />
                </Field>
                <Field label="Confirm Password">
                  <PasswordInput
                    placeholder="Re-enter password"
                    show={showCpw}
                    toggle={() => setShowCpw((p) => !p)}
                    value={form.confirmPassword}
                    onChange={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
                  />
                </Field>
              </SectionCard>
            )}

            {/* ── Status (edit only) ── */}
            {view === 'edit' && (
              <SectionCard title="📋 Status">
                <div className="flex gap-3">
                  {['active', 'inactive'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition
                        ${form.status === s
                          ? s === 'active'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-red-500 border-red-500 text-white'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    >
                      {s === 'active' ? '✅ Active' : '🚫 Inactive'}
                    </button>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Submit */}
            <button
              onClick={view === 'add' ? handleSave : handleUpdate}
              disabled={saving}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition"
            >
              {saving
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : view === 'add' ? '✅ Register Teacher' : '💾 Update Teacher'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Reusable sub-components ──────────────────────────── */

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 space-y-4">
      <p className="text-sm font-bold text-slate-700 mb-1">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{label}</label>
      {children}
    </div>
  );
}

function Input({ icon, placeholder, value, onChange, type = 'text', maxLength, inputMode }) {
  return (
    <div className="flex items-center gap-2 h-12 border border-slate-200 rounded-xl px-3 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-transparent transition">
      {icon && <span className="text-base flex-shrink-0">{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
      />
    </div>
  );
}

function PasswordInput({ placeholder, value, onChange, show, toggle }) {
  return (
    <div className="flex items-center gap-2 h-12 border border-slate-200 rounded-xl px-3 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-300 transition">
      <span className="text-base flex-shrink-0">🔒</span>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
      />
      <button type="button" onClick={toggle} className="text-slate-400 hover:text-slate-600 text-sm flex-shrink-0">
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}