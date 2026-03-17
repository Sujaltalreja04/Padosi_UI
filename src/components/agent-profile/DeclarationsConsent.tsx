import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, AlertTriangle } from 'lucide-react';

interface DeclarationsConsentProps {
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
}

const DECLARATIONS = [
  {
    id: 'self-declared',
    text: 'All information provided is self-declared and accurate to the best of my knowledge',
  },
  {
    id: 'leads-not-guaranteed',
    text: 'Leads are not guaranteed and depend on customer preferences and search criteria',
  },
  {
    id: 'facilitation-only',
    text: 'PadosiAgent is a facilitation platform only and does not guarantee any business',
  },
  {
    id: 'no-commission',
    text: 'PadosiAgent does not charge any commission on policies sold or claims processed',
  },
  {
    id: 'jurisdiction',
    text: 'Any disputes shall be subject to the jurisdiction of courts in Ahmedabad, Gujarat',
  },
];

const DeclarationsConsent: React.FC<DeclarationsConsentProps> = ({
  accepted,
  onAcceptChange,
}) => {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Declarations & Consent</CardTitle>
        </div>
        <CardDescription>
          Please review and accept the following declarations to complete your profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            By proceeding, you acknowledge that you have read and understood all the terms below.
          </p>
        </div>

        <div className="space-y-3 py-2">
          {DECLARATIONS.map((declaration) => (
            <div key={declaration.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{declaration.text}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="accept-all"
              checked={accepted}
              onCheckedChange={(checked) => onAcceptChange(checked === true)}
              className="mt-1"
            />
            <Label
              htmlFor="accept-all"
              className="text-sm font-medium cursor-pointer leading-relaxed"
            >
              I have read, understood, and agree to all the above declarations and the{' '}
              <a href="/terms" className="text-primary underline" target="_blank">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary underline" target="_blank">
                Privacy Policy
              </a>
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeclarationsConsent;
