/*
 * Idempotent production demo seed.
 *
 * Creates two real Firebase login accounts plus linked records across the four
 * service databases. It never deletes collections and only updates documents
 * owned by deterministic demo IDs or the configured demo Firebase users.
 */
const crypto = require('crypto');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const { MongoClient, ObjectId } = mongoose.mongo;

const REQUIRED_CONFIRMATION = 'SEED_CHRISTIAN_LISTINGS_PRODUCTION_DEMO';
const uri = process.env.MONGO_URI;
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const orgEmail = normaliseEmail(process.env.DEMO_ORG_EMAIL);
const orgPassword = process.env.DEMO_ORG_PASSWORD;
const memberEmail = normaliseEmail(process.env.DEMO_MEMBER_EMAIL);
const memberPassword = process.env.DEMO_MEMBER_PASSWORD;
const publicAppUrl = (process.env.PUBLIC_APP_URL || 'https://christian-listing.firebaseapp.com').replace(/\/$/, '');

guardExecution();

const now = new Date();
const daysFromNow = (days, hour = 18) => {
  const value = new Date(now.getTime() + days * 86_400_000);
  value.setUTCHours(hour, 0, 0, 0);
  return value;
};
const daysAgo = (days) => new Date(now.getTime() - days * 86_400_000);
const oid = (label) => new ObjectId(crypto.createHash('sha256').update(`christian-listings-production-demo:${label}`).digest('hex').slice(0, 24));
const eventImageNames = ['event-theology.png', 'background/background.png', 'org-cta.png', 'spotlight-ad.jpg'];
const listingImageNames = ['car-ford.png', 'spotlight-ad.jpg', 'org-cta.png', 'event-theology.png', 'background/background.png'];
const assetUrl = (name) => `${publicAppUrl}/assets/${name}`;
const timestamps = { createdAt: now, updatedAt: now };

