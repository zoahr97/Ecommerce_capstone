import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error(
        'Password must contain at least 6 characters'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Registration failed'
        );
      }

      toast.success(
        'Registration completed. You can now log in.'
      );

      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
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
        Create Account
      </h2>

      <form onSubmit={handleSubmit}>
        <label className="checkout-label">
          First Name
          <input
            className="checkout-input"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </label>

        <label className="checkout-label">
          Last Name
          <input
            className="checkout-input"
            type="text"
            name="lastName"
            value={formData.lastName}
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
          Password
          <input
            className="checkout-input"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            minLength="6"
            required
          />
        </label>

        <label className="checkout-label">
          Confirm Password
          <input
            className="checkout-input"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            minLength="6"
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
            ? 'Creating Account...'
            : 'Register'}
        </button>
      </form>

      <p
        style={{
          textAlign: 'center',
          marginTop: '20px'
        }}
      >
        Already have an account?{' '}
        <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}