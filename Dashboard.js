import React, { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Welcome {user?.email}</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
