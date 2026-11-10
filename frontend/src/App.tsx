import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout";
import { AdmissionLandingPage } from "./pages";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<AdmissionLandingPage />} />
          <Route path="admission" element={<AdmissionLandingPage />} />
          <Route
            path="applications"
            element={
              <div className="card p-8 sm:p-12 text-center max-w-2xl mx-auto">
                <h1 className="heading-2 mb-2">My Applications</h1>
                <p className="body-default text-slate-600">
                  Check your current seat hold countdown, payment status, or
                  confirmed admissions.
                </p>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
