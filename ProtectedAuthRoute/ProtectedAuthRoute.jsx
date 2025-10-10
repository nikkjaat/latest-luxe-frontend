// components/ProtectedAuthRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

function ProtectedAuthRoute({ children }) {
  const { user } = useAuth();

  // If user is already logged in, redirect to home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedAuthRoute;
