"use client";

import { ShieldWarningIcon } from "@phosphor-icons/react";

interface MedicalDisclaimerProps {
  variant?: "footer";
}

export function MedicalDisclaimer(_props: MedicalDisclaimerProps) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border/30 bg-muted/10 px-3 py-2.5 mt-6">
      <ShieldWarningIcon className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" weight="duotone" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-violet-600 dark:text-violet-300 font-medium">
          Not a medical device
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
          FibroSense helps you track patterns but does not provide medical advice. Always consult your healthcare provider.
        </p>
      </div>
    </div>
  );
}
