import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AssignedToMe from "./pages/AssignedToMe";
import CreatedByMe from "./pages/CreatedByMe";
import DashboardLayout from "./layout/DashboardLayout";

import { useAuth } from "./context/AuthContext";
import { socket } from "./socket";

function App() {
  const { isAuthenticated, loading, user } = useAuth();

 useEffect(() => {
  if (!isAuthenticated || !user) return;

  const handleNotification = (data: any) => {
    // 🔔 ASSIGNED
    if (
      data.action === "ASSIGNED" &&
      data.assignedToId === user.id
    ) {
      toast.success(`🔔 New task assigned to you: ${data.title}`);
    }

    // ✏️ UPDATED
    if (
      data.action === "UPDATED" &&
      (data.assignedToId === user.id ||
        data.creatorId === user.id)
    ) {
      toast(` Task updated: ${data.title}`);
    }
  };

  // attach listener
  socket.on("task:notification", handleNotification);

  //  CLEANUP (THIS IS REQUIRED)
  return () => {
    socket.off("task:notification", handleNotification);
  };
}, [isAuthenticated, user]);


  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <>
      <Toaster position="top-center" />

      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
         
          <Route
            path="/assigned"
            element={isAuthenticated ? <AssignedToMe /> : <Navigate to="/login" />}
          />
          <Route
            path="/created"
            element={isAuthenticated ? <CreatedByMe /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
