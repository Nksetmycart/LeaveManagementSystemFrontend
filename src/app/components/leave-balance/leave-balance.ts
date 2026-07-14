import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface LeaveMetrics {
  remaining: number;
  total: number;
}

interface EmployeeBalanceRecord {
  id: number;
  employeeName: string;
  initials: string;
  role: string;
  cl: LeaveMetrics;
  sl: LeaveMetrics;
  el: LeaveMetrics;
  lop: LeaveMetrics;
}

@Component({
  selector: 'app-leave-balance',
  imports: [CommonModule],
  templateUrl: './leave-balance.html',
  styleUrl: './leave-balance.css',
})
export class LeaveBalance {
// Structured allocation registry matching active workers from system components
  balancesList: EmployeeBalanceRecord[] = [
    {
      id: 1,
      employeeName: 'Priya Sharma',
      initials: 'PS',
      role: 'Head of People',
      cl: { remaining: 12, total: 12 },
      sl: { remaining: 10, total: 10 },
      el: { remaining: 15, total: 15 },
      lop: { remaining: 30, total: 30 }
    },
    {
      id: 2,
      employeeName: 'Aarav Mehta',
      initials: 'AM',
      role: 'Engineering Manager',
      cl: { remaining: 9, total: 12 },
      sl: { remaining: 8, total: 10 },
      el: { remaining: 12, total: 15 },
      lop: { remaining: 30, total: 30 }
    },
    {
      id: 3,
      employeeName: 'Emma Watson',
      initials: 'EW',
      role: 'Senior Engineer',
      cl: { remaining: 10, total: 12 },
      sl: { remaining: 10, total: 10 },
      el: { remaining: 14, total: 15 },
      lop: { remaining: 28, total: 30 }
    }
  ];

  openBulkAllocation(): void {
    console.log('Opening layout allocation modal wizard to assign leave quotas...');
  }

  viewBalanceDetails(record: EmployeeBalanceRecord): void {
    console.log(`Loading precise transaction statement ledgers and leave usage logs for: ${record.employeeName}`);
  }

  adjustBalance(record: EmployeeBalanceRecord): void {
    console.log(`Opening immediate manual arithmetic adjustment override context for: ${record.employeeName}`);
  }

  resetBalance(record: EmployeeBalanceRecord): void {
    console.log(`Resetting leaves tracking counters back to original policy norms for: ${record.employeeName}`);
    if (confirm(`Reset all custom modifications and restore structural default quotas for ${record.employeeName}?`)) {
      record.cl.remaining = record.cl.total;
      record.sl.remaining = record.sl.total;
      record.el.remaining = record.el.total;
      record.lop.remaining = record.lop.total;
    }
  }
}
