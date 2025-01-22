import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Paper,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ImageIcon from "@mui/icons-material/Image";
import { Image } from "../../types/types";
import { formatDate, formatPrice } from "../../../util/formatters";
import { BaseProductData } from "./BaseProduct";
import { useFeedback } from "../../../FeedbackAlertContext";
import VariantCreationDialog, {
  DialogProductVariantProps,
} from "./VariantCreationDialog";

export interface VariantData {
  ID: number;
  name: string;
  description: string;
  images: Image[];
  modelURL: string;
  price: number;
  inventory: {
    quantity: number;
  };
  UpdatedAt: string;
  CreatedAt: string;
  productID: number;
}

interface VariantsTableProps {
  baseProduct: BaseProductData;
  variants: VariantData[];
  setVariants: React.Dispatch<React.SetStateAction<VariantData[]>>;
  loadingVariants: boolean;
  isEdit?: boolean;
}

const VariantsTableSkeleton = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 2 }}>
      {[...Array(5)].map((_, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Skeleton variant="rounded" width={80} height={80} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={200} height={24} />
              <Skeleton variant="text" width={150} height={20} />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Skeleton variant="rounded" width={100} height={36} />
              <Skeleton variant="rounded" width={100} height={36} />
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

const VariantsTable: React.FC<VariantsTableProps> = ({
  baseProduct,
  variants,
  setVariants,
  loadingVariants,
  isEdit,
}) => {
  const [variantDialogData, setVariantDialogData] =
    useState<DialogProductVariantProps>({
      isOpen: false,
      name: "",
      description: "",
      price: undefined,
      quantity: undefined,
      existingImages: [],
      newImages: [],
      existingModel: "",
      newModel: null,
    });
  const [submittingVariant, setSubmittingVariant] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<VariantData | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingVariant, setDeletingVariant] = useState<boolean>(false);
  const theme = useTheme();
  const { showFeedback } = useFeedback();

  const token = localStorage.getItem("token");
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleEditClick = (variant: VariantData) => {
    setSelectedVariant(variant);
    setVariantDialogData({
      isOpen: true,
      name: variant.name,
      description: variant.description,
      price: variant.price,
      quantity: variant.inventory.quantity,
      existingImages: variant.images,
      newImages: [],
      existingModel: variant.modelURL,
      newModel: null,
    });
  };

  const handleDeleteClick = (variant: VariantData) => {
    setSelectedVariant(variant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteVariant = async () => {
    if (!isEdit || deletingVariant || !selectedVariant || !setVariants) return;
    setDeletingVariant(true);

    try {
      const res = await fetch(`${apiUrl}/variant/${selectedVariant.ID}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      showFeedback("Variant deleted successfully", true);
      setVariants((prev) =>
        prev.filter((prevVariant) => prevVariant.ID !== selectedVariant.ID)
      );
      setSelectedVariant(null);
      setDeleteDialogOpen(false);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "Something went wrong with deleting the variant, try again.",
          false
        );
    } finally {
      setDeletingVariant(false);
    }
  };

  const validateVariantForm = (): string => {
    if (variantDialogData.name === "") return "Name is required";
    if (variantDialogData.description === "") return "Description is required";
    if (variantDialogData.price === undefined) return "Price is required";
    if (variantDialogData.quantity === undefined) return "Quantity is required";
    if (
      variantDialogData.newImages.length === 0 &&
      variantDialogData.existingImages.length === 0
    )
      return "At least one image is needed";
    return "";
  };

  const handleSubmitVariantForm = async () => {
    const err = validateVariantForm();
    if (err !== "") {
      showFeedback(err, false);
      return;
    }

    if (!selectedVariant) {
      showFeedback("No variant selected for editing.", false);
      return;
    }

    if (submittingVariant) return;
    setSubmittingVariant(true);

    const formData = new FormData();

    // Append basic fields
    formData.append("variantID", selectedVariant.ID.toString());
    formData.append("name", variantDialogData.name);
    formData.append("description", variantDialogData.description);
    formData.append("price", variantDialogData.price.toString());
    formData.append("quantity", variantDialogData.quantity.toString());

    // Append existing images (URLs)
    variantDialogData.existingImages.forEach((image: Image) => {
      formData.append("existingImages", image.ID.toString());
    });

    // Append new images (Blob files)
    variantDialogData.newImages.forEach((image) => {
      formData.append("images", image);
    });

    // add 3d model if it exists
    if (variantDialogData.newModel) {
      formData.append("model", variantDialogData.newModel);
    }

    try {
      const res = await fetch(`${apiUrl}/variant`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      showFeedback("Variant updated successfully", true);

      // Update the variants state with the edited variant
      setVariants((prev) =>
        prev.map((v) => (v.ID === selectedVariant.ID ? resData.variant : v))
      );

      // Close the dialog
      setVariantDialogData((prev) => ({
        ...prev,
        isOpen: false,
      }));
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "Something went wrong with updating the variant, try again",
          false
        );
    } finally {
      setSubmittingVariant(false);
    }
  };

  const VariantCard = ({ variant }: { variant: VariantData }) => {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[2],
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          {/* Image Section */}
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderRadius: 2,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {variant.images[0]?.imagePath ? (
              <Avatar
                src={`${apiUrl.split("/api")[0]}${variant.images[0].imagePath}`}
                variant="rounded"
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                  borderRadius: 2,
                }}
              >
                <ImageIcon
                  sx={{ fontSize: 32, color: theme.palette.grey[400] }}
                />
              </Box>
            )}
          </Box>

          {/* Details Section */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {variant.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {variant.ID}
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: theme.palette.primary.main }}
              >
                {formatPrice(variant.price)}
              </Typography>
            </Box>

            {/* Stats & Actions */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Chip
                icon={<InventoryIcon />}
                label={`${variant.inventory?.quantity || 0} in stock`}
                size="small"
                color={variant.inventory?.quantity > 0 ? "success" : "error"}
                sx={{ borderRadius: 1 }}
              />
              <Chip
                icon={<CalendarTodayIcon />}
                label={`Updated ${formatDate(variant.UpdatedAt)}`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 1 }}
              />
              {isEdit && (
                <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditClick(variant)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(variant)}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Product Variants
          </Typography>
          {!isEdit && (
            <Button
              endIcon={<ArrowForwardIcon />}
              variant="contained"
              href="/admin/products/product-variants"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
              }}
            >
              Manage Variants
            </Button>
          )}
        </Box>

        {/* Content */}
        <Box>
          {!baseProduct ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Select a base product first to see its variants.
              </Typography>
            </Box>
          ) : loadingVariants ? (
            <VariantsTableSkeleton />
          ) : variants.length > 0 ? (
            <Box>
              {variants.map((variant) => (
                <VariantCard key={variant.ID} variant={variant} />
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No variants found for this product.
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      {/* Dialogs */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: "100%",
            maxWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the variant "{selectedVariant?.name}
            "?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteVariant}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <VariantCreationDialog
        variantDialogData={variantDialogData}
        setVariantDialogData={setVariantDialogData}
        handleSubmit={handleSubmitVariantForm}
        editMode={true}
      />
    </Card>
  );
};

export default VariantsTable;
