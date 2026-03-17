import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, User, Mail, Phone, Shield } from 'lucide-react';
import { z } from 'zod';

const seekerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email').max(255),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code').optional().or(z.literal('')),
});

interface SeekerDetailsPopupProps {
  isOpen: boolean;
  onSubmit: (data: { name: string; email: string; phone: string; pincode: string; useGps: boolean }) => void;
}

const SEEKER_STORAGE_KEY = 'seekerDetails';

export const getSavedSeekerDetails = () => {
  try {
    const saved = localStorage.getItem(SEEKER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Valid for 7 days
      if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

export const saveSeekerDetails = (data: { name: string; email: string; phone: string; pincode: string }) => {
  localStorage.setItem(SEEKER_STORAGE_KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
};

const SeekerDetailsPopup: React.FC<SeekerDetailsPopupProps> = ({ isOpen, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [useGps, setUseGps] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = seekerSchema.safeParse({ name, email, phone, pincode: useGps ? '' : pincode });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!useGps && !pincode) {
      setErrors({ pincode: 'Please enter PIN code or use GPS' });
      return;
    }

    saveSeekerDetails({ name, email, phone, pincode });
    onSubmit({ name, email, phone, pincode, useGps });
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, pincode: 'GPS not supported on this device' }));
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setUseGps(true);
        setPincode('');
        setGpsLoading(false);
        setErrors(prev => { const { pincode: _, ...rest } = prev; return rest; });
      },
      () => {
        setGpsLoading(false);
        setErrors(prev => ({ ...prev, pincode: 'GPS access denied. Please enter PIN code.' }));
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md mx-auto rounded-2xl border-0 shadow-2xl bg-card p-0 overflow-hidden [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4 sm:px-6 sm:py-5">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-primary-foreground flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Find Your Insurance Agent
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-xs sm:text-sm mt-1">
              Share your details so we can match you with the best agents near you
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 sm:px-6 sm:py-5 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="seeker-name" className="text-xs font-semibold flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="seeker-name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              maxLength={100}
            />
            {errors.name && <p className="text-destructive text-[11px]">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="seeker-email" className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" />
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="seeker-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              maxLength={255}
            />
            {errors.email && <p className="text-destructive text-[11px]">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="seeker-phone" className="text-xs font-semibold flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" />
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                +91
              </span>
              <Input
                id="seeker-phone"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="h-11 rounded-l-none"
                maxLength={10}
              />
            </div>
            {errors.phone && <p className="text-destructive text-[11px]">{errors.phone}</p>}
          </div>

          {/* PIN / GPS */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Your Location <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter 6-digit PIN code"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setUseGps(false);
                }}
                className={`h-11 flex-1 ${useGps ? 'opacity-50' : ''}`}
                maxLength={6}
                disabled={useGps}
              />
              <Button
                type="button"
                variant={useGps ? 'default' : 'outline'}
                className="h-11 px-3 flex-shrink-0"
                onClick={handleUseGps}
                disabled={gpsLoading}
              >
                <Navigation className={`h-4 w-4 mr-1.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                {gpsLoading ? 'Getting...' : useGps ? 'GPS ✓' : 'Use GPS'}
              </Button>
            </div>
            {errors.pincode && <p className="text-destructive text-[11px]">{errors.pincode}</p>}
            {useGps && <p className="text-accent text-[11px] font-medium">📍 GPS location will be used</p>}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-bold cta-glow tap-feedback shadow-lg"
          >
            Find Agents Near Me
          </Button>

          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            🔒 Your details are secure and only used to match you with verified agents.
            By continuing, you agree to our Terms of Service.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SeekerDetailsPopup;
