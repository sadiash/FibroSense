"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppleLogoIcon } from "@phosphor-icons/react";

export function AppleHealthConnection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AppleLogoIcon className="h-4 w-4" weight="duotone" />
            Apple Health
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-medium">
            Coming Soon
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Import sleep, HRV, heart rate, and activity data from Apple Health via XML export or
          your Apple Watch. No third-party services — your data stays on your machine.
        </p>
      </CardContent>
    </Card>
  );
}
