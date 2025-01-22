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
  Divider,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Image } from "../../types/types";
import { LoadingButton } from "@mui/lab";

export interface GroupDialogDataProps {
  isOpen: boolean;
  name: string;
  description: string;
  existingImage: Image;
  newImage: File;
}

interface VariantCreationDialogProps {
  groupDialogData: GroupDialogDataProps;
  setGroupDialogData: React.Dispatch<
    React.SetStateAction<GroupDialogDataProps>
  >;
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
  type: string;
  editMode?: boolean;
}

const VariantCreationDialog: React.FC<VariantCreationDialogProps> = ({
  onSubmit,
  groupDialogData,
  setGroupDialogData,
  onClose,
  loading,
  type,
  editMode = false,
}) => {
  const theme = useTheme();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleDialogInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGroupDialogData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDialogImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (file) {
      setGroupDialogData((prev) => ({
        ...prev,
        newImage: file,
      }));
    }
  };

  const clearGroupDialogData = () => {
    setGroupDialogData((prev) => ({
      ...prev,
      name: "",
      description: "",
      existingImages: [],
      newImages: [],
    }));
  };

  return (
    <Dialog fullWidth open={groupDialogData.isOpen} onClose={onClose}>
      <DialogTitle>Add New {type}</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          p: 4,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <FormControl>
            <TextField
              sx={{ mt: 2 }}
              autoFocus
              name="name"
              label="Name"
              fullWidth
              onChange={handleDialogInputChange}
              value={groupDialogData.name}
            />
          </FormControl>
          <FormControl>
            <TextField
              autoFocus
              label="Description"
              name="description"
              fullWidth
              multiline
              onChange={handleDialogInputChange}
              rows={4}
              value={groupDialogData.description}
            />
          </FormControl>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Button
            component="label"
            variant="contained"
            sx={{ mt: 2 }}
            startIcon={<FileUploadIcon />}
          >
            Upload {type} Logo
            <input
              type="file"
              hidden
              onChange={handleDialogImageUpload}
              accept="image/*"
            />
          </Button>
          {groupDialogData.existingImage && (
            <Box>
              <Typography variant="h6">Old Logo Preview:</Typography>
              <Box sx={{ mt: 2, position: "relative", width: "fit-content" }}>
                <img
                  src={
                    apiUrl.split("/api/")[0] +
                    groupDialogData.existingImage.imagePath
                  }
                  alt="Preview"
                  loading="lazy"
                  style={{
                    height: 150,
                    objectFit: "cover",
                  }}
                />
              </Box>
            </Box>
          )}
          {groupDialogData.newImage && (
            <Box>
              <Typography variant="h6">New Logo Preview:</Typography>
              <Box sx={{ mt: 2, position: "relative", width: "fit-content" }}>
                <img
                  src={URL.createObjectURL(groupDialogData.newImage)}
                  alt="Preview"
                  loading="lazy"
                  style={{
                    height: 150,
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  onClick={() => {
                    setGroupDialogData((prev) => ({
                      ...prev,
                      newImage: null,
                    }));
                  }}
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
              </Box>
            </Box>
          )}
        </Box>
        <Divider />
      </DialogContent>
      <DialogActions>
        <Box
          sx={{
            gap: 2,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            color="error"
            onClick={editMode ? onClose : clearGroupDialogData}
          >
            {editMode ? "Cancel" : "Clear"}
          </Button>
          <LoadingButton
            loading={loading}
            variant="contained"
            onClick={onSubmit}
          >
            Submit
          </LoadingButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default VariantCreationDialog;
