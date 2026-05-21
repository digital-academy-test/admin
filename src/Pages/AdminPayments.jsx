// src/Pages/AdminPayments.jsx
// Payment management for Edenites staff dashboard.
// Tabs: All Payments | Pending Transfers | Bank Accounts
// Uses adminApi (staffToken) via usePaymentStore admin methods.

import React, { useState, useEffect } from "react";
import adminApi from "../utils/adminApi";
import toast from "react-hot-toast";
import {
  CreditCard, Building, Wallet, Clock, CheckCircle, XCircle,
  RefreshCcw, Search, Eye, Check, X, Plus, Edit2, Trash2,
  ChevronLeft, ChevronRight, AlertCircle, DollarSign,
  TrendingUp, Users, Shield,
} from "lucide-react";

const BRAND = "#0C6F89";
const DARK  = "#084d63";

// ─── Config maps ──────────────────────────────────────────────────────────────

const STATUS = {
  pending:    { label: "Pending",    bg: "#fef9c3", color: "#854d0e", Icon: Clock         },
  processing: { label: "Processing", bg: "#dbeafe", color: "#1e40af", Icon: RefreshCcw    },
  completed:  { label: "Completed",  bg: "#dcfce7", color: "#166534", Icon: CheckCircle   },
  failed:     { label: "Failed",     bg: "#fee2e2", color: "#991b1b", Icon: XCircle       },
  refunded:   { label: "Refunded",   bg: "#f3e8ff", color: "#6b21a8", Icon: RefreshCcw    },
};

