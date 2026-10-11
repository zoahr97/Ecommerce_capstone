import { Link } from 'react-router-dom';

export default function Cart({ cart, onIncrease, onDecrease, onRemove }) {
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Your shopping cart is empty 🛒</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>You haven't added any products to your cart yet.</p>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', borderRadius: '6px' }}>
          Back to Shop
        </Link>
      </div>
    );
  }
  
 

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Your Shopping Cart</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        {cart.map((item) => (
          <div key={item.id}  className="cart-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src={item.image_url} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>₪{item.price} each</p>
              </div>
            </div>

            {/* Quantity management & removal */}
           <div
                className="cart-actions"
                style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
           }}
          >
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px' }}>
                <button onClick={() => onDecrease(item)} style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>-</button>
                <span style={{ padding: '0 10px', fontWeight: 'bold' }}>{item.quantity}</span>
                <button onClick={() => onIncrease(item)} style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>+</button>
              </div>

              <span style={{ fontWeight: 'bold', minWidth: '60px', textAlign: 'left' }}>
                ₪{item.price * item.quantity}
              </span>

              <button 
                onClick={() => onRemove(item.id)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#e74c3c' }}
                title="Remove item"
              >
                🗑️
              </button>
            </div>

          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'left', borderTop: '2px solid #eee', paddingTop: '20px' }}>
        <h3>Total: ₪{totalPrice}</h3>
       <Link
  to="/checkout"
  className="btn-primary"
  style={{
    display: 'inline-block',
    marginTop: '10px',
    padding: '12px 30px',
    fontSize: '1.1rem',
    textDecoration: 'none'
  }}
>
  Proceed to Checkout
</Link>
      </div>
    </div>
  );
}