import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, CheckCircle, Shield, Phone, Clock, MapPin, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardPreviewProps {
  agent: {
    name: string;
    image: string;
    experience: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    irdaLicensed: boolean;
    specializations: string[];
    stats: {
      clientsServed: string;
      claimsSettled: number;
      responseTime: string;
    };
    bio: string;
  };
}

const AgentCardPreview: React.FC<AgentCardPreviewProps> = ({ agent }) => {
  return (
    <Card className="overflow-hidden border-2 border-primary/20 shadow-lg max-w-sm mx-auto">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-md">
            <AvatarImage src={agent.image} alt={agent.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {agent.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-foreground truncate">{agent.name}</h3>
              {agent.verified && <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-foreground">{agent.rating}</span>
              <span className="text-xs text-muted-foreground">({agent.reviewCount})</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{agent.experience} experience</p>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Specializations */}
        <div className="flex flex-wrap gap-1.5">
          {agent.specializations.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="text-[10px] px-2 py-0.5">
              <Shield className="h-2.5 w-2.5 mr-1" />
              {spec}
            </Badge>
          ))}
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-sm font-bold text-primary">{agent.stats.clientsServed}</div>
            <div className="text-[10px] text-muted-foreground">Clients</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-sm font-bold text-primary">{agent.stats.claimsSettled}</div>
            <div className="text-[10px] text-muted-foreground">Claims</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-sm font-bold text-primary">{agent.stats.responseTime}</div>
            <div className="text-[10px] text-muted-foreground">Response</div>
          </div>
        </div>

        {/* IRDAI Badge */}
        {agent.irdaLicensed && (
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-md px-2.5 py-1.5">
            <Award className="h-3.5 w-3.5" />
            <span className="font-medium">IRDAI Licensed Agent</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentCardPreview;
