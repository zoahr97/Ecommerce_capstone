import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
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
        'http://localhost:5000/api/contact',
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
          data.error ||
            'Failed to send message'
        );
      }

      toast.success(
        'Your message was sent successfully'
      );

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error(
        'Contact form error:',
        error
      );

      toast.error(
        error.message ||
          'Could not send your message'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <h2>Contact Us</h2>

      <p
        style={{
          color: 'var(--text-muted)',
          marginBottom: '28px'
        }}
      >
        Have a question about a product or an
        order? Send us a message and we will get
        back to you.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '28px',
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
          <h3 style={{ marginTop: 0 }}>
            Send a Message
          </h3>

          <label className="checkout-label">
            Full Name
            <input
              className="checkout-input"
              type="text"
              name="name"
              value={formData.name}
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
            Subject
            <input
              className="checkout-input"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </label>

          <label className="checkout-label">
            Message
            <textarea
              className="checkout-input"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="6"
              maxLength="1000"
              required
              style={{
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
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
              ? 'Sending...'
              : 'Send Message'}
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
          <h3 style={{ marginTop: 0 }}>
            The Baking Corner
          </h3>

          <p>
            <strong>Address:</strong>
            <br />
            12 Baking Street, Ashdod
          </p>

          <p>
            <strong>Phone:</strong>
            <br />
            08-555-1234
          </p>

          <p>
            <strong>Email:</strong>
            <br />
            hello@thebakingcorner.com
          </p>

          <p>
            <strong>Business Hours:</strong>
            <br />
            Sunday–Thursday: 09:00–18:00
            <br />
            Friday: 09:00–13:00
          </p>

          <iframe
            title="The Baking Corner location"
            src="https://www.google.com/maps?q=Ashdod,Israel&output=embed"
            width="100%"
            height="270"
            style={{
              border: 0,
              marginTop: '12px'
            }}
            loading="lazy"
            allowFullScreen
          />
        </section>
      </div>
    </main>
  );
}