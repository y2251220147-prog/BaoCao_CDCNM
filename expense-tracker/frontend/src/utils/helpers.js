// Format currency (VND)
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// Format date to dd/MM/yyyy
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
};

// Current month string e.g. "2024-04"
export const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// Clamp percentage 0–100
export const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v));

export const StatusMap = {
  'completed': 'Hoàn thành',
  'pending': 'Đang chờ',
  'cancelled': 'Đã hủy'
};
