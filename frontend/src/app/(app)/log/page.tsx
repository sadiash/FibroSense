"use client";

import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { SymptomLogForm } from "@/components/symptom-logger/symptom-log-form";
import { RecentEntries } from "@/components/symptom-logger/recent-entries";
import {
  useSymptomLogs,
  useCreateSymptomLog,
} from "@/lib/hooks/use-symptom-logs";
import { ListSkeleton } from "@/components/shared/loading-skeleton";

export default function LogPage() {
  const { data: logs, isLoading } = useSymptomLogs();
  const createLog = useCreateSymptomLog();

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Page header */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-bold">Log Symptoms</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Record how you&apos;re feeling today
        </p>
      </motion.div>

      {/* Two-column layout: form + recent entries */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <motion.div variants={fadeUp}>
          <SymptomLogForm
            onSubmit={(data) => createLog.mutate(data)}
            isSubmitting={createLog.isPending}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          {isLoading ? (
            <ListSkeleton count={3} />
          ) : (
            <RecentEntries entries={logs ?? []} />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
