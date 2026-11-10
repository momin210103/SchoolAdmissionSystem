import { ArrowRight, BookOpen, Clock, ShieldCheck } from "lucide-react";
import heroImage from "../../assets/hero.png";

interface HeroSectionProps {
  onApplyClick?: () => void;
  onViewClassesClick?: () => void;
}

export const HeroSection = ({
  onApplyClick,
  onViewClassesClick,
}: HeroSectionProps) => {
  const handleScrollToClasses = () => {
    if (onViewClassesClick) {
      onViewClassesClick();
      return;
    }
    const element = document.getElementById("available-classes");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleApplyClick = () => {
    if (onApplyClick) {
      onApplyClick();
      return;
    }
    handleScrollToClasses();
  };

  return (
    <section className="relative overflow-hidden pt-4 pb-12 sm:pt-8 sm:pb-16 lg:pt-12 lg:pb-20 border-b border-slate-200/70">
      <div className="portal-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary-50 text-secondary-700 border border-secondary-200/80 w-fit">
              <ShieldCheck className="w-4 h-4 text-secondary-600" />
              <span>Academic Year 2026–2027 Admissions Open</span>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="heading-display">
                Excellence in Learning Starts with a Seamless Admission.
              </h1>
              <p className="body-large text-slate-600 max-w-2xl leading-relaxed">
                Welcome to the Apex Academy Admission Portal. Experience an
                equitable, first-come-first-served digital admission process
                equipped with real-time seat holds and verified student
                identification.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleApplyClick}
                className="btn btn-secondary btn-lg shadow-sm group"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={handleScrollToClasses}
                className="btn btn-outline btn-lg"
              >
                <span>View Available Classes</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-800 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-secondary-600" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-primary-900">
                    Real-Time Seat Locks
                  </div>
                  <div className="text-slate-500">
                    Temporary hold avoids double booking
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-800 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-accent-600" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-primary-900">
                    17-Digit BRN Verification
                  </div>
                  <div className="text-slate-500">
                    National student birth record matching
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Educational Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative Background Blob */}
              <div
                className="absolute -top-4 -right-4 w-72 h-72 bg-secondary-100 rounded-full blur-3xl opacity-60 pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-4 -left-4 w-72 h-72 bg-accent-100 rounded-full blur-3xl opacity-60 pointer-events-none"
                aria-hidden="true"
              />

              {/* Main Visual Card */}
              <div className="relative card p-6 bg-white/90 backdrop-blur-xs border-slate-200/90 shadow-soft">
                <div className="relative rounded-lg overflow-hidden bg-gradient-to-b from-primary-900/5 to-primary-900/10 flex items-center justify-center p-4">
                  <img
                    src={heroImage}
                    alt="School Admission Portal illustration"
                    className="w-full max-w-[280px] h-auto object-contain drop-shadow-md"
                    loading="eager"
                  />
                </div>

                {/* Floating Institution Stat Badge */}
                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-primary-900">
                      Standard Admission Queue
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Automated & Verified Queue
                    </div>
                  </div>
                  <span className="badge badge-confirmed">Live System</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
