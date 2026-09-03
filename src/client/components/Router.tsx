import { createBrowserRouter, RouterProvider } from "react-router";
import { ItemsIndex } from "../pages/items";
import { ItemsShow } from "../pages/items/show";
import { SlidesShow } from "../pages/slides/show";
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
      {
        path: "/slides/:id",
        element: <SlidesShow />,
      },
    ],
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};
