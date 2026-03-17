import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, PieChart, ChevronUp, Users, Star, Activity, UserPlus, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for agents
const managedAgents = [
  {
    id: 1,
    name: 'Rahul Sharma',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: 'Indiranagar, Bangalore',
    activeClients: 42,
    activePolicies: 86,
    conversionRate: 68,
    performance: 'high',
    lastMonthRevenue: '₹2,54,000',
    revenueChange: 12
  },
  {
    id: 2,
    name: 'Priya Patel',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    location: 'Koramangala, Bangalore',
    activeClients: 35,
    activePolicies: 65,
    conversionRate: 61,
    performance: 'medium',
    lastMonthRevenue: '₹1,98,500',
    revenueChange: 8
  },
  {
    id: 3,
    name: 'Amit Kumar',
    image: 'https://randomuser.me/api/portraits/men/22.jpg',
    location: 'HSR Layout, Bangalore',
    activeClients: 51,
    activePolicies: 94,
    conversionRate: 72,
    performance: 'high',
    lastMonthRevenue: '₹3,12,000',
    revenueChange: 15
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    image: 'https://randomuser.me/api/portraits/women/67.jpg',
    location: 'Whitefield, Bangalore',
    activeClients: 28,
    activePolicies: 52,
    conversionRate: 56,
    performance: 'medium',
    lastMonthRevenue: '₹1,65,000',
    revenueChange: -3
  }
];

// Top performing products
const topProducts = [
  { name: 'Health Insurance', revenue: '₹4,85,000', percentage: 32, growth: 8 },
  { name: 'Term Insurance', revenue: '₹3,62,000', percentage: 24, growth: 12 },
  { name: 'Motor Insurance', revenue: '₹2,85,000', percentage: 19, growth: 5 },
  { name: 'Travel Insurance', revenue: '₹1,95,000', percentage: 13, growth: -2 },
  { name: 'SME Insurance', revenue: '₹1,80,000', percentage: 12, growth: 18 }
];

const DistributorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Performance metrics (mock data)
  const performanceData = {
    totalAgents: managedAgents.length,
    totalClients: managedAgents.reduce((sum, agent) => sum + agent.activeClients, 0),
    totalPolicies: managedAgents.reduce((sum, agent) => sum + agent.activePolicies, 0),
    monthlyRevenue: "₹9,09,500",
    revenueGrowth: 8.5,
    targetCompletion: 74
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
                Please log in to view your distributor dashboard
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
                <AvatarFallback className="bg-brand-blue text-white text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <Badge className="ml-2 bg-brand-orange">Agency Manager</Badge>
                </div>
                <p className="text-gray-500">Insurance Distributor • Bangalore, Karnataka</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <BarChart className="h-4 w-4 mr-1" /> Reports
              </Button>
              <Button className="bg-brand-blue">
                <UserPlus className="h-4 w-4 mr-1" /> Add Agent
              </Button>
            </div>
          </div>
          
          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 md:w-auto bg-white">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Business Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Users className="h-5 w-5 text-brand-blue" />
                          </div>
                          <div className="mt-2">
                            <div className="text-2xl font-bold">{performanceData.totalAgents}</div>
                            <div className="text-xs text-gray-500">Active Agents</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Users className="h-5 w-5 text-brand-blue" />
                            <span className="text-xs text-green-600 flex items-center">
                              <ChevronUp className="h-4 w-4" /> 6%
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="text-2xl font-bold">{performanceData.totalClients}</div>
                            <div className="text-xs text-gray-500">Total Clients</div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Activity className="h-5 w-5 text-brand-blue" />
                            <span className="text-xs text-green-600 flex items-center">
                              <ChevronUp className="h-4 w-4" /> 3%
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="text-2xl font-bold">{performanceData.totalPolicies}</div>
                            <div className="text-xs text-gray-500">Active Policies</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Star className="h-5 w-5 text-brand-blue" />
                            <span className="text-xs text-green-600 flex items-center">
                              <ChevronUp className="h-4 w-4" /> {performanceData.revenueGrowth}%
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="text-2xl font-bold">{performanceData.monthlyRevenue}</div>
                            <div className="text-xs text-gray-500">Monthly Revenue</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Target Completion</span>
                          <span className="text-sm font-medium">{performanceData.targetCompletion}%</span>
                        </div>
                        <Progress value={performanceData.targetCompletion} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Top Performing Products</CardTitle>
                      <PieChart className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-brand-blue' :
                              index === 1 ? 'bg-brand-orange' :
                              index === 2 ? 'bg-green-500' :
                              index === 3 ? 'bg-yellow-500' : 'bg-purple-500'
                            }`}></div>
                            <span className="font-medium">{product.name}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-medium">{product.revenue}</div>
                              <div className="text-xs text-gray-500">{product.percentage}% of total</div>
                            </div>
                            <div className={`flex items-center text-xs ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.growth > 0 ? (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                  <line x1="7" y1="7" x2="17" y2="17"></line>
                                  <polyline points="17 7 17 17 7 17"></polyline>
                                </svg>
                              )}
                              {Math.abs(product.growth)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Managed Agents Section */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Managed Agents</CardTitle>
                      <CardDescription>Performance overview of your agency's agents</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      View All Agents
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {managedAgents.map(agent => (
                      <div key={agent.id} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                          <Avatar>
                            <AvatarImage src={agent.image} alt={agent.name} />
                            <AvatarFallback className="bg-brand-blue text-white">
                              {agent.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium">{agent.name}</h4>
                              <Badge className={`ml-2 ${
                                agent.performance === 'high' ? 'bg-green-500' : 
                                agent.performance === 'medium' ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}>
                                {agent.performance === 'high' ? 'Top Performer' : 
                                 agent.performance === 'medium' ? 'Good' : 'Needs Improvement'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{agent.location}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 md:gap-8">
                          <div>
                            <div className="text-sm text-gray-500">Clients</div>
                            <div className="font-medium">{agent.activeClients}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Policies</div>
                            <div className="font-medium">{agent.activePolicies}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Conversion</div>
                            <div className="font-medium">{agent.conversionRate}%</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Last Month Revenue</div>
                            <div className="font-medium">{agent.lastMonthRevenue}</div>
                            <div className={`text-xs flex items-center justify-end mt-1 ${agent.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {agent.revenueChange > 0 ? (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                  <line x1="7" y1="7" x2="17" y2="17"></line>
                                  <polyline points="17 7 17 17 7 17"></polyline>
                                </svg>
                              )}
                              {Math.abs(agent.revenueChange)}% from last month
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex items-center justify-between w-full text-sm">
                    <span className="text-gray-500">Showing {managedAgents.length} of {managedAgents.length} agents</span>
                  </div>
                </CardFooter>
              </Card>
              
              {/* Revenue Analytics */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Revenue Analytics</CardTitle>
                      <CardDescription>Monthly revenue breakdown by insurance type</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <BarChart className="h-4 w-4 mr-1" /> Full Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-center text-gray-500">
                      Revenue chart will be implemented in the next phase.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Other Tabs (Simplified Placeholders) */}
            <TabsContent value="agents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Management</CardTitle>
                  <CardDescription>Manage and monitor your agent network</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="py-4 text-center text-gray-500">
                    Full agent management system will be implemented in the next phase.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="clients" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Client Overview</CardTitle>
                  <CardDescription>Aggregate client data across your agency</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="py-4 text-center text-gray-500">
                    Full client overview system will be implemented in the next phase.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Reports</CardTitle>
                  <CardDescription>Comprehensive business analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="py-4 text-center text-gray-500">
                    Full analytics reporting system will be implemented in the next phase.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
    </div>
  );
};

export default DistributorDashboard;
