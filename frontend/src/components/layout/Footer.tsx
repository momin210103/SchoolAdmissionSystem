import { Link } from "react-router-dom";
import { GraduationCap, MapPin, Phone, Mail, Clock, ShieldCheck } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-950 text-slate-300 border-t border-primary-900 mt-auto">
      <div className="portal-container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* School Information */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-800 text-white flex items-center justify-center border border-primary-700/60">
                <GraduationCap className="w-5 h-5 text-accent-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight leading-tight">
                  Apex Academy
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  School Admission Portal
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering the next generation with equitable, transparent, and streamlined admission procedures powered by real-time seat reservation.
            </p>
            <div className="flex items-center gap-2 text-xs text-accent-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Official & Secure Admission System</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Navigation
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-400">
              <li>
                <Link
                  to="/"
                  className="hover:text-white transition-colors focus-ring rounded"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/admission"
                  className="hover:text-white transition-colors focus-ring rounded"
                >
                  Admission Guidelines & Classes
                </Link>
              </li>
              <li>
                <Link
                  to="/applications"
                  className="hover:text-white transition-colors focus-ring rounded"
                >
                  My Applications & Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information Placeholders */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Admissions Office
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                <span>100 Academy Blvd, Academic District, City Center</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent-400 shrink-0" />
                <span>+1 (800) 555-0199</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent-400 shrink-0" />
                <span>admissions@apexacademy.edu</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-accent-400 shrink-0" />
                <span>Mon – Fri: 8:30 AM – 4:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Admission Notice */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Seat Reservation
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Admission seats are held temporarily upon submission. Please complete student verification and confirmation before the hold period expires.
            </p>
            <div className="p-3 rounded-lg bg-primary-900/60 border border-primary-800 text-xs text-slate-300">
              Need assistance with your 17-digit Birth Registration Number? Contact our support desk during office hours.
            </div>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className="pt-8 mt-10 border-t border-primary-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} Apex Academy. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </span>
            <span className="hover:text-slate-400 transition-colors">
              Admission Terms
            </span>
            <span className="hover:text-slate-400 transition-colors">
              Security
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
