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

  // ✅ Join user-specific room
  socket.emit("join-user", user.id);
  console.log("Joined user room:", user.id);

  // ===================== LISTENERS ======================
  const handleCreated = (task: any) => {
    if (task.assignedToId !== user.id) return;
    toast.success(`🆕 New task assigned: ${task.title}`);
  };

  const handleUpdated = (task: any) => {
    if (task.assignedToId !== user.id) return;
    toast(` Task updated: ${task.title}`);
  };

  const handleDeleted = () => {
    toast(`🗑️ Task deleted`);
  };

  const handleStatusChanged = (data: any) => {
    toast.success(`🚀 "${data.title}" moved ${data.from} → ${data.to}`);
  };

  socket.on("task:created", handleCreated);
  socket.on("task:updated", handleUpdated);
  socket.on("task:deleted", handleDeleted);
  socket.on("task:status-changed", handleStatusChanged);

  return () => {
    socket.off("task:created", handleCreated);
    socket.off("task:updated", handleUpdated);
    socket.off("task:deleted", handleDeleted);
    socket.off("task:status-changed", handleStatusChanged);
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
