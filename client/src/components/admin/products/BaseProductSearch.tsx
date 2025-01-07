import React from "react";
import {
  Box,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
} from "@mui/material";
import { BaseProductData } from "./BaseProduct";

interface BaseProductSearchProps {
  baseProducts: BaseProductData[];
  loadingBaseProducts: boolean;
  selectedBaseProduct: BaseProductData | undefined;
  handleUpdateSelectedBaseProduct: (baseProduct: BaseProductData) => void;
}

const BaseProductSearch: React.FC<BaseProductSearchProps> = ({
  baseProducts,
  loadingBaseProducts,
  selectedBaseProduct,
  handleUpdateSelectedBaseProduct,
}) => {
  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel>Base Product</InputLabel>
        <Select
          name="baseProduct"
          label="Base Product"
          value={selectedBaseProduct?.ID || ""}
          onChange={(e) => {
            const prodID = +e.target.value;
            const baseProduct = baseProducts.find(
              (baseProduct) => baseProduct.ID === prodID
            );
            if (baseProduct) handleUpdateSelectedBaseProduct(baseProduct);
          }}
        >
          {loadingBaseProducts ? (
            <MenuItem>
              <CircularProgress />
            </MenuItem>
          ) : baseProducts.length > 0 ? (
            baseProducts.map((baseProduct) => (
              <MenuItem key={baseProduct.ID} value={baseProduct.ID}>
                {baseProduct.name}
              </MenuItem>
            ))
          ) : (
            <Typography sx={{ width: "100%", textAlign: "center", p: 2 }}>
              No products available.
            </Typography>
          )}
        </Select>
      </FormControl>
    </Box>
  );
};

export default BaseProductSearch;
