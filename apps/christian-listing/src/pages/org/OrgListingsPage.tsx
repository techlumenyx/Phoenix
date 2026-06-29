import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { MY_MARKETPLACE_LISTINGS } from '../../graphql/mutations';

interface MarketplaceListing {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  condition: string;
  region: string;
  status: string;
  isDonation: boolean;
  createdAt: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  ELECTRONICS: 'Electronics', CLOTHING: 'Clothing', BOOKS: 'Books',
  FURNITURE: 'Furniture', FOOD: 'Food', BABY_AND_KIDS: 'Baby & Kids',
  CHARITY_ITEMS: 'Charity Items', OTHER: 'Other',
};
const CONDITION_LABEL: Record<string, string> = {
  NEW: 'New', LIKE_NEW: 'Like New', GOOD: 'Good', FAIR: 'Fair',
};
const CONDITION_ORDER: Record<string, number> = { NEW: 0, LIKE_NEW: 1, GOOD: 2, FAIR: 3 };
const STATUS_STYLE: Record<string, string> = {
  AVAILABLE:      'bg-green-50 text-green-700',
  RESERVED:       'bg-yellow-50 text-yellow-700',
  SOLD:           'bg-gray-100 text-gray-500',
  PENDING_REVIEW: 'bg-blue-50 text-blue-700',
};
const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
function formatPrice(price: number, currency: string, isDonation: boolean) {
  if (isDonation) return 'Free';
  const sym: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', NGN: '₦' };
  return `${sym[currency] ?? currency}${price.toLocaleString()}`;
}

type SortKey = 'title' | 'category' | 'price' | 'condition' | 'createdAt' | 'status';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <span className={`ml-1 inline-flex flex-col leading-none ${active ? 'text-[#1B1B1B]' : 'text-gray-300'}`}>
      <span className={`text-[8px] leading-none ${active && dir === 'asc' ? 'text-[#C9A96E]' : ''}`}>▲</span>
      <span className={`text-[8px] leading-none ${active && dir === 'desc' ? 'text-[#C9A96E]' : ''}`}>▼</span>
    </span>
  );
}

export default function OrgListingsPage() {
  const [activeTab, setActiveTab] = useState('Active Listings');
  const tabs = ['Active Listings', 'Pending Review'];
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);

  const { data, loading, error } = useQuery(MY_MARKETPLACE_LISTINGS);
  const allListings: MarketplaceListing[] = data?.me?.marketplaceListings ?? [];

  const filtered = allListings.filter((l) => {
    if (activeTab === 'Active Listings')  return l.status === 'AVAILABLE' || l.status === 'RESERVED';
    if (activeTab === 'Pending Review')   return l.status === 'PENDING_REVIEW';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'title')     cmp = a.title.localeCompare(b.title);
    else if (sortKey === 'category')  cmp = a.category.localeCompare(b.category);
    else if (sortKey === 'price')     cmp = a.price - b.price;
    else if (sortKey === 'condition') cmp = (CONDITION_ORDER[a.condition] ?? 99) - (CONDITION_ORDER[b.condition] ?? 99);
    else if (sortKey === 'createdAt') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    else if (sortKey === 'status')    cmp = a.status.localeCompare(b.status);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(0);
  }
  function handleTabChange(tab: string) { setActiveTab(tab); setPage(0); }

  const startRow = sorted.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const endRow = Math.min((page + 1) * PAGE_SIZE, sorted.length);

  function ColHeader({ label, sortable }: { label: string; sortable?: SortKey }) {
    if (!sortable) return <div className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">{label}</div>;
    return (
      <button
        onClick={() => handleSort(sortable)}
        className="flex items-center text-[11px] font-bold text-gray-500 tracking-wider uppercase hover:text-gray-800 transition-colors"
      >
        {label}<SortIcon active={sortKey === sortable} dir={sortDir} />
      </button>
    );
  }

  return (
    <div className="font-sans w-full max-w-7xl mx-auto bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6">
        <h1 className="text-3xl font-serif font-bold text-[#1B1B1B]">Listings Manager</h1>
        <div className="flex items-center gap-8 border-b border-gray-200 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab ? 'text-[#1B1B1B]' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#1B1B1B]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-[#FAF6ED] px-6 py-4 border-b border-gray-200 grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center">
        <ColHeader label="Listing Details" sortable="title" />
        <ColHeader label="Category"        sortable="category" />
        <ColHeader label="Price"           sortable="price" />
        <ColHeader label="Condition"       sortable="condition" />
        <ColHeader label="Date"            sortable="createdAt" />
        <ColHeader label="Status"          sortable="status" />
        <div className="w-6" />
      </div>

      {loading && <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading listings...</div>}
      {error   && <div className="flex items-center justify-center py-16 text-sm text-red-500">{error.message}</div>}
      {!loading && !error && sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-sm font-semibold text-gray-600">No listings yet</p>
          <p className="text-xs text-gray-400">Create your first listing from the Overview page.</p>
        </div>
      )}

      {!loading && !error && paginated.length > 0 && (
        <div className="flex flex-col">
          {paginated.map((item, index) => (
            <div
              key={item.id}
              className={`px-6 py-4 grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center ${
                index !== paginated.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[#EAEAF5] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#1B1B1B]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-[#1B1B1B] text-[14px] leading-snug">{item.title}</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">{item.region}</p>
                </div>
              </div>
              <div className="text-[13px] text-gray-500">{CATEGORY_LABEL[item.category] ?? item.category}</div>
              <div className="text-[13px] text-gray-500">{formatPrice(item.price, item.currency, item.isDonation)}</div>
              <div className="text-[13px] text-gray-500">{CONDITION_LABEL[item.condition] ?? item.condition}</div>
              <div className="text-[13px] text-gray-500">{formatDate(item.createdAt)}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLE[item.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && sorted.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-600">{startRow}–{endRow}</span> of <span className="font-semibold text-gray-600">{sorted.length}</span> listings
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                  page === i ? 'bg-[#1B1B1B] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="py-8 flex justify-center border-t border-gray-100">
        <button className="text-[13px] font-semibold text-[#1B1B1B] uppercase tracking-wide underline underline-offset-4 hover:text-gray-600 transition-colors">
          Create New Listing +
        </button>
      </div>
    </div>
  );
}
