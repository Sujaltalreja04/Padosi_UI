import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/components/ui/sonner";
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExpertiseGrid from '@/components/agent-profile/ExpertiseGrid';
import type { ExpertiseLevel } from '@/components/agent-profile/ExpertiseGrid';
import FamilyLicenseManager, { FamilyLicense } from '@/components/agent-profile/FamilyLicenseManager';
import ProductPortfolioManager, { SegmentPortfolio } from '@/components/agent-profile/ProductPortfolioManager';
import LeadPreferences from '@/components/agent-profile/LeadPreferences';
import DeclarationsConsent from '@/components/agent-profile/DeclarationsConsent';
import MultiSelectDropdown from '@/components/agent-profile/MultiSelectDropdown';
import type { GalleryImage } from '@/components/AgentGalleryManager';
import AgentProfilePreview from '@/components/AgentProfilePreview';
import CareerTimelineManager from '@/components/agent-profile/CareerTimelineManager';
import ProfileSetupGuide from '@/components/ProfileSetupGuide';
import MobileStepProgress from '@/components/MobileStepProgress';
import RestoreDraftDialog from '@/components/RestoreDraftDialog';
import { useProfileAutoSave, ProfileFormData } from '@/hooks/useProfileAutoSave';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { 
  User, 
  Briefcase, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  MapPin,
  Phone,
  Award,
  Globe,
  Camera,
  Loader2,
  X,
  HeartPulse,
  Heart,
  Car,
  Building2,
  Shield,
  Info,
  ChevronLeft,
  ChevronRight,
  Save,
  Image as ImageIcon,
  Sparkles,
  Pencil,
  Check,
  Eye,
  HelpCircle,
  ExternalLink,
  CloudOff,
  Cloud,
  BarChart3
} from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

// Gallery Image Card Component with Caption
const GalleryImageCard: React.FC<{
  image: GalleryImage;
  onRemove: () => void;
  onCaptionChange: (caption: string) => void;
}> = ({ image, onRemove, onCaptionChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(image.caption);

  const handleSave = () => {
    onCaptionChange(caption);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setCaption(image.caption);
      setIsEditing(false);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border bg-muted/20">
      <div className="relative aspect-[4/3] group">
        <img src={image.url} alt={image.caption || 'Gallery image'} className="w-full h-full object-cover" />
        <button 
          onClick={onRemove} 
          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="p-2 border-t bg-background">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Office, Award, Achievement..."
              className="h-7 text-xs"
              maxLength={100}
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleSave}>
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
          </div>
        ) : (
          <div 
            className="flex items-center justify-between gap-1 cursor-pointer hover:bg-muted/50 rounded p-1 -m-1"
            onClick={() => setIsEditing(true)}
          >
            <p className="text-xs text-muted-foreground truncate flex-1">
              {image.caption || 'Click to add caption...'}
            </p>
            <Pencil className="h-3 w-3 text-muted-foreground shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
};

// Types
type Section = 'basic' | 'professional' | 'segments' | 'portfolio' | 'additional' | 'leads' | 'declarations';

interface BasicDetails {
  fullName: string;
  displayName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  languages: string[];
  residenceAddress: string;
  avatarUrl: string;
}

interface ProfessionalDetails {
  panNumber: string;
  licenseNumber: string;
  officeAddress: string;
  serviceableCities: string[];
  yearsExperience: string;
  clientBase: string;
  companyName: string;
  hasPosLicense: boolean;
  familyLicenses: FamilyLicense[];
  // Performance stats
  claimsProcessed: string;
  claimsSettled: string;
  claimsAmount: string;
  successRate: string;
  responseTime: string;
}

interface InsuranceSegments {
  health: boolean;
  life: boolean;
  motor: boolean;
  sme: boolean;
}

interface TimelineEntry {
  id: string;
  year: string;
  month?: string;
  event: string;
  type: 'career' | 'achievement' | 'certification' | 'milestone';
}

interface AdditionalDetails {
  website: string;
  googleBusiness: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  youtube: string;
  careerHighlights: string;
  careerTimeline: TimelineEntry[];
  galleryImages: GalleryImage[];
}

// Constants
const LANGUAGE_OPTIONS = [
  'English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 
  'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Urdu'
];

const CITY_OPTIONS = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 
  'Kolkata', 'Pune', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur'
];

const HEALTH_PRODUCTS = [
  { id: 'mediclaim', name: 'Mediclaim' },
  { id: 'personal_accident', name: 'Personal Accident' },
  { id: 'critical_illness', name: 'Critical Illness' },
  { id: 'super_topup', name: 'Super Top-Up' },
];

const LIFE_PRODUCTS = [
  { id: 'term_plan', name: 'Term Plan' },
  { id: 'pension_plan', name: 'Pension Plan' },
  { id: 'guaranteed_plan', name: 'Guaranteed Plan' },
  { id: 'saving_plan', name: 'Saving Plan' },
  { id: 'ulip_plan', name: 'ULIP Plan' },
  { id: 'others', name: 'Others' },
];

const MOTOR_PRODUCTS = [
  { id: 'private_car', name: 'Private Car' },
  { id: 'two_wheeler', name: 'Two Wheeler' },
  { id: 'commercial_vehicle', name: 'Commercial Vehicle' },
  { id: 'three_wheeler', name: '3 Wheeler' },
  { id: 'others', name: 'Others' },
];

const SME_PRODUCTS = [
  { id: 'fire', name: 'Fire' },
  { id: 'marine', name: 'Marine / Transport' },
  { id: 'workmen_comp', name: 'Workmen Compensation' },
  { id: 'gpa_gmc', name: 'GPA / GMC' },
  { id: 'group_term', name: 'Group Term Insurance' },
  { id: 'liability', name: 'Liability' },
  { id: 'cyber', name: 'Cyber' },
  { id: 'others', name: 'Others' },
];

const AgentProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // State for all sections
  const [basicDetails, setBasicDetails] = useState<BasicDetails>({
    fullName: user?.name || '',
    displayName: '',
    phone: user?.phone || '',
    whatsappNumber: '',
    email: user?.email || '',
    languages: ['English'],
    residenceAddress: '',
    avatarUrl: '',
  });

  const [professionalDetails, setProfessionalDetails] = useState<ProfessionalDetails>({
    panNumber: '',
    licenseNumber: '',
    officeAddress: '',
    serviceableCities: [],
    yearsExperience: '',
    clientBase: '',
    companyName: '',
    hasPosLicense: false,
    familyLicenses: [],
    // Performance stats
    claimsProcessed: '',
    claimsSettled: '',
    claimsAmount: '',
    successRate: '',
    responseTime: '',
  });

  const [insuranceSegments, setInsuranceSegments] = useState<InsuranceSegments>({
    health: false,
    life: false,
    motor: false,
    sme: false,
  });

  const [healthExpertise, setHealthExpertise] = useState<Record<string, ExpertiseLevel>>({});
  const [lifeExpertise, setLifeExpertise] = useState<Record<string, ExpertiseLevel>>({});
  const [motorExpertise, setMotorExpertise] = useState<Record<string, ExpertiseLevel>>({});
  const [smeExpertise, setSmeExpertise] = useState<Record<string, ExpertiseLevel>>({});

  // Custom products for each segment
  const [customHealthProducts, setCustomHealthProducts] = useState<{ id: string; name: string; isCustom: boolean }[]>([]);
  const [customLifeProducts, setCustomLifeProducts] = useState<{ id: string; name: string; isCustom: boolean }[]>([]);
  const [customMotorProducts, setCustomMotorProducts] = useState<{ id: string; name: string; isCustom: boolean }[]>([]);
  const [customSmeProducts, setCustomSmeProducts] = useState<{ id: string; name: string; isCustom: boolean }[]>([]);

  // Add/remove custom products
  const addCustomProduct = (
    segment: 'health' | 'life' | 'motor' | 'sme',
    name: string
  ) => {
    const newProduct = { id: `custom_${Date.now()}`, name, isCustom: true };
    switch (segment) {
      case 'health':
        setCustomHealthProducts((prev) => [...prev, newProduct]);
        break;
      case 'life':
        setCustomLifeProducts((prev) => [...prev, newProduct]);
        break;
      case 'motor':
        setCustomMotorProducts((prev) => [...prev, newProduct]);
        break;
      case 'sme':
        setCustomSmeProducts((prev) => [...prev, newProduct]);
        break;
    }
  };

  const removeCustomProduct = (
    segment: 'health' | 'life' | 'motor' | 'sme',
    productId: string
  ) => {
    switch (segment) {
      case 'health':
        setCustomHealthProducts((prev) => prev.filter((p) => p.id !== productId));
        setHealthExpertise((prev) => {
          const { [productId]: _, ...rest } = prev;
          return rest;
        });
        break;
      case 'life':
        setCustomLifeProducts((prev) => prev.filter((p) => p.id !== productId));
        setLifeExpertise((prev) => {
          const { [productId]: _, ...rest } = prev;
          return rest;
        });
        break;
      case 'motor':
        setCustomMotorProducts((prev) => prev.filter((p) => p.id !== productId));
        setMotorExpertise((prev) => {
          const { [productId]: _, ...rest } = prev;
          return rest;
        });
        break;
      case 'sme':
        setCustomSmeProducts((prev) => prev.filter((p) => p.id !== productId));
        setSmeExpertise((prev) => {
          const { [productId]: _, ...rest } = prev;
          return rest;
        });
        break;
    }
  };

  const [productPortfolio, setProductPortfolio] = useState<Record<string, SegmentPortfolio>>({});

  const [additionalDetails, setAdditionalDetails] = useState<AdditionalDetails>({
    website: '',
    googleBusiness: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    youtube: '',
    careerHighlights: '',
    careerTimeline: [],
    galleryImages: [],
  });

  const [wantsNewBusinessLeads, setWantsNewBusinessLeads] = useState(false);
  const [newBusinessLeadCharging, setNewBusinessLeadCharging] = useState('free');
  const [newBusinessLeadAmount, setNewBusinessLeadAmount] = useState(0);
  const [wantsPortfolioLeads, setWantsPortfolioLeads] = useState(false);
  const [portfolioLeadCharging, setPortfolioLeadCharging] = useState('free');
  const [portfolioLeadAmount, setPortfolioLeadAmount] = useState(0);
  const [wantsClaimsLeads, setWantsClaimsLeads] = useState(false);
  const [claimsLeadCharging, setClaimsLeadCharging] = useState('free');
  const [claimsLeadAmount, setClaimsLeadAmount] = useState(0);

  const [declarationsAccepted, setDeclarationsAccepted] = useState(false);

  // Selected segments for portfolio
  const selectedSegments = useMemo(() => {
    const segments: string[] = [];
    if (insuranceSegments.health) segments.push('health');
    if (insuranceSegments.life) segments.push('life');
    if (insuranceSegments.motor) segments.push('motor');
    if (insuranceSegments.sme) segments.push('sme');
    return segments;
  }, [insuranceSegments]);

  // Form data for auto-save
  const formDataForAutoSave = useMemo<Partial<ProfileFormData>>(() => ({
    basicDetails,
    professionalDetails,
    insuranceSegments,
    additionalDetails,
    healthExpertise,
    lifeExpertise,
    motorExpertise,
    smeExpertise,
    productPortfolio,
    leadPreferences: {
      wantsNewBusinessLeads,
      newBusinessLeadCharging,
      newBusinessLeadAmount,
      wantsPortfolioLeads,
      portfolioLeadCharging,
      portfolioLeadAmount,
      wantsClaimsLeads,
      claimsLeadCharging,
      claimsLeadAmount,
    },
    declarationsAccepted,
    activeSection,
  }), [
    basicDetails, professionalDetails, insuranceSegments, additionalDetails,
    healthExpertise, lifeExpertise, motorExpertise, smeExpertise,
    productPortfolio, wantsNewBusinessLeads, newBusinessLeadCharging, newBusinessLeadAmount,
    wantsPortfolioLeads, portfolioLeadCharging, portfolioLeadAmount,
    wantsClaimsLeads, claimsLeadCharging, claimsLeadAmount,
    declarationsAccepted, activeSection
  ]);

  // Auto-save hook
  const {
    loadFromLocalStorage,
    clearSavedData,
    hasSavedData,
    getLastSavedTime,
    saveNow,
  } = useProfileAutoSave(formDataForAutoSave, user?.id);

  // Fetch existing profile data from database
  useEffect(() => {
    const fetchExistingProfile = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        // Fetch agent profile data
        const { data: agentProfile } = await supabase
          .from('agent_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        // Fetch gallery images
        const { data: galleryImages } = await supabase
          .from('agent_gallery_images')
          .select('image_url, display_order')
          .eq('agent_id', user.id)
          .order('display_order');
        
        if (profile) {
          setBasicDetails(prev => ({
            ...prev,
            fullName: profile.full_name || prev.fullName,
            displayName: profile.display_name || '',
            phone: profile.phone || prev.phone,
            whatsappNumber: profile.whatsapp_number || '',
            email: profile.email || prev.email,
            residenceAddress: profile.residence_address || '',
            avatarUrl: profile.avatar_url || '',
          }));
        }
        
        if (agentProfile) {
          // Parse languages from database
          const dbLanguages = agentProfile.languages || ['English'];
          setBasicDetails(prev => ({
            ...prev,
            languages: dbLanguages,
          }));
          
          setProfessionalDetails(prev => ({
            ...prev,
            panNumber: agentProfile.pan_number || '',
            licenseNumber: agentProfile.license_number || '',
            officeAddress: agentProfile.office_address || '',
            serviceableCities: agentProfile.serviceable_cities || [],
            yearsExperience: agentProfile.years_experience?.toString() || '',
            clientBase: agentProfile.approx_client_base || '',
            companyName: agentProfile.company_name || '',
            hasPosLicense: agentProfile.has_pos_license || false,
            familyLicenses: (agentProfile.family_licenses as any[]) || [],
            claimsProcessed: agentProfile.claims_processed || '',
            claimsSettled: agentProfile.claims_settled?.toString() || '',
            claimsAmount: agentProfile.claims_amount || '',
            successRate: agentProfile.success_rate || '',
            responseTime: agentProfile.response_time || '',
          }));
          
          // Set insurance segments
          const segments = agentProfile.insurance_segments || [];
          setInsuranceSegments({
            health: segments.includes('health'),
            life: segments.includes('life'),
            motor: segments.includes('motor'),
            sme: segments.includes('sme'),
          });
          
          // Set expertise
          if (agentProfile.health_expertise) setHealthExpertise(agentProfile.health_expertise as Record<string, ExpertiseLevel>);
          if (agentProfile.life_expertise) setLifeExpertise(agentProfile.life_expertise as Record<string, ExpertiseLevel>);
          if (agentProfile.motor_expertise) setMotorExpertise(agentProfile.motor_expertise as Record<string, ExpertiseLevel>);
          if (agentProfile.sme_expertise) setSmeExpertise(agentProfile.sme_expertise as Record<string, ExpertiseLevel>);
          
          // Set product portfolio
          if (agentProfile.product_portfolio) setProductPortfolio(agentProfile.product_portfolio as unknown as Record<string, SegmentPortfolio>);
          
          // Set additional details including career timeline
          const careerTimeline = (agentProfile as any).career_timeline || [];
          setAdditionalDetails(prev => ({
            ...prev,
            website: agentProfile.website || '',
            googleBusiness: agentProfile.google_business_profile || '',
            linkedin: agentProfile.linkedin || '',
            instagram: agentProfile.instagram || '',
            facebook: agentProfile.facebook || '',
            youtube: agentProfile.youtube || '',
            careerHighlights: agentProfile.career_highlights || '',
            careerTimeline: Array.isArray(careerTimeline) ? careerTimeline : [],
            galleryImages: galleryImages?.map(g => ({ url: g.image_url, caption: '' })) || [],
          }));
          
          // Set lead preferences
          setWantsPortfolioLeads(agentProfile.wants_portfolio_leads || false);
          setPortfolioLeadCharging(agentProfile.portfolio_lead_charging || 'free');
          setPortfolioLeadAmount(agentProfile.portfolio_lead_amount || 0);
          setWantsClaimsLeads(agentProfile.wants_claims_leads || false);
          setClaimsLeadCharging(agentProfile.claims_lead_charging || 'free');
          setClaimsLeadAmount(agentProfile.claims_lead_amount || 0);
          
          // Set declarations
          if (agentProfile.declarations_accepted) setDeclarationsAccepted(true);
        }
      } catch (error) {
        console.error('Error fetching existing profile:', error);
      }
    };
    
    fetchExistingProfile();
  }, [user?.id]);

  // Check for saved draft on mount
  useEffect(() => {
    if (!isInitialized && user?.id && hasSavedData()) {
      setShowRestoreDialog(true);
    }
    setIsInitialized(true);
  }, [user?.id, isInitialized, hasSavedData]);

  // Restore draft data
  const handleRestoreDraft = useCallback(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      // Restore all form state
      if (savedData.basicDetails) setBasicDetails(savedData.basicDetails);
      if (savedData.professionalDetails) {
        // Ensure all new fields have defaults for backward compatibility
        setProfessionalDetails({
          panNumber: savedData.professionalDetails.panNumber || '',
          licenseNumber: savedData.professionalDetails.licenseNumber || '',
          officeAddress: savedData.professionalDetails.officeAddress || '',
          serviceableCities: savedData.professionalDetails.serviceableCities || [],
          yearsExperience: savedData.professionalDetails.yearsExperience || '',
          clientBase: savedData.professionalDetails.clientBase || '',
          companyName: savedData.professionalDetails.companyName || '',
          hasPosLicense: savedData.professionalDetails.hasPosLicense || false,
          familyLicenses: savedData.professionalDetails.familyLicenses || [],
          claimsProcessed: savedData.professionalDetails.claimsProcessed || '',
          claimsSettled: savedData.professionalDetails.claimsSettled || '',
          claimsAmount: savedData.professionalDetails.claimsAmount || '',
          successRate: savedData.professionalDetails.successRate || '',
          responseTime: savedData.professionalDetails.responseTime || '',
        });
      }
      if (savedData.insuranceSegments) setInsuranceSegments(savedData.insuranceSegments);
      if (savedData.additionalDetails) setAdditionalDetails({
        ...savedData.additionalDetails,
        careerTimeline: (savedData.additionalDetails as any).careerTimeline || [],
      });
      if (savedData.healthExpertise) setHealthExpertise(savedData.healthExpertise as Record<string, ExpertiseLevel>);
      if (savedData.lifeExpertise) setLifeExpertise(savedData.lifeExpertise as Record<string, ExpertiseLevel>);
      if (savedData.motorExpertise) setMotorExpertise(savedData.motorExpertise as Record<string, ExpertiseLevel>);
      if (savedData.smeExpertise) setSmeExpertise(savedData.smeExpertise as Record<string, ExpertiseLevel>);
      if (savedData.productPortfolio) setProductPortfolio(savedData.productPortfolio);
      if (savedData.leadPreferences) {
        setWantsNewBusinessLeads(savedData.leadPreferences.wantsNewBusinessLeads);
        setNewBusinessLeadCharging(savedData.leadPreferences.newBusinessLeadCharging);
        setNewBusinessLeadAmount(savedData.leadPreferences.newBusinessLeadAmount);
        setWantsPortfolioLeads(savedData.leadPreferences.wantsPortfolioLeads);
        setPortfolioLeadCharging(savedData.leadPreferences.portfolioLeadCharging);
        setPortfolioLeadAmount(savedData.leadPreferences.portfolioLeadAmount);
        setWantsClaimsLeads(savedData.leadPreferences.wantsClaimsLeads);
        setClaimsLeadCharging(savedData.leadPreferences.claimsLeadCharging);
        setClaimsLeadAmount(savedData.leadPreferences.claimsLeadAmount);
      }
      if (savedData.declarationsAccepted !== undefined) setDeclarationsAccepted(savedData.declarationsAccepted);
      if (savedData.activeSection) setActiveSection(savedData.activeSection as Section);
      
      toast.success('Draft restored! Continue where you left off.');
    }
    setShowRestoreDialog(false);
  }, [loadFromLocalStorage]);

  // Discard draft
  const handleDiscardDraft = useCallback(() => {
    clearSavedData();
    setShowRestoreDialog(false);
    toast.info('Starting fresh');
  }, [clearSavedData]);

  // Experience as number
  const yearsExp = parseInt(professionalDetails.yearsExperience) || 0;

  // Validation
  const isBasicComplete = 
    basicDetails.fullName.trim() !== '' && 
    basicDetails.phone.trim() !== '' && 
    basicDetails.email.trim() !== '' &&
    basicDetails.languages.length > 0 &&
    basicDetails.residenceAddress.trim() !== '';

  const isProfessionalComplete = 
    (professionalDetails.panNumber.trim() !== '' || professionalDetails.licenseNumber.trim() !== '') && 
    professionalDetails.serviceableCities.length > 0 &&
    professionalDetails.yearsExperience.trim() !== '' && 
    professionalDetails.clientBase.trim() !== '';

  const isSegmentsComplete = selectedSegments.length > 0;

  const isPortfolioComplete = selectedSegments.length === 0 || 
    selectedSegments.every(seg => productPortfolio[seg]?.primaryCompany?.trim());

  const isAdditionalComplete = true; // Optional section

  const isLeadsComplete = true; // Optional section

  const isDeclarationsComplete = declarationsAccepted;

  // Claims leads require company name
  const claimsLeadsEligible = yearsExp >= 10 && professionalDetails.companyName.trim() !== '';

  // Calculate progress
  const getProgress = () => {
    let total = 0;
    let completed = 0;
    
    // Basic (required)
    total += 20;
    if (isBasicComplete) completed += 20;
    
    // Professional (required)
    total += 20;
    if (isProfessionalComplete) completed += 20;
    
    // Segments (required)
    total += 15;
    if (isSegmentsComplete) completed += 15;
    
    // Portfolio (required if segments selected)
    total += 15;
    if (isPortfolioComplete) completed += 15;
    
    // Additional (optional - give points for any content)
    total += 10;
    if (additionalDetails.careerHighlights.trim() || additionalDetails.galleryImages.length > 0) {
      completed += 10;
    }
    
    // Leads (optional)
    total += 10;
    if (wantsNewBusinessLeads || wantsPortfolioLeads || wantsClaimsLeads) completed += 10;
    
    // Declarations (required)
    total += 10;
    if (isDeclarationsComplete) completed += 10;
    
    return Math.round((completed / total) * 100);
  };

  // Avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setBasicDetails(prev => ({ ...prev, avatarUrl: publicUrl }));
      toast.success('Profile photo uploaded!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!basicDetails.avatarUrl || !user?.id) return;

    setIsUploadingAvatar(true);
    try {
      const urlParts = basicDetails.avatarUrl.split('/avatars/');
      if (urlParts.length > 1) {
        await supabase.storage.from('avatars').remove([urlParts[1]]);
      }
      setBasicDetails(prev => ({ ...prev, avatarUrl: '' }));
      toast.success('Photo removed');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Gallery upload
  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const maxImages = 10;
    const currentCount = additionalDetails.galleryImages.length;
    const remainingSlots = maxImages - currentCount;

    if (remainingSlots <= 0) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (!user?.id) {
      toast.error('You must be logged in');
      return;
    }

    setIsUploadingGallery(true);
    try {
      const uploadedImages: GalleryImage[] = [];

      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/gallery-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error } = await supabase.storage
          .from('agent-gallery')
          .upload(fileName, file, { cacheControl: '3600' });

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('agent-gallery')
            .getPublicUrl(fileName);
          uploadedImages.push({ url: publicUrl, caption: '' });
        }
      }

      if (uploadedImages.length > 0) {
        setAdditionalDetails(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, ...uploadedImages],
        }));
        toast.success(`${uploadedImages.length} image(s) uploaded! Click to add captions.`);
      }
    } catch (error) {
      console.error('Error uploading gallery:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const removeGalleryImage = async (imageUrl: string) => {
    try {
      const urlParts = imageUrl.split('/agent-gallery/');
      if (urlParts.length > 1) {
        await supabase.storage.from('agent-gallery').remove([urlParts[1]]);
      }
      setAdditionalDetails(prev => ({
        ...prev,
        galleryImages: prev.galleryImages.filter(img => img.url !== imageUrl),
      }));
      toast.success('Image removed');
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const updateGalleryCaption = (imageUrl: string, caption: string) => {
    setAdditionalDetails(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.map(img => 
        img.url === imageUrl ? { ...img, caption } : img
      ),
    }));
  };

  // Handle portfolio change
  const handlePortfolioChange = (segment: string, field: keyof SegmentPortfolio, value: string) => {
    setProductPortfolio(prev => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        [field]: value,
      },
    }));
  };

  // Submit
  const handleSubmit = async () => {
    if (!isBasicComplete || !isProfessionalComplete || !isSegmentsComplete || !isDeclarationsComplete) {
      toast.error('Please complete all mandatory sections');
      return;
    }

    if (wantsClaimsLeads && !claimsLeadsEligible) {
      toast.error('Company Name is required for Claims Support leads');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: basicDetails.fullName,
          display_name: basicDetails.displayName || null,
          phone: basicDetails.phone,
          whatsapp_number: basicDetails.whatsappNumber || null,
          avatar_url: basicDetails.avatarUrl || null,
          residence_address: basicDetails.residenceAddress,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Update agent_profiles table
      const { error: agentError } = await supabase
        .from('agent_profiles')
        .update({
          pan_number: professionalDetails.panNumber || null,
          license_number: professionalDetails.licenseNumber || null,
          office_address: professionalDetails.officeAddress || null,
          serviceable_cities: professionalDetails.serviceableCities,
          years_experience: parseInt(professionalDetails.yearsExperience) || 0,
          approx_client_base: professionalDetails.clientBase,
          company_name: professionalDetails.companyName || null,
          has_pos_license: professionalDetails.hasPosLicense,
          family_licenses: JSON.parse(JSON.stringify(professionalDetails.familyLicenses)),
          location: basicDetails.residenceAddress,
          languages: basicDetails.languages,
          insurance_segments: selectedSegments,
          health_expertise: JSON.parse(JSON.stringify(healthExpertise)),
          life_expertise: JSON.parse(JSON.stringify(lifeExpertise)),
          motor_expertise: JSON.parse(JSON.stringify(motorExpertise)),
          sme_expertise: JSON.parse(JSON.stringify(smeExpertise)),
          product_portfolio: JSON.parse(JSON.stringify(productPortfolio)),
          website: additionalDetails.website || null,
          google_business_profile: additionalDetails.googleBusiness || null,
          linkedin: additionalDetails.linkedin || null,
          instagram: additionalDetails.instagram || null,
          facebook: additionalDetails.facebook || null,
          youtube: additionalDetails.youtube || null,
          career_highlights: additionalDetails.careerHighlights || null,
          career_timeline: JSON.parse(JSON.stringify(additionalDetails.careerTimeline)),
          wants_portfolio_leads: wantsPortfolioLeads,
          portfolio_lead_charging: portfolioLeadCharging,
          portfolio_lead_amount: portfolioLeadAmount,
          wants_claims_leads: wantsClaimsLeads,
          claims_lead_charging: claimsLeadCharging,
          claims_lead_amount: claimsLeadAmount,
          declarations_accepted: true,
          declarations_accepted_at: new Date().toISOString(),
          bio: additionalDetails.careerHighlights || null,
          specializations: selectedSegments,
          // Performance stats
          claims_processed: professionalDetails.claimsProcessed || '0',
          claims_settled: parseInt(professionalDetails.claimsSettled) || 0,
          claims_amount: professionalDetails.claimsAmount || '₹0',
          success_rate: professionalDetails.successRate || '0%',
          response_time: professionalDetails.responseTime || '< 24 hours',
        })
        .eq('id', user?.id);

      if (agentError) throw agentError;

      // Save gallery images
      if (additionalDetails.galleryImages.length > 0) {
        // First delete existing
        await supabase
          .from('agent_gallery_images')
          .delete()
          .eq('agent_id', user?.id);

        // Insert new
        const galleryInserts = additionalDetails.galleryImages.map((img, index) => ({
          agent_id: user?.id,
          image_url: img.url,
          display_order: index,
        }));

        await supabase.from('agent_gallery_images').insert(galleryInserts);
      }

      toast.success('Profile saved successfully!');
      navigate('/agent-dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections: { id: Section; title: string; icon: React.ElementType; required: boolean; complete: boolean }[] = [
    { id: 'basic', title: '👤 Basic Details (जानकारी)', icon: User, required: true, complete: isBasicComplete },
    { id: 'professional', title: '💼 Professional (व्यवसायिक)', icon: Briefcase, required: true, complete: isProfessionalComplete },
    { id: 'segments', title: '🛡️ Insurance (बीमा)', icon: Shield, required: true, complete: isSegmentsComplete },
    { id: 'portfolio', title: '🏢 Portfolio (कंपनी)', icon: Building2, required: true, complete: isPortfolioComplete },
    { id: 'additional', title: '📸 Profile & Photos', icon: Plus, required: false, complete: isAdditionalComplete },
    { id: 'leads', title: '📞 Lead Settings', icon: Sparkles, required: false, complete: isLeadsComplete },
    { id: 'declarations', title: '✅ Declarations (घोषणा)', icon: CheckCircle2, required: true, complete: isDeclarationsComplete },
  ];

  const currentIndex = sections.findIndex(s => s.id === activeSection);
  const canGoNext = currentIndex < sections.length - 1;
  const canGoPrev = currentIndex > 0;

  const goNext = useCallback(() => {
    if (canGoNext) {
      setActiveSection(sections[currentIndex + 1].id);
      // Scroll to top of form on mobile
      formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [canGoNext, currentIndex, sections]);

  const goPrev = useCallback(() => {
    if (canGoPrev) {
      setActiveSection(sections[currentIndex - 1].id);
      // Scroll to top of form on mobile
      formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [canGoPrev, currentIndex, sections]);

  // Swipe gesture for mobile navigation
  const swipeRef = useSwipeGesture<HTMLDivElement>({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
    threshold: 75,
    disabled: false,
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      {/* Restore Draft Dialog */}
      <RestoreDraftDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        lastSavedTime={getLastSavedTime()}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
      />
      
      <div className="flex-grow container mx-auto px-4 pt-20 sm:pt-24 pb-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <Badge className="bg-primary text-primary-foreground mb-2 text-sm px-4 py-1">Profile Setup / प्रोफाइल सेटअप</Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            👉 अपना PadosiAgent प्रोफाइल बनाएं
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            नीचे दिए गए सभी स्टेप भरें और अपना प्रोफाइल एक्टिवेट करें
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Fill all steps below to activate your profile and start getting leads
          </p>
          {/* Video Guide & Auto-save indicator */}
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <ProfileSetupGuide />
            <Button
              variant="ghost"
              size="sm"
              onClick={saveNow}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Cloud className="h-4 w-4 text-green-500" />
              <span className="text-xs">Auto-saving</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-background rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">प्रोफाइल कितना पूरा हुआ / Profile Completion</span>
            <span className="text-sm font-bold text-primary">{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} className="h-4" />
          <p className="text-xs text-muted-foreground mt-2">
            💡 सभी ज़रूरी (*) सेक्शन भरें प्रोफाइल एक्टिवेट करने के लिए — Complete all mandatory (*) sections to activate
          </p>
        </div>

        {/* Mobile Step Progress - New visual indicator */}
        <div className="mb-6 bg-background rounded-lg p-4 border" ref={formContainerRef}>
          <MobileStepProgress
            sections={sections}
            activeSection={activeSection}
            onSectionClick={(sectionId) => setActiveSection(sectionId as Section)}
          />
        </div>

        {/* Desktop Section Navigation - Hidden on mobile, replaced by MobileStepProgress */}
        <div className="hidden sm:block relative mb-6">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sections.map((section, idx) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-shrink-0 transition-all",
                  activeSection === section.id ? "ring-2 ring-primary/20" : ""
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                  activeSection === section.id ? "bg-primary-foreground/20" : "bg-muted"
                )}>
                  {idx + 1}
                </span>
                <section.icon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{section.title}</span>
                {section.required && <span className="text-destructive text-xs">*</span>}
                {section.complete && <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />}
              </Button>
            ))}
          </div>
        </div>

        {/* Section Content with Swipe Gesture */}
        <Card ref={swipeRef} className="mb-6 overflow-hidden touch-pan-y">
          <CardHeader className="space-y-1 pb-3 sm:pb-4">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
              {React.createElement(sections.find(s => s.id === activeSection)!.icon, { className: "h-4 w-4 sm:h-5 sm:w-5" })}
              <span className="flex-1 min-w-0">{sections.find(s => s.id === activeSection)?.title}</span>
              {sections.find(s => s.id === activeSection)?.required && (
                <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">Mandatory</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {activeSection === 'basic' && '📝 अपनी बेसिक जानकारी भरें — Your basic contact & identity info'}
              {activeSection === 'professional' && '📋 अपनी प्रोफेशनल जानकारी भरें — Your credentials & experience'}
              {activeSection === 'segments' && '🛡️ आप कौन सा बीमा बेचते हैं? — Select insurance types you sell'}
              {activeSection === 'portfolio' && '🏢 किन कंपनियों के साथ काम करते हैं? — Your company partnerships'}
              {activeSection === 'additional' && '📸 फोटो, लिंक और करियर टाइमलाइन — Photos, links & career story'}
              {activeSection === 'leads' && '📞 लीड सेटिंग्स — How you want to receive customer leads'}
              {activeSection === 'declarations' && '✅ शर्तें स्वीकार करें — Review and accept terms'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-5 sm:space-y-6 px-3 sm:px-6 pb-4 sm:pb-6">
            {/* BASIC DETAILS */}
            {activeSection === 'basic' && (
              <>
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30">
                      {isUploadingAvatar ? (
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      ) : basicDetails.avatarUrl ? (
                        <img src={basicDetails.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    {basicDetails.avatarUrl ? (
                      <Button size="sm" variant="destructive" className="absolute -bottom-2 -right-2 rounded-full h-9 w-9 p-0" onClick={handleRemoveAvatar} disabled={isUploadingAvatar}>
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full h-9 w-9 p-0" onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar}>
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{basicDetails.avatarUrl ? '❌ हटाने के लिए X दबाएं' : '📷 अपना प्रोफेशनल फोटो लगाएं'}</p>
                    <p className="text-xs text-muted-foreground">Upload your photo (Max 5MB, JPG/PNG)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-base font-semibold">
                      📛 पूरा नाम / Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input id="fullName" placeholder="जैसे: राजेश कुमार शर्मा" value={basicDetails.fullName} onChange={(e) => setBasicDetails(prev => ({ ...prev, fullName: e.target.value }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">PAN या IRDAI लाइसेंस के अनुसार — As per PAN / IRDAI License</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-base font-semibold">
                      🏷️ डिस्प्ले नाम / Display Name
                    </Label>
                    <Input id="displayName" placeholder="जैसे: Rajesh Sharma" value={basicDetails.displayName} onChange={(e) => setBasicDetails(prev => ({ ...prev, displayName: e.target.value }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">कस्टमर को यह नाम दिखेगा — This name shown to customers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-semibold">
                      📱 मोबाइल नंबर (कॉल) / Mobile Number <span className="text-destructive">*</span>
                    </Label>
                    <Input id="phone" type="tel" placeholder="जैसे: 9876543210" value={basicDetails.phone} onChange={(e) => setBasicDetails(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9+\s-]/g, '') }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">कस्टमर इस नंबर पर कॉल करेंगे</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-base font-semibold">
                      💬 WhatsApp नंबर
                    </Label>
                    <Input id="whatsapp" type="tel" placeholder="कॉल नंबर जैसा हो तो खाली छोड़ दें" value={basicDetails.whatsappNumber} onChange={(e) => setBasicDetails(prev => ({ ...prev, whatsappNumber: e.target.value.replace(/[^0-9+\s-]/g, '') }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">अगर कॉल नंबर ही है तो खाली छोड़ दें — Leave empty if same as calling</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">
                    📧 ईमेल / Email ID <span className="text-destructive">*</span>
                  </Label>
                  <Input id="email" type="email" placeholder="जैसे: rajesh@gmail.com" value={basicDetails.email} onChange={(e) => setBasicDetails(prev => ({ ...prev, email: e.target.value }))} className="h-12 text-base" />
                  <p className="text-xs text-muted-foreground">लीड नोटिफिकेशन इस ईमेल पर आएंगी</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    🗣️ कौन सी भाषा बोलते हैं? / Languages <span className="text-destructive">*</span>
                  </Label>
                  <MultiSelectDropdown
                    label=""
                    options={LANGUAGE_OPTIONS}
                    selected={basicDetails.languages}
                    onChange={(langs) => setBasicDetails(prev => ({ ...prev, languages: langs }))}
                    placeholder="भाषा चुनें / Select languages..."
                    allowOther={true}
                  />
                  <p className="text-xs text-muted-foreground">जो भाषाएं आप अच्छे से बोलते हैं वो सब चुनें</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residence" className="text-base font-semibold">
                    🏠 घर का पता / Residence Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea id="residence" placeholder="जैसे: 101, शांति अपार्टमेंट, MG रोड, अंधेरी वेस्ट, मुंबई - 400058" value={basicDetails.residenceAddress} onChange={(e) => setBasicDetails(prev => ({ ...prev, residenceAddress: e.target.value }))} rows={2} className="text-base" />
                  <p className="text-xs text-muted-foreground">आपके पास के कस्टमर ढूंढने में मदद करता है — Helps customers find nearby agents</p>
                </div>
              </>
            )}

            {/* PROFESSIONAL DETAILS */}
            {activeSection === 'professional' && (
              <>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-4 flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                      PAN नंबर या IRDAI लाइसेंस नंबर — कोई एक ज़रूरी है
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                      Provide either PAN Number or IRDAI License Number (at least one required)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="pan" className="text-base font-semibold">
                      🪪 PAN नंबर / PAN Number
                    </Label>
                    <Input id="pan" placeholder="जैसे: ABCDE1234F" value={professionalDetails.panNumber} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))} maxLength={10} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">10 अक्षर का PAN नंबर</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license" className="text-base font-semibold">
                      📜 IRDAI लाइसेंस नंबर / License Number
                    </Label>
                    <Input id="license" placeholder="जैसे: IRDA/DB/XXX" value={professionalDetails.licenseNumber} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, licenseNumber: e.target.value }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">IRDAI से मिला हुआ लाइसेंस नंबर</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agency" className="text-base font-semibold">
                    🏢 एजेंसी / कंपनी का नाम (अगर हो)
                  </Label>
                  <Input id="agency" placeholder="जैसे: LIC, HDFC Ergo, ICICI Lombard..." value={professionalDetails.companyName} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, companyName: e.target.value }))} className="h-12 text-base" />
                  <p className="text-xs text-muted-foreground">Agency/Company Name (if any)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="office" className="text-base font-semibold">
                    🏬 ऑफिस का पता / Office Address (अगर हो)
                  </Label>
                  <Textarea id="office" placeholder="जैसे: 201, ट्रेड सेंटर, विले पार्ले, मुंबई" value={professionalDetails.officeAddress} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, officeAddress: e.target.value }))} rows={2} className="text-base" />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    🌆 किन शहरों में सर्विस देते हैं? / Serviceable Cities <span className="text-destructive">*</span>
                  </Label>
                  <MultiSelectDropdown
                    label=""
                    options={CITY_OPTIONS}
                    selected={professionalDetails.serviceableCities}
                    onChange={(cities) => setProfessionalDetails(prev => ({ ...prev, serviceableCities: cities }))}
                    placeholder="शहर चुनें / Select cities..."
                    allowOther={true}
                  />
                  <p className="text-xs text-muted-foreground">जहाँ-जहाँ आप बीमा सर्विस देते हैं वो सब शहर चुनें</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-base font-semibold">
                      📅 कितने साल का अनुभव? / Years of Experience <span className="text-destructive">*</span>
                    </Label>
                    <Input id="experience" type="number" min="0" placeholder="जैसे: 5" value={professionalDetails.yearsExperience} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, yearsExperience: e.target.value }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">बीमा इंडस्ट्री में कुल कितने साल काम किया</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientBase" className="text-base font-semibold">
                      👥 कितने एक्टिव क्लाइंट हैं? / Active Clients <span className="text-destructive">*</span>
                    </Label>
                    <Input id="clientBase" placeholder="जैसे: 500+" value={professionalDetails.clientBase} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, clientBase: e.target.value }))} className="h-12 text-base" />
                    <p className="text-xs text-muted-foreground">आपके पास अभी कितने एक्टिव पॉलिसी होल्डर्स हैं</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-3 p-4 bg-muted/30 rounded-lg">
                  <Switch id="pos" checked={professionalDetails.hasPosLicense} onCheckedChange={(checked) => setProfessionalDetails(prev => ({ ...prev, hasPosLicense: checked }))} />
                  <div>
                    <Label htmlFor="pos" className="cursor-pointer text-base font-semibold">
                      🔖 क्या आपके पास POS लाइसेंस है?
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Do you have POS (Point of Sale) License with any Broker?</p>
                  </div>
                </div>

                <FamilyLicenseManager
                  licenses={professionalDetails.familyLicenses}
                  onChange={(licenses) => setProfessionalDetails(prev => ({ ...prev, familyLicenses: licenses }))}
                />

                {/* Performance Stats Section */}
                <div className="pt-6 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-base">📊 परफॉर्मेंस / Performance Statistics</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    अपना ट्रैक रिकॉर्ड बताएं — कस्टमर का भरोसा बढ़ता है
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="claimsProcessed" className="text-sm font-semibold">📋 कितने क्लेम प्रोसेस किए / Claims Processed</Label>
                      <Input id="claimsProcessed" placeholder="जैसे: 150+" value={professionalDetails.claimsProcessed} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, claimsProcessed: e.target.value }))} className="h-11 text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="claimsSettled" className="text-sm font-semibold">✅ कितने क्लेम सेटल हुए / Claims Settled</Label>
                      <Input id="claimsSettled" type="number" min="0" placeholder="जैसे: 145" value={professionalDetails.claimsSettled} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, claimsSettled: e.target.value }))} className="h-11 text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="claimsAmount" className="text-sm font-semibold">💰 कुल क्लेम राशि / Total Claims Amount</Label>
                      <Input id="claimsAmount" placeholder="जैसे: ₹2.5 करोड़" value={professionalDetails.claimsAmount} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, claimsAmount: e.target.value }))} className="h-11 text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="successRate" className="text-sm font-semibold">🎯 सक्सेस रेट / Success Rate</Label>
                      <Input id="successRate" placeholder="जैसे: 98%" value={professionalDetails.successRate} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, successRate: e.target.value }))} className="h-11 text-base" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="responseTime" className="text-sm font-semibold">⏱️ कितने समय में जवाब देते हैं / Response Time</Label>
                      <Input id="responseTime" placeholder="जैसे: 2 घंटे में, उसी दिन" value={professionalDetails.responseTime} onChange={(e) => setProfessionalDetails(prev => ({ ...prev, responseTime: e.target.value }))} className="h-11 text-base" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* INSURANCE SEGMENTS */}
            {activeSection === 'segments' && (
              <>
                <div className="mb-4">
                  <p className="text-base font-medium mb-1">
                    👇 आप कौन सा बीमा बेचते हैं? टिक करें
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Select the insurance types you sell. Star ratings will appear below for each.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { key: 'health', label: '🏥 Health\nहेल्थ', icon: HeartPulse, color: 'text-emerald-500' },
                    { key: 'life', label: '❤️ Life\nलाइफ', icon: Heart, color: 'text-pink-500' },
                    { key: 'motor', label: '🚗 Motor\nमोटर', icon: Car, color: 'text-blue-500' },
                    { key: 'sme', label: '🏢 SME\nकॉमर्शियल', icon: Building2, color: 'text-orange-500' },
                  ].map((seg) => (
                    <label key={seg.key} className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${insuranceSegments[seg.key as keyof InsuranceSegments] ? 'border-primary bg-primary/5 shadow-sm' : 'border-muted hover:border-primary/50'}`}>
                      <Checkbox
                        checked={insuranceSegments[seg.key as keyof InsuranceSegments]}
                        onCheckedChange={(checked) => setInsuranceSegments(prev => ({ ...prev, [seg.key]: checked === true }))}
                      />
                      <seg.icon className={`h-8 w-8 ${seg.color}`} />
                      <span className="text-sm font-medium text-center whitespace-pre-line">{seg.label}</span>
                    </label>
                  ))}
                </div>

                {/* Expertise Grids */}
                {insuranceSegments.health && (
                  <ExpertiseGrid
                    title="🏥 Health Insurance / हेल्थ बीमा"
                    products={HEALTH_PRODUCTS}
                    values={healthExpertise}
                    onChange={(id, level) => setHealthExpertise(prev => ({ ...prev, [id]: level }))}
                    onAddCustomProduct={(name) => addCustomProduct('health', name)}
                    onRemoveCustomProduct={(id) => removeCustomProduct('health', id)}
                    customProducts={customHealthProducts}
                  />
                )}

                {insuranceSegments.life && (
                  <ExpertiseGrid
                    title="❤️ Life Insurance / लाइफ बीमा"
                    products={LIFE_PRODUCTS}
                    values={lifeExpertise}
                    onChange={(id, level) => setLifeExpertise(prev => ({ ...prev, [id]: level }))}
                    onAddCustomProduct={(name) => addCustomProduct('life', name)}
                    onRemoveCustomProduct={(id) => removeCustomProduct('life', id)}
                    customProducts={customLifeProducts}
                  />
                )}

                {insuranceSegments.motor && (
                  <ExpertiseGrid
                    title="🚗 Motor Insurance / मोटर बीमा"
                    products={MOTOR_PRODUCTS}
                    values={motorExpertise}
                    onChange={(id, level) => setMotorExpertise(prev => ({ ...prev, [id]: level }))}
                    onAddCustomProduct={(name) => addCustomProduct('motor', name)}
                    onRemoveCustomProduct={(id) => removeCustomProduct('motor', id)}
                    customProducts={customMotorProducts}
                  />
                )}

                {insuranceSegments.sme && (
                  <ExpertiseGrid
                    title="🏢 SME / कॉमर्शियल बीमा"
                    products={SME_PRODUCTS}
                    values={smeExpertise}
                    onChange={(id, level) => setSmeExpertise(prev => ({ ...prev, [id]: level }))}
                    onAddCustomProduct={(name) => addCustomProduct('sme', name)}
                    onRemoveCustomProduct={(id) => removeCustomProduct('sme', id)}
                    customProducts={customSmeProducts}
                  />
                )}
              </>
            )}

            {/* PRODUCT PORTFOLIO */}
            {activeSection === 'portfolio' && (
              <>
                <div className="mb-4">
                  <p className="text-base font-medium mb-1">
                    🏢 आप किन कंपनियों के साथ काम करते हैं?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Define your company partnerships — किस कंपनी के प्रोडक्ट बेचते हैं
                  </p>
                </div>
                {selectedSegments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Please select at least one insurance segment first</p>
                    <Button variant="outline" className="mt-3" onClick={() => setActiveSection('segments')}>
                      Go to Segments
                    </Button>
                  </div>
                ) : (
                  <ProductPortfolioManager
                    segments={selectedSegments}
                    values={productPortfolio}
                    onChange={handlePortfolioChange}
                  />
                )}
              </>
            )}

            {/* ADDITIONAL DETAILS */}
            {activeSection === 'additional' && (
              <>
                {/* Gallery Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      📸 अचीवमेंट फोटो / Achievement Photos
                      <Badge variant="secondary" className="text-xs">{additionalDetails.galleryImages.length}/10</Badge>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={isUploadingGallery || additionalDetails.galleryImages.length >= 10}
                      className="h-10"
                    >
                      {isUploadingGallery ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      <span className="ml-1">Upload</span>
                    </Button>
                    <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    अवॉर्ड्स, सर्टिफिकेट, ऑफिस फोटो अपलोड करें — Awards, certificates, office photos
                  </p>

                  {additionalDetails.galleryImages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {additionalDetails.galleryImages.map((img, idx) => (
                        <GalleryImageCard
                          key={idx}
                          image={img}
                          onRemove={() => removeGalleryImage(img.url)}
                          onCaptionChange={(caption) => updateGalleryCaption(img.url, caption)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="font-semibold text-base flex items-center gap-2">
                    🌐 डिजिटल प्रेज़ेंस / Online Profiles (ऑप्शनल)
                  </h4>
                  <p className="text-sm text-muted-foreground">अगर आपकी वेबसाइट या सोशल मीडिया है तो यहाँ डालें — Add your online links</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">🌍 Website</Label>
                      <Input placeholder="https://yourwebsite.com" value={additionalDetails.website} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, website: e.target.value }))} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">📍 Google Business Profile</Label>
                      <Input placeholder="Google Maps URL" value={additionalDetails.googleBusiness} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, googleBusiness: e.target.value }))} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">💼 LinkedIn</Label>
                      <Input placeholder="LinkedIn profile URL" value={additionalDetails.linkedin} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, linkedin: e.target.value }))} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">📷 Instagram</Label>
                      <Input placeholder="Instagram profile URL" value={additionalDetails.instagram} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, instagram: e.target.value }))} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">📘 Facebook</Label>
                      <Input placeholder="Facebook page URL" value={additionalDetails.facebook} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, facebook: e.target.value }))} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">🎬 YouTube</Label>
                      <Input placeholder="YouTube channel URL" value={additionalDetails.youtube} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, youtube: e.target.value }))} className="h-11" />
                    </div>
                  </div>
                </div>

                {/* Career Timeline Section */}
                <div className="space-y-4 pt-4">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    🏆 करियर टाइमलाइन / Career Timeline
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    अपनी उपलब्धियां जोड़ें — MDRT, अवॉर्ड्स, सर्टिफिकेट, माइलस्टोन आदि
                  </p>
                  <CareerTimelineManager
                    entries={additionalDetails.careerTimeline}
                    onChange={(entries) => setAdditionalDetails(prev => ({ ...prev, careerTimeline: entries }))}
                    maxEntries={10}
                  />
                </div>

                {/* Bio / Summary */}
                <div className="space-y-2 pt-4">
                  <Label htmlFor="highlights" className="flex items-center gap-2 text-base font-semibold">
                    ✍️ अपने बारे में लिखें / Professional Bio
                  </Label>
                  <p className="text-xs text-muted-foreground">कस्टमर को आपके बारे में बताने के लिए — Brief summary about your expertise</p>
                  <Textarea id="highlights" placeholder="जैसे: मैं पिछले 10 साल से LIC एजेंट हूँ। हेल्थ और लाइफ इन्शुरेंस में माहिर हूँ..." value={additionalDetails.careerHighlights} onChange={(e) => setAdditionalDetails(prev => ({ ...prev, careerHighlights: e.target.value }))} rows={4} className="text-base" />
                </div>
              </>
            )}

            {/* LEAD PREFERENCES */}
            {activeSection === 'leads' && (
              <LeadPreferences
                yearsExperience={yearsExp}
                wantsNewBusinessLeads={wantsNewBusinessLeads}
                newBusinessLeadCharging={newBusinessLeadCharging}
                newBusinessLeadAmount={newBusinessLeadAmount}
                wantsPortfolioLeads={wantsPortfolioLeads}
                portfolioLeadCharging={portfolioLeadCharging}
                portfolioLeadAmount={portfolioLeadAmount}
                wantsClaimsLeads={wantsClaimsLeads}
                claimsLeadCharging={claimsLeadCharging}
                claimsLeadAmount={claimsLeadAmount}
                onNewBusinessLeadsChange={setWantsNewBusinessLeads}
                onNewBusinessChargingChange={setNewBusinessLeadCharging}
                onNewBusinessAmountChange={setNewBusinessLeadAmount}
                onPortfolioLeadsChange={setWantsPortfolioLeads}
                onPortfolioChargingChange={setPortfolioLeadCharging}
                onPortfolioAmountChange={setPortfolioLeadAmount}
                onClaimsLeadsChange={setWantsClaimsLeads}
                onClaimsChargingChange={setClaimsLeadCharging}
                onClaimsAmountChange={setClaimsLeadAmount}
              />
            )}

            {/* DECLARATIONS */}
            {activeSection === 'declarations' && (
              <DeclarationsConsent
                accepted={declarationsAccepted}
                onAcceptChange={setDeclarationsAccepted}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons - Mobile optimized sticky footer */}
        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t sm:relative sm:border-t-0 sm:bg-transparent sm:backdrop-blur-none -mx-4 px-4 py-3 sm:mx-0 sm:px-0 sm:py-0 z-10">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              size="default"
              onClick={goPrev} 
              disabled={!canGoPrev}
              className="h-11 sm:h-12 text-sm sm:text-base px-4"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              <span>पीछे</span>
            </Button>

            <div className="flex gap-2">
              {/* Preview Button */}
              <AgentProfilePreview
                data={{
                  basicDetails,
                  professionalDetails,
                  insuranceSegments,
                  additionalDetails,
                }}
                trigger={
                  <Button variant="outline" size="default" className="gap-1.5 h-11 sm:h-12 text-sm sm:text-base px-4">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Preview</span>
                  </Button>
                }
              />

              {activeSection === 'declarations' && (
                <Button 
                  size="default"
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !declarationsAccepted || !isBasicComplete || !isProfessionalComplete || !isSegmentsComplete}
                  className="h-11 sm:h-12 text-sm sm:text-base px-5"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" />}
                  <span>सेव करें ✅</span>
                </Button>
              )}
              {canGoNext && (
                <Button 
                  size="default"
                  onClick={goNext}
                  className="h-11 sm:h-12 text-sm sm:text-base px-5"
                >
                  आगे बढ़ें
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
        {/* Spacer for mobile sticky footer */}
        <div className="h-4 sm:hidden" />
      </div>
      
    </div>
  );
};

export default AgentProfileSetup;
