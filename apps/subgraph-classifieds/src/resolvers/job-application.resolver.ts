import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { JobApplicationModel, JobListingModel } from '../models';
import type { HydratedDocument } from 'mongoose';
import type { IJobApplication } from '../models/job-application.model';
import type { GraphQLContext } from '../context';
import { canAccessOrganisation } from '@christian-listings/auth';
import { mapJob } from './job.resolver';
import { resolvePrivateMediaRef } from '@christian-listings/utils';
import { requestEmailSafely } from '@christian-listings/email';

interface EducationInput {
  highestQualification?: string;
  institutionName?: string;
  yearOfEnrollment?: number;
  yearOfCompletion?: number;
  marksGrades?: string;
  degreeType?: string;
}

interface SubmitApplicationInput {
  jobId: string;
  fullName: string;
  phoneNumber?: string;
  email: string;
  gender?: string;
  dateOfBirth?: string;
  education: EducationInput[];
  experienceDescription?: string;
  yearsOfExperience?: number;
  currentSalary?: string;
  expectedSalary?: string;
  cvUrl?: string;
  portfolioUrl?: string;
  linkedInProfile?: string;
  acknowledged: boolean;
}

function requireUser(ctx: GraphQLContext) {
  if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
    throw new GraphQLError('Sign in to apply for this job', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return ctx.auth.firebaseUid;
}

function mapApplication(doc: HydratedDocument<IJobApplication>) {
  return {
    id: doc._id.toString(),
    listing: { id: doc.jobId.toString() },
    applicant: { firebaseUid: doc.applicantFirebaseUid },
    status: doc.status,
    experience: doc.experienceDescription ?? null,
    resumeUrl: doc.cvUrl ? resolvePrivateMediaRef(doc.cvUrl) : null,
    cvUrl: doc.cvUrl ? resolvePrivateMediaRef(doc.cvUrl) : null,
    fullName: doc.fullName,
    phoneNumber: doc.phoneNumber ?? null,
    email: doc.email,
    gender: doc.gender ?? null,
    dateOfBirth: doc.dateOfBirth ?? null,
    education: doc.education ?? [],
    yearsOfExperience: doc.yearsOfExperience ?? null,
    currentSalary: doc.currentSalary ?? null,
    expectedSalary: doc.expectedSalary ?? null,
    portfolioUrl: doc.portfolioUrl ?? null,
    linkedInProfile: doc.linkedInProfile ?? null,
    acknowledged: doc.acknowledged,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const jobApplicationResolvers = {
  Query: {
    myJobApplication: async (_: unknown, { jobId }: { jobId: string }, ctx: GraphQLContext) => {
      const firebaseUid = requireUser(ctx);
      const doc = await JobApplicationModel.findOne({ jobId: new mongoose.Types.ObjectId(jobId), applicantFirebaseUid: firebaseUid });
      return doc ? mapApplication(doc) : null;
    },
    organisationJobApplications: async (_: unknown, { organisationId, jobId, status }: { organisationId: string; jobId?: string; status?: string }, ctx: GraphQLContext) => {
      if (!canAccessOrganisation(ctx.auth, organisationId, ['master_admin', 'site_admin', 'jobs_manager'])) throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      const filter: Record<string, unknown> = { organisationId: new mongoose.Types.ObjectId(organisationId) };
      if (jobId) filter['jobId'] = new mongoose.Types.ObjectId(jobId);
      if (status) filter['status'] = status;
      const docs = await JobApplicationModel.find(filter).sort({ createdAt: -1 });
      return docs.map(mapApplication);
    },
  },
  Mutation: {
    submitJobApplication: async (_: unknown, { input }: { input: SubmitApplicationInput }, ctx: GraphQLContext) => {
      const firebaseUid = requireUser(ctx);
      if (!input.acknowledged) throw new GraphQLError('Acknowledgement is required', { extensions: { code: 'BAD_USER_INPUT' } });
      if (!input.fullName.trim() || !input.email.trim()) throw new GraphQLError('Name and email are required', { extensions: { code: 'BAD_USER_INPUT' } });

      const job = await JobListingModel.findById(input.jobId);
      if (!job || job.status !== 'ACTIVE' || job.closingDate.getTime() < Date.now()) {
        throw new GraphQLError('This job is no longer accepting applications', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      try {
        const doc = await JobApplicationModel.create({
          jobId: job._id,
          organisationId: job.organisationId,
          applicantFirebaseUid: firebaseUid,
          fullName: input.fullName.trim(),
          phoneNumber: input.phoneNumber?.trim() || null,
          email: input.email.trim().toLowerCase(),
          gender: input.gender || null,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          education: input.education,
          experienceDescription: input.experienceDescription?.trim() || null,
          yearsOfExperience: input.yearsOfExperience ?? null,
          currentSalary: input.currentSalary?.trim() || null,
          expectedSalary: input.expectedSalary?.trim() || null,
          cvUrl: input.cvUrl?.trim() || null,
          portfolioUrl: input.portfolioUrl?.trim() || null,
          linkedInProfile: input.linkedInProfile?.trim() || null,
          acknowledged: true,
          status: 'SUBMITTED',
        });
        await JobListingModel.updateOne({ _id: job._id }, { $inc: { applicationCount: 1 } });
        const appUrl = (process.env['PUBLIC_APP_URL'] ?? 'http://localhost:3000').replace(/\/$/, '');
        requestEmailSafely({
          templateKey: 'JOB_APPLICATION_SUBMITTED', to: doc.email,
          variables: { jobTitle: job.title, applicationUrl: `${appUrl}/dashboard/applications` },
          idempotencyKey: `job-application-submitted:${doc._id}`,
          source: { service: 'classifieds', entityType: 'JOB_APPLICATION', entityId: doc._id.toString() },
        });
        queueOrganisationApplicationEmail(job.organisationId.toString(), job.title, doc.fullName, doc._id.toString());
        return mapApplication(doc);
      } catch (error: unknown) {
        if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
          throw new GraphQLError('You have already applied for this job', { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw error;
      }
    },
    updateJobApplicationStatus: async (_: unknown, { id, status }: { id: string; status: string }, ctx: GraphQLContext) => {
      const existing = await JobApplicationModel.findById(id);
      if (!existing) throw new GraphQLError('Application not found', { extensions: { code: 'NOT_FOUND' } });
      if (!canAccessOrganisation(ctx.auth, existing.organisationId.toString(), ['master_admin', 'site_admin', 'jobs_manager'])) throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      existing.status = status as typeof existing.status;
      await existing.save();
      return mapApplication(existing);
    },
  },
  JobApplication: {
    __resolveReference: async ({ id }: { id: string }) => {
      const doc = await JobApplicationModel.findById(id);
      return doc ? mapApplication(doc) : null;
    },
    listing: async ({ listing }: { listing: { id: string } }) => {
      const doc = await JobListingModel.findById(listing.id);
      return doc ? mapJob(doc) : null;
    },
  },
  User: {
    jobApplications: async ({ firebaseUid }: { firebaseUid: string }) => {
      const docs = await JobApplicationModel.find({ applicantFirebaseUid: firebaseUid }).sort({ createdAt: -1 });
      return docs.map(mapApplication);
    },
  },
};

function queueOrganisationApplicationEmail(organisationId: string, jobTitle: string, applicantName: string, applicationId: string) {
  const secret = process.env['INTERNAL_SERVICE_KEY'];
  if (!secret) { console.warn('[email] INTERNAL_SERVICE_KEY is not configured'); return; }
  const identityUrl = process.env['IDENTITY_INTERNAL_URL'] ?? 'http://localhost:4001';
  void fetch(`${identityUrl}/internal/organisations/${encodeURIComponent(organisationId)}/email-contact`, { headers: { 'x-cl-service-key': secret } })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Organisation email lookup failed with HTTP ${response.status}`);
      const contact = await response.json() as { name: string; email: string | null };
      if (!contact.email) return;
      const appUrl = (process.env['PUBLIC_APP_URL'] ?? 'http://localhost:3000').replace(/\/$/, '');
      requestEmailSafely({
        templateKey: 'JOB_APPLICATION_RECEIVED', to: contact.email,
        variables: { jobTitle, applicantName, applicationsUrl: `${appUrl}/org/jobs` },
        idempotencyKey: `job-application-received:${applicationId}`,
        source: { service: 'classifieds', entityType: 'JOB_APPLICATION', entityId: applicationId },
      });
    })
    .catch((error: unknown) => console.warn('[email] organisation application notification could not be prepared', error));
}
