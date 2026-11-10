import { AlertCircle, Clock, FileCheck2, Scale } from "lucide-react";

export const AdmissionInfoSection = () => {
  return (
    <section className="py-12 sm:py-16 border-b border-slate-200/70 bg-white/50">
      <div className="portal-container">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-14">
          <span className="caption text-secondary-600 mb-2 block font-semibold">
            Policy & Guidelines
          </span>
          <h2 className="heading-1 mb-4">
            Transparent, Equitable Admission Guidelines
          </h2>
          <p className="body-default text-slate-600 leading-relaxed">
            Apex Academy follows an automated, transparent admission protocol to
            ensure fairness for every prospective student and guardian. Review
            the core principles governing our admission intake below.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: First-Come, First-Served Policy */}
          <div className="card card-body flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center border border-primary-100">
              <Scale className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <h3 className="heading-3 mb-2">First-Come-First-Served</h3>
              <p className="body-small text-slate-600 leading-relaxed">
                Seats are allocated strictly in chronological order of
                submission. Our automated admission queue prevents manual
                bias, giving every eligible applicant an equal opportunity.
              </p>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
              Zero manual queues • Instant timestamp audit
            </div>
          </div>

          {/* Card 2: Temporary Seat Reservation */}
          <div className="card card-body flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="heading-3 mb-2">Temporary Seat Holds</h3>
              <p className="body-small text-slate-600 leading-relaxed">
                Upon selecting an available class, a seat is locked exclusively
                for you during a timed hold window. This prevents race
                conditions and gives you uninterrupted time to verify details.
              </p>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
              Active countdown timer • Guaranteed seat locking
            </div>
          </div>

          {/* Card 3: Important Instructions */}
          <div className="card card-body flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-100">
              <FileCheck2 className="w-6 h-6 text-accent-700" />
            </div>
            <div>
              <h3 className="heading-3 mb-2">Important Instructions</h3>
              <p className="body-small text-slate-600 leading-relaxed">
                Ensure you have the student's 17-digit national Birth
                Registration Number ready. Incomplete submissions or expired
                holds will return the seat back to the general quota
                immediately.
              </p>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
              17-digit BRN required • Valid guardian contact
            </div>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="mt-8 p-4 rounded-xl bg-secondary-50/70 border border-secondary-200/80 flex items-start gap-3.5 max-w-4xl mx-auto">
          <AlertCircle className="w-5 h-5 text-secondary-600 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700 leading-relaxed">
            <strong className="font-semibold text-primary-900">
              Please note:
            </strong>{" "}
            Once an admission seat hold is initiated, you must confirm your
            application before the timer reaches zero. If expired, a new hold
            request will need to be submitted subject to remaining seat
            availability.
          </div>
        </div>
      </div>
    </section>
  );
};
