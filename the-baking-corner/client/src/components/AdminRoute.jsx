import { Navigate } from 'react-router-dom';

export default function AdminRoute({
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

  if (currentUser.role !== 'admin') {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}