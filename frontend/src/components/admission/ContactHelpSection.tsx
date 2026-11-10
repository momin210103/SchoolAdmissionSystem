import { HelpCircle, Mail, Phone, Clock, MapPin } from "lucide-react";

export const ContactHelpSection = () => {
  const faqs = [
    {
      question: "Where do I find the 17-digit Birth Registration Number?",
      answer:
        "The 17-digit number is printed on the official national Birth Registration Certificate issued by civil authorities. Please ensure all 17 digits are entered without hyphens or spaces.",
    },
    {
      question: "What happens if my seat hold expires?",
      answer:
        "If confirmation is not completed within the hold countdown, the seat is automatically returned to the public quota. You will need to initiate a new reservation if seats remain available.",
    },
    {
      question: "Can one student hold multiple seats?",
      answer:
        "No. To preserve fairness and avoid hoarding, each student identity is limited to one active seat hold at a time across all admission classes.",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-slate-50/50">
      <div className="portal-container">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-14">
          <span className="caption text-secondary-600 mb-2 block font-semibold">
            Support Desk
          </span>
          <h2 className="heading-1 mb-4">Admissions Help & Assistance</h2>
          <p className="body-default text-slate-600 leading-relaxed">
            Need guidance during your application? Our admissions team is
            available to assist prospective students and guardians with
            verification and enrollment inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: FAQs */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h3 className="heading-3 mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-secondary-600" />
              <span>Frequently Asked Questions</span>
            </h3>

            {faqs.map((faq, index) => (
              <div key={index} className="card p-5">
                <h4 className="heading-4 text-base mb-2 text-primary-900">
                  {faq.question}
                </h4>
                <p className="body-small text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column: Contact Desk Information */}
          <div className="lg:col-span-5">
            <div className="card p-6 sm:p-8 bg-white shadow-soft">
              <h3 className="heading-3 mb-4 text-primary-900">
                Admissions Registrar
              </h3>
              <p className="body-small text-slate-600 mb-6 leading-relaxed">
                For in-person document validation or portal technical support,
                reach out to our helpdesk through the following channels:
              </p>

              <div className="flex flex-col gap-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-secondary-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-primary-900 text-xs">
                      Campus Office
                    </div>
                    <div>100 Academy Blvd, Academic District, City Center</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-secondary-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-primary-900 text-xs">
                      Telephone Helpline
                    </div>
                    <div>+1 (800) 555-0199</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-secondary-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-primary-900 text-xs">
                      Email Inquiries
                    </div>
                    <div>admissions@apexacademy.edu</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-secondary-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-primary-900 text-xs">
                      Working Hours
                    </div>
                    <div>Monday to Friday: 8:30 AM – 4:30 PM</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
                Please have your 17-digit student registration number available
                when contacting support.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
