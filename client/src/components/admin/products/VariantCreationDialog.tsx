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
  SelectChangeEvent,
  ImageList,
  ImageListItem,
  Divider,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useFeedback } from "../../../FeedbackAlertContext";

export interface DialogProductVariantProps {
  isOpen: boolean;
  name: string;
  description: string;
  price: number | undefined;
  quantity: number | undefined;
  categoryID: number | undefined;
  manufacturerID: number | undefined;
  images: File[];
  model: File | null;
}

interface VariantCreationDialogProps {
  variantDialogData: DialogProductVariantProps;
  setVariantDialogData: React.Dispatch<
    React.SetStateAction<DialogProductVariantProps>
  >;
  handleSubmit: () => void;
}

const VariantCreationDialog: React.FC<VariantCreationDialogProps> = ({
  handleSubmit,
  variantDialogData,
  setVariantDialogData,
}) => {
  const theme = useTheme();

  const handleCloseDialog = () => {
    setVariantDialogData((prev) => {
      return {
        ...prev,
        isOpen: false,
      };
    });
  };

  const handleDialogInputChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setVariantDialogData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleDialogImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setVariantDialogData((prev) => {
        return {
          ...prev,
          images: [...prev.images, ...Array.from(files)],
        };
      });
    }
  };

  const handleDialogModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setVariantDialogData((prev) => ({
      ...prev,
      model: file,
    }));
  };

  const removeImage = (index: number) => {
    setVariantDialogData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const clearVariantDialogData = () => {
    setVariantDialogData((prev) => {
      return {
        ...prev,
        price: undefined,
        quantity: undefined,
        name: "",
        description: "",
        images: [],
        model: null,
      };
    });
  };
  return (
    <>
      <Dialog open={variantDialogData.isOpen} onClose={handleCloseDialog}>
        <DialogTitle>Add New Variant</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            p: 4,
          }}
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
              sx={{
                mb: 2,
                color: theme.palette.text.primary,
                fontWeight: theme.typography.fontWeightMedium,
              }}
            >
              Product Images
            </Typography>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                component="label"
                variant="contained"
                startIcon={<FileUploadIcon />}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
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

              {variantDialogData.images.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {variantDialogData.images.length} images uploaded
                </Typography>
              )}
            </Box>

            {variantDialogData.images.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  borderRadius: theme.shape.borderRadius,
                  bgcolor: theme.palette.background.default,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 1,
                  }}
                >
                  <Button
                    size="small"
                    onClick={() =>
                      setVariantDialogData((prev) => ({ ...prev, images: [] }))
                    }
                    sx={{
                      color: theme.palette.error.main,
                      "&:hover": {
                        bgcolor: theme.palette.error.light,
                        color: theme.palette.error.main,
                      },
                    }}
                  >
                    Clear All
                  </Button>
                </Box>

                <ImageList
                  cols={3}
                  gap={16}
                  sx={{
                    m: 0,
                    "& .MuiImageListItem-root": {
                      borderRadius: theme.shape.borderRadius,
                      overflow: "hidden",
                      border: `1px solid ${theme.palette.divider}`,
                    },
                  }}
                >
                  {variantDialogData.images.map((image, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        loading="lazy"
                        style={{
                          height: 150,
                          width: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        onClick={() => removeImage(index)}
                        sx={{
                          position: "absolute",
                          right: 4,
                          top: 4,
                          bgcolor: theme.palette.background.paper,
                          "&:hover": {
                            bgcolor: theme.palette.action.hover,
                          },
                        }}
                        size="small"
                      >
                        <DeleteIcon
                          sx={{
                            color: theme.palette.error.main,
                            fontSize: 20,
                          }}
                        />
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
              sx={{
                mb: 2,
                color: theme.palette.text.primary,
                fontWeight: theme.typography.fontWeightMedium,
              }}
            >
              3D Model
            </Typography>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                component="label"
                variant="contained"
                startIcon={<FileUploadIcon />}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                Upload 3D Model
                <input
                  type="file"
                  hidden
                  accept=".glb,.gltf,.obj,.fbx"
                  onChange={handleDialogModelUpload}
                />
              </Button>
              <Typography>(Must be a .glb file)</Typography>
              {variantDialogData.model && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      flex: 1,
                    }}
                  >
                    {variantDialogData.model.name}
                  </Typography>
                  <IconButton
                    onClick={() =>
                      setVariantDialogData((prev) => ({
                        ...prev,
                        modelFile: null,
                      }))
                    }
                    size="small"
                    sx={{
                      color: theme.palette.error.main,
                      "&:hover": {
                        bgcolor: theme.palette.error.light,
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={clearVariantDialogData}
          >
            Clear
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Add Variant
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VariantCreationDialog;
