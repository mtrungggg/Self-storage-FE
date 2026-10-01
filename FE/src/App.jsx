import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { StorageCatalogProvider } from './hooks/useStorageCatalog';

function App() {
  return (
    <BrowserRouter>
      <StorageCatalogProvider><AppRoutes /></StorageCatalogProvider>
    </BrowserRouter>
  );
}

export default App;
