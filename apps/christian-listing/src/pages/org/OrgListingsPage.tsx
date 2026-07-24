import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  DELETE_MARKETPLACE_ITEM,
  MY_MARKETPLACE_LISTINGS,
  UPDATE_MARKETPLACE_ITEM,
  UPDATE_MARKETPLACE_ITEM_STATUS,
} from '../../graphql/mutations';
import { CreateListingForm, type ManagedFormMode, type ManagedListingFormItem } from './OrgOverviewPage';

type ListingStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'PENDING_REVIEW';

interface MarketplaceListing extends ManagedListingFormItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  condition: string;
  region: string;
  area?: string | null;
  imageUrls: string[];
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  status: ListingStatus;
  isDonation: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  ELECTRONICS: 'Electronics', CLOTHING: 'Clothing', BOOKS: 'Books',
  FURNITURE: 'Furniture', FOOD: 'Food', BABY_AND_KIDS: 'Baby & Kids',
  CHARITY_ITEMS: 'Charity Items', OTHER: 'Other',
};
const CONDITION_LABEL: Record<string, string> = {
  NEW: 'New', LIKE_NEW: 'Like New', GOOD: 'Good', FAIR: 'Fair',
};
const STATUS_STYLE: Record<ListingStatus, string> = {
  AVAILABLE: 'bg-green-50 text-green-700',
  RESERVED: 'bg-amber-50 text-amber-700',
  SOLD: 'bg-gray-100 text-gray-600',
  PENDING_REVIEW: 'bg-blue-50 text-blue-700',
};
const CATEGORIES = Object.keys(CATEGORY_LABEL);
const CONDITIONS = Object.keys(CONDITION_LABEL);
const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPrice(item: MarketplaceListing) {
  if (item.isDonation) return 'Free';
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: item.currency }).format(item.price);
  } catch {
    return `${item.currency} ${item.price.toLocaleString()}`;
  }
}

