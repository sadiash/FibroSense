"use client";

import { SymptomLogForm } from "@/components/symptom-logger/symptom-log-form";
import { RecentEntries } from "@/components/symptom-logger/recent-entries";
import { useSymptomLogs, useCreateSymptomLog } from "@/lib/hooks/use-symptom-logs";
import { ListSkeleton } from "@/components/shared/loading-skeleton";

export default function LogPage() {
  const { data: logs, isLoading } = useSymptomLogs();
  const createLog = useCreateSymptomLog();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SymptomLogForm
        onSubmit={(data) => createLog.mutate(data)}
        isSubmitting={createLog.isPending}
      />
      {isLoading ? (
        <ListSkeleton count={3} />
      ) : (
        <RecentEntries entries={logs ?? []} />
      )}
    </div>
  );
}
