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
