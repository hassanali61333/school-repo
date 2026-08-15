"use client";
import { useEffect, useState } from "react";
import { Plus, X, Zap, Wrench, Package, ArrowLeft, Stamp } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { getExpenses, addExpense } from "@/app/services/schoolService";
import { setloginuser, setuserId } from "@/app/store/userSlice";

// ---- Design tokens ------------------------------------------------------
// A "ledger book" aesthetic: warm paper, ruled lines, ink, a wax-stamp
// accent, and a torn-receipt edge under the header. Amounts are set in
// monospace, like a real accounts ledger.

const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;500;600&display=swap');

  :root {
    --paper: #F6F1E4;
    --paper-deep: #EDE4CF;
    --rule: #D8CBAA;
    --ink: #26201A;
    --ink-soft: #8A7F68;
    --green: #2F6B4F;
    --green-deep: #234F3B;
    --green-soft: #E4EEE7;
  }

  .font-display { font-family: 'Fraunces', serif; }
  .font-mono { font-family: 'IBM Plex Mono', monospace; }
  .font-body { font-family: 'Inter', sans-serif; }

  .ledger-header {
    background-color: var(--green);
    background-image: repeating-linear-gradient(
      to bottom,
      rgba(255,255,255,0) 0px,
      rgba(255,255,255,0) 27px,
      rgba(255,255,255,0.07) 27px,
      rgba(255,255,255,0.07) 28px
    );
  }

  .torn-edge {
    height: 14px;
    background-image:
      linear-gradient(135deg, var(--paper) 50%, transparent 50%),
      linear-gradient(45deg, var(--paper) 50%, transparent 50%);
    background-size: 16px 16px;
    background-repeat: repeat-x;
    background-position: bottom;
  }

  .rule-bg {
    background-image: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 30px,
      rgba(38,32,26,0.05) 30px,
      rgba(38,32,26,0.05) 31px
    );
  }

  .stamp-badge {
    border: 2px dashed rgba(255,255,255,0.55);
    transform: rotate(-6deg);
  }

  @media (prefers-reduced-motion: no-preference) {
    .fade-up {
      animation: fadeUp 0.35s ease-out backwards;
    }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const CATEGORIES = [
  { id: "Utilities", label: "Utilities", icon: Zap, color: "#B8863B" },
  { id: "Maintenance", label: "Maintenance", icon: Wrench, color: "#B0452E" },
  { id: "Supplies", label: "Supplies", icon: Package, color: "#3F6B8C" },
];

function categoryMeta(id) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

function formatPKR(amount) {
  return `PKR ${Number(amount).toLocaleString("en-PK")}`;
}

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ---- Add Expense Modal ---------------------------------------------------

function AddExpenseModal({ open, onClose, onSave, saving }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Utilities");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setAmount("");
      setCategory("Utilities");
      setDescription("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setError("Give the entry a name.");
      return;
    }
    const numericAmount = Number(amount);
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setError("");
    onSave({
      name: name.trim(),
      amount: numericAmount,
      category,
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1A150F]/50 px-0 sm:px-4">
      <div
        className="w-full sm:max-w-md bg-white m-3 rounded-t-3xl sm:rounded-2xl p-6 pb-8 sm:pb-6 border border-[var(--rule)] shadow-2xl"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] font-mono text-[var(--ink-soft)]">
              New Ledger Entry
            </p>
            <h2 className="font-display text-xl font-semibold text-[var(--ink)] mt-0.5">
              Add Expense
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--paper-deep)] flex items-center justify-center text-[var(--ink-soft)] hover:bg-[var(--rule)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 font-body">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electricity bill"
              className="w-full rounded-lg border border-[var(--rule)] bg-white px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-soft)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
              Amount (PKR)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-[var(--rule)] bg-white px-4 py-3 font-mono text-[var(--ink)] placeholder:text-[var(--ink-soft)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(({ id, label, icon: Icon, color }) => {
                const active = category === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCategory(id)}
                    className="flex flex-col items-center gap-1.5 rounded-lg border py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)]"
                    style={{
                      borderColor: active ? color : "var(--rule)",
                      backgroundColor: active ? `${color}14` : "white",
                    }}
                  >
                    <Icon size={18} color={active ? color : "#B4AA92"} />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: active ? color : "var(--ink-soft)" }}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">
              Description <span className="font-normal normal-case text-[var(--ink-soft)]/70">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full rounded-lg border border-[var(--rule)] bg-white px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-soft)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--green)] resize-none"
            />
          </div>

          {error && <p className="text-sm text-[#B0452E] font-medium">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-gray-700 py-3.5 font-semibold text-white  "
          >
            {saving ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Expense Card ---------------------------------------------------------

function ExpenseCard({ expense, index }) {
  const meta = categoryMeta(expense.category);
  const Icon = meta.icon;
  return (
    <div
      className="fade-up bg-white rounded-xl p-5 border border-[var(--rule)] shadow-sm relative overflow-hidden"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: meta.color }}
      />
      <div className="flex items-start justify-between pl-2">
        <div>
          <p className="font-display font-semibold text-[var(--ink)] leading-tight">
            {expense.name}
          </p>
          <p className="text-xs font-mono text-[var(--ink-soft)] mt-1">
            {formatDate(expense.date)}
          </p>
        </div>
        <p className="font-mono font-semibold text-[var(--ink)]">
          {formatPKR(expense.amount)}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-3 pl-2">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${meta.color}1A` }}
        >
          <Icon size={13} color={meta.color} />
        </span>
        <span className="text-sm font-body text-[var(--ink-soft)]">{meta.label}</span>
      </div>

      {expense.description && (
        <p className="text-sm font-body text-[var(--ink-soft)] mt-3 pt-3 pl-2 border-t border-dashed border-[var(--rule)]">
          {expense.description}
        </p>
      )}
    </div>
  );
}