async function main() {
  console.log(`Starting protected production demo seed against ${databaseHost(uri)}...`);
  const firebaseAuth = initialiseFirebase().auth();
  const client = new MongoClient(uri);
  await client.connect();

  try {
    const identity = client.db('cl_identity');
    const eventsDb = client.db('cl_events');
    const classifieds = client.db('cl_classifieds');

    const ownerFirebase = await ensureFirebaseUser(firebaseAuth, {
      email: orgEmail, password: orgPassword, displayName: 'Grace Community Demo',
      claims: { accountType: 'organisation', roles: ['master_admin'] },
    });
    const memberFirebase = await ensureFirebaseUser(firebaseAuth, {
      email: memberEmail, password: memberPassword, displayName: 'Jordan Williams',
      claims: { accountType: 'user' },
    });

    const existingOrganisation = await identity.collection('organisations').findOne({ createdBy: ownerFirebase.uid });
    const organisationId = existingOrganisation?._id || oid('organisation');
    const existingOwner = await findExistingUser(identity.collection('users'), ownerFirebase.uid, orgEmail);
    const existingMember = await findExistingUser(identity.collection('users'), memberFirebase.uid, memberEmail);
    if (existingOwner?._id?.equals(existingMember?._id)) throw new Error('The organisation and member logins resolve to the same MongoDB user');
    await firebaseAuth.setCustomUserClaims(ownerFirebase.uid, {
      accountType: 'organisation', orgId: organisationId.toString(), roles: ['master_admin'],
    });
    await firebaseAuth.revokeRefreshTokens(ownerFirebase.uid);

    const organisation = buildOrganisation(organisationId, ownerFirebase.uid);
    const owner = buildOwner(existingOwner?._id || oid('user:org-owner'), ownerFirebase.uid, organisationId);
    const member = buildMember(existingMember?._id || oid('user:member'), memberFirebase.uid);
    const teamMembers = buildTeamMembers(organisationId, ownerFirebase.uid);
    const syntheticCandidates = buildSyntheticCandidates();
    const eventDocs = buildEvents(organisationId, ownerFirebase.uid);
    const jobDocs = buildJobs(organisationId, ownerFirebase.uid);
    const listingDocs = buildListings(organisationId, ownerFirebase.uid);
    const applications = buildApplications(jobDocs, organisationId, memberFirebase.uid, syntheticCandidates);
    for (const job of jobDocs) job.applicationCount = applications.filter((application) => application.jobId.equals(job._id)).length;
    const rsvps = buildRsvps(eventDocs, memberFirebase.uid);
    const savedClassifieds = buildSavedClassifieds(jobDocs, listingDocs, memberFirebase.uid);
    const { threads, messages } = buildMessages(listingDocs, organisationId, ownerFirebase.uid, memberFirebase.uid);
    const follows = [{ _id: oid('follow:member-org'), followerFirebaseUid: memberFirebase.uid, organisationId, ...timestamps }];
    const identityNotifications = [{ _id: oid('notification:new-follower'), organisationId, type: 'NEW_FOLLOWER', title: 'New organisation follower', message: 'Jordan Williams started following Grace Community London.', href: '/org/notifications', sourceId: memberFirebase.uid, dedupeKey: `demo-follow:${memberFirebase.uid}:${organisationId}`, readAt: null, ...timestamps }];
    const eventNotifications = [{ _id: oid('notification:rsvp-milestone'), organisationId, type: 'RSVP_MILESTONE', title: 'RSVP milestone reached', message: 'Sunday Celebration Gathering has reached 100 confirmed attendees.', href: '/org/events', sourceId: eventDocs[0]._id.toString(), dedupeKey: `demo-rsvp-milestone:${eventDocs[0]._id}:100`, readAt: null, ...timestamps }];
    const classifiedNotifications = [{ _id: oid('notification:listing-decision'), organisationId, type: 'LISTING_MODERATION_DECISION', title: 'Listing review completed', message: 'The listing Community PA System was reviewed and remains available.', href: '/org/listings', sourceId: listingDocs[4]._id.toString(), dedupeKey: `demo-listing-review:${listingDocs[4]._id}`, readAt: daysAgo(1), ...timestamps }];

    const counts = {
      firebaseUsers: 2,
      users: await upsertById(identity.collection('users'), [owner, member, ...teamMembers, ...syntheticCandidates]),
      organisations: await upsertById(identity.collection('organisations'), [organisation]),
      follows: await upsertById(identity.collection('followrelationships'), follows),
      identityNotifications: await upsertById(identity.collection('organisationnotifications'), identityNotifications),
      events: await upsertById(eventsDb.collection('events'), eventDocs),
      rsvps: await upsertById(eventsDb.collection('rsvps'), rsvps),
      eventNotifications: await upsertById(eventsDb.collection('organisationnotifications'), eventNotifications),
      jobs: await upsertById(classifieds.collection('joblistings'), jobDocs),
      applications: await upsertById(classifieds.collection('jobapplications'), applications),
      listings: await upsertById(classifieds.collection('marketplaceitems'), listingDocs),
      savedItems: await upsertById(classifieds.collection('savedclassifieds'), savedClassifieds),
      messageThreads: await upsertById(classifieds.collection('messagethreads'), threads),
      messages: await upsertById(classifieds.collection('messages'), messages),
      classifiedNotifications: await upsertById(classifieds.collection('organisationnotifications'), classifiedNotifications),
    };

    await validateSeed(firebaseAuth, identity, eventsDb, classifieds, organisationId, ownerFirebase.uid, memberFirebase.uid);
    console.log('Production demo seed complete:', counts);
    console.log(`Organisation login email: ${orgEmail}`);
    console.log(`Member/applicant login email: ${memberEmail}`);
    console.log('Passwords were read from environment variables and were not printed.');
    console.log(`Organisation ID: ${organisationId}`);
  } finally {
    await client.close();
    await admin.app().delete();
  }
}

function buildOrganisation(_id, ownerUid) {
  return {
    _id, createdBy: ownerUid, phoneNumber: '+44 20 7946 0958', contactEmail: orgEmail,
    name: 'Grace Community London',
    description: 'A vibrant, welcoming Christian community serving families, young adults and newcomers across London through worship, practical support and meaningful opportunities.',
    logoUrl: assetUrl('org-cta.png'), websiteUrl: publicAppUrl,
    socialLinks: { whatsapp: 'https://wa.me/442079460958', instagram: 'https://instagram.com/gracecommunitydemo', facebook: 'https://facebook.com/gracecommunitydemo', twitter: null, website: publicAppUrl },
    organisationType: 'Church', region: 'London, UK', regionCode: 'GB-LND',
    verificationDetails: { officialName: 'Grace Community London', registrationNumber: 'DEMO-CHARITY-10482', officialEmail: orgEmail, pocName: 'Grace Community Demo', pocTitle: 'Operations Director', documentUrls: [] },
    verificationStatus: 'VERIFIED', verificationTier: 'CHARITY', onboardingCompleted: true,
    isActive: true, deactivatedAt: null, followerCount: 248, warningCount: 0, ...timestamps,
  };
}

