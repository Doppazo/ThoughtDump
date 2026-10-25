"use client";

import React, { useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Idea, Category } from "@/types";
import { getCategoryColor } from "@/lib/colors";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="h-44 w-full flex items-center justify-center text-xs text-[var(--muted)] font-mono">
      Loading local graph...
    </div>
  ),
});

interface LocalGraphProps {
  currentIdea: Idea;
  allIdeas: Idea[];
  categories: Category[];
  onSelectIdea: (idea: Idea) => void;
}

export function LocalGraph({
  currentIdea,
  allIdeas,
  categories,
  onSelectIdea,
}: LocalGraphProps) {
  const catColor = useMemo(() => {
    const c = categories.find(
      (cat) => cat.name.toLowerCase() === currentIdea.category.toLowerCase()
    );
    return c?.color || getCategoryColor(currentIdea.category);
  }, [categories, currentIdea.category]);

  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    const addedNodeIds = new Set<string>();

    // 1. Current idea node
    nodes.push({
      id: currentIdea.id,
      name: currentIdea.title,
      color: catColor,
      val: 7,
      isCurrent: true,
      isHub: false,
    });
    addedNodeIds.add(currentIdea.id);

    // 2. Category Hub node
    const hubId = `hub_${currentIdea.category}`;
    nodes.push({
      id: hubId,
      name: currentIdea.category,
      color: catColor,
      val: 9,
      isCurrent: false,
      isHub: true,
    });
    addedNodeIds.add(hubId);

    // Link current idea to category hub
    links.push({
      source: currentIdea.id,
      target: hubId,
      color: `${catColor}44`,
      curvature: 0.1,
    });

    // 3. Outgoing links
    (currentIdea.links || []).forEach((link) => {
      const targetIdea = allIdeas.find((i) => i.id === link.ideaId);
      if (targetIdea) {
        if (!addedNodeIds.has(targetIdea.id)) {
          const tColor =
            categories.find(
              (c) => c.name.toLowerCase() === targetIdea.category.toLowerCase()
            )?.color || getCategoryColor(targetIdea.category);

          nodes.push({
            id: targetIdea.id,
            name: targetIdea.title,
            color: tColor,
            val: 5,
            isCurrent: false,
            isHub: false,
          });
          addedNodeIds.add(targetIdea.id);
        }

        links.push({
          source: currentIdea.id,
          target: targetIdea.id,
          color: "var(--pen)",
          label: link.reason,
        });
      }
    });

    // 4. Backlinks (incoming)
    (currentIdea.backlinks || []).forEach((backlink) => {
      const sourceIdea = allIdeas.find((i) => i.id === backlink.ideaId);
      if (sourceIdea) {
        if (!addedNodeIds.has(sourceIdea.id)) {
          const sColor =
            categories.find(
              (c) => c.name.toLowerCase() === sourceIdea.category.toLowerCase()
            )?.color || getCategoryColor(sourceIdea.category);

          nodes.push({
            id: sourceIdea.id,
            name: sourceIdea.title,
            color: sColor,
            val: 5,
            isCurrent: false,
            isHub: false,
          });
          addedNodeIds.add(sourceIdea.id);
        }

        links.push({
          source: sourceIdea.id,
          target: currentIdea.id,
          color: "var(--pen)",
          label: backlink.reason,
        });
      }
    });

    return { nodes, links };
  }, [currentIdea, allIdeas, categories, catColor]);

  // Lock node positions after warmup so browsing never moves them
  const handleEngineStop = useCallback(() => {
    graphData.nodes.forEach((n: any) => {
      if (n.x !== undefined && n.y !== undefined) {
        n.fx = n.x;
        n.fy = n.y;
      }
    });
  }, [graphData.nodes]);

  return (
    <div className="w-full h-48 border border-[var(--line)] rounded-xl overflow-hidden bg-white relative">
      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-mono text-[var(--muted)] bg-white/80 border border-[var(--line)]">
        Local Graph
      </div>
      <ForceGraph2D
        graphData={graphData}
        width={420}
        height={192}
        enableNodeDrag={false}
        warmupTicks={120}
        cooldownTicks={15}
        d3AlphaDecay={0.09}
        d3VelocityDecay={0.75}
        onEngineStop={handleEngineStop}
        nodeRelSize={6}
        linkColor={(link: any) => link.color || "#D7DCE6"}
        linkWidth={(link: any) => (link.label ? 2 : 1)}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 16, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = node.isHub ? 11 / globalScale : 9 / globalScale;
          ctx.font = `${node.isCurrent || node.isHub ? "bold" : "normal"} ${fontSize}px sans-serif`;

          // Circle: Solid black node
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.isHub ? 7 : node.isCurrent ? 6 : 4.5, 0, 2 * Math.PI, false);
          ctx.fillStyle = "#111827";
          ctx.fill();

          if (node.isCurrent) {
            ctx.strokeStyle = "var(--pen)";
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Label
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#161D2B";
          ctx.fillText(label.slice(0, 20), node.x, node.y + (node.isHub ? 10 : 8));
        }}
        onNodeClick={(node: any) => {
          if (!node.isHub && node.id !== currentIdea.id) {
            const found = allIdeas.find((i) => i.id === node.id);
            if (found) onSelectIdea(found);
          }
        }}
      />
    </div>
  );
}
