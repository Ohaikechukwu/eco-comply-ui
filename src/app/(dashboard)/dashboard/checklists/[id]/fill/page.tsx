"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { useInspection, useUpdateChecklistItem } from "@/hooks/useInspections";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function ChecklistFillPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { data: inspection, isLoading } = useInspection(id);
  const updateItem = useUpdateChecklistItem();
  const { success, error } = useToast();
  const [comments, setComments] = useState<Record<string, string>>({});

  if (isLoading) return <PageSpinner />;
  if (!inspection) return <p className="text-sm text-gray-500">Inspection not found</p>;

  const handleResponse = async (itemId: string, response: boolean | null) => {
    try {
      await updateItem.mutateAsync({ inspectionId: id, itemId, response, comment: comments[itemId] });
      success("Saved");
    } catch {
      error("Failed to save");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fill checklist</h1>
          <p className="text-sm text-gray-500">{inspection.project_name}</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden divide-y divide-gray-100">
        {inspection.checklist_items?.length ? inspection.checklist_items.map((item, idx) => (
          <div key={item.id} className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-400 font-medium w-6 shrink-0 pt-0.5">{idx + 1}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900 mb-3">{item.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => handleResponse(item.id, true)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                      item.response === true
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-green-50"
                    )}
                  >
                    <Check className="w-3.5 h-3.5" /> Yes
                  </button>
                  <button
                    onClick={() => handleResponse(item.id, false)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                      item.response === false
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-red-50"
                    )}
                  >
                    <X className="w-3.5 h-3.5" /> No
                  </button>
                  {item.response !== null && (
                    <button onClick={() => handleResponse(item.id, null)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5">
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Add comment..."
                  value={comments[item.id] ?? item.comment ?? ""}
                  onChange={(e) => setComments((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  onBlur={() => handleResponse(item.id, item.response)}
                  className="input text-xs py-1.5"
                />
              </div>
            </div>
          </div>
        )) : (
          <div className="p-8 text-center text-sm text-gray-400">No checklist items assigned to this inspection</div>
        )}
      </Card>

      <Button variant="secondary" onClick={() => router.back()}>Done</Button>
    </div>
  );
}
