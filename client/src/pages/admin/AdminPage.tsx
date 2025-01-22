import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Dashboard from "../../components/admin/dashboard/Dashboard";
import Sidebar, { Section } from "../../components/admin/sidebar/Sidebar";
import { UserProps } from "../user/ProfilePage";
import { useLocation, useNavigate } from "react-router-dom";
import BaseProduct from "../../components/admin/products/BaseProduct";
import UserManagement from "../../components/admin/user/UserManagement";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import TableChartIcon from "@mui/icons-material/TableChart";
import VariantManagement from "../../components/admin/products/VariantManagement";
import AppsIcon from "@mui/icons-material/Apps";
import PhonelinkIcon from "@mui/icons-material/Phonelink";
import VerifiedIcon from "@mui/icons-material/Verified";

import GroupCategory from "../../components/admin/productGroup/GroupCategory";
import GroupBrand from "../../components/admin/productGroup/GroupBrand";

interface AdminSpaceProps {
  handleLogout: () => void;
  user: UserProps | undefined;
}

const SideBarSections: Section[] = [
  { name: "Dashboard", path: "dashboard", icon: <DashboardIcon /> },
  {
    name: "Product",
    path: "products",
    icon: <ShoppingCartIcon />,
    subSection: {
      sections: [
        {
          name: "Base Products",
          path: "products/base-product",
          icon: <ViewQuiltIcon />,
        },
        {
          name: "Product Variant",
          path: "products/product-variants",
          icon: <TableChartIcon />,
        },
      ],
    },
  },
  {
    name: "Product Group",
    path: "product-groups",
    icon: <AppsIcon />,
    subSection: {
      sections: [
        {
          name: "Categories",
          path: "products/categories",
          icon: <PhonelinkIcon />,
        },
        {
          name: "Brand",
          path: "products/brands",
          icon: <VerifiedIcon />,
        },
      ],
    },
  },
  { name: "Users", path: "users", icon: <PeopleIcon /> },
];

const AdminPage: React.FC<AdminSpaceProps> = ({ handleLogout, user }) => {
  const [activeSection, setSelectedSection] = useState("dashboard"); // State to manage active page
  const location = useLocation();
  const navigate = useNavigate();

  const hanldeUpdateSelectedSection = (path: string) => {
    setSelectedSection(path);
    navigate(`/admin/${path}`);
  };

  useEffect(() => {
    const path = window.location.pathname.split("/admin/")[1];
    if (path) {
      setSelectedSection(path);
    }
  }, [location]);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "products/base-product":
        return <BaseProduct />;
      case "products/product-variants":
        return <VariantManagement />;
      case "users":
        return <UserManagement />;
      case "products/categories":
        return <GroupCategory />;
      case "products/brands":
        return <GroupBrand />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <Sidebar
        user={user}
        sections={SideBarSections}
        selectedSection={activeSection}
        handleLogout={handleLogout}
        onSelect={hanldeUpdateSelectedSection}
      />
      <Box sx={{ mt: 2, flexGrow: 1, p: 4 }}>{renderContent()}</Box>
    </Box>
  );
};

export default AdminPage;
