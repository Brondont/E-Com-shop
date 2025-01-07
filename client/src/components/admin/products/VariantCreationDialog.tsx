import React, { useState, ChangeEvent } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Box,
  Typography,
  IconButton,
  ImageList,
  ImageListItem,
  Divider,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Image } from "./VariantsTable";

export interface DialogProductVariantProps {
  isOpen: boolean;
  name: string;
  description: string;
  price: number | undefined;
  quantity: number | undefined;
  existingImages: Image[]; // URLs of existing images
  newImages: File[]; // New images to upload
  model: File | null;
}

interface VariantCreationDialogProps {
  variantDialogData: DialogProductVariantProps;
  setVariantDialogData: React.Dispatch<
    React.SetStateAction<DialogProductVariantProps>
  >;
  handleSubmit: () => void;
  editMode?: boolean;
}

const VariantCreationDialog: React.FC<VariantCreationDialogProps> = ({
  handleSubmit,
  variantDialogData,
  setVariantDialogData,
  editMode = false,
}) => {
  const theme = useTheme();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleCloseDialog = () => {
    setVariantDialogData((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const handleDialogInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setVariantDialogData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDialogImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setVariantDialogData((prev) => ({
        ...prev,
        newImages: [...prev.newImages, ...Array.from(files)],
      }));
    }
  };

  const handleDialogModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setVariantDialogData((prev) => ({
      ...prev,
      model: file,
    }));
  };

  const removeExistingImage = (index: number) => {
    setVariantDialogData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  };

  const removeNewImage = (index: number) => {
    setVariantDialogData((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
  };

  const clearVariantDialogData = () => {
    setVariantDialogData((prev) => ({
      ...prev,
      price: undefined,
      quantity: undefined,
      name: "",
      description: "",
      existingImages: [],
      newImages: [],
      model: null,
    }));
  };

  return (
    <Dialog open={variantDialogData.isOpen} onClose={handleCloseDialog}>
      <DialogTitle>{editMode ? "Edit Variant" : "Add New Variant"}</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 4, p: 4 }}
      >
        <FormControl sx={{ mt: 2 }}>
          <TextField
            value={variantDialogData.name}
            name="name"
            label="Name"
            onChange={handleDialogInputChange}
            variant="outlined"
          />
        </FormControl>

        <FormControl>
          <TextField
            multiline
            rows={6}
            value={variantDialogData.description}
            name="description"
            label="Description"
            onChange={handleDialogInputChange}
            variant="outlined"
          />
        </FormControl>

        <Box sx={{ display: "flex", gap: 4 }}>
          <FormControl fullWidth>
            <TextField
              value={variantDialogData.price}
              name="price"
              type="number"
              label="Price (DZ)"
              onChange={handleDialogInputChange}
              variant="outlined"
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              type="number"
              value={variantDialogData.quantity}
              name="quantity"
              label="Quantity"
              onChange={handleDialogInputChange}
              variant="outlined"
            />
          </FormControl>
        </Box>

        <Divider sx={{ borderColor: theme.palette.divider }} />

        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: theme.palette.text.primary }}
          >
            Product Images
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              component="label"
              variant="contained"
              startIcon={<FileUploadIcon />}
              sx={{ bgcolor: theme.palette.primary.main }}
            >
              Upload Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleDialogImageUpload}
              />
            </Button>
            {(variantDialogData.existingImages.length > 0 ||
              variantDialogData.newImages.length > 0) && (
              <Typography variant="body2" color="text.secondary">
                {variantDialogData.existingImages.length +
                  variantDialogData.newImages.length}
                images
              </Typography>
            )}
          </Box>
          {variantDialogData.existingImages.length > 0 && (
            <Box sx={{ mt: 2, borderRadius: theme.shape.borderRadius }}>
              <Typography>Old Images:</Typography>
              <ImageList cols={3} gap={16}>
                {variantDialogData.existingImages.map((image, index) => (
                  <ImageListItem key={`existing-${index}`}>
                    <img
                      src={apiUrl.split("/api/")[0] + image.imagePath}
                      alt={`Existing ${index + 1}`}
                      loading="lazy"
                      style={{ height: 150, width: "100%", objectFit: "cover" }}
                    />
                    <IconButton
                      onClick={() => removeExistingImage(index)}
                      sx={{
                        position: "absolute",
                        right: 4,
                        top: 4,
                        bgcolor: "background.paper",
                      }}
                      size="small"
                    >
                      <DeleteIcon sx={{ color: theme.palette.error.main }} />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}

          {variantDialogData.newImages.length > 0 && (
            <Box sx={{ mt: 2, borderRadius: theme.shape.borderRadius }}>
              <Typography>New images:</Typography>
              <ImageList cols={3} gap={16}>
                {variantDialogData.newImages.map((image, index) => (
                  <ImageListItem key={`new-${index}`}>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`New ${index + 1}`}
                      loading="lazy"
                      style={{ height: 150, width: "100%", objectFit: "cover" }}
                    />
                    <IconButton
                      onClick={() => removeNewImage(index)}
                      sx={{
                        position: "absolute",
                        right: 4,
                        top: 4,
                        bgcolor: "background.paper",
                      }}
                      size="small"
                    >
                      <DeleteIcon sx={{ color: theme.palette.error.main }} />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: theme.palette.divider }} />

        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: theme.palette.text.primary }}
          >
            3D Model
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              component="label"
              variant="contained"
              startIcon={<FileUploadIcon />}
              sx={{ bgcolor: theme.palette.primary.main }}
            >
              Upload 3D Model
              <input
                type="file"
                hidden
                accept=".glb,.gltf,.obj,.fbx"
                onChange={handleDialogModelUpload}
              />
            </Button>
            {variantDialogData.model && (
              <Typography variant="body2" color="text.secondary">
                {variantDialogData.model.name}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="error"
          onClick={editMode ? handleCloseDialog : clearVariantDialogData}
        >
          {editMode ? "Cancel" : "Clear"}
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editMode ? "Save Changes" : "Add Variant"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VariantCreationDialog;
