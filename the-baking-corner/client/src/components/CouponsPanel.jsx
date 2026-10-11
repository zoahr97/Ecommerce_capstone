import {
  useEffect,
  useState
} from 'react';
import toast from 'react-hot-toast';

const emptyForm = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minimumOrderAmount: '0',
  expiresAt: '',
  maxUses: ''
};

export default function CouponsPanel() {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] =
    useState(emptyForm);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const getToken = () =>
    localStorage.getItem(
      'baking_corner_token'
    );

  const loadCoupons = async () => {
    const token = getToken();

    if (!token) {
      toast.error(
        'Please log in again',
        {
          id: 'coupons-login-required'
        }
      );
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:5000/api/coupons',
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to load coupons'
        );
      }

      setCoupons(data);
    } catch (error) {
      console.error(
        'Error loading coupons:',
        error
      );

      toast.error(error.message, {
        id: 'load-coupons-error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleCreateCoupon = async (
    event
  ) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      toast.error(
        'Please log in again',
        {
          id: 'create-coupon-login-required'
        }
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/coupons',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization:
              `Bearer ${token}`
          },
          body: JSON.stringify({
            code: formData.code,
            discountType:
              formData.discountType,
            discountValue:
              formData.discountValue,
            minimumOrderAmount:
              formData.minimumOrderAmount,
            expiresAt:
              formData.expiresAt || null,
            maxUses:
              formData.maxUses || null
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to create coupon'
        );
      }

      toast.success(
        'Coupon created successfully',
        {
          id: 'coupon-created-success'
        }
      );

      setFormData(emptyForm);
      await loadCoupons();
    } catch (error) {
      console.error(
        'Error creating coupon:',
        error
      );

      toast.error(error.message, {
        id: 'create-coupon-error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    coupon
  ) => {
    const token = getToken();

    try {
      const response = await fetch(
        `http://localhost:5000/api/coupons/${coupon.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
            Authorization:
              `Bearer ${token}`
          },
          body: JSON.stringify({
            isActive: !Boolean(coupon.is_active)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to update coupon'
        );
      }

      toast.success(data.message, {
        id: `coupon-status-${coupon.id}`
      });

      await loadCoupons();
    } catch (error) {
      console.error(
        'Error updating coupon:',
        error
      );

      toast.error(error.message, {
        id: `coupon-status-error-${coupon.id}`
      });
    }
  };

  const formatExpiryDate = (date) => {
    if (!date) {
      return 'No expiration';
    }

    return new Date(date).toLocaleDateString();
  };

  return (
    <section>
      <h2>
        Coupons ({coupons.length})
      </h2>

      <form
        onSubmit={handleCreateCoupon}
        style={{
          maxWidth: '720px',
          backgroundColor: '#fff',
          border:
            '1px solid var(--border-light)',
          padding: '22px',
          marginBottom: '30px'
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          Create New Coupon
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '15px'
          }}
        >
          <label className="checkout-label">
            Coupon Code

            <input
              className="checkout-input"
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Example: SUMMER15"
              required
              style={{
                textTransform: 'uppercase'
              }}
            />
          </label>

          <label className="checkout-label">
            Discount Type

            <select
              className="checkout-input"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
            >
              <option value="percentage">
                Percentage (%)
              </option>

              <option value="fixed">
                Fixed amount (₪)
              </option>
            </select>
          </label>

          <label className="checkout-label">
            Discount Value

            <input
              className="checkout-input"
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder={
                formData.discountType ===
                'percentage'
                  ? '10'
                  : '20'
              }
              required
            />
          </label>

          <label className="checkout-label">
            Minimum Order (₪)

            <input
              className="checkout-input"
              type="number"
              name="minimumOrderAmount"
              value={
                formData.minimumOrderAmount
              }
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </label>

          <label className="checkout-label">
            Expiration Date

            <input
              className="checkout-input"
              type="datetime-local"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
            />
          </label>

          <label className="checkout-label">
            Maximum Uses

            <input
              className="checkout-input"
              type="number"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleChange}
              min="1"
              step="1"
              placeholder="Unlimited"
            />
          </label>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
          style={{
            width: '100%',
            marginTop: '20px',
            opacity:
              isSubmitting ? 0.6 : 1
          }}
        >
          {isSubmitting
            ? 'Creating Coupon...'
            : 'Create Coupon'}
        </button>
      </form>

      {isLoading ? (
        <p>Loading coupons...</p>
      ) : (
        <div
          style={{
            overflowX: 'auto',
            backgroundColor: '#fff',
            border:
              '1px solid var(--border-light)'
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '780px'
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor:
                    'var(--bg-primary)'
                }}
              >
                <th style={tableHeaderStyle}>
                  Code
                </th>

                <th style={tableHeaderStyle}>
                  Discount
                </th>

                <th style={tableHeaderStyle}>
                  Minimum Order
                </th>

                <th style={tableHeaderStyle}>
                  Uses
                </th>

                <th style={tableHeaderStyle}>
                  Expires
                </th>

                <th style={tableHeaderStyle}>
                  Status
                </th>

                <th style={tableHeaderStyle}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td style={tableCellStyle}>
                    <strong>{coupon.code}</strong>
                  </td>

                  <td style={tableCellStyle}>
                    {coupon.discount_type ===
                    'percentage'
                      ? `${coupon.discount_value}%`
                      : `₪${Number(
                          coupon.discount_value
                        ).toFixed(2)}`}
                  </td>

                  <td style={tableCellStyle}>
                    ₪
                    {Number(
                      coupon.minimum_order_amount
                    ).toFixed(2)}
                  </td>

                  <td style={tableCellStyle}>
                    {coupon.used_count}
                    {coupon.max_uses !== null
                      ? ` / ${coupon.max_uses}`
                      : ' / Unlimited'}
                  </td>

                  <td style={tableCellStyle}>
                    {formatExpiryDate(
                      coupon.expires_at
                    )}
                  </td>

                  <td style={tableCellStyle}>
                    <span
                      style={{
                        padding: '5px 10px',
                        borderRadius: '14px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        backgroundColor:
                          coupon.is_active
                            ? '#d5f5e3'
                            : '#f8d7da',
                        color: coupon.is_active
                          ? '#1e8449'
                          : '#842029'
                      }}
                    >
                      {coupon.is_active
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </td>

                  <td style={tableCellStyle}>
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(coupon)
                      }
                      style={{
                        padding: '7px 11px',
                        border:
                          '1px solid var(--text-main)',
                        background: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      {coupon.is_active
                        ? 'Deactivate'
                        : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}

              {coupons.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding: '25px',
                      textAlign: 'center',
                      color:
                        'var(--text-muted)'
                    }}
                  >
                    No coupons created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const tableHeaderStyle = {
  padding: '13px',
  textAlign: 'left',
  borderBottom:
    '1px solid var(--border-light)'
};

const tableCellStyle = {
  padding: '13px',
  borderBottom:
    '1px solid var(--border-light)'
};