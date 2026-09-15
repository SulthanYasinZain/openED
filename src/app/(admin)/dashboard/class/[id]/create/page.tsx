"use client";

import { RiErrorWarningLine } from "@create-ui/assets/icons";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { createMeetingAction } from "@/app/actions/meeting";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Dropzone } from "@/components/ui/dropzone";
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
import {
  InlineAlert,
  InlineAlertContent,
  InlineAlertDescription,
  InlineAlertHeading,
  InlineAlertIcon,
  InlineAlertTitle,
} from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";
import { Label, LabelDescription, LabelMain } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useUpload } from "@/context/uploadContext";
import summarizePdf from "@/lib/summarize-service";
import uploadToR2 from "@/lib/upload-to-r2";

const COMPRESSION_OPTIONS = [
  { value: "off", title: "Off", hint: "Upload as-is" },
  { value: "lossless", title: "Lossless", hint: "Smaller, same quality" },
  { value: "balanced", title: "Balanced", hint: "Size / quality mix" },
  { value: "max", title: "Max", hint: "Smallest file size" },
] as const;

const PHASE_LABEL: Record<string, string> = {
  compressing: "Compressing PDF...",
  uploading: "Uploading file...",
  summarizing: "Generating class description...",
  saving: "Saving meeting...",
};

type InvalidField = "topic" | "date" | "file" | null;

export default function CreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: classCode } = use(params);
  const router = useRouter();
  const { uploadFile, setPhase, succeed, fail, status, progress, error } =
    useUpload();

  const [description, setDescription] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [invalidField, setInvalidField] = useState<InvalidField>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const topic = data.get("topic");
    const date = data.get("date");
    const compressionValue = data.get("compression");

    if (typeof topic !== "string" || !topic.trim()) {
      setInvalidField("topic");
      return;
    }

    if (typeof date !== "string" || !date) {
      setInvalidField("date");
      return;
    }

    if (!pdfFile || pdfFile.size === 0) {
      setInvalidField("file");
      return;
    }

    const compression =
      compressionValue === "off" ||
      compressionValue === "lossless" ||
      compressionValue === "balanced" ||
      compressionValue === "max"
        ? compressionValue
        : "balanced";

    setInvalidField(null);
    setSubmitError(null);

    const blob = await uploadFile(pdfFile, { compression });

    if (!blob) return;

    try {
      setPhase("uploading");
      const fileKey = await uploadToR2(blob, pdfFile.name);

      let finalDescription = description;

      if (aiEnabled) {
        setPhase("summarizing");

        const summary = await summarizePdf(blob, pdfFile.name).catch(
          () => null,
        );

        if (summary) {
          finalDescription = summary;
          setDescription(summary);
        }
      }

      setPhase("saving");
      const result = await createMeetingAction({
        classCode,
        topic: topic.trim(),
        description: finalDescription || null,
        scheduledAt: date,
        fileKey,
      });

      if (result.error) {
        fail(result.error);
        setSubmitError(result.error);
        return;
      }

      succeed();
      router.push(`/dashboard/class/${classCode}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create meeting";
      fail(message);
      setSubmitError(message);
    }
  }

  const busy = status !== "idle" && status !== "done" && status !== "error";
  const serverError = error || submitError;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-heading-h3 text-strongest">Create meeting</h1>
      <p className="mt-1 text-ui-caption-md text-placeholder">
        Upload the meeting material and set when it takes place.
      </p>

      <form
        onSubmit={handleSubmit}
      >
        <FieldGroup className="p-6">
          <Field
            size="md"
            orientation="responsive"
            invalid={invalidField === "topic"}
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

          <Field size="md" orientation="responsive">
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
              <CheckboxGroup size="md">
                <Checkbox
                  id="summarize"
                  name="summarize"
                  checked={aiEnabled}
                  onCheckedChange={(checked) => {
                    const next = checked === true;
                    setAiEnabled(next);
                    if (next) setDescription("");
                  }}
                />
                <FieldContent>
                  <LabelMain>
                    <Label htmlFor="summarize">
                      Use AI to generate class description
                    </Label>
                    <LabelDescription>
                      Clears the text above; the summary is generated from the
                      PDF after upload.
                    </LabelDescription>
                  </LabelMain>
                </FieldContent>
              </CheckboxGroup>
            </div>
          </Field>

          <FieldSeparator />

          <Field
            size="md"
            orientation="responsive"
            invalid={invalidField === "date"}
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
            size="md"
            orientation="responsive"
            invalid={invalidField === "file"}
          >
            <FieldContent className="sm:basis-[220px] sm:grow-0">
              <FieldTitle id="material-label">Material</FieldTitle>
              <FieldDescription>PDF file students will read.</FieldDescription>
            </FieldContent>
            <div className="min-w-0 flex-1">
              <Dropzone
                size="md"
                accept="application/pdf"
                multiple={false}
                aria-labelledby="material-label"
                title={pdfFile ? pdfFile.name : undefined}
                description={pdfFile ? "PDF ready to upload." : undefined}
                error={invalidField === "file"}
                errorMessage="PDF file is required."
                onFilesAccepted={(files) => {
                  setPdfFile(files[0] ?? null);
                  setInvalidField(null);
                }}
              />
            </div>
          </Field>

          <FieldSeparator />

          <Field size="md" orientation="responsive">
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
                  className="cursor-pointer rounded-xl border border-light px-3 py-2.5 has-checked:border-primary-base has-checked:bg-primary-weakest"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="compression"
                      value={option.value}
                      defaultChecked={option.value === "balanced"}
                      className="h-4 w-4 accent-primary-base"
                    />
                    <span className="text-body-md font-medium">
                      {option.title}
                    </span>
                  </span>
                  <span className="mt-0.5 block pl-6 text-body-sm text-placeholder">
                    {option.hint}
                  </span>
                </label>
              ))}
            </div>
          </Field>

          {busy && (
            <Field size="md">
              <FieldLabel>
                {PHASE_LABEL[status] ?? "Working..."}
                {status === "compressing" ? ` ${progress}%` : ""}
              </FieldLabel>
              <Progress
                variant="primary"
                appearance="solid"
                size="sm"
                value={progress}
              />
            </Field>
          )}

          {serverError && (
            <InlineAlert variant="danger" appearance="soft">
              <InlineAlertIcon>
                <RiErrorWarningLine />
              </InlineAlertIcon>
              <InlineAlertContent>
                <InlineAlertHeading>
                  <InlineAlertTitle>Something went wrong</InlineAlertTitle>
                  <InlineAlertDescription>{serverError}</InlineAlertDescription>
                </InlineAlertHeading>
              </InlineAlertContent>
            </InlineAlert>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              appearance="solid"
              size="lg"
              loading={busy}
            >
              Create meeting
            </Button>
          </div>
        </FieldGroup>
      </form>
    </main>
  );
}
