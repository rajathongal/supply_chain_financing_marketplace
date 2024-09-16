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

const InvestorInvestmentList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { getInvestorInvestments, investments } = useAuth();
  const navigate = useNavigate();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePayInvoice = async (data) => {

    navigate("/checkinvoice", { state: data });
  };

  useEffect(() => {
    getInvestorInvestments();
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
              <TableCell>Amount Funded</TableCell>
              <TableCell>Expected Returns</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {investments.length > 0 ? (
              investments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((invoice, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{Number(invoice.invoiceId)}</TableCell>
                      <TableCell>{Number(invoice.amount)}</TableCell>
                      <TableCell>{Number(invoice.expectedReturn)}</TableCell>
                      <TableCell>
                        {
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
                            <Typography noWrap>Check Invoice</Typography>
                          </Button>
                        }
                      </TableCell>
                    </TableRow>
                  );
                })
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
        count={investments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default InvestorInvestmentList;
