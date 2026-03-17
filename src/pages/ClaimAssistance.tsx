import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCheck, Heart, Car, Plane, Building2, Shield, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ClaimAssistance = () => {
  const navigate = useNavigate();

  const claimTypes = [
    {
      icon: <Heart className="h-12 w-12" />,
      title: 'My Health Insurance Claim',
      description: 'Get help with your hospitalization, medical bills, and health policy claims',
      type: 'health'
    },
    {
      icon: <Shield className="h-12 w-12" />,
      title: 'My Life Insurance Claim',
      description: 'Assistance with your life insurance and term policy claim processes',
      type: 'life'
    },
    {
      icon: <Car className="h-12 w-12" />,
      title: 'My Motor Insurance Claim',
      description: 'Quick resolution for your vehicle damage and accident claims',
      type: 'motor'
    },
    {
      icon: <Building2 className="h-12 w-12" />,
      title: 'My Fire & Property Claim',
      description: 'Support for your fire damage and property insurance claims',
      type: 'fire'
    },
    {
      icon: <Plane className="h-12 w-12" />,
      title: 'My Travel Insurance Claim',
      description: 'Help with your travel delays, cancellations, and medical emergencies abroad',
      type: 'travel'
    },
    {
      icon: <FileCheck className="h-12 w-12" />,
      title: 'My Other Claims',
      description: 'Assistance with all your other insurance claim types',
      type: 'other'
    }
  ];

  const claimSteps = [
    { step: 1, title: 'Select My Claim Type', description: 'Choose the type of insurance claim you need help with' },
    { step: 2, title: 'Find My PadosiAgent', description: 'Get matched with your verified PadosiAgent specializing in your claim type' },
    { step: 3, title: 'Submit My Documents', description: 'Your PadosiAgent will guide you on required documents and process' },
    { step: 4, title: 'Track My Progress', description: 'Monitor your claim status with regular updates from your PadosiAgent' }
  ];

  const handleFindAgents = (type: string) => {
    navigate(`/agents?service=claim&type=${type}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-secondary pt-24 sm:pt-28 md:pt-32 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">Get My Claim Assisted</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Expert help to navigate your insurance claims smoothly and get your faster settlements
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <CheckCircle className="inline-block h-5 w-5 mr-2" />
              <span className="font-semibold">Fast Processing for You</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <CheckCircle className="inline-block h-5 w-5 mr-2" />
              <span className="font-semibold">Your Expert Guidance</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <CheckCircle className="inline-block h-5 w-5 mr-2" />
              <span className="font-semibold">Higher Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Types */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Select Your Claim Type</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {claimTypes.map((claim, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 hover:border-primary"
                onClick={() => handleFindAgents(claim.type)}
              >
                <CardContent className="p-0 text-center">
                  <div className="mb-4 text-primary group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    {claim.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{claim.title}</h3>
                  <p className="text-muted-foreground mb-4">{claim.description}</p>
                  <Button className="w-full group-hover:bg-primary/90">
                    Find My Claim PadosiAgent
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How My Claim Assistance Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {claimSteps.map((step) => (
              <div key={step.step} className="relative">
                <div className="text-center">
                  <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
                {step.step < 4 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary/30"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-blue-600 to-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Need Immediate Help with Your Claim?</h2>
          <p className="text-xl mb-8 opacity-90">
            Connect with your PadosiAgent who will guide you through every step of your claim process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg px-8"
              onClick={() => navigate('/agents?service=claim')}
            >
              Find My Claim PadosiAgent Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8"
              onClick={() => navigate('/contact')}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ClaimAssistance;