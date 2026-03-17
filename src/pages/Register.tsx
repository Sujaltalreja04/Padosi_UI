import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/components/ui/sonner";
import { Progress } from '@/components/ui/progress';
import PlanSelector from '@/components/PlanSelector';
import { supabase } from '@/integrations/supabase/client';
import DummyPaymentDialog from '@/components/DummyPaymentDialog';
import Navbar from '@/components/Navbar';

import { ArrowLeft, ArrowRight, CheckCircle2, User, CreditCard, Shield, Tag, CheckCircle } from 'lucide-react';
import logo from '@/assets/padosi-agent-logo-new.png';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelectDropdown from '@/components/agent-profile/MultiSelectDropdown';

type RegisterTab = 'user' | 'agent' | 'distributor';
type AgentStep = 'details' | 'plan' | 'payment';

const Register = () => {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [userType, setUserType] = useState<RegisterTab>('user');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional'>('professional');
  const [agentStep, setAgentStep] = useState<AgentStep>('details');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [insuranceCompanies, setInsuranceCompanies] = useState<string[]>([]);
  
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const hasValidPromoCode = isPromoApplied;

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    setIsValidatingPromo(true);
    setPromoError('');
    try {
      const { data, error } = await supabase.functions.invoke('validate-promo-code', {
        body: { code: promoCode },
      });
      if (error) throw error;
      if (data?.valid) {
        setIsPromoApplied(true);
        setPromoError('');
        toast.success('Promo code applied! You now have access to special pricing.');
      } else {
        setIsPromoApplied(false);
        setPromoError('Invalid promo code. Please try again.');
        toast.error('Invalid promo code');
      }
    } catch (err: any) {
      setPromoError('Failed to validate promo code. Please try again.');
      toast.error('Failed to validate promo code');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode('');
    setIsPromoApplied(false);
    setPromoError('');
  };
  const { register } = useAuth();
  const navigate = useNavigate();

  // Set initial user type from URL params
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'agent' || typeParam === 'distributor' || typeParam === 'user') {
      setUserType(typeParam);
    }
  }, [searchParams]);

  // Reset agent step when switching user types
  useEffect(() => {
    if (userType !== 'agent') {
      setAgentStep('details');
    }
  }, [userType]);

  const hasBasicDetails = 
    name.trim() !== '' && 
    email.trim() !== '' && 
    phone.trim() !== '' &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '';

  const canProceedToPayment = hasBasicDetails && agreeTerms && password === confirmPassword && password.length >= 6;

  const getAgentStepProgress = () => {
    switch (agentStep) {
      case 'details': return 33;
      case 'plan': return 66;
      case 'payment': return 100;
      default: return 0;
    }
  };

  const handleAgentDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (!agreeTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }

    // Move to plan selection
    setAgentStep('plan');
  };

  const handlePlanContinue = () => {
    // For starter plan - offer free trial option
    if (selectedPlan === 'starter') {
      setShowPaymentDialog(true);
    } else {
      // Professional plan - show payment
      setShowPaymentDialog(true);
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentDialog(false);
    setIsSubmitting(true);
    
    try {
      await register({
        name,
        email,
        phone,
        password,
        role: 'agent',
        subscription_plan: selectedPlan,
      });
      
      toast.success('Registration successful! Let\'s set up your profile.');
      navigate('/agent-profile-setup');
    } catch (error) {
      console.error('Registration error', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegularSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (!agreeTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        role: userType,
        company_name: userType === 'distributor' ? companyName : undefined,
      });
      
      // Navigate based on user type after successful registration
      switch (userType) {
        case 'distributor':
          navigate('/distributor-dashboard');
          break;
        default:
          navigate('/client-dashboard');
      }
    } catch (error) {
      console.error('Registration error', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTabConfig = (tab: RegisterTab) => {
    switch (tab) {
      case 'agent':
        return {
          title: 'Become a PadosiAgent',
          description: 'Register to start getting leads and grow your business',
        };
      case 'distributor':
        return {
          title: 'Become a Distributor',
          description: 'Register to onboard agents and earn commissions',
        };
      default:
        return {
          title: 'Create Your Account',
          description: 'Register to find and connect with the best insurance agents',
        };
    }
  };

  const config = getTabConfig(userType);

  const renderAgentStepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Registration Progress</span>
        <span className="text-sm text-muted-foreground">Step {agentStep === 'details' ? 1 : agentStep === 'plan' ? 2 : 3} of 3</span>
      </div>
      <Progress value={getAgentStepProgress()} className="h-2" />
      
      <div className="flex justify-between mt-3">
        <div className={`flex items-center gap-1 text-xs ${agentStep === 'details' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            agentStep === 'details' ? 'bg-primary text-primary-foreground' : 'bg-accent text-white'
          }`}>
            {agentStep === 'details' ? '1' : <CheckCircle2 className="h-4 w-4" />}
          </div>
          Details
        </div>
        <div className={`flex items-center gap-1 text-xs ${agentStep === 'plan' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            agentStep === 'plan' ? 'bg-primary text-primary-foreground' : 
            agentStep === 'payment' ? 'bg-accent text-white' : 'bg-muted'
          }`}>
            {agentStep === 'payment' ? <CheckCircle2 className="h-4 w-4" /> : '2'}
          </div>
          Plan
        </div>
        <div className={`flex items-center gap-1 text-xs ${agentStep === 'payment' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            agentStep === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            3
          </div>
          Payment
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary/5 pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          {/* Logo above card */}
          <div className="text-center mb-6">
            <img src={logo} alt="PadosiAgent" className="h-10 sm:h-12 mx-auto mb-3 mix-blend-multiply" />
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>IRDAI Verified Platform</span>
              <span className="text-border">•</span>
              <span>100% Free</span>
            </div>
          </div>

          <Card className="border border-border/60 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold">{config.title}</CardTitle>
            <CardDescription className="text-sm">{config.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(value) => {
              setUserType(value as RegisterTab);
              setAgentStep('details');
            }}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="user">End User</TabsTrigger>
                <TabsTrigger value="agent">PadosiAgent</TabsTrigger>
                <TabsTrigger value="distributor">Distributor</TabsTrigger>
              </TabsList>

              {/* Agent Registration Flow */}
              {userType === 'agent' && (
                <>
                  {renderAgentStepIndicator()}

                  {/* Step 1: Details */}
                  {agentStep === 'details' && (
                    <form onSubmit={handleAgentDetailsSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            type="text" 
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required 
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            placeholder="+91 9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required 
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required 
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Professional Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="yearsExperience">Years of Experience</Label>
                          <Select value={yearsExperience} onValueChange={setYearsExperience}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0-2">0-2 Years</SelectItem>
                              <SelectItem value="3-5">3-5 Years</SelectItem>
                              <SelectItem value="6-10">6-10 Years</SelectItem>
                              <SelectItem value="11-15">11-15 Years</SelectItem>
                              <SelectItem value="16-20">16-20 Years</SelectItem>
                              <SelectItem value="20+">20+ Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <MultiSelectDropdown
                            label="Insurance Companies"
                            options={[
                              'Life Insurance Corporation of India',
                              'HDFC Life Insurance Company Limited',
                              'ICICI Prudential Life Insurance Company Limited',
                              'SBI Life Insurance Company Limited',
                              'Axis Max Life Insurance Limited',
                              'Bajaj Life Insurance Limited',
                              'TATA AIA Life Insurance Company Limited',
                              'Kotak Mahindra Life Insurance Company Limited',
                              'HDFC ERGO General Insurance Company Limited',
                              'ICICI LOMBARD General Insurance Company Limited',
                              'Bajaj General Insurance Limited',
                              'Tata AIG General Insurance Company Limited',
                              'SBI General Insurance Company Limited',
                              'Star Health & Allied Insurance Co. Ltd.',
                              'Care Health Insurance Ltd.',
                              'Niva Bupa Health Insurance Company Limited',
                              'ManipalCigna Health Insurance Company Limited',
                              'Reliance General Insurance Company Limited',
                              'The New India Assurance Company Limited',
                              'United India Insurance Company Limited',
                            ]}
                            selected={insuranceCompanies}
                            onChange={setInsuranceCompanies}
                            placeholder="Select companies"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Create Password</Label>
                          <Input 
                            id="password" 
                            type="password"
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input 
                            id="confirmPassword" 
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Input 
                          id="terms" 
                          type="checkbox"
                          className="w-4 h-4"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          required 
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="terms" className="text-sm">
                          I agree to the{' '}
                          <Link to="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>
                          {' '}and{' '}
                          <Link to="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-primary hover:bg-accent font-bold text-base shadow-lg cta-glow cta-ripple tap-feedback animate-pulse-glow"
                        disabled={!canProceedToPayment || isSubmitting}
                      >
                        Continue to Plan Selection
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  )}

                  {/* Step 2: Plan Selection */}
                  {agentStep === 'plan' && (
                    <div className="space-y-6">
                      {/* Promo Code Section */}
                      <div className="bg-muted/50 rounded-lg p-4 border">
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Have a Promo Code?</span>
                        </div>
                        
                        {isPromoApplied && hasValidPromoCode ? (
                          <div className="flex items-center justify-between bg-accent/10 border border-accent/30 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-accent" />
                              <span className="text-sm font-medium text-accent">
                                Code "{promoCode}" applied!
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={handleRemovePromoCode}
                              className="text-xs h-7"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter promo code"
                              value={promoCode}
                              onChange={(e) => {
                                setPromoCode(e.target.value);
                                setPromoError('');
                              }}
                              className={`flex-1 ${promoError ? 'border-destructive' : ''}`}
                            />
                            <Button 
                              variant="outline" 
                              onClick={handleApplyPromoCode}
                              disabled={!promoCode.trim()}
                            >
                              Apply
                            </Button>
                          </div>
                        )}
                        
                        {promoError && (
                          <p className="text-xs text-destructive mt-2">{promoError}</p>
                        )}
                        
                        {!isPromoApplied && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Valid codes: Pre-Launch, LICIndia, TAGIC, TALIC, BAGIC, BALIC
                          </p>
                        )}
                      </div>

                      <PlanSelector 
                        selectedPlan={selectedPlan} 
                        onPlanSelect={setSelectedPlan}
                        hasValidPromoCode={hasValidPromoCode}
                      />

                      <div className="flex gap-3">
                        <Button 
                          variant="outline"
                          onClick={() => setAgentStep('details')}
                          className="flex-1"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button 
                          onClick={handlePlanContinue}
                          className="flex-1 bg-primary hover:bg-primary/90"
                        >
                          {selectedPlan === 'starter' && hasValidPromoCode ? 'Start Free Trial' : 'Proceed to Payment'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>Secure checkout • 100% money-back guarantee</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Regular User/Distributor Registration */}
              {userType !== 'agent' && (
                <form onSubmit={handleRegularSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        type="text" 
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required 
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Company name for distributors */}
                  {userType === 'distributor' && (
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name (Optional)</Label>
                      <Input 
                        id="companyName" 
                        type="text" 
                        placeholder="Your company name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input 
                      id="terms" 
                      type="checkbox"
                      className="w-4 h-4"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required 
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-accent font-bold text-base shadow-lg cta-glow cta-ripple tap-feedback animate-pulse-glow"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating account...' : 'Register'}
                  </Button>
                </form>
              )}
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <div className="w-full pt-4 border-t">
              <p className="text-center text-sm text-muted-foreground mb-3">
                Already have an account?
              </p>
              <Link to="/login" className="block">
                <Button 
                  variant="outline" 
                  className="w-full h-11 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
                >
                  Login here
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>

          {/* Trust indicators below card */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>No Spam Calls</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-primary" />
              <span>Data Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dummy Payment Dialog */}
      <DummyPaymentDialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onSuccess={handlePaymentSuccess}
        plan={selectedPlan}
      />
      
    </div>
  );
};

export default Register;
