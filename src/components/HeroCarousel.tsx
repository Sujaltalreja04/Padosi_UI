import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, TrendingUp } from "lucide-react";
import { useAgentSearchNavigation } from "@/contexts/AgentSearchContext";
import heroNewPolicyDoodle from "@/assets/hero-new-policy-doodle.png";
import heroClaimAssistanceDoodle from "@/assets/hero-claim-assistance-doodle.png";
import heroPolicyReviewDoodle from "@/assets/hero-policy-review-doodle.png";

const ctaCards = [
  {
    title: "Buy/Port/Renew Insurance",
    subtitle: "Connect with your local PadosiAgent",
    image: heroNewPolicyDoodle,
    cta: "Find My PadosiAgent",
    ctaLink: "/agents?service=new-policy",
    accentColor: "bg-secondary hover:bg-primary",
    textColor: "text-secondary",
    subtitleColor: "text-secondary/70",
    bgGradient: "from-secondary/15 via-secondary/5 to-secondary-light/10",
    dotColor: "bg-secondary",
  },
  {
    title: "Get My Claim Assisted",
    subtitle: "Struggling with your claim?",
    image: heroClaimAssistanceDoodle,
    cta: "Find Claims Expert",
    ctaLink: "/agents?service=claim",
    accentColor: "bg-claim hover:bg-primary",
    textColor: "text-claim",
    subtitleColor: "text-claim/70",
    bgGradient: "from-claim/15 via-claim/5 to-claim-light/10",
    dotColor: "bg-claim",
  },
  {
    title: "Review My Policy",
    subtitle: "Unsure if you're covered?",
    image: heroPolicyReviewDoodle,
    cta: "Find Insurance Expert",
    ctaLink: "/agents?service=policy-review",
    accentColor: "bg-review hover:bg-primary",
    textColor: "text-review",
    subtitleColor: "text-review/70",
    bgGradient: "from-review/15 via-review/5 to-review-light/10",
    dotColor: "bg-review",
  },
];

const HeroCarousel = () => {
  const { navigateWithLoader } = useAgentSearchNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const extendedCards = [ctaCards[ctaCards.length - 1], ...ctaCards, ctaCards[0]];
  const totalSlides = ctaCards.length;

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev + 1);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev - 1);
  }, [isTransitioning]);

  useEffect(() => {
    if (!isTransitioning) return;
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      if (currentSlide >= totalSlides) setCurrentSlide(0);
      if (currentSlide < 0) setCurrentSlide(totalSlides - 1);
    }, 700);
    return () => clearTimeout(timer);
  }, [currentSlide, isTransitioning, totalSlides]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      setIsAutoPlaying(false);
      diff > 0 ? nextSlide() : prevSlide();
      setTimeout(() => setIsAutoPlaying(true), 5000);
    }
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const getTransformOffset = () => (currentSlide + 1) * (100 / extendedCards.length);

  // Determine the "real" active index for dots
  const activeIndex = ((currentSlide % totalSlides) + totalSlides) % totalSlides;

  return (
    <div
      className="relative w-full h-[100vh] overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Sliding backgrounds */}
      <div
        className={`absolute inset-0 flex ${isTransitioning ? "transition-transform duration-700 ease-out" : ""}`}
        style={{
          width: `${extendedCards.length * 100}%`,
          transform: `translateX(-${getTransformOffset()}%)`
        }}
      >
        {extendedCards.map((card, index) => (
          <div
            key={index}
            className={`h-full bg-gradient-to-br ${card.bgGradient}`}
            style={{ width: `${100 / extendedCards.length}%` }}
          />
        ))}
      </div>

      {/* Content Container */}
      <div className="relative z-10 pt-20 sm:pt-24 md:pt-28 px-4 sm:px-6 md:px-8 h-full flex flex-col pb-4">
        <div className="container-content flex-1 flex flex-col max-w-7xl mx-auto w-full">
          {/* Static Tagline */}
          <h1 className="text-center text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6 leading-tight px-2">
            Find your <span className="text-secondary">Trusted & Verified</span> Insurance Experts in your{" "}
            <span className="text-accent">Padosi</span>
          </h1>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 px-2">
            {[
              { icon: CheckCircle, label: 'IRDAI Verified', tooltip: 'Verified by IRDAI (Insurance Regulatory and Development Authority of India)' },
              { icon: Shield, label: 'No Spam Calls' },
              { icon: TrendingUp, label: '100% Free' },
            ].map((badge, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-1 sm:gap-1.5 bg-secondary/10 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full border border-secondary/30"
                title={badge.tooltip}
              >
                <badge.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-secondary flex-shrink-0" />
                <span className="font-medium text-[10px] sm:text-xs md:text-sm text-secondary-dark">{badge.label}</span>
              </div>
            ))}
          </div>

          {/* Sliding Content */}
          <div
            className="flex-1 relative overflow-hidden touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`flex h-full ${isTransitioning ? "transition-transform duration-700 ease-out" : ""}`}
              style={{
                width: `${extendedCards.length * 100}%`,
                transform: `translateX(-${getTransformOffset()}%)`
              }}
            >
              {extendedCards.map((slideCard, index) => (
                <div
                  key={index}
                  className="h-full flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 px-4 sm:px-8 md:px-12 lg:px-16 py-4 cursor-pointer group"
                  style={{ width: `${100 / extendedCards.length}%` }}
                  onClick={() => navigateWithLoader(slideCard.ctaLink)}
                >
                  {/* Doodle Image */}
                  <div className="flex-shrink-0 relative order-1 md:order-2 perspective-1000">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 xl:w-80 xl:h-80 sticker-3d preserve-3d">
                      <img
                        src={slideCard.image}
                        alt={slideCard.title}
                        className="relative w-full h-full animate-[float_3s_ease-in-out_infinite] drop-shadow-lg rounded-3xl object-contain mix-blend-multiply"
                      />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-xl order-2 md:order-1">
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold ${slideCard.textColor} mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-tight`}>
                      {slideCard.title}
                    </h2>
                    <p className={`text-sm sm:text-base md:text-lg lg:text-xl ${slideCard.subtitleColor} mb-4 sm:mb-5 md:mb-6 leading-relaxed max-w-sm md:max-w-md`}>
                      {slideCard.subtitle}
                    </p>
                    <Button
                      className={`${slideCard.accentColor} text-white font-bold text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-5 px-6 sm:px-8 md:px-10 h-auto shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 rounded-xl cta-glow cta-ripple tap-feedback agent-link-hover animate-pulse-glow`}
                      size="lg"
                    >
                      {slideCard.cta}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators (Dots) */}
          <div className="flex justify-center gap-2 sm:gap-2.5 py-3 sm:py-4">
            {ctaCards.map((card, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? `w-7 sm:w-8 h-2.5 sm:h-3 ${card.dotColor} shadow-sm`
                    : 'w-2.5 sm:w-3 h-2.5 sm:h-3 bg-foreground/20 hover:bg-foreground/40'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
