import { gql } from '@apollo/client';

export const GET_PUBLISHED_LISTINGS = gql`
  query GetPublishedListings($tenantId: String!) {
    publishedListings(tenantId: $tenantId) {
      id
      businessName
      slug
      description
      category
      website
      phone
      publishedAt
    }
  }
`;

export const GET_MY_LISTINGS = gql`
  query GetMyListings($tenantId: String!, $email: String!) {
    myListings(tenantId: $tenantId, email: $email) {
      id
      businessName
      applicationStatus
      publicationStatus
      reviewerNotes
      submittedAt
      approvedAt
      publishedAt
      expiredAt
    }
  }
`;

export const GET_LISTINGS_FOR_REVIEW = gql`
  query GetListingsForReview($tenantId: String!) {
    listingsForReview(tenantId: $tenantId) {
      id
      businessName
      applicantEmail
      applicantName
      applicationStatus
      submittedAt
      description
      category
    }
  }
`;

export const CREATE_LISTING_DRAFT = gql`
  mutation CreateListingDraft($input: CreateListingInput!) {
    createListingDraft(input: $input) {
      id
      businessName
      applicationStatus
    }
  }
`;

export const SUBMIT_LISTING = gql`
  mutation SubmitListingApplication($id: ID!) {
    submitListingApplication(id: $id) {
      id
      applicationStatus
    }
  }
`;

export const APPROVE_LISTING = gql`
  mutation ApproveListing($id: ID!) {
    approveListing(id: $id) {
      id
      applicationStatus
    }
  }
`;

export const REJECT_LISTING = gql`
  mutation RejectListing($id: ID!, $notes: String!) {
    rejectListing(id: $id, notes: $notes) {
      id
      applicationStatus
    }
  }
`;

export const REQUEST_LISTING_INFO = gql`
  mutation RequestListingInformation($id: ID!, $notes: String!) {
    requestListingInformation(id: $id, notes: $notes) {
      id
      applicationStatus
      reviewerNotes
    }
  }
`;

export const CREATE_LISTING_CHECKOUT = gql`
  mutation CreateListingCheckout($listingId: ID!, $successUrl: String!, $cancelUrl: String!) {
    createListingCheckoutSession(listingId: $listingId, successUrl: $successUrl, cancelUrl: $cancelUrl) {
      url
      sessionId
    }
  }
`;
