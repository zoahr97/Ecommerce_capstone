import {
  useEffect,
  useState
} from 'react';

import toast from 'react-hot-toast';
import socket from '../services/socket';

const getToken = () =>
  localStorage.getItem(
    'baking_corner_token'
  );

export default function ContactMessages() {
  const [messages, setMessages] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/contact',
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to load contact messages'
        );
      }

      setMessages(data);
    } catch (error) {
      console.error(
        'Error loading contact messages:',
        error
      );

      toast.error(error.message, {
        id: 'contact-messages-error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const handleMessagesChanged = () => {
      fetchMessages();
    };

    socket.on(
      'contact-messages:changed',
      handleMessagesChanged
    );

    return () => {
      socket.off(
        'contact-messages:changed',
        handleMessagesChanged
      );
    };
  }, []);

  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/contact/${messageId}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to update message'
        );
      }

      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          Number(message.id) ===
          Number(messageId)
            ? {
                ...message,
                status: 'read'
              }
            : message
        )
      );

      toast.success('Message marked as read', {
        id: `contact-read-${messageId}`
      });
    } catch (error) {
      console.error(
        'Error updating contact message:',
        error
      );

      toast.error(error.message, {
        id: `contact-read-error-${messageId}`
      });
    }
  };

  const newMessages = messages.filter(
    (message) => message.status === 'new'
  ).length;

  if (isLoading) {
    return <p>Loading contact messages...</p>;
  }

  return (
    <section>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '18px'
        }}
      >
        <h3 style={{ margin: 0 }}>
          Contact Messages ({messages.length})
        </h3>

        {newMessages > 0 && (
          <span
            style={{
              backgroundColor: '#e74c3c',
              color: '#fff',
              borderRadius: '14px',
              padding: '5px 10px',
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}
          >
            {newMessages} new
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <p>No contact messages yet.</p>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}
        >
          {messages.map((message) => {
            const isNew =
              message.status === 'new';

            return (
              <article
                key={message.id}
                style={{
                  backgroundColor: isNew
                    ? '#fffaf0'
                    : '#fff',
                  border: isNew
                    ? '1px solid #f0c36d'
                    : '1px solid var(--border-light)',
                  borderLeft: isNew
                    ? '5px solid #f39c12'
                    : '5px solid #95a5a6',
                  padding: '18px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent:
                      'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <strong>
                      {message.subject}
                    </strong>

                    <p
                      style={{
                        margin: '8px 0 0',
                        color:
                          'var(--text-muted)'
                      }}
                    >
                      From: {message.name}
                      {' · '}
                      {message.email}
                    </p>
                  </div>

                  <span
                    style={{
                      alignSelf: 'flex-start',
                      padding: '5px 10px',
                      borderRadius: '14px',
                      backgroundColor: isNew
                        ? '#fff2cc'
                        : '#e9ecef',
                      color: isNew
                        ? '#806000'
                        : '#495057',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {isNew ? 'New' : 'Read'}
                  </span>
                </div>

                <p
                  style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    margin: '18px 0'
                  }}
                >
                  {message.message}
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent:
                      'space-between',
                    gap: '12px',
                    alignItems: 'center'
                  }}
                >
                  <small
                    style={{
                      color:
                        'var(--text-muted)'
                    }}
                  >
                    {new Date(
                      message.created_at
                    ).toLocaleString()}
                  </small>

                  {isNew && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() =>
                        markAsRead(message.id)
                      }
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}