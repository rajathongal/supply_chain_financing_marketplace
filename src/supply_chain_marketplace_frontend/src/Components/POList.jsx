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

const POList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { getPurchaseOrders, purchaseOrders, getBuyerByPP } = useAuth();
  const navigate = useNavigate();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreatePO = (po) => {
    po.buyerPrincipal = po.buyerPrincipal.toString();
    po.supplierPrincipal = po.supplierPrincipal.toString();

    navigate("/createInvoice", { state: po });
  };

  useEffect(() => {
    getPurchaseOrders();
  }, []);
  return (
    <Paper>
      <TableContainer
        sx={{ minWidth: { sm: "40vh", md: "50vh", xl: "120vh" } }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>id</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>DueDate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseOrders.length > 0 ? (
              purchaseOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((po, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{Number(po.id)}</TableCell>

                      <TableCell>{po.description}</TableCell>
                      <TableCell>{Number(po.amount)} ICP</TableCell>
                      <TableCell>
                        {new Date(
                          Number(po.dueDate) / 1000000
                        ).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {Object.keys(po.status)[0] === "Created" ? (
                          <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleCreatePO(po)}
                          sx={{
                            width: "fit-content",
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                          }}
                        >
                          <Typography noWrap>Create Invoice</Typography>
                        </Button>
                        ): (
                          <Button
                          variant="contained"
                          color="info"
                          disabled
                          sx={{
                            width: "fit-content",
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                          }}
                        >
                          <Typography noWrap>Invoice Created</Typography>
                        </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1">
                    No purchase orders available.
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
        count={purchaseOrders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default POList;
