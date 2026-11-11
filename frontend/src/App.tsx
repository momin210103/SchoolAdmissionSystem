import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout";
import { ToastProvider } from "./context";
import {
  AdmissionLandingPage,
  ApplicationDetailsPage,
  MyApplicationsPage,
  CreateClassPage,
} from "./pages";
// import { AvailableClassesSection } from "./components/admission";

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<AdmissionLandingPage />} />
            {/* <Route path="admission" element={<AvailableClassesSection />} /> */}
            <Route path="applications" element={<MyApplicationsPage />} />
            <Route
              path="applications/:holdId"
              element={<ApplicationDetailsPage />}
            />
            <Route path="classes/create" element={<CreateClassPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
