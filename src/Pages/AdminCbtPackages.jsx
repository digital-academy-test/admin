// admin/src/Pages/AdminCbtPackages.jsx
// CBT Package management — create packages, link exams, manage access.

import React, { useState, useEffect } from 'react';
import adminApi from '../utils/adminApi';
import toast from 'react-hot-toast';
import {
  Plus, Package, Edit2, Trash2, ToggleLeft, ToggleRight,
  Search, RefreshCcw, ChevronLeft, ChevronRight, X, Check,
  Users, BookOpen, Clock, TrendingUp, Shield, UserPlus,
  ChevronDown, Tag, BarChart2,
} from 'lucide-react';

const BRAND = '#0C6F89';
const DARK  = '#084d63';

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
  borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Poppins', sans-serif", color: '#1a1a1a', background: '#fff',
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#374151',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em',
};

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, Icon, color, sub }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
      padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 900, color: '#1a1a1a',
          fontFamily: "'Montserrat', sans-serif" }}>{value}</p>
        {sub && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Modal shell ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, width = 540 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, width: '100%',
        maxWidth: width, maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0,
          background: '#fff', zIndex: 1 }}>
          <h3 style={{ margin: 0, fontFamily: "'Montserrat', sans-serif",
            fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} color='#9ca3af' />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Exam multi-select ────────────────────────────────────────────────────────
function ExamMultiSelect({ allExams, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const selectedExams = allExams.filter(e => selected.includes(e._id));

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{ ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, minHeight: 42 }}>
        {selectedExams.length === 0 ? (
          <span style={{ color: '#9ca3af' }}>Select exams…</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, flex: 1 }}>
            {selectedExams.map(e => (
              <span key={e._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                background: '#e8f4f8', color: BRAND, fontSize: 11, fontWeight: 700,
                padding: '2px 8px', borderRadius: 20 }}>
                {e.displayName}
                <button type="button" onClick={ev => { ev.stopPropagation(); toggle(e._id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                  <X size={10} color={BRAND} />
                </button>
              </span>
            ))}
          </div>
        )}
        <ChevronDown size={14} color='#9ca3af'
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }} />
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12,
          boxShadow: '0 8px 28px rgba(0,0,0,0.12)', maxHeight: 240, overflowY: 'auto' }}>
          {allExams.length === 0 ? (
            <p style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 13, textAlign: 'center' }}>
              No exams found
            </p>
          ) : allExams.map((exam, i) => (
            <div key={exam._id}
              onClick={() => toggle(exam._id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                cursor: 'pointer', fontSize: 13,
                borderBottom: i < allExams.length - 1 ? '1px solid #f3f4f6' : 'none',
                background: selected.includes(exam._id) ? '#e8f4f8' : 'transparent' }}
              onMouseEnter={e => { if (!selected.includes(exam._id)) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (!selected.includes(exam._id)) e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${selected.includes(exam._id) ? BRAND : '#d1d5db'}`,
                background: selected.includes(exam._id) ? BRAND : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selected.includes(exam._id) && <Check size={11} color='#fff' strokeWidth={3} />}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#1a1a1a' }}>{exam.displayName}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>{exam.category}</p>
              </div>
              {exam.requiresSubscription && (
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: BRAND,
                  background: '#e8f4f8', padding: '2px 6px', borderRadius: 10 }}>GATED</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Feature list editor ──────────────────────────────────────────────────────
function FeatureEditor({ features, onChange }) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (!v) return;
    onChange([...features, { text: v, included: true }]);
    setInput('');
  };

  const remove = (i) => onChange(features.filter((_, j) => j !== i));
  const toggle = (i) => onChange(features.map((f, j) => j === i ? { ...f, included: !f.included } : f));

  return (
    <div>
      {features.map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <button type="button" onClick={() => toggle(i)}
            style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${f.included ? '#16a34a' : '#d1d5db'}`,
              background: f.included ? '#16a34a' : '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {f.included && <Check size={11} color='#fff' strokeWidth={3} />}
          </button>
          <span style={{ flex: 1, fontSize: 13, color: f.included ? '#374151' : '#9ca3af',
            textDecoration: f.included ? 'none' : 'line-through' }}>{f.text}</span>
          <button type="button" onClick={() => remove(i)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
            <X size={13} color='#9ca3af' />
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Add a feature…"
          style={{ ...inputStyle, flex: 1 }} />
        <button type="button" onClick={add}
          style={{ padding: '8px 14px', borderRadius: 8, border: 'none',
            background: BRAND, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const emptyForm = {
  name: '', description: '', badge: '',
  exams: [], price: '', comparePrice: '',
  duration: { value: 30, unit: 'days' },
  features: [], isActive: true, isFeatured: false, displayOrder: 0,
};

export default function AdminCbtPackages() {
  const [tab, setTab] = useState('packages'); // packages | exams | access

  // ── Data ──────────────────────────────────────────────────────────────────
  const [packages,   setPackages]   = useState([]);
  const [allExams,   setAllExams]   = useState([]);
  const [stats,      setStats]      = useState(null);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [loading,    setLoading]    = useState(false);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [pkgModal,       setPkgModal]       = useState(false);
  const [editingPkg,     setEditingPkg]     = useState(null);
  const [form,           setForm]           = useState(emptyForm);
  const [submitting,     setSubmitting]     = useState(false);
  const [grantModal,     setGrantModal]     = useState(null); // package to grant access for
  const [grantForm,      setGrantForm]      = useState({ userId: '', userSearch: '', durationDays: '' });
  const [subscribersModal, setSubscribersModal] = useState(null); // package whose subscribers to view
  const [subscribers,    setSubscribers]    = useState([]);
  const [subLoading,     setSubLoading]     = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pkgRes, examRes, statsRes] = await Promise.all([
        adminApi.get('/admin/cbt-packages'),
        adminApi.get('/cbt/exams?admin=true'),
        adminApi.get('/admin/cbt-packages/stats'),
      ]);
      setPackages(pkgRes.data.data || []);
      setPagination(pkgRes.data.pagination || {});
      setAllExams(examRes.data.exams || []);
      setStats(statsRes.data.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ── Package form helpers ──────────────────────────────────────────────────
  const openCreate = () => {
    setEditingPkg(null);
    setForm(emptyForm);
    setPkgModal(true);
  };

  const openEdit = (pkg) => {
    setEditingPkg(pkg);
    setForm({
      name: pkg.name, description: pkg.description || '', badge: pkg.badge || '',
      exams: pkg.exams.map(e => e._id || e),
      price: pkg.price, comparePrice: pkg.comparePrice || '',
      duration: pkg.duration || { value: 30, unit: 'days' },
      features: pkg.features || [],
      isActive: pkg.isActive, isFeatured: pkg.isFeatured,
      displayOrder: pkg.displayOrder || 0,
    });
    setPkgModal(true);
  };

  const handleSave = async () => {
    if (!form.name || form.price === '') { toast.error('Name and price are required'); return; }
    if (form.exams.length === 0) { toast.error('Select at least one exam'); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        badge: form.badge || null,
      };

      if (editingPkg) {
        await adminApi.put(`/admin/cbt-packages/${editingPkg._id}`, payload);
        toast.success('Package updated');
      } else {
        await adminApi.post('/admin/cbt-packages', payload);
        toast.success('Package created');
      }
      setPkgModal(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package? This cannot be undone.')) return;
    try {
      await adminApi.delete(`/admin/cbt-packages/${id}`);
      toast.success('Package deleted');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await adminApi.patch(`/admin/cbt-packages/${id}/toggle`);
      toast.success(res.data.message);
      loadAll();
    } catch (err) {
      toast.error('Failed');
    }
  };

  // ── Exam subscription toggle ──────────────────────────────────────────────
  const toggleExamSubscription = async (exam) => {
    try {
      const res = await adminApi.patch(
        `/admin/cbt-packages/exam/${exam._id}/subscription-required`,
        { requiresSubscription: !exam.requiresSubscription }
      );
      toast.success(res.data.message);
      setAllExams(prev => prev.map(e => e._id === exam._id
        ? { ...e, requiresSubscription: !e.requiresSubscription } : e
      ));
      setStats(s => s ? { ...s, examsRequiringSubscription: s.examsRequiringSubscription + (!exam.requiresSubscription ? 1 : -1) } : s);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  // ── Grant access ──────────────────────────────────────────────────────────
  const handleGrant = async () => {
    if (!grantForm.userId) { toast.error('Enter a user ID'); return; }
    setSubmitting(true);
    try {
      const res = await adminApi.post(`/admin/cbt-packages/${grantModal._id}/grant`, {
        userId: grantForm.userId,
        durationDays: grantForm.durationDays ? parseInt(grantForm.durationDays) : null,
      });
      toast.success(res.data.message);
      setGrantModal(null);
      setGrantForm({ userId: '', userSearch: '', durationDays: '' });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to grant access');
    } finally {
      setSubmitting(false);
    }
  };

  // ── View subscribers ──────────────────────────────────────────────────────
  const openSubscribers = async (pkg) => {
    setSubscribersModal(pkg);
    setSubLoading(true);
    try {
      const res = await adminApi.get(`/admin/cbt-packages/${pkg._id}/subscribers`);
      setSubscribers(res.data.data || []);
    } catch { toast.error('Failed to load subscribers'); }
    finally { setSubLoading(false); }
  };

  const handleRevoke = async (accessId) => {
    if (!window.confirm('Revoke this access?')) return;
    try {
      await adminApi.delete(`/admin/cbt-packages/access/${accessId}`);
      toast.success('Access revoked');
      setSubscribers(prev => prev.filter(a => a._id !== accessId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const fmt = (n) => `₦${(n || 0).toLocaleString()}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const DURATION_UNITS = ['days', 'weeks', 'months', 'years', 'lifetime'];

  return (
    <div style={{ padding: '24px 20px', fontFamily: "'Poppins', sans-serif", maxWidth: 1100 }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 22, fontWeight: 900,
          margin: '0 0 4px', color: '#1a1a1a' }}>CBT Packages</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>
          Create packages that bundle exams, control access, and manage subscribers
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: 14, marginBottom: 28 }}>
          <StatCard label="Total Packages"   value={stats.totalPackages}             Icon={Package}    color="#8b5cf6" />
          <StatCard label="Active Packages"  value={stats.activePackages}            Icon={Check}      color="#10b981" />
          <StatCard label="Active Subscribers" value={stats.activeAccessRecords}     Icon={Users}      color={BRAND}   />
          <StatCard label="Gated Exams"      value={stats.examsRequiringSubscription} Icon={Shield}    color="#f59e0b" sub="Require subscription" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12,
        padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {[
          { key: 'packages', label: 'Packages',     Icon: Package  },
          { key: 'exams',    label: 'Exam Access',  Icon: Shield   },
        ].map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
              borderRadius: 9, border: 'none', cursor: 'pointer',
              background: tab === key ? '#fff' : 'transparent',
              color: tab === key ? BRAND : '#6b7280',
              fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 700,
              boxShadow: tab === key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: PACKAGES
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'packages' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16 }}>
            <button onClick={loadAll}
              style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #e5e7eb',
                background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: 6, fontSize: 12, fontWeight: 600, color: '#374151' }}>
              <RefreshCcw size={13} /> Refresh
            </button>
            <button onClick={openCreate}
              style={{ padding: '10px 20px', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${DARK}, ${BRAND})`, color: '#fff',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                boxShadow: '0 4px 14px rgba(12,111,137,0.25)' }}>
              <Plus size={15} /> Create Package
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Loading…</p>
          ) : packages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', background: '#fff',
              borderRadius: 16, border: '1px solid #e5e7eb' }}>
              <Package size={44} color='#d1d5db' style={{ marginBottom: 14 }} />
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15,
                color: '#374151', margin: '0 0 6px' }}>No packages yet</p>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                Create your first CBT package to start gating exams
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {packages.map(pkg => (
                <div key={pkg._id}
                  style={{ background: '#fff', border: `1.5px solid ${pkg.isFeatured ? BRAND : '#e5e7eb'}`,
                    borderRadius: 16, overflow: 'hidden',
                    boxShadow: pkg.isFeatured ? '0 4px 20px rgba(12,111,137,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}>

                  {/* Card header */}
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid #f3f4f6',
                    background: pkg.isFeatured ? `linear-gradient(135deg, ${DARK}08, ${BRAND}12)` : '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <p style={{ margin: 0, fontFamily: "'Montserrat', sans-serif",
                            fontSize: 15, fontWeight: 800, color: '#1a1a1a' }}>{pkg.name}</p>
                          {pkg.badge && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: BRAND,
                              background: '#e8f4f8', padding: '2px 7px', borderRadius: 20 }}>
                              {pkg.badge}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', lineHeight: 1.4 }}>
                          {pkg.description || 'No description'}
                        </p>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: pkg.isActive ? '#dcfce7' : '#fee2e2',
                        color: pkg.isActive ? '#166534' : '#991b1b', flexShrink: 0 }}>
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '14px 18px' }}>
                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 24,
                        fontWeight: 900, color: DARK }}>{fmt(pkg.price)}</span>
                      {pkg.comparePrice && (
                        <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>
                          {fmt(pkg.comparePrice)}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>
                        / {pkg.duration?.value} {pkg.duration?.unit}
                      </span>
                    </div>

                    {/* Exams */}
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#9ca3af',
                        textTransform: 'uppercase', letterSpacing: '0.06em' }}>Exams Included</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {(pkg.exams || []).map(e => (
                          <span key={e._id || e} style={{ fontSize: 11, fontWeight: 600, color: BRAND,
                            background: '#e8f4f8', padding: '3px 9px', borderRadius: 20 }}>
                            {e.displayName || e}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 12, color: '#6b7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={13} color='#9ca3af' /> {pkg.totalSubscribers} subscribers
                      </span>
                      {pkg.discountPercentage > 0 && (
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>
                          {pkg.discountPercentage}% off
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      <button onClick={() => openEdit(pkg)}
                        style={{ flex: 1, padding: '8px 10px', borderRadius: 9, border: '1px solid #e5e7eb',
                          background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#374151' }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => openSubscribers(pkg)}
                        style={{ flex: 1, padding: '8px 10px', borderRadius: 9, border: '1px solid #e5e7eb',
                          background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: BRAND }}>
                        <Users size={12} /> Subscribers
                      </button>
                      <button onClick={() => setGrantModal(pkg)}
                        style={{ flex: 1, padding: '8px 10px', borderRadius: 9, border: '1px solid #bbf7d0',
                          background: '#dcfce7', cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#166534' }}>
                        <UserPlus size={12} /> Grant
                      </button>
                      <button onClick={() => handleToggle(pkg._id)}
                        style={{ padding: '8px 10px', borderRadius: 9, border: '1px solid #e5e7eb',
                          background: '#fff', cursor: 'pointer' }}>
                        {pkg.isActive
                          ? <ToggleRight size={16} color='#16a34a' />
                          : <ToggleLeft size={16} color='#dc2626' />}
                      </button>
                      <button onClick={() => handleDelete(pkg._id)}
                        style={{ padding: '8px 10px', borderRadius: 9, border: '1px solid #fecaca',
                          background: '#fee2e2', cursor: 'pointer' }}>
                        <Trash2 size={13} color='#dc2626' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: EXAM ACCESS CONTROL
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'exams' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={16} color={BRAND} />
            <div>
              <p style={{ margin: 0, fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: 14, color: '#1a1a1a' }}>
                Exam Subscription Requirements
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
                Toggle to require a subscription before users can access an exam.
                Off = free for all existing and new users.
              </p>
            </div>
          </div>
          <div>
            {allExams.map((exam, i) => (
              <div key={exam._id}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                  borderBottom: i < allExams.length - 1 ? '1px solid #f9fafb' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={18} color={BRAND} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
                    {exam.displayName}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>
                    {exam.category} · {exam.name}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: exam.requiresSubscription ? BRAND : '#9ca3af',
                    fontWeight: 600 }}>
                    {exam.requiresSubscription ? 'Subscription Required' : 'Free Access'}
                  </span>
                  <button onClick={() => toggleExamSubscription(exam)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    {exam.requiresSubscription
                      ? <ToggleRight size={28} color={BRAND} />
                      : <ToggleLeft size={28} color='#d1d5db' />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: CREATE / EDIT PACKAGE
      ══════════════════════════════════════════════════════════════════════ */}
      {pkgModal && (
        <Modal title={editingPkg ? 'Edit Package' : 'Create Package'}
          onClose={() => setPkgModal(false)} width={580}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={labelStyle}>Package Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={inputStyle} placeholder='e.g. WAEC Prep Bundle' />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2} style={{ ...inputStyle, resize: 'vertical' }}
                placeholder='What does this package offer?' />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Badge (optional)</label>
                <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                  style={inputStyle} placeholder='e.g. Most Popular' />
              </div>
              <div>
                <label style={labelStyle}>Display Order</label>
                <input type='number' value={form.displayOrder}
                  onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
                  style={inputStyle} min='0' />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Exams Included *</label>
              <ExamMultiSelect
                allExams={allExams}
                selected={form.exams}
                onChange={ids => setForm(f => ({ ...f, exams: ids }))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Price (₦) *</label>
                <input type='number' value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  style={inputStyle} placeholder='e.g. 3000' min='0' />
              </div>
              <div>
                <label style={labelStyle}>Compare Price (₦)</label>
                <input type='number' value={form.comparePrice}
                  onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))}
                  style={inputStyle} placeholder='e.g. 5000 (optional)' min='0' />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Duration Value</label>
                <input type='number'
                  value={form.duration.unit === 'lifetime' ? '' : form.duration.value}
                  disabled={form.duration.unit === 'lifetime'}
                  onChange={e => setForm(f => ({ ...f, duration: { ...f.duration, value: parseInt(e.target.value) || 1 } }))}
                  style={{ ...inputStyle, background: form.duration.unit === 'lifetime' ? '#f9fafb' : '#fff' }}
                  min='1' />
              </div>
              <div>
                <label style={labelStyle}>Duration Unit</label>
                <select value={form.duration.unit}
                  onChange={e => setForm(f => ({ ...f, duration: { ...f.duration, unit: e.target.value } }))}
                  style={inputStyle}>
                  {DURATION_UNITS.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Features</label>
              <FeatureEditor
                features={form.features}
                onChange={feats => setForm(f => ({ ...f, features: feats }))}
              />
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13 }}>
                <input type='checkbox' checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  style={{ accentColor: BRAND, width: 15, height: 15 }} />
                Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13 }}>
                <input type='checkbox' checked={form.isFeatured}
                  onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                  style={{ accentColor: BRAND, width: 15, height: 15 }} />
                Featured
              </label>
            </div>

            <button onClick={handleSave} disabled={submitting}
              style={{ padding: '13px', borderRadius: 10, border: 'none',
                background: submitting ? '#e5e7eb' : `linear-gradient(135deg, ${DARK}, ${BRAND})`,
                color: submitting ? '#9ca3af' : '#fff',
                fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: submitting ? 'none' : '0 4px 14px rgba(12,111,137,0.25)' }}>
              {submitting ? 'Saving…' : editingPkg ? 'Update Package' : 'Create Package'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Grant Access ──────────────────────────────────────────── */}
      {grantModal && (
        <Modal title={`Grant Access — ${grantModal.name}`}
          onClose={() => setGrantModal(null)} width={440}>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
            This will grant access to all {grantModal.exams?.length} exam(s) in this package for the specified user.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>User ID *</label>
              <input value={grantForm.userId}
                onChange={e => setGrantForm(f => ({ ...f, userId: e.target.value }))}
                style={inputStyle} placeholder="Paste the user's MongoDB _id" />
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>
                Find user IDs in your database or user management page
              </p>
            </div>
            <div>
              <label style={labelStyle}>Duration (days)</label>
              <input type='number' value={grantForm.durationDays}
                onChange={e => setGrantForm(f => ({ ...f, durationDays: e.target.value }))}
                style={inputStyle} placeholder='Leave blank for lifetime access' min='1' />
            </div>
            <div style={{ padding: '12px 14px', background: '#fffbeb', borderRadius: 10,
              border: '1px solid #fde68a', fontSize: 12, color: '#92400e' }}>
              <strong>Exams included:</strong>{' '}
              {grantModal.exams?.map(e => e.displayName || e).join(', ')}
            </div>
            <button onClick={handleGrant} disabled={submitting || !grantForm.userId}
              style={{ padding: '12px', borderRadius: 10, border: 'none',
                background: (!grantForm.userId || submitting) ? '#e5e7eb' : '#16a34a',
                color: (!grantForm.userId || submitting) ? '#9ca3af' : '#fff',
                fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {submitting ? 'Granting…' : '✓ Grant Access'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Subscribers ───────────────────────────────────────────── */}
      {subscribersModal && (
        <Modal title={`Subscribers — ${subscribersModal.name}`}
          onClose={() => setSubscribersModal(null)} width={560}>
          {subLoading ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>Loading…</p>
          ) : subscribers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Users size={36} color='#d1d5db' style={{ marginBottom: 10 }} />
              <p style={{ color: '#9ca3af', fontSize: 13 }}>No subscribers yet</p>
            </div>
          ) : (
            <div>
              {subscribers.map((acc, i) => (
                <div key={acc._id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                    borderBottom: i < subscribers.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  {acc.user?.profilePic ? (
                    <img src={acc.user.profilePic} alt=''
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${DARK}, ${BRAND})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {(acc.user?.name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#1a1a1a',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {acc.user?.name || 'Unknown User'}
                    </p>
                    <p style={{ margin: '1px 0 0', fontSize: 11, color: '#9ca3af' }}>
                      {acc.exam?.displayName} · {acc.grantType} · Expires: {fmtDate(acc.expiresAt)}
                    </p>
                  </div>
                  <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: acc.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: acc.status === 'active' ? '#166534' : '#991b1b', flexShrink: 0 }}>
                    {acc.status}
                  </span>
                  {acc.status === 'active' && (
                    <button onClick={() => handleRevoke(acc._id)}
                      style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #fecaca',
                        background: '#fee2e2', cursor: 'pointer' }}>
                      <X size={12} color='#dc2626' />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