function buildOwner(_id, firebaseUid, orgId) {
  return {
    _id, firebaseUid, email: orgEmail, name: 'Grace Community Demo',
    avatarUrl: assetUrl('org-cta.png'), bio: 'Organisation administrator for the Christian Listings client demonstration.',
    socialLinks: { whatsapp: null, instagram: 'https://instagram.com/gracecommunitydemo', facebook: null, twitter: null, website: publicAppUrl },
    privacySettings: { profileVisibility: 'MEMBERS_ONLY', showAvatar: true, showRegion: true, showBio: true, showSocialLinks: true },
    isVerified: true, region: 'London, UK', regionCode: 'GB-LND',
    preferences: ['Worship & Services', 'Community & Social', 'Career & Volunteering', 'Marketplace Deals'],
    onboardingCompleted: true, accountStatus: 'ACTIVE', warningCount: 0, suspensionReason: null,
    roles: ['master_admin'], orgId, orgInvitedBy: null, orgJoinedAt: daysAgo(180), ...timestamps,
  };
}

function buildMember(_id, firebaseUid) {
  return {
    _id, firebaseUid, email: memberEmail, name: 'Jordan Williams',
    avatarUrl: assetUrl('event-theology.png'), bio: 'Community volunteer, job seeker and marketplace member based in London.',
    socialLinks: { whatsapp: null, instagram: null, facebook: null, twitter: null, website: 'https://www.linkedin.com' },
    privacySettings: { profileVisibility: 'MEMBERS_ONLY', showAvatar: true, showRegion: true, showBio: true, showSocialLinks: false },
    isVerified: true, region: 'London, UK', regionCode: 'GB-LND',
    preferences: ['Worship & Services', 'Conferences & Seminars', 'Career & Volunteering', 'Marketplace Deals'],
    onboardingCompleted: true, accountStatus: 'ACTIVE', warningCount: 0, suspensionReason: null,
    roles: [], orgId: null, orgInvitedBy: null, orgJoinedAt: null, ...timestamps,
  };
}

function buildTeamMembers(orgId, invitedBy) {
  const definitions = [
    ['team-events', 'Maya Thompson', 'maya.events.demo@example.test', ['events_manager'], 'Events and community programme manager.'],
    ['team-jobs', 'Nathan Mensah', 'nathan.jobs.demo@example.test', ['jobs_manager'], 'Employment and volunteer opportunities coordinator.'],
    ['team-marketplace', 'Abigail Clarke', 'abigail.marketplace.demo@example.test', ['classifieds_manager'], 'Marketplace and community-giving coordinator.'],
  ];
  return definitions.map(([key, name, email, roles, bio], index) => ({
    _id: oid(`user:${key}`), firebaseUid: `production-demo-${key}`, email, name,
    avatarUrl: assetUrl(eventImageNames[index]), bio, socialLinks: null,
    privacySettings: { profileVisibility: 'MEMBERS_ONLY', showAvatar: true, showRegion: true, showBio: true, showSocialLinks: false },
    isVerified: true, region: 'London, UK', regionCode: 'GB-LND', preferences: [], onboardingCompleted: true,
    accountStatus: 'ACTIVE', warningCount: 0, suspensionReason: null, roles, orgId,
    orgInvitedBy: invitedBy, orgJoinedAt: daysAgo(120 - index * 18), ...timestamps,
  }));
}

function buildSyntheticCandidates() {
  const names = ['Amara Okafor', 'Samuel Mensah', 'Naomi Clarke', 'Daniel Adeyemi', 'Ruth Thompson', 'Michael Boateng', 'Esther Johnson', 'David Owusu', 'Sarah Campbell', 'Joshua Brown'];
  return names.map((name, index) => ({
    _id: oid(`user:candidate:${index + 1}`), firebaseUid: `production-demo-candidate-${index + 1}`,
    email: `demo.candidate${index + 1}@example.test`, name, avatarUrl: null,
    bio: 'Demo candidate profile.', socialLinks: null,
    privacySettings: { profileVisibility: 'MEMBERS_ONLY', showAvatar: true, showRegion: true, showBio: true, showSocialLinks: false },
    isVerified: index % 3 === 0, region: 'London, UK', regionCode: 'GB-LND', preferences: ['Career & Volunteering'],
    onboardingCompleted: true, accountStatus: 'ACTIVE', warningCount: 0, suspensionReason: null,
    roles: [], orgId: null, orgInvitedBy: null, orgJoinedAt: null, ...timestamps,
  }));
}

