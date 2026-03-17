import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import useScrollAnimation from '@/hooks/useScrollAnimation';

// Star rating component with partial fill support
const StarRating = ({
  rating,
  size = 16
}: {
  rating: number;
  size?: number;
}) => {
  const fullStars = Math.floor(rating);
  const partialFill = rating - fullStars;
  const emptyStars = 5 - Math.ceil(rating);
  return <div className="flex gap-1">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="fill-amber-400 text-amber-400" style={{
      width: size,
      height: size
    }} />)}
      
      {/* Partial star */}
      {partialFill > 0 && <div className="relative" style={{
      width: size,
      height: size
    }}>
          {/* Empty star background */}
          <Star className="absolute text-amber-400" style={{
        width: size,
        height: size
      }} />
          {/* Filled portion with clip */}
          <div className="absolute overflow-hidden" style={{
        width: `${partialFill * 100}%`,
        height: size
      }}>
            <Star className="fill-amber-400 text-amber-400" style={{
          width: size,
          height: size
        }} />
          </div>
        </div>}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="text-amber-400" style={{
      width: size,
      height: size
    }} />)}
    </div>;
};
const reviews = [{
  name: "Sneha Patel",
  service: "My Policy Purchase",
  rating: 5,
  comment: "Found my perfect health insurance through my PadosiAgent. They were professional and explained everything clearly to me.",
  image: "https://randomuser.me/api/portraits/women/32.jpg"
}, {
  name: "Rahul Verma",
  service: "My Claim Assistance",
  rating: 4.5,
  comment: "My claim was rejected initially, but my PadosiAgent helped me get it approved. Highly recommended for your claims!",
  image: "https://randomuser.me/api/portraits/men/45.jpg"
}, {
  name: "Anjali Desai",
  service: "My Policy Review",
  rating: 4,
  comment: "Got my policy reviewed and discovered I was overpaying. Saved ₹15,000 annually. Thank you, my PadosiAgent!",
  image: "https://randomuser.me/api/portraits/women/68.jpg"
}, {
  name: "Vikram Singh",
  service: "My Policy Purchase",
  rating: 5,
  comment: "Bought term insurance for my family. My PadosiAgent was patient and helped me understand all the terms.",
  image: "https://randomuser.me/api/portraits/men/22.jpg"
}, {
  name: "Priya Iyer",
  service: "My Claim Assistance",
  rating: 4.5,
  comment: "My medical claim process was smooth thanks to my PadosiAgent. They handled all my documentation.",
  image: "https://randomuser.me/api/portraits/women/54.jpg"
}, {
  name: "Amit Kapoor",
  service: "My Policy Review",
  rating: 4,
  comment: "Professional service. My PadosiAgent reviewed all my policies and suggested better coverage options for me.",
  image: "https://randomuser.me/api/portraits/men/67.jpg"
}, {
  name: "Neha Gupta",
  service: "My Policy Purchase",
  rating: 4.5,
  comment: "First time buying my insurance and my PadosiAgent made it so easy for me. No spam calls, just genuine help!",
  image: "https://randomuser.me/api/portraits/women/28.jpg"
}];
const CustomerReviews = () => {
  const row1 = reviews.slice(0, 4);
  const row2 = reviews.slice(3, 7);
  const {
    ref,
    isVisible
  } = useScrollAnimation({
    threshold: 0.1
  });
  return <section ref={ref as React.RefObject<HTMLElement>} className={`py-6 sm:py-8 md:py-12 lg:py-16 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-br from-primary-lighter/50 via-primary-lighter/30 to-white border-t border-primary/10 overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="container-content">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-secondary">What Users like you say about their PadosiAgent</h2>
          <p className="text-xs sm:text-sm md:text-base text-secondary/80 max-w-2xl mx-auto">Real experiences from users who found their PadosiAgent for policies, claims & reviews</p>
        </div>
        
        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {reviews.map((review, index) => <Card key={index} className={`hover:shadow-xl transition-all duration-500 border-primary/10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{
          transitionDelay: `${index * 100}ms`
        }}>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                  <img src={review.image} alt={review.name} className="w-10 h-10 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-secondary" />
                   <div>
                     <h4 className="text-sm lg:text-base font-bold text-secondary-dark">{review.name}</h4>
                     <p className="text-xs lg:text-sm text-secondary/70">{review.service}</p>
                   </div>
                </div>
                <div className="mb-2 lg:mb-3">
                  <StarRating rating={review.rating} size={14} />
                </div>
                 <p className="text-xs lg:text-sm text-secondary/80 italic">"{review.comment}"</p>
              </CardContent>
            </Card>)}
        </div>
        
        {/* Mobile 2-Row Infinite Scroll */}
        <div className="md:hidden space-y-3 sm:space-y-4">
          {/* Row 1 */}
          <div className="relative">
            <div className="flex animate-infinite-scroll gap-3 sm:gap-4 items-center">
              {[...row1, ...row1].map((review, index) => <Card key={index} className="w-[240px] sm:w-[280px] flex-shrink-0 border-secondary/10">
                  <CardContent className="p-3 sm:p-4 md:p-5 text-center">
                    <div className="flex flex-col items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <img src={review.image} alt={review.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-secondary" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-secondary-dark">{review.name}</h4>
                        <p className="text-[10px] sm:text-xs text-secondary/70">{review.service}</p>
                      </div>
                    </div>
                    <div className="flex justify-center mb-2 sm:mb-3">
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    <p className="text-[10px] sm:text-xs text-secondary/80 italic">"{review.comment}"</p>
                  </CardContent>
                </Card>)}
            </div>
          </div>
          
          {/* Row 2 */}
          <div className="relative">
            <div className="flex animate-infinite-scroll-reverse gap-3 sm:gap-4 items-center">
              {[...row2, ...row2].map((review, index) => <Card key={index} className="w-[240px] sm:w-[280px] flex-shrink-0 border-secondary/10">
                  <CardContent className="p-3 sm:p-4 md:p-5 text-center">
                    <div className="flex flex-col items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <img src={review.image} alt={review.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-secondary" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-secondary-dark">{review.name}</h4>
                        <p className="text-[10px] sm:text-xs text-secondary/70">{review.service}</p>
                      </div>
                    </div>
                    <div className="flex justify-center mb-2 sm:mb-3">
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    <p className="text-[10px] sm:text-xs text-secondary/80 italic">"{review.comment}"</p>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default CustomerReviews;