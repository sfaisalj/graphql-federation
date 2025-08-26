import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UrqlService, Account, Review } from './urql.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Angular urql GraphQL Client');
  accounts = signal<Account[]>([]);
  reviews = signal<Review[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  newAccountName = signal('');
  newAccountEmail = signal('');
  newReviewContent = signal('');
  newReviewRating = signal(5);
  selectedAccountId = signal('');

  constructor(private urqlService: UrqlService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadAccounts();
    this.loadReviews();
  }

  loadAccounts() {
    this.loading.set(true);
    this.urqlService.getAccounts().subscribe({
      next: (result) => {
        if (result.error) {
          this.error.set('Failed to load accounts: ' + result.error.message);
        } else if (result.data) {
          this.accounts.set(result.data.accounts);
          this.error.set(null);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Network error loading accounts: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  loadReviews() {
    this.urqlService.getReviews().subscribe({
      next: (result) => {
        if (result.error) {
          this.error.set('Failed to load reviews: ' + result.error.message);
        } else if (result.data) {
          this.reviews.set(result.data.reviews);
          if (!this.error()) {
            this.error.set(null);
          }
        }
      },
      error: (err) => {
        this.error.set('Network error loading reviews: ' + err.message);
      }
    });
  }

  createAccount() {
    if (!this.newAccountName() || !this.newAccountEmail()) {
      this.error.set('Please fill in all account fields');
      return;
    }

    this.urqlService.createAccount(this.newAccountName(), this.newAccountEmail()).subscribe({
      next: (result) => {
        if (result.error) {
          this.error.set('Failed to create account: ' + result.error.message);
        } else {
          this.newAccountName.set('');
          this.newAccountEmail.set('');
          this.loadAccounts();
          this.error.set(null);
        }
      },
      error: (err) => {
        this.error.set('Network error creating account: ' + err.message);
      }
    });
  }

  createReview() {
    if (!this.selectedAccountId() || !this.newReviewContent()) {
      this.error.set('Please select an account and enter review content');
      return;
    }

    this.urqlService.createReview(
      this.selectedAccountId(), 
      this.newReviewContent(), 
      this.newReviewRating()
    ).subscribe({
      next: (result) => {
        if (result.error) {
          this.error.set('Failed to create review: ' + result.error.message);
        } else {
          this.newReviewContent.set('');
          this.newReviewRating.set(5);
          this.selectedAccountId.set('');
          this.loadReviews();
          this.error.set(null);
        }
      },
      error: (err) => {
        this.error.set('Network error creating review: ' + err.message);
      }
    });
  }

  refresh() {
    this.error.set(null);
    this.loadData();
  }
}
