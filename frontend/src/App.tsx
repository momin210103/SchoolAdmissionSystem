import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { MainLayout } from "./components/layout";
import { ArrowRight, BookOpen, Clock, ShieldCheck } from "lucide-react";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route
            index
            element={
              <div className="flex flex-col gap-8 max-w-4xl mx-auto py-6">
                <div className="card p-8 sm:p-10 text-center flex flex-col items-center gap-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-secondary-50 text-secondary-700 border border-secondary-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-secondary-600" />
                    <span>Academic Year 2026–2027 Admissions Open</span>
                  </div>
                  <h1 className="heading-display">
                    Welcome to the School Admission Portal
                  </h1>
                  <p className="body-large text-slate-600 max-w-2xl">
                    Apply for available classes, reserve admission seats with automated hold timers, and track your application status in real-time.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                    <Link to="/admission" className="btn btn-secondary btn-lg">
                      <span>Explore Admission Classes</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/applications" className="btn btn-outline btn-lg">
                      Track My Application
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="card card-body flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-800 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                      <h2 className="heading-4 mb-1">Temporary Seat Holds</h2>
                      <p className="body-small">
                        Seats are reserved temporarily while you verify details and submit required student documents.
                      </p>
                    </div>
                  </div>
                  <div className="card card-body flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-800 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <h2 className="heading-4 mb-1">Birth Registration Number</h2>
                      <p className="body-small">
                        Fast and secure student identity verification using the official 17-digit registration number.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          <Route
            path="admission"
            element={
              <div className="card p-8 text-center max-w-2xl mx-auto">
                <h1 className="heading-2 mb-2">Admission Classes</h1>
                <p className="body-default text-slate-600">
                  Select an admission class to check seat availability and place a temporary hold.
                </p>
              </div>
            }
          />
          <Route
            path="applications"
            element={
              <div className="card p-8 text-center max-w-2xl mx-auto">
                <h1 className="heading-2 mb-2">My Applications</h1>
                <p className="body-default text-slate-600">
                  Check your current seat hold countdown, payment status, or confirmed admissions.
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
