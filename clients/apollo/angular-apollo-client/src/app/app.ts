import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GraphqlService, Account, Review } from './graphql.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('angular-apollo-client');
  accounts = signal<Account[]>([]);
  reviews = signal<Review[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private graphqlService: GraphqlService) {}

  ngOnInit() {
    this.loadAccounts();
    this.loadReviews();
  }

  loadAccounts() {
    this.loading.set(true);
    this.graphqlService.getAccounts().subscribe({
      next: (result) => {
        this.accounts.set(result.data.accounts);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load accounts: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  loadReviews() {
    this.graphqlService.getReviews().subscribe({
      next: (result) => {
        this.reviews.set(result.data.reviews);
      },
      error: (err) => {
        this.error.set('Failed to load reviews: ' + err.message);
      }
    });
  }
}
