import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import MarketplaceCard from '../components/cards/MarketplaceCard';
import { formatPrice } from '../lib/discovery';
import { useAuthStore } from '../store/authStore';
import ReportListingModal from '../components/marketplace/ReportListingModal';

const MARKETPLACE_DETAILS = gql`
  query MarketplaceDetails($id: ID!, $region: String, $category: MarketplaceCategory) {
    marketplaceItem(id: $id) {
      id title description price currency condition category area region imageUrls status
      isDonation isPromoted flagCount subCategory dimensions otherAttributes maxRetailPrice
      contactInfo showContactOnOffer createdAt
      seller { id name avatarUrl bio isVerified region socialLinks { whatsapp instagram facebook website } }
    }
    marketplaceItems(region: $region, category: $category, status: AVAILABLE, limit: 5) {
      edges { id title description price currency condition region imageUrls isDonation seller { id isVerified } }
    }
  }
`;

const REPORT_LISTING = gql`
  mutation MarketplaceDetailsReport($itemId: ID!, $reason: String!) {
    reportListing(itemId: $itemId, reason: $reason)
  }
`;
const MARKETPLACE_SAVED = gql`query MarketplaceSavedState($id: ID!) { isMarketplaceItemSaved(id: $id) }`;
const SAVE_MARKETPLACE = gql`mutation SaveMarketplaceDetails($id: ID!) { saveMarketplaceItem(id: $id) }`;
const UNSAVE_MARKETPLACE = gql`mutation UnsaveMarketplaceDetails($id: ID!) { unsaveMarketplaceItem(id: $id) }`;
const START_CONVERSATION = gql`mutation StartListingConversation($listingId: ID!, $message: String!) { startListingConversation(listingId: $listingId, message: $message) { id } }`;

interface MarketplaceDetailsData {
  marketplaceItem: null | {
    id: string; title: string; description: string; price: number; currency: string; condition: string; category: string; area?: string | null; region: string;
    imageUrls: string[]; status: string; isDonation: boolean; isPromoted: boolean; flagCount: number; subCategory?: string | null;
    dimensions?: string | null; otherAttributes?: string | null; maxRetailPrice?: number | null; contactInfo?: string | null; showContactOnOffer: boolean; createdAt: string;
    seller: { id: string; name: string; avatarUrl?: string | null; bio?: string | null; isVerified: boolean; region: string; socialLinks?: { whatsapp?: string | null; instagram?: string | null; facebook?: string | null; website?: string | null } | null };
  };
  marketplaceItems: { edges: Array<{ id: string; title: string; description: string; price: number; currency: string; condition: string; region: string; imageUrls: string[]; isDonation: boolean; seller: { id: string; isVerified: boolean } }> };
}

