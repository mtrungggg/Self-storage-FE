import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { SignalRProvider } from "./context/SignalRContext";
import { LanguageProvider } from "./context/LanguageContext";
import SmoothScroll from "./components/SmoothScroll";
import GlobalShaderBackground from "./components/GlobalShaderBackground";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SignalRProvider>
          <LanguageProvider>
            <GlobalShaderBackground />
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
