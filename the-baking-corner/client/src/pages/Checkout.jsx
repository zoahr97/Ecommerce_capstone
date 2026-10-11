import { useState } from 'react';
import {
  Link,
  useNavigate
} from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Checkout({
  cart,
  currentUser,
  onOrderComplete
}) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: currentUser
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : '',
    email: currentUser?.email || '',
    phone: '',
    city: '',
    address: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [couponCode, setCouponCode] =
    useState('');

  const [appliedCoupon, setAppliedCoupon] =
    useState(null);

  const [isApplyingCoupon, setIsApplyingCoupon] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const totalPrice = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  const discountAmount = appliedCoupon
    ? Number(appliedCoupon.discountAmount)
    : 0;

  const finalTotal = Math.max(
    0,
    totalPrice - discountAmount
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleCouponCodeChange = (event) => {
    setCouponCode(event.target.value);
    setAppliedCoupon(null);
  };

  const handleApplyCoupon = async () => {
    const token = localStorage.getItem(
      'baking_corner_token'
    );

    const normalizedCode =
      couponCode.trim().toUpperCase();

    if (!normalizedCode) {
      toast.error('Please enter a coupon code', {
        id: 'coupon-code-required'
      });
      return;
    }

    if (!token) {
      toast.error(
        'Please log in before applying a coupon',
        {
          id: 'coupon-login-required'
        }
      );

      navigate('/login');
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/coupons/validate',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization:
              `Bearer ${token}`
          },
          body: JSON.stringify({
            code: normalizedCode,
            totalAmount: totalPrice
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(
            'baking_corner_token'
          );

          localStorage.removeItem(
            'baking_corner_user'
          );

          toast.error(
            'Your session expired. Please log in again.',
            {
              id: 'coupon-session-expired'
            }
          );

          navigate('/login');
          return;
        }

        throw new Error(
          data.error ||
            'Failed to apply coupon'
        );
      }

      setCouponCode(data.coupon.code);

      setAppliedCoupon({
        code: data.coupon.code,
        discountAmount: Number(
          data.discountAmount
        ),
        finalTotal: Number(data.finalTotal)
      });

      toast.success(
        `Coupon ${data.coupon.code} applied successfully`,
        {
          id: 'coupon-applied-success'
        }
      );
    } catch (error) {
      console.error(
        'Coupon validation error:',
        error
      );

      setAppliedCoupon(null);

      toast.error(
        error.message ||
          'Could not apply coupon',
        {
          id: 'coupon-apply-error'
        }
      );
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);

    toast.success('Coupon removed', {
      id: 'coupon-removed'
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem(
      'baking_corner_token'
    );

    if (!token) {
      toast.error(
        'Please log in before checkout',
        {
          id: 'checkout-login-required'
        }
      );

      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization:
              `Bearer ${token}`
          },
          body: JSON.stringify({
            cart,
            couponCode: appliedCoupon?.code || null,
            customerDetails: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              city: formData.city,
              address: formData.address,
              paymentMethod:
                formData.paymentMethod
            }
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(
            'baking_corner_token'
          );

          localStorage.removeItem(
            'baking_corner_user'
          );

          toast.error(
            'Your session expired. Please log in again.',
            {
              id:
                'checkout-session-expired'
            }
          );

          navigate('/login');
          return;
        }

        throw new Error(
          data.error ||
            'Failed to place order'
        );
      }

      const completedOrder = {
        orderId: data.orderId,
        totalAmount: finalTotal,
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        paymentMethod:
          formData.paymentMethod,
        couponCode: appliedCoupon?.code || null,
        discountAmount,

        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity)
        }))
      };

      await onOrderComplete?.();

      toast.success(
        'Order placed successfully!',
        {
          id:
            `order-success-${data.orderId}`
        }
      );

      navigate('/order-success', {
        replace: true,
        state: {
          order: completedOrder
        }
      });
    } catch (error) {
      console.error(
        'Checkout error:',
        error
      );

      toast.error(
        error.message ||
          'Checkout failed. Please try again.',
        {
          id: 'checkout-error'
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '50px'
        }}
      >
        <h2>Your cart is empty</h2>

        <Link
          to="/"
          className="btn-primary"
          style={{
            display: 'inline-block',
            textDecoration: 'none'
          }}
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '950px',
        width: '100%',
        margin: '0 auto',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <h2>Checkout</h2>

      <div
        className="checkout-layout"
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1.4fr 1fr',
          gap: '35px',
          alignItems: 'start'
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#fff',
            border:
              '1px solid var(--border-light)',
            padding: '25px'
          }}
        >
          <h3>Shipping Details</h3>

          <label className="checkout-label">
            Full Name

            <input
              className="checkout-input"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </label>

          <label className="checkout-label">
            Email

            <input
              className="checkout-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="checkout-label">
            Phone

            <input
              className="checkout-input"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </label>

          <label className="checkout-label">
            City

            <input
              className="checkout-input"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </label>

          <label className="checkout-label">
            Address

            <input
              className="checkout-input"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </label>

          <h3
            style={{
              marginTop: '30px'
            }}
          >
            Payment Method
          </h3>

          <label
            style={{
              display: 'block',
              marginBottom: '12px'
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="credit-card"
              checked={
                formData.paymentMethod ===
                'credit-card'
              }
              onChange={handleChange}
            />

            {' '}Credit Card
          </label>

          <label
            style={{
              display: 'block',
              marginBottom: '25px'
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={
                formData.paymentMethod ===
                'cash'
              }
              onChange={handleChange}
            />

            {' '}Cash on Delivery
          </label>

          {formData.paymentMethod ===
            'credit-card' && (
            <div
              style={{
                marginBottom: '25px',
                padding: '20px',
                border:
                  '1px solid var(--border-light)',
                backgroundColor:
                  'var(--bg-primary)'
              }}
            >
              <label className="checkout-label">
                Card Number

                <input
                  className="checkout-input"
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  maxLength="19"
                  required
                />
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: '15px'
                }}
              >
                <label className="checkout-label">
                  Expiry Date

                  <input
                    className="checkout-input"
                    type="text"
                    name="expiryDate"
                    value={
                      formData.expiryDate
                    }
                    onChange={handleChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </label>

                <label className="checkout-label">
                  CVV

                  <input
                    className="checkout-input"
                    type="password"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    inputMode="numeric"
                    maxLength="3"
                    required
                  />
                </label>
              </div>

              <p
                style={{
                  margin: 0,
                  color:
                    'var(--text-muted)',
                  fontSize: '0.8rem'
                }}
              >
                Demo payment form only.
                Card details are not sent
                or stored.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{
              width: '100%',
              opacity:
                isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting
              ? 'Processing...'
              : `Place Order — ₪${finalTotal.toFixed(2)}`}
          </button>
        </form>

        <section
          style={{
            backgroundColor: '#fff',
            border:
              '1px solid var(--border-light)',
            padding: '25px'
          }}
        >
          <h3>Order Summary</h3>

          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                gap: '15px',
                padding: '12px 0',
                borderBottom:
                  '1px solid var(--border-light)'
              }}
            >
              <span>
                {item.name} ×{' '}
                {item.quantity}
              </span>

              <strong>
                ₪
                {(
                  Number(item.price) *
                  Number(item.quantity)
                ).toFixed(2)}
              </strong>
            </div>
          ))}

          <div
            style={{
              marginTop: '25px',
              paddingTop: '20px',
              borderTop:
                '1px solid var(--border-light)'
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold'
              }}
            >
              Coupon Code
            </label>

            <div
              style={{
                display: 'flex',
                gap: '8px'
              }}
            >
              <input
                type="text"
                value={couponCode}
                onChange={handleCouponCodeChange}
                placeholder="Example: WELCOME10"
                disabled={isApplyingCoupon}
                style={{
                  width: '100%',
                  minWidth: 0,
                  padding: '10px',
                  border:
                    '1px solid var(--border-light)',
                  textTransform: 'uppercase',
                  boxSizing: 'border-box'
                }}
              />

              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon}
                style={{
                  padding: '10px 14px',
                  whiteSpace: 'nowrap',
                  border:
                    '1px solid var(--text-main)',
                  background: '#fff',
                  cursor: 'pointer',
                  opacity:
                    isApplyingCoupon ? 0.6 : 1
                }}
              >
                {isApplyingCoupon
                  ? 'Checking...'
                  : 'Apply'}
              </button>
            </div>

            {appliedCoupon && (
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '12px',
                  color: '#1e8449',
                  fontSize: '0.9rem'
                }}
              >
                <span>
                  {appliedCoupon.code} applied
                </span>

                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#c0392b',
                    cursor: 'pointer',
                    textDecoration:
                      'underline'
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: '20px',
              fontSize: '1.1rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                marginBottom: '10px'
              }}
            >
              <span>Subtotal</span>
              <strong>
                ₪{totalPrice.toFixed(2)}
              </strong>
            </div>

            {appliedCoupon && (
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  marginBottom: '10px',
                  color: '#1e8449'
                }}
              >
                <span>
                  Discount ({appliedCoupon.code})
                </span>
                <strong>
                  -₪
                  {discountAmount.toFixed(2)}
                </strong>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                paddingTop: '15px',
                borderTop:
                  '1px solid var(--border-light)',
                fontSize: '1.2rem'
              }}
            >
              <strong>Total</strong>

              <strong>
                ₪{finalTotal.toFixed(2)}
              </strong>
            </div>
          </div>

          <Link
            to="/cart"
            style={{
              display: 'inline-block',
              marginTop: '25px',
              color: 'var(--text-main)'
            }}
          >
            Back to Cart
          </Link>
        </section>
      </div>
    </div>
  );
}