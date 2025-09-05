import React, { useContext } from "react";
import { useAuth } from "../src/context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute(props) {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login"></Navigate>;
  }
  return props.children;
}
