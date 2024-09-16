import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  Chip,
  Typography,
  Box,
} from "@mui/material";
import { useAuth } from "../Context/useAuthClient";
import { useNavigate } from "react-router-dom";

const SupplierList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { getSupplierProfiles, supplierProfiles: suppliers } = useAuth();
  const navigate = useNavigate();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreatePO = (supplier) => {
    supplier.principal = supplier.principal.toString();
    navigate("/createPurchaseOrder", { state: supplier });
  };

  useEffect(() => {
    getSupplierProfiles();
  }, []);

  return (
    <Paper>
      <TableContainer
        sx={{ minWidth: { sm: "40vh", md: "50vh", xl: "120vh" } }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Categories</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length > 0 ? (
              suppliers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((supplier, index) => (
                  <TableRow key={index}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.description}</TableCell>
                    <TableCell>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {supplier.categories.map((category, idx) => (
                          <Chip key={idx} label={category} size="small" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleCreatePO(supplier)}
                        sx={{
                          width: "fit-content",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                        }}
                      >
                        <Typography noWrap>Create Purchase Order</Typography>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1">
                    No Suppliers available.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={suppliers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default SupplierList;
