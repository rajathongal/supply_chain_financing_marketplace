import React, { Suspense, Fragment, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Loading from "./Components/Loading";
import Box from "@mui/material/Box";
import ErrorBoundary from "./Utils/ErrorBoundary";
import Layout from "./Components/Layout";
import NoGuard from "./Guards/NoGuard";
import GuestGuard from "./Guards/GuestGuard";
import HomeGuard from "./Guards/HomeGuard";
import AdminGuard from "./Guards/AdminGuard";
import UserRoleGuard from "./Guards/UserRoleGuard";

// pages Imports
const Home = lazy(() => import("./Pages/Home"));
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const SignIn = lazy(() => import("./Pages/SignIn"));
const SetAdmin = lazy(() => import("./Pages/SetAdmin"));
const SetUserRole = lazy(() => import("./Pages/SetUserRole"));
const Wallet = lazy(() => import("./Pages/Wallet"));

const RenderRoutes = () => (
  <Routes>
    {routes.map((route, i) => {
      const Guard = route.guard || Fragment;
      const pageTitle = route.title;
      return (
        <Route
          key={i}
          path={route.path}
          element={
            <>
              <Box
                sx={{
                  height: "100dvh",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ErrorBoundary>
                  <Helmet>
                    <title>{`${
                      pageTitle && `${pageTitle} - `
                    }SupplyHub`}</title>
                  </Helmet>
                  <Guard>
                    <Layout>
                      <Suspense fallback={<Loading />}>
                        {route.routes ? (
                          renderRoutes(route.routes)
                        ) : (
                          <route.component />
                        )}
                      </Suspense>
                    </Layout>
                  </Guard>
                </ErrorBoundary>
              </Box>
            </>
          }
        />
      );
    })}
  </Routes>
);

const routes = [
  {
    guard: HomeGuard,
    path: "/",
    component: Home,
    title: "Home",
  },
  {
    guard: GuestGuard,
    path: "/dashboard",
    component: Dashboard,
    title: "Dashboard",
  },
  {
    guard: NoGuard,
    path: "/signin",
    component: SignIn,
    title: "Signin",
  },
  {
    guard: AdminGuard,
    path: "/setadmin",
    component: SetAdmin,
    title: "SetAdmin",
  },
  {
    guard: UserRoleGuard,
    path: "/setuserrole",
    component: SetUserRole,
    title: "SetUserRole",
  },
  {
    guard: GuestGuard,
    path: "/wallet",
    component: Wallet,
    title: "Wallet"
  }
];

export default RenderRoutes;
