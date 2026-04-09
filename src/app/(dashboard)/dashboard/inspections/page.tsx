"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Filter, Plus, ClipboardList } from "lucide-react";
import { InspectionCard } from "@/components/inspections/InspectionCard";
import { Button } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useInspections } from "@/hooks/useInspections";

const STATUSES = ["", "draft", "in_progress", "submitted", "under_review", "pending_actions", "completed", "finalized"];

export default function InspectionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage]   = useState(1);

  const { data, isLoading } = useInspections({ search, status, page, limit: 12 });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Inspections</h1>
        <Button onClick={() => router.push("/dashboard/inspections/new")}>
          <Plus className="w-4 h-4" /> New inspection
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search by project or location..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select className="input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s ? s.replace(/_/g, " ") : "All statuses"}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? <PageSpinner /> : data?.inspections?.length ? (
        <>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}>
            {data.inspections.map((i) => (
              <motion.div key={i.id} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
                <InspectionCard inspection={i} />
              </motion.div>
            ))}
          </motion.div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Showing {data.inspections.length} of {data.total}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={page >= (data.total_pages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState icon={ClipboardList} title="No inspections found" description="Try adjusting your filters" />
      )}
    </div>
  );
}
