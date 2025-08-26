import { Injectable } from '@angular/core';
import { GraphQLClient, gql } from 'graphql-request';
import { Observable, from } from 'rxjs';

// Runtime-defined types that can be extended
export interface BaseEntity {
  id: string;
}

export interface Account extends BaseEntity {
  name: string;
  email: string;
  reviews?: Review[];
}

export interface Review extends BaseEntity {
  accountId: string;
  content: string;
  rating: number;
}

// Type-safe query builder
export class TypedQuery<TResult = any, TVariables = any> {
  constructor(
    public readonly query: string,
    public readonly variables?: TVariables
  ) {}

  // Type-safe execution
  execute(client: GraphQLClient): Promise<TResult> {
    return client.request<TResult>(this.query, this.variables);
  }
}

// Query factory with strong typing
export class QueryFactory {
  static getAccounts(): TypedQuery<{ accounts: Account[] }> {
    return new TypedQuery(`
      query GetAccounts {
        accounts {
          id
          name
          email
        }
      }
    `);
  }

  static getAccountWithReviews(accountId: string): TypedQuery<{ account: Account }, { accountId: string }> {
    return new TypedQuery(
      `
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
      { accountId }
    );
  }

  static createAccount(name: string, email: string): TypedQuery<{ createAccount: Account }, { name: string; email: string }> {
    return new TypedQuery(
      `
        mutation CreateAccount($name: String!, $email: String!) {
          createAccount(name: $name, email: $email) {
            id
            name
            email
          }
        }
      `,
      { name, email }
    );
  }

  static searchAccounts(searchTerm: string): TypedQuery<{ accounts: Account[] }, { search: string }> {
    return new TypedQuery(
      `
        query SearchAccounts($search: String!) {
          accounts(search: $search) {
            id
            name
            email
          }
        }
      `,
      { search: searchTerm }
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class TypedGraphqlService {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient('http://localhost:4000/graphql');
  }

  // Execute any typed query
  execute<TResult, TVariables>(query: TypedQuery<TResult, TVariables>): Observable<TResult> {
    return from(query.execute(this.client));
  }

  // Convenience methods with full type safety
  getAccounts(): Observable<{ accounts: Account[] }> {
    return this.execute(QueryFactory.getAccounts());
  }

  getAccountWithReviews(accountId: string): Observable<{ account: Account }> {
    return this.execute(QueryFactory.getAccountWithReviews(accountId));
  }

  createAccount(name: string, email: string): Observable<{ createAccount: Account }> {
    return this.execute(QueryFactory.createAccount(name, email));
  }

  // Dynamic query execution with partial typing
  dynamicQuery<TResult = any>(queryString: string, variables?: any): Observable<TResult> {
    const query = new TypedQuery<TResult>(queryString, variables);
    return this.execute(query);
  }
}