function ListingModal({
  listing,
  mode,
  busy,
  onClose,
  onSave,
  onDelete,
}: {
  listing: MarketplaceListing;
  mode: 'edit' | 'delete';
  busy: boolean;
  onClose: () => void;
  onSave: (input: Record<string, unknown>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [category, setCategory] = useState(listing.category);
  const [condition, setCondition] = useState(listing.condition);
  const [region, setRegion] = useState(listing.region);
  const [currency, setCurrency] = useState(listing.currency);
  const [price, setPrice] = useState(String(listing.price));
  const [isDonation, setIsDonation] = useState(listing.isDonation);
  const [error, setError] = useState('');

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !description.trim() || !region.trim()) {
      setError('Title, description, and region are required.');
      return;
    }
    const parsedPrice = Number(price);
    if (!isDonation && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      setError('Enter a valid price.');
      return;
    }
    setError('');
    await onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      region: region.trim(),
      currency: currency.trim().toUpperCase(),
      price: isDonation ? 0 : parsedPrice,
      isDonation,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="listing-modal-title">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 id="listing-modal-title" className="font-serif text-2xl font-bold text-[#1B1B1B]">
              {mode === 'delete' ? 'Delete listing?' : 'Edit listing'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {mode === 'delete' ? 'This permanently removes the listing and cannot be undone.' : 'Changes appear immediately on the marketplace.'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">✕</button>
        </div>

        {mode === 'delete' ? (
          <div className="px-6 py-6">
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4">
              <p className="font-semibold text-gray-900">{listing.title}</p>
              <p className="mt-1 text-sm text-gray-600">{formatPrice(listing)} · {listing.region}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="button" disabled={busy} onClick={onDelete} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{busy ? 'Deleting…' : 'Delete listing'}</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="max-h-[75vh] space-y-4 overflow-y-auto px-6 py-6">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <label className="block text-sm font-semibold text-gray-700">Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal outline-none focus:border-[#C9A96E]" />
            </label>
            <label className="block text-sm font-semibold text-gray-700">Description
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 font-normal outline-none focus:border-[#C9A96E]" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-700">Category
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 font-normal">
                  {CATEGORIES.map((value) => <option key={value} value={value}>{CATEGORY_LABEL[value]}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-gray-700">Condition
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 font-normal">
                  {CONDITIONS.map((value) => <option key={value} value={value}>{CONDITION_LABEL[value]}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-sm font-semibold text-gray-700">Region
              <input value={region} onChange={(e) => setRegion(e.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal outline-none focus:border-[#C9A96E]" />
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={isDonation} onChange={(e) => setIsDonation(e.target.checked)} className="h-4 w-4 accent-[#1B1B1B]" />
              Free community donation
            </label>
            {!isDonation && (
              <div className="grid grid-cols-[110px_1fr] gap-3">
                <label className="block text-sm font-semibold text-gray-700">Currency
                  <input maxLength={3} value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal uppercase" />
                </label>
                <label className="block text-sm font-semibold text-gray-700">Price
                  <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal" />
                </label>
              </div>
            )}
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
              <button type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={busy} className="rounded-lg bg-[#1B1B1B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#333] disabled:opacity-60">{busy ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function OrgListingsPage() {
  const [activeTab, setActiveTab] = useState<'Active' | 'Review' | 'Sold'>('Active');
  const [page, setPage] = useState(0);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ listing: MarketplaceListing; mode: 'edit' | 'delete' } | null>(null);
  const [formState, setFormState] = useState<{ listing: MarketplaceListing; mode: Exclude<ManagedFormMode, 'create'> } | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const { data, loading, error, refetch } = useQuery(MY_MARKETPLACE_LISTINGS, { fetchPolicy: 'cache-and-network' });
  const organisationId = data?.myOrganisations?.[0]?.id as string | undefined;
  const [updateItem, updateState] = useMutation(UPDATE_MARKETPLACE_ITEM);
  const [updateStatus, statusState] = useMutation(UPDATE_MARKETPLACE_ITEM_STATUS);
  const [deleteItem, deleteState] = useMutation(DELETE_MARKETPLACE_ITEM);

  const allListings: MarketplaceListing[] = data?.myOrganisations?.[0]?.marketplaceListings ?? [];
  const filtered = useMemo(() => allListings.filter((listing) => {
    if (activeTab === 'Active') return listing.status === 'AVAILABLE' || listing.status === 'RESERVED';
    if (activeTab === 'Review') return listing.status === 'PENDING_REVIEW';
    return listing.status === 'SOLD';
  }), [activeTab, allListings]);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const busy = updateState.loading || statusState.loading || deleteState.loading;

  function showNotice(tone: 'success' | 'error', text: string) {
    setNotice({ tone, text });
    window.setTimeout(() => setNotice(null), 4000);
  }

  function openForm(listing: MarketplaceListing, mode: 'view' | 'edit') {
    setFormState({ listing, mode });
    setMenuId(null);
    window.requestAnimationFrame(() => document.getElementById('create-listing')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  async function changeStatus(listing: MarketplaceListing, status: Exclude<ListingStatus, 'PENDING_REVIEW'>) {
    setMenuId(null);
    try {
      await updateStatus({ variables: { id: listing.id, status } });
      await refetch();
      showNotice('success', status === 'SOLD' ? 'Listing marked as sold.' : status === 'RESERVED' ? 'Listing reserved.' : 'Listing is available again.');
    } catch {
      showNotice('error', 'Could not update listing status. Please try again.');
    }
  }

  async function saveListing(input: Record<string, unknown>) {
    if (!modal) return;
    try {
      await updateItem({ variables: { id: modal.listing.id, input } });
      await refetch();
      setModal(null);
      showNotice('success', 'Listing changes saved.');
    } catch {
      showNotice('error', 'Could not save the listing. Please try again.');
    }
  }

  async function removeListing() {
    if (!modal) return;
    try {
      await deleteItem({ variables: { id: modal.listing.id } });
      await refetch();
      setModal(null);
      showNotice('success', 'Listing deleted.');
    } catch {
      showNotice('error', 'Could not delete the listing. Please try again.');
    }
  }

  const tabs = [
    { id: 'Active' as const, label: 'Active listings', count: allListings.filter((l) => l.status === 'AVAILABLE' || l.status === 'RESERVED').length },
    { id: 'Review' as const, label: 'Pending review', count: allListings.filter((l) => l.status === 'PENDING_REVIEW').length },
    { id: 'Sold' as const, label: 'Sold', count: allListings.filter((l) => l.status === 'SOLD').length },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      {notice && <div className={`fixed right-5 top-5 z-[60] rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${notice.tone === 'success' ? 'bg-[#163D2E] text-white' : 'bg-red-600 text-white'}`}>{notice.text}</div>}

      <div className="overflow-visible rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-5 px-5 pt-6 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1B1B1B]">Listings Manager</h1>
            <p className="mt-1 text-sm text-gray-500">Edit inventory and keep availability up to date.</p>
          </div>
          <a href="#create-listing" onClick={() => setFormState(null)} className="inline-flex items-center justify-center rounded-lg bg-[#1B1B1B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#333]">Create new listing +</a>
        </div>

        <div className="mt-6 flex gap-7 overflow-x-auto border-b border-gray-200 px-5 sm:px-6">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setPage(0); }} className={`relative whitespace-nowrap pb-3 text-sm font-medium ${activeTab === tab.id ? 'text-[#1B1B1B]' : 'text-gray-500 hover:text-gray-800'}`}>
              {tab.label} <span className="ml-1 text-xs text-gray-400">{tab.count}</span>
              {activeTab === tab.id && <span className="absolute -bottom-px left-0 h-0.5 w-full bg-[#1B1B1B]" />}
            </button>
          ))}
        </div>

        {loading && !data && <div className="py-16 text-center text-sm text-gray-500">Loading listings…</div>}
        {error && <div className="m-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">We couldn’t load your listings. <button onClick={() => refetch()} className="ml-2 font-semibold underline">Try again</button></div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF6ED] text-xl">◇</div>
            <p className="font-semibold text-gray-800">No {activeTab.toLowerCase()} listings</p>
            <p className="mt-1 text-sm text-gray-500">Listings in this state will appear here.</p>
          </div>
        )}

        {!error && paginated.length > 0 && (
          <>
            <div className="hidden grid-cols-[2.4fr_1fr_1fr_1fr_1fr_52px] gap-4 border-b border-gray-200 bg-[#FAF6ED] px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 md:grid">
              <span>Listing details</span><span>Category</span><span>Price</span><span>Condition</span><span>Status</span><span />
            </div>
            <div>
              {paginated.map((item) => (
                <div key={item.id} className="relative grid gap-3 border-b border-gray-100 px-5 py-4 last:border-b-0 md:grid-cols-[2.4fr_1fr_1fr_1fr_1fr_52px] md:items-center md:gap-4 md:px-6">
                  <div className="flex min-w-0 items-center gap-4">
                    {item.imageUrls[0] ? <img src={item.imageUrls[0]} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EAEAF5] text-lg">□</div>}
                    <div className="min-w-0">
                      <Link to={`/marketplace/${item.id}`} className="block truncate text-sm font-bold text-[#1B1B1B] hover:underline">{item.title}</Link>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{item.region} · Updated {formatDate(item.updatedAt)}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600"><span className="mr-2 text-xs font-semibold text-gray-400 md:hidden">Category:</span>{CATEGORY_LABEL[item.category] ?? item.category}</div>
                  <div className="text-sm text-gray-600"><span className="mr-2 text-xs font-semibold text-gray-400 md:hidden">Price:</span>{formatPrice(item)}</div>
                  <div className="text-sm text-gray-600"><span className="mr-2 text-xs font-semibold text-gray-400 md:hidden">Condition:</span>{CONDITION_LABEL[item.condition] ?? item.condition}</div>
                  <div><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${STATUS_STYLE[item.status]}`}>{item.status.replace('_', ' ')}</span></div>
                  <div className="absolute right-4 top-4 md:relative md:right-auto md:top-auto">
                    <button onClick={() => setMenuId(menuId === item.id ? null : item.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100" aria-label={`Manage ${item.title}`} aria-expanded={menuId === item.id}>⋮</button>
                    {menuId === item.id && (
                      <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
                        <button onClick={() => openForm(item, 'view')} className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50">View listing</button>
                        <button onClick={() => openForm(item, 'edit')} className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50">Edit listing</button>
                        {item.status !== 'AVAILABLE' && <button onClick={() => changeStatus(item, 'AVAILABLE')} className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50">Mark available</button>}
                        {item.status === 'AVAILABLE' && <button onClick={() => changeStatus(item, 'RESERVED')} className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50">Mark reserved</button>}
                        {item.status !== 'SOLD' && <button onClick={() => changeStatus(item, 'SOLD')} className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50">Mark sold</button>}
                        <button onClick={() => { setModal({ listing: item, mode: 'delete' }); setMenuId(null); }} className="block w-full border-t border-gray-100 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">Delete listing</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!error && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <p className="text-xs text-gray-500">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page === 0} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold disabled:opacity-40">Previous</button>
              <button onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={page === totalPages - 1} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      <section id="create-listing" className="mt-8 scroll-mt-24 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5"><div><h2 className="font-serif text-2xl font-bold text-[#1B1B1B]">{formState?.mode === 'view' ? 'View Marketplace Listing' : formState?.mode === 'edit' ? 'Edit Marketplace Listing' : 'Create a Marketplace Listing'}</h2><p className="mt-1 text-sm text-gray-500">{formState ? 'Review the complete listing using the same publishing form.' : 'List an item for sale or share it as a community donation.'}</p></div>{formState && <div className="flex gap-2">{formState.mode === 'view' && <button type="button" onClick={() => setFormState((current) => current ? { ...current, mode: 'edit' } : current)} className="rounded-lg bg-[#1B1B1B] px-4 py-2 text-sm font-semibold text-white">Edit</button>}<button type="button" onClick={() => setFormState(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold">Close</button></div>}</div>
        <div className="px-6 py-6"><CreateListingForm key={`${formState?.mode ?? 'create'}:${formState?.listing.id ?? 'new'}`} orgId={organisationId} mode={formState?.mode ?? 'create'} item={formState?.listing} onCreated={() => { void refetch(); }} onSaved={() => { void refetch(); showNotice('success', 'Listing changes saved.'); setFormState(null); }} /></div>
      </section>
      {modal && <ListingModal listing={modal.listing} mode={modal.mode} busy={busy} onClose={() => !busy && setModal(null)} onSave={saveListing} onDelete={removeListing} />}
    </div>
  );
}
