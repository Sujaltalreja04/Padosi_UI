import React, { useEffect, useRef, useState } from 'react';
import { Shield, Heart, Car, TrendingUp, Search, Building2, LucideIcon, ShieldCheck, PieChart, ClipboardCheck, Lightbulb } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import HeroCarousel from '@/components/HeroCarousel';
import AnimatedSection from '@/components/AnimatedSection';
import AnimatedCTAButton from '@/components/AnimatedCTAButton';
import WhyChooseUs from '@/components/WhyChooseUs';
import HowItWorks from '@/components/HowItWorks';
import CustomerReviews from '@/components/CustomerReviews';

import PolicyIconGrid from '@/components/PolicyIconGrid';
import AgentLink from '@/components/AgentLink';

// Hook for scroll-triggered icon animations
const useScrollIconAnimation = (itemCount: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(itemCount).fill(false));
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        // Stagger the animations
        itemCount > 0 && setVisibleItems(prev => {
          const newState = [...prev];
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems(prevInner => {
                const updated = [...prevInner];
                updated[i] = true;
                return updated;
              });
            }, i * 100);
          }
          return newState;
        });
        setHasAnimated(true);
        observer.unobserve(element);
      }
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -30px 0px'
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [itemCount, hasAnimated]);
  return {
    ref,
    visibleItems
  };
};

