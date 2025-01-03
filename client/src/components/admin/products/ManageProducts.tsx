import React from "react";
import { Box } from "@mui/material";
import BaseProductCreation from "./BaseProductCreation";
import ProductCreation from "./VariantCreationDialog";

const ManageProducts: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        flexWrap: "wrap",
        width: "100%",
      }}
    >
      <Box
        sx={{
          flex: "1 1 45%",
          p: 4,
          minWidth: 300,
        }}
      >
        <BaseProductCreation />
      </Box>
    </Box>
  );
};

export default ManageProducts;
