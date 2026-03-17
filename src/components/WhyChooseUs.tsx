import React from 'react';
import { ShieldCheck, IndianRupee, LockKeyhole, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InfoTooltip from '@/components/InfoTooltip';
import useScrollAnimation from '@/hooks/useScrollAnimation';
import { useAgentSearchNavigation } from '@/contexts/AgentSearchContext';

const features = [{
  title: "No Spam",
  icon: ShieldCheck,
  description: "Your privacy protected",
  definition: "Only you can contact agents. They can't call you first.",
  iconColor: "text-secondary",
  bgColor: "bg-secondary/10"
}, {
  title: "100% Free",
  icon: IndianRupee,
  description: "No charges for you",
  definition: "Completely free. No hidden fees or charges.",
  iconColor: "text-secondary",
  bgColor: "bg-secondary/10"
}, {
  title: "Data Safe",
  icon: LockKeyhole,
  description: "Encrypted & secure",
  definition: "Your data is encrypted and never sold.",
  iconColor: "text-secondary",
  bgColor: "bg-secondary/10"
}, {
  title: "Nearby Verified Agents",
  icon: MapPin,
  description: "In your neighbourhood",
  definition: "Verified agents nearby who know your area.",
  iconColor: "text-secondary",
  bgColor: "bg-secondary/10"
}];

const WhyChooseUs = () => {
  const { navigateWithLoader } = useAgentSearchNavigation();
  const {
    ref,
    isVisible
  } = useScrollAnimation({
    threshold: 0.1
  });

  const handleFindAgent = () => {
    navigateWithLoader('/agents?openFilter=true');
  };

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`py-4 sm:py-6 md:py-10 lg:py-12 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-br from-primary-lighter/50 via-primary-lighter/30 to-white border-t border-primary/10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="container-content">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-secondary-dark">Why Users Trust their PadosiAgent</h2>
          <p className="text-xs sm:text-sm md:text-base text-secondary/80">The safest way to find your insurance PadosiAgent: No Spam, No Fees, just trusted service for you</p>
        </div>
        
        {/* Simple Icon Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 md:gap-6 max-w-xs sm:max-w-xl mx-auto mb-4 sm:mb-6 px-6 sm:px-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <InfoTooltip key={index} content={feature.definition}>
                <div className={`flex flex-col items-center gap-2 sm:gap-2 p-3 sm:p-3 md:p-4 rounded-xl sm:rounded-xl cursor-pointer transition-all duration-500 group hover:bg-secondary/5 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{
                  transitionDelay: `${index * 100}ms`
                }}>
                  <div className={`${feature.bgColor} p-4 sm:p-3 md:p-4 rounded-full transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-8 w-8 sm:h-6 sm:w-6 md:h-8 md:w-8 ${feature.iconColor}`} strokeWidth={2} />
                  </div>
                  <h3 className="text-xs sm:text-xs md:text-sm font-bold text-center text-secondary group-hover:text-secondary-dark">{feature.title}</h3>
                  <p className="text-[10px] sm:text-[10px] md:text-xs text-center text-secondary/70">{feature.description}</p>
                </div>
              </InfoTooltip>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button onClick={handleFindAgent} className="bg-secondary hover:bg-accent active:bg-accent text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 h-auto text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cta-glow animate-pulse-glow group">
            Find My PadosiAgent Now
            <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