function buildEvents(organisationId, ownerUid) {
  const definitions = [
    ['Sunday Celebration Gathering', 'A joyful all-ages worship service with live music, teaching and a warm welcome for newcomers.', 'WORSHIP', 'PHYSICAL', 3, 320, 112, false, false, 'Westminster'],
    ['Faith and Work Leadership Forum', 'Practical conversations with Christian leaders about integrity, purpose and influence in the workplace.', 'CONFERENCE', 'HYBRID', 8, 180, 86, true, true, 'Canary Wharf'],
    ['Young Adults Connect Evening', 'Food, conversation, worship and new friendships for people aged 18–35.', 'YOUTH', 'PHYSICAL', 12, 140, 74, false, false, 'Shoreditch'],
    ['Community Food Pantry Volunteer Day', 'Help sort, pack and distribute grocery parcels to local households.', 'CHARITY', 'PHYSICAL', 16, 90, 58, false, false, 'Southwark'],
    ['Marriage and Family Workshop', 'An encouraging afternoon of practical teaching and guided conversations for couples and parents.', 'CONFERENCE', 'PHYSICAL', 21, 120, 63, true, true, 'Kensington'],
    ['Online Bible Study: Book of James', 'A welcoming online study exploring practical faith through the book of James.', 'BIBLE_STUDY', 'VIRTUAL', 6, 250, 91, false, false, null],
    ['Gospel Music and Creative Arts Night', 'An uplifting showcase featuring gospel vocalists, musicians, poets and emerging creatives.', 'MUSIC', 'PHYSICAL', 27, 260, 134, true, true, 'Camden'],
    ['Newcomers Welcome Lunch', 'Meet the team, learn about the community and connect over a relaxed complimentary lunch.', 'COMMUNITY', 'PHYSICAL', 10, 100, 47, false, false, 'Brixton'],
    ['Prayer and Wellbeing Morning', 'A peaceful morning of guided prayer, reflection and practical wellbeing conversations.', 'WELFARE', 'HYBRID', 18, 110, 52, false, false, 'Greenwich'],
    ['Citywide Community Celebration', 'Music, family activities, refreshments and a message of hope for the whole community.', 'CULTURAL', 'PHYSICAL', 35, 400, 168, true, false, 'Royal Docks'],
  ];
  return definitions.map(([title, description, category, eventType, day, capacity, rsvpCount, isPromoted, isTicketed, city], index) => {
    const startDate = daysFromNow(day, index % 2 ? 18 : 10);
    return {
      _id: oid(`event:${index + 1}`), organisationId, createdBy: ownerUid, title, description, category, eventType,
      location: eventType === 'VIRTUAL' ? null : { address: `${city} Community Centre`, city, country: 'United Kingdom' },
      onlineUrl: eventType === 'PHYSICAL' ? null : 'https://meet.google.com/demo-community-room',
      region: 'London, UK', regionCode: 'GB-LND', startDate, endDate: new Date(startDate.getTime() + 2.5 * 3_600_000),
      seriesId: null, occurrenceNumber: null, originalStartDate: null, isSeriesException: false, overriddenFields: [],
      capacity, coverImageUrl: assetUrl(eventImageNames[index % eventImageNames.length]),
      imageUrls: [assetUrl(eventImageNames[index % eventImageNames.length]), assetUrl(eventImageNames[(index + 1) % eventImageNames.length])],
      videoUrls: [], videoPosterUrls: [], videoEmbedUrl: null,
      isTicketed, ticketUrl: isTicketed ? 'https://www.eventbrite.com' : null, notifyAttendees: true,
      status: 'PUBLISHED', adminSuspended: false, preAdminStatus: null, isPromoted,
      promotedUntil: isPromoted ? daysFromNow(30) : null, rsvpCount, ...timestamps,
    };
  });
}

