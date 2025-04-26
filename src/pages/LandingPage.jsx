import Header from "../components/landing-page/Header";
import HeroSection from "../components/landing-page/HeroSection";
import FeaturesSection from "../components/landing-page/FeaturesSection";
import HowItWorksSection from "../components/landing-page/HowItWorksSection";
import FAQSection from "../components/landing-page/FAQSection";
import Footer from "../components/landing-page/Footer";

export default function LandingPage() {
    return (
      <div className="min-h-screen bg-emerald-900 text-white">
        {/* Header */}
        <Header />
        
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* How It Works */}
        <HowItWorksSection />
        
        {/* FAQ Section */}
        <FAQSection />
        
        {/* Footer */}
        <Footer />
      </div>
    );
}