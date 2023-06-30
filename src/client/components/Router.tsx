import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ItemsIndex } from "../pages/items";
import { ItemsShow } from "../pages/items/show";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ItemsIndex />,
  },
  {
    path: "/items/:id",
    element: <ItemsShow />,
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};
