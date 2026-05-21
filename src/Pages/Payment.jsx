// src/Pages/Dashboard/Payment.jsx
// Supports: Paystack | Wallet | Bank Transfer + coupon codes

import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../Store/authStore';
import { usePaymentStore } from '../../Store/usePaymentStore';
import {
  CreditCard, Building, Wallet, ArrowLeft, Check, Copy,
  Upload, Loader2, X, Clock, CheckCircle, Shield, Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BRAND = '#0C6F89';
const DARK  = '#084d63';

const METHODS = [
  { id: 'paystack',      label: 'Pay with Card',    desc: 'Instant via Paystack',      Icon: CreditCard, color: '#3b82f6' },
  { id: 'wallet',        label: 'Pay from Wallet',  desc: 'Use your wallet balance',   Icon: Wallet,     color: '#10b981' },
  { id: 'bank_transfer', label: 'Bank Transfer',    desc: 'Transfer + upload proof',   Icon: Building,   color: '#f59e0b' },
];

const inputStyle = {
  width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb',
  borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: "'Poppins', sans-serif",
  boxSizing: 'border-box',
};

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const {
    wallet, bankAccounts, loading,
    getWallet, getBankAccounts,
    initializePayment, initializeWalletTopup,
    uploadProofOfPayment, validateCoupon,
  } = usePaymentStore();

  // Context from navigate state or URL params
  const state = location.state || {};
  const params = new URLSearchParams(location.search);
  const type      = state.type    || params.get('type')   || 'course';
  const itemId    = state.itemId  || params.get('itemId') || state.course?._id;
  const itemName  = state.name    || params.get('name')   || state.course?.title || '';
  const itemPrice = parseFloat(state.price || params.get('price') || state.course?.price || 0);
  const itemImage = state.image   || state.course?.thumbnail || null;

  const [step,            setStep]            = useState(1);
  const [selectedMethod,  setSelectedMethod]  = useState(null);
  const [paymentRef,      setPaymentRef]      = useState(null);
  const [bankData,        setBankData]        = useState(null); // {bankAccounts, amount, reference}
  const [proofFile,       setProofFile]       = useState(null);
  const [proofPreview,    setProofPreview]    = useState(null);
  const [transferDetails, setTransferDetails] = useState({ senderName: '', senderBank: '', transferDate: '' });
  const [uploading,       setUploading]       = useState(false);
  const [uploadDone,      setUploadDone]      = useState(false);
  const [copied,          setCopied]          = useState(null);

  // Coupon state
  const [couponInput,    setCouponInput]    = useState('');
  const [couponApplied,  setCouponApplied]  = useState(null); // { code, discountAmount, finalAmount }
  const [couponLoading,  setCouponLoading]  = useState(false);

  const finalAmount = couponApplied ? couponApplied.finalAmount : itemPrice;

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getWallet();
    getBankAccounts();
  }, []);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const walletOk = wallet && wallet.balance >= finalAmount;

  // ── Apply coupon ─────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    const result = await validateCoupon(couponInput.trim(), itemPrice, itemId);
    setCouponLoading(false);
    if (result.success) {
      setCouponApplied(result.data);
      toast.success(result.data.message || 'Coupon applied!');
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponInput('');
  };

  // ── Proceed to pay ────────────────────────────────────────────────────────────
  const handleProceed = async () => {
    if (!selectedMethod) return;

    const payload = {
      type,
      itemId,
      paymentMethod: selectedMethod,
      ...(couponApplied ? { couponCode: couponApplied.code } : {}),
      ...(type === 'wallet_topup' ? { amount: finalAmount } : {}),
    };

    const result = await initializePayment(payload);
    if (!result.success) return;

    if (selectedMethod === 'paystack') {
      window.location.href = result.data.authorizationUrl;
    } else if (selectedMethod === 'wallet') {
      navigate(`/payment/success?reference=${result.data.reference}`);
    } else if (selectedMethod === 'bank_transfer') {
      setBankData(result.data);
      setPaymentRef(result.data.reference);
      setStep(3);
    }
  };

  // ── Upload proof ──────────────────────────────────────────────────────────────
  const handleUploadProof = async () => {
    if (!proofFile || !paymentRef) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', proofFile);
    fd.append('senderName', transferDetails.senderName);
    fd.append('senderBank', transferDetails.senderBank);
    fd.append('transferDate', transferDetails.transferDate);
    const result = await uploadProofOfPayment(paymentRef, fd);
    setUploading(false);
    if (result.success) setUploadDone(true);
  };

  const fmt = (n) => `₦${(n || 0).toLocaleString()}`;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", padding: '24px 16px', maxWidth: 560, margin: '0 auto' }}>
      <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>
        <ArrowLeft size={15} /> Back
      </button>

      {/* ── STEP 1: Order review + coupon ──────────────────────────────────── */}
      {step === 1 && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 18, fontWeight: 800, margin: 0 }}>
              Order Summary
            </h2>
          </div>
          <div style={{ padding: 24 }}>
            {/* Item */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 20, padding: 14,
              background: '#f8fafc', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              {itemImage && (
                <img src={itemImage} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', margin: '0 0 4px' }}>{itemName}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, textTransform: 'capitalize' }}>
                  {type === 'wallet_topup' ? 'Wallet Top-up' : type}
                </p>
              </div>
            </div>

            {/* Coupon input */}
            {type === 'course' && (
              <div style={{ marginBottom: 20 }}>
                {couponApplied ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    background: '#dcfce7', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                    <Tag size={15} color='#16a34a' />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#166534' }}>
                      {couponApplied.code} — saving {fmt(couponApplied.discountAmount)}
                    </span>
                    <button onClick={removeCoupon}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                      <X size={14} color='#16a34a' />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Coupon code"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()}
                      style={{ padding: '12px 16px', borderRadius: 10, border: 'none',
                        background: couponInput.trim() ? BRAND : '#e5e7eb',
                        color: couponInput.trim() ? '#fff' : '#9ca3af',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                      {couponLoading ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Tag size={14} />}
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Price breakdown */}
            <div style={{ padding: '14px 0', borderTop: '1px solid #f3f4f6',
              borderBottom: '1px solid #f3f4f6', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8,
                fontSize: 14, color: '#6b7280' }}>
                <span>Subtotal</span><span>{fmt(itemPrice)}</span>
              </div>
              {couponApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8,
                  fontSize: 14, color: '#16a34a', fontWeight: 600 }}>
                  <span>Coupon ({couponApplied.code})</span>
                  <span>−{fmt(couponApplied.discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16,
                fontWeight: 800, color: DARK, fontFamily: "'Montserrat', sans-serif" }}>
                <span>Total</span><span>{fmt(finalAmount)}</span>
              </div>
            </div>

            {/* Trust badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
              padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
              <Shield size={14} color='#16a34a' />
              <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>Secure payment protected by SSL</span>
            </div>

            <button onClick={() => setStep(2)}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${DARK}, ${BRAND})`,
                color: '#fff', fontFamily: "'Montserrat', sans-serif",
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(12,111,137,0.3)' }}>
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Choose payment method ──────────────────────────────────── */}
      {step === 2 && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 18, fontWeight: 800, margin: 0 }}>
              Choose Payment Method
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
              Total: <strong style={{ color: BRAND }}>{fmt(finalAmount)}</strong>
              {couponApplied && <span style={{ color: '#16a34a', marginLeft: 8, fontSize: 12 }}>
                (saving {fmt(couponApplied.discountAmount)})
              </span>}
            </p>
          </div>

          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {METHODS.filter(m => !(m.id === 'wallet' && type === 'wallet_topup')).map(({ id, label, desc, Icon, color }) => {
              const disabled = id === 'wallet' && !walletOk;
              const active = selectedMethod === id;
              return (
                <button key={id} type='button'
                  onClick={() => !disabled && setSelectedMethod(id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    borderRadius: 12, border: `2px solid ${active ? BRAND : '#e5e7eb'}`,
                    background: active ? '#e8f4f8' : disabled ? '#f9fafb' : '#fff',
                    cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left',
                    opacity: disabled ? 0.6 : 1, transition: 'all 0.15s' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>
                      {id === 'wallet'
                        ? wallet
                          ? `Balance: ${fmt(wallet.balance)}${!walletOk ? ' — insufficient' : ''}`
                          : 'Loading…'
                        : desc}
                    </p>
                  </div>
                  {active && <Check size={18} color={BRAND} />}
                </button>
              );
            })}

            <button onClick={handleProceed} disabled={!selectedMethod || loading}
              style={{ marginTop: 8, padding: '14px', borderRadius: 12, border: 'none',
                background: selectedMethod && !loading ? `linear-gradient(135deg, ${DARK}, ${BRAND})` : '#e5e7eb',
                color: selectedMethod && !loading ? '#fff' : '#9ca3af',
                fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 700,
                cursor: selectedMethod && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading
                ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Processing…</>
                : `Pay ${fmt(finalAmount)}`}
            </button>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* ── STEP 3: Bank transfer ───────────────────────────────────────────── */}
      {step === 3 && (
        uploadDone ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb',
            padding: 32, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={36} color='#16a34a' />
            </div>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>
              Proof Submitted!
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
              We will verify your transfer within <strong>3 working days</strong> and activate your access.
            </p>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10, marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>Reference</p>
              <code style={{ fontSize: 13, fontWeight: 700 }}>{paymentRef}</code>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to='/dashboard/history'
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #e5e7eb',
                  color: '#374151', fontWeight: 600, textDecoration: 'none', textAlign: 'center', fontSize: 14 }}>
                View History
              </Link>
              <Link to='/dashboard'
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${DARK}, ${BRAND})`, color: '#fff',
                  fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textDecoration: 'none',
                  textAlign: 'center', fontSize: 14 }}>
                Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Bank accounts */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, margin: 0 }}>
                  Bank Transfer Details
                </h2>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Amount */}
                <div style={{ padding: 16, background: '#e8f4f8', borderRadius: 12, textAlign: 'center',
                  border: `1px solid ${BRAND}30` }}>
                  <p style={{ fontSize: 11, color: BRAND, margin: '0 0 4px', fontWeight: 700,
                    textTransform: 'uppercase' }}>Amount to Transfer</p>
                  <p style={{ fontSize: 28, fontWeight: 900, color: DARK, margin: 0,
                    fontFamily: "'Montserrat', sans-serif" }}>
                    {fmt(bankData?.amount || finalAmount)}
                  </p>
                  {couponApplied && (
                    <p style={{ fontSize: 11, color: '#16a34a', margin: '4px 0 0' }}>
                      Includes {fmt(couponApplied.discountAmount)} coupon discount
                    </p>
                  )}
                </div>

                {/* Reference */}
                <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 6px', fontWeight: 600,
                    textTransform: 'uppercase' }}>Include this reference in your transfer narration</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code style={{ fontSize: 13, fontWeight: 700 }}>{paymentRef}</code>
                    <button onClick={() => copy(paymentRef, 'ref')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      {copied === 'ref' ? <Check size={15} color='#16a34a' /> : <Copy size={15} color='#9ca3af' />}
                    </button>
                  </div>
                </div>

                {/* Bank account cards */}
                {(bankData?.bankAccounts || bankAccounts).map(acc => (
                  <div key={acc._id}
                    style={{ padding: '14px 16px', border: '1.5px solid #e5e7eb', borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', margin: '0 0 4px' }}>
                          {acc.bankName}
                        </p>
                        <p style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: DARK, margin: '0 0 2px' }}>
                          {acc.accountNumber}
                        </p>
                        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{acc.accountName}</p>
                      </div>
                      <button onClick={() => copy(acc.accountNumber, acc._id)}
                        style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
                          background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center',
                          gap: 4, fontSize: 12, fontWeight: 600 }}>
                        {copied === acc._id
                          ? <><Check size={13} color='#16a34a' /> Copied</>
                          : <><Copy size={13} color='#9ca3af' /> Copy</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload proof */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, margin: 0 }}>
                  Upload Proof of Payment
                </h2>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {proofPreview ? (
                  <div style={{ position: 'relative' }}>
                    <img src={proofPreview} alt='proof'
                      style={{ width: '100%', maxHeight: 200, objectFit: 'contain',
                        borderRadius: 10, border: '1px solid #e5e7eb' }} />
                    <button onClick={() => { setProofFile(null); setProofPreview(null); }}
                      style={{ position: 'absolute', top: 8, right: 8, background: '#fff',
                        border: '1px solid #e5e7eb', borderRadius: '50%', padding: 4, cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', border: '2px dashed #e5e7eb', borderRadius: 12,
                    padding: 24, cursor: 'pointer', background: '#fafafa', minHeight: 120 }}>
                    <Upload size={28} color='#d1d5db' style={{ marginBottom: 8 }} />
                    <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>Click to upload receipt / screenshot</p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#d1d5db' }}>PNG, JPG up to 5MB</p>
                    <input type='file' accept='image/*' style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files[0]; if (!f) return;
                        setProofFile(f);
                        const r = new FileReader();
                        r.onloadend = () => setProofPreview(r.result);
                        r.readAsDataURL(f);
                      }} />
                  </label>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                      Your Name
                    </label>
                    <input style={inputStyle} placeholder='Name on account'
                      value={transferDetails.senderName}
                      onChange={e => setTransferDetails(t => ({ ...t, senderName: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                      Your Bank
                    </label>
                    <input style={inputStyle} placeholder='e.g. GTBank'
                      value={transferDetails.senderBank}
                      onChange={e => setTransferDetails(t => ({ ...t, senderBank: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                    Transfer Date
                  </label>
                  <input type='date' style={inputStyle}
                    value={transferDetails.transferDate}
                    onChange={e => setTransferDetails(t => ({ ...t, transferDate: e.target.value }))} />
                </div>

                <button onClick={handleUploadProof} disabled={!proofFile || uploading}
                  style={{ padding: '14px', borderRadius: 12, border: 'none',
                    background: proofFile && !uploading ? `linear-gradient(135deg, ${DARK}, ${BRAND})` : '#e5e7eb',
                    color: proofFile && !uploading ? '#fff' : '#9ca3af',
                    fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700,
                    cursor: proofFile && !uploading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {uploading
                    ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Uploading…</>
                    : <><Upload size={15} /> Submit Proof</>}
                </button>
              </div>
            </div>

            {/* Notice */}
            <div style={{ display: 'flex', gap: 12, padding: '14px 16px', background: '#fffbeb',
              borderRadius: 12, border: '1px solid #fde68a' }}>
              <Clock size={18} color='#d97706' style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontWeight: 700, color: '#92400e', fontSize: 13, margin: '0 0 2px' }}>
                  Verification takes up to 3 working days
                </p>
                <p style={{ fontSize: 12, color: '#b45309', margin: 0 }}>
                  Access is activated automatically once confirmed.
                </p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
