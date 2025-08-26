import { Injectable } from '@angular/core';
import { createClient, Client, OperationResult, fetchExchange } from '@urql/core';
import { Observable, from } from 'rxjs';

export interface Account {
  id: string;
  name: string;
  email: string;
}

export interface Review {
  id: string;
  accountId: string;
  content: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class UrqlService {
  private client: Client;

  constructor() {
    this.client = createClient({
      url: 'http://localhost:4000/graphql',
      exchanges: [fetchExchange],
      fetchOptions: () => ({
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    });
  }

  query<T = any>(query: string, variables?: Record<string, any>): Observable<OperationResult<T>> {
    return from(this.client.query(query, variables).toPromise());
  }

  mutation<T = any>(mutation: string, variables?: Record<string, any>): Observable<OperationResult<T>> {
    return from(this.client.mutation(mutation, variables).toPromise());
  }

  getAccounts(): Observable<OperationResult<{ accounts: Account[] }>> {
    const query = `
      query GetAccounts {
        accounts {
          id
          name
          email
        }
      }
    `;
    return this.query<{ accounts: Account[] }>(query);
  }

  getReviews(): Observable<OperationResult<{ reviews: Review[] }>> {
    const query = `
      query GetReviews {
        reviews {
          id
          accountId
          content
          rating
        }
      }
    `;
    return this.query<{ reviews: Review[] }>(query);
  }

  getAccountWithReviews(accountId: string): Observable<OperationResult<any>> {
    const query = `
      query GetAccountWithReviews($accountId: ID!) {
        account(id: $accountId) {
          id
          name
          email
          reviews {
            id
            content
            rating
          }
        }
      }
    `;
    return this.query(query, { accountId });
  }

  createAccount(name: string, email: string): Observable<OperationResult<any>> {
    const mutation = `
      mutation CreateAccount($name: String!, $email: String!) {
        createAccount(name: $name, email: $email) {
          id
          name
          email
        }
      }
    `;
    return this.mutation(mutation, { name, email });
  }

  createReview(accountId: string, content: string, rating: number): Observable<OperationResult<any>> {
    const mutation = `
      mutation CreateReview($accountId: String!, $content: String!, $rating: Int!) {
        createReview(accountId: $accountId, content: $content, rating: $rating) {
          id
          accountId
          content
          rating
        }
      }
    `;
    return this.mutation(mutation, { accountId, content, rating });
  }
}