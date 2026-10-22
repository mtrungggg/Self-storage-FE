import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import SmoothScroll from "./components/SmoothScroll";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SmoothScroll>
          <AppRoutes />
        </SmoothScroll>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
