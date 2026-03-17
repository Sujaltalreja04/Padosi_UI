import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Car, Building2, UserCheck, AlertTriangle, HeartPulse, TrendingUp, Clock, PiggyBank, Landmark, BarChart3, Truck, Bike, CarFront, Flame, Ship, HardHat, Users, FileText, Scale, Lock, MoreHorizontal, X, LucideIcon } from 'lucide-react';

interface SubOption {
  title: string;
  icon: LucideIcon;
  link: string;
}

interface PolicyCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
  bgColor: string;
  hoverBg: string;
  subOptions: SubOption[];
}

const policyCategories: PolicyCategory[] = [
  {
    id: 'health',
    title: 'Health Insurance',
    icon: Heart,
    color: 'text-secondary',
    iconColor: 'text-secondary',
    bgColor: 'bg-secondary-lighter',
    hoverBg: 'hover:bg-primary/10',
    subOptions: [
      { title: 'Mediclaim', icon: HeartPulse, link: '/agents?service=new-policy&type=health&sub=mediclaim' },
      { title: 'Personal Accident', icon: UserCheck, link: '/agents?service=new-policy&type=health&sub=personal-accident' },
      { title: 'Critical Illness', icon: AlertTriangle, link: '/agents?service=new-policy&type=health&sub=critical-illness' },
      { title: 'Super Top-up', icon: TrendingUp, link: '/agents?service=new-policy&type=health&sub=super-topup' },
      { title: 'Others', icon: MoreHorizontal, link: '/agents?service=new-policy&type=health&sub=others' },
    ],
  },
  {
    id: 'life',
    title: 'Life Insurance',
    icon: Shield,
    color: 'text-secondary',
    iconColor: 'text-secondary',
    bgColor: 'bg-secondary-lighter',
    hoverBg: 'hover:bg-primary/10',
    subOptions: [
      { title: 'Term Plan', icon: Clock, link: '/agents?service=new-policy&type=life&sub=term' },
      { title: 'Pension Plan', icon: Landmark, link: '/agents?service=new-policy&type=life&sub=pension' },
      { title: 'Guaranteed Plan', icon: Shield, link: '/agents?service=new-policy&type=life&sub=guaranteed' },
      { title: 'Saving Plan', icon: PiggyBank, link: '/agents?service=new-policy&type=life&sub=saving' },
      { title: 'ULIP Plan', icon: BarChart3, link: '/agents?service=new-policy&type=life&sub=ulip' },
      { title: 'Others', icon: MoreHorizontal, link: '/agents?service=new-policy&type=life&sub=others' },
    ],
  },
  {
    id: 'motor',
    title: 'Motor Insurance',
    icon: Car,
    color: 'text-secondary',
    iconColor: 'text-secondary',
    bgColor: 'bg-secondary-lighter',
    hoverBg: 'hover:bg-primary/10',
    subOptions: [
      { title: 'Private Car', icon: CarFront, link: '/agents?service=new-policy&type=motor&sub=private-car' },
      { title: 'Two Wheeler', icon: Bike, link: '/agents?service=new-policy&type=motor&sub=two-wheeler' },
      { title: 'Commercial Vehicle', icon: Truck, link: '/agents?service=new-policy&type=motor&sub=commercial' },
      { title: '3 Wheeler', icon: Car, link: '/agents?service=new-policy&type=motor&sub=three-wheeler' },
      { title: 'Others', icon: MoreHorizontal, link: '/agents?service=new-policy&type=motor&sub=others' },
    ],
  },
  {
    id: 'sme',
    title: 'SME Insurance',
    icon: Building2,
    color: 'text-secondary',
    iconColor: 'text-secondary',
    bgColor: 'bg-secondary-lighter',
    hoverBg: 'hover:bg-primary/10',
    subOptions: [
      { title: 'Fire', icon: Flame, link: '/agents?service=new-policy&type=sme&sub=fire' },
      { title: 'Marine/Transport', icon: Ship, link: '/agents?service=new-policy&type=sme&sub=marine' },
      { title: 'Workmen Comp', icon: HardHat, link: '/agents?service=new-policy&type=sme&sub=workmen' },
      { title: 'GPA/GMC', icon: Users, link: '/agents?service=new-policy&type=sme&sub=gpa-gmc' },
      { title: 'Group Term', icon: FileText, link: '/agents?service=new-policy&type=sme&sub=group-term' },
      { title: 'Liability', icon: Scale, link: '/agents?service=new-policy&type=sme&sub=liability' },
      { title: 'Cyber', icon: Lock, link: '/agents?service=new-policy&type=sme&sub=cyber' },
      { title: 'Others', icon: MoreHorizontal, link: '/agents?service=new-policy&type=sme&sub=others' },
    ],
  },
];

// Hook for scroll-triggered icon animations
const useScrollIconAnimation = (itemCount: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(itemCount).fill(false));
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          // Stagger the animations
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems(prev => {
                const updated = [...prev];
                updated[i] = true;
                return updated;
              });
            }, i * 120);
          }
          setHasAnimated(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [itemCount, hasAnimated]);

  return { ref, visibleItems };
};

const PolicyIconGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const subOptionsRef = React.useRef<HTMLDivElement>(null);
  const { ref: gridRef, visibleItems } = useScrollIconAnimation(policyCategories.length);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-highlight effect on mobile every 3 seconds
  useEffect(() => {
    if (!isMobile || activeCategory) return;
    
    const interval = setInterval(() => {
      setHighlightedIndex(prev => {
        if (prev === null || prev >= policyCategories.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isMobile, activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    const newActive = activeCategory === categoryId ? null : categoryId;
    setActiveCategory(newActive);
    setHighlightedIndex(null); // Stop auto-highlight when user interacts
    
    // Auto-scroll to sub-options after a short delay for animation
    if (newActive) {
      setTimeout(() => {
        subOptionsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  };

  const handleClose = () => {
    setActiveCategory(null);
  };

  return (
    <div className="relative py-1 sm:py-2">
      {/* Main Category Grid with staggered animations */}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 md:gap-6 max-w-xs sm:max-w-xl mx-auto px-6 sm:px-6">
        {policyCategories.map((category, index) => {
          const isActive = activeCategory === category.id;
          const isHighlighted = isMobile && highlightedIndex === index && !activeCategory;
          const Icon = category.icon;
          
            return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`relative flex flex-col items-center justify-center gap-1 sm:gap-1.5 md:gap-2 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl transition-all duration-500 ease-out cursor-pointer tap-feedback cta-glow group aspect-square ${
                isActive 
                  ? `bg-muted/50 shadow-lg scale-[1.03] ring-1 ring-primary/30` 
                  : isHighlighted
                    ? `bg-primary/10 shadow-md scale-[1.03]`
                    : `bg-transparent ${category.hoverBg} hover:shadow-md hover:scale-[1.03]`
              } ${visibleItems[index] ? 'animate-bounce-in' : 'opacity-0 scale-75'}`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className={`${category.bgColor} p-4 sm:p-3 md:p-4 rounded-full transition-all duration-500 ease-out agent-link-icon ${
                isActive 
                  ? 'scale-105 animate-wiggle bg-primary-lighter' 
                  : isHighlighted
                    ? 'scale-105 animate-wiggle bg-primary-lighter'
                    : 'group-hover:scale-105 group-hover:bg-primary-lighter'
              }`}>
                <Icon className={`h-8 w-8 sm:h-6 sm:w-6 md:h-8 md:w-8 transition-all duration-500 ease-out ${
                  isActive || isHighlighted ? 'text-primary' : `${category.iconColor} group-hover:text-primary`
                }`} strokeWidth={2} />
              </div>
              
              <span className={`text-xs sm:text-xs md:text-sm font-semibold text-center leading-tight transition-all duration-500 ease-out ${
                isActive || isHighlighted ? 'text-primary' : `${category.color} group-hover:text-primary`
              }`}>
                {category.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-options Panel - Expands Below with Staggered Animation */}
      {activeCategory && (
        <div ref={subOptionsRef} className="mt-4 sm:mt-6 px-2 sm:px-4">
          {policyCategories
            .filter((cat) => cat.id === activeCategory)
            .map((category) => (
              <div 
                key={category.id}
                className="relative max-w-3xl mx-auto rounded-xl sm:rounded-2xl bg-card/80 backdrop-blur-sm p-3 sm:p-4 md:p-6 shadow-lg border border-border/50 animate-scale-in"
              >
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 sm:p-1.5 rounded-full bg-muted hover:bg-muted-foreground/20 transition-all duration-200 hover:scale-110 hover:rotate-90 tap-feedback"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                </button>

                <h3 className={`text-xs sm:text-sm md:text-base font-semibold ${category.color} mb-3 sm:mb-4 text-center animate-fade-in`}>
                  Select {category.title} Type
                </h3>

                {/* Sub-options Grid with Staggered Animation */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
                  {category.subOptions.map((subOption, index) => {
                    const SubIcon = subOption.icon;
                    return (
                      <Link
                        key={subOption.title}
                        to={subOption.link}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group opacity-0 animate-[bounce-in_0.5s_cubic-bezier(0.22,1,0.36,1)_forwards]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className={`flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg hover:bg-primary/10 hover:shadow-md transition-all duration-500 ease-out cursor-pointer hover:-translate-y-0.5 tap-feedback cta-glow`}>
                          <div className={`${category.bgColor} p-1.5 sm:p-2 rounded-full group-hover:scale-105 transition-all duration-500 ease-out agent-link-icon group-hover:bg-primary-lighter`}>
                            <SubIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-all duration-500 ease-out ${category.iconColor} group-hover:text-primary`} strokeWidth={2} />
                          </div>
                          <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-center leading-tight transition-all duration-500 ease-out text-secondary group-hover:text-primary">
                            {subOption.title}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default PolicyIconGrid;