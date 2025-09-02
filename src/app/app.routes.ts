import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { GroupM } from './components/group-management/group-management';
import { UserM } from './components/user-management/user-management';
import { Profile } from './components/profile/profile';
import { Dashboard } from './components/dashboard/dashboard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    title: 'Login',
  },
  {
    path: 'groupManagement',
    component: GroupM,
    title: 'Group Management',
  },
  {
    path: 'userManagement',
    component: UserM,
    title: 'User Management',
  },
  {
    path: 'profile',
    component: Profile,
    title: 'Profile',
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard',
  },
];

