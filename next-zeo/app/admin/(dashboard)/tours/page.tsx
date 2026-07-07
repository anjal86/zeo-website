"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import DeleteModal from "@/components/UI/DeleteModal";
import Toggle from "@/components/UI/Toggle";
import { adminFetch, adminFetchRaw } from "@/lib/adminFetch";
import { useDeleteModal } from "@/hooks/useDeleteModal";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

const api = "/api";
const limit = 20;

type AdminTour = {
  id: number;
  slug?: string;
  title: string;
  category?: string;
  location?: string;
  price?: number;
  listed?: boolean;
  primary_destination_id?: number;
};

type AdminDestination = {
  id: number;
  db_id?: number;
  name?: string;
  title?: string;
  country?: string;
};

type PaginatedTours = AdminTour[] | {
  tours?: AdminTour[];
  items?: AdminTour[];
  pagination?: { totalItems?: number };
};

type PaginatedDestinations = AdminDestination[] | {
  destinations?: AdminDestination[];
  items?: AdminDestination[];
};

function readTourList(data: PaginatedTours) {
  return Array.isArray(data) ? data : (data.tours || data.items || []);
}

function readDestinationList(data: PaginatedDestinations) {
  return Array.isArray(data) ? data : (data.destinations || data.items || []);
}

const TourManager: React.FC = () => {
  const router = useRouter();
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [destinations, setDestinations] = useState<string[]>([]);
  const [destinationsMap, setDestinationsMap] = useState<Map<number, string>>(new Map());
  const [updatingTours, setUpdatingTours] = useState<Set<number>>(new Set());
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [regionFilter, setRegionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== debouncedSearchTerm) {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  const fetchTours = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
        ...(destinationFilter ? { destination: destinationFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(regionFilter ? { region: regionFilter } : {}),
      });

      const data = await adminFetch<PaginatedTours>(`${api}/admin/tours?${params}`);
      const list = readTourList(data);
      setTours(list);
      setTotalItems(Array.isArray(data) ? list.length : (data.pagination?.totalItems ?? list.length));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch tours");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, destinationFilter, statusFilter, regionFilter]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const params = new URLSearchParams({ page: "1", limit: "500" });
        const data = await adminFetch<PaginatedDestinations>(`${api}/admin/destinations?${params}`);
        const list = readDestinationList(data);
        const names = [...new Set(list.map((dest) => dest.name || dest.title).filter(Boolean))] as string[];
        setDestinations(names);

        const map = new Map<number, string>();
        list.forEach((dest) => {
          const name = dest.name || dest.title;
          const id = dest.db_id ?? dest.id;
          if (name && id) map.set(id, name);
        });
        setDestinationsMap(map);
      } catch (err) {
        console.warn("Failed to load admin destinations for tour filters:", err);
      }
    };
    fetchDestinations();
  }, []);

  const deleteTour = async (tour: AdminTour) => {
    await adminFetch(`${api}/admin/tours/${tour.id}`, { method: "DELETE" });
    await fetchTours();
  };

  const handleExportSingleTour = async (tour: AdminTour) => {
    try {
      setExportingId(tour.id);
      const response = await adminFetchRaw(`${api}/admin/tours/${tour.id}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = tour.slug ? `${tour.slug}.json` : `tour_${tour.id}.json`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to export tour: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setExportingId(null);
    }
  };

  const deleteModal = useDeleteModal<AdminTour>({
    onDelete: deleteTour,
    getItemName: (tour) => tour.title,
    getItemId: (tour) => tour.id,
  });

  const handleToggleListing = async (tour: AdminTour) => {
    const listed = !tour.listed;
    setUpdatingTours((prev) => new Set(prev).add(tour.id));
    try {
      await adminFetch(`${api}/admin/tours/${tour.id}/listing`, {
        method: "PATCH",
        body: JSON.stringify({ listed }),
      });
      setTours((prev) => prev.map((item) => item.id === tour.id ? { ...item, listed } : item));
    } catch (err) {
      alert("Failed to update tour listing status: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setUpdatingTours((prev) => {
        const next = new Set(prev);
        next.delete(tour.id);
        return next;
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setDestinationFilter("");
    setStatusFilter("");
    setRegionFilter("");
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  if (loading && tours.length === 0) {
    return <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /><span className="ml-3 text-slate-600">Loading tours...</span></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Tours</h3>
          <p className="text-slate-600 text-sm sm:text-base">Manage your tour packages and itineraries</p>
        </div>
        <button onClick={() => router.push("/admin/tours/new")} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Tour</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="sm:col-span-2 lg:col-span-2 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search tours..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
            {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
          <select value={destinationFilter} onChange={(event) => { setDestinationFilter(event.target.value); setCurrentPage(1); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white font-medium">
            <option value="">All Destinations</option>
            {destinations.map((destination) => <option key={destination} value={destination}>{destination}</option>)}
          </select>
          <select value={regionFilter} onChange={(event) => { setRegionFilter(event.target.value); setCurrentPage(1); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white font-medium">
            <option value="">All Regions</option>
            <option value="nepal">Nepal</option>
            <option value="international">International</option>
          </select>
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white font-medium">
            <option value="">All Status</option>
            <option value="listed">Listed</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </div>
        {(searchTerm || destinationFilter || statusFilter || regionFilter) && <div className="mt-4 flex items-center justify-between text-sm"><span className="text-gray-500">Found {totalItems} tours matching your filters</span><button onClick={clearFilters} className="text-blue-600 hover:text-blue-800 font-medium">Clear all filters</button></div>}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span><button onClick={fetchTours} className="ml-auto text-sm underline">Retry</button></div>}

      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="w-1/3 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th><th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th><th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th><th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th><th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tours.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No tours found matching your search.</td></tr> : tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/tours/${tour.slug || tour.id}`)}>
                  <td className="px-4 py-4 truncate font-medium text-gray-900" title={tour.title}>{tour.title}</td>
                  <td className="px-3 py-4 text-sm text-gray-500">{tour.category || "-"}</td>
                  <td className="px-3 py-4 text-sm text-gray-500">{destinationsMap.get(tour.primary_destination_id || 0) || tour.location || "-"}</td>
                  <td className="px-3 py-4 text-sm font-semibold text-green-600">{tour.price ? `$${tour.price}` : "-"}</td>
                  <td className="px-3 py-4" onClick={(event) => event.stopPropagation()}><Toggle checked={tour.listed !== false} onChange={() => handleToggleListing(tour)} disabled={updatingTours.has(tour.id)} size="sm" /></td>
                  <td className="px-3 py-4 text-right" onClick={(event) => event.stopPropagation()}><div className="flex justify-end gap-2"><button onClick={() => router.push(`/admin/tours/${tour.slug || tour.id}`)} className="text-blue-600 hover:text-blue-900" title="Edit"><Edit className="w-4 h-4" /></button><button onClick={() => handleExportSingleTour(tour)} disabled={exportingId === tour.id} className="text-gray-600 hover:text-gray-900 disabled:opacity-50" title="Export JSON">{exportingId === tour.id ? <LoadingSpinner size="sm" /> : <Download className="w-4 h-4" />}</button><button onClick={() => deleteModal.openModal(tour)} className="text-red-600 hover:text-red-900" title="Delete"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalItems > limit && <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between"><div className="text-sm text-gray-700">Showing {startItem} to {endItem} of {totalItems} results</div><div className="flex space-x-2"><button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-white"><ChevronLeft className="w-4 h-4" /></button><button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-white"><ChevronRight className="w-4 h-4" /></button></div></div>}
      </div>

      <div className="lg:hidden space-y-4">
        {tours.length === 0 ? <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-200">No tours found matching your search.</div> : tours.map((tour) => (
          <div key={tour.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/admin/tours/${tour.slug || tour.id}`)}>
            <div className="flex justify-between items-start mb-2"><div className="font-medium text-gray-900 truncate flex-1 mr-2">{tour.title}</div><div className="text-sm font-semibold text-green-600">{tour.price ? `$${tour.price}` : "-"}</div></div>
            <div className="flex items-center gap-2 mb-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{tour.category || "Tour"}</span><span className="text-xs text-gray-500">{destinationsMap.get(tour.primary_destination_id || 0) || tour.location || "-"}</span></div>
            <div className="flex items-center justify-between pt-3 border-t"><div className="flex items-center" onClick={(event) => event.stopPropagation()}><Toggle checked={tour.listed !== false} onChange={() => handleToggleListing(tour)} disabled={updatingTours.has(tour.id)} size="sm" /><span className="ml-2 text-xs text-gray-500">Listed</span></div><div className="flex gap-3" onClick={(event) => event.stopPropagation()}><button onClick={() => router.push(`/admin/tours/${tour.slug || tour.id}`)} className="text-blue-600"><Edit className="w-4 h-4" /></button><button onClick={() => handleExportSingleTour(tour)} disabled={exportingId === tour.id} className="text-gray-600">{exportingId === tour.id ? <LoadingSpinner size="sm" /> : <Download className="w-4 h-4" />}</button><button onClick={() => deleteModal.openModal(tour)} className="text-red-600"><Trash2 className="w-4 h-4" /></button></div></div>
          </div>
        ))}
      </div>

      <DeleteModal {...deleteModal.modalProps} title="Delete Tour" message="Are you sure you want to delete this tour?" confirmText="Delete" variant="danger" />
    </div>
  );
};

export default TourManager;
