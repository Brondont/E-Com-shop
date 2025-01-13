import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import ImageGallery from "../../components/imageGallery/ImageGallery";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { BaseProductData } from "../../components/admin/products/BaseProduct";
import ProductDetails from "../../components/productDetails/ProductDetails";
import { VariantData } from "../../components/admin/products/VariantsTable";
import { useFeedback } from "../../FeedbackAlertContext";
import VariantSelector from "../../components/variantSelector/VariantSelector";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { LoadingButton } from "@mui/lab";
import Scene from "../../components/modelViewer/ModelViewer";
import ViewInArIcon from "@mui/icons-material/ViewInAr"; // Icon for 3D view

const ProductPage: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  const { productID } = useParams<{ productID: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(true);
  const [product, setProduct] = useState<BaseProductData | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantData | null>(
    null
  );
  const [Model3DView, setModel3DView] = useState<boolean>(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { showFeedback } = useFeedback();

  const fetchProduct = useCallback(async () => {
    if (!productID) return;
    setLoadingProduct(true);

    try {
      const res = await fetch(`${apiUrl}/product/${productID}`);
      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setProduct(resData.product);
      if (resData.product.variants?.length > 0) {
        setSelectedVariant(resData.product.variants[0]);
      }
    } catch (err) {
      showFeedback(
        "Failed to load product details. Please try again later.",
        false
      );
      setProduct(null);
    } finally {
      setLoadingProduct(false);
    }
  }, [apiUrl, productID]);

  const toggle3DModel = () => {
    setModel3DView((prev) => !prev);
  };

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleQuantityChange = (value: number) => {
    if (selectedVariant?.inventory.quantity < value) {
      showFeedback(
        "You are exceeding the limit for the available stock.",
        false
      );
      return;
    }
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant && quantity > 0) return;
    setAddingToCart(true);

    try {
      const res = await fetch(`${apiUrl}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          variantID: selectedVariant.ID,
          quantity: quantity,
        }),
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setQuantity(1); // Reset quantity after successful add
      showFeedback("Product added to cart!", true);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback("Failed to add product to cart. Please try again.", false);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loadingProduct) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  const onVariantChange = (variant: VariantData) => {
    setSelectedVariant(variant);
    setCurrentImageIndex(0); // Reset image index
    setModel3DView(false); // Reset 3D view when variant changes
  };

  const onCurrentImageIndexChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!product) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" color="error">
          This product does not exist.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        minHeight: "100vh",
        p: { md: 4 },
        backgroundColor: "background.default",
      }}
    >
      <Card sx={{ width: "100%" }}>
        <CardContent>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {product.name}
          </Typography>
          <Divider sx={{ my: 2 }} />

          {product.variants.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              Currently, there are no variants available. Please check back
              later.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 4,
                width: "100%",
                minHeight: { md: "600px" },
              }}
            >
              {selectedVariant ? (
                <>
                  <Box
                    sx={{
                      width: { xs: "100%", md: "50%" },
                      top: { md: 24 },
                      height: { md: "calc(100vh - 200px)" },
                      alignSelf: "flex-start",
                      position: "relative",
                    }}
                  >
                    {selectedVariant.modelURL && (
                      <IconButton
                        onClick={toggle3DModel}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 999,
                        }}
                      >
                        <ViewInArIcon />
                      </IconButton>
                    )}

                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        transition: "opacity 0.3s ease-in-out",
                        opacity: Model3DView ? 0 : 1,
                        visibility: Model3DView ? "hidden" : "visible",
                        position: "absolute",
                      }}
                    >
                      <ImageGallery
                        variant={selectedVariant}
                        currentImageIndex={currentImageIndex}
                        onCurrentImageIndexChange={onCurrentImageIndexChange}
                      />
                    </Box>

                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        transition: "opacity 0.3s ease-in-out",
                        opacity: Model3DView ? 1 : 0,
                        visibility: Model3DView ? "visible" : "hidden",
                      }}
                    >
                      <Scene
                        modelPath={
                          apiUrl.split("/api/")[0] + selectedVariant.modelURL
                        }
                      />
                    </Box>
                  </Box>

                  {/* Variant Selector and Product Details */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <VariantSelector
                      variants={product.variants}
                      onVariantChange={onVariantChange}
                      selectedVariant={selectedVariant}
                    />
                    <ProductDetails variant={selectedVariant} />
                  </Box>
                  <Box sx={{ minWidth: "300px" }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Quantity:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconButton
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1 || addingToCart}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                      <TextField
                        value={quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value)) {
                            handleQuantityChange(value);
                          }
                        }}
                        size="small"
                        sx={{ width: "80px" }}
                      />

                      <IconButton
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={
                          quantity >= selectedVariant.inventory.quantity ||
                          addingToCart
                        }
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>

                      <Typography variant="body2" color="text.secondary">
                        {selectedVariant.inventory.quantity} available
                      </Typography>
                    </Box>
                    <LoadingButton
                      loading={addingToCart}
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      startIcon={<AddShoppingCartIcon />}
                      onClick={handleAddToCart}
                      disabled={
                        addingToCart || selectedVariant.inventory.quantity === 0
                      }
                    >
                      {addingToCart ? "Adding..." : "Add to Cart"}
                    </LoadingButton>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductPage;
