import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ItemsIndex } from "../pages/items";
import { ItemsShow } from "../pages/items/show";
import { Layout } from "./Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ItemsIndex />,
      },
      {
        path: "/items/:id",
        element: <ItemsShow />,
      },
    ],
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};