function buildJobs(organisationId, ownerUid) {
  const definitions = [
    ['Community Outreach Coordinator', 'PAID', 'HYBRID', 32000, 38000, ['Community Engagement', 'Project Management', 'Safeguarding']],
    ['Digital Communications Officer', 'PAID', 'REMOTE', 30000, 36000, ['Social Media', 'Copywriting', 'Content Strategy']],
    ['Worship and Production Assistant', 'PAID', 'PHYSICAL', 27000, 31000, ['Live Sound', 'Event Production', 'Teamwork']],
    ['Food Pantry Programme Manager', 'PAID', 'PHYSICAL', 34000, 41000, ['Operations', 'Volunteer Management', 'Safeguarding']],
    ['Youth Mentor', 'VOLUNTEER', 'HYBRID', null, null, ['Youth Work', 'Mentoring', 'Communication']],
    ['Finance and Operations Intern', 'INTERNSHIP', 'HYBRID', 24000, 26000, ['Microsoft Excel', 'Accounting', 'Administration']],
    ['Children’s Ministry Coordinator', 'PAID', 'PHYSICAL', 29000, 34000, ['Teaching', 'Safeguarding', 'Leadership']],
    ['Graphic Designer', 'VOLUNTEER', 'REMOTE', null, null, ['Graphic Design', 'Branding', 'Adobe Creative Suite']],
    ['Facilities and Events Assistant', 'PAID', 'PHYSICAL', 26000, 29000, ['Facilities', 'Event Setup', 'Customer Service']],
    ['Newcomer Support Adviser', 'PAID', 'HYBRID', 31000, 37000, ['Case Management', 'Community Support', 'Communication']],
  ];
  return definitions.map(([title, employmentType, workLocation, salaryMin, salaryMax, skillsRequired], index) => ({
    _id: oid(`job:${index + 1}`), organisationId, createdBy: ownerUid, title,
    companyDisplayName: 'Grace Community London', employmentType, workLocation, skillsRequired,
    faithAlignmentTag: index === 2 || index === 6 ? 'FAITH_BACKGROUND_PREFERRED' : 'OPEN_TO_ALL',
    region: 'London, UK', regionCode: 'GB-LND', closingDate: daysFromNow(35 + index * 3),
    salaryMin, salaryMax, salaryCurrency: salaryMin === null ? null : 'GBP', salary: null,
    description: `${title} will help Grace Community London deliver welcoming, reliable programmes that make a measurable difference across the city. The successful candidate will join a supportive and collaborative team.`,
    responsibilities: ['Deliver high-quality work aligned with the role', 'Collaborate with staff and volunteers', 'Communicate progress and outcomes clearly', 'Support a safe and welcoming community environment'],
    educationalRequirement: employmentType === 'VOLUNTEER' ? 'No formal qualification required; relevant experience is welcomed.' : 'Relevant qualification or equivalent practical experience.',
    experience: index % 3 === 0 ? 'At least two years of relevant experience preferred.' : 'Relevant paid, voluntary or transferable experience welcomed.',
    certifications: index === 3 || index === 6 ? 'Enhanced DBS check required; support is available.' : null,
    otherSkills: 'Strong organisation, empathy and dependable communication.',
    faithDescription: index === 2 || index === 6 ? 'This role contributes directly to worship or children’s ministry.' : 'Applicants of all backgrounds who support our community values are welcome.',
    faithAlignedOnly: false, keyFaithRequirements: index === 2 ? ['Active Church Membership'] : [],
    externalApplyUrl: null, status: 'ACTIVE', adminSuspended: false, preAdminStatus: null,
    isPromoted: index < 3, promotedUntil: index < 3 ? daysFromNow(25) : null, applicationCount: 0, ...timestamps,
  }));
}

function buildListings(organisationId, ownerUid) {
  const definitions = [
    ['Community Minibus', 'OTHER', 'GOOD', 8500, 12000, false, 'A reliable 12-seat minibus used for community programmes, with service history and recent MOT.', 'Transport'],
    ['Portable PA Speaker System', 'ELECTRONICS', 'LIKE_NEW', 480, 650, false, 'Two powered speakers, compact mixer, stands and cables. Ideal for church or community events.', 'Audio Equipment'],
    ['Study Bible and Commentary Set', 'BOOKS', 'LIKE_NEW', 65, 110, false, 'A carefully kept collection of study Bibles, commentaries and ministry reference books.', 'Bibles'],
    ['Children’s Winter Clothing Bundle', 'CLOTHING', 'GOOD', 0, null, true, 'Clean winter coats, jumpers and trousers for children aged 6–10. Free to a family or community group.', 'Children’s Clothing'],
    ['Community Hall Folding Chairs', 'FURNITURE', 'GOOD', 240, 400, false, 'Set of 20 sturdy folding chairs with storage trolley. Collection from Southwark.', 'Chairs'],
    ['Wireless Microphone Set', 'ELECTRONICS', 'GOOD', 120, 190, false, 'Dual wireless handheld microphone system with receiver, case and power supply.', 'Audio Equipment'],
    ['Office Desks and Chairs', 'FURNITURE', 'LIKE_NEW', 0, null, true, 'Two desks and four ergonomic office chairs available free to a registered community project.', 'Office Furniture'],
    ['New Baby Essentials Packs', 'BABY_AND_KIDS', 'NEW', 0, null, true, 'Ten sealed packs containing nappies, wipes, baby toiletries and blankets for families in need.', 'Baby Essentials'],
    ['Gospel Sheet Music Collection', 'BOOKS', 'GOOD', 35, 70, false, 'Choir arrangements, piano books and contemporary gospel sheet music in good usable condition.', 'Music Books'],
    ['Catering Urns and Serving Equipment', 'FOOD', 'GOOD', 95, 160, false, 'Two commercial hot-water urns plus insulated serving trays for events and community meals.', 'Catering Equipment'],
  ];
  return definitions.map(([title, category, condition, sellingPrice, maxRetailPrice, isDonation, description, subCategory], index) => ({
    _id: oid(`listing:${index + 1}`), organisationId, createdBy: ownerUid, title, category, subCategory,
    description, condition, dimensions: index === 4 ? 'Folded chair: 92cm × 45cm × 8cm' : null,
    otherAttributes: isDonation ? 'Collection must be arranged in advance.' : 'Demonstration listing; contact the seller through Christian Listings.',
    region: 'London, UK', regionCode: 'GB-LND', area: index % 2 ? 'Southwark' : 'Westminster',
    sellingPrice, maxRetailPrice, currency: 'GBP', isDonation,
    imageUrls: [assetUrl(listingImageNames[index % listingImageNames.length]), assetUrl(listingImageNames[(index + 2) % listingImageNames.length])],
    videoUrl: null, videoPosterUrl: null, contactInfo: orgEmail, showContactOnOffer: false,
    status: index === 8 ? 'RESERVED' : index === 9 ? 'SOLD' : 'AVAILABLE',
    adminSuspended: false, preAdminStatus: null, isPromoted: index < 2,
    promotedUntil: index < 2 ? daysFromNow(25) : null, flagCount: 0, preReviewStatus: null, moderationCaseId: null, ...timestamps,
  }));
}

