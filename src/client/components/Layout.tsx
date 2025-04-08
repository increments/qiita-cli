import { Outlet, ScrollRestoration } from "react-router";

export const Layout = () => {
  return (
    <div>
      <Outlet />
      <ScrollRestoration />
    </div>
  );
};
