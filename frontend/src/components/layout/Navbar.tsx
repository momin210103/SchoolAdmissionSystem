import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { GraduationCap, Menu, X, IdCard, PlusCircle } from "lucide-react";
import { useStudentId } from "../../hooks/useStudentId";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { studentId } = useStudentId();
  const location = useLocation();

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setIsMobileMenuOpen(false);
  }

  // Close mobile menu on Escape key press
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg transition-colors focus-ring ${
      isActive
        ? "text-secondary-600 bg-secondary-50 font-semibold"
        : "text-slate-600 hover:text-primary-900 hover:bg-slate-100/80"
    }`;

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2.5 text-base font-medium rounded-lg transition-colors focus-ring ${
      isActive
        ? "text-secondary-600 bg-secondary-50 font-semibold"
        : "text-slate-700 hover:text-primary-900 hover:bg-slate-100"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="portal-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Name */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-ring rounded-lg p-1"
            aria-label="School Admission System Home"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-900 text-white flex items-center justify-center shadow-sm group-hover:bg-primary-800 transition-colors">
              <GraduationCap className="w-5 h-5 text-accent-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-primary-900 group-hover:text-secondary-600 transition-colors leading-tight">
                Onnorokom Academy
              </span>
              <span className="text-xs text-slate-500 font-medium leading-none">
                Admission Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1.5"
            aria-label="Main Navigation"
          >
            <NavLink to="/" className={navLinkClasses} end>
              Home
            </NavLink>
            {/* <NavLink to="/admission" className={navLinkClasses}>
              Admission
            </NavLink> */}
            <NavLink to="/applications" className={navLinkClasses}>
              My Applications
            </NavLink>
            <NavLink to="/classes/create" className={navLinkClasses}>
              <PlusCircle className="w-4 h-4 mr-1.5 shrink-0" />
              <span>Create Class</span>
            </NavLink>
          </nav>

          {/* Right Header Section: Student ID Indicator & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {studentId && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-800 bg-primary-50/80 border border-primary-200/70 rounded-full"
                title={`Active Student ID: ${studentId}`}
                aria-label={`Active Student ID: ${studentId}`}
              >
                <IdCard className="w-3.5 h-3.5 text-secondary-600 shrink-0" />
                <span className="text-slate-500">ID:</span>
                <span className="font-mono font-semibold text-primary-900">
                  {studentId.length > 12
                    ? `${studentId.slice(0, 10)}…`
                    : studentId}
                </span>
              </div>
            )}
            {/* <Link
              to="/admission"
              className="btn btn-secondary btn-sm shadow-xs"
            >
              Apply Now
            </Link> */}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {studentId && (
              <div
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-800 bg-primary-50 border border-primary-200 rounded-full"
                title={`Student ID: ${studentId}`}
              >
                <IdCard className="w-3.5 h-3.5 text-secondary-600" />
                <span className="font-mono text-xs">
                  {studentId.length > 8
                    ? `${studentId.slice(0, 6)}…`
                    : studentId}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 text-slate-600 hover:text-primary-900 hover:bg-slate-100 rounded-lg focus-ring transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-lg animate-in fade-in duration-150">
          <nav
            className="portal-container py-3 flex flex-col gap-1"
            aria-label="Mobile Navigation"
          >
            <NavLink
              to="/"
              className={mobileNavLinkClasses}
              onClick={() => setIsMobileMenuOpen(false)}
              end
            >
              Home
            </NavLink>
            {/* <NavLink
              to="/admission"
              className={mobileNavLinkClasses}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admission
            </NavLink> */}
            <NavLink
              to="/applications"
              className={mobileNavLinkClasses}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Applications
            </NavLink>
            <NavLink
              to="/classes/create"
              className={mobileNavLinkClasses}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <PlusCircle className="w-4 h-4 mr-2 text-secondary-600 shrink-0" />
              <span>Create Class</span>
            </NavLink>

            <div className="pt-3 mt-1 border-t border-slate-100 flex flex-col gap-2">
              {studentId && (
                <div className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-slate-400 uppercase text-[10px] tracking-wider mb-0.5">
                    Active Student Session
                  </div>
                  <div className="font-mono font-semibold text-primary-900 break-all">
                    {studentId}
                  </div>
                </div>
              )}
              <Link
                to="/admission"
                className="btn btn-secondary btn-md w-full justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Apply for Admission
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
