import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Calendar, ChevronUp, Phone, UserPlus, Users, Star, Activity, MessageSquare, Image as ImageIcon, Trash2, User, Edit, Lightbulb, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Loader2, Download, Eye, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentDashboard, Lead } from '@/hooks/useAgentDashboard';
import { useAgentProfileCompletion } from '@/hooks/useAgentProfileCompletion';
import AgentGalleryManager, { GalleryImage } from '@/components/AgentGalleryManager';
import IncompleteProfilePopup from '@/components/IncompleteProfilePopup';
import { toast } from '@/components/ui/sonner';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import AgentAnalyticsDashboard from '@/components/AgentAnalyticsDashboard';
import AgentVisibilityToggles from '@/components/AgentVisibilityToggles';
import NotificationBell from '@/components/NotificationBell';

const AgentDashboard = () => {
  const { user } = useAuth();
  const { 
    leads, 
    agentProfile, 
    analytics, 
    leadStats, 
    isLoading, 
    updateLeadStatus, 
    addLead,
    deleteLead,
    refreshLeads 
  } = useAgentDashboard();

  const {
    profile: fullProfile,
    sections: profileSections,
    completionPercentage,
    tips,
    isProfileComplete,
    hasCompletedSetup,
    isLoading: profileLoading,
  } = useAgentProfileCompletion();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [showIncompletePopup, setShowIncompletePopup] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    product_interest: '',
    location: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show incomplete profile popup on first load if profile is incomplete
  useEffect(() => {
    if (!profileLoading && !isProfileComplete && user) {
      // Check if we've shown the popup recently (within 24 hours)
      const lastShown = localStorage.getItem(`profile_popup_${user.id}`);
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      
      if (!lastShown || parseInt(lastShown) < oneDayAgo) {
        setShowIncompletePopup(true);
        localStorage.setItem(`profile_popup_${user.id}`, now.toString());
      }
    }
  }, [profileLoading, isProfileComplete, user]);

  const handleClosePopup = () => {
    setShowIncompletePopup(false);
  };

  // Get all missing fields for popup
  const allMissingFields = profileSections.flatMap(s => s.missingFields);

  const agentPlanType: 'starter' | 'professional' = agentProfile?.subscription_plan === 'professional' ? 'professional' : 'starter';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseLeadNotes = (notes: string | null) => {
    if (!notes) return { contactMethod: '', filters: [] as string[] };
    const parts = notes.split(' | ');
    const contactMethod = parts[0] || '';
    const filters = parts.slice(1);
    return { contactMethod, filters };
  };

  const exportLeadsToExcel = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Product Interest', 'Status', 'Purpose / Filters', 'Contact Method', 'Date & Time'];
    const rows = leads.map(l => {
      const { contactMethod, filters } = parseLeadNotes(l.notes);
      return [
        l.name,
        l.email || '',
        l.phone || '',
        l.location || '',
        l.product_interest || '',
        l.status,
        filters.join(', '),
        contactMethod,
        new Date(l.created_at).toLocaleString('en-IN'),
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      toast.success('Lead status updated');
    } catch (error) {
      toast.error('Failed to update lead status');
    }
  };

  const handleAddLead = async () => {
    if (!newLead.name.trim()) {
      toast.error('Lead name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await addLead({
        name: newLead.name,
        email: newLead.email || null,
        phone: newLead.phone || null,
        product_interest: newLead.product_interest || null,
        location: newLead.location || null,
        notes: newLead.notes || null,
        status: 'new',
      });
      toast.success('Lead added successfully');
      setIsAddLeadOpen(false);
      setNewLead({ name: '', email: '', phone: '', product_interest: '', location: '', notes: '' });
    } catch (error) {
      toast.error('Failed to add lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      toast.success('Lead deleted');
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  // Calculate performance metrics from real data
  const performanceData = {
    leadConversion: leadStats.total > 0 ? Math.round((leadStats.closed / leadStats.total) * 100) : 0,
    activeClients: leadStats.closed,
    renewalRate: 0, // Would need renewals data
    totalPageViews: analytics.total_page_views,
    totalContactRequests: analytics.total_contact_requests,
    targetCompletion: Math.min(100, Math.round((leadStats.closed / 10) * 100)), // Assuming target of 10
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please log in to view your agent dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-gray-50 pt-20 sm:pt-24 pb-10 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <Badge className="ml-2 bg-secondary text-secondary-foreground">
                    {agentPlanType === 'professional' ? 'Professional' : 'Starter'} Plan
                  </Badge>
                </div>
                <p className="text-gray-500">
                  Insurance Agent {agentProfile?.location ? `• ${agentProfile.location}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <NotificationBell />
              <Button variant="outline" asChild>
                <Link to={`/agent/${user.id}`}>View My Profile</Link>
              </Button>
              <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary">
                    <UserPlus className="h-4 w-4 mr-1" /> Add Lead
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                    <DialogDescription>
                      Enter the details of your new potential client
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="leadName">Name *</Label>
                      <Input
                        id="leadName"
                        value={newLead.name}
                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                        placeholder="Lead name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="leadEmail">Email</Label>
                        <Input
                          id="leadEmail"
                          type="email"
                          value={newLead.email}
                          onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="leadPhone">Phone</Label>
                        <Input
                          id="leadPhone"
                          value={newLead.phone}
                          onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="leadProduct">Product Interest</Label>
                        <Select
                          value={newLead.product_interest}
                          onValueChange={(value) => setNewLead({ ...newLead, product_interest: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                            <SelectItem value="Term Insurance">Term Insurance</SelectItem>
                            <SelectItem value="Motor Insurance">Motor Insurance</SelectItem>
                            <SelectItem value="Travel Insurance">Travel Insurance</SelectItem>
                            <SelectItem value="Home Insurance">Home Insurance</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="leadLocation">Location</Label>
                        <Input
                          id="leadLocation"
                          value={newLead.location}
                          onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                          placeholder="City, Area"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leadNotes">Notes</Label>
                      <Input
                        id="leadNotes"
                        value={newLead.notes}
                        onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddLead} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                      Add Lead
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              <TabsList className="inline-flex w-max sm:w-auto min-w-full sm:min-w-0 bg-white gap-1 p-1">
                <TabsTrigger value="overview" className="flex-shrink-0 text-xs sm:text-sm px-2.5 sm:px-3">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-1 flex-shrink-0 text-xs sm:text-sm px-2.5 sm:px-3">
                  <User className="h-3 w-3" />
                  <span className="hidden xs:inline">My </span>Profile
                </TabsTrigger>
                <TabsTrigger value="leads" className="flex-shrink-0 text-xs sm:text-sm px-2.5 sm:px-3">
                  Leads ({leadStats.total})
                </TabsTrigger>
                <TabsTrigger value="clients" className="flex-shrink-0 text-xs sm:text-sm px-2.5 sm:px-3">
                  Clients
                </TabsTrigger>
                <TabsTrigger value="renewals" className="flex-shrink-0 text-xs sm:text-sm px-2.5 sm:px-3">
                  Renewals
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex items-center gap-1 flex-shrink-0 text-xs sm:text-sm px-2.5 sm:px-3">
                  <ImageIcon className="h-3 w-3" />
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-1 flex-shrink-0 text-xs sm:text-sm px-2.5 sm:px-3">
                  <Eye className="h-3 w-3" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="visibility" className="flex items-center gap-1 flex-shrink-0 text-xs sm:text-sm px-2.5 sm:px-3">
                  <Settings className="h-3 w-3" />
                  Visibility
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Lead Conversion Rate</span>
                          <span className="text-sm font-medium">{performanceData.leadConversion}%</span>
                        </div>
                        <Progress value={performanceData.leadConversion} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Monthly Target</span>
                          <span className="text-sm font-medium">{performanceData.targetCompletion}%</span>
                        </div>
                        <Progress value={performanceData.targetCompletion} className="h-2" />
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Page Views</span>
                          <span className="font-medium">{performanceData.totalPageViews}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-muted-foreground">Contact Requests</span>
                          <span className="font-medium">{performanceData.totalContactRequests}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Lead Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <UserPlus className="h-5 w-5 text-primary" />
                          <Badge variant="secondary">{leadStats.new}</Badge>
                        </div>
                        <div className="mt-2">
                          <div className="text-2xl font-bold">{leadStats.new}</div>
                          <div className="text-xs text-gray-500">New Leads</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <Users className="h-5 w-5 text-primary" />
                          <Badge variant="secondary">{leadStats.contacted}</Badge>
                        </div>
                        <div className="mt-2">
                          <div className="text-2xl font-bold">{leadStats.contacted}</div>
                          <div className="text-xs text-gray-500">Contacted</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <Activity className="h-5 w-5 text-primary" />
                          <Badge variant="secondary">{leadStats.followup}</Badge>
                        </div>
                        <div className="mt-2">
                          <div className="text-2xl font-bold">{leadStats.followup}</div>
                          <div className="text-xs text-gray-500">Follow-up</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          <Badge variant="secondary">{leadStats.closed}</Badge>
                        </div>
                        <div className="mt-2">
                          <div className="text-2xl font-bold">{leadStats.closed}</div>
                          <div className="text-xs text-gray-500">Closed</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Sales Insights</CardTitle>
                      <BarChart className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm font-medium">Total Leads</div>
                          <div className="text-2xl font-bold">{leadStats.total}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Active</div>
                          <div className="text-2xl font-bold">{leadStats.new + leadStats.contacted + leadStats.followup}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Closed</div>
                          <div className="text-2xl font-bold">{leadStats.closed}</div>
                        </div>
                      </div>
                      {leadStats.total === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">No leads yet</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-2"
                            onClick={() => setIsAddLeadOpen(true)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" /> Add Your First Lead
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Leads */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Recent Leads</CardTitle>
                      <CardDescription>Your latest potential clients</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('leads')}>
                      View All Leads
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {leads.length > 0 ? (
                    <div className="space-y-4">
                      {leads.slice(0, 5).map(lead => (
                        <div key={lead.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {lead.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{lead.name}</h4>
                              <p className="text-sm text-gray-500">
                                {lead.product_interest || 'No product specified'}
                                {lead.location && ` • ${lead.location}`}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Added: {formatDate(lead.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={lead.status}
                              onValueChange={(value) => handleStatusChange(lead.id, value)}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="followup">Follow-up</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            {lead.phone && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={`tel:${lead.phone}`}>
                                  <Phone className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No leads yet. Start adding potential clients!</p>
                      <Button onClick={() => setIsAddLeadOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-1" /> Add Your First Lead
                      </Button>
                    </div>
                  )}
                </CardContent>
                {leads.length > 5 && (
                  <CardFooter className="bg-gray-50 border-t">
                    <div className="flex items-center justify-between w-full text-sm">
                      <span className="text-gray-500">Showing 5 of {leads.length} leads</span>
                      <Button variant="link" className="text-primary p-0 h-auto" onClick={() => setActiveTab('leads')}>
                        View All
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            {/* My Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              {/* Profile Completion Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Profile Completion
                        {isProfileComplete ? (
                          <Badge className="bg-green-500">Complete</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-600">
                            {completionPercentage}%
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {isProfileComplete 
                          ? 'Your profile is complete! You\'re visible to potential clients.'
                          : 'Complete your profile to improve visibility and receive more leads'
                        }
                      </CardDescription>
                    </div>
                    <Button asChild>
                      <Link to="/agent-profile-setup">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Profile
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Overall Progress</span>
                        <span className="font-bold text-primary">{completionPercentage}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-3" />
                    </div>
                    
                    {/* Section breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                      {profileSections.map((section) => (
                        <Link
                          key={section.id}
                          to="/agent-profile-setup"
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] block ${
                            section.isComplete 
                              ? 'bg-green-50 border-green-200 hover:border-green-300' 
                              : 'bg-amber-50 border-amber-200 hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {section.isComplete ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-600" />
                            )}
                            <span className="text-sm font-medium">{section.title}</span>
                            <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                          </div>
                          {!section.isComplete && section.missingFields.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1 ml-6">
                              Missing: {section.missingFields.slice(0, 2).join(', ')}
                              {section.missingFields.length > 2 && ` +${section.missingFields.length - 2} more`}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Preview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile Information</CardTitle>
                  <CardDescription>Information visible to potential clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2">
                          <AvatarImage src={fullProfile?.avatarUrl} />
                          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                            {fullProfile?.fullName?.charAt(0) || user?.name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {fullProfile?.displayName || fullProfile?.fullName || user?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {fullProfile?.yearsExperience ? `${fullProfile.yearsExperience} years experience` : 'Experience not set'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {fullProfile?.residenceAddress || 'Location not set'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Contact</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>📧 {fullProfile?.email || 'Not set'}</p>
                          <p>📱 {fullProfile?.phone || 'Not set'}</p>
                          {fullProfile?.whatsappNumber && <p>💬 {fullProfile.whatsappNumber}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Languages</h4>
                        <div className="flex flex-wrap gap-1">
                          {fullProfile?.languages?.length ? (
                            fullProfile.languages.map((lang) => (
                              <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Not set</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Insurance Segments</h4>
                        <div className="flex flex-wrap gap-1">
                          {fullProfile?.insuranceSegments?.length ? (
                            fullProfile.insuranceSegments.map((seg) => (
                              <Badge key={seg} className="capitalize">{seg}</Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Not selected</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Serviceable Cities</h4>
                        <div className="flex flex-wrap gap-1">
                          {fullProfile?.serviceableCities?.length ? (
                            fullProfile.serviceableCities.map((city) => (
                              <Badge key={city} variant="outline" className="text-xs">{city}</Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Not set</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Company</h4>
                        <p className="text-sm text-muted-foreground">
                          {fullProfile?.companyName || 'Not set'}
                        </p>
                      </div>

                      {fullProfile?.bio && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Bio</h4>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {fullProfile.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips & Tools Card */}
              {tips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      Tips & Tools to Improve Your Profile
                    </CardTitle>
                    <CardDescription>
                      Follow these suggestions to get more leads
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tips.slice(0, 5).map((tip) => (
                        <div 
                          key={tip.id}
                          className={`p-4 rounded-lg border ${
                            tip.priority === 'high' 
                              ? 'bg-red-50 border-red-200' 
                              : tip.priority === 'medium'
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {tip.priority === 'high' && (
                                  <Badge variant="destructive" className="text-xs">High Priority</Badge>
                                )}
                                {tip.priority === 'medium' && (
                                  <Badge className="bg-amber-500 text-xs">Recommended</Badge>
                                )}
                                {tip.priority === 'low' && (
                                  <Badge variant="secondary" className="text-xs">Optional</Badge>
                                )}
                                <h4 className="font-medium text-sm">{tip.title}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">{tip.description}</p>
                            </div>
                            {tip.actionLabel && (
                              <Button size="sm" variant="outline" asChild>
                                <Link to="/agent-profile-setup">
                                  {tip.actionLabel}
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Performance</CardTitle>
                  <CardDescription>How your profile is performing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{analytics.total_page_views}</div>
                      <div className="text-sm text-muted-foreground">Profile Views</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{analytics.total_contact_requests}</div>
                      <div className="text-sm text-muted-foreground">Contact Requests</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{leadStats.total}</div>
                      <div className="text-sm text-muted-foreground">Total Leads</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Leads Tab - Full Leads Management */}
            <TabsContent value="leads" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Leads Management</CardTitle>
                      <CardDescription>Track and manage all your potential clients</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {leads.length > 0 && (
                        <Button variant="outline" size="sm" onClick={exportLeadsToExcel} className="gap-1.5">
                          <Download className="h-4 w-4" /> Export
                        </Button>
                      )}
                      <Button onClick={() => setIsAddLeadOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-1" /> Add Lead
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {leads.length > 0 ? (
                    <div className="space-y-4">
                      {leads.map(lead => {
                        const { contactMethod, filters } = parseLeadNotes(lead.notes);
                        return (
                          <div key={lead.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {lead.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{lead.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {lead.email || 'No email'} • {lead.phone || 'No phone'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {lead.product_interest || 'No product specified'}
                                  {lead.location && ` • 📍 ${lead.location}`}
                                </p>
                                {contactMethod && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    📞 {contactMethod}
                                  </p>
                                )}
                                {filters.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {filters.map((f, i) => (
                                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                                        {f}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  🕐 {formatDate(lead.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Select
                                value={lead.status}
                                onValueChange={(value) => handleStatusChange(lead.id, value)}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="followup">Follow-up</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                              {lead.phone && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`tel:${lead.phone}`}>
                                    <Phone className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteLead(lead.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No leads yet. Start adding potential clients!</p>
                      <Button onClick={() => setIsAddLeadOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-1" /> Add Your First Lead
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="clients" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Client Management</CardTitle>
                  <CardDescription>Manage your existing clients and their policies</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="py-4 text-center text-gray-500">
                    Client management will show your closed leads as clients. Mark leads as "Closed" to see them here.
                  </p>
                  {leads.filter(l => l.status === 'closed').length > 0 ? (
                    <div className="space-y-4 mt-4">
                      {leads.filter(l => l.status === 'closed').map(client => (
                        <div key={client.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {client.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{client.name}</h4>
                              <p className="text-sm text-gray-500">
                                {client.product_interest || 'No product specified'}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-500">Client</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      No clients yet. Close some leads to see them here.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="renewals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Policy Renewals</CardTitle>
                  <CardDescription>Track and manage upcoming policy renewals</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="py-4 text-center text-gray-500">
                    Policy renewal tracking will be implemented in the next phase.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="gallery" className="space-y-4">
              <AgentGalleryManager
                agentId={user?.id || '1'}
                planType={agentPlanType}
                images={galleryImages}
                onImagesUpdate={setGalleryImages}
              />
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <AgentAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="visibility" className="space-y-4">
              <AgentVisibilityToggles />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      

      {/* Incomplete Profile Popup */}
      <IncompleteProfilePopup
        isOpen={showIncompletePopup}
        onClose={handleClosePopup}
        completionPercentage={completionPercentage}
        missingItems={allMissingFields}
      />
    </div>
  );
};

export default AgentDashboard;
