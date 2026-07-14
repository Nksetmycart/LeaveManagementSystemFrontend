import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { HomeComponent } from './components/home-component/home-component';
import { LeaveApproval } from './components/leave-approval/leave-approval';
import { Employees } from './components/employees/employees';
import { Departmens } from './components/departmens/departmens';
import { Holidays } from './components/holidays/holidays';
import { ApplyLeave } from './components/apply-leave/apply-leave';
import { MyLeaves } from './components/my-leaves/my-leaves';
import { Attendance } from './components/attendance/attendance';
import { Roles } from './components/roles/roles';
import { LeaveTypes } from './components/leave-types/leave-types';
import { LeaveBalance } from './components/leave-balance/leave-balance';

export const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'login', component: Login},
    {path: 'dashboard/:id', component: Dashboard, children: [
        {path: '', component: HomeComponent},
        {path: 'approval', component: LeaveApproval},
        {path: 'employees', component: Employees},
        {path: 'departments', component: Departmens},
        {path: 'holidays', component: Holidays},
        {path: 'apply-leave', component: ApplyLeave},
        {path: 'my-leaves', component: MyLeaves},
        {path: 'attendance', component: Attendance},
        {path: 'roles', component: Roles},
        {path: 'leave-types', component: LeaveTypes},
        {path: 'leave-balance', component: LeaveBalance},
    ]}
];
