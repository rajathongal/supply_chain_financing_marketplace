import React, { Suspense, Fragment, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Loading from "./Components/Loading";
import ErrorBoundary from "./Utils/ErrorBoundary";
import Layout from "./Components/Layout";
import NoGuard from "./Guards/NoGuard";
import GuestGuard from "./Guards/GuestGuard";

// pages Imports
const Home = lazy(() => import("./Pages/Home"));
const Dashboard = lazy(() => import("./Pages/Dashboard"));

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
              <ErrorBoundary>
                <Guard>
                  <Helmet>
                    <title>{`${
                      pageTitle && `${pageTitle} - `
                    }SupplyHub`}</title>
                  </Helmet>
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
            </>
          }
        />
      );
    })}
  </Routes>
);

const routes = [
  {
    guard: NoGuard,
    path: "/",
    component: Home,
    title: "Home",
  },
  {
    guard: GuestGuard,
    path: "/dashboard",
    component: Dashboard,
    title: "Dashboard",
  }
];

export default RenderRoutes;
