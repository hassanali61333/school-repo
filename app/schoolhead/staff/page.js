'use client';

import { useEffect, useState } from 'react';
import { addstaff ,getstaff,deletestaff} from '@/app/services/schoolService';
import { setAdminID, setLoginAdmin } from '@/app/store/userSlice';
import { useDispatch, useSelector } from 'react-redux';

/* ── role options ─────────────────────────────────────── */
const ROLES = [
  { title: 'Clerk / Office Staff', icon: '🗂️' },
  { title: 'Accountant',           icon: '🧮' },
  { title: 'Peon',                 icon: '🔔' },
  { title: 'Security Guard',       icon: '🛡️' },
  { title: 'Sweeper',              icon: '🧹' },
];

const EMPTY_FORM = {
  name: '', phone: '', cnic: '', salary: '', address: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  email: '', password: '', confirmPassword: '', designation: 'Clerk / Office Staff',
};

/* ── CNIC auto-formatter ──────────────────────────────── */
function formatCNIC(text) {
  const digits = text.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5)  return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function StaffPage() {


const dispatch = useDispatch();

  const [staffList,   setStaffList]   = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(null); // docId being deleted
  const [view,        setView]        = useState('list'); // 'list' | 'add' | 'edit'
  const [editTarget,  setEditTarget]  = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [showPw,      setShowPw]      = useState(false);
  const [showCpw,     setShowCpw]     = useState(false);
  const [toast,       setToast]       = useState(null); // { type:'success'|'error', msg }
  const [search,      setSearch]      = useState('');
    
 useEffect(() => {
      const storedUser = localStorage.getItem("LoginAdmin");
  
      if (storedUser) {
        const user = JSON.parse(storedUser);
  
        dispatch(setLoginAdmin(user));
        dispatch(setAdminID(user.adminId));
      }
    }, [dispatch]);
    const admin = useSelector((state) => state.users.loginAdmin);
    console.log("Admin in StaffPage:", admin);
   

  const schoolId  = admin?.schoolId || '';
  const adminId   = admin?.adminId || '';
  const headId    = admin?.id || '';
  const schoolName= admin?.schoolName || 'Demo School';

 
 


  /* ── toast helper ── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };


const fetchStaff = async () => {
    setLoadingList(true);     

    try {
      const res = await getstaff(schoolId);
      console.log("Fetched staff:", res.data);
      setStaffList(res.data.data || []);
    } catch (e) {
      showToast("error", "Failed to load staff list");
    } finally {
      setLoadingList(false);
    } 
  };

useEffect(() => {
  if (schoolId) {
    fetchStaff();
  }
}, [admin?.schoolId]);


  


  /* ── open add form ── */
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setView('add');
  };




const handleSave = async () => {
  setSaving(true);

  try {
    // validation
    if (form.password !== form.confirmPassword) {
      showToast("error", "Passwords do not match");
      setSaving(false);
      return;
    }

    await addstaff({
      ...form,
      adminId,
      headId,
      schoolId,
      schoolName,
    });

    showToast("success", "Staff registered successfully!");
fetchStaff()
    // reset form
    setForm(EMPTY_FORM);
    setView("list");


 

  } catch (e) {
    showToast("error", e.response?.data?.error || "Save failed");
  } finally {
    setSaving(false);
  }
};