// Claim Services Section with animated icons
interface ServiceItem {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}
const ClaimServicesSection: React.FC<{
  claimServices: ServiceItem[];
}> = ({
  claimServices
}) => {
  const {
    ref,
    visibleItems
  } = useScrollIconAnimation(claimServices.length);
  
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-highlight effect on mobile every 3 seconds
  useEffect(() => {
    if (!isMobile || userInteracted) return;
    
    const interval = setInterval(() => {
      setHighlightedIndex(prev => {
        if (prev === null || prev >= claimServices.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isMobile, userInteracted, claimServices.length]);

  const handleClick = () => {
    setUserInteracted(true);
    setHighlightedIndex(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <section className="py-4 sm:py-6 md:py-10 lg:py-12 bg-gradient-to-b from-claim-lighter/30 via-claim-lighter/40 to-claim-lighter/20 border-t border-claim/10">
      <div className="container-content">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-3 sm:mb-4 md:mb-6 px-2">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-claim-dark mb-1 sm:mb-2">
                Stuck with your Claim? Get assisted with PadosiAgent Claim Experts
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-claim/80">Select your insurance type below to find your claim assistance PadosiAgent</p>
            </div>
          </AnimatedSection>
        
        {/* Icon Grid - 4 columns aligned with Section 2 */}
        <div ref={ref} className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 md:gap-6 max-w-xs sm:max-w-xl mx-auto mb-3 sm:mb-4 px-6 sm:px-6">
          {claimServices.map((service, index) => {
          const Icon = service.icon;
          const isHighlighted = isMobile && highlightedIndex === index && !userInteracted;
          return <AgentLink key={index} to={`/agents?service=claim&type=${service.title.toLowerCase().replace(' insurance', '')}&openFilter=true`} onClick={handleClick}>
                <div className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 md:gap-2 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 group cursor-pointer tap-feedback cta-glow aspect-square ${
                  isHighlighted 
                    ? 'bg-primary/10 shadow-lg scale-105' 
                    : 'hover:bg-primary/10 hover:shadow-lg hover:scale-105'
                } ${visibleItems[index] ? 'animate-bounce-in' : 'opacity-0 scale-50'}`} style={{
              animationDelay: `${index * 80}ms`
            }}>
                  <div className={`${service.bgColor} p-4 sm:p-3 md:p-4 rounded-full transition-all duration-300 agent-link-icon ${
                    isHighlighted 
                      ? 'scale-110 animate-wiggle bg-primary-lighter' 
                      : 'group-hover:scale-115 group-hover:animate-wiggle group-hover:bg-primary-lighter'
                  }`}>
                    <Icon className={`h-8 w-8 sm:h-6 sm:w-6 md:h-8 md:w-8 transition-colors duration-300 ${
                      isHighlighted ? 'text-primary' : `${service.iconColor} group-hover:text-primary`
                    }`} strokeWidth={2} />
                  </div>
                  <span className={`text-xs sm:text-xs md:text-sm font-semibold text-center leading-tight transition-colors duration-300 ${
                    isHighlighted ? 'text-primary' : 'text-claim group-hover:text-primary'
                  }`}>{service.title}</span>
                </div>
              </AgentLink>;
        })}
        </div>
      </div>
    </section>;
};

// Policy Review Section with animated icons
const PolicyReviewSection: React.FC<{
  policyReviewItems: ServiceItem[];
}> = ({
  policyReviewItems
}) => {
  const {
    ref,
    visibleItems
  } = useScrollIconAnimation(policyReviewItems.length);
  return <section className="py-4 sm:py-6 md:py-10 lg:py-12 bg-gradient-to-br from-review-lighter via-review-lighter/80 to-review-lighter/60 border-t border-review/10">
      <div className="container-content">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-3 sm:mb-4 md:mb-6 px-2">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-review-dark mb-1 sm:mb-2">
                Do you have multiple Insurance Policies? Get your Portfolio Audited by Expert PadosiAgents
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-review/80">PadosiAgent will analyse and identify gaps in your coverage</p>
            </div>
          </AnimatedSection>
        
        {/* Icon Grid - 4 columns aligned with Section 2 and Claims */}
        <div ref={ref} className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 md:gap-6 max-w-xs sm:max-w-xl mx-auto mb-3 sm:mb-4 px-6 sm:px-6">
          {policyReviewItems.map((item, index) => {
          const Icon = item.icon;
          return <AgentLink key={index} to="/agents?service=policy-review&openFilter=true">
                <div className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 md:gap-2 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 group cursor-pointer hover:bg-primary/10 hover:shadow-lg hover:scale-105 tap-feedback cta-glow aspect-square ${visibleItems[index] ? 'animate-bounce-in' : 'opacity-0 scale-50'}`} style={{
              animationDelay: `${index * 100}ms`
            }}>
                  <div className={`${item.bgColor} p-4 sm:p-3 md:p-4 rounded-full transition-all duration-300 group-hover:scale-115 group-hover:animate-wiggle agent-link-icon group-hover:bg-primary-lighter`}>
                    <Icon className={`h-8 w-8 sm:h-6 sm:w-6 md:h-8 md:w-8 transition-colors duration-300 ${item.iconColor} group-hover:text-primary`} strokeWidth={2} />
                  </div>
                  <span className="text-xs sm:text-xs md:text-sm font-semibold text-center leading-tight transition-colors duration-300 text-review group-hover:text-primary">{item.title}</span>
                </div>
              </AgentLink>;
        })}
        </div>
        
        <AnimatedSection animation="fade-up" delay={300}>
          <div className="text-center">
              <AnimatedCTAButton variant="review" icon={TrendingUp} href="/agents?service=policy-review&openFilter=true">
                Find Insurance Expert
              </AnimatedCTAButton>
          </div>
        </AnimatedSection>
      </div>
    </section>;
};
const Index = () => {
  const {
    user
  } = useAuth();
  const claimServices: ServiceItem[] = [{
    title: 'Health Insurance',
    icon: Heart,
    iconColor: 'text-claim',
    bgColor: 'bg-claim-lighter'
  }, {
    title: 'Life Insurance',
    icon: Shield,
    iconColor: 'text-claim',
    bgColor: 'bg-claim-lighter'
  }, {
    title: 'Motor Insurance',
    icon: Car,
    iconColor: 'text-claim',
    bgColor: 'bg-claim-lighter'
  }, {
    title: 'SME Insurance',
    icon: Building2,
    iconColor: 'text-claim',
    bgColor: 'bg-claim-lighter'
  }];
  const policyReviewItems: ServiceItem[] = [{
    title: 'Risk Analysis',
    icon: ShieldCheck,
    iconColor: 'text-review',
    bgColor: 'bg-review-lighter'
  }, {
    title: 'Portfolio Analysis',
    icon: PieChart,
    iconColor: 'text-review',
    bgColor: 'bg-review-lighter'
  }, {
    title: 'Premium Audit',
    icon: ClipboardCheck,
    iconColor: 'text-review',
    bgColor: 'bg-review-lighter'
  }, {
    title: 'Expert Advise',
    icon: Lightbulb,
    iconColor: 'text-review',
    bgColor: 'bg-review-lighter'
  }];
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section - Full Width Carousel with seamless background */}
      <HeroCarousel />
      
      {/* Insurance Types Section - New Policies */}
      <section className="py-4 sm:py-6 md:py-10 lg:py-12 bg-gradient-to-b from-secondary-lighter/40 via-secondary-lighter/20 to-background border-t border-secondary/10">
        <div className="container-content">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-3 sm:mb-4 md:mb-6 px-2">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-secondary-dark mb-1 sm:mb-2">
                Buy/Port/Renew Insurance with PadosiAgent
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-secondary/80">Click on the Icon to search for PadosiAgent</p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up" delay={150}>
            <PolicyIconGrid />
          </AnimatedSection>
        </div>
      </section>
      
      {/* Claim Services */}
      <ClaimServicesSection claimServices={claimServices} />
      
      {/* Policy Review Section - Purple Theme */}
      <PolicyReviewSection policyReviewItems={policyReviewItems} />
      
      <WhyChooseUs />
      <HowItWorks />
      <CustomerReviews />
      
      <Footer />
    </div>;
};
export default Index;