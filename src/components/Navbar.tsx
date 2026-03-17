import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Menu, X, ArrowRight, LogIn } from 'lucide-react';
import logo from '@/assets/padosi-agent-logo-new.png';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLoggedIn = !!user;
  const isRestrictedRole = user?.role === 'agent' || user?.role === 'distributor';

  const navLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Insurance Blogs', path: '/blog' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const isTransparent = isHomePage && !isScrolled && !mobileMenuOpen;
  const isCurrentPage = (path: string) => location.pathname === path;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent 
          ? 'bg-transparent border-transparent' 
          : 'bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm'
      }`}
    >
      <div className="container-content">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img 
              src={logo} 
              alt="PadosiAgent" 
              className="h-8 sm:h-10 md:h-12 transition-all duration-300 hover:scale-105 mix-blend-multiply"
            />
          </Link>

          {/* Desktop Navigation */}
          {!isRestrictedRole && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                    isCurrentPage(link.path)
                      ? 'text-primary bg-primary/5'
                      : isTransparent 
                        ? 'text-foreground/90 hover:text-primary hover:bg-white/20' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.name}
                  {isCurrentPage(link.path) && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Find Agent CTA */}
            {!isAuthPage && !isRestrictedRole && (
              <Link to="/agents">
                <Button 
                  size="sm"
                  className="flex font-bold bg-secondary text-secondary-foreground hover:bg-accent active:bg-accent transition-all duration-300 shadow-md hover:shadow-xl cta-glow cta-ripple tap-feedback group text-xs px-3 py-1.5 h-auto md:text-sm md:px-5 md:py-2.5 md:h-9 animate-pulse-glow"
                >
                  <span className="hidden sm:inline">Find My PadosiAgent</span>
                  <span className="sm:hidden">Find Agent</span>
                  <ArrowRight className="ml-1 h-3 w-3 md:ml-1.5 md:h-4 md:w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            )}

            {/* Desktop: User menu or Login button */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link 
                  to={user.role === 'admin' ? '/admin' : user.role === 'user' ? '/client-dashboard' : `/${user.role}-dashboard`} 
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isTransparent 
                      ? 'text-foreground hover:bg-white/20 hover:text-primary' 
                      : 'text-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <User size={16} />
                  <span>Dashboard</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout} 
                  className={`gap-2 ${
                    isTransparent 
                      ? 'hover:bg-white/20 hover:text-destructive' 
                      : 'hover:bg-destructive/10 hover:text-destructive'
                  }`}
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            ) : (
              !isAuthPage && (
                <Link to="/login" className="hidden md:inline-flex">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`gap-1.5 font-medium ${
                      isTransparent 
                        ? 'text-foreground hover:bg-white/20' 
                        : 'text-foreground hover:bg-primary/5'
                    }`}
                  >
                    <LogIn size={16} />
                    Login
                  </Button>
                </Link>
              )
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isTransparent 
                  ? 'hover:bg-white/20 text-foreground' 
                  : 'hover:bg-muted text-foreground'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40 animate-fade-in bg-background/95 backdrop-blur-md rounded-b-xl">
            <div className="flex flex-col gap-1">
              {!isRestrictedRole && navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                    isCurrentPage(link.path)
                      ? 'text-primary bg-primary/5'
                      : 'text-foreground hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  {isCurrentPage(link.path) && <span className="w-1 h-4 bg-primary rounded-full" />}
                  {link.name}
                </Link>
              ))}
              
              {user ? (
                <div className="border-t border-border/40 mt-2 pt-2">
                  <Link 
                    to={user.role === 'admin' ? '/admin' : user.role === 'user' ? '/client-dashboard' : `/${user.role}-dashboard`}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-primary/5 rounded-lg"
                  >
                    <User size={16} />
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-lg"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                !isAuthPage && (
                  <div className="border-t border-border/40 mt-2 pt-2">
                    <Link 
                      to="/login"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg"
                    >
                      <LogIn size={16} />
                      Login / Register
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
