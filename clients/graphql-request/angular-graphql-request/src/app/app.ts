import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GraphqlService, Account, Review } from './graphql.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Angular GraphQL Request Client');
  accounts = signal<Account[]>([]);
  reviews = signal<Review[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  newAccountName = signal('');
  newAccountEmail = signal('');
  newReviewContent = signal('');
  newReviewRating = signal(5);
  selectedAccountId = signal('');

  constructor(private graphqlService: GraphqlService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadAccounts();
    this.loadReviews();
  }

  loadAccounts() {
    this.loading.set(true);
    this.graphqlService.getAccounts().subscribe({
      next: (result) => {
        this.accounts.set(result.accounts);
        this.loading.set(false);
        this.error.set(null);
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
        this.reviews.set(result.reviews);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set('Failed to load reviews: ' + err.message);
      }
    });
  }

  createAccount() {
    if (!this.newAccountName() || !this.newAccountEmail()) {
      this.error.set('Please fill in all account fields');
      return;
    }

    this.graphqlService.createAccount(this.newAccountName(), this.newAccountEmail()).subscribe({
      next: () => {
        this.newAccountName.set('');
        this.newAccountEmail.set('');
        this.loadAccounts();
        this.error.set(null);
      },
      error: (err) => {
        this.error.set('Failed to create account: ' + err.message);
      }
    });
  }

  createReview() {
    if (!this.selectedAccountId() || !this.newReviewContent()) {
      this.error.set('Please select an account and enter review content');
      return;
    }

    this.graphqlService.createReview(
      this.selectedAccountId(), 
      this.newReviewContent(), 
      this.newReviewRating()
    ).subscribe({
      next: () => {
        this.newReviewContent.set('');
        this.newReviewRating.set(5);
        this.selectedAccountId.set('');
        this.loadReviews();
        this.error.set(null);
      },
      error: (err) => {
        this.error.set('Failed to create review: ' + err.message);
      }
    });
  }
}
