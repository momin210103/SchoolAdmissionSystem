import {
  HeroSection,
  AdmissionInfoSection,
  AdmissionStepsSection,
  AvailableClassesSection,
  ContactHelpSection,
} from "../components/admission";

export const AdmissionLandingPage = () => {
  return (
    <div className="flex flex-col -mx-4 sm:-mx-6 lg:-mx-8 -my-8 sm:-my-12">
      <HeroSection />
      <AdmissionInfoSection />
      <AdmissionStepsSection />
      <AvailableClassesSection classes={[]} isLoading={false} />
      <ContactHelpSection />
    </div>
  );
};
