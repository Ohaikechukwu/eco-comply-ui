"use client";
import { ClipboardList, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/dashboard/StatCard";
import { InspectionCard } from "@/components/inspections/InspectionCard";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "@/hooks/useInspections";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const router = useRouter();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold app-text">Dashboard</h1>
          <p className="text-sm app-muted mt-0.5">Overview of your inspection activity</p>
        </div>
        <Button onClick={() => router.push("/dashboard/inspections/new")}>
          + New inspection
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total"           value={data?.total ?? 0}              icon={ClipboardList}  color="blue"   />
        <StatCard title="Completed"       value={data?.completed ?? 0}         icon={CheckCircle}    color="green"  />
        <StatCard title="Pending review"  value={data?.under_review ?? 0}      icon={Clock}          color="orange" />
        <StatCard title="Pending actions" value={data?.pending_actions ?? 0}   icon={AlertTriangle}  color="red"    />
      </div>

      <div>
        <h2 className="text-sm font-semibold app-text mb-3">Recent inspections</h2>
        {data?.recent?.length ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {data.recent.map((i) => (
              <motion.div key={i.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <InspectionCard inspection={i} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No inspections yet"
            description="Create your first inspection to get started"
            action={<Button onClick={() => router.push("/dashboard/inspections/new")}>Create inspection</Button>}
          />
        )}
      </div>
    </div>
  );
}
