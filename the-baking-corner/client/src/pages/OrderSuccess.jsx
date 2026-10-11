import {
  Link,
  useLocation
} from 'react-router-dom';

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return (
      <div
        style={{
          maxWidth: '650px',
          width: '100%',
          margin: '0 auto',
          padding: '45px 20px',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}
      >
        <h2>Order Confirmation</h2>

        <p>
          The confirmation details are no
          longer available on this page.
        </p>

        <Link
          to="/my-orders"
          className="btn-primary"
          style={{
            display: 'inline-block',
            marginTop: '18px',
            textDecoration: 'none'
          }}
        >
          View My Orders
        </Link>
      </div>
    );
  }

  const paymentLabel =
    order.paymentMethod === 'credit-card'
      ? 'Credit Card'
      : 'Cash on Delivery';

  return (
    <main
      style={{
        maxWidth: '760px',
        width: '100%',
        margin: '0 auto',
        padding: '30px 20px',
        boxSizing: 'border-box'
      }}
    >
      <section
        id="print-receipt"
        style={{
          backgroundColor: '#fff',
          border: '1px solid var(--border-light)',
          padding: '30px'
        }}
      >
        <div
          style={{
            textAlign: 'center',
            paddingBottom: '25px',
            borderBottom:
              '1px solid var(--border-light)'
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Order Confirmed
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: 0
            }}
          >
            Thank you, {order.customerName}.
            Your order has been received
            successfully.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '20px',
            padding: '25px 0'
          }}
        >
          <div>
            <span style={labelStyle}>
              Order Number
            </span>

            <strong style={valueStyle}>
              #{order.orderId}
            </strong>
          </div>

          <div>
            <span style={labelStyle}>
              Total Amount
            </span>

            <strong style={valueStyle}>
              ₪
              {Number(
                order.totalAmount
              ).toFixed(2)}
            </strong>
          </div>

          <div>
            <span style={labelStyle}>
              Payment
            </span>

            <strong style={valueStyle}>
              {paymentLabel}
            </strong>
          </div>

          <div>
            <span style={labelStyle}>
              Delivery Address
            </span>

            <strong style={valueStyle}>
              {order.address}, {order.city}
            </strong>
          </div>
        </div>

        <h3>Order Summary</h3>

        <div
          style={{
            borderTop:
              '1px solid var(--border-light)'
          }}
        >
          {order.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                gap: '15px',
                padding: '13px 0',
                borderBottom:
                  '1px solid var(--border-light)'
              }}
            >
              <span>
                {item.name} × {item.quantity}
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
        </div>

        <div
          className="no-print"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '15px',
            marginTop: '30px'
          }}
        >
          <button
            type="button"
            className="btn-primary"
            onClick={handlePrint}
            style={{
              padding: '11px 20px'
            }}
          >
            Print Receipt
          </button>

          <Link
            to="/my-orders"
            className="btn-primary"
            style={{
              display: 'inline-block',
              padding: '11px 20px',
              textDecoration: 'none'
            }}
          >
            View My Orders
          </Link>

          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              border:
                '1px solid var(--text-main)',
              color: 'var(--text-main)',
              textDecoration: 'none'
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

const labelStyle = {
  display: 'block',
  color: 'var(--text-muted)',
  fontSize: '0.85rem',
  marginBottom: '6px'
};

const valueStyle = {
  display: 'block',
  fontSize: '1rem'
};