import React, { useEffect, useState } from "react";
import { Box, AppBar, Toolbar, Typography } from "@mui/material";
import Dashboard from "../../components/admin/dashboard/Dashboard";
import ProductCreation from "../../components/admin/products/VariantCreationDialog";
import Users from "../../components/admin/users/Users";
import Settings from "../../components/admin/settings/settings";
import Sidebar from "../../components/admin/sidebar/Sidebar";
import { UserProps } from "../user/ProfilePage";
import { useNavigate } from "react-router-dom";
import ManageProducts from "../../components/admin/products/ManageProducts";

interface AdminSpaceProps {
  handleLogout: () => void;
  user: UserProps | undefined;
}

const AdminPage: React.FC<AdminSpaceProps> = ({ handleLogout, user }) => {
  const [activeSection, setSelectedSection] = useState("dashboard"); // State to manage active page
  const navigate = useNavigate();

  const hanldeUpdateSelectedSection = (path: string) => {
    setSelectedSection(path);
    navigate(`/admin/${path}`);
  };

  useEffect(() => {
    const path = window.location.pathname.split("/")[2];
    if (path) {
      setSelectedSection(path);
    }
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <ManageProducts />;
      case "users":
        return <Users />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <Sidebar
        user={user}
        selectedSection={activeSection}
        handleLogout={handleLogout}
        onSelect={hanldeUpdateSelectedSection}
      />
      <Box sx={{ mt: 2, flexGrow: 1 }}>{renderContent()}</Box>
    </Box>
  );
};

export default AdminPage;
