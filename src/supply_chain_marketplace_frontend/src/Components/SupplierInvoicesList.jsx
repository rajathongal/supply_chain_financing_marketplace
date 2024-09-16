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
import { Check, Close } from '@mui/icons-material';

const SupplierInvoiceList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { getInvoices, invoices } = useAuth();
  const navigate = useNavigate();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    getInvoices();
  }, []);


  return (
    <Paper>
      <TableContainer
        sx={{ minWidth: { sm: "40vh", md: "50vh", xl: "120vh" } }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>InvoiceId</TableCell>
              <TableCell>Purchase Order Id</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>DueDate</TableCell>
              <TableCell>Is Funded</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length > 0 ? (
              invoices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((invoice, index) => {
                  const value = invoice.isFunded ? <Check color="success"/> : <Close color="error"/>
                  return(
                  <TableRow key={index}>
                    <TableCell>{Number(invoice.invoiceId)}</TableCell>
                    <TableCell>{Number(invoice.purchaseOrderId)}</TableCell>
                    <TableCell>{Number(invoice.amount)}</TableCell>
                    <TableCell>
                      {new Date(
                        Number(invoice.dueDate) / 1000000
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{value}</TableCell>
                    <TableCell>{Object.keys(invoice.status)[0]}</TableCell>
                  </TableRow>
                )})
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1">
                    No invoices available.
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
        count={invoices.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default SupplierInvoiceList;
