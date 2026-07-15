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
import { AddEmployee } from './components/add-employee/add-employee';
import { AddDepartment } from './components/add-department/add-department';
import { CreateLeaveType } from './components/create-leave-type/create-leave-type';
import { AddRole } from './components/add-role/add-role';

export const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'login', component: Login},
    {path: 'dashboard', component: Dashboard, children: [
        {path: '', component: HomeComponent},
        {path: 'approval', component: LeaveApproval},
        {path: 'employees', children: [
            {path: '', component: Employees},
            {path: 'add', component: AddEmployee}
        ]},
        {path: 'departments', children: [
            {path: '', component: Departmens}, 
            {path: 'add', component: AddDepartment}
        ]},
        {path: 'holidays', component: Holidays},
        {path: 'apply-leave', component: ApplyLeave},
        {path: 'my-leaves', component: MyLeaves},
        {path: 'attendance', component: Attendance},
        {path: 'roles', children: [
            {path: '', component: Roles},
            {path: 'add', component: AddRole}
        ]},
        {path: 'leave-types', children: [
            {path: '', component: LeaveTypes},
            {path: 'add', component: CreateLeaveType}
        ]},
        {path: 'leave-balance', component: LeaveBalance},
    ]}
];
