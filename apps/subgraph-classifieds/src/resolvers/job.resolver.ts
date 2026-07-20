import { GraphQLError } from 'graphql';
import mongoose, { type HydratedDocument } from 'mongoose';
import { type IJobListing } from '../models/job-listing.model';
import { JobListingModel } from '../models';
import type { GraphQLContext } from '../context';
import { resolveLocationRegion } from '@christian-listings/utils';
import { canAccessOrganisation, getOrganisationAccess } from '@christian-listings/auth';

type JobDocument = HydratedDocument<IJobListing>;

export function mapJob(doc: JobDocument) {
  const salaryRange =
    doc.salaryMin != null && doc.salaryMax != null && doc.salaryCurrency
      ? { min: doc.salaryMin, max: doc.salaryMax, currency: doc.salaryCurrency }
      : null;

  return {
    id:                  doc._id.toString(),
    title:               doc.title,
    description:         doc.description,
    organisation:        { id: doc.organisationId.toString() },
    roleType:            doc.employmentType,
    workLocation:        doc.workLocation,
    skillsRequired:      doc.skillsRequired ?? [],
    region:              doc.region ?? '',
    salaryRange,
    applicationDeadline: doc.closingDate,
    externalApplyUrl:    doc.externalApplyUrl ?? null,
    status:              doc.status,
    isPromoted:          doc.isPromoted,
    faithAlignmentTag:   doc.faithAlignmentTag ?? null,
    responsibilities:    doc.responsibilities ?? [],
    educationalRequirement: doc.educationalRequirement ?? null,
    experience:          doc.experience ?? null,
    certifications:      doc.certifications ?? null,
    otherSkills:         doc.otherSkills ?? null,
    faithDescription:    doc.faithDescription ?? null,
    keyFaithRequirements: doc.keyFaithRequirements ?? [],
    applicationCount:    doc.applicationCount ?? 0,
    createdAt:           doc.createdAt,
    updatedAt:           doc.updatedAt,
  };
}

interface SalaryRangeInput { min: number; max: number; currency: string; }

interface CreateJobInput {
  title:               string;
  description:         string;
  organisationId:      string;
  roleType:            string;
  workLocation:        string;
  skillsRequired:      string[];
  region:              string;
  salaryRange?:        SalaryRangeInput;
  applicationDeadline: string;
  externalApplyUrl?:   string;
  faithAlignmentTag?:  string;
}

interface JobsArgs {
  region?:       string;
  search?:       string;
  roleType?:     string;
  workLocation?: string;
  skillTags?:    string[];
  minSalary?:    number;
  maxSalary?:    number;
  status?:       string;
  sort?:         string;
  limit?:        number;
  after?:        string;
}

