// src/components/ProductSearch/ProductSearch.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Box, TextField, Card, CardContent } from "@mui/material";
import ProductSearchSidebar from "../components/productSearch/ProductSearchSidebar";
import ProductGrid from "../components/productSearch/ProductGrid";
import { Filters } from "../components/productSearch/types";
import { BaseProductData } from "../components/admin/products/BaseProduct";
import { useFeedback } from "../FeedbackAlertContext";
import {
  Category,
  Manufacturer,
} from "../components/admin/products/BaseProductCreation";

export const ProductSearchPage: React.FC = () => {
  const [products, setProducts] = useState<BaseProductData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [filters, setFilters] = useState<Filters>({
    searchQuery: "",
    selectedCategories: [],
    selectedManufacturers: [],
  });
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const { showFeedback } = useFeedback();
  const apiUrl = process.env.REACT_APP_API_URL;

  const onFilterChange = (newFilter: Filters) => {
    setFilters(newFilter);
  };

  // Fetch products from the API
  const fetchProducts = useCallback(async () => {
    if (productsLoading) return;
    setProductsLoading(true);

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: itemsPerPage.toString(),
      search: filters.searchQuery,
      categoriesIDs: filters.selectedCategories.toString(),
      manufacturersIDs: filters.selectedManufacturers.toString(),
    });

    try {
      const res = await fetch(`${apiUrl}/products?${queryParams}`);
      const resData = await res.json();

      if (resData.error) throw resData.error;

      setProducts(resData.products);
    } catch (err) {
      showFeedback("An error occurred. Please reload the page.", false);
    } finally {
      setProductsLoading(false);
    }
  }, [
    apiUrl,
    page,
    itemsPerPage,
    filters.searchQuery,
    filters.selectedCategories,
    filters.selectedManufacturers,
    showFeedback,
  ]);

  const fetchManufacturers = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/manufacturers`);

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setManufacturers(resData.manufacturers);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "Something went wrong with filters, reload the page",
          false
        );
    }
  }, [apiUrl, showFeedback]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/categories`);

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setCategories(resData.categories);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "Something went wrong with filters, reload the page",
          false
        );
    }
  }, [apiUrl, showFeedback]);

  // Fetch products on component mount
  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
  }, [fetchCategories, fetchManufacturers]);

  useEffect(() => {
    fetchProducts();
  }, [filters, fetchProducts]);

  return (
    <Box sx={{ display: "flex", gap: 4, padding: 3 }}>
      <ProductSearchSidebar
        categories={categories}
        manufacturers={manufacturers}
        filters={filters}
        onFilterChange={onFilterChange}
      />
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
              totalPages={3}
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
