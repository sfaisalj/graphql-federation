import { Injectable } from '@angular/core';
import { GraphQLClient } from 'graphql-request';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { z } from 'zod';

// Runtime validation schemas
export const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const ReviewSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  content: z.string(),
  rating: z.number().min(1).max(5),
});

export const AccountsResponseSchema = z.object({
  accounts: z.array(AccountSchema),
});

export const ReviewsResponseSchema = z.object({
  reviews: z.array(ReviewSchema),
});

// Infer TypeScript types from schemas
export type Account = z.infer<typeof AccountSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type AccountsResponse = z.infer<typeof AccountsResponseSchema>;
export type ReviewsResponse = z.infer<typeof ReviewsResponseSchema>;

@Injectable({
  providedIn: 'root'
})
export class ValidatedGraphqlService {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient('http://localhost:4000/graphql');
  }

  // Execute query with runtime validation
  private executeValidated<T>(
    query: string, 
    schema: z.ZodSchema<T>, 
    variables?: any
  ): Observable<T> {
    return from(this.client.request(query, variables)).pipe(
      map(response => {
        try {
          return schema.parse(response);
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error('GraphQL Response Validation Error:', error.errors);
            throw new Error(`Invalid response format: ${error.errors.map(e => e.message).join(', ')}`);
          }
          throw error;
        }
      })
    );
  }

  // Type-safe methods with runtime validation
  getAccounts(): Observable<AccountsResponse> {
    const query = `
      query GetAccounts {
        accounts {
          id
          name
          email
        }
      }
    `;
    return this.executeValidated(query, AccountsResponseSchema);
  }

  getReviews(): Observable<ReviewsResponse> {
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
    return this.executeValidated(query, ReviewsResponseSchema);
  }

  createAccount(name: string, email: string): Observable<{ createAccount: Account }> {
    const mutation = `
      mutation CreateAccount($name: String!, $email: String!) {
        createAccount(name: $name, email: $email) {
          id
          name
          email
        }
      }
    `;
    
    const schema = z.object({
      createAccount: AccountSchema
    });

    return this.executeValidated(mutation, schema, { name, email });
  }

  // Flexible query with partial validation
  flexibleQuery<T>(
    query: string, 
    partialSchema?: z.ZodSchema<T>, 
    variables?: any
  ): Observable<T | any> {
    if (partialSchema) {
      return this.executeValidated(query, partialSchema, variables);
    }
    
    // Fallback to unvalidated but still type-hinted
    return from(this.client.request<T>(query, variables));
  }
}