const METHOD = {
  paystack:      { label: "Paystack",       Icon: CreditCard, color: "#3b82f6" },
  bank_transfer: { label: "Bank Transfer",  Icon: Building,   color: "#f59e0b" },
  wallet:        { label: "Wallet",         Icon: Wallet,     color: "#10b981" },
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

const fmt    = (n) => `₦${(n || 0).toLocaleString()}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
}) : "—";

function StatusBadge({ status }) {
  const cfg = STATUS[status] || STATUS.pending;
  const { Icon } = cfg;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: cfg.bg, color: cfg.color }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

function MethodBadge({ method }) {
  const cfg = METHOD[method] || METHOD.paystack;
  const { Icon } = cfg;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, color: cfg.color, fontWeight: 600 }}>
      <Icon size={13} /> {cfg.label}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
      padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: "#1a1a1a",
          fontFamily: "'Montserrat', sans-serif" }}>{value}</p>
        {sub && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Modal shell ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }}
        onClick={onClose} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 16,
        width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #f3f4f6" }}>
          <h3 style={{ margin: 0, fontFamily: "'Montserrat', sans-serif",
            fontSize: 16, fontWeight: 800 }}>{title}</h3>
          <button onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={18} color="#9ca3af" />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Detail row ──────────────────────────────────────────────────────────────

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 14px", background: "#f8fafc", borderRadius: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", maxWidth: 220,
        textAlign: "right", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

// ─── Input helper ────────────────────────────────────────────────────────────

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb",
  borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box",
  fontFamily: "'Poppins', sans-serif",
};

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700, color: "#374151",
  marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em",
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function AdminPayments() {
  const [tab, setTab] = useState("payments"); // payments | pending | banks

  // ── Stats ──────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);

  // ── All payments ───────────────────────────────────────────────────────────
  const [payments,   setPayments]   = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [search,     setSearch]     = useState("");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [filterMethod,  setFilterMethod]  = useState("all");
  const [listLoading,   setListLoading]   = useState(false);

  // ── Pending verifications ─────────────────────────────────────────────────
  const [pending,     setPending]     = useState([]);
  const [pendingLoad, setPendingLoad] = useState(false);

  // ── Bank accounts ─────────────────────────────────────────────────────────
  const [banks,      setBanks]      = useState([]);
  const [bankLoading,setBankLoading] = useState(false);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [detailPayment,  setDetailPayment]  = useState(null);
  const [verifyPayment,  setVerifyPayment]  = useState(null);
  const [rejectPayment,  setRejectPayment]  = useState(null);
  const [bankModal,      setBankModal]      = useState(false);
  const [editBank,       setEditBank]       = useState(null);
  const [submitting,     setSubmitting]     = useState(false);
  const [verifyNotes,    setVerifyNotes]    = useState("");
  const [rejectReason,   setRejectReason]   = useState("");
  const [bankForm,       setBankForm]       = useState({
    bankName: "", accountNumber: "", accountName: "",
    bankCode: "", isActive: true, isPrimary: false,
    displayOrder: 0, description: "",
  });

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => { loadStats(); loadPending(); loadBanks(); }, []);
  useEffect(() => { loadPayments(); }, [search, filterStatus, filterMethod]);

  // ── Loaders ───────────────────────────────────────────────────────────────

  const loadStats = async () => {
    try {
      const res = await adminApi.get("/admin/payments/stats");
      setStats(res.data.data);
    } catch { /* silent */ }
  };

  const loadPayments = async (page = 1) => {
    setListLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 15 });
      if (search)        q.set("search", search);
      if (filterStatus !== "all") q.set("status", filterStatus);
      if (filterMethod !== "all") q.set("paymentMethod", filterMethod);
      const res = await adminApi.get(`/admin/payments?${q}`);
      setPayments(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { toast.error("Failed to load payments"); }
    finally  { setListLoading(false); }
  };

  const loadPending = async () => {
    setPendingLoad(true);
    try {
      const res = await adminApi.get("/admin/payments/pending-verifications");
      setPending(res.data.data || []);
    } catch { /* silent */ }
    finally  { setPendingLoad(false); }
  };

  const loadBanks = async () => {
    setBankLoading(true);
    try {
      const res = await adminApi.get("/admin/payments/bank-accounts");
      setBanks(res.data.data || []);
    } catch { /* silent */ }
    finally  { setBankLoading(false); }
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleVerify = async () => {
    if (!verifyPayment) return;
    setSubmitting(true);
    try {
      await adminApi.put(`/admin/payments/${verifyPayment._id}/verify`, { notes: verifyNotes });
      toast.success("Payment verified and access activated");
      setVerifyPayment(null); setVerifyNotes("");
      loadPayments(pagination.currentPage); loadPending(); loadStats();
    } catch (err) { toast.error(err.response?.data?.message || "Verify failed"); }
    finally { setSubmitting(false); }
  };

  const handleReject = async () => {
    if (!rejectPayment || !rejectReason.trim()) {
      toast.error("Please enter a rejection reason"); return;
    }
    setSubmitting(true);
    try {
      await adminApi.put(`/admin/payments/${rejectPayment._id}/reject`, { reason: rejectReason });
      toast.success("Payment rejected");
      setRejectPayment(null); setRejectReason("");
      loadPayments(pagination.currentPage); loadPending(); loadStats();
    } catch (err) { toast.error(err.response?.data?.message || "Reject failed"); }
    finally { setSubmitting(false); }
  };

  const handleRefund = async (payment) => {
    if (!window.confirm(`Refund ₦${payment.amount?.toLocaleString()} to this user?`)) return;
    try {
      await adminApi.put(`/admin/payments/${payment._id}/refund`);
      toast.success("Payment refunded");
      loadPayments(pagination.currentPage); loadStats();
    } catch (err) { toast.error(err.response?.data?.message || "Refund failed"); }
  };

  const handleSaveBank = async () => {
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountName) {
      toast.error("Bank name, account number, and account name are required"); return;
    }
    setSubmitting(true);
    try {
      if (editBank) {
        await adminApi.put(`/admin/payments/bank-accounts/${editBank._id}`, bankForm);
        toast.success("Bank account updated");
      } else {
        await adminApi.post("/admin/payments/bank-accounts", bankForm);
        toast.success("Bank account added");
      }
      setBankModal(false); setEditBank(null);
      setBankForm({ bankName: "", accountNumber: "", accountName: "", bankCode: "", isActive: true, isPrimary: false, displayOrder: 0, description: "" });
      loadBanks();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteBank = async (id) => {
    if (!window.confirm("Delete this bank account?")) return;
    try {
      await adminApi.delete(`/admin/payments/bank-accounts/${id}`);
      toast.success("Bank account deleted");
      loadBanks();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to delete"); }
  };

  const openEditBank = (bank) => {
    setEditBank(bank);
    setBankForm({
      bankName: bank.bankName, accountNumber: bank.accountNumber,
      accountName: bank.accountName, bankCode: bank.bankCode || "",
      isActive: bank.isActive, isPrimary: bank.isPrimary,
      displayOrder: bank.displayOrder || 0, description: bank.description || "",
    });
    setBankModal(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: "24px 20px", fontFamily: "'Poppins', sans-serif", maxWidth: 1100 }}>

      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 22, fontWeight: 900,
          margin: "0 0 4px", color: "#1a1a1a" }}>
          Payments
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
          Manage transactions, verify bank transfers, and configure bank accounts
        </p>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 14, marginBottom: 28 }}>
          <StatCard label="Total Revenue"   value={fmt(stats.totalRevenue)}   icon={DollarSign}  color="#10b981" sub="All time" />
          <StatCard label="This Month"      value={fmt(stats.monthlyRevenue)} icon={TrendingUp}  color={BRAND}  sub="Completed" />
          <StatCard label="Total Payments"  value={stats.totalPayments}       icon={CreditCard}  color="#8b5cf6" />
          <StatCard label="Pending Verify"  value={stats.pendingVerifications} icon={AlertCircle} color="#f59e0b" sub="Bank transfers" />
        </div>
      )}

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 12,
        padding: 4, marginBottom: 24, width: "fit-content" }}>
        {[
          { key: "payments", label: "All Payments" },
          { key: "pending",  label: `Pending Transfers${pending.length ? ` (${pending.length})` : ""}` },
          { key: "banks",    label: "Bank Accounts" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer",
              background: tab === key ? "#fff" : "transparent",
              color: tab === key ? BRAND : "#6b7280",
              fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 700,
              boxShadow: tab === key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s", whiteSpace: "nowrap" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: ALL PAYMENTS
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "payments" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
          {/* Filters */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6",
            display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <Search size={14} color="#9ca3af" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by reference…"
                style={{ ...inputStyle, paddingLeft: 34 }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ ...inputStyle, width: "auto", minWidth: 130 }}>
              <option value="all">All Status</option>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}
              style={{ ...inputStyle, width: "auto", minWidth: 140 }}>
              <option value="all">All Methods</option>
              {Object.entries(METHOD).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button onClick={() => loadPayments(1)}
              style={{ padding: "10px 14px", borderRadius: 10, border: "none",
                background: BRAND, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
              <RefreshCcw size={13} /> Refresh
            </button>
          </div>

          {/* Table */}
          {listLoading ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#9ca3af" }}>Loading…</div>
          ) : payments.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#9ca3af" }}>No payments found</div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f3f4f6" }}>
                      {["Reference", "User", "Item", "Amount", "Method", "Status", "Date", ""].map(h => (
                        <th key={h} style={{ padding: "11px 14px", textAlign: "left",
                          fontWeight: 700, color: "#6b7280", fontSize: 11,
                          textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id} style={{ borderBottom: "1px solid #f9fafb" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 14px" }}>
                          <code style={{ fontSize: 11, color: DARK, fontWeight: 700 }}>{p.reference}</code>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#374151" }}>
                          <p style={{ margin: 0, fontWeight: 600 }}>{p.user?.name || "—"}</p>
                          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{p.user?.email}</p>
                        </td>
                        <td style={{ padding: "12px 14px", maxWidth: 160 }}>
                          <p style={{ margin: 0, fontSize: 12, color: "#374151", fontWeight: 600,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.course?.title || "Wallet Top-up"}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", textTransform: "capitalize" }}>
                            {p.type?.replace(/_/g, " ")}
                          </p>
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 800, color: DARK,
                          fontFamily: "'Montserrat', sans-serif" }}>
                          {fmt(p.amount)}
                        </td>
                        <td style={{ padding: "12px 14px" }}><MethodBadge method={p.paymentMethod} /></td>
                        <td style={{ padding: "12px 14px" }}><StatusBadge status={p.status} /></td>
                        <td style={{ padding: "12px 14px", fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                          {fmtDate(p.createdAt)}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setDetailPayment(p)}
                              style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid #e5e7eb",
                                background: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
                              <Eye size={13} color="#6b7280" />
                            </button>
                            {p.status === "completed" && (
                              <button onClick={() => handleRefund(p)}
                                style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid #fde68a",
                                  background: "#fffbeb", cursor: "pointer", fontSize: 11, color: "#92400e",
                                  fontWeight: 600 }}>
                                Refund
                              </button>
                            )}
                            {p.paymentMethod === "bank_transfer" && p.verification?.status === "pending" && (
                              <>
                                <button onClick={() => setVerifyPayment(p)}
                                  style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid #bbf7d0",
                                    background: "#dcfce7", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                  <Check size={13} color="#16a34a" />
                                </button>
                                <button onClick={() => setRejectPayment(p)}
                                  style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid #fecaca",
                                    background: "#fee2e2", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                  <X size={13} color="#dc2626" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ padding: "14px 20px", borderTop: "1px solid #f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    Page {pagination.currentPage} of {pagination.totalPages} · {pagination.total} total
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => loadPayments(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb",
                        background: "#fff", cursor: "pointer", opacity: pagination.currentPage === 1 ? 0.4 : 1 }}>
                      <ChevronLeft size={14} />
                    </button>
                    <button onClick={() => loadPayments(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb",
                        background: "#fff", cursor: "pointer",
                        opacity: pagination.currentPage === pagination.totalPages ? 0.4 : 1 }}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: PENDING TRANSFERS
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "pending" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <button onClick={loadPending}
              style={{ padding: "9px 14px", borderRadius: 10, border: "none",
                background: BRAND, color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
              <RefreshCcw size={13} /> Refresh
            </button>
          </div>

          {pendingLoad ? (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Loading…</p>
          ) : pending.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", background: "#fff",
              borderRadius: 16, border: "1px solid #e5e7eb" }}>
              <CheckCircle size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15,
                color: "#374151", margin: "0 0 6px" }}>All caught up!</p>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>No pending bank transfers to verify</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {pending.map(p => (
                <div key={p._id} style={{ background: "#fff", border: "1.5px solid #fde68a",
                  borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #fef9c3",
                    background: "#fffbeb", display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>
                        {p.user?.name || "Unknown User"}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{p.user?.email}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: "0 0 4px", fontFamily: "'Montserrat', sans-serif",
                        fontSize: 20, fontWeight: 900, color: DARK }}>{fmt(p.amount)}</p>
                      <code style={{ fontSize: 11, color: "#9ca3af" }}>{p.reference}</code>
                    </div>
                  </div>

                  <div style={{ padding: "14px 20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: 11, color: "#9ca3af", fontWeight: 600,
                          textTransform: "uppercase" }}>Item</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                          {p.course?.title || p.package?.name || "Wallet Top-up"}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: 11, color: "#9ca3af", fontWeight: 600,
                          textTransform: "uppercase" }}>Submitted</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                          {fmtDate(p.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Proof of payment image */}
                    {p.bankTransfer?.proofOfPayment?.url && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ margin: "0 0 6px", fontSize: 11, color: "#9ca3af", fontWeight: 600,
                          textTransform: "uppercase" }}>Proof of Payment</p>
                        <a href={p.bankTransfer.proofOfPayment.url} target="_blank" rel="noreferrer">
                          <img src={p.bankTransfer.proofOfPayment.url} alt="proof"
                            style={{ maxHeight: 180, borderRadius: 10, border: "1px solid #e5e7eb",
                              objectFit: "contain", cursor: "pointer" }} />
                        </a>
                        {p.bankTransfer.senderName && (
                          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>
                            Sent by <strong>{p.bankTransfer.senderName}</strong>
                            {p.bankTransfer.senderBank ? ` · ${p.bankTransfer.senderBank}` : ""}
                          </p>
                        )}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setVerifyPayment(p)}
                        style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none",
                          background: "#dcfce7", color: "#166534", fontWeight: 700, fontSize: 13,
                          cursor: "pointer", display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 6 }}>
                        <Check size={15} /> Approve
                      </button>
                      <button onClick={() => setRejectPayment(p)}
                        style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none",
                          background: "#fee2e2", color: "#991b1b", fontWeight: 700, fontSize: 13,
                          cursor: "pointer", display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 6 }}>
                        <X size={15} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: BANK ACCOUNTS
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "banks" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <button onClick={() => { setEditBank(null); setBankForm({ bankName: "", accountNumber: "", accountName: "", bankCode: "", isActive: true, isPrimary: false, displayOrder: 0, description: "" }); setBankModal(true); }}
              style={{ padding: "10px 18px", borderRadius: 10, border: "none",
                background: `linear-gradient(135deg, ${DARK}, ${BRAND})`, color: "#fff",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7,
                boxShadow: "0 4px 14px rgba(12,111,137,0.25)" }}>
              <Plus size={15} /> Add Bank Account
            </button>
          </div>

          {bankLoading ? (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Loading…</p>
          ) : banks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", background: "#fff",
              borderRadius: 16, border: "1px solid #e5e7eb" }}>
              <Building size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
                color: "#374151", margin: "0 0 6px" }}>No bank accounts yet</p>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                Add accounts for students to transfer to
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {banks.map(bank => (
                <div key={bank._id}
                  style={{ background: "#fff", border: `1.5px solid ${bank.isPrimary ? BRAND : "#e5e7eb"}`,
                    borderRadius: 14, padding: "18px 20px", position: "relative" }}>
                  {bank.isPrimary && (
                    <span style={{ position: "absolute", top: 12, right: 12,
                      background: BRAND, color: "#fff", fontSize: 10, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 20 }}>PRIMARY</span>
                  )}
                  {!bank.isActive && (
                    <span style={{ position: "absolute", top: 12, right: bank.isPrimary ? 72 : 12,
                      background: "#fee2e2", color: "#991b1b", fontSize: 10, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 20 }}>INACTIVE</span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "#e8f4f8",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Building size={18} color={BRAND} />
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>
                      {bank.bankName}
                    </p>
                  </div>
                  <p style={{ margin: "0 0 2px", fontFamily: "monospace", fontSize: 20,
                    fontWeight: 800, color: DARK }}>{bank.accountNumber}</p>
                  <p style={{ margin: "0 0 10px", fontSize: 13, color: "#6b7280" }}>{bank.accountName}</p>
                  {bank.description && (
                    <p style={{ margin: "0 0 12px", fontSize: 11, color: "#9ca3af",
                      fontStyle: "italic" }}>{bank.description}</p>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button onClick={() => openEditBank(bank)}
                      style={{ flex: 1, padding: "8px", borderRadius: 9, border: "1px solid #e5e7eb",
                        background: "#fff", cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#374151" }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDeleteBank(bank._id)}
                      style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #fecaca",
                        background: "#fee2e2", cursor: "pointer" }}>
                      <Trash2 size={13} color="#dc2626" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Detail modal */}
      {detailPayment && (
        <Modal title="Payment Details" onClose={() => setDetailPayment(null)}>
          <DetailRow label="Reference"   value={detailPayment.reference} />
          <DetailRow label="User"        value={`${detailPayment.user?.name || "—"} (${detailPayment.user?.email || ""})`} />
          <DetailRow label="Item"        value={detailPayment.course?.title || "Wallet Top-up"} />
          <DetailRow label="Amount"      value={fmt(detailPayment.amount)} />
          <DetailRow label="Method"      value={METHOD[detailPayment.paymentMethod]?.label || detailPayment.paymentMethod} />
          <DetailRow label="Status"      value={STATUS[detailPayment.status]?.label || detailPayment.status} />
          <DetailRow label="Type"        value={detailPayment.type?.replace(/_/g, " ")} />
          <DetailRow label="Date"        value={fmtDate(detailPayment.createdAt)} />
          {detailPayment.paidAt && <DetailRow label="Paid At" value={fmtDate(detailPayment.paidAt)} />}
          {detailPayment.bankTransfer?.senderName && (
            <DetailRow label="Sender" value={`${detailPayment.bankTransfer.senderName} · ${detailPayment.bankTransfer.senderBank || ""}`} />
          )}
          {detailPayment.bankTransfer?.proofOfPayment?.url && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700,
                textTransform: "uppercase", marginBottom: 8 }}>Proof of Payment</p>
              <a href={detailPayment.bankTransfer.proofOfPayment.url} target="_blank" rel="noreferrer">
                <img src={detailPayment.bankTransfer.proofOfPayment.url} alt="proof"
                  style={{ width: "100%", borderRadius: 10, border: "1px solid #e5e7eb" }} />
              </a>
            </div>
          )}
        </Modal>
      )}

      {/* Verify modal */}
      {verifyPayment && (
        <Modal title="Approve Payment" onClose={() => { setVerifyPayment(null); setVerifyNotes(""); }}>
          <div style={{ marginBottom: 16, padding: 14, background: "#dcfce7", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#166534" }}>
              {verifyPayment.user?.name} — {fmt(verifyPayment.amount)}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#16a34a" }}>
              {verifyPayment.reference}
            </p>
          </div>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea value={verifyNotes} onChange={e => setVerifyNotes(e.target.value)}
            rows={3} placeholder="Internal notes about this verification…"
            style={{ ...inputStyle, resize: "vertical", marginBottom: 16 }} />
          <button onClick={handleVerify} disabled={submitting}
            style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none",
              background: submitting ? "#e5e7eb" : "#16a34a", color: "#fff",
              fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            {submitting ? "Approving…" : "✓ Approve & Activate Access"}
          </button>
        </Modal>
      )}

      {/* Reject modal */}
      {rejectPayment && (
        <Modal title="Reject Payment" onClose={() => { setRejectPayment(null); setRejectReason(""); }}>
          <div style={{ marginBottom: 16, padding: 14, background: "#fee2e2", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#991b1b" }}>
              {rejectPayment.user?.name} — {fmt(rejectPayment.amount)}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#dc2626" }}>
              {rejectPayment.reference}
            </p>
          </div>
          <label style={labelStyle}>Reason for Rejection *</label>
          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            rows={3} placeholder="Explain why this payment is being rejected…"
            style={{ ...inputStyle, resize: "vertical", marginBottom: 16 }} />
          <button onClick={handleReject} disabled={submitting || !rejectReason.trim()}
            style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none",
              background: submitting || !rejectReason.trim() ? "#e5e7eb" : "#dc2626",
              color: "#fff", fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
              fontSize: 14, cursor: "pointer" }}>
            {submitting ? "Rejecting…" : "✕ Reject Payment"}
          </button>
        </Modal>
      )}

      {/* Bank account modal */}
      {bankModal && (
        <Modal title={editBank ? "Edit Bank Account" : "Add Bank Account"}
          onClose={() => { setBankModal(false); setEditBank(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Bank Name *</label>
              <input value={bankForm.bankName}
                onChange={e => setBankForm(f => ({ ...f, bankName: e.target.value }))}
                style={inputStyle} placeholder="e.g. Access Bank" />
            </div>
            <div>
              <label style={labelStyle}>Account Number *</label>
              <input value={bankForm.accountNumber}
                onChange={e => setBankForm(f => ({ ...f, accountNumber: e.target.value }))}
                style={inputStyle} placeholder="0123456789" maxLength={10} />
            </div>
            <div>
              <label style={labelStyle}>Account Name *</label>
              <input value={bankForm.accountName}
                onChange={e => setBankForm(f => ({ ...f, accountName: e.target.value }))}
                style={inputStyle} placeholder="Edenites Academy Ltd" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={labelStyle}>Bank Code</label>
                <input value={bankForm.bankCode}
                  onChange={e => setBankForm(f => ({ ...f, bankCode: e.target.value }))}
                  style={inputStyle} placeholder="e.g. 044" />
              </div>
              <div>
                <label style={labelStyle}>Display Order</label>
                <input type="number" value={bankForm.displayOrder}
                  onChange={e => setBankForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
                  style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <input value={bankForm.description}
                onChange={e => setBankForm(f => ({ ...f, description: e.target.value }))}
                style={inputStyle} placeholder="e.g. For Naira Payments" />
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                <input type="checkbox" checked={bankForm.isActive}
                  onChange={e => setBankForm(f => ({ ...f, isActive: e.target.checked }))}
                  style={{ accentColor: BRAND, width: 15, height: 15 }} />
                Active
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                <input type="checkbox" checked={bankForm.isPrimary}
                  onChange={e => setBankForm(f => ({ ...f, isPrimary: e.target.checked }))}
                  style={{ accentColor: BRAND, width: 15, height: 15 }} />
                Set as Primary
              </label>
            </div>
            <button onClick={handleSaveBank} disabled={submitting}
              style={{ padding: "12px", borderRadius: 10, border: "none",
                background: submitting ? "#e5e7eb" : `linear-gradient(135deg, ${DARK}, ${BRAND})`,
                color: "#fff", fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
                fontSize: 14, cursor: "pointer",
                boxShadow: submitting ? "none" : "0 4px 14px rgba(12,111,137,0.25)" }}>
              {submitting ? "Saving…" : editBank ? "Update Account" : "Add Account"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
