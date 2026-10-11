import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Login failed'
        );
      }

      localStorage.setItem(
        'baking_corner_token',
        data.token
      );

      localStorage.setItem(
        'baking_corner_user',
        JSON.stringify(data.user)
      );

      onLogin(data.user);

      toast.success(
        `Welcome, ${data.user.firstName}!`
      );

      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        width: '100%',
        margin: '0 auto',
        padding: '30px',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        border: '1px solid var(--border-light)'
      }}
    >
      <h2 style={{ textAlign: 'center' }}>
        Login
      </h2>

      <form onSubmit={handleSubmit}>
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
          Password
          <input
            className="checkout-input"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
          style={{
            width: '100%',
            marginTop: '10px'
          }}
        >
          {isSubmitting
            ? 'Logging In...'
            : 'Login'}
        </button>
      </form>

      <p
        style={{
          textAlign: 'center',
          marginTop: '20px'
        }}
      >
        Don&apos;t have an account?{' '}
        <Link to="/register">Register</Link>
      </p>
    </div>
  );
}