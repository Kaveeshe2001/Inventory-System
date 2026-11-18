import { RouterProvider } from "react-router-dom"
import { router } from "./routes/Routes"

export const App: React.FC = () => {
  return <RouterProvider router={router} />
}
