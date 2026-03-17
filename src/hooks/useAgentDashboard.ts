import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { leadSchema, type LeadInput } from '@/lib/validation';

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  product_interest: string | null;
  location: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentProfile {
  id: string;
  license_number: string | null;
  location: string | null;
  bio: string | null;
  specializations: string[] | null;
  years_experience: number;
  subscription_plan: string;
  subscription_expires_at: string | null;
  is_profile_approved: boolean;
  cover_page: string | null;
}

export interface AgentAnalytics {
  total_page_views: number;
  total_profile_clicks: number;
  total_contact_requests: number;
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  followup: number;
  closed: number;
}

export function useAgentDashboard() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [analytics, setAnalytics] = useState<AgentAnalytics>({
    total_page_views: 0,
    total_profile_clicks: 0,
    total_contact_requests: 0,
  });
  const [leadStats, setLeadStats] = useState<LeadStats>({
    total: 0,
    new: 0,
    contacted: 0,
    followup: 0,
    closed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeads(data || []);

      // Calculate lead stats
      const stats: LeadStats = {
        total: data?.length || 0,
        new: data?.filter(l => l.status === 'new').length || 0,
        contacted: data?.filter(l => l.status === 'contacted').length || 0,
        followup: data?.filter(l => l.status === 'followup').length || 0,
        closed: data?.filter(l => l.status === 'closed').length || 0,
      };
      setLeadStats(stats);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err.message);
    }
  };

  const fetchAgentProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setAgentProfile(data);
    } catch (err: any) {
      console.error('Error fetching agent profile:', err);
      setError(err.message);
    }
  };

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agent_analytics')
        .select('page_views, profile_clicks, contact_requests')
        .eq('agent_id', user.id);

      if (error) throw error;

      // Sum up all analytics
      const totals = (data || []).reduce(
        (acc, row) => ({
          total_page_views: acc.total_page_views + (row.page_views || 0),
          total_profile_clicks: acc.total_profile_clicks + (row.profile_clicks || 0),
          total_contact_requests: acc.total_contact_requests + (row.contact_requests || 0),
        }),
        { total_page_views: 0, total_profile_clicks: 0, total_contact_requests: 0 }
      );

      setAnalytics(totals);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      // Don't set error for analytics - it's optional data
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    if (!user) return;

    // Validate status
    const validStatuses = ['new', 'contacted', 'followup', 'closed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid status value');
    }

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId)
        .eq('agent_id', user.id);

      if (error) throw error;

      // Refresh leads after update
      await fetchLeads();
    } catch (err: any) {
      console.error('Error updating lead status:', err);
      throw err;
    }
  };

  const addLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    // Validate lead data with zod schema
    const validationResult = leadSchema.safeParse({
      name: leadData.name,
      email: leadData.email || '',
      phone: leadData.phone || '',
      product_interest: leadData.product_interest || '',
      location: leadData.location || '',
      notes: leadData.notes || '',
      status: leadData.status || 'new',
    });

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0]?.message || 'Invalid input';
      throw new Error(errorMessage);
    }

    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          agent_id: user.id,
          name: validationResult.data.name,
          email: validationResult.data.email || null,
          phone: validationResult.data.phone || null,
          product_interest: validationResult.data.product_interest || null,
          location: validationResult.data.location || null,
          notes: validationResult.data.notes || null,
          status: validationResult.data.status,
        });

      if (error) throw error;

      // Refresh leads after adding
      await fetchLeads();
    } catch (err: any) {
      console.error('Error adding lead:', err);
      throw err;
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)
        .eq('agent_id', user.id);

      if (error) throw error;

      // Refresh leads after deleting
      await fetchLeads();
    } catch (err: any) {
      console.error('Error deleting lead:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchLeads(), fetchAgentProfile(), fetchAnalytics()]);
      setIsLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  return {
    leads,
    agentProfile,
    analytics,
    leadStats,
    isLoading,
    error,
    updateLeadStatus,
    addLead,
    deleteLead,
    refreshLeads: fetchLeads,
  };
}