function buildRsvps(events, memberUid) {
  const stages = ['CONFIRMED', 'CONFIRMED', 'INTERESTED', 'SAVED', 'WAITLISTED'];
  return stages.map((stage, index) => ({
    _id: oid(`rsvp:${index + 1}`), eventId: events[index]._id, userFirebaseUid: memberUid,
    stage, source: 'OCCURRENCE', seriesRsvpId: null, createdAt: daysAgo(8 - index), updatedAt: daysAgo(2),
  }));
}

function buildApplications(jobs, organisationId, memberUid, syntheticCandidates) {
  const memberStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'HIRED', 'WITHDRAWN'];
  const memberApplications = memberStatuses.map((status, index) => application({
    key: `member:${index + 1}`, job: jobs[index], organisationId, uid: memberUid, name: 'Jordan Williams',
    email: memberEmail, status, index,
  }));
  const candidateStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'SUBMITTED', 'REJECTED', 'UNDER_REVIEW', 'SHORTLISTED', 'HIRED', 'SUBMITTED', 'UNDER_REVIEW'];
  const candidateApplications = syntheticCandidates.map((candidate, index) => application({
    key: `candidate:${index + 1}`, job: jobs[index], organisationId, uid: candidate.firebaseUid,
    name: candidate.name, email: candidate.email, status: candidateStatuses[index], index: index + 10,
  }));
  return [...memberApplications, ...candidateApplications];
}

function application({ key, job, organisationId, uid, name, email, status, index }) {
  return {
    _id: oid(`application:${key}`), jobId: job._id, organisationId, applicantFirebaseUid: uid,
    fullName: name, phoneNumber: `+44 7700 900${String(index + 10).slice(-3)}`, email,
    gender: index % 2 ? 'Female' : 'Male', dateOfBirth: new Date(Date.UTC(1990 + (index % 9), index % 12, 12)),
    education: [{ highestQualification: index % 3 === 0 ? 'Bachelor’s Degree' : 'Professional Diploma', institutionName: 'London Metropolitan College', yearOfEnrollment: 2012 + (index % 5), yearOfCompletion: 2015 + (index % 5), marksGrades: 'Merit', degreeType: 'Full-time' }],
    experienceDescription: 'Experienced in community-facing work, coordinating volunteers, communicating with diverse stakeholders and delivering reliable outcomes.',
    yearsOfExperience: 2 + (index % 7), currentSalary: index % 2 ? '£28,000' : null,
    expectedSalary: job.salaryMin ? `£${job.salaryMin.toLocaleString('en-GB')}` : 'Not applicable',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    portfolioUrl: index % 3 === 0 ? 'https://www.behance.net' : null,
    linkedInProfile: 'https://www.linkedin.com', acknowledged: true, status,
    createdAt: daysAgo(14 - (index % 10)), updatedAt: daysAgo(index % 3),
  };
}

function buildSavedClassifieds(jobs, listings, memberUid) {
  return [
    ...jobs.slice(0, 4).map((job, index) => ({ _id: oid(`saved-job:${index + 1}`), userFirebaseUid: memberUid, kind: 'JOB', targetId: job._id, createdAt: daysAgo(5 - index), updatedAt: daysAgo(5 - index) })),
    ...listings.slice(0, 4).map((listing, index) => ({ _id: oid(`saved-listing:${index + 1}`), userFirebaseUid: memberUid, kind: 'MARKETPLACE', targetId: listing._id, createdAt: daysAgo(4 - index), updatedAt: daysAgo(4 - index) })),
  ];
}