export const jobResolvers = {
  Query: {
    jobListing: async (_: unknown, { id }: { id: string }) => {
      const doc = await JobListingModel.findById(id);
      return doc ? mapJob(doc) : null;
    },

    jobListings: async (_: unknown, { region, search, roleType, workLocation, skillTags, minSalary, maxSalary, status, sort = 'NEWEST', limit = 20, after }: JobsArgs) => {
      const filter: Record<string, unknown> = {};
      if (region) {
        const resolved = resolveLocationRegion(region);
        if (resolved) filter['$and'] = [{ $or: [{ region: resolved.displayName }, { regionCode: { $in: resolved.codes } }] }];
      }
      if (search?.trim()) {
        const pattern = { $regex: escapeRegex(search.trim()), $options: 'i' };
        filter['$and'] = [...((filter['$and'] as unknown[]) ?? []), { $or: [{ title: pattern }, { description: pattern }, { skillsRequired: pattern }] }];
      }
      if (roleType)     filter['employmentType'] = roleType;
      if (workLocation) filter['workLocation'] = workLocation;
      if (skillTags?.length) filter['skillsRequired'] = { $in: skillTags };
      if (minSalary != null || maxSalary != null) filter['salaryMin'] = { ...(minSalary != null && { $gte: minSalary }), ...(maxSalary != null && { $lte: maxSalary }) };
      if (status)       filter['status'] = status;
      if (after)        filter['_id'] = { $gt: new mongoose.Types.ObjectId(after) };

      const sortBy: Record<string, 1 | -1> = sort === 'DEADLINE' ? { closingDate: 1 } : sort === 'SALARY_ASC' ? { salaryMin: 1 } : sort === 'SALARY_DESC' ? { salaryMin: -1 } : sort === 'POPULAR' ? { isPromoted: -1, applicationCount: -1 } : { createdAt: -1 };
      const docs = await JobListingModel.find(filter).limit(limit + 1).sort(sortBy);
      const hasNextPage = docs.length > limit;
      const edges = docs.slice(0, limit).map(mapJob);
      return { edges, hasNextPage, endCursor: edges.length > 0 ? edges[edges.length - 1].id : null };
    },
  },

  Mutation: {
    createJobListing: async (_: unknown, { input }: { input: CreateJobInput }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      if (!canAccessOrganisation(ctx.auth, input.organisationId, ['master_admin', 'site_admin', 'jobs_manager'])) throw new GraphQLError('You cannot create jobs for this organisation', { extensions: { code: 'FORBIDDEN' } });
      const region = resolveLocationRegion(input.region);
      const doc = await JobListingModel.create({
        organisationId:   new mongoose.Types.ObjectId(input.organisationId),
        createdBy:        ctx.auth.firebaseUid,
        title:            input.title,
        description:      input.description,
        employmentType:   input.roleType,
        workLocation:     input.workLocation,
        skillsRequired:   input.skillsRequired,
        region:           region?.displayName ?? input.region.trim(),
        regionCode:       region?.code ?? null,
        closingDate:      new Date(input.applicationDeadline),
        salaryMin:        input.salaryRange?.min ?? null,
        salaryMax:        input.salaryRange?.max ?? null,
        salaryCurrency:   input.salaryRange?.currency ?? null,
        externalApplyUrl: input.externalApplyUrl ?? null,
        faithAlignmentTag: input.faithAlignmentTag ?? null,
        status:           'ACTIVE',
      });
      return mapJob(doc);
    },

    updateJobListing: async (_: unknown, { id, input }: { id: string; input: Partial<CreateJobInput> }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const access = getOrganisationAccess(ctx.auth);
      if (!access || !access.roles.some((role) => ['master_admin', 'site_admin', 'jobs_manager'].includes(role))) throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      const update: Record<string, unknown> = {};
      if (input.title)           update['title'] = input.title;
      if (input.description)     update['description'] = input.description;
      if (input.roleType)        update['employmentType'] = input.roleType;
      if (input.workLocation)    update['workLocation'] = input.workLocation;
      if (input.skillsRequired)  update['skillsRequired'] = input.skillsRequired;
      if (input.region) {
        const region = resolveLocationRegion(input.region);
        update['region'] = region?.displayName ?? input.region.trim();
        update['regionCode'] = region?.code ?? null;
      }
      if (input.salaryRange) {
        update['salaryMin'] = input.salaryRange.min;
        update['salaryMax'] = input.salaryRange.max;
        update['salaryCurrency'] = input.salaryRange.currency;
      }
      if (input.applicationDeadline) update['closingDate'] = new Date(input.applicationDeadline);
      if (input.externalApplyUrl !== undefined) update['externalApplyUrl'] = input.externalApplyUrl;

      const doc = await JobListingModel.findOneAndUpdate(
        { _id: id, organisationId: new mongoose.Types.ObjectId(access.orgId) },
        { $set: update },
        { new: true },
      );
      if (!doc) throw new GraphQLError('Job not found or access denied', { extensions: { code: 'NOT_FOUND' } });
      return mapJob(doc);
    },

    archiveJobListing: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const access = getOrganisationAccess(ctx.auth);
      if (!access || !access.roles.some((role) => ['master_admin', 'site_admin', 'jobs_manager'].includes(role))) throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      const doc = await JobListingModel.findOneAndUpdate(
        { _id: id, organisationId: new mongoose.Types.ObjectId(access.orgId) },
        { $set: { status: 'ARCHIVED' } },
        { new: true },
      );
      if (!doc) throw new GraphQLError('Job not found or access denied', { extensions: { code: 'NOT_FOUND' } });
      return mapJob(doc);
    },
  },

  JobListing: {
    __resolveReference: async ({ id }: { id: string }) => {
      const doc = await JobListingModel.findById(id);
      return doc ? mapJob(doc) : null;
    },
    organisation: (job: { organisation: { id: string } }) => job.organisation,
  },

  Organisation: {
    __resolveReference: ({ id }: { id: string }) => ({ id }),
    jobListings: async ({ id }: { id: string }) => {
      const docs = await JobListingModel.find({ organisationId: new mongoose.Types.ObjectId(id) }).sort({ _id: -1 });
      return docs.map(mapJob);
    },
  },
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
