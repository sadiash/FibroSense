"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <motion.div
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        {icon && (
          <motion.div
            className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          >
            {icon}
          </motion.div>
        )}
        <motion.p
          className="text-sm font-medium text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.p>
        {description && (
          <motion.p
            className="mt-1 text-xs text-muted-foreground max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {description}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
