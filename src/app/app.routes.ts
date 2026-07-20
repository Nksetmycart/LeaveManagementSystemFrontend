import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { HomeComponent } from './components/home-component/home-component';
import { LeaveApproval } from './pages/leave-approval/leave-approval';
import { Employees } from './pages/employees/employees';
import { Departmens } from './pages/departmens/departmens';
import { Holidays } from './pages/holidays/holidays';
import { ApplyLeave } from './pages/apply-leave/apply-leave';
import { MyLeaves } from './pages/my-leaves/my-leaves';
import { Roles } from './pages/roles/roles';
import { LeaveTypes } from './pages/leave-types/leave-types';
import { AddEmployee } from './pages/add-employee/add-employee';
import { AddDepartment } from './components/add-department/add-department';
import { CreateLeaveType } from './components/create-leave-type/create-leave-type';
import { AddRole } from './components/add-role/add-role';
import { AddHoliday } from './components/add-holiday/add-holiday';
import { SingleEmployee } from './pages/single-employee/single-employee';
import { MyAttendance } from './pages/my-attendance/my-attendance';
import { Dashboard } from './pages/dashboard/dashboard';
import { UpdateEmployee } from './pages/update-employee/update-employee';
import { Unauthorized } from './pages/unauthorized/unauthorized';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { LeaveBalance } from './pages/leave-balance/leave-balance';
import { AllLeaveRequests } from './pages/all-leave-requests/all-leave-requests';
import { AllLeaveApprovals } from './pages/all-leave-approvals/all-leave-approvals';
import { AssignLeaveBalance } from './pages/assign-leave-balance/assign-leave-balance';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'unauthorized', component: Unauthorized },
    {
        path: 'dashboard', component: Dashboard, canActivate: [authGuard], children: [
            { path: '', component: HomeComponent },
            { path: 'leave-requests', component: AllLeaveRequests},
            { path: 'leave-approvals', component: AllLeaveApprovals},
            { path: 'approval', canActivate: [roleGuard], data: { roles: ['SuperAdmin', 'HR', 'Manager'] }, component: LeaveApproval },
            {
                path: 'employees', canActivate: [roleGuard], data: { roles: ['SuperAdmin', 'HR', 'Manager'] }, children: [
                    { path: '', component: Employees },
                    { path: 'add', component: AddEmployee },
                    { path: ':id', component: SingleEmployee },
                    { path: 'update/:id', component: UpdateEmployee }
                ]
            },
            {
                path: 'departments', canActivate: [roleGuard], data: { roles: ['SuperAdmin', 'HR'] }, children: [
                    { path: '', component: Departmens },
                    { path: 'add',  component: AddDepartment }
                ]
            },
            {
                path: 'holidays', children: [
                    { path: '', component: Holidays },
                    { path: 'add', canActivate:[roleGuard], data: { roles: ['SuperAdmin', 'HR']}, component: AddHoliday }
                ]
            },
            { path: 'apply-leave', canActivate: [roleGuard], data: { roles: ['Employee', 'HR', 'Manager'] }, component: ApplyLeave },
            { path: 'my-leaves', canActivate: [roleGuard], data: { roles: ['Employee', 'HR', 'Manager'] }, component: MyLeaves },
            { path: 'attendance', canActivate: [roleGuard], data: { roles: ['Employee', 'HR', 'Manager'] }, component: MyAttendance },
            {
                path: 'roles', canActivate:[roleGuard], data: { roles: ['SuperAdmin', 'HR']},  children: [
                    { path: '', component: Roles },
                    { path: 'add', component: AddRole }
                ]
            },
            {
                path: 'leave-types', children: [
                    { path: '', component: LeaveTypes },
                    { path: 'add', canActivate:[roleGuard], data: { roles: ['SuperAdmin', 'HR']}, component: CreateLeaveType }
                ]
            },
            { path: 'leave-balance', canActivate:[roleGuard], data: { roles: ['SuperAdmin', 'HR', 'Manager']}, children: [
                { path: '', component: LeaveBalance}, 
                { path: 'assign', component: AssignLeaveBalance}
            ]},
        ]
    }
];
