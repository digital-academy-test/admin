// src/Store/usePaymentStore.js
import { create } from 'zustand';
import api from '../utils/api';         // user auth (Bearer authToken)
import adminApi from '../utils/adminApi'; // staff auth (Bearer staffToken)
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

export const usePaymentStore = create((set, get) => ({
  wallet:             null,
  walletTransactions: [],
  walletPagination:   { total: 0, totalPages: 0, currentPage: 1 },
  bankAccounts:       [],
  payments:           [],
  paymentPagination:  { total: 0, totalPages: 0, currentPage: 1 },
  pendingVerifications: [],
  currentPayment:     null,
  stats:              null,
  loading:            false,
  error:              null,

  // ── Wallet ─────────────────────────────────────────────────────────────────

  getWallet: async () => {
    try {
      const res = await api.get('/payments/wallet');
      set({ wallet: res.data.data });
      return { success: true, data: res.data.data };
    } catch { return { success: false }; }
  },

  getWalletTransactions: async (page = 1) => {
    try {
      const res = await api.get(`/payments/wallet/transactions?page=${page}&limit=20`);
      set({ walletTransactions: res.data.transactions || [], walletPagination: res.data.pagination || {} });
      return { success: true };
    } catch { return { success: false }; }
  },

  // ── Bank accounts ──────────────────────────────────────────────────────────

  getBankAccounts: async () => {
    try {
      const res = await axios.get(`${API_URL}/payments/bank-accounts`);
      set({ bankAccounts: res.data.data || [] });
      return { success: true, data: res.data.data };
    } catch { return { success: false }; }
  },

  // ── Coupon ─────────────────────────────────────────────────────────────────

  validateCoupon: async (code, amount, courseId) => {
    try {
      const res = await api.post('/payments/validate-coupon', { code, amount, courseId });
      return { success: true, data: res.data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  },

  // ── Initialize payment ─────────────────────────────────────────────────────

  initializePayment: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/payments/initialize', data);
      set({ loading: false });
      return { success: true, data: res.data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment initialization failed.';
      toast.error(msg);
      set({ loading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  initializeWalletTopup: async (amount, paymentMethod) => {
    return get().initializePayment({ type: 'wallet_topup', amount, paymentMethod });
  },

  // ── Verify Paystack ────────────────────────────────────────────────────────

  verifyPayment: async (reference) => {
    set({ loading: true });
    try {
      const res = await api.get(`/payments/verify/${reference}`);
      set({ loading: false });
      return { success: true, data: res.data.data };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.response?.data?.message };
    }
  },

  // ── Upload proof ───────────────────────────────────────────────────────────

  uploadProofOfPayment: async (reference, formData) => {
    try {
      const res = await api.post(`/payments/${reference}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data.message || 'Proof uploaded.');
      return { success: true, data: res.data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  },

  // ── Payment history ────────────────────────────────────────────────────────

  getPaymentHistory: async (page = 1) => {
    set({ loading: true });
    try {
      const res = await api.get(`/payments/history?page=${page}&limit=10`);
      set({ payments: res.data.payments || [], paymentPagination: res.data.pagination || {}, loading: false });
      return { success: true };
    } catch { set({ loading: false }); return { success: false }; }
  },

  // ── ADMIN METHODS (use adminApi — staffToken) ──────────────────────────────

  getPayments: async (params = {}) => {
    set({ loading: true });
    try {
      const q = new URLSearchParams(params).toString();
      const res = await adminApi.get(`/admin/payments?${q}`);
      set({ payments: res.data.data || [], paymentPagination: res.data.pagination || {}, loading: false });
      return { success: true };
    } catch { set({ loading: false }); return { success: false }; }
  },

  getPayment: async (id) => {
    set({ loading: true });
    try {
      const res = await adminApi.get(`/admin/payments/${id}`);
      set({ currentPayment: res.data.data, loading: false });
      return { success: true, data: res.data.data };
    } catch { set({ loading: false }); return { success: false }; }
  },

  getPendingVerifications: async () => {
    try {
      const res = await adminApi.get('/admin/payments/pending-verifications');
      set({ pendingVerifications: res.data.data || [] });
      return { success: true, data: res.data.data };
    } catch { return { success: false }; }
  },

  verifyTransfer: async (id, notes = '') => {
    set({ loading: true });
    try {
      const res = await adminApi.put(`/admin/payments/${id}/verify`, { notes });
      toast.success(res.data.message || 'Verified');
      set(s => ({
        payments: s.payments.map(p => p._id === id ? { ...p, status: 'completed', verification: { status: 'verified' } } : p),
        pendingVerifications: s.pendingVerifications.filter(p => p._id !== id),
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      set({ loading: false }); return { success: false };
    }
  },

  rejectTransfer: async (id, reason) => {
    set({ loading: true });
    try {
      const res = await adminApi.put(`/admin/payments/${id}/reject`, { reason });
      toast.success(res.data.message || 'Rejected');
      set(s => ({
        payments: s.payments.map(p => p._id === id ? { ...p, status: 'failed' } : p),
        pendingVerifications: s.pendingVerifications.filter(p => p._id !== id),
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      set({ loading: false }); return { success: false };
    }
  },

  refundPayment: async (id) => {
    set({ loading: true });
    try {
      const res = await adminApi.put(`/admin/payments/${id}/refund`);
      toast.success(res.data.message || 'Refunded');
      set(s => ({ payments: s.payments.map(p => p._id === id ? { ...p, status: 'refunded' } : p), loading: false }));
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      set({ loading: false }); return { success: false };
    }
  },

  getStats: async () => {
    try {
      const res = await adminApi.get('/admin/payments/stats');
      set({ stats: res.data.data });
      return { success: true, data: res.data.data };
    } catch { return { success: false }; }
  },

  // Admin bank accounts
  createBankAccount: async (data) => {
    set({ loading: true });
    try {
      const res = await adminApi.post('/admin/payments/bank-accounts', data);
      toast.success(res.data.message || 'Added');
      set(s => ({ bankAccounts: [...s.bankAccounts, res.data.data], loading: false }));
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      set({ loading: false }); return { success: false };
    }
  },

  updateBankAccount: async (id, data) => {
    set({ loading: true });
    try {
      const res = await adminApi.put(`/admin/payments/bank-accounts/${id}`, data);
      toast.success(res.data.message || 'Updated');
      set(s => ({ bankAccounts: s.bankAccounts.map(a => a._id === id ? res.data.data : a), loading: false }));
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      set({ loading: false }); return { success: false };
    }
  },

  deleteBankAccount: async (id) => {
    set({ loading: true });
    try {
      const res = await adminApi.delete(`/admin/payments/bank-accounts/${id}`);
      toast.success(res.data.message || 'Deleted');
      set(s => ({ bankAccounts: s.bankAccounts.filter(a => a._id !== id), loading: false }));
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      set({ loading: false }); return { success: false };
    }
  },

  clearCurrentPayment: () => set({ currentPayment: null }),
  clearError: () => set({ error: null }),
}));