export default function MarketplaceDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [selectedImage, setSelectedImage] = useState(0);
  const [notice, setNotice] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [firstMessage, setFirstMessage] = useState('');
  const { data, loading, error } = useQuery<MarketplaceDetailsData>(MARKETPLACE_DETAILS, { variables: { id, region: null, category: null }, skip: !id });
  const { data: savedData, refetch: refetchSaved } = useQuery<{ isMarketplaceItemSaved: boolean }>(MARKETPLACE_SAVED, { variables: { id }, skip: !id || !user });
  const [saveItem, { loading: saving }] = useMutation(SAVE_MARKETPLACE); const [unsaveItem] = useMutation(UNSAVE_MARKETPLACE);
  const saved = savedData?.isMarketplaceItemSaved ?? false;
  const [reportListing, { loading: reporting }] = useMutation(REPORT_LISTING);
  const [startConversation, { loading: startingConversation }] = useMutation(START_CONVERSATION);
  const item = data?.marketplaceItem;

  const openReport = () => {
    if (!user) { navigate('/signin', { state: { from: location } }); return; }
    setShowReportModal(true);
  };
  const openMessage = () => { if (!user) { navigate('/signin', { state: { from: location.pathname } }); return; } setFirstMessage(`Hi, I'm interested in ${item?.title ?? 'this listing'}. Is it still available?`); setShowMessageModal(true); };
  const sendFirstMessage = async () => { const message = firstMessage.trim(); if (!message) return; const result = await startConversation({ variables: { listingId: id, message } }); const threadId = result.data?.startListingConversation?.id; if (threadId) navigate(`/dashboard/messages/${threadId}`); };

  const report = async (reason: string) => {
    await reportListing({ variables: { itemId: id, reason } });
    setShowReportModal(false);
    setNotice('Thank you. The listing has been reported for review.');
  };
  const toggleSaved = async () => { if (!user) { navigate('/signin', { state: { from: location.pathname } }); return; } await (saved ? unsaveItem : saveItem)({ variables: { id } }); setNotice(saved ? 'Removed from saved items.' : 'Listing saved.'); await refetchSaved(); };

  const share = async () => {
    const shareData = { title: item?.title ?? 'Christian Listings marketplace item', url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else { await navigator.clipboard.writeText(window.location.href); setNotice('Listing link copied.'); }
  };

  if (loading) return <PageMessage title="Loading listing…" />;
  if (error) return <PageMessage title="We couldn’t load this listing" detail={error.message} />;
  if (!item) return <PageMessage title="Listing not found" detail="This listing may have been removed or sold." />;

  const images = item.imageUrls.length ? item.imageUrls : ['/assets/car-ford.png'];
  const related = (data?.marketplaceItems.edges ?? []).filter((listing) => listing.id !== item.id).slice(0, 4);
  const price = item.isDonation ? 'Free donation' : formatPrice(item.price, item.currency);

  return (
    <main className="min-h-screen bg-white px-5 py-8 text-[#0d1727] md:px-10 lg:px-16">
      {showReportModal && <ReportListingModal listingTitle={item.title} submitting={reporting} onClose={() => setShowReportModal(false)} onSubmit={report} />}
      {showMessageModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-gray-400">Contact seller</p><h2 className="mt-1 font-serif text-2xl font-bold">{item.title}</h2></div><button onClick={() => setShowMessageModal(false)} aria-label="Close" className="text-2xl">×</button></div><textarea autoFocus value={firstMessage} onChange={(event) => setFirstMessage(event.target.value)} maxLength={2000} rows={6} className="mt-5 w-full resize-none rounded-2xl bg-[#f2edf2] p-4 text-sm outline-none focus:ring-2 focus:ring-[#4a1746]/30"/><p className="mt-2 text-right text-xs text-gray-400">{firstMessage.length}/2000</p><div className="mt-5 flex justify-end gap-3"><button onClick={() => setShowMessageModal(false)} className="rounded-full border px-5 py-2.5 text-sm">Cancel</button><button disabled={startingConversation || !firstMessage.trim()} onClick={sendFirstMessage} className="rounded-full bg-[#004b3d] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{startingConversation ? 'Sending...' : 'Send message'}</button></div></div></div>}
      <div className="mx-auto max-w-7xl">
        <nav className="mb-5 text-sm font-serif text-gray-600"><Link to="/marketplace">Marketplace</Link> <span>›</span> <Link to="/marketplace">{item.category.replaceAll('_', ' ')}</Link> <span>›</span> <span className="text-gray-900">Product</span></nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.85fr)] lg:gap-12">
          <section>
            <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-gray-100 shadow-sm">
              <img src={images[selectedImage]} alt={item.title} className="h-full w-full object-cover" />
              <span className="absolute left-4 top-4 rounded-full bg-[#c84c64] px-3 py-1 text-[10px] font-bold uppercase text-white">{item.isDonation ? 'Community Gives' : item.status.replaceAll('_', ' ')}</span>
              {item.seller.isVerified && <span className="absolute right-4 top-4 rounded-full bg-[#83d34c] px-3 py-1 text-[10px] font-bold uppercase text-[#17310b]">✓ Verified</span>}
            </div>
            <div className="mt-2 grid grid-cols-5 gap-2">{images.slice(0, 5).map((image, index) => <button key={`${image}-${index}`} onClick={() => setSelectedImage(index)} className={`aspect-[4/3] overflow-hidden rounded-lg border-2 ${selectedImage === index ? 'border-[#4b143f]' : 'border-transparent'}`}><img src={image} alt={`${item.title} view ${index + 1}`} className="h-full w-full object-cover" /></button>)}</div>

            <section className="mt-9"><h2 className="font-serif text-2xl font-bold">Product Description</h2>{item.description.split(/\n\n+/).map((paragraph, index) => <p key={index} className="mt-3 text-sm leading-6 text-gray-600">{paragraph}</p>)}</section>
            <section className="mt-7 border-t border-gray-200 pt-6"><h2 className="font-serif text-xl font-bold">Details &amp; Dimensions</h2><dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6 text-xs sm:grid-cols-4"><Detail label="Material" value={item.otherAttributes || 'Not specified'} /><Detail label="Dimensions" value={item.dimensions || 'Not specified'} /><Detail label="Condition" value={item.condition.replaceAll('_', ' ')} /><Detail label="Location" value={item.area ? `${item.area}, ${item.region}` : item.region} /><Detail label="Category" value={item.category.replaceAll('_', ' ')} /><Detail label="Sub category" value={item.subCategory || 'General'} /><Detail label="Type" value={item.isDonation ? 'Donation' : 'For Sale'} /><Detail label="Listed" value={new Date(item.createdAt).toLocaleDateString()} /></dl></section>
          </section>

          <aside>
            <h1 className="font-serif text-3xl font-bold">{item.title}</h1><p className="mt-2 text-3xl font-bold">{price}</p>{item.maxRetailPrice && !item.isDonation && <p className="mt-1 text-xs text-gray-400 line-through">Retail {formatPrice(item.maxRetailPrice, item.currency)}</p>}
            <section className="mt-7 rounded-xl bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.05)]">
              <button onClick={openMessage} className="block w-full rounded-lg bg-[#004b3d] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#00614f]">✉ Contact Seller</button>
              <button disabled title="Offer negotiation is planned for Phase 2" className="mt-3 w-full rounded-lg border border-gray-400 px-4 py-3 text-sm text-gray-500">Make an Offer · Coming Soon</button>
              <button disabled={saving} onClick={toggleSaved} className="mt-4 w-full py-2 text-xs text-gray-600 disabled:opacity-50">{saved ? '♥ Saved' : '♡ Save Listing'}</button>
              <button onClick={openReport} className="w-full py-2 text-xs text-gray-600">◈ Report the listing</button>
              {notice && <p role="status" className="mt-2 text-center text-xs text-green-700">{notice}</p>}
            </section>

            <SellerCard seller={item.seller} />
            <section className="mt-5 rounded-xl border border-gray-200 bg-[#eef3fd] p-5 shadow-sm"><h3 className="text-sm font-bold text-[#1e3714]">◉ Sanctuary Trust Guarantee</h3><p className="mt-2 pl-5 text-xs leading-4 text-gray-600">Check item condition and meet safely. Verified seller information helps protect the community.</p><p className="mt-3 text-right text-[10px] font-bold underline">Learn about safe meetups →</p></section>
            <div className="mt-7 flex items-center justify-between"><span className="text-[10px] uppercase tracking-widest text-gray-500">Share this listing:</span><button onClick={share} className="rounded-full bg-[#dfe8f7] px-4 py-2 text-xs font-semibold">Share / Copy Link</button></div>
          </aside>
        </div>

        <section className="mt-14"><div className="mb-5 flex items-end justify-between"><h2 className="font-serif text-3xl font-bold">Other Listings</h2><Link to="/marketplace" className="text-xs uppercase tracking-wider">View all listings</Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((listing) => <MarketplaceCard key={listing.id} title={listing.title} description={listing.description} badge={listing.isDonation ? 'Community Gives' : listing.condition.replaceAll('_', ' ')} price={listing.isDonation ? 'Free donation' : formatPrice(listing.price, listing.currency)} location={listing.region} imageSrc={listing.imageUrls[0]} verified={listing.seller.isVerified} href={`/marketplace/${listing.id}`} />)}</div>{related.length === 0 && <p className="text-sm text-gray-500">No related listings are available right now.</p>}</section>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-[9px] uppercase tracking-wider text-gray-500">{label}</dt><dd className="mt-1 font-semibold capitalize text-gray-900">{value}</dd></div>; }
function SellerCard({ seller }: { seller: NonNullable<MarketplaceDetailsData['marketplaceItem']>['seller'] }) { return <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#ede5db] font-serif text-xl font-bold">{seller.avatarUrl ? <img src={seller.avatarUrl} alt="" className="h-full w-full object-cover" /> : seller.name.charAt(0)}</div><div><h3 className="font-serif text-lg font-bold">{seller.name}</h3><p className="text-xs text-gray-500">{seller.region}</p></div></div>{seller.bio && <p className="mt-4 text-xs leading-5 text-gray-500">“{seller.bio}”</p>}<div className="mt-4 flex gap-5 text-[10px] text-gray-600"><span>◉ Community Seller</span>{seller.isVerified && <span>✓ Verified Poster</span>}</div></section>; }
function PageMessage({ title, detail }: { title: string; detail?: string }) { return <main className="flex min-h-[65vh] items-center justify-center px-6 text-center"><div><h1 className="font-serif text-3xl font-bold">{title}</h1>{detail && <p className="mt-3 text-sm text-gray-500">{detail}</p>}<Link to="/marketplace" className="mt-6 inline-block rounded-full bg-[#004b3d] px-5 py-2.5 text-sm text-white">Browse marketplace</Link></div></main>; }
