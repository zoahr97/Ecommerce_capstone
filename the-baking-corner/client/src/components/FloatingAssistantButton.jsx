import {
  Link,
  useLocation
} from 'react-router-dom';

export default function FloatingAssistantButton() {
  const location = useLocation();

  if (
    location.pathname ===
    '/ai-assistant'
  ) {
    return null;
  }

  return (
    <Link
      to="/ai-assistant"
      className="assistant-widget"
      aria-label="Open Baking Assistant"
      title="Baking Assistant"
    >
      <svg
        width="27"
        height="27"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 4H17C18.1 4 19 4.9 19 6V15C19 16.1 18.1 17 17 17H11L7 20V17C5.9 17 5 16.1 5 15V6C5 4.9 5.9 4 7 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        <path
          d="M12 7L12.6 8.4L14 9L12.6 9.6L12 11L11.4 9.6L10 9L11.4 8.4L12 7Z"
          fill="currentColor"
        />

        <circle
          cx="8.5"
          cy="12.5"
          r="0.8"
          fill="currentColor"
        />

        <circle
          cx="15.5"
          cy="12.5"
          r="0.8"
          fill="currentColor"
        />
      </svg>
    </Link>
  );
}