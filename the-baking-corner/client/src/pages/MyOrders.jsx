import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import socket from '../services/socket';

const MY_ORDERS_API =
  'http://localhost:5000/api/my-orders';

export default function MyOrders({
  onProductsChanged
}) {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] =
    useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] =
    useState(false);
  const [cancellingOrderId, setCancellingOrderId] =
    useState(null);

  const getToken = () =>
    localStorage.getItem('baking_corner_token');

  const readJsonResponse = async (response) => {
    const contentType =
      response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      throw new Error(
        `The server returned an invalid response (${response.status})`
      );
    }

    return response.json();
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const token = getToken();

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(MY_ORDERS_API, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await readJsonResponse(response);

        if (!response.ok) {
          throw new Error(
            data.error || 'Failed to load orders'
          );
        }

        setOrders(data);
      } catch (error) {
        console.error('Error loading orders:', error);

        toast.error(error.message, {
          id: 'my-orders-error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    socket.on(
     'orders:changed',
    fetchOrders
   );

  return () => {
   socket.off(
     'orders:changed',
    fetchOrders
  );
};
  }, [navigate]);

  const handleViewDetails = async (orderId) => {
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
      setOrderItems([]);
      return;
    }

    const token = getToken();

    if (!token) {
      navigate('/login');
      return;
    }

    setIsLoadingItems(true);

    try {
      const response = await fetch(
        `${MY_ORDERS_API}/${orderId}/items`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to load order details'
        );
      }

      setSelectedOrderId(orderId);
      setOrderItems(data);
    } catch (error) {
      console.error(
        'Error loading order details:',
        error
      );

      toast.error(error.message, {
        id: `my-order-error-${orderId}`
      });
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order?'
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      navigate('/login');
      return;
    }

    setCancellingOrderId(orderId);

    try {
      const response = await fetch(
        `${MY_ORDERS_API}/${orderId}/cancel`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to cancel order'
        );
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          Number(order.id) === Number(orderId)
            ? {
                ...order,
                status: 'cancelled'
              }
            : order
        )
      );

      await onProductsChanged?.();

      toast.success(
        'Order cancelled successfully',
        {
          id: `cancel-order-${orderId}`
        }
      );
    } catch (error) {
      console.error(
        'Error cancelling order:',
        error
      );

      toast.error(error.message, {
        id: `cancel-order-error-${orderId}`
      });
    } finally {
      setCancellingOrderId(null);
    }
  };

  const formatStatus = (status = 'pending') =>
    status.charAt(0).toUpperCase() +
    status.slice(1);

  if (isLoading) {
    return (
      <p style={{ textAlign: 'center' }}>
        Loading your orders...
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '50px'
        }}
      >
        <h2>My Orders</h2>

        <p>You have no orders yet.</p>

        <Link
          to="/"
          className="btn-primary"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            marginTop: '15px'
          }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <h2>My Orders</h2>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        {orders.map((order) => (
          <section
            key={order.id}
            style={{
              backgroundColor: '#fff',
              border:
                '1px solid var(--border-light)',
              padding: '20px'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <div>
                <h3
                  style={{
                    margin: '0 0 8px'
                  }}
                >
                  Order #{order.id}
                </h3>

                <span
                  style={{
                    color: 'var(--text-muted)'
                  }}
                >
                  {new Date(
                    order.order_date
                  ).toLocaleString()}
                </span>
              </div>

              <div
                style={{
                  textAlign: 'right'
                }}
              >
                <strong>
                  ₪
                  {Number(
                    order.total_amount
                  ).toFixed(2)}
                </strong>

                <div
                  style={{
                    marginTop: '8px'
                  }}
                >
                  <span
                    style={statusStyle(
                      order.status
                    )}
                  >
                    {formatStatus(
                      order.status
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '15px',
                color: 'var(--text-muted)'
              }}
            >
              <p>
                <strong>Delivery:</strong>{' '}
                {order.shipping_address},{' '}
                {order.shipping_city}
              </p>

              <p>
                <strong>Payment:</strong>{' '}
                {order.payment_method ===
                'credit-card'
                  ? 'Credit Card'
                  : 'Cash on Delivery'}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  handleViewDetails(order.id)
                }
                disabled={isLoadingItems}
              >
                {selectedOrderId === order.id
                  ? 'Hide Details'
                  : 'View Details'}
              </button>

              {order.status === 'pending' && (
                <button
                  type="button"
                  onClick={() =>
                    handleCancelOrder(order.id)
                  }
                  disabled={
                    cancellingOrderId === order.id
                  }
                  style={{
                    padding: '10px 20px',
                    border:
                      '1px solid #e74c3c',
                    backgroundColor: '#fff',
                    color: '#e74c3c',
                    cursor:
                      cancellingOrderId ===
                      order.id
                        ? 'not-allowed'
                        : 'pointer',
                    opacity:
                      cancellingOrderId ===
                      order.id
                        ? 0.6
                        : 1
                  }}
                >
                  {cancellingOrderId === order.id
                    ? 'Cancelling...'
                    : 'Cancel Order'}
                </button>
              )}
            </div>

            {selectedOrderId === order.id && (
              <div
                style={{
                  marginTop: '20px',
                  borderTop:
                    '1px solid var(--border-light)',
                  paddingTop: '15px'
                }}
              >
                <h3>Products</h3>

                {orderItems.length === 0 ? (
                  <p>
                    No products found for this order.
                  </p>
                ) : (
                  orderItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        gap: '15px',
                        padding: '10px 0',
                        borderBottom:
                          '1px solid var(--border-light)'
                      }}
                    >
                      <span>
                        {item.product_name} ×{' '}
                        {item.quantity}
                      </span>

                      <strong>
                        ₪
                        {Number(
                          item.item_total
                        ).toFixed(2)}
                      </strong>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

const statusStyle = (status) => {
  const colors = {
    pending: {
      background: '#fff2cc',
      color: '#806000'
    },
    processing: {
      background: '#d9eaf7',
      color: '#1f4e79'
    },
    shipped: {
      background: '#e2f0d9',
      color: '#385723'
    },
    delivered: {
      background: '#d5f5e3',
      color: '#1e8449'
    },
    cancelled: {
      background: '#f8d7da',
      color: '#842029'
    }
  };

  return {
    padding: '5px 10px',
    borderRadius: '14px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    ...(colors[status] || colors.pending)
  };
};