/* Idempotent local development seed. Run with: node tools/scripts/seed-local-mongo.js */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { MongoClient, ObjectId } = mongoose.mongo;

function envValue(name) {
  const envPath = path.resolve(__dirname, '../../.env');
  const line = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).find((row) => row.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).trim() : undefined;
}

const uri = process.env.MONGO_URI || envValue('MONGO_URI');
if (!uri || !/^mongodb:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(uri)) {
  throw new Error('Refusing to seed: MONGO_URI must target localhost or 127.0.0.1');
}

const id = (suffix) => new ObjectId(`7000000000000000000000${suffix}`);
const now = new Date();
const daysFromNow = (days) => new Date(now.getTime() + days * 86400000);
const timestamps = { createdAt: now, updatedAt: now };

async function upsertMany(collection, documents) {
  await collection.bulkWrite(documents.map((document) => ({
    updateOne: { filter: { _id: document._id }, update: { $set: document }, upsert: true },
  })));
  return documents.length;
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();

  const identity = client.db('cl_identity');
  const events = client.db('cl_events');
  const classifieds = client.db('cl_classifieds');
  const admin = client.db('cl_admin');

  const users = [
    { _id: id('01'), firebaseUid: 'seed-member-lagos', email: 'ada.seed@example.test', name: 'Ada Okafor', avatarUrl: null, bio: 'Community volunteer and worship leader.', socialLinks: null, isVerified: true, region: 'Lagos, Nigeria', regionCode: 'NG-LA', preferences: ['Worship & Services', 'Career & Volunteering', 'Marketplace Deals'], onboardingCompleted: true, roles: [], orgId: null, orgInvitedBy: null, orgJoinedAt: null, ...timestamps },
    { _id: id('02'), firebaseUid: 'seed-member-london', email: 'daniel.seed@example.test', name: 'Daniel Mensah', avatarUrl: null, bio: 'Faith, work and community.', socialLinks: null, isVerified: true, region: 'London, UK', regionCode: 'GB-LND', preferences: ['Conferences & Seminars', 'Music & Creative Arts'], onboardingCompleted: true, roles: [], orgId: null, orgInvitedBy: null, orgJoinedAt: null, ...timestamps },
    { _id: id('03'), firebaseUid: 'seed-org-owner', email: 'grace.seed@example.test', name: 'Grace Adebayo', avatarUrl: null, bio: 'Organisation administrator.', socialLinks: null, isVerified: true, region: 'Lagos, Nigeria', regionCode: 'NG-LA', preferences: ['Community & Social'], onboardingCompleted: true, roles: ['master_admin'], orgId: id('11'), orgInvitedBy: null, orgJoinedAt: now, ...timestamps },
  ];

  const organisations = [
    { _id: id('11'), createdBy: 'seed-org-owner', phoneNumber: '+234 800 000 0000', name: 'Grace Town Ministries', description: 'A welcoming Lagos church serving families and young professionals.', logoUrl: null, websiteUrl: 'https://example.test/grace-town', socialLinks: { whatsapp: null, instagram: null, facebook: null, twitter: null, website: 'https://example.test/grace-town' }, organisationType: 'Church', region: 'Lagos, Nigeria', regionCode: 'NG-LA', verificationDetails: { officialName: 'Grace Town Ministries', registrationNumber: 'SEED-NG-001', officialEmail: 'hello@example.test', pocName: 'Grace Adebayo', pocTitle: 'Director', documentUrls: [] }, verificationStatus: 'VERIFIED', verificationTier: 'STANDARD', onboardingCompleted: true, followerCount: 842, ...timestamps },
    { _id: id('12'), createdBy: 'seed-org-london', phoneNumber: null, name: 'Hope Community London', description: 'Community programmes, food support and practical faith in London.', logoUrl: null, websiteUrl: 'https://example.test/hope-london', socialLinks: null, organisationType: 'Charity', region: 'London, UK', regionCode: 'GB-LND', verificationDetails: { officialName: 'Hope Community London', registrationNumber: 'SEED-UK-002', officialEmail: 'hope@example.test', pocName: 'Daniel Mensah', pocTitle: 'Coordinator', documentUrls: [] }, verificationStatus: 'VERIFIED', verificationTier: 'CHARITY', onboardingCompleted: true, followerCount: 516, ...timestamps },
    { _id: id('13'), createdBy: 'seed-org-toronto', phoneNumber: null, name: 'Diaspora Fellowship Toronto', description: 'Connecting newcomers through worship and community events.', logoUrl: null, websiteUrl: null, socialLinks: null, organisationType: 'Church', region: 'Toronto, Canada', regionCode: 'CA-ON', verificationDetails: { officialName: null, registrationNumber: null, officialEmail: null, pocName: null, pocTitle: null, documentUrls: [] }, verificationStatus: 'PENDING_REVIEW', verificationTier: 'NONE', onboardingCompleted: true, followerCount: 128, ...timestamps },
  ];

  const eventDocs = [
    ['21', id('11'), 'Theology of Work Masterclass', 'An evening for professionals exploring faith, purpose and excellent work.', 'CONFERENCE', 'Lagos, Nigeria', 'NG-LA', 'Lagos City Centre', 14, 350, 126, true],
    ['22', id('11'), 'Friday Night Worship', 'Live worship, prayer and a warm community welcome.', 'WORSHIP', 'Lagos, Nigeria', 'NG-LA', 'Victoria Island', 7, 500, 214, true],
    ['23', id('11'), 'Community Food Drive', 'Pack and distribute food parcels with local volunteers.', 'CHARITY', 'Lagos, Nigeria', 'NG-LA', 'Yaba', 21, 120, 67, false],
    ['24', id('12'), 'Faith and Leadership Forum', 'Practical conversations for emerging community leaders.', 'CONFERENCE', 'London, UK', 'GB-LND', 'Southwark', 18, 220, 91, true],
    ['25', id('12'), 'Community Choir Evening', 'An open evening of gospel music and fellowship.', 'MUSIC', 'London, UK', 'GB-LND', 'Brixton', 10, 180, 73, false],
    ['26', id('13'), 'Newcomers Fellowship Lunch', 'Meet neighbours and build lasting connections over lunch.', 'COMMUNITY', 'Toronto, Canada', 'CA-ON', 'Scarborough', 12, 90, 42, false],
  ].map(([suffix, organisationId, title, description, category, region, regionCode, city, day, capacity, rsvpCount, isPromoted]) => ({ _id: id(suffix), organisationId, createdBy: 'seed-org-owner', title, description, category, eventType: 'PHYSICAL', location: { address: `${city} Community Hall`, city, country: region.split(', ')[1] }, onlineUrl: null, region, regionCode, startDate: daysFromNow(day), endDate: daysFromNow(day + 0.2), capacity, coverImageUrl: '/assets/event-theology.png', imageUrls: ['/assets/event-theology.png'], videoEmbedUrl: null, isTicketed: false, ticketUrl: null, notifyAttendees: true, status: 'PUBLISHED', isPromoted, promotedUntil: isPromoted ? daysFromNow(30) : null, rsvpCount, ...timestamps }));

  eventDocs.push(...[
    ['70', id('11'), 'Young Adults Prayer Breakfast', 'Prayer, breakfast and meaningful conversation for young adults.', 'YOUTH', 'Lagos, Nigeria', 'NG-LA', 'Lekki', 5, 100, 38, false],
    ['71', id('11'), 'Marriage and Family Seminar', 'Practical teaching and guided conversations for couples and families.', 'CONFERENCE', 'Lagos, Nigeria', 'NG-LA', 'Ikeja', 9, 240, 88, true],
    ['72', id('11'), 'Neighbourhood Clean-Up Day', 'Serve the neighbourhood through a coordinated environmental clean-up.', 'COMMUNITY', 'Lagos, Nigeria', 'NG-LA', 'Surulere', 16, 150, 54, false],
    ['73', id('11'), 'Evening Bible Study', 'A welcoming study through the book of James.', 'BIBLE_STUDY', 'Lagos, Nigeria', 'NG-LA', 'Yaba', 4, 80, 31, false],
    ['74', id('12'), 'Winter Shelter Volunteer Induction', 'Training for volunteers supporting the community winter shelter.', 'WELFARE', 'London, UK', 'GB-LND', 'Southwark', 11, 120, 46, false],
    ['75', id('12'), 'Gospel and Jazz Night', 'An uplifting evening featuring local gospel and jazz musicians.', 'MUSIC', 'London, UK', 'GB-LND', 'Camden', 20, 320, 143, true],
    ['76', id('12'), 'Women in Leadership Gathering', 'Stories, mentoring and networking for women serving their communities.', 'CONFERENCE', 'London, UK', 'GB-LND', 'Westminster', 27, 180, 97, false],
    ['77', id('13'), 'Sunday Community Worship', 'A multicultural worship gathering open to everyone.', 'WORSHIP', 'Toronto, Canada', 'CA-ON', 'North York', 3, 260, 119, true],
    ['78', id('13'), 'Youth Basketball and Fellowship', 'An afternoon of sport, food and faith-centred encouragement.', 'YOUTH', 'Toronto, Canada', 'CA-ON', 'Scarborough', 13, 140, 62, false],
    ['79', id('13'), 'Newcomer Employment Workshop', 'CV guidance, interview practice and local employment advice.', 'COMMUNITY', 'Toronto, Canada', 'CA-ON', 'Etobicoke', 24, 100, 49, false],
  ].map(([suffix, organisationId, title, description, category, region, regionCode, city, day, capacity, rsvpCount, isPromoted]) => ({ _id: id(suffix), organisationId, createdBy: 'seed-org-owner', title, description, category, eventType: 'PHYSICAL', location: { address: `${city} Community Hall`, city, country: region.split(', ')[1] }, onlineUrl: null, region, regionCode, startDate: daysFromNow(day), endDate: daysFromNow(day + 0.2), capacity, coverImageUrl: '/assets/event-theology.png', imageUrls: ['/assets/event-theology.png'], videoEmbedUrl: null, isTicketed: false, ticketUrl: null, notifyAttendees: true, status: 'PUBLISHED', isPromoted, promotedUntil: isPromoted ? daysFromNow(30) : null, rsvpCount, ...timestamps })));

  const jobDocs = [
    ['31', id('11'), 'Community Outreach Coordinator', 'PAID', 'HYBRID', 'Lagos, Nigeria', 'NG-LA', 250000, 400000, 'NGN', ['Community Engagement', 'Project Management']],
    ['32', id('11'), 'Worship Media Volunteer', 'VOLUNTEER', 'PHYSICAL', 'Lagos, Nigeria', 'NG-LA', null, null, null, ['Social Media', 'Video Editing']],
    ['33', id('11'), 'Finance and Operations Intern', 'INTERNSHIP', 'HYBRID', 'Lagos, Nigeria', 'NG-LA', 100000, 150000, 'NGN', ['Accounting', 'Microsoft Excel']],
    ['34', id('12'), 'Food Bank Programme Manager', 'PAID', 'PHYSICAL', 'London, UK', 'GB-LND', 34000, 41000, 'GBP', ['Project Management', 'Safeguarding']],
    ['35', id('12'), 'Digital Communications Officer', 'PAID', 'REMOTE', 'London, UK', 'GB-LND', 30000, 36000, 'GBP', ['Social Media', 'Copywriting']],
    ['36', id('13'), 'Newcomer Support Volunteer', 'VOLUNTEER', 'HYBRID', 'Toronto, Canada', 'CA-ON', null, null, null, ['Counselling', 'Driving Licence']],
  ].map(([suffix, organisationId, title, employmentType, workLocation, region, regionCode, salaryMin, salaryMax, salaryCurrency, skillsRequired]) => ({ _id: id(suffix), organisationId, createdBy: 'seed-org-owner', title, companyDisplayName: null, employmentType, workLocation, skillsRequired, faithAlignmentTag: 'OPEN_TO_ALL', region, regionCode, closingDate: daysFromNow(45), salaryMin, salaryMax, salaryCurrency, salary: null, description: `${title} opportunity supporting a growing faith community.`, responsibilities: ['Serve the community', 'Collaborate with the team'], educationalRequirement: null, experience: 'Relevant experience welcomed', certifications: null, otherSkills: null, faithDescription: null, faithAlignedOnly: false, keyFaithRequirements: [], externalApplyUrl: 'https://example.test/apply', status: 'ACTIVE', isPromoted: suffix === '31' || suffix === '34', promotedUntil: daysFromNow(20), applicationCount: Number(suffix) % 9, ...timestamps }));

  jobDocs.push(...[
    ['80', id('11'), 'Children’s Ministry Coordinator', 'PAID', 'PHYSICAL', 'Lagos, Nigeria', 'NG-LA', 220000, 320000, 'NGN', ['Safeguarding', 'Teaching']],
    ['81', id('11'), 'Church Administrator', 'PAID', 'HYBRID', 'Lagos, Nigeria', 'NG-LA', 200000, 300000, 'NGN', ['Administration', 'Microsoft Office']],
    ['82', id('11'), 'Graphic Design Volunteer', 'VOLUNTEER', 'REMOTE', 'Lagos, Nigeria', 'NG-LA', null, null, null, ['Graphic Design', 'Social Media']],
    ['83', id('11'), 'Facilities Assistant', 'PAID', 'PHYSICAL', 'Lagos, Nigeria', 'NG-LA', 150000, 210000, 'NGN', ['Maintenance', 'Driving Licence']],
    ['84', id('12'), 'Community Fundraising Officer', 'PAID', 'HYBRID', 'London, UK', 'GB-LND', 32000, 38000, 'GBP', ['Fundraising', 'Copywriting']],
    ['85', id('12'), 'Volunteer Services Assistant', 'INTERNSHIP', 'PHYSICAL', 'London, UK', 'GB-LND', 24000, 26000, 'GBP', ['Administration', 'Community Engagement']],
    ['86', id('12'), 'Safeguarding Lead', 'PAID', 'HYBRID', 'London, UK', 'GB-LND', 42000, 50000, 'GBP', ['Safeguarding', 'Leadership']],
    ['87', id('13'), 'Settlement Support Worker', 'PAID', 'HYBRID', 'Toronto, Canada', 'CA-ON', 52000, 62000, 'CAD', ['Counselling', 'Case Management']],
    ['88', id('13'), 'Youth Programme Assistant', 'INTERNSHIP', 'PHYSICAL', 'Toronto, Canada', 'CA-ON', 36000, 42000, 'CAD', ['Youth Work', 'Event Planning']],
    ['89', id('13'), 'Bilingual Community Volunteer', 'VOLUNTEER', 'REMOTE', 'Toronto, Canada', 'CA-ON', null, null, null, ['Translation', 'Community Engagement']],
  ].map(([suffix, organisationId, title, employmentType, workLocation, region, regionCode, salaryMin, salaryMax, salaryCurrency, skillsRequired]) => ({ _id: id(suffix), organisationId, createdBy: 'seed-org-owner', title, companyDisplayName: null, employmentType, workLocation, skillsRequired, faithAlignmentTag: 'OPEN_TO_ALL', region, regionCode, closingDate: daysFromNow(50), salaryMin, salaryMax, salaryCurrency, salary: null, description: `${title} opportunity supporting a growing faith community.`, responsibilities: ['Serve the community', 'Collaborate with the team'], educationalRequirement: null, experience: 'Relevant experience welcomed', certifications: null, otherSkills: null, faithDescription: null, faithAlignedOnly: false, keyFaithRequirements: [], externalApplyUrl: 'https://example.test/apply', status: 'ACTIVE', isPromoted: suffix === '84' || suffix === '87', promotedUntil: daysFromNow(20), applicationCount: Number(suffix) % 9, ...timestamps })));

  const marketplaceDocs = [
    ['41', 'seed-member-lagos', 'Study Bible Collection', 'BOOKS', 'LIKE_NEW', 'Lagos, Nigeria', 'NG-LA', 18000, 'NGN', false, '/assets/event-theology.png'],
    ['42', 'seed-member-lagos', 'Wooden Dining Table', 'FURNITURE', 'GOOD', 'Lagos, Nigeria', 'NG-LA', 85000, 'NGN', false, '/assets/car-ford.png'],
    ['43', 'seed-member-lagos', 'Children’s Clothing Bundle', 'CHARITY_ITEMS', 'GOOD', 'Lagos, Nigeria', 'NG-LA', 0, 'NGN', true, null],
    ['44', 'seed-member-london', 'Gospel Piano Songbooks', 'BOOKS', 'GOOD', 'London, UK', 'GB-LND', 25, 'GBP', false, null],
    ['45', 'seed-member-london', 'Baby Cot — Free Donation', 'BABY_AND_KIDS', 'GOOD', 'London, UK', 'GB-LND', 0, 'GBP', true, null],
    ['46', 'seed-member-london', 'Portable PA Speaker', 'ELECTRONICS', 'LIKE_NEW', 'Toronto, Canada', 'CA-ON', 220, 'CAD', false, null],
  ].map(([suffix, createdBy, title, category, condition, region, regionCode, sellingPrice, currency, isDonation, image]) => ({ _id: id(suffix), organisationId: null, createdBy, title, category, subCategory: category === 'BOOKS' ? 'Bibles' : category === 'ELECTRONICS' ? 'Technology' : category === 'FURNITURE' ? 'Home & Living' : null, description: `${title} in ${condition.toLowerCase().replace('_', ' ')} condition.`, condition, dimensions: null, otherAttributes: null, region, regionCode, sellingPrice, maxRetailPrice: null, currency, isDonation, imageUrls: image ? [image] : [], contactInfo: 'seed-contact@example.test', showContactOnOffer: false, status: 'AVAILABLE', isPromoted: suffix === '41', promotedUntil: daysFromNow(20), ...timestamps }));

  marketplaceDocs.push(...[
    ['90', 'seed-member-lagos', 'Acoustic Guitar with Case', 'OTHER', 'GOOD', 'Lagos, Nigeria', 'NG-LA', 65000, 'NGN', false, null],
    ['91', 'seed-member-lagos', 'Office Desk and Chair', 'FURNITURE', 'LIKE_NEW', 'Lagos, Nigeria', 'NG-LA', 120000, 'NGN', false, null],
    ['92', 'seed-member-lagos', 'Christian Children’s Books', 'BOOKS', 'GOOD', 'Lagos, Nigeria', 'NG-LA', 0, 'NGN', true, null],
    ['93', 'seed-member-lagos', 'Samsung Tablet', 'ELECTRONICS', 'FAIR', 'Lagos, Nigeria', 'NG-LA', 75000, 'NGN', false, null],
    ['94', 'seed-member-london', 'Winter Coats Bundle', 'CLOTHING', 'GOOD', 'London, UK', 'GB-LND', 0, 'GBP', true, null],
    ['95', 'seed-member-london', 'Compact Bookshelf', 'FURNITURE', 'LIKE_NEW', 'London, UK', 'GB-LND', 45, 'GBP', false, null],
    ['96', 'seed-member-london', 'Wireless Microphone Set', 'ELECTRONICS', 'GOOD', 'London, UK', 'GB-LND', 85, 'GBP', false, null],
    ['97', 'seed-member-london', 'Baby Stroller', 'BABY_AND_KIDS', 'GOOD', 'Toronto, Canada', 'CA-ON', 90, 'CAD', false, null],
    ['98', 'seed-member-london', 'Community Pantry Food Box', 'FOOD', 'NEW', 'Toronto, Canada', 'CA-ON', 0, 'CAD', true, null],
    ['99', 'seed-member-london', 'Laptop Stand and Keyboard', 'ELECTRONICS', 'LIKE_NEW', 'Toronto, Canada', 'CA-ON', 55, 'CAD', false, null],
  ].map(([suffix, createdBy, title, category, condition, region, regionCode, sellingPrice, currency, isDonation, image]) => ({ _id: id(suffix), organisationId: null, createdBy, title, category, subCategory: category === 'BOOKS' ? 'Bibles' : category === 'ELECTRONICS' ? 'Technology' : category === 'FURNITURE' ? 'Home & Living' : null, description: `${title} in ${condition.toLowerCase().replace('_', ' ')} condition.`, condition, dimensions: null, otherAttributes: null, region, regionCode, sellingPrice, maxRetailPrice: null, currency, isDonation, imageUrls: image ? [image] : [], contactInfo: 'seed-contact@example.test', showContactOnOffer: false, status: 'AVAILABLE', isPromoted: suffix === '96', promotedUntil: daysFromNow(20), ...timestamps })));

  const rsvps = [
    { _id: id('51'), eventId: id('21'), userFirebaseUid: 'seed-member-lagos', stage: 'CONFIRMED', ...timestamps },
    { _id: id('52'), eventId: id('22'), userFirebaseUid: 'seed-member-lagos', stage: 'INTERESTED', ...timestamps },
    { _id: id('53'), eventId: id('24'), userFirebaseUid: 'seed-member-london', stage: 'SAVED', ...timestamps },
  ];

  const reports = [{ _id: id('61'), contentId: id('42').toString(), contentType: 'MARKETPLACE_ITEM', reportedByUserId: id('02'), reason: 'Seed report for moderation testing', status: 'PENDING', ...timestamps }];
  const auditLogs = [{ _id: id('62'), adminId: id('03'), action: 'APPROVE', contentId: id('41').toString(), contentType: 'MARKETPLACE_ITEM', reason: 'Seed audit entry', ...timestamps }];

  const counts = {
    users: await upsertMany(identity.collection('users'), users),
    organisations: await upsertMany(identity.collection('organisations'), organisations),
    events: await upsertMany(events.collection('events'), eventDocs),
    rsvps: await upsertMany(events.collection('rsvps'), rsvps),
    jobs: await upsertMany(classifieds.collection('joblistings'), jobDocs),
    marketplace: await upsertMany(classifieds.collection('marketplaceitems'), marketplaceDocs),
    reports: await upsertMany(admin.collection('moderationreports'), reports),
    auditLogs: await upsertMany(admin.collection('auditlogs'), auditLogs),
  };

  console.log('Local MongoDB seed complete:', counts);
  await client.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
