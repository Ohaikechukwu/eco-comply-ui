"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useCreateInspection, useTemplates } from "@/hooks/useInspections";
import { Select } from "@/components/ui/Select";

const schema = z.object({
  project_name: z.string().min(2, "Project name is required"),
  location_name: z.string().optional(),
  latitude:  z.string().optional(),
  longitude: z.string().optional(),
  checklist_id: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewInspectionPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const createInspection = useCreateInspection();
  const { data: templates } = useTemplates();
  const [gpsLoading, setGpsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const captureGPS = () => {
    if (!navigator.geolocation) { error("Geolocation not supported"); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude",  String(pos.coords.latitude));
        setValue("longitude", String(pos.coords.longitude));
        setGpsLoading(false);
      },
      () => { setGpsLoading(false); error("Could not get GPS location"); }
    );
  };

  const onSubmit = async (data: FormData) => {
    try {
      const inspection = await createInspection.mutateAsync({
        project_name: data.project_name,
        location_name: data.location_name,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        checklist_id: data.checklist_id || undefined,
      });
      success("Inspection created");
      router.push(`/dashboard/inspections/${inspection.id}`);
    } catch (err: any) {
      error(err.response?.data?.error ?? "Failed to create inspection");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">New inspection</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the details to start a new inspection</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input {...register("project_name")} id="project_name" label="Project name *"
            placeholder="e.g. Ogun Road Rehabilitation Phase 2" error={errors.project_name?.message} />
          <Input {...register("location_name")} id="location_name" label="Location"
            placeholder="e.g. Km 12, Sagamu–Ore Expressway" />
          <Select
            {...register("checklist_id")}
            label="Checklist template"
            options={[
              { value: "", label: "No template" },
              ...((templates ?? []).map((template) => ({ value: template.id, label: template.name }))),
            ]}
          />
          <div>
            <label className="label">GPS coordinates</label>
            <div className="flex gap-3">
              <Input {...register("latitude")}  placeholder="Latitude"  />
              <Input {...register("longitude")} placeholder="Longitude" />
              <Button type="button" variant="secondary" onClick={captureGPS} loading={gpsLoading} className="shrink-0">
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={createInspection.isPending}>Create inspection</Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
