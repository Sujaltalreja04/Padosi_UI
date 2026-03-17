import React from 'react';
import { Search, GitCompare, MessageSquare, HandHeart, ArrowRight, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InfoTooltip from '@/components/InfoTooltip';
import useScrollAnimation from '@/hooks/useScrollAnimation';
import { useAgentSearchNavigation } from '@/contexts/AgentSearchContext';

const steps = [
  {
    icon: Search,
    title: "Search",
    description: "By service & location",
    definition: "Pick your service and find agents nearby.",
    iconColor: "text-secondary",
    bgColor: "bg-secondary/10"
  },
  {
    icon: GitCompare,
    title: "Compare",
    description: "Check ratings & reviews",
    definition: "Check ratings, reviews & experience.",
    iconColor: "text-secondary",
    bgColor: "bg-secondary/10"
  },
  {
    icon: MessageSquare,
    title: "Connect & Meet",
    description: "Call or WhatsApp",
    definition: "Call or WhatsApp directly. No middlemen.",
    iconColor: "text-secondary",
    bgColor: "bg-secondary/10"
  },
  {
    icon: HandHeart,
    title: "Get Assisted",
    description: "Personal guidance",
    definition: "Personal help from selection to settlement.",
    iconColor: "text-secondary",
    bgColor: "bg-secondary/10"
  }
];

const HowItWorks = () => {
  const { navigateWithLoader } = useAgentSearchNavigation();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const handleGetStarted = () => {
    navigateWithLoader('/agents?openFilter=true');
  };

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-4 sm:py-6 md:py-10 lg:py-12 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-br from-primary-lighter/50 via-primary-lighter/30 to-white border-t border-primary/10 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="container-content">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-secondary">Find My PadosiAgent in 4 Simple Steps</h2>
          <p className="text-xs sm:text-sm md:text-base text-secondary/80">From search to service — it takes just minutes for you</p>
        </div>
        
        {/* Simple Horizontal Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 md:gap-6 max-w-xs sm:max-w-xl mx-auto mb-4 sm:mb-6 px-6 sm:px-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <InfoTooltip key={index} content={step.definition}>
                <div 
                  className={`flex flex-col items-center text-center relative cursor-pointer group transition-all duration-500 p-3 sm:p-0 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Step number badge */}
                  <div className="relative mb-2 sm:mb-2 md:mb-3">
                    <div className={`${step.bgColor} p-4 sm:p-3 md:p-4 rounded-full transition-all duration-300 group-hover:scale-110`}>
                      <Icon className={`h-8 w-8 sm:h-6 sm:w-6 md:h-8 md:w-8 ${step.iconColor}`} strokeWidth={2} />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-4 sm:h-4 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-[8px] font-bold flex items-center justify-center shadow-sm">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-xs md:text-sm text-secondary group-hover:text-secondary-dark mb-0.5">{step.title}</h3>
                  <p className="text-[10px] sm:text-[10px] md:text-xs text-secondary/70">{step.description}</p>
                  
                  {/* Arrow connector - desktop only */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 -right-2 text-secondary/40">
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 8H15M15 8L10 3M15 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              </InfoTooltip>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button 
            onClick={handleGetStarted}
            className="bg-secondary hover:bg-accent active:bg-accent text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 h-auto text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cta-glow animate-pulse-glow group"
          >
            Find My PadosiAgent
            <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
