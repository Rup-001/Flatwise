
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  User, 
  LogOut,
  Building,
  Receipt,
  Menu,
  X,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { auth, logout, society } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if we should show limited navigation (for PAYMENT_DUE status)
  const showLimitedNavigation = society.status === 'PAYMENT_DUE';
  
  // Standardized role check using role_id
  const roleId = auth.user?.role_id || 0;
  const isAdmin = roleId === 1;
  const isOwner = roleId === 2;
  const isAdminOrOwner = isAdmin || isOwner;

  // Define menu items based on society status and user role
  const menuItems = [];
  
  if (showLimitedNavigation) {
    menuItems.push({
      href: '/payment-due',
      label: 'Payment Due',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    });
    
    // Only show subscription page to admins/owners when payment is due
    if (isAdminOrOwner) {
      menuItems.push({
        href: '/subscription',
        label: 'Subscription',
        icon: <CreditCard className="h-5 w-5" />,
      });
    }
  } else {
    menuItems.push({
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    });
    
    menuItems.push({
      href: '/my-bills',
      label: 'My Bills',
      icon: <Receipt className="h-5 w-5" />,
    });
    
    if (isAdminOrOwner) {
      menuItems.push(
        {
          href: '/bills',
          label: 'Manage Bills',
          icon: <Receipt className="h-5 w-5" />,
        },
        {
          href: '/manage-flats',
          label: 'Manage Flats',
          icon: <Building className="h-5 w-5" />,
        },
        {
          href: '/invite-users',
          label: 'Invite Users',
          icon: <User className="h-5 w-5" />,
        },
        {
          href: '/subscription',
          label: 'Subscription',
          icon: <CreditCard className="h-5 w-5" />,
        },
        {
          href: '/manage-charges',
          label: 'manage-charges',
          icon: <CreditCard className="h-5 w-5" />,
        }
      );
    }
  }

  const userFullName = auth.user?.fullname || auth.user?.name || 'User';
  const userInitials = userFullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className={`${showLimitedNavigation ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'} sticky top-0 left-0 w-full z-50`}>
      <div className="container max-w-screen-xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link to={showLimitedNavigation ? "/payment-due" : auth.isAuthenticated ? "/dashboard" : "/"} className="font-bold text-xl text-white flex items-center">
            <Building className="h-6 w-6 mr-2" />
            FlatWise
            {showLimitedNavigation && (
              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                Payment Due
              </span>
            )}
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {!auth.isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-white/10 text-white transition-colors ${
                    isActive("/login") ? 'bg-white/20 font-medium' : ''
                  }`}
                >
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-white/10 text-white transition-colors ${
                    isActive("/register") ? 'bg-white/20 font-medium' : ''
                  }`}
                >
                  <span>Register</span>
                </Link>
                <Link
                  to="/support"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-white/10 text-white transition-colors ${
                    isActive("/support") ? 'bg-white/20 font-medium' : ''
                  }`}
                >
                  <span>Support</span>
                </Link>
              </>
            )}
            
            {auth.isAuthenticated && menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-white/10 text-white transition-colors ${
                  isActive(item.href) ? 'bg-white/20 font-medium' : ''
                }`}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center">
            {auth.isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full overflow-hidden hover:bg-white/10 text-white">
                    <Avatar className="h-9 w-9 border-2 border-white/30">
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userFullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{auth.user?.email || ''}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {!showLimitedNavigation && (
                    <>
                      <DropdownMenuItem>
                        <Link to="/profile" className="flex w-full items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/settings" className="flex w-full items-center cursor-pointer">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 h-4 w-4"
                          >
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {showLimitedNavigation && (
                    <>
                      <DropdownMenuItem>
                        <Link to="/payment-due" className="flex w-full items-center cursor-pointer text-red-500">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          <span>Payment Required</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      {isAdminOrOwner && (
                        <DropdownMenuItem>
                          <Link to="/subscription" className="flex w-full items-center cursor-pointer">
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Subscription</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-white text-purple-600 hover:bg-white/90">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden ml-2 text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-3 border-t border-white/10 pt-2 animate-in slide-in-from-top-5">
            <div className="space-y-1">
              {!auth.isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-white/10 text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-white/10 text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Register</span>
                  </Link>
                  <Link
                    to="/support"
                    className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-white/10 text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Support</span>
                  </Link>
                </>
              ) : (
                menuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-white/10 text-white transition-colors ${
                      isActive(item.href) ? 'bg-white/20 font-medium' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
