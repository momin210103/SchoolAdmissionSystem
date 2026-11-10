import {
  IdCard,
  GraduationCap,
  Timer,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const AdmissionStepsSection = () => {
  const steps = [
    {
      number: "01",
      title: "Enter Registration Number",
      description:
        "Input the student's unique 17-digit Birth Registration Number (BRN) to verify eligibility and ensure accurate record keeping.",
      icon: IdCard,
    },
    {
      number: "02",
      title: "Select Class & Shift",
      description:
        "Browse the available academic classes, view real-time seat counts, and select the designated grade level.",
      icon: GraduationCap,
    },
    {
      number: "03",
      title: "Reserve a Seat",
      description:
        "Initiate a temporary seat reservation. The system immediately places a secure hold on the seat to avoid concurrent clashes.",
      icon: Timer,
    },
    {
      number: "04",
      title: "Confirm Before Expiration",
      description:
        "Review guardian contact details and confirm your application before the hold timer elapses to secure the admission.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-12 sm:py-16 border-b border-slate-200/70">
      <div className="portal-container">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-14">
          <span className="caption text-secondary-600 mb-2 block font-semibold">
            How It Works
          </span>
          <h2 className="heading-1 mb-4">
            Four Simple Steps to Secure Admission
          </h2>
          <p className="body-default text-slate-600 leading-relaxed">
            Follow this clear step-by-step workflow to complete your student
            admission application smoothly.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="card card-body flex flex-col justify-between relative group hover:border-secondary-300 transition-colors"
              >
                {/* Header row with Step Number & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black tracking-tight text-slate-300 font-mono group-hover:text-secondary-600 transition-colors">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center group-hover:bg-secondary-50 group-hover:text-secondary-600 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex flex-col gap-2">
                  <h3 className="heading-4 text-primary-900 group-hover:text-secondary-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="body-small text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow indicator for all except the last item on large screens */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 shadow-xs pointer-events-none">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
