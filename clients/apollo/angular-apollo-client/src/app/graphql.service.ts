import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

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

  constructor(private apollo: Apollo) { }

  getAccounts(): Observable<any> {
    return this.apollo.watchQuery({
      query: gql`
        query GetAccounts {
          accounts {
            id
            name
            email
          }
        }
      `
    }).valueChanges;
  }

  getReviews(): Observable<any> {
    return this.apollo.watchQuery({
      query: gql`
        query GetReviews {
          reviews {
            id
            accountId
            content
            rating
          }
        }
      `
    }).valueChanges;
  }

  getAccountWithReviews(accountId: string): Observable<any> {
    return this.apollo.watchQuery({
      query: gql`
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
      `,
      variables: {
        accountId
      }
    }).valueChanges;
  }
}