import { gql } from '@apollo/client';

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

export const MY_ORGANISATIONS = gql`
  query MyOrganisations {
    myOrganisations {
      id
      name
    }
  }
`;
