import { gql } from '@apollo/client';

export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      customToken
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      firebaseUid
      email
      name
    }
  }
`;

export const CREATE_ORGANISATION = gql`
  mutation CreateOrganisation($input: CreateOrganisationInput!) {
    createOrganisation(input: $input) {
      id
      name
    }
  }
`;

export const CREATE_MARKETPLACE_ITEM = gql`
  mutation CreateMarketplaceItem($input: CreateMarketplaceItemInput!) {
    createMarketplaceItem(input: $input) {
      id
      title
      status
    }
  }
`;

export const CREATE_JOB_LISTING = gql`
  mutation CreateJobListing($input: CreateJobListingInput!) {
    createJobListing(input: $input) {
      id
      title
      status
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      date
      status
    }
  }
`;

export const UPDATE_ORGANISATION = gql`
  mutation UpdateOrganisation($id: ID!, $input: UpdateOrganisationInput!) {
    updateOrganisation(id: $id, input: $input) {
      id
      name
      description
      region
      websiteUrl
      socialLinks { whatsapp instagram facebook twitter website }
    }
  }
`;

export const MY_ORG_JOB_LISTINGS = gql`
  query MyOrgJobListings {
    myOrganisations {
      id
      jobListings {
        id
        title
        roleType
        workLocation
        region
        applicationDeadline
        status
        isPromoted
        faithAlignmentTag
        createdAt
      }
    }
  }
`;

export const MY_MARKETPLACE_LISTINGS = gql`
  query MyMarketplaceListings {
    me {
      id
      marketplaceListings {
        id
        title
        category
        price
        currency
        condition
        region
        status
        isDonation
        createdAt
      }
    }
  }
`;

export const MY_ORG_EVENTS = gql`
  query MyOrgEvents {
    myOrganisations {
      id
      events {
        edges {
          id
          title
          category
          date
          location { type city country }
          rsvpCount
          capacityLimit
          status
          isRecurring
        }
      }
    }
  }
`;

export const MY_ORGANISATIONS = gql`
  query MyOrganisations {
    myOrganisations {
      id
      name
      description
      logoUrl
      websiteUrl
      socialLinks {
        whatsapp
        instagram
        facebook
        twitter
        website
      }
      region
      isVerified
      followerCount
    }
  }
`;
