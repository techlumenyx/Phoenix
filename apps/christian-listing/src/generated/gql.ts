/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query OrganisationRouteAccess { myOrganisations { id } }": typeof types.OrganisationRouteAccessDocument,
    "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      customToken\n    }\n  }\n": typeof types.SignUpDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      firebaseUid\n      email\n      name\n    }\n  }\n": typeof types.CreateUserDocument,
    "\n  mutation CreateOrganisation($input: CreateOrganisationInput!) {\n    createOrganisation(input: $input) {\n      id\n      name\n    }\n  }\n": typeof types.CreateOrganisationDocument,
    "\n  mutation CreateMarketplaceItem($input: CreateMarketplaceItemInput!) {\n    createMarketplaceItem(input: $input) {\n      id\n      title\n      status\n    }\n  }\n": typeof types.CreateMarketplaceItemDocument,
    "\n  mutation CreateJobListing($input: CreateJobListingInput!) {\n    createJobListing(input: $input) {\n      id\n      title\n      status\n    }\n  }\n": typeof types.CreateJobListingDocument,
    "\n  mutation CreateEvent($input: CreateEventInput!) {\n    createEvent(input: $input) {\n      id\n      title\n      date\n      status\n    }\n  }\n": typeof types.CreateEventDocument,
    "\n  mutation UpdateOrganisation($id: ID!, $input: UpdateOrganisationInput!) {\n    updateOrganisation(id: $id, input: $input) {\n      id\n      name\n      description\n      region\n      websiteUrl\n      socialLinks { whatsapp instagram facebook twitter website }\n    }\n  }\n": typeof types.UpdateOrganisationDocument,
    "\n  query MyOrgJobListings {\n    myOrganisations {\n      id\n      jobListings {\n        id\n        title\n        roleType\n        workLocation\n        region\n        applicationDeadline\n        status\n        isPromoted\n        faithAlignmentTag\n        createdAt\n      }\n    }\n  }\n": typeof types.MyOrgJobListingsDocument,
    "\n  query MyMarketplaceListings {\n    me {\n      id\n      marketplaceListings {\n        id\n        title\n        category\n        price\n        currency\n        condition\n        region\n        status\n        isDonation\n        createdAt\n      }\n    }\n  }\n": typeof types.MyMarketplaceListingsDocument,
    "\n  query MyOrgEvents {\n    myOrganisations {\n      id\n      events {\n        edges {\n          id\n          title\n          category\n          date\n          location { type city country }\n          rsvpCount\n          capacityLimit\n          status\n          isRecurring\n        }\n      }\n    }\n  }\n": typeof types.MyOrgEventsDocument,
    "\n  query MyOrganisations {\n    myOrganisations {\n      id\n      name\n      description\n      logoUrl\n      websiteUrl\n      socialLinks {\n        whatsapp\n        instagram\n        facebook\n        twitter\n        website\n      }\n      region\n      isVerified\n      followerCount\n    }\n  }\n": typeof types.MyOrganisationsDocument,
    "\n  query Discovery($region: String, $search: String, $limit: Int) {\n    events(region: $region, search: $search, status: PUBLISHED, limit: $limit) {\n      edges { id title description category date region rsvpCount imageUrls location { city country type } }\n    }\n    jobListings(region: $region, search: $search, status: ACTIVE, limit: $limit) {\n      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } organisation { id name isVerified } }\n    }\n    marketplaceItems(region: $region, search: $search, status: AVAILABLE, limit: $limit) {\n      edges { id title description price currency condition region area imageUrls isDonation seller { id isVerified } }\n    }\n    organisations(region: $region, search: $search, limit: $limit) {\n      edges { id name description region logoUrl isVerified }\n    }\n  }\n": typeof types.DiscoveryDocument,
    "\n  query AllEventsDirectory($region: String, $search: String, $category: EventCategory, $dateFrom: DateTime, $locationType: LocationType, $ticketed: Boolean, $sort: EventSort, $limit: Int, $after: String) {\n    events(region: $region, search: $search, category: $category, status: PUBLISHED, dateFrom: $dateFrom, locationType: $locationType, ticketed: $ticketed, sort: $sort, limit: $limit, after: $after) {\n      edges { id title description category date region rsvpCount imageUrls isPromoted location { type city country } }\n      hasNextPage endCursor\n    }\n  }\n": typeof types.AllEventsDirectoryDocument,
    "\n  query AllJobsDirectory($region: String, $search: String, $roleType: RoleType, $workLocation: WorkLocation, $skillTags: [String!], $minSalary: Float, $maxSalary: Float, $sort: JobSort, $limit: Int, $after: String) {\n    jobListings(region: $region, search: $search, roleType: $roleType, workLocation: $workLocation, skillTags: $skillTags, minSalary: $minSalary, maxSalary: $maxSalary, status: ACTIVE, sort: $sort, limit: $limit, after: $after) {\n      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } applicationDeadline isPromoted organisation { id name isVerified } }\n      hasNextPage endCursor\n    }\n  }\n": typeof types.AllJobsDirectoryDocument,
    "\n  query AllMarketplaceListings($region: String, $search: String, $category: MarketplaceCategory, $condition: ItemCondition, $subCategory: String, $minPrice: Float, $maxPrice: Float, $isDonation: Boolean, $sort: MarketplaceSort, $limit: Int, $after: String) {\n    marketplaceItems(region: $region, search: $search, category: $category, condition: $condition, subCategory: $subCategory, minPrice: $minPrice, maxPrice: $maxPrice, isDonation: $isDonation, status: AVAILABLE, sort: $sort, limit: $limit, after: $after) {\n      edges { id title description price currency condition category region imageUrls isDonation isPromoted seller { id isVerified } }\n      hasNextPage endCursor\n    }\n  }\n": typeof types.AllMarketplaceListingsDocument,
    "\n  query EventDetails($id: ID!) {\n    event(id: $id) {\n      id title description category date endDate region\n      rsvpCount interestedCount savedCount confirmedCount capacityLimit waitlistCount\n      status imageUrls isPromoted externalTicketUrl\n      location { type address city country virtualLink }\n      hosts { id name description logoUrl region isVerified verificationTier websiteUrl }\n    }\n    relatedEvents: events(status: PUBLISHED, sort: POPULAR, limit: 20) {\n      edges { id title description category date region rsvpCount imageUrls location { city country type } }\n    }\n    myRsvps { id stage event { id } }\n  }\n": typeof types.EventDetailsDocument,
    "\n  mutation EventDetailsRsvp($eventId: ID!, $stage: RsvpStage!) {\n    rsvpToEvent(eventId: $eventId, stage: $stage) { id stage }\n  }\n": typeof types.EventDetailsRsvpDocument,
    "\n  mutation EventDetailsCancelRsvp($eventId: ID!) {\n    cancelRsvp(eventId: $eventId)\n  }\n": typeof types.EventDetailsCancelRsvpDocument,
    "\n  query EventsHome($region: String, $search: String) {\n    trending: events(region: $region, search: $search, status: PUBLISHED, sort: POPULAR, limit: 6) { edges { ...HomeEvent } }\n    upcoming: events(region: $region, search: $search, status: PUBLISHED, sort: DATE_ASC, limit: 20) { edges { ...HomeEvent } }\n  }\n  fragment HomeEvent on Event {\n    id title description category date region rsvpCount imageUrls isPromoted\n    location { type city country }\n  }\n": typeof types.EventsHomeDocument,
    "\n  query MyFollowingHub {\n    myFollowingOrganisations {\n      id name description logoUrl region isVerified followerCount\n      events(limit: 4) { edges { id title description category date region rsvpCount imageUrls status } }\n      jobListings { id title roleType workLocation region salaryRange { min max currency } status }\n      marketplaceListings { id title description price currency region imageUrls status isDonation }\n    }\n  }\n": typeof types.MyFollowingHubDocument,
    "\n  query JobApplicationContext($id: ID!) {\n    jobListing(id: $id) { id title status applicationDeadline organisation { id name } }\n    myJobApplication(jobId: $id) { id status createdAt }\n  }\n": typeof types.JobApplicationContextDocument,
    "\n  mutation SubmitInternalJobApplication($input: SubmitJobApplicationInput!) {\n    submitJobApplication(input: $input) { id status createdAt }\n  }\n": typeof types.SubmitInternalJobApplicationDocument,
    "\n  query JobDetails($id: ID!) {\n    jobListing(id: $id) {\n      id title description roleType workLocation skillsRequired region\n      salaryRange { min max currency }\n      applicationDeadline externalApplyUrl status faithAlignmentTag\n      responsibilities educationalRequirement experience certifications otherSkills\n      faithDescription keyFaithRequirements applicationCount createdAt\n      organisation { id name isVerified description logoUrl region verificationTier websiteUrl }\n    }\n  }\n": typeof types.JobDetailsDocument,
    "query JobSavedState($id: ID!) { isJobSaved(id: $id) }": typeof types.JobSavedStateDocument,
    "mutation SaveJobDetails($id: ID!) { saveJob(id: $id) }": typeof types.SaveJobDetailsDocument,
    "mutation UnsaveJobDetails($id: ID!) { unsaveJob(id: $id) }": typeof types.UnsaveJobDetailsDocument,
    "\n  query JobsHome($region: String, $search: String) {\n    trending: jobListings(region: $region, search: $search, status: ACTIVE, sort: POPULAR, limit: 8) { edges { ...HomeJob } }\n    newest: jobListings(region: $region, search: $search, status: ACTIVE, sort: NEWEST, limit: 20) { edges { ...HomeJob } }\n    volunteering: jobListings(region: $region, search: $search, status: ACTIVE, roleType: VOLUNTEER, sort: NEWEST, limit: 8) { edges { ...HomeJob } }\n  }\n  fragment HomeJob on JobListing { id title roleType workLocation region skillsRequired salaryRange { min max currency } isPromoted organisation { id name isVerified } }\n": typeof types.JobsHomeDocument,
    "\n  query MarketplaceDetails($id: ID!, $region: String, $category: MarketplaceCategory) {\n    marketplaceItem(id: $id) {\n      id title description price currency condition category area region imageUrls status\n      isDonation isPromoted flagCount subCategory dimensions otherAttributes maxRetailPrice\n      contactInfo showContactOnOffer createdAt\n      seller { id name avatarUrl bio isVerified region socialLinks { whatsapp instagram facebook website } }\n    }\n    marketplaceItems(region: $region, category: $category, status: AVAILABLE, limit: 5) {\n      edges { id title description price currency condition region imageUrls isDonation seller { id isVerified } }\n    }\n  }\n": typeof types.MarketplaceDetailsDocument,
    "\n  mutation MarketplaceDetailsReport($itemId: ID!, $reason: String!) {\n    reportListing(itemId: $itemId, reason: $reason)\n  }\n": typeof types.MarketplaceDetailsReportDocument,
    "query MarketplaceSavedState($id: ID!) { isMarketplaceItemSaved(id: $id) }": typeof types.MarketplaceSavedStateDocument,
    "mutation SaveMarketplaceDetails($id: ID!) { saveMarketplaceItem(id: $id) }": typeof types.SaveMarketplaceDetailsDocument,
    "mutation UnsaveMarketplaceDetails($id: ID!) { unsaveMarketplaceItem(id: $id) }": typeof types.UnsaveMarketplaceDetailsDocument,
    "mutation StartListingConversation($listingId: ID!, $message: String!) { startListingConversation(listingId: $listingId, message: $message) { id } }": typeof types.StartListingConversationDocument,
    "\n  query MarketplaceHome($region: String, $search: String) {\n    promoted: marketplaceItems(region: $region, search: $search, status: AVAILABLE, sort: POPULAR, limit: 8) { edges { ...HomeListing } }\n    newest: marketplaceItems(region: $region, search: $search, status: AVAILABLE, sort: NEWEST, limit: 20) { edges { ...HomeListing } }\n    donations: marketplaceItems(region: $region, search: $search, status: AVAILABLE, isDonation: true, sort: NEWEST, limit: 8) { edges { ...HomeListing } }\n  }\n  fragment HomeListing on MarketplaceItem { id title description price currency condition category region imageUrls isDonation isPromoted seller { id isVerified } }\n": typeof types.MarketplaceHomeDocument,
    "query MessagingThreads($role: MessageParticipantRole) { myMessageThreads(role: $role, limit: 50) { edges { id status lastMessage lastMessageAt unreadCount buyer { id firebaseUid name avatarUrl } seller { id firebaseUid name avatarUrl } listing { id title imageUrls status } } } unreadMessageCount }": typeof types.MessagingThreadsDocument,
    "query MessagingThread($id: ID!) { messageThread(id: $id) { id status buyer { id firebaseUid name avatarUrl } seller { id firebaseUid name avatarUrl } listing { id title imageUrls status price currency } messages(limit: 100) { edges { id type body readAt createdAt sender { id firebaseUid name avatarUrl } } } } }": typeof types.MessagingThreadDocument,
    "mutation SendThreadMessage($id: ID!, $body: String!) { sendMessage(threadId: $id, body: $body) { id } }": typeof types.SendThreadMessageDocument,
    "mutation ReadThread($id: ID!) { markThreadRead(threadId: $id) }": typeof types.ReadThreadDocument,
    "mutation ArchiveMessageThread($id: ID!) { archiveThread(threadId: $id) { id status } }": typeof types.ArchiveMessageThreadDocument,
    "\n  query MyApplications {\n    me {\n      id\n      jobApplications {\n        id\n        status\n        createdAt\n        updatedAt\n        listing {\n          id\n          title\n          organisation { id name isVerified }\n        }\n      }\n    }\n  }\n": typeof types.MyApplicationsDocument,
    "\n  query OrganisationInvitation($token: String!) {\n    organisationInvite(token: $token) {\n      id\n      email\n      roles\n      status\n      expiresAt\n      organisation {\n        id\n        name\n        logoUrl\n      }\n    }\n  }\n": typeof types.OrganisationInvitationDocument,
    "\n  mutation AcceptOrganisationInvitation($token: String!) {\n    acceptOrganisationInvite(token: $token) {\n      id\n      name\n    }\n  }\n": typeof types.AcceptOrganisationInvitationDocument,
    "\n  query PublicOrganisationProfile($id: ID!) {\n    organisation(id: $id) {\n      id name description logoUrl region isVerified verificationTier followerCount websiteUrl createdAt\n      socialLinks { whatsapp instagram facebook twitter website }\n      events(limit: 8) { edges { id title description category date region rsvpCount imageUrls status } }\n      jobListings { id title roleType workLocation region salaryRange { min max currency } status isPromoted }\n      marketplaceListings { id title description price currency region imageUrls status isDonation isPromoted }\n    }\n    isFollowingOrganisation(organisationId: $id)\n  }\n": typeof types.PublicOrganisationProfileDocument,
    "mutation FollowPublicOrganisation($id: ID!) { followOrganisation(organisationId: $id) { id followerCount } }": typeof types.FollowPublicOrganisationDocument,
    "mutation UnfollowPublicOrganisation($id: ID!) { unfollowOrganisation(organisationId: $id) { id followerCount } }": typeof types.UnfollowPublicOrganisationDocument,
    "query SavedItemsHub { myRsvps(stage: SAVED) { id event { id title description category date region rsvpCount imageUrls hosts { isVerified } } } mySavedJobs { id title roleType workLocation region salaryRange { min max currency } organisation { name isVerified } } mySavedMarketplaceItems { id title description price currency region imageUrls isDonation seller { isVerified } } }": typeof types.SavedItemsHubDocument,
    "mutation RemoveSavedEvent($id: ID!) { cancelRsvp(eventId: $id) }": typeof types.RemoveSavedEventDocument,
    "mutation RemoveSavedJob($id: ID!) { unsaveJob(id: $id) }": typeof types.RemoveSavedJobDocument,
    "mutation RemoveSavedMarketplace($id: ID!) { unsaveMarketplaceItem(id: $id) }": typeof types.RemoveSavedMarketplaceDocument,
    "\n  mutation UpdatePreferencesProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      preferences\n      onboardingCompleted\n    }\n  }\n": typeof types.UpdatePreferencesProfileDocument,
    "\n  mutation UpdateRegionProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      region\n    }\n  }\n": typeof types.UpdateRegionProfileDocument,
    "\n  mutation SubmitVerification($organisationId: ID!, $documentUrls: [String!]!) {\n    submitVerification(organisationId: $organisationId, documentUrls: $documentUrls) {\n      id\n      status\n    }\n  }\n": typeof types.SubmitVerificationDocument,
    "\n  query OrganisationApplicationsInbox($organisationId: ID!) {\n    organisationJobApplications(organisationId: $organisationId) {\n      id status fullName email phoneNumber gender dateOfBirth experience yearsOfExperience\n      currentSalary expectedSalary portfolioUrl linkedInProfile createdAt\n      education { highestQualification institutionName yearOfEnrollment yearOfCompletion marksGrades degreeType }\n      listing { id title }\n    }\n  }\n": typeof types.OrganisationApplicationsInboxDocument,
    "\n  mutation UpdateOrganisationApplicationStatus($id: ID!, $status: ApplicationStatus!) {\n    updateJobApplicationStatus(id: $id, status: $status) { id status }\n  }\n": typeof types.UpdateOrganisationApplicationStatusDocument,
    "\n  query OrganisationNotifications {\n    myOrganisations { id name }\n  }\n": typeof types.OrganisationNotificationsDocument,
    "\n  query ApplicationNotifications($organisationId: ID!) {\n    organisationJobApplications(organisationId: $organisationId) {\n      id fullName status createdAt\n      listing { id title }\n    }\n  }\n": typeof types.ApplicationNotificationsDocument,
    "\n  query OrganisationTeamPage($id: ID!) {\n    organisationTeam(organisationId: $id) {\n      user {\n        id\n        name\n        email\n        avatarUrl\n      }\n      roles\n      joinedAt\n    }\n    organisationInvites(organisationId: $id) {\n      id\n      email\n      roles\n      status\n      token\n      expiresAt\n      createdAt\n    }\n  }\n": typeof types.OrganisationTeamPageDocument,
    "\n  mutation InviteTeamMember($id: ID!, $email: String!, $roles: [String!]!) {\n    inviteOrganisationMember(organisationId: $id, email: $email, roles: $roles) {\n      id\n      email\n      token\n      status\n      expiresAt\n      roles\n    }\n  }\n": typeof types.InviteTeamMemberDocument,
    "\n  mutation RevokeTeamInvite($id: ID!) {\n    revokeOrganisationInvite(id: $id) {\n      id\n      status\n    }\n  }\n": typeof types.RevokeTeamInviteDocument,
    "\n  mutation ResendTeamInvite($id: ID!) {\n    resendOrganisationInvite(id: $id) {\n      id\n      token\n      status\n      expiresAt\n    }\n  }\n": typeof types.ResendTeamInviteDocument,
    "\n  mutation UpdateTeamRoles($orgId: ID!, $userId: ID!, $roles: [String!]!) {\n    updateOrganisationMemberRoles(organisationId: $orgId, userId: $userId, roles: $roles) {\n      roles\n      user {\n        id\n      }\n    }\n  }\n": typeof types.UpdateTeamRolesDocument,
    "\n  mutation RemoveTeamMember($orgId: ID!, $userId: ID!) {\n    removeOrganisationMember(organisationId: $orgId, userId: $userId)\n  }\n": typeof types.RemoveTeamMemberDocument,
    "\n    query TeamOrgId {\n      myOrganisations {\n        id\n      }\n    }\n  ": typeof types.TeamOrgIdDocument,
    "\n  query Me {\n    me {\n      id\n      name\n      email\n      avatarUrl\n      isVerified\n      onboardingCompleted\n      region\n      preferences\n      roles\n      orgId\n    }\n  }\n": typeof types.MeDocument,
};
const documents: Documents = {
    "query OrganisationRouteAccess { myOrganisations { id } }": types.OrganisationRouteAccessDocument,
    "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      customToken\n    }\n  }\n": types.SignUpDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      firebaseUid\n      email\n      name\n    }\n  }\n": types.CreateUserDocument,
    "\n  mutation CreateOrganisation($input: CreateOrganisationInput!) {\n    createOrganisation(input: $input) {\n      id\n      name\n    }\n  }\n": types.CreateOrganisationDocument,
    "\n  mutation CreateMarketplaceItem($input: CreateMarketplaceItemInput!) {\n    createMarketplaceItem(input: $input) {\n      id\n      title\n      status\n    }\n  }\n": types.CreateMarketplaceItemDocument,
    "\n  mutation CreateJobListing($input: CreateJobListingInput!) {\n    createJobListing(input: $input) {\n      id\n      title\n      status\n    }\n  }\n": types.CreateJobListingDocument,
    "\n  mutation CreateEvent($input: CreateEventInput!) {\n    createEvent(input: $input) {\n      id\n      title\n      date\n      status\n    }\n  }\n": types.CreateEventDocument,
    "\n  mutation UpdateOrganisation($id: ID!, $input: UpdateOrganisationInput!) {\n    updateOrganisation(id: $id, input: $input) {\n      id\n      name\n      description\n      region\n      websiteUrl\n      socialLinks { whatsapp instagram facebook twitter website }\n    }\n  }\n": types.UpdateOrganisationDocument,
    "\n  query MyOrgJobListings {\n    myOrganisations {\n      id\n      jobListings {\n        id\n        title\n        roleType\n        workLocation\n        region\n        applicationDeadline\n        status\n        isPromoted\n        faithAlignmentTag\n        createdAt\n      }\n    }\n  }\n": types.MyOrgJobListingsDocument,
    "\n  query MyMarketplaceListings {\n    me {\n      id\n      marketplaceListings {\n        id\n        title\n        category\n        price\n        currency\n        condition\n        region\n        status\n        isDonation\n        createdAt\n      }\n    }\n  }\n": types.MyMarketplaceListingsDocument,
    "\n  query MyOrgEvents {\n    myOrganisations {\n      id\n      events {\n        edges {\n          id\n          title\n          category\n          date\n          location { type city country }\n          rsvpCount\n          capacityLimit\n          status\n          isRecurring\n        }\n      }\n    }\n  }\n": types.MyOrgEventsDocument,
    "\n  query MyOrganisations {\n    myOrganisations {\n      id\n      name\n      description\n      logoUrl\n      websiteUrl\n      socialLinks {\n        whatsapp\n        instagram\n        facebook\n        twitter\n        website\n      }\n      region\n      isVerified\n      followerCount\n    }\n  }\n": types.MyOrganisationsDocument,
    "\n  query Discovery($region: String, $search: String, $limit: Int) {\n    events(region: $region, search: $search, status: PUBLISHED, limit: $limit) {\n      edges { id title description category date region rsvpCount imageUrls location { city country type } }\n    }\n    jobListings(region: $region, search: $search, status: ACTIVE, limit: $limit) {\n      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } organisation { id name isVerified } }\n    }\n    marketplaceItems(region: $region, search: $search, status: AVAILABLE, limit: $limit) {\n      edges { id title description price currency condition region area imageUrls isDonation seller { id isVerified } }\n    }\n    organisations(region: $region, search: $search, limit: $limit) {\n      edges { id name description region logoUrl isVerified }\n    }\n  }\n": types.DiscoveryDocument,
    "\n  query AllEventsDirectory($region: String, $search: String, $category: EventCategory, $dateFrom: DateTime, $locationType: LocationType, $ticketed: Boolean, $sort: EventSort, $limit: Int, $after: String) {\n    events(region: $region, search: $search, category: $category, status: PUBLISHED, dateFrom: $dateFrom, locationType: $locationType, ticketed: $ticketed, sort: $sort, limit: $limit, after: $after) {\n      edges { id title description category date region rsvpCount imageUrls isPromoted location { type city country } }\n      hasNextPage endCursor\n    }\n  }\n": types.AllEventsDirectoryDocument,
    "\n  query AllJobsDirectory($region: String, $search: String, $roleType: RoleType, $workLocation: WorkLocation, $skillTags: [String!], $minSalary: Float, $maxSalary: Float, $sort: JobSort, $limit: Int, $after: String) {\n    jobListings(region: $region, search: $search, roleType: $roleType, workLocation: $workLocation, skillTags: $skillTags, minSalary: $minSalary, maxSalary: $maxSalary, status: ACTIVE, sort: $sort, limit: $limit, after: $after) {\n      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } applicationDeadline isPromoted organisation { id name isVerified } }\n      hasNextPage endCursor\n    }\n  }\n": types.AllJobsDirectoryDocument,
    "\n  query AllMarketplaceListings($region: String, $search: String, $category: MarketplaceCategory, $condition: ItemCondition, $subCategory: String, $minPrice: Float, $maxPrice: Float, $isDonation: Boolean, $sort: MarketplaceSort, $limit: Int, $after: String) {\n    marketplaceItems(region: $region, search: $search, category: $category, condition: $condition, subCategory: $subCategory, minPrice: $minPrice, maxPrice: $maxPrice, isDonation: $isDonation, status: AVAILABLE, sort: $sort, limit: $limit, after: $after) {\n      edges { id title description price currency condition category region imageUrls isDonation isPromoted seller { id isVerified } }\n      hasNextPage endCursor\n    }\n  }\n": types.AllMarketplaceListingsDocument,
    "\n  query EventDetails($id: ID!) {\n    event(id: $id) {\n      id title description category date endDate region\n      rsvpCount interestedCount savedCount confirmedCount capacityLimit waitlistCount\n      status imageUrls isPromoted externalTicketUrl\n      location { type address city country virtualLink }\n      hosts { id name description logoUrl region isVerified verificationTier websiteUrl }\n    }\n    relatedEvents: events(status: PUBLISHED, sort: POPULAR, limit: 20) {\n      edges { id title description category date region rsvpCount imageUrls location { city country type } }\n    }\n    myRsvps { id stage event { id } }\n  }\n": types.EventDetailsDocument,
    "\n  mutation EventDetailsRsvp($eventId: ID!, $stage: RsvpStage!) {\n    rsvpToEvent(eventId: $eventId, stage: $stage) { id stage }\n  }\n": types.EventDetailsRsvpDocument,
    "\n  mutation EventDetailsCancelRsvp($eventId: ID!) {\n    cancelRsvp(eventId: $eventId)\n  }\n": types.EventDetailsCancelRsvpDocument,
    "\n  query EventsHome($region: String, $search: String) {\n    trending: events(region: $region, search: $search, status: PUBLISHED, sort: POPULAR, limit: 6) { edges { ...HomeEvent } }\n    upcoming: events(region: $region, search: $search, status: PUBLISHED, sort: DATE_ASC, limit: 20) { edges { ...HomeEvent } }\n  }\n  fragment HomeEvent on Event {\n    id title description category date region rsvpCount imageUrls isPromoted\n    location { type city country }\n  }\n": types.EventsHomeDocument,
    "\n  query MyFollowingHub {\n    myFollowingOrganisations {\n      id name description logoUrl region isVerified followerCount\n      events(limit: 4) { edges { id title description category date region rsvpCount imageUrls status } }\n      jobListings { id title roleType workLocation region salaryRange { min max currency } status }\n      marketplaceListings { id title description price currency region imageUrls status isDonation }\n    }\n  }\n": types.MyFollowingHubDocument,
    "\n  query JobApplicationContext($id: ID!) {\n    jobListing(id: $id) { id title status applicationDeadline organisation { id name } }\n    myJobApplication(jobId: $id) { id status createdAt }\n  }\n": types.JobApplicationContextDocument,
    "\n  mutation SubmitInternalJobApplication($input: SubmitJobApplicationInput!) {\n    submitJobApplication(input: $input) { id status createdAt }\n  }\n": types.SubmitInternalJobApplicationDocument,
    "\n  query JobDetails($id: ID!) {\n    jobListing(id: $id) {\n      id title description roleType workLocation skillsRequired region\n      salaryRange { min max currency }\n      applicationDeadline externalApplyUrl status faithAlignmentTag\n      responsibilities educationalRequirement experience certifications otherSkills\n      faithDescription keyFaithRequirements applicationCount createdAt\n      organisation { id name isVerified description logoUrl region verificationTier websiteUrl }\n    }\n  }\n": types.JobDetailsDocument,
    "query JobSavedState($id: ID!) { isJobSaved(id: $id) }": types.JobSavedStateDocument,
    "mutation SaveJobDetails($id: ID!) { saveJob(id: $id) }": types.SaveJobDetailsDocument,
    "mutation UnsaveJobDetails($id: ID!) { unsaveJob(id: $id) }": types.UnsaveJobDetailsDocument,
    "\n  query JobsHome($region: String, $search: String) {\n    trending: jobListings(region: $region, search: $search, status: ACTIVE, sort: POPULAR, limit: 8) { edges { ...HomeJob } }\n    newest: jobListings(region: $region, search: $search, status: ACTIVE, sort: NEWEST, limit: 20) { edges { ...HomeJob } }\n    volunteering: jobListings(region: $region, search: $search, status: ACTIVE, roleType: VOLUNTEER, sort: NEWEST, limit: 8) { edges { ...HomeJob } }\n  }\n  fragment HomeJob on JobListing { id title roleType workLocation region skillsRequired salaryRange { min max currency } isPromoted organisation { id name isVerified } }\n": types.JobsHomeDocument,
    "\n  query MarketplaceDetails($id: ID!, $region: String, $category: MarketplaceCategory) {\n    marketplaceItem(id: $id) {\n      id title description price currency condition category area region imageUrls status\n      isDonation isPromoted flagCount subCategory dimensions otherAttributes maxRetailPrice\n      contactInfo showContactOnOffer createdAt\n      seller { id name avatarUrl bio isVerified region socialLinks { whatsapp instagram facebook website } }\n    }\n    marketplaceItems(region: $region, category: $category, status: AVAILABLE, limit: 5) {\n      edges { id title description price currency condition region imageUrls isDonation seller { id isVerified } }\n    }\n  }\n": types.MarketplaceDetailsDocument,
    "\n  mutation MarketplaceDetailsReport($itemId: ID!, $reason: String!) {\n    reportListing(itemId: $itemId, reason: $reason)\n  }\n": types.MarketplaceDetailsReportDocument,
    "query MarketplaceSavedState($id: ID!) { isMarketplaceItemSaved(id: $id) }": types.MarketplaceSavedStateDocument,
    "mutation SaveMarketplaceDetails($id: ID!) { saveMarketplaceItem(id: $id) }": types.SaveMarketplaceDetailsDocument,
    "mutation UnsaveMarketplaceDetails($id: ID!) { unsaveMarketplaceItem(id: $id) }": types.UnsaveMarketplaceDetailsDocument,
    "mutation StartListingConversation($listingId: ID!, $message: String!) { startListingConversation(listingId: $listingId, message: $message) { id } }": types.StartListingConversationDocument,
    "\n  query MarketplaceHome($region: String, $search: String) {\n    promoted: marketplaceItems(region: $region, search: $search, status: AVAILABLE, sort: POPULAR, limit: 8) { edges { ...HomeListing } }\n    newest: marketplaceItems(region: $region, search: $search, status: AVAILABLE, sort: NEWEST, limit: 20) { edges { ...HomeListing } }\n    donations: marketplaceItems(region: $region, search: $search, status: AVAILABLE, isDonation: true, sort: NEWEST, limit: 8) { edges { ...HomeListing } }\n  }\n  fragment HomeListing on MarketplaceItem { id title description price currency condition category region imageUrls isDonation isPromoted seller { id isVerified } }\n": types.MarketplaceHomeDocument,
    "query MessagingThreads($role: MessageParticipantRole) { myMessageThreads(role: $role, limit: 50) { edges { id status lastMessage lastMessageAt unreadCount buyer { id firebaseUid name avatarUrl } seller { id firebaseUid name avatarUrl } listing { id title imageUrls status } } } unreadMessageCount }": types.MessagingThreadsDocument,
    "query MessagingThread($id: ID!) { messageThread(id: $id) { id status buyer { id firebaseUid name avatarUrl } seller { id firebaseUid name avatarUrl } listing { id title imageUrls status price currency } messages(limit: 100) { edges { id type body readAt createdAt sender { id firebaseUid name avatarUrl } } } } }": types.MessagingThreadDocument,
    "mutation SendThreadMessage($id: ID!, $body: String!) { sendMessage(threadId: $id, body: $body) { id } }": types.SendThreadMessageDocument,
    "mutation ReadThread($id: ID!) { markThreadRead(threadId: $id) }": types.ReadThreadDocument,
    "mutation ArchiveMessageThread($id: ID!) { archiveThread(threadId: $id) { id status } }": types.ArchiveMessageThreadDocument,
    "\n  query MyApplications {\n    me {\n      id\n      jobApplications {\n        id\n        status\n        createdAt\n        updatedAt\n        listing {\n          id\n          title\n          organisation { id name isVerified }\n        }\n      }\n    }\n  }\n": types.MyApplicationsDocument,
    "\n  query OrganisationInvitation($token: String!) {\n    organisationInvite(token: $token) {\n      id\n      email\n      roles\n      status\n      expiresAt\n      organisation {\n        id\n        name\n        logoUrl\n      }\n    }\n  }\n": types.OrganisationInvitationDocument,
    "\n  mutation AcceptOrganisationInvitation($token: String!) {\n    acceptOrganisationInvite(token: $token) {\n      id\n      name\n    }\n  }\n": types.AcceptOrganisationInvitationDocument,
    "\n  query PublicOrganisationProfile($id: ID!) {\n    organisation(id: $id) {\n      id name description logoUrl region isVerified verificationTier followerCount websiteUrl createdAt\n      socialLinks { whatsapp instagram facebook twitter website }\n      events(limit: 8) { edges { id title description category date region rsvpCount imageUrls status } }\n      jobListings { id title roleType workLocation region salaryRange { min max currency } status isPromoted }\n      marketplaceListings { id title description price currency region imageUrls status isDonation isPromoted }\n    }\n    isFollowingOrganisation(organisationId: $id)\n  }\n": types.PublicOrganisationProfileDocument,
    "mutation FollowPublicOrganisation($id: ID!) { followOrganisation(organisationId: $id) { id followerCount } }": types.FollowPublicOrganisationDocument,
    "mutation UnfollowPublicOrganisation($id: ID!) { unfollowOrganisation(organisationId: $id) { id followerCount } }": types.UnfollowPublicOrganisationDocument,
    "query SavedItemsHub { myRsvps(stage: SAVED) { id event { id title description category date region rsvpCount imageUrls hosts { isVerified } } } mySavedJobs { id title roleType workLocation region salaryRange { min max currency } organisation { name isVerified } } mySavedMarketplaceItems { id title description price currency region imageUrls isDonation seller { isVerified } } }": types.SavedItemsHubDocument,
    "mutation RemoveSavedEvent($id: ID!) { cancelRsvp(eventId: $id) }": types.RemoveSavedEventDocument,
    "mutation RemoveSavedJob($id: ID!) { unsaveJob(id: $id) }": types.RemoveSavedJobDocument,
    "mutation RemoveSavedMarketplace($id: ID!) { unsaveMarketplaceItem(id: $id) }": types.RemoveSavedMarketplaceDocument,
    "\n  mutation UpdatePreferencesProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      preferences\n      onboardingCompleted\n    }\n  }\n": types.UpdatePreferencesProfileDocument,
    "\n  mutation UpdateRegionProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      region\n    }\n  }\n": types.UpdateRegionProfileDocument,
    "\n  mutation SubmitVerification($organisationId: ID!, $documentUrls: [String!]!) {\n    submitVerification(organisationId: $organisationId, documentUrls: $documentUrls) {\n      id\n      status\n    }\n  }\n": types.SubmitVerificationDocument,
    "\n  query OrganisationApplicationsInbox($organisationId: ID!) {\n    organisationJobApplications(organisationId: $organisationId) {\n      id status fullName email phoneNumber gender dateOfBirth experience yearsOfExperience\n      currentSalary expectedSalary portfolioUrl linkedInProfile createdAt\n      education { highestQualification institutionName yearOfEnrollment yearOfCompletion marksGrades degreeType }\n      listing { id title }\n    }\n  }\n": types.OrganisationApplicationsInboxDocument,
    "\n  mutation UpdateOrganisationApplicationStatus($id: ID!, $status: ApplicationStatus!) {\n    updateJobApplicationStatus(id: $id, status: $status) { id status }\n  }\n": types.UpdateOrganisationApplicationStatusDocument,
    "\n  query OrganisationNotifications {\n    myOrganisations { id name }\n  }\n": types.OrganisationNotificationsDocument,
    "\n  query ApplicationNotifications($organisationId: ID!) {\n    organisationJobApplications(organisationId: $organisationId) {\n      id fullName status createdAt\n      listing { id title }\n    }\n  }\n": types.ApplicationNotificationsDocument,
    "\n  query OrganisationTeamPage($id: ID!) {\n    organisationTeam(organisationId: $id) {\n      user {\n        id\n        name\n        email\n        avatarUrl\n      }\n      roles\n      joinedAt\n    }\n    organisationInvites(organisationId: $id) {\n      id\n      email\n      roles\n      status\n      token\n      expiresAt\n      createdAt\n    }\n  }\n": types.OrganisationTeamPageDocument,
    "\n  mutation InviteTeamMember($id: ID!, $email: String!, $roles: [String!]!) {\n    inviteOrganisationMember(organisationId: $id, email: $email, roles: $roles) {\n      id\n      email\n      token\n      status\n      expiresAt\n      roles\n    }\n  }\n": types.InviteTeamMemberDocument,
    "\n  mutation RevokeTeamInvite($id: ID!) {\n    revokeOrganisationInvite(id: $id) {\n      id\n      status\n    }\n  }\n": types.RevokeTeamInviteDocument,
    "\n  mutation ResendTeamInvite($id: ID!) {\n    resendOrganisationInvite(id: $id) {\n      id\n      token\n      status\n      expiresAt\n    }\n  }\n": types.ResendTeamInviteDocument,
    "\n  mutation UpdateTeamRoles($orgId: ID!, $userId: ID!, $roles: [String!]!) {\n    updateOrganisationMemberRoles(organisationId: $orgId, userId: $userId, roles: $roles) {\n      roles\n      user {\n        id\n      }\n    }\n  }\n": types.UpdateTeamRolesDocument,
    "\n  mutation RemoveTeamMember($orgId: ID!, $userId: ID!) {\n    removeOrganisationMember(organisationId: $orgId, userId: $userId)\n  }\n": types.RemoveTeamMemberDocument,
    "\n    query TeamOrgId {\n      myOrganisations {\n        id\n      }\n    }\n  ": types.TeamOrgIdDocument,
    "\n  query Me {\n    me {\n      id\n      name\n      email\n      avatarUrl\n      isVerified\n      onboardingCompleted\n      region\n      preferences\n      roles\n      orgId\n    }\n  }\n": types.MeDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query OrganisationRouteAccess { myOrganisations { id } }"): (typeof documents)["query OrganisationRouteAccess { myOrganisations { id } }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      customToken\n    }\n  }\n"): (typeof documents)["\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      customToken\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      firebaseUid\n      email\n      name\n    }\n  }\n"): (typeof documents)["\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      firebaseUid\n      email\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateOrganisation($input: CreateOrganisationInput!) {\n    createOrganisation(input: $input) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  mutation CreateOrganisation($input: CreateOrganisationInput!) {\n    createOrganisation(input: $input) {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateMarketplaceItem($input: CreateMarketplaceItemInput!) {\n    createMarketplaceItem(input: $input) {\n      id\n      title\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation CreateMarketplaceItem($input: CreateMarketplaceItemInput!) {\n    createMarketplaceItem(input: $input) {\n      id\n      title\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateJobListing($input: CreateJobListingInput!) {\n    createJobListing(input: $input) {\n      id\n      title\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation CreateJobListing($input: CreateJobListingInput!) {\n    createJobListing(input: $input) {\n      id\n      title\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateEvent($input: CreateEventInput!) {\n    createEvent(input: $input) {\n      id\n      title\n      date\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation CreateEvent($input: CreateEventInput!) {\n    createEvent(input: $input) {\n      id\n      title\n      date\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateOrganisation($id: ID!, $input: UpdateOrganisationInput!) {\n    updateOrganisation(id: $id, input: $input) {\n      id\n      name\n      description\n      region\n      websiteUrl\n      socialLinks { whatsapp instagram facebook twitter website }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateOrganisation($id: ID!, $input: UpdateOrganisationInput!) {\n    updateOrganisation(id: $id, input: $input) {\n      id\n      name\n      description\n      region\n      websiteUrl\n      socialLinks { whatsapp instagram facebook twitter website }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MyOrgJobListings {\n    myOrganisations {\n      id\n      jobListings {\n        id\n        title\n        roleType\n        workLocation\n        region\n        applicationDeadline\n        status\n        isPromoted\n        faithAlignmentTag\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query MyOrgJobListings {\n    myOrganisations {\n      id\n      jobListings {\n        id\n        title\n        roleType\n        workLocation\n        region\n        applicationDeadline\n        status\n        isPromoted\n        faithAlignmentTag\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MyMarketplaceListings {\n    me {\n      id\n      marketplaceListings {\n        id\n        title\n        category\n        price\n        currency\n        condition\n        region\n        status\n        isDonation\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query MyMarketplaceListings {\n    me {\n      id\n      marketplaceListings {\n        id\n        title\n        category\n        price\n        currency\n        condition\n        region\n        status\n        isDonation\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MyOrgEvents {\n    myOrganisations {\n      id\n      events {\n        edges {\n          id\n          title\n          category\n          date\n          location { type city country }\n          rsvpCount\n          capacityLimit\n          status\n          isRecurring\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query MyOrgEvents {\n    myOrganisations {\n      id\n      events {\n        edges {\n          id\n          title\n          category\n          date\n          location { type city country }\n          rsvpCount\n          capacityLimit\n          status\n          isRecurring\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MyOrganisations {\n    myOrganisations {\n      id\n      name\n      description\n      logoUrl\n      websiteUrl\n      socialLinks {\n        whatsapp\n        instagram\n        facebook\n        twitter\n        website\n      }\n      region\n      isVerified\n      followerCount\n    }\n  }\n"): (typeof documents)["\n  query MyOrganisations {\n    myOrganisations {\n      id\n      name\n      description\n      logoUrl\n      websiteUrl\n      socialLinks {\n        whatsapp\n        instagram\n        facebook\n        twitter\n        website\n      }\n      region\n      isVerified\n      followerCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Discovery($region: String, $search: String, $limit: Int) {\n    events(region: $region, search: $search, status: PUBLISHED, limit: $limit) {\n      edges { id title description category date region rsvpCount imageUrls location { city country type } }\n    }\n    jobListings(region: $region, search: $search, status: ACTIVE, limit: $limit) {\n      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } organisation { id name isVerified } }\n    }\n    marketplaceItems(region: $region, search: $search, status: AVAILABLE, limit: $limit) {\n      edges { id title description price currency condition region area imageUrls isDonation seller { id isVerified } }\n    }\n    organisations(region: $region, search: $search, limit: $limit) {\n      edges { id name description region logoUrl isVerified }\n    }\n  }\n"): (typeof documents)["\n  query Discovery($region: String, $search: String, $limit: Int) {\n    events(region: $region, search: $search, status: PUBLISHED, limit: $limit) {\n      edges { id title description category date region rsvpCount imageUrls location { city country type } }\n    }\n    jobListings(region: $region, search: $search, status: ACTIVE, limit: $limit) {\n      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } organisation { id name isVerified } }\n    }\n    marketplaceItems(region: $region, search: $search, status: AVAILABLE, limit: $limit) {\n      edges { id title description price currency condition region area imageUrls isDonation seller { id isVerified } }\n    }\n    organisations(region: $region, search: $search, limit: $limit) {\n      edges { id name description region logoUrl isVerified }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query AllEventsDirectory($region: String, $search: String, $category: EventCategory, $dateFrom: DateTime, $locationType: LocationType, $ticketed: Boolean, $sort: EventSort, $limit: Int, $after: String) {\n    events(region: $region, search: $search, category: $category, status: PUBLISHED, dateFrom: $dateFrom, locationType: $locationType, ticketed: $ticketed, sort: $sort, limit: $limit, after: $after) {\n      edges { id title description category date region rsvpCount imageUrls isPromoted location { type city country } }\n      hasNextPage endCursor\n    }\n  }\n"): (typeof documents)["\n  query AllEventsDirectory($region: String, $search: String, $category: EventCategory, $dateFrom: DateTime, $locationType: LocationType, $ticketed: Boolean, $sort: EventSort, $limit: Int, $after: String) {\n    events(region: $region, search: $search, category: $category, status: PUBLISHED, dateFrom: $dateFrom, locationType: $locationType, ticketed: $ticketed, sort: $sort, limit: $limit, after: $after) {\n      edges { id title description category date region rsvpCount imageUrls isPromoted location { type city country } }\n      hasNextPage endCursor\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query AllJobsDirectory($region: String, $search: String, $roleType: RoleType, $workLocation: WorkLocation, $skillTags: [String!], $minSalary: Float, $maxSalary: Float, $sort: JobSort, $limit: Int, $after: String) {\n    jobListings(region: $region, search: $search, roleType: $roleType, workLocation: $workLocation, skillTags: $skillTags, minSalary: $minSalary, maxSalary: $maxSalary, status: ACTIVE, sort: $sort, limit: $limit, after: $after) {\n      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } applicationDeadline isPromoted organisation { id name isVerified } }\n      hasNextPage endCursor\n    }\n  }\n"): (typeof documents)["\n  query AllJobsDirectory($region: String, $search: String, $roleType: RoleType, $workLocation: WorkLocation, $skillTags: [String!], $minSalary: Float, $maxSalary: Float, $sort: JobSort, $limit: Int, $after: String) {\n    jobListings(region: $region, search: $search, roleType: $roleType, workLocation: $workLocation, skillTags: $skillTags, minSalary: $minSalary, maxSalary: $maxSalary, status: ACTIVE, sort: $sort, limit: $limit, after: $after) {\n      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } applicationDeadline isPromoted organisation { id name isVerified } }\n      hasNextPage endCursor\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query AllMarketplaceListings($region: String, $search: String, $category: MarketplaceCategory, $condition: ItemCondition, $subCategory: String, $minPrice: Float, $maxPrice: Float, $isDonation: Boolean, $sort: MarketplaceSort, $limit: Int, $after: String) {\n    marketplaceItems(region: $region, search: $search, category: $category, condition: $condition, subCategory: $subCategory, minPrice: $minPrice, maxPrice: $maxPrice, isDonation: $isDonation, status: AVAILABLE, sort: $sort, limit: $limit, after: $after) {\n      edges { id title description price currency condition category region imageUrls isDonation isPromoted seller { id isVerified } }\n      hasNextPage endCursor\n    }\n  }\n"): (typeof documents)["\n  query AllMarketplaceListings($region: String, $search: String, $category: MarketplaceCategory, $condition: ItemCondition, $subCategory: String, $minPrice: Float, $maxPrice: Float, $isDonation: Boolean, $sort: MarketplaceSort, $limit: Int, $after: String) {\n    marketplaceItems(region: $region, search: $search, category: $category, condition: $condition, subCategory: $subCategory, minPrice: $minPrice, maxPrice: $maxPrice, isDonation: $isDonation, status: AVAILABLE, sort: $sort, limit: $limit, after: $after) {\n      edges { id title description price currency condition category region imageUrls isDonation isPromoted seller { id isVerified } }\n      hasNextPage endCursor\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query EventDetails($id: ID!) {\n    event(id: $id) {\n      id title description category date endDate region\n      rsvpCount interestedCount savedCount confirmedCount capacityLimit waitlistCount\n      status imageUrls isPromoted externalTicketUrl\n      location { type address city country virtualLink }\n      hosts { id name description logoUrl region isVerified verificationTier websiteUrl }\n    }\n    relatedEvents: events(status: PUBLISHED, sort: POPULAR, limit: 20) {\n      edges { id title description category date region rsvpCount imageUrls location { city country type } }\n    }\n    myRsvps { id stage event { id } }\n  }\n"): (typeof documents)["\n  query EventDetails($id: ID!) {\n    event(id: $id) {\n      id title description category date endDate region\n      rsvpCount interestedCount savedCount confirmedCount capacityLimit waitlistCount\n      status imageUrls isPromoted externalTicketUrl\n      location { type address city country virtualLink }\n      hosts { id name description logoUrl region isVerified verificationTier websiteUrl }\n    }\n    relatedEvents: events(status: PUBLISHED, sort: POPULAR, limit: 20) {\n      edges { id title description category date region rsvpCount imageUrls location { city country type } }\n    }\n    myRsvps { id stage event { id } }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation EventDetailsRsvp($eventId: ID!, $stage: RsvpStage!) {\n    rsvpToEvent(eventId: $eventId, stage: $stage) { id stage }\n  }\n"): (typeof documents)["\n  mutation EventDetailsRsvp($eventId: ID!, $stage: RsvpStage!) {\n    rsvpToEvent(eventId: $eventId, stage: $stage) { id stage }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation EventDetailsCancelRsvp($eventId: ID!) {\n    cancelRsvp(eventId: $eventId)\n  }\n"): (typeof documents)["\n  mutation EventDetailsCancelRsvp($eventId: ID!) {\n    cancelRsvp(eventId: $eventId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query EventsHome($region: String, $search: String) {\n    trending: events(region: $region, search: $search, status: PUBLISHED, sort: POPULAR, limit: 6) { edges { ...HomeEvent } }\n    upcoming: events(region: $region, search: $search, status: PUBLISHED, sort: DATE_ASC, limit: 20) { edges { ...HomeEvent } }\n  }\n  fragment HomeEvent on Event {\n    id title description category date region rsvpCount imageUrls isPromoted\n    location { type city country }\n  }\n"): (typeof documents)["\n  query EventsHome($region: String, $search: String) {\n    trending: events(region: $region, search: $search, status: PUBLISHED, sort: POPULAR, limit: 6) { edges { ...HomeEvent } }\n    upcoming: events(region: $region, search: $search, status: PUBLISHED, sort: DATE_ASC, limit: 20) { edges { ...HomeEvent } }\n  }\n  fragment HomeEvent on Event {\n    id title description category date region rsvpCount imageUrls isPromoted\n    location { type city country }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MyFollowingHub {\n    myFollowingOrganisations {\n      id name description logoUrl region isVerified followerCount\n      events(limit: 4) { edges { id title description category date region rsvpCount imageUrls status } }\n      jobListings { id title roleType workLocation region salaryRange { min max currency } status }\n      marketplaceListings { id title description price currency region imageUrls status isDonation }\n    }\n  }\n"): (typeof documents)["\n  query MyFollowingHub {\n    myFollowingOrganisations {\n      id name description logoUrl region isVerified followerCount\n      events(limit: 4) { edges { id title description category date region rsvpCount imageUrls status } }\n      jobListings { id title roleType workLocation region salaryRange { min max currency } status }\n      marketplaceListings { id title description price currency region imageUrls status isDonation }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query JobApplicationContext($id: ID!) {\n    jobListing(id: $id) { id title status applicationDeadline organisation { id name } }\n    myJobApplication(jobId: $id) { id status createdAt }\n  }\n"): (typeof documents)["\n  query JobApplicationContext($id: ID!) {\n    jobListing(id: $id) { id title status applicationDeadline organisation { id name } }\n    myJobApplication(jobId: $id) { id status createdAt }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SubmitInternalJobApplication($input: SubmitJobApplicationInput!) {\n    submitJobApplication(input: $input) { id status createdAt }\n  }\n"): (typeof documents)["\n  mutation SubmitInternalJobApplication($input: SubmitJobApplicationInput!) {\n    submitJobApplication(input: $input) { id status createdAt }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query JobDetails($id: ID!) {\n    jobListing(id: $id) {\n      id title description roleType workLocation skillsRequired region\n      salaryRange { min max currency }\n      applicationDeadline externalApplyUrl status faithAlignmentTag\n      responsibilities educationalRequirement experience certifications otherSkills\n      faithDescription keyFaithRequirements applicationCount createdAt\n      organisation { id name isVerified description logoUrl region verificationTier websiteUrl }\n    }\n  }\n"): (typeof documents)["\n  query JobDetails($id: ID!) {\n    jobListing(id: $id) {\n      id title description roleType workLocation skillsRequired region\n      salaryRange { min max currency }\n      applicationDeadline externalApplyUrl status faithAlignmentTag\n      responsibilities educationalRequirement experience certifications otherSkills\n      faithDescription keyFaithRequirements applicationCount createdAt\n      organisation { id name isVerified description logoUrl region verificationTier websiteUrl }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query JobSavedState($id: ID!) { isJobSaved(id: $id) }"): (typeof documents)["query JobSavedState($id: ID!) { isJobSaved(id: $id) }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation SaveJobDetails($id: ID!) { saveJob(id: $id) }"): (typeof documents)["mutation SaveJobDetails($id: ID!) { saveJob(id: $id) }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation UnsaveJobDetails($id: ID!) { unsaveJob(id: $id) }"): (typeof documents)["mutation UnsaveJobDetails($id: ID!) { unsaveJob(id: $id) }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query JobsHome($region: String, $search: String) {\n    trending: jobListings(region: $region, search: $search, status: ACTIVE, sort: POPULAR, limit: 8) { edges { ...HomeJob } }\n    newest: jobListings(region: $region, search: $search, status: ACTIVE, sort: NEWEST, limit: 20) { edges { ...HomeJob } }\n    volunteering: jobListings(region: $region, search: $search, status: ACTIVE, roleType: VOLUNTEER, sort: NEWEST, limit: 8) { edges { ...HomeJob } }\n  }\n  fragment HomeJob on JobListing { id title roleType workLocation region skillsRequired salaryRange { min max currency } isPromoted organisation { id name isVerified } }\n"): (typeof documents)["\n  query JobsHome($region: String, $search: String) {\n    trending: jobListings(region: $region, search: $search, status: ACTIVE, sort: POPULAR, limit: 8) { edges { ...HomeJob } }\n    newest: jobListings(region: $region, search: $search, status: ACTIVE, sort: NEWEST, limit: 20) { edges { ...HomeJob } }\n    volunteering: jobListings(region: $region, search: $search, status: ACTIVE, roleType: VOLUNTEER, sort: NEWEST, limit: 8) { edges { ...HomeJob } }\n  }\n  fragment HomeJob on JobListing { id title roleType workLocation region skillsRequired salaryRange { min max currency } isPromoted organisation { id name isVerified } }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MarketplaceDetails($id: ID!, $region: String, $category: MarketplaceCategory) {\n    marketplaceItem(id: $id) {\n      id title description price currency condition category area region imageUrls status\n      isDonation isPromoted flagCount subCategory dimensions otherAttributes maxRetailPrice\n      contactInfo showContactOnOffer createdAt\n      seller { id name avatarUrl bio isVerified region socialLinks { whatsapp instagram facebook website } }\n    }\n    marketplaceItems(region: $region, category: $category, status: AVAILABLE, limit: 5) {\n      edges { id title description price currency condition region imageUrls isDonation seller { id isVerified } }\n    }\n  }\n"): (typeof documents)["\n  query MarketplaceDetails($id: ID!, $region: String, $category: MarketplaceCategory) {\n    marketplaceItem(id: $id) {\n      id title description price currency condition category area region imageUrls status\n      isDonation isPromoted flagCount subCategory dimensions otherAttributes maxRetailPrice\n      contactInfo showContactOnOffer createdAt\n      seller { id name avatarUrl bio isVerified region socialLinks { whatsapp instagram facebook website } }\n    }\n    marketplaceItems(region: $region, category: $category, status: AVAILABLE, limit: 5) {\n      edges { id title description price currency condition region imageUrls isDonation seller { id isVerified } }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation MarketplaceDetailsReport($itemId: ID!, $reason: String!) {\n    reportListing(itemId: $itemId, reason: $reason)\n  }\n"): (typeof documents)["\n  mutation MarketplaceDetailsReport($itemId: ID!, $reason: String!) {\n    reportListing(itemId: $itemId, reason: $reason)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query MarketplaceSavedState($id: ID!) { isMarketplaceItemSaved(id: $id) }"): (typeof documents)["query MarketplaceSavedState($id: ID!) { isMarketplaceItemSaved(id: $id) }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation SaveMarketplaceDetails($id: ID!) { saveMarketplaceItem(id: $id) }"): (typeof documents)["mutation SaveMarketplaceDetails($id: ID!) { saveMarketplaceItem(id: $id) }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation UnsaveMarketplaceDetails($id: ID!) { unsaveMarketplaceItem(id: $id) }"): (typeof documents)["mutation UnsaveMarketplaceDetails($id: ID!) { unsaveMarketplaceItem(id: $id) }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation StartListingConversation($listingId: ID!, $message: String!) { startListingConversation(listingId: $listingId, message: $message) { id } }"): (typeof documents)["mutation StartListingConversation($listingId: ID!, $message: String!) { startListingConversation(listingId: $listingId, message: $message) { id } }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MarketplaceHome($region: String, $search: String) {\n    promoted: marketplaceItems(region: $region, search: $search, status: AVAILABLE, sort: POPULAR, limit: 8) { edges { ...HomeListing } }\n    newest: marketplaceItems(region: $region, search: $search, status: AVAILABLE, sort: NEWEST, limit: 20) { edges { ...HomeListing } }\n    donations: marketplaceItems(region: $region, search: $search, status: AVAILABLE, isDonation: true, sort: NEWEST, limit: 8) { edges { ...HomeListing } }\n  }\n  fragment HomeListing on MarketplaceItem { id title description price currency condition category region imageUrls isDonation isPromoted seller { id isVerified } }\n"): (typeof documents)["\n  query MarketplaceHome($region: String, $search: String) {\n    promoted: marketplaceItems(region: $region, search: $search, status: AVAILABLE, sort: POPULAR, limit: 8) { edges { ...HomeListing } }\n    newest: marketplaceItems(region: $region, search: $search, status: AVAILABLE, sort: NEWEST, limit: 20) { edges { ...HomeListing } }\n    donations: marketplaceItems(region: $region, search: $search, status: AVAILABLE, isDonation: true, sort: NEWEST, limit: 8) { edges { ...HomeListing } }\n  }\n  fragment HomeListing on MarketplaceItem { id title description price currency condition category region imageUrls isDonation isPromoted seller { id isVerified } }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query MessagingThreads($role: MessageParticipantRole) { myMessageThreads(role: $role, limit: 50) { edges { id status lastMessage lastMessageAt unreadCount buyer { id firebaseUid name avatarUrl } seller { id firebaseUid name avatarUrl } listing { id title imageUrls status } } } unreadMessageCount }"): (typeof documents)["query MessagingThreads($role: MessageParticipantRole) { myMessageThreads(role: $role, limit: 50) { edges { id status lastMessage lastMessageAt unreadCount buyer { id firebaseUid name avatarUrl } seller { id firebaseUid name avatarUrl } listing { id title imageUrls status } } } unreadMessageCount }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query MessagingThread($id: ID!) { messageThread(id: $id) { id status buyer { id firebaseUid name avatarUrl } seller { id firebaseUid name avatarUrl } listing { id title imageUrls status price currency } messages(limit: 100) { edges { id type body readAt createdAt sender { id firebaseUid name avatarUrl } } } } }"): (typeof documents)["query MessagingThread($id: ID!) { messageThread(id: $id) { id status buyer { id firebaseUid name avatarUrl } seller { id firebaseUid name avatarUrl } listing { id title imageUrls status price currency } messages(limit: 100) { edges { id type body readAt createdAt sender { id firebaseUid name avatarUrl } } } } }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation SendThreadMessage($id: ID!, $body: String!) { sendMessage(threadId: $id, body: $body) { id } }"): (typeof documents)["mutation SendThreadMessage($id: ID!, $body: String!) { sendMessage(threadId: $id, body: $body) { id } }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation ReadThread($id: ID!) { markThreadRead(threadId: $id) }"): (typeof documents)["mutation ReadThread($id: ID!) { markThreadRead(threadId: $id) }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation ArchiveMessageThread($id: ID!) { archiveThread(threadId: $id) { id status } }"): (typeof documents)["mutation ArchiveMessageThread($id: ID!) { archiveThread(threadId: $id) { id status } }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MyApplications {\n    me {\n      id\n      jobApplications {\n        id\n        status\n        createdAt\n        updatedAt\n        listing {\n          id\n          title\n          organisation { id name isVerified }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query MyApplications {\n    me {\n      id\n      jobApplications {\n        id\n        status\n        createdAt\n        updatedAt\n        listing {\n          id\n          title\n          organisation { id name isVerified }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query OrganisationInvitation($token: String!) {\n    organisationInvite(token: $token) {\n      id\n      email\n      roles\n      status\n      expiresAt\n      organisation {\n        id\n        name\n        logoUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  query OrganisationInvitation($token: String!) {\n    organisationInvite(token: $token) {\n      id\n      email\n      roles\n      status\n      expiresAt\n      organisation {\n        id\n        name\n        logoUrl\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AcceptOrganisationInvitation($token: String!) {\n    acceptOrganisationInvite(token: $token) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  mutation AcceptOrganisationInvitation($token: String!) {\n    acceptOrganisationInvite(token: $token) {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PublicOrganisationProfile($id: ID!) {\n    organisation(id: $id) {\n      id name description logoUrl region isVerified verificationTier followerCount websiteUrl createdAt\n      socialLinks { whatsapp instagram facebook twitter website }\n      events(limit: 8) { edges { id title description category date region rsvpCount imageUrls status } }\n      jobListings { id title roleType workLocation region salaryRange { min max currency } status isPromoted }\n      marketplaceListings { id title description price currency region imageUrls status isDonation isPromoted }\n    }\n    isFollowingOrganisation(organisationId: $id)\n  }\n"): (typeof documents)["\n  query PublicOrganisationProfile($id: ID!) {\n    organisation(id: $id) {\n      id name description logoUrl region isVerified verificationTier followerCount websiteUrl createdAt\n      socialLinks { whatsapp instagram facebook twitter website }\n      events(limit: 8) { edges { id title description category date region rsvpCount imageUrls status } }\n      jobListings { id title roleType workLocation region salaryRange { min max currency } status isPromoted }\n      marketplaceListings { id title description price currency region imageUrls status isDonation isPromoted }\n    }\n    isFollowingOrganisation(organisationId: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation FollowPublicOrganisation($id: ID!) { followOrganisation(organisationId: $id) { id followerCount } }"): (typeof documents)["mutation FollowPublicOrganisation($id: ID!) { followOrganisation(organisationId: $id) { id followerCount } }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation UnfollowPublicOrganisation($id: ID!) { unfollowOrganisation(organisationId: $id) { id followerCount } }"): (typeof documents)["mutation UnfollowPublicOrganisation($id: ID!) { unfollowOrganisation(organisationId: $id) { id followerCount } }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query SavedItemsHub { myRsvps(stage: SAVED) { id event { id title description category date region rsvpCount imageUrls hosts { isVerified } } } mySavedJobs { id title roleType workLocation region salaryRange { min max currency } organisation { name isVerified } } mySavedMarketplaceItems { id title description price currency region imageUrls isDonation seller { isVerified } } }"): (typeof documents)["query SavedItemsHub { myRsvps(stage: SAVED) { id event { id title description category date region rsvpCount imageUrls hosts { isVerified } } } mySavedJobs { id title roleType workLocation region salaryRange { min max currency } organisation { name isVerified } } mySavedMarketplaceItems { id title description price currency region imageUrls isDonation seller { isVerified } } }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation RemoveSavedEvent($id: ID!) { cancelRsvp(eventId: $id) }"): (typeof documents)["mutation RemoveSavedEvent($id: ID!) { cancelRsvp(eventId: $id) }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation RemoveSavedJob($id: ID!) { unsaveJob(id: $id) }"): (typeof documents)["mutation RemoveSavedJob($id: ID!) { unsaveJob(id: $id) }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation RemoveSavedMarketplace($id: ID!) { unsaveMarketplaceItem(id: $id) }"): (typeof documents)["mutation RemoveSavedMarketplace($id: ID!) { unsaveMarketplaceItem(id: $id) }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdatePreferencesProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      preferences\n      onboardingCompleted\n    }\n  }\n"): (typeof documents)["\n  mutation UpdatePreferencesProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      preferences\n      onboardingCompleted\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateRegionProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      region\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateRegionProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      region\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SubmitVerification($organisationId: ID!, $documentUrls: [String!]!) {\n    submitVerification(organisationId: $organisationId, documentUrls: $documentUrls) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation SubmitVerification($organisationId: ID!, $documentUrls: [String!]!) {\n    submitVerification(organisationId: $organisationId, documentUrls: $documentUrls) {\n      id\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query OrganisationApplicationsInbox($organisationId: ID!) {\n    organisationJobApplications(organisationId: $organisationId) {\n      id status fullName email phoneNumber gender dateOfBirth experience yearsOfExperience\n      currentSalary expectedSalary portfolioUrl linkedInProfile createdAt\n      education { highestQualification institutionName yearOfEnrollment yearOfCompletion marksGrades degreeType }\n      listing { id title }\n    }\n  }\n"): (typeof documents)["\n  query OrganisationApplicationsInbox($organisationId: ID!) {\n    organisationJobApplications(organisationId: $organisationId) {\n      id status fullName email phoneNumber gender dateOfBirth experience yearsOfExperience\n      currentSalary expectedSalary portfolioUrl linkedInProfile createdAt\n      education { highestQualification institutionName yearOfEnrollment yearOfCompletion marksGrades degreeType }\n      listing { id title }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateOrganisationApplicationStatus($id: ID!, $status: ApplicationStatus!) {\n    updateJobApplicationStatus(id: $id, status: $status) { id status }\n  }\n"): (typeof documents)["\n  mutation UpdateOrganisationApplicationStatus($id: ID!, $status: ApplicationStatus!) {\n    updateJobApplicationStatus(id: $id, status: $status) { id status }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query OrganisationNotifications {\n    myOrganisations { id name }\n  }\n"): (typeof documents)["\n  query OrganisationNotifications {\n    myOrganisations { id name }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ApplicationNotifications($organisationId: ID!) {\n    organisationJobApplications(organisationId: $organisationId) {\n      id fullName status createdAt\n      listing { id title }\n    }\n  }\n"): (typeof documents)["\n  query ApplicationNotifications($organisationId: ID!) {\n    organisationJobApplications(organisationId: $organisationId) {\n      id fullName status createdAt\n      listing { id title }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query OrganisationTeamPage($id: ID!) {\n    organisationTeam(organisationId: $id) {\n      user {\n        id\n        name\n        email\n        avatarUrl\n      }\n      roles\n      joinedAt\n    }\n    organisationInvites(organisationId: $id) {\n      id\n      email\n      roles\n      status\n      token\n      expiresAt\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query OrganisationTeamPage($id: ID!) {\n    organisationTeam(organisationId: $id) {\n      user {\n        id\n        name\n        email\n        avatarUrl\n      }\n      roles\n      joinedAt\n    }\n    organisationInvites(organisationId: $id) {\n      id\n      email\n      roles\n      status\n      token\n      expiresAt\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation InviteTeamMember($id: ID!, $email: String!, $roles: [String!]!) {\n    inviteOrganisationMember(organisationId: $id, email: $email, roles: $roles) {\n      id\n      email\n      token\n      status\n      expiresAt\n      roles\n    }\n  }\n"): (typeof documents)["\n  mutation InviteTeamMember($id: ID!, $email: String!, $roles: [String!]!) {\n    inviteOrganisationMember(organisationId: $id, email: $email, roles: $roles) {\n      id\n      email\n      token\n      status\n      expiresAt\n      roles\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RevokeTeamInvite($id: ID!) {\n    revokeOrganisationInvite(id: $id) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation RevokeTeamInvite($id: ID!) {\n    revokeOrganisationInvite(id: $id) {\n      id\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ResendTeamInvite($id: ID!) {\n    resendOrganisationInvite(id: $id) {\n      id\n      token\n      status\n      expiresAt\n    }\n  }\n"): (typeof documents)["\n  mutation ResendTeamInvite($id: ID!) {\n    resendOrganisationInvite(id: $id) {\n      id\n      token\n      status\n      expiresAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateTeamRoles($orgId: ID!, $userId: ID!, $roles: [String!]!) {\n    updateOrganisationMemberRoles(organisationId: $orgId, userId: $userId, roles: $roles) {\n      roles\n      user {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTeamRoles($orgId: ID!, $userId: ID!, $roles: [String!]!) {\n    updateOrganisationMemberRoles(organisationId: $orgId, userId: $userId, roles: $roles) {\n      roles\n      user {\n        id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RemoveTeamMember($orgId: ID!, $userId: ID!) {\n    removeOrganisationMember(organisationId: $orgId, userId: $userId)\n  }\n"): (typeof documents)["\n  mutation RemoveTeamMember($orgId: ID!, $userId: ID!) {\n    removeOrganisationMember(organisationId: $orgId, userId: $userId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query TeamOrgId {\n      myOrganisations {\n        id\n      }\n    }\n  "): (typeof documents)["\n    query TeamOrgId {\n      myOrganisations {\n        id\n      }\n    }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Me {\n    me {\n      id\n      name\n      email\n      avatarUrl\n      isVerified\n      onboardingCompleted\n      region\n      preferences\n      roles\n      orgId\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      name\n      email\n      avatarUrl\n      isVerified\n      onboardingCompleted\n      region\n      preferences\n      roles\n      orgId\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;