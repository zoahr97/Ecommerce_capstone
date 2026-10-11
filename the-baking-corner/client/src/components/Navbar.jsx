import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

export default function Navbar({
  currentUser,
  totalItemsInCart,
  onLogout
}) {
  const navigationLinkStyle = {
    textDecoration: 'none',
    color: 'var(--text-main)',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  };

  return (
    <header style={{ marginBottom: '30px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-start'
          }}
        >
          <Link to="/">
            <img
              src={logo}
              alt="The Baking Corner Logo"
              style={{
                height: '70px',
                cursor: 'pointer'
              }}
            />
          </Link>
        </div>

        <div
          style={{
            flex: 2,
            textAlign: 'center'
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '2rem',
              color: 'var(--text-main)'
            }}
          >
            Welcome to The Baking Corner
          </h1>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Link
            to="/cart"
            style={{
              position: 'relative',
              fontSize: '1.8rem',
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            🛒

            {totalItemsInCart > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-12px',
                  backgroundColor: '#e74c3c',
                  color: '#fff',
                  borderRadius: '50%',
                  padding: '2px 7px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  minWidth: '22px',
                  textAlign: 'center',
                  boxShadow:
                    '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                {totalItemsInCart}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid #eaeaea'
        }}
      >
        <Link to="/" style={navigationLinkStyle}>
          All Products
        </Link>

        <Link
          to="/ingredients"
          style={navigationLinkStyle}
        >
          Ingredients
        </Link>

        <Link
          to="/equipment"
          style={navigationLinkStyle}
        >
          Equipment
        </Link>

        <Link
          to="/contact"
          style={navigationLinkStyle}
        >
          Contact Us
        </Link>

        {currentUser?.role === 'admin' && (
          <Link
            to="/admin"
            style={{
              ...navigationLinkStyle,
              color: '#e74c3c'
            }}
          >
            Admin Panel
          </Link>
        )}

        {currentUser ? (
          <>
            <Link
              to="/my-orders"
              style={navigationLinkStyle}
            >
              My Orders
            </Link>

            <span
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.95rem'
              }}
            >
              Hello, {currentUser.firstName}
            </span>

            <button
              type="button"
              onClick={onLogout}
              style={{
                border: 'none',
                background: 'none',
                color: '#e74c3c',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={navigationLinkStyle}
            >
              Login
            </Link>

            <Link
              to="/register"
              style={navigationLinkStyle}
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}