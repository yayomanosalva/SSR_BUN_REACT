import { lazy, Suspense } from "react";
import Home from "./pages/Home";
import { createRouter, RouterProvider, Link, Outlet, RootRoute, Route } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

// Define tus rutas
const rootRoute = new RootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});

const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: lazy(() => import('./pages/About')),
});

const routeTree = rootRoute.addChildren([homeRoute, aboutRoute]);

const router = createRouter({
  routeTree,
});

export { router, RouterProvider };