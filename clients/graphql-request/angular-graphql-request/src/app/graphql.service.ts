import { Injectable } from '@angular/core';
import { GraphQLClient, gql } from 'graphql-request';
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
export class GraphqlService {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient('http://localhost:4000/graphql');
  }

  getAccounts(): Observable<{ accounts: Account[] }> {
    const query = gql`
      query GetAccounts {
        accounts {
          id
          name
          email
        }
      }
    `;
    
    return from(this.client.request<{ accounts: Account[] }>(query));
  }

  getReviews(): Observable<{ reviews: Review[] }> {
    const query = gql`
      query GetReviews {
        reviews {
          id
          accountId
          content
          rating
        }
      }
    `;
    
    return from(this.client.request<{ reviews: Review[] }>(query));
  }

  getAccountWithReviews(accountId: string): Observable<any> {
    const query = gql`
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
    
    return from(this.client.request(query, { accountId }));
  }

  createAccount(name: string, email: string): Observable<any> {
    const mutation = gql`
      mutation CreateAccount($name: String!, $email: String!) {
        createAccount(name: $name, email: $email) {
          id
          name
          email
        }
      }
    `;
    
    return from(this.client.request(mutation, { name, email }));
  }

  createReview(accountId: string, content: string, rating: number): Observable<any> {
    const mutation = gql`
      mutation CreateReview($accountId: String!, $content: String!, $rating: Int!) {
        createReview(accountId: $accountId, content: $content, rating: $rating) {
          id
          accountId
          content
          rating
        }
      }
    `;
    
    return from(this.client.request(mutation, { accountId, content, rating }));
  }
}