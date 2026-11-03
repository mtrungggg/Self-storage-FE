import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { SignalRProvider } from "./context/SignalRContext";
import { LanguageProvider } from "./context/LanguageContext";
import SmoothScroll from "./components/SmoothScroll";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SignalRProvider>
          <LanguageProvider>
            <SmoothScroll>
              <AppRoutes />
            </SmoothScroll>
          </LanguageProvider>
        </SignalRProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
