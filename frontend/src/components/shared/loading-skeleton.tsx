"use client";

import { motion } from "framer-motion";

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`shimmer rounded-lg ${className ?? ""}`} />
  );
}

export function CardSkeleton() {
  return (
    <motion.div
      className="rounded-2xl bg-card border border-border/50 p-4 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Shimmer className="h-3 w-20 mb-4" />
      <Shimmer className="h-8 w-16 mb-2" />
      <Shimmer className="h-2 w-24" />
    </motion.div>
  );
}

export function ChartSkeleton() {
  return (
    <motion.div
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="p-5 pb-0">
        <Shimmer className="h-4 w-32 mb-1" />
        <Shimmer className="h-3 w-48" />
      </div>
      <div className="p-5">
        <div className="relative h-64 overflow-hidden rounded-xl bg-muted/20">
          <div className="absolute inset-0 flex items-end gap-1.5 p-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 shimmer rounded-t-md"
                style={{ height: `${30 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-xl bg-card border border-border/50 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="flex items-center gap-3">
            <Shimmer className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-3 w-2/3" />
              <Shimmer className="h-2 w-1/3" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
