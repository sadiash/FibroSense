"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CorrelationResult } from "@/lib/types";
import { ChartSkeleton } from "@/components/shared/loading-skeleton";

interface CorrelationHeatmapProps {
  correlations: CorrelationResult[];
  onCellClick?: (metricA: string, metricB: string) => void;
  isLoading?: boolean;
}

const metricLabels: Record<string, string> = {
  pain_severity: "Pain",
  fatigue_severity: "Fatigue",
  brain_fog: "Brain Fog",
  mood: "Mood",
  sleep_duration: "Sleep",
  sleep_efficiency: "Sleep Eff.",
  hrv_rmssd: "HRV",
  resting_hr: "Rest. HR",
  barometric_pressure: "Pressure",
  temperature: "Temp",
  humidity: "Humidity",
};

export function CorrelationHeatmap({
  correlations,
  onCellClick,
  isLoading,
}: CorrelationHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !correlations.length) return;

    const metrics = Array.from(
      new Set(correlations.flatMap((c) => [c.metric_a, c.metric_b]))
    );

    const margin = { top: 70, right: 10, bottom: 10, left: 80 };
    const cellSize = 32;
    const width = margin.left + metrics.length * cellSize + margin.right;
    const height = margin.top + metrics.length * cellSize + margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const colorScale = d3
      .scaleSequential(d3.interpolateRdBu)
      .domain([1, -1]);

    const corrMap = new Map<string, number>();
    correlations.forEach((c) => {
      corrMap.set(`${c.metric_a}-${c.metric_b}`, c.correlation_coefficient);
      corrMap.set(`${c.metric_b}-${c.metric_a}`, c.correlation_coefficient);
    });

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Column labels
    g.selectAll(".col-label")
      .data(metrics)
      .join("text")
      .attr("class", "col-label")
      .attr("x", (_, i) => i * cellSize + cellSize / 2)
      .attr("y", -10)
      .attr("text-anchor", "end")
      .attr("transform", (_, i) => `rotate(-45, ${i * cellSize + cellSize / 2}, -10)`)
      .attr("font-size", "9px")
      .attr("fill", "currentColor")
      .text((d) => metricLabels[d] || d);

    // Row labels
    g.selectAll(".row-label")
      .data(metrics)
      .join("text")
      .attr("class", "row-label")
      .attr("x", -6)
      .attr("y", (_, i) => i * cellSize + cellSize / 2 + 3)
      .attr("text-anchor", "end")
      .attr("font-size", "9px")
      .attr("fill", "currentColor")
      .text((d) => metricLabels[d] || d);

    // Cells
    metrics.forEach((rowMetric, ri) => {
      metrics.forEach((colMetric, ci) => {
        const key = `${rowMetric}-${colMetric}`;
        const val = rowMetric === colMetric ? 1 : (corrMap.get(key) ?? 0);

        g.append("rect")
          .attr("x", ci * cellSize)
          .attr("y", ri * cellSize)
          .attr("width", cellSize - 2)
          .attr("height", cellSize - 2)
          .attr("rx", 4)
          .attr("fill", colorScale(val))
          .attr("opacity", 0.85)
          .style("cursor", "pointer")
          .on("click", () => {
            if (onCellClick && rowMetric !== colMetric) {
              onCellClick(rowMetric, colMetric);
            }
          });

        g.append("text")
          .attr("x", ci * cellSize + (cellSize - 2) / 2)
          .attr("y", ri * cellSize + (cellSize - 2) / 2 + 4)
          .attr("text-anchor", "middle")
          .attr("font-size", "8px")
          .attr("fill", Math.abs(val) > 0.5 ? "white" : "currentColor")
          .text(val.toFixed(2));
      });
    });
  }, [correlations, onCellClick]);

  if (isLoading) return <ChartSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Correlation Matrix</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto flex justify-center">
        <svg ref={svgRef} className="max-w-[520px]" />
      </CardContent>
    </Card>
  );
}
