import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const authData = this.authService.getAuthData();

    console.log('Auth Data from API:', authData);

    if (!authData || !authData.access) {
      console.log('No auth data or access token, redirecting to login');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    if (!authData.groups) {
      console.error('No groups found in auth data, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    const isSuperAdmin = authData.groups.includes('superadmin');
    const isAdmin = authData.groups.includes('admin');
    const url = state.url;

    console.log('User roles - SuperAdmin:', isSuperAdmin, 'Admin:', isAdmin, 'URL:', url);

    // Allow both superadmin and admin to access all routes
    // Restrictions will be handled in the components
    if (isSuperAdmin || isAdmin) {
      return true;
    }

    // If user is neither superadmin nor admin, redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}