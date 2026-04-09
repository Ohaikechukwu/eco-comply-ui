"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Camera, DownloadCloud, MapPin, MessageSquare, Share2, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useCollaborationAccess, useRevokeInspectionAccess, useShareInspection } from "@/hooks/useCollaboration";
import { useCollaborationRoom } from "@/hooks/useCollaborationRoom";
import {
  useAddChecklistItem,
  useAddComment,
  useCreateAction,
  useCreateReview,
  useDeleteInspection,
  useInspection,
  useOfflineMerge,
  useSyncPull,
  useUpdateAction,
  useUpdateInspection,
  useUpdateInspectionStatus,
  useUpdateReview,
} from "@/hooks/useInspections";
import { useDeleteMedia, useMedia, useUploadMedia } from "@/hooks/useMedia";
import { useUsers } from "@/hooks/useUsers";
import { formatDate, formatDateTime } from "@/lib/utils";

const statusOptions = ["draft", "in_progress", "submitted", "under_review", "pending_actions", "completed", "finalized"];

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, hasRole } = useAuth();
  const { success, error } = useToast();

  const { data: inspection, isLoading } = useInspection(id);
  const { data: users } = useUsers();
  const { data: mediaData } = useMedia(id);
  const { data: accessList } = useCollaborationAccess(id);
  const { events, connectionState, sendEvent } = useCollaborationRoom(id);

  const updateInspection = useUpdateInspection();
  const updateStatus = useUpdateInspectionStatus();
  const addChecklistItem = useAddChecklistItem();
  const createAction = useCreateAction();
  const updateAction = useUpdateAction();
  const addComment = useAddComment();
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const shareInspection = useShareInspection();
  const revokeAccess = useRevokeInspectionAccess();
  const offlineMerge = useOfflineMerge();
  const deleteInspection = useDeleteInspection();
  const [syncSince, setSyncSince] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().slice(0, 16);
  });
  const { data: syncData, refetch: refetchSync, isFetching: syncLoading } = useSyncPull(
    new Date(syncSince).toISOString(),
    false
  );

  const [projectName, setProjectName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("draft");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewDueDate, setReviewDueDate] = useState("");
  const [reviewAssignedTo, setReviewAssignedTo] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [actionDueDate, setActionDueDate] = useState("");
  const [actionAssignee, setActionAssignee] = useState("");
  const [shareUserId, setShareUserId] = useState("");
  const [sharePermission, setSharePermission] = useState("viewer");
  const [offlineResponseComment, setOfflineResponseComment] = useState("");
  const [roomMessage, setRoomMessage] = useState("");
  const [mergePayload, setMergePayload] = useState({
    project_name: "",
    location_name: "",
    notes: "",
    status: "draft",
  });

  useEffect(() => {
    if (!inspection) return;
    setProjectName(inspection.project_name);
    setLocationName(inspection.location_name ?? "");
    setNotes(inspection.notes ?? "");
    setStatus(inspection.status);
    setMergePayload({
      project_name: inspection.project_name,
      location_name: inspection.location_name ?? "",
      notes: inspection.notes ?? "",
      status: inspection.status,
    });
  }, [inspection]);

  if (isLoading) return <PageSpinner />;
  if (!inspection) return <p className="text-sm text-gray-500">Inspection not found</p>;

  const conformance = inspection.checklist_items?.filter((i) => i.response === true).length ?? 0;
  const nonConformance = inspection.checklist_items?.filter((i) => i.response === false).length ?? 0;
  const unanswered = inspection.checklist_items?.filter((i) => i.response == null).length ?? 0;

  const canDelete = hasRole("org_admin", "enumerator");
  const canReview = hasRole("org_admin", "supervisor", "manager");
  const canCreateAction = hasRole("org_admin", "supervisor", "manager");

  const handleSaveInspection = async () => {
    try {
      await updateInspection.mutateAsync({
        id,
        data: {
          project_name: projectName,
          location_name: locationName,
          notes,
        },
      });
      success("Inspection updated");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not update inspection");
    }
  };

  const handleStatusChange = async () => {
    try {
      await updateStatus.mutateAsync({ id, status });
      success("Status updated");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not update status");
    }
  };

  const handleAddChecklistItem = async () => {
    try {
      await addChecklistItem.mutateAsync({
        inspectionId: id,
        description: newChecklistItem,
        sort_order: (inspection.checklist_items?.length ?? 0) + 1,
      });
      setNewChecklistItem("");
      success("Checklist item added");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not add checklist item");
    }
  };

  const handleCreateAction = async () => {
    try {
      await createAction.mutateAsync({
        inspectionId: id,
        description: actionDescription,
        assignee_id: actionAssignee,
        due_date: new Date(actionDueDate).toISOString(),
      });
      setActionDescription("");
      setActionDueDate("");
      success("Action created");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not create action");
    }
  };

  const handleAddComment = async () => {
    try {
      await addComment.mutateAsync({ inspectionId: id, body: commentBody });
      setCommentBody("");
      success("Comment added");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not add comment");
    }
  };

  const handleCreateReview = async () => {
    try {
      await createReview.mutateAsync({
        inspectionId: id,
        assigned_to_id: reviewAssignedTo,
        comment: reviewComment,
        due_date: new Date(reviewDueDate).toISOString(),
      });
      setReviewComment("");
      setReviewDueDate("");
      success("Review created");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not create review");
    }
  };

  const handleUploadMedia = async (file: File | undefined) => {
    if (!file) return;
    try {
      await uploadMedia.mutateAsync({
        inspection_id: id,
        file,
        captured_via: "gallery",
        gps_source: "none",
        captured_at: new Date().toISOString(),
      });
      success("Media uploaded");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not upload media");
    }
  };

  const handleShare = async () => {
    try {
      await shareInspection.mutateAsync({
        inspectionId: id,
        user_id: shareUserId,
        permission: sharePermission as "viewer" | "editor" | "reviewer",
      });
      setShareUserId("");
      success("Inspection shared");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not share inspection");
    }
  };

  const handleSendRoomMessage = () => {
    if (!roomMessage.trim()) return;
    const sent = sendEvent({
      type: "message",
      payload: {
        text: roomMessage.trim(),
        inspection_id: id,
        project_name: inspection.project_name,
      },
      user_id: user?.id ?? "unknown",
      org_id: undefined,
      created_at: new Date().toISOString(),
    });
    if (sent) {
      setRoomMessage("");
    } else {
      error("Realtime room is not connected yet");
    }
  };

  const handleOfflineMerge = async () => {
    try {
      const result = await offlineMerge.mutateAsync({
        id,
        data: {
          client_updated_at: inspection.updated_at,
          project_name: mergePayload.project_name,
          location_name: mergePayload.location_name,
          notes: mergePayload.notes,
          status: mergePayload.status,
        },
      });

      if (result.conflict) {
        error(`Conflict detected: ${result.conflict.message}`);
        return;
      }

      success("Offline payload merged");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not merge offline payload");
    }
  };

  const handleDeleteInspection = async () => {
    try {
      await deleteInspection.mutateAsync(id);
      success("Inspection deleted");
      router.push("/dashboard/inspections");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not delete inspection");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{inspection.project_name}</h1>
            <StatusBadge status={inspection.status} />
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 flex-wrap">
            {inspection.location_name && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{inspection.location_name}</span>}
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(inspection.date)}</span>
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{inspection.inspector_name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push(`/dashboard/reports?inspection_id=${id}`)}>
            <DownloadCloud className="w-4 h-4" /> Reports
          </Button>
          {canDelete && <Button variant="danger" onClick={handleDeleteInspection}>Delete</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Conformance", value: conformance, tone: "bg-green-50 text-green-700" },
          { label: "Non-conformance", value: nonConformance, tone: "bg-red-50 text-red-700" },
          { label: "Unanswered", value: unanswered, tone: "bg-gray-50 text-gray-700" },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl p-4 ${item.tone}`}>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs font-medium mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inspection Details</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input label="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            <Input label="Location" value={locationName} onChange={(e) => setLocationName(e.target.value)} />
            <div>
              <label className="label">Notes</label>
              <textarea className="input min-h-28" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button onClick={handleSaveInspection} loading={updateInspection.isPending}>Save details</Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Sync</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Select
              label="Workflow status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions.map((item) => ({ value: item, label: item.replace(/_/g, " ") }))}
            />
            <Button onClick={handleStatusChange} loading={updateStatus.isPending}>Update status</Button>

            <div className="rounded-xl border border-dashed border-gray-200 p-4 space-y-3">
              <p className="text-sm font-medium text-gray-900">Offline merge tool</p>
              <Input label="Project name" value={mergePayload.project_name} onChange={(e) => setMergePayload((s) => ({ ...s, project_name: e.target.value }))} />
              <Input label="Location" value={mergePayload.location_name} onChange={(e) => setMergePayload((s) => ({ ...s, location_name: e.target.value }))} />
              <div>
                <label className="label">Notes</label>
                <textarea className="input min-h-20" value={mergePayload.notes} onChange={(e) => setMergePayload((s) => ({ ...s, notes: e.target.value }))} />
              </div>
              <Button variant="secondary" onClick={handleOfflineMerge} loading={offlineMerge.isPending}>Submit offline payload</Button>
              {offlineMerge.data?.conflict && (
                <p className="text-xs text-red-600">
                  Server version is newer than your draft. Review the live inspection before retrying.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-dashed border-gray-200 p-4 space-y-3">
              <p className="text-sm font-medium text-gray-900">Sync pull</p>
              <Input type="datetime-local" value={syncSince} onChange={(e) => setSyncSince(e.target.value)} />
              <Button variant="secondary" onClick={() => refetchSync()} loading={syncLoading}>Fetch sync payload</Button>
              {syncData && (
                <div className="text-xs text-gray-600 space-y-1">
                  <p>{syncData.inspections.length} inspections returned from sync endpoint.</p>
                  <p>{syncData.deleted_ids.length} deleted IDs returned.</p>
                  <p>Server time: {formatDateTime(syncData.server_time)}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
            <Button variant="secondary" size="sm" onClick={() => router.push(`/dashboard/checklists/${id}/fill`)}>Fill checklist</Button>
          </CardHeader>
          <div className="space-y-2">
            {inspection.checklist_items?.map((item) => (
              <div key={item.id} className="rounded-lg border border-gray-100 p-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.description}</p>
                  {item.comment && <p className="text-xs text-gray-500 mt-1">{item.comment}</p>}
                </div>
                <StatusBadge status={item.response === true ? "completed" : item.response === false ? "pending_actions" : "draft"} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} placeholder="Add custom checklist item" />
            <Button onClick={handleAddChecklistItem} loading={addChecklistItem.isPending}>Add</Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agreed Actions</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {inspection.agreed_actions?.map((action) => (
              <div key={action.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{action.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Due {formatDate(action.due_date)}</p>
                    {action.evidence_url && <a className="text-xs text-brand-700 mt-2 inline-block" href={action.evidence_url} target="_blank" rel="noreferrer">View evidence</a>}
                  </div>
                  <StatusBadge status={action.status} />
                </div>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Button variant="secondary" size="sm" onClick={() => updateAction.mutate({ inspectionId: id, actionId: action.id, status: "in_progress" })}>
                    Mark in progress
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => updateAction.mutate({ inspectionId: id, actionId: action.id, status: "resolved" })}>
                    Mark resolved
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {canCreateAction && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input value={actionDescription} onChange={(e) => setActionDescription(e.target.value)} placeholder="Action description" />
              <Select
                value={actionAssignee}
                onChange={(e) => setActionAssignee(e.target.value)}
                options={[
                  { value: "", label: "Assign to user" },
                  ...(users?.users ?? []).map((item) => ({ value: item.id, label: `${item.name} (${item.role})` })),
                ]}
              />
              <Input type="datetime-local" value={actionDueDate} onChange={(e) => setActionDueDate(e.target.value)} />
              <Button onClick={handleCreateAction} loading={createAction.isPending}>Create action</Button>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reviews & Comments</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {inspection.reviews?.map((review) => (
              <div key={review.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{review.stage.replace(/_/g, " ")}</p>
                    <p className="text-xs text-gray-500 mt-1">Due {formatDate(review.due_date)}</p>
                  </div>
                  <StatusBadge status={review.status} />
                </div>
                <p className="text-sm text-gray-700 mt-3">{review.comment}</p>
                {canReview && (
                  <div className="mt-3 space-y-2">
                    <Input value={offlineResponseComment} onChange={(e) => setOfflineResponseComment(e.target.value)} placeholder="Optional response comment" />
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="secondary" onClick={() => updateReview.mutate({ inspectionId: id, reviewId: review.id, status: "addressed", response_comment: offlineResponseComment })}>
                        Address
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => updateReview.mutate({ inspectionId: id, reviewId: review.id, status: "approved", response_comment: offlineResponseComment })}>
                        Approve
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => updateReview.mutate({ inspectionId: id, reviewId: review.id, status: "rejected", response_comment: offlineResponseComment })}>
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {inspection.comments?.map((comment) => (
              <div key={comment.id} className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <MessageSquare className="w-3 h-3" />
                  <span>{formatDateTime(comment.created_at)}</span>
                </div>
                <p className="text-sm text-gray-800 mt-2">{comment.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {canReview && (
              <>
                <div>
                  <label className="label">Create review</label>
                  <textarea className="input min-h-24" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Supervisor or manager review comment" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select
                    value={reviewAssignedTo}
                    onChange={(e) => setReviewAssignedTo(e.target.value)}
                    options={[
                      { value: "", label: "Assign review to user" },
                      ...(users?.users ?? []).map((item) => ({ value: item.id, label: `${item.name} (${item.role})` })),
                    ]}
                  />
                  <Input type="datetime-local" value={reviewDueDate} onChange={(e) => setReviewDueDate(e.target.value)} />
                </div>
                <Button onClick={handleCreateReview} loading={createReview.isPending}>Create review</Button>
              </>
            )}

            <div>
              <label className="label">Add comment</label>
              <textarea className="input min-h-24" value={commentBody} onChange={(e) => setCommentBody(e.target.value)} placeholder="Add project comment" />
            </div>
            <Button variant="secondary" onClick={handleAddComment} loading={addComment.isPending}>Post comment</Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media & Collaboration</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-gray-200 p-4">
              <label className="label">Upload media</label>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Select file</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadMedia(e.target.files?.[0])} />
                </label>
                <p className="text-xs text-gray-500">Uploads go to the backend media service with timestamp metadata.</p>
              </div>
            </div>

            <div className="space-y-3">
              {mediaData?.media.map((item) => (
                <div key={item.id} className="rounded-lg border border-gray-100 p-3 flex items-center justify-between gap-3">
                  <div>
                    <a className="text-sm font-medium text-brand-700" href={item.url} target="_blank" rel="noreferrer">{item.filename}</a>
                    <p className="text-xs text-gray-500 mt-1">{item.captured_via} • {formatDateTime(item.captured_at)}</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={async () => {
                    try {
                      await deleteMedia.mutateAsync({ id: item.id });
                      success("Media deleted");
                    } catch (err: any) {
                      error(err.response?.data?.error ?? "Could not delete media");
                    }
                  }}>
                    Delete
                  </Button>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-dashed border-gray-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-900">Share inspection access</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select
                  value={shareUserId}
                  onChange={(e) => setShareUserId(e.target.value)}
                  options={[
                    { value: "", label: "Choose user" },
                    ...(users?.users ?? [])
                      .filter((item) => item.id !== user?.id)
                      .map((item) => ({ value: item.id, label: `${item.name} (${item.role})` })),
                  ]}
                />
                <Select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value)}
                  options={[
                    { value: "viewer", label: "Viewer" },
                    { value: "editor", label: "Editor" },
                    { value: "reviewer", label: "Reviewer" },
                  ]}
                />
              </div>
              <Button onClick={handleShare} loading={shareInspection.isPending}>Share access</Button>
              <div className="space-y-2">
                {accessList?.map((entry) => (
                  <div key={entry.id} className="rounded-lg bg-gray-50 px-3 py-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-900">{entry.user_id}</p>
                      <p className="text-xs text-gray-500">{entry.permission} • {entry.status}</p>
                    </div>
                    {hasRole("org_admin", "supervisor", "manager") && (
                      <Button variant="secondary" size="sm" onClick={async () => {
                        try {
                          await revokeAccess.mutateAsync({ inspectionId: id, userId: entry.user_id });
                          success("Access revoked");
                        } catch (err: any) {
                          error(err.response?.data?.error ?? "Could not revoke access");
                        }
                      }}>
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Live collaboration room</p>
                  <p className="text-xs text-gray-500">Connected to the backend websocket relay for this inspection.</p>
                </div>
                <StatusBadge
                  status={
                    connectionState === "open"
                      ? "completed"
                      : connectionState === "connecting"
                        ? "in_progress"
                        : "draft"
                  }
                />
              </div>

              <div className="rounded-lg bg-gray-50 p-3 max-h-64 overflow-y-auto space-y-2">
                {events.length ? events.map((event, index) => (
                  <div key={`${event.user_id}-${event.created_at ?? index}-${index}`} className="rounded-lg bg-white px-3 py-2 border border-gray-100">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-gray-700">{event.type.replace(/_/g, " ")}</p>
                      <p className="text-[11px] text-gray-400">{event.created_at ? formatDateTime(event.created_at) : "now"}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">User: {event.user_id}</p>
                    <p className="text-sm text-gray-800 mt-2">
                      {typeof event.payload === "string" ? event.payload : JSON.stringify(event.payload)}
                    </p>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500">No live events yet.</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input value={roomMessage} onChange={(e) => setRoomMessage(e.target.value)} placeholder="Broadcast a live note to collaborators" />
                <Button variant="secondary" onClick={handleSendRoomMessage}>Send</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
