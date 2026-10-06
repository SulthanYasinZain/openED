"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type LogChange = { field: string; previous: string; next: string };

export type LogRow = {
  id: number;
  action: string;
  title: string;
  description: string;
  actorName: string;
  actorEmail: string;
  date: string;
  time: string;
  tables: string;
  entityId: number | null;
  loggedAt: string;
  loggedDay: string;
  changes: LogChange[];
};

function ActionBadge({ action }: { action: string }) {
  if (action === "INVITE") {
    return null;
  }
  if (action === "DELETE") {
    return <Badge variant="destructive">{action}</Badge>;
  }
  return <Badge variant="secondary">{action}</Badge>;
}

export default function LogsFeed({
  logs,
  expanded,
  onExpandedChange,
}: {
  logs: LogRow[];
  expanded: string[];
  onExpandedChange: (value: string[]) => void;
}) {
  if (logs.length === 0) {
    return (
      <Empty className="rounded-xl border border-border bg-white">
        <EmptyHeader>
          <EmptyTitle>No activity found</EmptyTitle>
          <EmptyDescription>No activity matches your filters.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Accordion
      multiple
      value={expanded}
      onValueChange={(value) => onExpandedChange(value as string[])}
      className="flex flex-col gap-3"
    >
      {logs.map((log) => (
        <AccordionItem
          key={log.id}
          value={String(log.id)}
          className="rounded-xl border border-border bg-white px-4"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col gap-2 text-left">
              <h2 className="flex items-center gap-2 font-medium text-sm">
                {log.title}
                <ActionBadge action={log.action} />
              </h2>
              <p className="font-normal text-muted-foreground text-[13px]">
                {log.description}
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-normal text-muted-foreground text-xs">
                <span>
                  ↳ Created By <strong>{log.actorName}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>{log.actorEmail}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {log.date}, {log.time}
                </span>
              </div>
              <div className="font-normal text-xs">Tables: {log.tables}</div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3">
              <Separator />
              {log.changes.length > 0 && (
                <>
                  <div className="font-semibold text-xs uppercase tracking-wider">
                    Change log
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-semibold text-stone-900">
                            Field
                          </TableHead>
                          <TableHead className="font-semibold text-stone-900">
                            Previous value
                          </TableHead>
                          <TableHead className="font-semibold text-stone-900">
                            New value
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {log.changes.map((change) => (
                          <TableRow
                            key={change.field}
                            className="hover:bg-transparent"
                          >
                            <TableCell className="font-medium">
                              {change.field}
                            </TableCell>
                            <TableCell className="bg-red-50 text-red-800/60">
                              {change.previous}
                            </TableCell>
                            <TableCell className="bg-green-50 text-green-800">
                              {change.next}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
              <div className="font-semibold text-xs uppercase tracking-wider">
                Details
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableBody>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="w-40 font-medium">Table</TableCell>
                      <TableCell>{log.tables}</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="font-medium">Entity ID</TableCell>
                      <TableCell>
                        {log.entityId === null ? "—" : `#${log.entityId}`}
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="font-medium">Actor</TableCell>
                      <TableCell>
                        {log.actorName} ({log.actorEmail})
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="font-medium">Logged at</TableCell>
                      <TableCell>{log.loggedAt}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