const handleDelete = async (docId) => {

  try{
    setDeleting(docId);
    await deletestaff(docId);
    showToast("success", "Staff member deleted");
    fetchStaff(); 

  }
  catch(e){
    showToast("error", e.response?.data?.error || "Delete failed");
  } finally{ 
    setDeleting(null);
  }



}

 


  /* ── filtered list ── */
  const filtered = staffList.filter(s =>
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.designation?.toLowerCase().includes(search.toLowerCase()) ||
    s.cnic?.includes(search)
  );

 
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold transition-all
          ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {view !== 'list' ? (
            <button onClick={() => setView('list')} className="text-white/80 hover:text-white flex items-center gap-1 text-sm font-medium">
              ← Back
            </button>
          ) : <span />}
          <h1 className="text-white text-xl font-bold tracking-tight">
            {view === 'list' ? '👥 Staff Management' : view === 'add' ? '➕ Add Staff Member' : '✏️ Edit Staff Member'}
          </h1>
          {view === 'list' ? (
            <button
              onClick={openAdd}
              className="bg-white text-indigo-600 text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-50 transition shadow"
            >
              + Add Staff
            </button>
          ) : <span />}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ══════════════════════════════
            LIST VIEW
        ══════════════════════════════ */}
        {view === 'list' && (
          <>
            {/* Search */}
            <div className="relative mb-5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Search by name, role, or CNIC…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {loadingList ? (
              <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm">Loading staff…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-2 text-slate-400">
                <span className="text-5xl">👤</span>
                <p className="font-semibold">No staff found</p>
                <p className="text-sm">Add your first staff member.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filtered.map(member => (
                  <div
                    key={member.docId || member.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md transition"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {ROLES.find(r => r.title === member.designation)?.icon || '👤'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{member.fullName}</p>
                      <p className="text-xs text-indigo-500 font-semibold">{member.designation}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span>📞 {member.phoneNumber}</span>
                        <span>🪪 {member.cnic}</span>
                        <span>💰 PKR {Number(member.salary).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <span className={`hidden sm:inline-flex text-xs font-bold px-3 py-1 rounded-full
                      ${member.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                      {member.status || 'active'}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEdit(member)}
                        className="w-9 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition"
                        title="Edit"
                      >✏️</button>
                      <button
                        onClick={() => handleDelete(member?.docId)}
                        disabled={deleting === (member.docId || member.id)}
                        className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === (member.docId || member.id) ? (
                          <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : '🗑️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════
            ADD / EDIT FORM
        ══════════════════════════════ */}
        {(view === 'add' || view === 'edit') && (
          <div className="space-y-6">

            {/* Role selector */}
            <div>
              <p className="text-sm font-bold text-slate-600 mb-3">Select Designation</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {ROLES.map(r => (
                  <button
                    key={r.title}
                    onClick={() => setForm(f => ({ ...f, designation: r.title }))}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-28 h-24 rounded-2xl border-2 text-sm font-bold transition
                      ${form.designation === r.title
                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-200'
                        : 'bg-white border-slate-200 text-indigo-500 hover:border-indigo-300'}`}
                  >
                    <span className="text-2xl mb-1">{r.icon}</span>
                    <span className="text-center leading-tight px-1">{r.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">

              {/* Full Name */}
              <Field label="Full Name">
                <Input icon="👤" placeholder="Staff full name" value={form.name}
                  onChange={v => setForm(f => ({ ...f, name: v }))} />
              </Field>

              {/* Phone + CNIC */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone Number">
                  <Input icon="📞" placeholder="03XXXXXXXXX" maxLength={11} inputMode="numeric"
                    value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v.replace(/\D/g, '') }))} />
                </Field>
                <Field label="CNIC">
                  <Input icon="🪪" placeholder="XXXXX-XXXXXXX-X" maxLength={15} inputMode="numeric"
                    value={form.cnic} onChange={v => setForm(f => ({ ...f, cnic: formatCNIC(v) }))} />
                </Field>
              </div>

              {/* Salary + Joining Date */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Salary (PKR)">
                  <Input icon="💰" placeholder="e.g. 25000" inputMode="numeric"
                    value={form.salary} onChange={v => setForm(f => ({ ...f, salary: v.replace(/\D/g, '') }))} />
                </Field>
                <Field label="Joining Date">
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={e => setForm(f => ({ ...f, joiningDate: e.target.value }))}
                    className="w-full h-12 border border-slate-200 rounded-xl px-3 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </Field>
              </div>

              {/* Address */}
              <Field label="Residential Address">
                <textarea
                  rows={3}
                  placeholder="Complete address…"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-slate-50 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </Field>

              {/* Email */}
              <Field label="Email Address">
                <Input icon="📧" placeholder="staff@example.com" type="email"
                  value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
              </Field>

              {/* Password (only required for add) */}
              {view === 'add' && (
                <>
                  <Field label="Password">
                    <PasswordInput
                      placeholder="Min. 8 characters"
                      show={showPw}
                      toggle={() => setShowPw(p => !p)}
                      value={form.password}
                      onChange={v => setForm(f => ({ ...f, password: v }))}
                    />
                  </Field>
                  <Field label="Confirm Password">
                    <PasswordInput
                      placeholder="Re-enter password"
                      show={showCpw}
                      toggle={() => setShowCpw(p => !p)}
                      value={form.confirmPassword}
                      onChange={v => setForm(f => ({ ...f, confirmPassword: v }))}
                    />
                  </Field>
                </>
              )}

              {/* Submit */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition mt-2"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>{view === 'add' ? '✅ Register Staff Member' : '💾 Update Staff Member'}</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Small reusable components ────────────────────────── */
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
        onChange={e => onChange(e.target.value)}
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
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
      />
      <button type="button" onClick={toggle} className="text-slate-400 hover:text-slate-600 text-sm flex-shrink-0">
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}