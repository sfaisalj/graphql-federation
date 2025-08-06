// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace ReviewsTypes {
  export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Query = {
  reviewById?: Maybe<Review>;
  reviewsByAccountId: Array<Review>;
  reviews: Array<Review>;
};


export type QueryreviewByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryreviewsByAccountIdArgs = {
  accountId: Scalars['String']['input'];
};

export type Review = {
  id: Scalars['String']['output'];
  body: Scalars['String']['output'];
  accountId: Scalars['String']['output'];
};

  export type QuerySdk = {
      /** null **/
  reviewById: InContextSdkMethod<Query['reviewById'], QueryreviewByIdArgs, MeshContext>,
  /** null **/
  reviewsByAccountId: InContextSdkMethod<Query['reviewsByAccountId'], QueryreviewsByAccountIdArgs, MeshContext>,
  /** null **/
  reviews: InContextSdkMethod<Query['reviews'], {}, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
    
  };

  export type Context = {
      ["reviews"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
