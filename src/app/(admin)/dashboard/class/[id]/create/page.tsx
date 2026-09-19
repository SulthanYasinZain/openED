"use client";

import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import {
  createMeetingAction,
  findFileByHashAction,
} from "@/app/actions/meeting";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import compressPdf from "@/lib/compress-pdf";
import generateFileHash from "@/lib/hash-file";
import summarizePdf from "@/lib/summarize-service";
import uploadToR2 from "@/lib/upload-to-r2";

const COMPRESSION_OPTIONS = [
  { value: "off", title: "Off", hint: "Upload as-is" },
  { value: "lossless", title: "Lossless", hint: "Smaller, same quality" },
  { value: "balanced", title: "Balanced", hint: "Size / quality mix" },
  { value: "max", title: "Max", hint: "Smallest file size" },
] as const;

type InvalidField = "topic" | "date" | "file" | null;

export default function CreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: classCode } = use(params);
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [invalidField, setInvalidField] = useState<InvalidField>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const file = data.get("pdf");
    const topic = data.get("topic");
    const date = data.get("date");
    const compressionValue = data.get("compression");

    const compression =
      compressionValue === "off" ||
      compressionValue === "lossless" ||
      compressionValue === "balanced" ||
      compressionValue === "max"
        ? compressionValue
        : "balanced";

    if (typeof topic !== "string" || !topic.trim()) {
      setInvalidField("topic");
      return;
    }

    if (typeof date !== "string" || !date) {
      setInvalidField("date");
      return;
    }

    if (!(file instanceof File) || file.size === 0) {
      setInvalidField("file");
      return;
    }

    setInvalidField(null);
    setIsLoading(true);
    const contentHash = await generateFileHash(file);
    const fileHash = `${compression}:${contentHash}`;

    try {
      const { fileUrl: existingUrl } = await findFileByHashAction(fileHash);

      let blob: Blob;
      let fileUrl: string;

      if (existingUrl) {
        blob = file;
        fileUrl = existingUrl;
        toast.loading("Duplicate found, reusing uploaded file", {
          id: toastId,
        });
      } else if (compression === "off") {
        blob = file;
        toast.loading("Uploading file...", { id: toastId });
        fileUrl = await uploadToR2(blob, file.name);
      } else {
        toast.loading("Compressing PDF...", { id: toastId });
        blob = await compressPdf(file, { preset: compression }).catch(
          () => file,
        );

        toast.loading("Uploading file...", { id: toastId });
        fileUrl = await uploadToR2(blob, file.name);
      }

      let finalDescription = description;

      if (aiEnabled) {
        toast.loading("Generating class description...", { id: toastId });

        const summary = await summarizePdf(blob, file.name).catch(() => null);

        if (summary) {
          finalDescription = summary;
          setDescription(summary);
        }
      }

      toast.loading("Saving meeting...", { id: toastId });
      const result = await createMeetingAction({
        classCode,
        topic: topic.trim(),
        description: finalDescription || null,
        scheduledAt: date,
        fileUrl,
        fileHash,
      });

      if (result.error) {
        toast.error(result.error, { id: toastId });
        setIsLoading(false);
        return;
      }

      toast.success("Meeting created", { id: toastId });
      router.push(`/dashboard/class/${classCode}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create meeting";
      toast.error(message, { id: toastId });
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link href={`/dashboard/class/${classCode}`} />}
              >
                Class {classCode}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create meeting</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          Back
        </Button>
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Create meeting
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Upload the meeting material and set when it takes place.
      </p>

      <form onSubmit={handleSubmit}>
        <FieldGroup className="mt-8">
          <Field
            orientation="horizontal"
            data-invalid={invalidField === "topic" || undefined}
          >
            <FieldContent className="sm:basis-[220px] sm:grow-0">
              <FieldLabel htmlFor="topic">Meeting topic</FieldLabel>
              <FieldDescription>
                Give the meeting a clear title.
              </FieldDescription>
            </FieldContent>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Input
                id="topic"
                name="topic"
                placeholder="e.g. Introduction to fractions"
                aria-invalid={invalidField === "topic" || undefined}
                onChange={() => setInvalidField(null)}
              />
              {invalidField === "topic" && (
                <FieldError>Topic name must be filled.</FieldError>
              )}
            </div>
          </Field>

          <FieldSeparator />

          <Field orientation="horizontal">
            <FieldContent className="sm:basis-[220px] sm:grow-0">
              <FieldLabel htmlFor="description">Class description</FieldLabel>
              <FieldDescription>
                Shown to students, or generated by AI from the PDF.
              </FieldDescription>
            </FieldContent>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Textarea
                id="description"
                placeholder="Write a short description..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={aiEnabled}
                rows={3}
              />
              <Label
                htmlFor="summarize"
                className="flex cursor-pointer items-center gap-3 font-normal"
              >
                <input
                  id="summarize"
                  type="checkbox"
                  name="summarize"
                  checked={aiEnabled}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setAiEnabled(checked);
                    if (checked) setDescription("");
                  }}
                  className="accent-primary h-4 w-4"
                />
                <span className="text-sm">
                  Use AI to generate class description
                </span>
              </Label>
            </div>
          </Field>

          <FieldSeparator />

          <Field
            orientation="horizontal"
            data-invalid={invalidField === "date" || undefined}
          >
            <FieldContent className="sm:basis-[220px] sm:grow-0">
              <FieldLabel htmlFor="date">Schedule</FieldLabel>
              <FieldDescription>Pick the meeting date.</FieldDescription>
            </FieldContent>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Input
                id="date"
                name="date"
                type="date"
                aria-invalid={invalidField === "date" || undefined}
                onChange={() => setInvalidField(null)}
              />
              {invalidField === "date" && (
                <FieldError>Date must be filled.</FieldError>
              )}
            </div>
          </Field>

          <FieldSeparator />

          <Field
            orientation="horizontal"
            data-invalid={invalidField === "file" || undefined}
          >
            <FieldContent className="sm:basis-[220px] sm:grow-0">
              <FieldTitle>Material</FieldTitle>
              <FieldDescription>PDF file students will read.</FieldDescription>
            </FieldContent>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Label
                htmlFor="pdf"
                className="border-border flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 font-normal"
              >
                <span className="text-muted-foreground truncate text-sm">
                  {fileName ?? "Choose a PDF file..."}
                </span>
                <span className="bg-primary text-white shrink-0 rounded-md px-3 py-1.5 text-sm font-medium">
                  Browse
                </span>
              </Label>
              <Input
                id="pdf"
                type="file"
                name="pdf"
                accept="application/pdf"
                className="hidden"
                onChange={(event) => {
                  setFileName(event.target.files?.[0]?.name ?? null);
                  setInvalidField(null);
                }}
              />
              {invalidField === "file" && (
                <FieldError>PDF file is required.</FieldError>
              )}
            </div>
          </Field>

          <FieldSeparator />

          <Field orientation="horizontal">
            <FieldContent className="sm:basis-[220px] sm:grow-0">
              <FieldTitle>Compression</FieldTitle>
              <FieldDescription>
                Pick one option to shrink the PDF.
              </FieldDescription>
            </FieldContent>
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-3">
              {COMPRESSION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="border-border has-checked:border-primary cursor-pointer rounded-lg border px-3 py-2.5"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="compression"
                      value={option.value}
                      defaultChecked={option.value === "balanced"}
                      className="accent-primary h-4 w-4"
                    />
                    <span className="text-sm font-medium">{option.title}</span>
                  </span>
                  <span className="text-muted-foreground mt-0.5 block pl-6 text-sm">
                    {option.hint}
                  </span>
                </label>
              ))}
            </div>
          </Field>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Working..." : "Create meeting"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </main>
  );
}
