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
      logoUrl
      contactEmail
      phoneNumber
      isActive
      deactivatedAt
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
        description
        roleType
        workLocation
        skillsRequired
        responsibilities
        region
        salaryRange { min max currency }
        applicationDeadline
        externalApplyUrl
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
    myOrganisations {
      id
      marketplaceListings {
        id
        title
        description
        category
        price
        currency
        condition
        region
        area
        imageUrls
        videoUrl
        videoPosterUrl
        status
        isDonation
        createdAt
        updatedAt
      }
    }
  }
`;

export const SET_ORGANISATION_ACTIVE = gql`
  mutation SetOrganisationActive($organisationId: ID!, $active: Boolean!) {
    setOrganisationActive(organisationId: $organisationId, active: $active) {
      id
      isActive
      deactivatedAt
    }
  }
`;

export const UPDATE_MARKETPLACE_ITEM = gql`
  mutation UpdateMarketplaceItem($id: ID!, $input: UpdateMarketplaceItemInput!) {
    updateMarketplaceItem(id: $id, input: $input) {
      id
      title
      description
      category
      price
      currency
      condition
      region
      area
      imageUrls
      videoUrl
      videoPosterUrl
      status
      isDonation
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_MARKETPLACE_ITEM_STATUS = gql`
  mutation UpdateMarketplaceItemStatus($id: ID!, $status: ListingStatus!) {
    updateMarketplaceItemStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const DELETE_MARKETPLACE_ITEM = gql`
  mutation DeleteMarketplaceItem($id: ID!) {
    deleteMarketplaceItem(id: $id)
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
          description
          category
          date
          endDate
          location { type address city country virtualLink }
          region
          imageUrls
          videoUrls
          videoPosterUrls
          externalTicketUrl
          rsvpCount
          capacityLimit
          status
          isRecurring
          seriesId
          occurrenceNumber
          isSeriesException
          series { recurrence { frequency interval daysOfWeek dayOfMonth timezone endsAt occurrenceCount } }
        }
      }
    }
  }
`;

export const CANCEL_EVENT = gql`
  mutation CancelManagedEvent($id: ID!, $scope: EventUpdateScope!) {
    cancelEvent(id: $id, scope: $scope)
  }
`;

export const UPDATE_MANAGED_EVENT = gql`
  mutation UpdateManagedEvent($id: ID!, $scope: EventUpdateScope!, $input: UpdateEventInput!) {
    updateEvent(id: $id, scope: $scope, input: $input) {
      id
      title
      description
      date
      status
      isSeriesException
    }
  }
`;

export const UPDATE_JOB_LISTING = gql`
  mutation UpdateManagedJobListing($id: ID!, $input: UpdateJobListingInput!) {
    updateJobListing(id: $id, input: $input) {
      id
      title
      description
      roleType
      workLocation
      skillsRequired
      responsibilities
      region
      salaryRange { min max currency }
      applicationDeadline
      externalApplyUrl
      status
      isPromoted
      faithAlignmentTag
      createdAt
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
      contactEmail
      phoneNumber
      isActive
      deactivatedAt
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
