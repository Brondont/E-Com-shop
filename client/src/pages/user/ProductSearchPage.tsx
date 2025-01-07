// src/components/ProductSearch/ProductSearch.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Box, TextField, Card, CardContent } from "@mui/material";
import ProductSearchSidebar from "../../components/productSearch/ProductSearchSidebar";
import ProductGrid from "../../components/productSearch/ProductGrid";
import { Filters } from "../../components/productSearch/types";
import { BaseProductData } from "../../components/admin/products/BaseProduct";
import { useFeedback } from "../../FeedbackAlertContext";
import {
  Category,
  Manufacturer,
} from "../../components/admin/products/BaseProductCreation";

export const ProductSearchPage: React.FC = () => {
  const [products, setProducts] = useState<BaseProductData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<BaseProductData[]>(
    []
  );
  const [filters, setFilters] = useState<Filters>({
    selectedCategories: [],
    selectedManufacturer: [],
  });
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const { showFeedback } = useFeedback();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch products from the API
  const fetchProducts = useCallback(async () => {
    if (productsLoading) return;

    setProductsLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/products?page=${page}&pageItemCount=${itemsPerPage}`
      );
      const resData = await res.json();

      if (resData.error) throw resData.error;

      setProducts(resData.products);
      setFilteredProducts(resData.products); // Initialize filtered products with all products
    } catch (err) {
      showFeedback("An error occurred. Please reload the page.", false);
    } finally {
      setProductsLoading(false);
    }
  }, [apiUrl]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle category filter changes
  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, page, itemsPerPage]);

  return (
    <Box sx={{ display: "flex", padding: 3 }}>
      {/* Sidebar */}
      <Card sx={{ width: "250px", marginRight: 3 }}>
        <CardContent>
          <ProductSearchSidebar categories={categories} filters={filters} />
        </CardContent>
      </Card>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        <Card>
          <CardContent>
            <TextField
              fullWidth
              label="Search products"
              variant="outlined"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              sx={{ mb: 3 }}
            />

            {/* Product Grid with Pagination */}
            <ProductGrid
              products={products}
              loading={productsLoading}
              currentPage={page}
              totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setPage(page)}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ProductSearchPage;
