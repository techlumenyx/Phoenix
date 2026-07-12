import { gql, useMutation, useQuery } from '@apollo/client';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const APPLICATION_CONTEXT = gql`
  query JobApplicationContext($id: ID!) {
    jobListing(id: $id) { id title status applicationDeadline organisation { id name } }
    myJobApplication(jobId: $id) { id status createdAt }
  }
`;

const SUBMIT_APPLICATION = gql`
  mutation SubmitInternalJobApplication($input: SubmitJobApplicationInput!) {
    submitJobApplication(input: $input) { id status createdAt }
  }
`;

interface EducationEntry { highestQualification: string; institutionName: string; yearOfEnrollment: string; yearOfCompletion: string; marksGrades: string; degreeType: string }
const emptyEducation = (): EducationEntry => ({ highestQualification: '', institutionName: '', yearOfEnrollment: '', yearOfCompletion: '', marksGrades: '', degreeType: '' });

interface ContextData {
  jobListing: null | { id: string; title: string; status: string; applicationDeadline: string; organisation: { id: string; name: string } };
  myJobApplication: null | { id: string; status: string; createdAt: string };
}

export default function JobApplicationPage() {
  const { id = '' } = useParams();
  const dbUser = useAuthStore((state) => state.dbUser);
  const firebaseUser = useAuthStore((state) => state.user);
  const { data, loading, error } = useQuery<ContextData>(APPLICATION_CONTEXT, { variables: { id }, skip: !id });
  const [submitApplication, { loading: submitting }] = useMutation(SUBMIT_APPLICATION);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', email: '', gender: '', dateOfBirth: '', experienceDescription: '', yearsOfExperience: '', currentSalary: '', expectedSalary: '', portfolioUrl: '', linkedInProfile: '' });
  const [education, setEducation] = useState<EducationEntry[]>([emptyEducation(), emptyEducation()]);
  const [acknowledgements, setAcknowledgements] = useState([false, false, false, false]);

  useEffect(() => {
    setForm((current) => ({ ...current, fullName: current.fullName || dbUser?.name || firebaseUser?.displayName || '', email: current.email || dbUser?.email || firebaseUser?.email || '' }));
  }, [dbUser, firebaseUser]);

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => setEducation((entries) => entries.map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: value } : entry));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    if (!acknowledgements.every(Boolean)) { setSubmitError('Please confirm all acknowledgements before submitting.'); return; }
    try {
      await submitApplication({ variables: { input: {
        jobId: id, fullName: form.fullName, phoneNumber: form.phoneNumber || null, email: form.email, gender: form.gender || null,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
        education: education.filter((entry) => Object.values(entry).some(Boolean)).map((entry) => ({ ...entry, yearOfEnrollment: entry.yearOfEnrollment ? Number(entry.yearOfEnrollment) : null, yearOfCompletion: entry.yearOfCompletion ? Number(entry.yearOfCompletion) : null })),
        experienceDescription: form.experienceDescription || null, yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : null,
        currentSalary: form.currentSalary || null, expectedSalary: form.expectedSalary || null, portfolioUrl: form.portfolioUrl || null,
        linkedInProfile: form.linkedInProfile || null, acknowledged: true,
      } } });
      setSubmitted(true);
    } catch (mutationError: unknown) {
      setSubmitError(mutationError instanceof Error ? mutationError.message : 'Application could not be submitted.');
    }
  };

  if (loading) return <PageState title="Loading application form…" />;
  if (error) return <PageState title="Couldn’t load the form" detail={error.message} />;
  if (!data?.jobListing) return <PageState title="Job not found" />;
  if (data.myJobApplication || submitted) return <SuccessState jobId={id} title={data.jobListing.title} date={data.myJobApplication?.createdAt} />;

  const job = data.jobListing;
  const isClosed = job.status !== 'ACTIVE' || new Date(job.applicationDeadline).getTime() < Date.now();
  if (isClosed) return <PageState title="Applications are closed" detail="This role is no longer accepting applications." />;

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-[#030813] md:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 text-sm font-serif text-gray-600"><Link to="/jobs">Jobs</Link> <span>›</span> <Link to={`/jobs/${id}`}>{job.title}</Link> <span>›</span> <span className="text-gray-900">Application Form</span></nav>
        <header className="mb-12"><h1 className="font-serif text-4xl font-medium">Application Form</h1><p className="mt-3 text-sm italic text-gray-600">Apply for {job.title} at {job.organisation.name}. Your details will be shared with the recruiting organisation.</p></header>

        <form onSubmit={submit} className="space-y-12">
          <FormSection title="Personal Details">
            <div className="grid gap-5 md:grid-cols-2"><Field label="Full Name" required value={form.fullName} onChange={(value) => update('fullName', value)} /><Field label="Phone Number" type="tel" value={form.phoneNumber} onChange={(value) => update('phoneNumber', value)} /><Field label="Email Address" required type="email" value={form.email} onChange={(value) => update('email', value)} /><SelectField label="Gender" value={form.gender} onChange={(value) => update('gender', value)} options={['Female', 'Male', 'Non-binary', 'Prefer not to say']} /><Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(value) => update('dateOfBirth', value)} /></div>
          </FormSection>

          <FormSection title="Educational Qualification">
            <div className="space-y-8">{education.map((entry, index) => <div key={index} className="rounded-xl border border-[#e2d8e3] p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-serif text-lg font-bold">Qualification {index + 1}</h3>{education.length > 1 && <button type="button" onClick={() => setEducation((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="text-xs text-red-600">Remove</button>}</div><div className="grid gap-5 md:grid-cols-2"><Field label="Highest Qualification Earned" value={entry.highestQualification} onChange={(value) => updateEducation(index, 'highestQualification', value)} /><Field label="Institution Name" value={entry.institutionName} onChange={(value) => updateEducation(index, 'institutionName', value)} /><Field label="Year of Enrollment" type="number" value={entry.yearOfEnrollment} onChange={(value) => updateEducation(index, 'yearOfEnrollment', value)} /><Field label="Year of Completion" type="number" value={entry.yearOfCompletion} onChange={(value) => updateEducation(index, 'yearOfCompletion', value)} /><Field label="Marks / Grades Obtained" value={entry.marksGrades} onChange={(value) => updateEducation(index, 'marksGrades', value)} /><Field label="Degree Type" value={entry.degreeType} onChange={(value) => updateEducation(index, 'degreeType', value)} /></div></div>)}</div>
            <button type="button" onClick={() => setEducation((items) => [...items, emptyEducation()])} className="mt-5 rounded-full border border-[#4a1746] px-4 py-2 text-xs font-semibold text-[#4a1746]">+ Add qualification</button>
          </FormSection>

          <FormSection title="Professional Experience">
            <label className="block text-sm font-medium">Describe your professional experience<textarea value={form.experienceDescription} onChange={(event) => update('experienceDescription', event.target.value)} rows={7} placeholder="Provide details about your professional experience..." className={`${inputClass} mt-2 resize-y`} /></label>
            <div className="mt-5 grid gap-5 md:grid-cols-3"><Field label="Total years of work experience" type="number" value={form.yearsOfExperience} onChange={(value) => update('yearsOfExperience', value)} /><Field label="Current stipend / salary" value={form.currentSalary} onChange={(value) => update('currentSalary', value)} /><Field label="Expected stipend / salary" value={form.expectedSalary} onChange={(value) => update('expectedSalary', value)} /></div>
          </FormSection>

          <FormSection title="Document Uploads">
            <div aria-disabled="true" className="rounded-xl border-2 border-dashed border-[#d8cbd9] bg-[#eee6ef] px-6 py-10 text-center text-sm text-gray-500"><p className="font-semibold text-gray-700">CV / Resume upload</p><p className="mt-2">Document uploads will be enabled with the upcoming secure media-upload feature.</p><p className="mt-1 text-xs">You can submit this application without a CV for now.</p></div>
            <div className="mt-5 grid gap-5 md:grid-cols-2"><Field label="Portfolio URL" type="url" value={form.portfolioUrl} onChange={(value) => update('portfolioUrl', value)} /><Field label="LinkedIn Profile" type="url" value={form.linkedInProfile} onChange={(value) => update('linkedInProfile', value)} /></div>
          </FormSection>

          <FormSection title="Acknowledgement">
            <div className="space-y-3">{['I confirm that the information provided is accurate to the best of my knowledge.', 'I understand that false information may result in my application being rejected.', 'I agree that the recruiting organisation may contact me about this application.', 'I understand that submission does not guarantee an interview or employment.'].map((label, index) => <label key={label} className="flex items-start gap-3 text-sm text-gray-600"><input type="checkbox" checked={acknowledgements[index]} onChange={(event) => setAcknowledgements((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.checked : item))} className="mt-1 accent-[#4a1746]" /><span>{label}</span></label>)}</div>
          </FormSection>

          {submitError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>}
          <div className="flex justify-end"><button disabled={submitting} type="submit" className="rounded-lg bg-[#302530] px-7 py-3 text-sm font-semibold text-white hover:bg-[#4a1746] disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit Application'}</button></div>
        </form>
      </div>
    </main>
  );
}

const inputClass = 'w-full rounded-xl border-0 bg-[#eee6ef] px-4 py-3 text-sm outline-none ring-[#4a1746]/30 focus:ring-2';
function FormSection({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2 className="mb-6 font-serif text-3xl font-medium">{title}</h2>{children}</section>; }
function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="block text-sm font-medium">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} mt-2`} /></label>; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label className="block text-sm font-medium">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} mt-2`}><option value="">Select…</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function PageState({ title, detail }: { title: string; detail?: string }) { return <main className="flex min-h-[65vh] items-center justify-center px-6 text-center"><div><h1 className="font-serif text-3xl font-bold">{title}</h1>{detail && <p className="mt-3 text-sm text-gray-500">{detail}</p>}<Link to="/jobs" className="mt-6 inline-block rounded-full bg-[#302530] px-5 py-2.5 text-sm text-white">Browse jobs</Link></div></main>; }
function SuccessState({ jobId, title, date }: { jobId: string; title: string; date?: string }) { return <main className="flex min-h-[70vh] items-center justify-center bg-[#fbfbfa] px-6 text-center"><div className="max-w-lg rounded-2xl bg-white p-10 shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">✓</div><h1 className="mt-5 font-serif text-3xl font-bold">Application submitted</h1><p className="mt-3 text-sm leading-6 text-gray-600">Your application for <strong>{title}</strong> has been sent to the recruiting organisation.{date ? ` Submitted ${new Date(date).toLocaleDateString()}.` : ''}</p><Link to={`/jobs/${jobId}`} className="mt-7 inline-block rounded-full bg-[#302530] px-5 py-2.5 text-sm text-white">Return to job</Link></div></main>; }