function buildMessages(listings, organisationId, sellerUid, buyerUid) {
  const conversationBodies = [
    ['Hello, is the PA speaker system still available?', 'Yes, it is available. You are welcome to test it before collecting.', 'Great, could I visit on Saturday morning?'],
    ['I’m interested in the Study Bible collection. Are all the volumes shown included?', 'Yes, the complete set is included and everything is in very good condition.', 'Perfect, I would like to arrange collection.'],
    ['Could our youth group collect the free clothing bundle this week?', 'Absolutely. Thursday evening or Saturday afternoon would work.', 'Saturday afternoon works for us, thank you!'],
  ];
  const listingIndexes = [1, 2, 3];
  const threads = [];
  const messages = [];
  conversationBodies.forEach((bodies, threadIndex) => {
    const listing = listings[listingIndexes[threadIndex]];
    const threadId = oid(`message-thread:${threadIndex + 1}`);
    const messageDates = [daysAgo(5 - threadIndex), daysAgo(4 - threadIndex), daysAgo(3 - threadIndex)];
    const senders = [buyerUid, sellerUid, buyerUid];
    bodies.forEach((body, messageIndex) => messages.push({
      _id: oid(`message:${threadIndex + 1}:${messageIndex + 1}`), threadId,
      senderFirebaseUid: senders[messageIndex], type: 'TEXT', body,
      readAt: messageIndex < 2 ? now : null, deletedAt: null, offerId: null,
      createdAt: messageDates[messageIndex], updatedAt: messageDates[messageIndex],
    }));
    threads.push({
      _id: threadId, listingId: listing._id, buyerFirebaseUid: buyerUid, sellerFirebaseUid: sellerUid,
      organisationId, status: 'ACTIVE', lastMessageText: bodies[2], lastMessageAt: messageDates[2],
      lastMessageSenderUid: buyerUid, buyerUnreadCount: 0, sellerUnreadCount: 1,
      createdAt: messageDates[0], updatedAt: messageDates[2],
    });
  });
  return { threads, messages };
}

async function validateSeed(firebaseAuth, identity, eventsDb, classifieds, organisationId, ownerUid, memberUid) {
  const eventIds = Array.from({ length: 10 }, (_, index) => oid(`event:${index + 1}`));
  const rsvpIds = Array.from({ length: 5 }, (_, index) => oid(`rsvp:${index + 1}`));
  const jobIds = Array.from({ length: 10 }, (_, index) => oid(`job:${index + 1}`));
  const listingIds = Array.from({ length: 10 }, (_, index) => oid(`listing:${index + 1}`));
  const memberApplicationIds = Array.from({ length: 6 }, (_, index) => oid(`application:member:${index + 1}`));
  const allApplicationIds = [
    ...memberApplicationIds,
    ...Array.from({ length: 10 }, (_, index) => oid(`application:candidate:${index + 1}`)),
  ];
  const savedIds = [
    ...Array.from({ length: 4 }, (_, index) => oid(`saved-job:${index + 1}`)),
    ...Array.from({ length: 4 }, (_, index) => oid(`saved-listing:${index + 1}`)),
  ];
  const threadIds = Array.from({ length: 3 }, (_, index) => oid(`message-thread:${index + 1}`));
  const messageIds = Array.from({ length: 3 }, (_, threadIndex) =>
    Array.from({ length: 3 }, (_, messageIndex) => oid(`message:${threadIndex + 1}:${messageIndex + 1}`)),
  ).flat();
  const checks = await Promise.all([
    identity.collection('users').countDocuments({ firebaseUid: { $in: [ownerUid, memberUid] } }),
    identity.collection('organisations').countDocuments({ _id: organisationId, createdBy: ownerUid }),
    identity.collection('users').countDocuments({ orgId: organisationId }),
    identity.collection('followrelationships').countDocuments({ _id: oid('follow:member-org'), followerFirebaseUid: memberUid, organisationId }),
    identity.collection('organisationnotifications').countDocuments({ _id: oid('notification:new-follower'), organisationId }),
    eventsDb.collection('events').countDocuments({ _id: { $in: eventIds }, organisationId }),
    eventsDb.collection('rsvps').countDocuments({ _id: { $in: rsvpIds }, userFirebaseUid: memberUid }),
    eventsDb.collection('organisationnotifications').countDocuments({ _id: oid('notification:rsvp-milestone'), organisationId }),
    classifieds.collection('joblistings').countDocuments({ _id: { $in: jobIds }, organisationId }),
    classifieds.collection('marketplaceitems').countDocuments({ _id: { $in: listingIds }, organisationId }),
    classifieds.collection('jobapplications').countDocuments({ _id: { $in: allApplicationIds }, organisationId }),
    classifieds.collection('jobapplications').countDocuments({ _id: { $in: memberApplicationIds }, applicantFirebaseUid: memberUid }),
    classifieds.collection('savedclassifieds').countDocuments({ _id: { $in: savedIds }, userFirebaseUid: memberUid }),
    classifieds.collection('messagethreads').countDocuments({ _id: { $in: threadIds }, buyerFirebaseUid: memberUid, organisationId }),
    classifieds.collection('messages').countDocuments({ _id: { $in: messageIds } }),
    classifieds.collection('organisationnotifications').countDocuments({ _id: oid('notification:listing-decision'), organisationId }),
  ]);
  const expected = [2, 1, 4, 1, 1, 10, 5, 1, 10, 10, 16, 6, 8, 3, 9, 1];
  checks.forEach((value, index) => {
    if (value !== expected[index]) throw new Error(`Demo seed validation failed at check ${index + 1}: expected ${expected[index]}, found ${value}`);
  });
  const missingEventImages = await eventsDb.collection('events').countDocuments({ _id: { $in: eventIds }, $or: [{ coverImageUrl: null }, { imageUrls: { $size: 0 } }] });
  const missingListingImages = await classifieds.collection('marketplaceitems').countDocuments({ _id: { $in: listingIds }, imageUrls: { $size: 0 } });
  if (missingEventImages || missingListingImages) throw new Error(`Demo image validation failed: ${missingEventImages} events and ${missingListingImages} listings are missing images`);
  const [firebaseOwner, firebaseMember] = await Promise.all([
    firebaseAuth.getUser(ownerUid),
    firebaseAuth.getUser(memberUid),
  ]);
  if (!firebaseOwner.emailVerified || firebaseOwner.customClaims?.accountType !== 'organisation' || firebaseOwner.customClaims?.orgId !== organisationId.toString() || !firebaseOwner.customClaims?.roles?.includes('master_admin')) {
    throw new Error('Demo organisation Firebase account or custom claims failed validation');
  }
  if (!firebaseMember.emailVerified || firebaseMember.customClaims?.accountType !== 'user') {
    throw new Error('Demo member Firebase account or custom claims failed validation');
  }
  console.log('Demo readiness validation passed: authentication, ownership, media and interaction records are coherent.');
}

