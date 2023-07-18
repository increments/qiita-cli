import { Outlet, ScrollRestoration } from "react-router-dom";

export const Layout = () => {
  return (
    <div>
      <Outlet />
      <ScrollRestoration />
    </div>
  );
};
