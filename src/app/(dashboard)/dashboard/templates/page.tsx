"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useCreateTemplate, useTemplates } from "@/hooks/useInspections";

export default function TemplatesPage() {
  const { hasRole } = useAuth();
  const canCreate = hasRole("org_admin", "manager");
  const { data: templates, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([""]);

  const updateItem = (index: number, value: string) => {
    setItems((current) => current.map((item, i) => i === index ? value : item));
  };

  const addItem = () => setItems((current) => [...current, ""]);
  const removeItem = (index: number) => setItems((current) => current.filter((_, i) => i !== index));

  const handleCreate = async () => {
    try {
      await createTemplate.mutateAsync({
        name,
        description,
        items: items
          .map((item, index) => ({ description: item.trim(), sort_order: index + 1 }))
          .filter((item) => item.description),
      });
      setName("");
      setDescription("");
      setItems([""]);
      success("Template created");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not create template");
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Checklist Templates</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage reusable compliance checklist structures for your organisation.</p>
      </div>

      {canCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create Template</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} label="Template name" placeholder="Environmental compliance site inspection" />
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional template summary" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Checklist items</p>
                <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4" /> Add item
                </Button>
              </div>
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={item} onChange={(e) => updateItem(index, e.target.value)} placeholder={`Item ${index + 1}`} />
                  {items.length > 1 && (
                    <Button type="button" variant="danger" size="sm" onClick={() => removeItem(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button onClick={handleCreate} loading={createTemplate.isPending}>Save template</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {templates?.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            {template.description && <p className="text-sm text-gray-600 mb-4">{template.description}</p>}
            <div className="space-y-2">
              {template.items.map((item) => (
                <div key={item.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  {item.sort_order}. {item.description}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
