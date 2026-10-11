const API_URL = 'http://localhost:5000/api/orders';

const getAuthHeaders = () => {
  const token = localStorage.getItem('baking_corner_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};


export const createOrder = async (orderData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(), // <--- הוספנו כאן את ה-Token המאמת
    body: JSON.stringify(orderData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create order');
  }

  return data;
};