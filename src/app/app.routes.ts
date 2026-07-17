import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { HomeComponent } from './components/home-component/home-component';
import { LeaveApproval } from './components/leave-approval/leave-approval';
import { Employees } from './pages/employees/employees';
import { Departmens } from './pages/departmens/departmens';
import { Holidays } from './pages/holidays/holidays';
import { ApplyLeave } from './components/apply-leave/apply-leave';
import { MyLeaves } from './components/my-leaves/my-leaves';
import { Roles } from './components/roles/roles';
import { LeaveTypes } from './components/leave-types/leave-types';
import { LeaveBalance } from './components/leave-balance/leave-balance';
import { AddEmployee } from './pages/add-employee/add-employee';
import { AddDepartment } from './components/add-department/add-department';
import { CreateLeaveType } from './components/create-leave-type/create-leave-type';
import { AddRole } from './components/add-role/add-role';
import { AddHoliday } from './components/add-holiday/add-holiday';
import { SingleEmployee } from './pages/single-employee/single-employee';
import { MyAttendance } from './pages/my-attendance/my-attendance';
import { Dashboard } from './pages/dashboard/dashboard';
import { UpdateEmployee } from './pages/update-employee/update-employee';

export const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'login', component: Login},
    {path: 'dashboard', component: Dashboard, children: [
        {path: '', component: HomeComponent},
        {path: 'approval', component: LeaveApproval},
        {path: 'employees', children: [
            {path: '', component: Employees},
            {path: 'add', component: AddEmployee},
            {path: ':id', component: SingleEmployee},
            {path: 'update/:id', component: UpdateEmployee}
        ]},
        {path: 'departments', children: [
            {path: '', component: Departmens}, 
            {path: 'add', component: AddDepartment}
        ]},
        {path: 'holidays', children: [
            {path: '', component: Holidays},
            {path: 'add', component: AddHoliday}
        ]},
        {path: 'apply-leave', component: ApplyLeave},
        {path: 'my-leaves', component: MyLeaves},
        {path: 'attendance', component: MyAttendance},
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