async function upsertById(collection, documents) {
  if (!documents.length) return 0;
  await collection.bulkWrite(documents.map((document) => {
    const { _id, ...fields } = document;
    return { updateOne: { filter: { _id }, update: { $set: fields }, upsert: true } };
  }), { ordered: true });
  return documents.length;
}

async function findExistingUser(collection, firebaseUid, email) {
  const [byUid, byEmail] = await Promise.all([
    collection.findOne({ firebaseUid }),
    collection.findOne({ email }),
  ]);
  if (byUid && byEmail && !byUid._id.equals(byEmail._id)) {
    throw new Error(`Cannot safely link ${email}: its Firebase UID and email belong to different MongoDB users`);
  }
  return byUid || byEmail;
}

async function ensureFirebaseUser(auth, { email, password, displayName, claims }) {
  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') throw error;
    user = await auth.createUser({ email, password, displayName, emailVerified: true, disabled: false });
  }
  user = await auth.updateUser(user.uid, { password, displayName, emailVerified: true, disabled: false });
  await auth.setCustomUserClaims(user.uid, claims);
  await auth.revokeRefreshTokens(user.uid);
  return user;
}

function initialiseFirebase() {
  const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
  return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

function guardExecution() {
  if (!process.argv.includes('--production-demo')) throw new Error('Refusing to seed: --production-demo is required');
  if (process.env.SEED_ENVIRONMENT !== 'production') throw new Error('Refusing to seed: SEED_ENVIRONMENT must be production');
  if (process.env.SEED_REMOTE_CONFIRM !== REQUIRED_CONFIRMATION) throw new Error(`Refusing to seed: set SEED_REMOTE_CONFIRM=${REQUIRED_CONFIRMATION}`);
  if (!uri || /^mongodb:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(uri)) throw new Error('Refusing to seed: a remote production MONGO_URI is required');
  if (!serviceAccountBase64) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is required');
  if (!orgEmail || !memberEmail || orgEmail === memberEmail) throw new Error('Distinct DEMO_ORG_EMAIL and DEMO_MEMBER_EMAIL values are required');
  validatePassword('DEMO_ORG_PASSWORD', orgPassword);
  validatePassword('DEMO_MEMBER_PASSWORD', memberPassword);
}

function validatePassword(name, value) {
  if (!value || value.length < 12) throw new Error(`${name} must contain at least 12 characters`);
}
function normaliseEmail(value) { return value?.trim().toLowerCase() || ''; }
function databaseHost(value) {
  const withoutScheme = value.replace(/^mongodb(?:\+srv)?:\/\//, '');
  return withoutScheme.slice(withoutScheme.indexOf('@') + 1).split('/')[0].split('?')[0];
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
