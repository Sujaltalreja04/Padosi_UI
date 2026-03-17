import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AgentSearchProvider } from "@/contexts/AgentSearchContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleRestrictedRoute from "@/components/RoleRestrictedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AgentsListing from "./pages/AgentsListing";
import AgentProfile from "./pages/AgentProfile";
import AgentProfileSetup from "./pages/AgentProfileSetup";
import ClientDashboard from "./pages/ClientDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import DistributorDashboard from "./pages/DistributorDashboard";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import ClaimAssistance from "./pages/ClaimAssistance";
import Calculators from "./pages/Calculators";
import BlacklistedAgents from "./pages/BlacklistedAgents";
import NotFound from "./pages/NotFound";
import FAQPage from "./pages/FAQPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CityLanding from "./pages/CityLanding";
import CityIndex from "./pages/CityIndex";
import InsuranceTypeLanding from "./pages/InsuranceTypeLanding";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AgentSearchProvider>
          <Routes>
            <Route path="/" element={<RoleRestrictedRoute><Index /></RoleRestrictedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/agents" element={<RoleRestrictedRoute><AgentsListing /></RoleRestrictedRoute>} />
            <Route path="/agent/:id" element={<RoleRestrictedRoute><AgentProfile /></RoleRestrictedRoute>} />
            
            {/* Protected Routes */}
            <Route 
              path="/client-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agent-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['agent', 'admin']}>
                  <AgentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agent-profile-setup" 
              element={
                <ProtectedRoute allowedRoles={['agent', 'admin']}>
                  <AgentProfileSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/distributor-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['distributor', 'admin']}>
                  <DistributorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/blog" element={<RoleRestrictedRoute><Blog /></RoleRestrictedRoute>} />
            <Route path="/blog/:id" element={<RoleRestrictedRoute><BlogArticle /></RoleRestrictedRoute>} />
            <Route path="/about" element={<RoleRestrictedRoute><AboutUs /></RoleRestrictedRoute>} />
            <Route path="/contact" element={<RoleRestrictedRoute><ContactUs /></RoleRestrictedRoute>} />
            <Route path="/claim-assistance" element={<RoleRestrictedRoute><ClaimAssistance /></RoleRestrictedRoute>} />
            <Route path="/calculators" element={<RoleRestrictedRoute><Calculators /></RoleRestrictedRoute>} />
            <Route path="/blacklisted-agents" element={<RoleRestrictedRoute><BlacklistedAgents /></RoleRestrictedRoute>} />
            <Route path="/faq" element={<RoleRestrictedRoute><FAQPage /></RoleRestrictedRoute>} />
            <Route path="/privacy-policy" element={<RoleRestrictedRoute><PrivacyPolicy /></RoleRestrictedRoute>} />
            <Route path="/terms-of-service" element={<RoleRestrictedRoute><TermsOfService /></RoleRestrictedRoute>} />
            <Route path="/insurance-agents" element={<RoleRestrictedRoute><CityIndex /></RoleRestrictedRoute>} />
            <Route path="/insurance-agents/:city" element={<RoleRestrictedRoute><CityLanding /></RoleRestrictedRoute>} />
            <Route path="/health-insurance" element={<RoleRestrictedRoute><InsuranceTypeLanding /></RoleRestrictedRoute>} />
            <Route path="/life-insurance" element={<RoleRestrictedRoute><InsuranceTypeLanding /></RoleRestrictedRoute>} />
            <Route path="/motor-insurance" element={<RoleRestrictedRoute><InsuranceTypeLanding /></RoleRestrictedRoute>} />
            <Route path="/sme-insurance" element={<RoleRestrictedRoute><InsuranceTypeLanding /></RoleRestrictedRoute>} />
            <Route path="/travel-insurance" element={<RoleRestrictedRoute><InsuranceTypeLanding /></RoleRestrictedRoute>} />
            <Route path="/home-insurance" element={<RoleRestrictedRoute><InsuranceTypeLanding /></RoleRestrictedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AgentSearchProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
