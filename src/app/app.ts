import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RenewalService } from './services/renewal-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Frontend';

  constructor(private renewalService: RenewalService) { }

  ngOnInit(): void {
    this.renewalService.checkMonthlyRenewal();

    setInterval(() => {
      this.renewalService.checkMonthlyRenewal();
    }, 60 * 60 * 1000);
  }
}
