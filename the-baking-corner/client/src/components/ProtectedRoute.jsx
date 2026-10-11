import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({
  currentUser,
  children
}) {
  const token = localStorage.getItem(
    'baking_corner_token'
  );

  if (!currentUser || !token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}