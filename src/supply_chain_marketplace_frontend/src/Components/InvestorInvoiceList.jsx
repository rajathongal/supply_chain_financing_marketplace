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
import { Check, Close } from "@mui/icons-material";

const InvestorInvoiceList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { getUnfundedInvoices, unFundedInvoices } = useAuth();
  const navigate = useNavigate();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePayInvoice = async (data) => {
    data.buyer = data.buyer.toString();
    data.supplier = data.supplier.toString();

    navigate("/fundinvoice", { state: data });
  };

  useEffect(() => {
    getUnfundedInvoices();
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
              <TableCell>Status</TableCell>
              <TableCell>Pay</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unFundedInvoices.length > 0 ? (
              unFundedInvoices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((invoice, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{Number(invoice.invoiceId)}</TableCell>
                      <TableCell>{Number(invoice.purchaseOrderId)}</TableCell>
                      <TableCell>{Number(invoice.amount)}</TableCell>
                      <TableCell>
                        {new Date(
                          Number(invoice.dueDate) / 1000000
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{Object.keys(invoice.status)[0]}</TableCell>
                      <TableCell>
                        {Object.keys(invoice.status)[0] !== "Funded" &&
                        Object.keys(invoice.status)[0] !== "Paid" ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handlePayInvoice(invoice)}
                            sx={{
                              width: "fit-content",
                              whiteSpace: "normal",
                              wordWrap: "break-word",
                            }}
                          >
                            <Typography noWrap>Fund Invoice</Typography>
                          </Button>
                        ) : (
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
                            <Typography noWrap>Invoice Funded</Typography>
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
                    No invoices available to fund.
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
        count={unFundedInvoices.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default InvestorInvoiceList;
