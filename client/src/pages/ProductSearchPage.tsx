import React, { useCallback, useEffect, useState } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import ProductSearchSidebar from "../components/productSearch/ProductSearchSidebar";
import ProductGrid from "../components/productSearch/ProductGrid";
import { Filters } from "../components/productSearch/types";
import { BaseProductData } from "../components/admin/products/BaseProduct";
import { useFeedback } from "../FeedbackAlertContext";
import {
  Category,
  Brand, // Updated import
} from "../components/admin/products/BaseProductCreation";

export const ProductSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<BaseProductData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]); // Updated state
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const { showFeedback } = useFeedback();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Get filters from URL
  const getFiltersFromUrl = useCallback((): Filters => {
    const searchQuery = searchParams.get("q") || "";
    const categoriesParam = searchParams.get("categories") || "";
    const brandsParam = searchParams.get("brands") || ""; // Updated query param

    return {
      searchQuery,
      selectedCategories: categoriesParam
        ? categoriesParam.split(",").map(Number)
        : [],
      selectedBrands: brandsParam ? brandsParam.split(",").map(Number) : [], // Updated filter
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<Filters>(getFiltersFromUrl());

  // Update URL when filters change
  const updateSearchParams = useCallback(
    (newFilters: Filters, page: number) => {
      const params = new URLSearchParams();
      if (newFilters.searchQuery) params.set("q", newFilters.searchQuery);
      if (newFilters.selectedCategories.length > 0) {
        params.set("categories", newFilters.selectedCategories.join(","));
      }
      if (newFilters.selectedBrands.length > 0) {
        params.set("brands", newFilters.selectedBrands.join(",")); // Updated query param
      }
      if (page > 1) params.set("page", page.toString());
      setSearchParams(params);
    },
    [setSearchParams]
  );

  // Fetch products from the API
  const fetchProducts = useCallback(async () => {
    if (productsLoading) return;
    setProductsLoading(true);

    const currentPage = parseInt(searchParams.get("page") || "1");
    const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      limit: pagination.itemsPerPage.toString(),
      search: filters.searchQuery,
      categoriesIDs: filters.selectedCategories.toString(),
      brandsIDs: filters.selectedBrands.toString(), // Updated query param
    });

    try {
      const res = await fetch(`${apiUrl}/products?${queryParams}`);
      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setProducts(resData.products);
      setPagination({
        currentPage: resData.currentPage,
        totalPages: resData.totalPages,
        totalItems: resData.totalItems,
        itemsPerPage: resData.itemsPerPage,
      });
    } catch (err) {
      showFeedback(
        err.msg ||
          "Something went wrong with searching for your item, try again.",
        false
      );
    } finally {
      setProductsLoading(false);
    }
  }, [apiUrl, filters, pagination.itemsPerPage, searchParams, showFeedback]);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/brands`); // Updated endpoint
      const resData = await res.json();

      if (!res.ok) throw new Error(resData.message || "Failed to fetch brands"); // Updated error message

      setBrands(resData.brands); // Updated state
    } catch (err) {
      showFeedback(
        err instanceof Error
          ? err.message
          : "Something went wrong with filters, reload the page",
        false
      );
    }
  }, [apiUrl, showFeedback]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/categories`);
      const resData = await res.json();

      if (!res.ok)
        throw new Error(resData.message || "Failed to fetch categories");

      setCategories(resData.categories);
    } catch (err) {
      showFeedback(
        err instanceof Error
          ? err.message
          : "Something went wrong with filters, reload the page",
        false
      );
    }
  }, [apiUrl, showFeedback]);

  const onFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    updateSearchParams(newFilters, 1);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    updateSearchParams(filters, page);
  };

  // Initialize filters from URL and fetch initial data
  useEffect(() => {
    const urlFilters = getFiltersFromUrl();
    setFilters(urlFilters);
  }, [getFiltersFromUrl]);

  // Fetch categories and brands on mount
  useEffect(() => {
    fetchCategories();
    fetchBrands(); // Updated function
  }, [fetchCategories, fetchBrands]);

  // Fetch products when filters or URL params change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <Box
      sx={{
        display: "flex",
        p: 4,
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box sx={{ width: 280 }}>
          <ProductSearchSidebar
            categories={categories}
            brands={brands} // Updated prop
            filters={filters}
            onFilterChange={onFilterChange}
          />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          {!productsLoading && products.length === 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" textAlign="center" sx={{ my: 4 }}>
                  No products found. Try adjusting your filters or search terms.
                </Typography>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent sx={{ minHeight: "60vh" }}>
              <ProductGrid
                products={products}
                loading={productsLoading}
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductSearchPage;
