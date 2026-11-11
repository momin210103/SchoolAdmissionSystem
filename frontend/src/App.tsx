import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout";
import { ToastProvider } from "./context";
import {
  AdmissionLandingPage,
  ApplicationDetailsPage,
  MyApplicationsPage,
} from "./pages";

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<AdmissionLandingPage />} />
            <Route path="admission" element={<AdmissionLandingPage />} />
            <Route path="applications" element={<MyApplicationsPage />} />
            <Route
              path="applications/:holdId"
              element={<ApplicationDetailsPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
