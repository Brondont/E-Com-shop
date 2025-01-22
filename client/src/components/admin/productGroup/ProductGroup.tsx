import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import { Image } from "../../types/types";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import GroupDialog, { GroupDialogDataProps } from "./GroupDialog";
import { useFeedback } from "../../../FeedbackAlertContext";

interface BaseItem {
  ID: number;
  name: string;
  description: string;
  image: Image;
  CreatedAt: string;
  UpdatedAt: string;
}

interface ProductGroupProps<T extends Partial<BaseItem>> {
  name: string;
  items: T[];
  handleUpdateItems: (newItems: T[]) => void;
  loading: boolean;
}

const ProductGroup: React.FC<ProductGroupProps<BaseItem>> = ({
  name,
  items,
  handleUpdateItems,
  loading,
}) => {
  const [groupDialogData, setGroupDialogData] = useState<GroupDialogDataProps>({
    isOpen: false,
    name: "",
    description: "",
    newImage: null,
    existingImage: null,
  });
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<BaseItem | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showFeedback } = useFeedback();

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const handleOpenDialog = (mode: "create" | "edit", item?: BaseItem) => {
    if (mode === "edit" && item) {
      setSelectedItem(item);
      setGroupDialogData({
        isOpen: true,
        name: item.name,
        description: item.description,
        newImage: null,
        existingImage: item.image,
      });
      setIsEdit(true);
    } else {
      setSelectedItem(null);
      setGroupDialogData({
        isOpen: true,
        name: "",
        description: "",
        newImage: null,
        existingImage: null,
      });
    }
  };

  const handleCloseDialog = () => {
    setGroupDialogData({
      isOpen: false,
      name: "",
      description: "",
      existingImage: null,
      newImage: null,
    });
    setSelectedItem(null);
    setIsEdit(false);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();
    if (selectedItem) formData.append("ID", selectedItem.ID.toString());
    formData.append("name", groupDialogData.name);
    formData.append("description", groupDialogData.description);
    if (groupDialogData.newImage)
      formData.append("image", groupDialogData.newImage);

    try {
      const res = await fetch(`${apiUrl}/${name.toLocaleLowerCase()}`, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      handleCloseDialog();
      if (isEdit) {
        handleUpdateItems(
          items.map((item) =>
            item.ID === resData[name.toLocaleLowerCase()].ID
              ? resData[name.toLocaleLowerCase()]
              : item
          )
        );
      } else {
        handleUpdateItems([...items, resData[name.toLocaleLowerCase()]]);
      }
      showFeedback(
        `${name} ${isEdit ? "updated" : "created"} successfully!`,
        true
      );
    } catch (err) {
      console.log(err);
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          `Something went wrong with ${
            isEdit ? "updating" : "creating"
          } the ${name}.`,
          false
        );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (ID: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/${name.toLocaleLowerCase()}/${ID}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      showFeedback(`Deleting the ${name} was successfull!`, true);
      handleUpdateItems(items.filter((item) => item.ID !== ID));
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(`Something went wrong with deleting the ${name}.`, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  // TODO: Pagination is missing

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Card
        sx={{
          flex: "1 1 80%",
          maxWidth: "80%",
          width: "100%",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            p: 4,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Typography variant="h4">{name}</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("create")}
            >
              Add {name}
            </Button>
          </Box>
          <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.ID}>
                    <TableCell>{item.ID}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      {new Date(item.CreatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenDialog("edit", item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(item.ID)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>
      <GroupDialog
        groupDialogData={groupDialogData}
        setGroupDialogData={setGroupDialogData}
        onClose={handleCloseDialog}
        editMode={isEdit}
        onSubmit={handleSubmit}
        loading={isSubmitting}
        type={name}
      />
    </Box>
  );
};

export default ProductGroup;
