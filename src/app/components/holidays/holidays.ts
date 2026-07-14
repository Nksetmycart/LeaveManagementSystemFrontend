import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-holidays',
  imports: [CommonModule],
  templateUrl: './holidays.html',
  styleUrl: './holidays.css',
})
export class Holidays {
// Dynamic Array mapping directly to the exact company timeline records from the image
  holidayList: Holiday[] = [
    { name: "New Year's Day", formattedDate: 'Thu, Jan 1, 2026', type: 'PUBLIC' },
    { name: 'Republic Day', formattedDate: 'Mon, Jan 26, 2026', type: 'PUBLIC' },
    { name: 'Holi', formattedDate: 'Sat, Mar 14, 2026', type: 'PUBLIC' },
    { name: 'Good Friday', formattedDate: 'Sat, Apr 18, 2026', type: 'PUBLIC' },
    { name: 'Company Foundation Day', formattedDate: 'Mon, Jun 15, 2026', type: 'COMPANY' },
    { name: 'Independence Day', formattedDate: 'Sat, Aug 15, 2026', type: 'PUBLIC' },
    { name: 'Gandhi Jayanti', formattedDate: 'Fri, Oct 2, 2026', type: 'PUBLIC' },
    { name: 'Diwali', formattedDate: 'Sun, Nov 1, 2026', type: 'PUBLIC' },
    { name: 'Christmas Day', formattedDate: 'Fri, Dec 25, 2026', type: 'PUBLIC' }
  ];
}

interface Holiday {
  name: string;
  formattedDate: string;
  type: 'PUBLIC' | 'COMPANY';
}