// ---- Main Page --------------------------------------------------------------

export default function Expenses({ schoolId: schoolIdProp, onBack }) {
  const dispatch = useDispatch();

  /* ── hydrate login user from localStorage into Redux (same as StaffPage) ── */
  useEffect(() => {
    const storedUser = localStorage.getItem("loginuser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      dispatch(setloginuser(user));
      dispatch(setuserId(user.id));
    }
  }, [dispatch]);

  const admin = useSelector((state) => state.users.loginuser);

  /* ── fallback straight to localStorage in case Redux hasn't hydrated yet ── */
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("loginuser") || "null")
      : null;

  const currentUser = admin || storedUser;

  // If a schoolId prop is explicitly passed in, it wins. Otherwise pull it
  // from the logged-in user, same as StaffPage.
  const schoolId = schoolIdProp || currentUser?.schoolId || "";

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const fetchExpenses = async () => {
    if (!schoolId) return;
    setLoadError("");
    try {
      const res = await getExpenses(schoolId);
      setExpenses(res.data.expenses);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      setLoadError("Couldn't load expenses. Pull to refresh or try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const handleSave = async ({ name, amount, category, description }) => {
    setSaving(true);
    try {
      const res = await addExpense({ name, amount, category, description, schoolId });
      setExpenses((prev) => [res.data.expense, ...prev]);
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save expense:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] rule-bg font-body">
    

      {/* Header */}
      <div className="ledger-header px-5 pt-6 pb-9 relative bg-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-mono text-white/60">
                School Ledger
              </p>
              <h1 className="font-display text-xl font-semibold text-white leading-tight">
                Expenses
              </h1>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Add expense"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="bg-white/10 rounded-xl px-5 py-4 flex items-center justify-between relative">
          <div>
            <p className="font-mono text-2xl font-semibold text-white">{expenses.length}</p>
            <p className="text-xs text-white/65 mt-0.5 font-body">Total Entries</p>
          </div>
          <div className="h-9 w-px bg-white/20" />
          <div className="text-right">
            <p className="font-mono text-2xl font-semibold text-white">{formatPKR(total)}</p>
            <p className="text-xs text-white/65 mt-0.5 font-body">Total Spent</p>
          </div>

          <div
            className="stamp-badge hidden sm:flex absolute -top-3 -right-3 w-14 h-14 rounded-full items-center justify-center bg-[var(--green-deep)]"
            aria-hidden="true"
          >
            <Stamp size={20} className="text-white/70" />
          </div>
        </div>
      </div>

      {/* Torn receipt edge */}
      <div className="torn-edge" aria-hidden="true" />

      {/* List */}
      <div className="px-5 py-6 space-y-3 max-w-2xl mx-auto">
        {loadError && (
          <div className="rounded-lg border border-[#B0452E]/30 bg-[#B0452E]/5 px-4 py-3 text-sm text-[#8A3220] font-body">
            {loadError}
          </div>
        )}

        {loading && (
          <div className="text-center py-14">
            <p className="font-mono text-sm text-[var(--ink-soft)]">Opening the ledger...</p>
          </div>
        )}

        {!loading && expenses.length === 0 && !loadError && (
          <div className="text-center py-16">
            <p className="font-display text-lg text-[var(--ink)]">No entries in the ledger yet.</p>
            <p className="text-sm text-[var(--ink-soft)] mt-1 font-body">
              Tap + to record the first one.
            </p>
          </div>
        )}

        {expenses.map((e, i) => (
          <ExpenseCard key={e.id} expense={e} index={i} />
        ))}
      </div>

      <AddExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}