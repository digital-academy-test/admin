// admin/src/Pages/AdminCoupons.jsx
import React, { useState, useEffect } from 'react';
import adminApi from '../utils/adminApi';
import toast from 'react-hot-toast';
import {
  Plus, Tag, Edit2, Trash2, ToggleLeft, ToggleRight,
  Search, RefreshCcw, ChevronLeft, ChevronRight, X, Check,
  Percent, DollarSign, Calendar, Users,
} from 'lucide-react';

const BRAND = '#0C6F89';
const DARK  = '#084d63';

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
  borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Poppins', sans-serif",
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#374151',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em',
};

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, width: '100%',
        maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ margin: 0, fontFamily: "'Montserrat', sans-serif", fontSize: 16, fontWeight: 800 }}>
            {title}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color='#9ca3af' />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

const emptyForm = {
  code: '', description: '', discountType: 'percentage', discountValue: '',
  minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', usageLimitPerUser: 1,
  validFrom: '', validUntil: '', isActive: true,
};

export default function AdminCoupons() {
  const [coupons,    setCoupons]    = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(false);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [search]);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 15 });
      if (search) q.set('search', search);
      const res = await adminApi.get(`/admin/coupons?${q}`);
      setCoupons(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description || '',
      discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || '', maxDiscountAmount: c.maxDiscountAmount || '',
      usageLimit: c.usageLimit || '', usageLimitPerUser: c.usageLimitPerUser || 1,
      validFrom: c.validFrom ? c.validFrom.split('T')[0] : '',
      validUntil: c.validUntil ? c.validUntil.split('T')[0] : '',
      isActive: c.isActive,
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue) {
      toast.error('Code and discount value are required'); return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : 0,
        maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        usageLimitPerUser: parseInt(form.usageLimitPerUser) || 1,
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || null,
      };
      if (editing) {
        await adminApi.put(`/admin/coupons/${editing._id}`, payload);
        toast.success('Coupon updated');
      } else {
        await adminApi.post('/admin/coupons', payload);
        toast.success('Coupon created');
      }
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await adminApi.delete(`/admin/coupons/${id}`);
      toast.success('Deleted');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await adminApi.patch(`/admin/coupons/${id}/toggle`);
      toast.success(res.data.message);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const fmt = (n) => `₦${(n || 0).toLocaleString()}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const isExpired = (c) => c.validUntil && new Date(c.validUntil) < new Date();

  return (
    <div style={{ padding: '24px 20px', fontFamily: "'Poppins', sans-serif", maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 22, fontWeight: 900, margin: '0 0 4px' }}>
          Coupons
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>
          Create and manage discount coupons for courses
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} color='#9ca3af'
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder='Search by code…'
            style={{ ...inputStyle, paddingLeft: 34 }} />
        </div>
        <button onClick={() => load()}
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb',
            background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, color: '#374151' }}>
          <RefreshCcw size={13} /> Refresh
        </button>
        <button onClick={openCreate}
          style={{ padding: '10px 20px', borderRadius: 10, border: 'none',
            background: `linear-gradient(135deg, ${DARK}, ${BRAND})`, color: '#fff',
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
            boxShadow: '0 4px 14px rgba(12,111,137,0.25)' }}>
          <Plus size={15} /> Create Coupon
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Loading…</p>
        ) : coupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <Tag size={40} color='#d1d5db' style={{ marginBottom: 12 }} />
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>
              No coupons yet
            </p>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Create a coupon to start offering discounts</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f3f4f6' }}>
                    {['Code', 'Discount', 'Usage', 'Valid Until', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700,
                        color: '#6b7280', fontSize: 11, textTransform: 'uppercase',
                        letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #f9fafb' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 14,
                            color: DARK, background: '#e8f4f8', padding: '3px 8px', borderRadius: 6 }}>
                            {c.code}
                          </span>
                        </div>
                        {c.description && (
                          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af' }}>{c.description}</p>
                        )}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {c.discountType === 'percentage'
                            ? <Percent size={13} color='#8b5cf6' />
                            : <DollarSign size={13} color='#10b981' />}
                          <span style={{ fontWeight: 700, color: '#1a1a1a' }}>
                            {c.discountType === 'percentage'
                              ? `${c.discountValue}% off`
                              : `${fmt(c.discountValue)} off`}
                          </span>
                        </div>
                        {c.minOrderAmount > 0 && (
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>
                            Min: {fmt(c.minOrderAmount)}
                          </p>
                        )}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Users size={12} color='#9ca3af' />
                          <span style={{ color: '#374151' }}>
                            {c.timesUsed}{c.usageLimit ? `/${c.usageLimit}` : ''} uses
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Calendar size={12} color='#9ca3af' />
                          <span style={{ color: isExpired(c) ? '#ef4444' : '#374151', fontSize: 12 }}>
                            {fmtDate(c.validUntil)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: !c.isActive ? '#fee2e2' : isExpired(c) ? '#fef9c3' : '#dcfce7',
                          color: !c.isActive ? '#991b1b' : isExpired(c) ? '#854d0e' : '#166534',
                        }}>
                          {!c.isActive ? 'Inactive' : isExpired(c) ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(c)}
                            style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #e5e7eb',
                              background: '#fff', cursor: 'pointer' }}>
                            <Edit2 size={13} color='#6b7280' />
                          </button>
                          <button onClick={() => handleToggle(c._id)}
                            style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #e5e7eb',
                              background: c.isActive ? '#dcfce7' : '#fee2e2', cursor: 'pointer' }}>
                            {c.isActive
                              ? <ToggleRight size={14} color='#16a34a' />
                              : <ToggleLeft size={14} color='#dc2626' />}
                          </button>
                          <button onClick={() => handleDelete(c._id)}
                            style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #fecaca',
                              background: '#fee2e2', cursor: 'pointer' }}>
                            <Trash2 size={13} color='#dc2626' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => load(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb',
                      background: '#fff', cursor: 'pointer', opacity: pagination.currentPage === 1 ? 0.4 : 1 }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => load(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb',
                      background: '#fff', cursor: 'pointer',
                      opacity: pagination.currentPage === pagination.totalPages ? 0.4 : 1 }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <Modal title={editing ? 'Edit Coupon' : 'Create Coupon'} onClose={() => setModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Code *</label>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  style={inputStyle} placeholder='e.g. SAVE20' />
              </div>
              <div>
                <label style={labelStyle}>Discount Type *</label>
                <select value={form.discountType}
                  onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                  style={inputStyle}>
                  <option value='percentage'>Percentage (%)</option>
                  <option value='fixed'>Fixed Amount (₦)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>
                  {form.discountType === 'percentage' ? 'Percentage (1–100) *' : 'Amount (₦) *'}
                </label>
                <input type='number' value={form.discountValue}
                  onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                  style={inputStyle} placeholder={form.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 2000'}
                  min='0' max={form.discountType === 'percentage' ? 100 : undefined} />
              </div>
              {form.discountType === 'percentage' && (
                <div>
                  <label style={labelStyle}>Max Discount Cap (₦)</label>
                  <input type='number' value={form.maxDiscountAmount}
                    onChange={e => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))}
                    style={inputStyle} placeholder='e.g. 5000 (optional)' min='0' />
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <input value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={inputStyle} placeholder='Internal note about this coupon' />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Min Order Amount (₦)</label>
                <input type='number' value={form.minOrderAmount}
                  onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                  style={inputStyle} placeholder='0 = no minimum' min='0' />
              </div>
              <div>
                <label style={labelStyle}>Per User Limit</label>
                <input type='number' value={form.usageLimitPerUser}
                  onChange={e => setForm(f => ({ ...f, usageLimitPerUser: e.target.value }))}
                  style={inputStyle} min='1' />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Total Usage Limit</label>
                <input type='number' value={form.usageLimit}
                  onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                  style={inputStyle} placeholder='Blank = unlimited' min='1' />
              </div>
              <div>
                <label style={labelStyle}>Valid From</label>
                <input type='date' value={form.validFrom}
                  onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                  style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Valid Until</label>
              <input type='date' value={form.validUntil}
                onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
                style={inputStyle} />
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>Leave blank for no expiry</p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input type='checkbox' checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                style={{ accentColor: BRAND, width: 15, height: 15 }} />
              Active (users can apply this coupon)
            </label>

            <button onClick={handleSave} disabled={submitting}
              style={{ padding: '12px', borderRadius: 10, border: 'none',
                background: submitting ? '#e5e7eb' : `linear-gradient(135deg, ${DARK}, ${BRAND})`,
                color: '#fff', fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: submitting ? 'none' : '0 4px 14px rgba(12,111,137,0.25)' }}>
              {submitting ? 'Saving…' : editing ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
