import React, { useState, ChangeEvent, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  IconButton,
  CircularProgress,
  useTheme,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useFeedback } from "../../../FeedbackAlertContext"; // Adjust the path as needed
import { Image } from "./VariantsTable";

// TODO: Seperate the logic for creating manufacturers/categories for the ability to create editing for them.

export interface BaseProductCreationData {
  name: string;
  description: string;
  image: File | null;
  categoryID: number;
  manufacturerID: number;
}

export interface Manufacturer {
  ID: number;
  name: string;
  description: string;
  image: Image;
}

export interface Category {
  ID: number;
  name: string;
  description: string;
  image: Image;
}

interface SelectAddDialogProps {
  isOpen: boolean;
  type: string;
  name: string;
  description: string;
  image: File | null;
}

interface BaseProductCreationProps {
  newBaseProduct: BaseProductCreationData;
  submittingNewBaseProduct: boolean;
  handleSubmitNewBaseProduct: () => {};
  setNewBaseProduct: React.Dispatch<
    React.SetStateAction<BaseProductCreationData>
  >;
}

const BaseProductCreation: React.FC<BaseProductCreationProps> = ({
  newBaseProduct,
  submittingNewBaseProduct,
  setNewBaseProduct,
  handleSubmitNewBaseProduct,
}) => {
  const theme = useTheme();
  const { showFeedback } = useFeedback();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loadingManufacturers, setLoadingManufacturers] =
    useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [selectAddDialogData, setSelectAddDialogData] =
    useState<SelectAddDialogProps>({
      isOpen: false,
      name: "",
      type: "",
      description: "",
      image: null,
    });
  const [submittingSelectAddDialog, setSubmittingSelectAddDialog] =
    useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const handleNewBaseProductInput = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setNewBaseProduct((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleNewBaseProductImageUpload = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewBaseProduct((prev) => {
        return {
          ...prev,
          image: file,
        };
      });
    }
  };

  const handleOpenAddSelectDialog = (type: string) => {
    setSelectAddDialogData((prev) => {
      return {
        ...prev,
        isOpen: true,
        type,
      };
    });
  };

  const handleCloseAddSelectDialog = () => {
    setSelectAddDialogData((prev) => {
      return {
        ...prev,
        isOpen: false,
      };
    });
  };

  const handleAddSelectInput = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setSelectAddDialogData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleAddSelectImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectAddDialogData((prev) => {
        return {
          ...prev,
          image: file,
        };
      });
    }
  };

  const validateSubmitAddSelectDialogForm = (): string => {
    if (selectAddDialogData.name === "") {
      return "Name is required";
    }
    if (selectAddDialogData.description === "") {
      return "Description is required";
    }
    if (!selectAddDialogData.image) {
      return "Logo is required";
    }
    return "";
  };

  const handleSubmitAddSelectDialog = async () => {
    const err = validateSubmitAddSelectDialogForm();
    if (err !== "") {
      showFeedback(err, false);
      return;
    }
    if (submittingSelectAddDialog) return;
    setSubmittingSelectAddDialog(true);

    const formData = new FormData();

    formData.append("name", selectAddDialogData.name);
    formData.append("description", selectAddDialogData.description);
    if (selectAddDialogData.image) {
      formData.append("image", selectAddDialogData.image);
    }

    try {
      const res = await fetch(
        `${apiUrl}/${selectAddDialogData.type.toLocaleLowerCase()}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      if (selectAddDialogData.type === "Category") {
        setCategories((prev) => [...prev, resData.category]);
      } else {
        setManufacturers((prev) => [...prev, resData.manufacturer]);
      }
      showFeedback(`${selectAddDialogData.type} created successfully!`, true);
      handleCloseAddSelectDialog();
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          `Something went wrong with adding ${selectAddDialogData.type}`,
          false
        );
    } finally {
      setSubmittingSelectAddDialog(false);
    }
  };

  const fetchCategories = useCallback(async () => {
    if (loadingCategories) return;
    setLoadingCategories(true);
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
          "Something went wrong fetching the categories, reset the page.",
          false
        );
    } finally {
      setLoadingCategories(false);
    }
  }, [apiUrl]);

  const fetchManufacturers = useCallback(async () => {
    if (loadingManufacturers) return;
    setLoadingManufacturers(true);

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
          "Something went wrong fetching the manufacturers, reset the page.",
          false
        );
    } finally {
      setLoadingManufacturers(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
  }, [apiUrl, fetchCategories, fetchManufacturers]);

  const clearNewBaseProduct = () => {
    setNewBaseProduct({
      name: "",
      description: "",
      categoryID: undefined,
      manufacturerID: undefined,
      image: null,
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Box>
        <Typography variant="h6">Create A Base Product:</Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <FormControl>
          <TextField
            sx={{ mt: 2 }}
            autoFocus
            name="name"
            label={"Name"}
            onChange={handleNewBaseProductInput}
            fullWidth
            value={newBaseProduct.name}
          />
        </FormControl>
        <FormControl>
          <TextField
            autoFocus
            label="Description"
            name="description"
            onChange={handleNewBaseProductInput}
            fullWidth
            multiline
            rows={4}
            value={newBaseProduct.description}
          />
        </FormControl>
        <FormControl>
          <InputLabel>Manufacturer</InputLabel>
          <Select
            name="manufacturerID"
            label="Manufacturer"
            onChange={handleNewBaseProductInput}
            value={newBaseProduct.manufacturerID?.toString() || ""}
          >
            {loadingManufacturers ? (
              <MenuItem>
                <CircularProgress />
              </MenuItem>
            ) : (
              manufacturers.length > 0 &&
              manufacturers.map((manufacturer) => {
                return (
                  <MenuItem key={manufacturer.ID} value={manufacturer.ID}>
                    {manufacturer.name}
                  </MenuItem>
                );
              })
            )}
            <Button
              onClick={() => {
                handleOpenAddSelectDialog("Manufacturer");
              }}
              fullWidth
              startIcon={<AddIcon />}
            >
              Add New Manufacturer
            </Button>
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Category</InputLabel>
          <Select
            name="categoryID"
            label="Category"
            onChange={handleNewBaseProductInput}
            value={newBaseProduct.categoryID?.toString() || ""}
          >
            {loadingCategories ? (
              <MenuItem>
                <CircularProgress />
              </MenuItem>
            ) : (
              categories.length > 0 &&
              categories.map((category) => {
                return (
                  <MenuItem key={category.ID} value={category.ID}>
                    {category.name}
                  </MenuItem>
                );
              })
            )}
            <Button
              onClick={() => {
                handleOpenAddSelectDialog("Category");
              }}
              fullWidth
              startIcon={<AddIcon />}
            >
              Add New Category
            </Button>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Button
          component="label"
          variant="contained"
          sx={{ mt: 2 }}
          startIcon={<FileUploadIcon />}
        >
          Upload Base Product Image
          <input
            type="file"
            onChange={handleNewBaseProductImageUpload}
            hidden
            accept="image/*"
          />
        </Button>
        {newBaseProduct.image && (
          <Box>
            <Typography variant="h6">Image Preview:</Typography>
            <Box sx={{ mt: 2, position: "relative", width: "fit-content" }}>
              <img
                src={URL.createObjectURL(newBaseProduct.image)}
                alt="Preview"
                loading="lazy"
                style={{
                  height: 150,
                  objectFit: "cover",
                }}
              />
              <IconButton
                onClick={() =>
                  setNewBaseProduct((prev) => {
                    return { ...prev, image: null };
                  })
                }
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
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          width: "100%",
          gap: 2,
        }}
      >
        <Button onClick={clearNewBaseProduct} variant="outlined" color="error">
          Clear
        </Button>
        <LoadingButton
          loading={submittingNewBaseProduct}
          onClick={handleSubmitNewBaseProduct}
          variant="contained"
        >
          Submit
        </LoadingButton>
      </Box>
      <Dialog
        open={selectAddDialogData.isOpen}
        onClose={handleCloseAddSelectDialog}
      >
        <DialogTitle>Add New {selectAddDialogData.type}</DialogTitle>
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
                onChange={handleAddSelectInput}
                value={selectAddDialogData.name}
              />
            </FormControl>
            <FormControl>
              <TextField
                autoFocus
                label="Description"
                name="description"
                fullWidth
                multiline
                onChange={handleAddSelectInput}
                rows={4}
                value={selectAddDialogData.description}
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
              Upload {selectAddDialogData.type} Logo
              <input
                type="file"
                hidden
                onChange={handleAddSelectImageUpload}
                accept="image/*"
              />
            </Button>
            {selectAddDialogData.image && (
              <Box>
                <Typography variant="h6">Logo Preview:</Typography>
                <Box sx={{ mt: 2, position: "relative", width: "fit-content" }}>
                  <img
                    src={URL.createObjectURL(selectAddDialogData.image)}
                    alt="Preview"
                    loading="lazy"
                    style={{
                      height: 150,
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    onClick={() =>
                      setSelectAddDialogData((prev) => {
                        return { ...prev, image: null };
                      })
                    }
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
              onClick={handleCloseAddSelectDialog}
            >
              Cancel
            </Button>
            <LoadingButton
              loading={submittingSelectAddDialog}
              variant="contained"
              onClick={handleSubmitAddSelectDialog}
            >
              Submit
            </LoadingButton>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BaseProductCreation;
