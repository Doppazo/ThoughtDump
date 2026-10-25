"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useIdeas } from "@/context/IdeasContext";
import { Idea, Category } from "@/types";
import { getCategoryColor } from "@/lib/colors";
import { forceCollide } from "d3-force-3d";
import {
  Search,
  Eye,
  EyeOff,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { WikilinkRenderer } from "./WikilinkRenderer";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-sm text-[var(--muted)] font-mono">
      Initializing 2D Force Graph...
    </div>
  ),
});

interface GraphViewProps {
  onSelectIdea?: (idea: Idea) => void;
}

export function GraphView({ onSelectIdea }: GraphViewProps) {
  const { ideas, categories, setSelectedCategory } = useIdeas();
  const fgRef = useRef<any>(null);
  const nodePositionsRef = useRef<Map<string, { x: number; y: number; fx?: number; fy?: number }>>(new Map());

  const [showCategoryLinks, setShowCategoryLinks] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [hoverLink, setHoverLink] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  // Map category to color
  const catColorMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c, idx) => {
      map.set(c.name.toLowerCase(), c.color || getCategoryColor(c.name, idx));
    });
    return map;
  }, [categories]);

  // Build nodes and edges with wide separation
  const { nodes, links, nodeMap } = useMemo(() => {
    const nList: any[] = [];
    const lList: any[] = [];
    const nMap = new Map<string, any>();

    // 1. Add Category Hub nodes with extra wide orbital separation (900px+ radius)
    const numCats = categories.length || 1;
    const catOrbitRadius = Math.max(900, numCats * 400);

    categories.forEach((cat, idx) => {
      const color = catColorMap.get(cat.name.toLowerCase()) || "#2645D4";
      const angle = (2 * Math.PI * idx) / numCats - Math.PI / 2;
      const hubId = `hub_${cat.name}`;
      const hubNode: any = {
        id: hubId,
        name: cat.name,
        color: "#111827", // Solid Black
        catColor: color,  // Category accent ring
        val: 28,
        isHub: true,
        categoryName: cat.name,
        x: Math.round(Math.cos(angle) * catOrbitRadius),
        y: Math.round(Math.sin(angle) * catOrbitRadius),
        neighbors: new Set<string>(),
        links: new Set<any>(),
      };
      nList.push(hubNode);
      nMap.set(hubNode.id, hubNode);
    });

    // 2. Add Idea nodes spaced far out around their respective category hubs
    const catIdeasCount = new Map<string, number>();
    const catIdeasIndex = new Map<string, number>();
    ideas.forEach((i) => {
      catIdeasCount.set(i.category, (catIdeasCount.get(i.category) || 0) + 1);
    });

    ideas.forEach((idea) => {
      const totalInCat = catIdeasCount.get(idea.category) || 1;
      const currentIdx = catIdeasIndex.get(idea.category) || 0;
      catIdeasIndex.set(idea.category, currentIdx + 1);

      const hubNode = nMap.get(`hub_${idea.category}`);
      const hubX = hubNode?.x ?? 0;
      const hubY = hubNode?.y ?? 0;

      const angle = (2 * Math.PI * currentIdx) / totalInCat;
      const ideaDistance = 320 + (currentIdx % 4) * 90; // 320px to 590px out from hub

      const ideaNode: any = {
        id: idea.id,
        name: idea.title,
        color: "#111827", // Solid Black
        val: 10,
        isHub: false,
        ideaData: idea,
        x: Math.round(hubX + Math.cos(angle) * ideaDistance),
        y: Math.round(hubY + Math.sin(angle) * ideaDistance),
        neighbors: new Set<string>(),
        links: new Set<any>(),
      };
      nList.push(ideaNode);
      nMap.set(ideaNode.id, ideaNode);
    });

    // 3. Category Hub links (subtle translucent connectors)
    if (showCategoryLinks) {
      ideas.forEach((idea) => {
        const hubId = `hub_${idea.category}`;
        if (nMap.has(hubId)) {
          const l = {
            id: `${idea.id}->${hubId}`,
            source: idea.id,
            target: hubId,
            isCategoryLink: true,
            color: "rgba(156, 163, 175, 0.22)",
            width: 1,
          };
          lList.push(l);
          const iNode = nMap.get(idea.id);
          const hNode = nMap.get(hubId);
          if (iNode && hNode) {
            iNode.neighbors.add(hubId);
            hNode.neighbors.add(idea.id);
            iNode.links.add(l);
            hNode.links.add(l);
          }
        }
      });
    }

    // 4. Idea-to-idea connections (Obsidian-style curved links)
    ideas.forEach((idea) => {
      (idea.links || []).forEach((link) => {
        if (nMap.has(link.ideaId)) {
          const l = {
            id: `${idea.id}-${link.ideaId}`,
            source: idea.id,
            target: link.ideaId,
            isCategoryLink: false,
            color: "rgba(38, 69, 212, 0.45)",
            width: 2.2,
            reason: link.reason,
          };
          lList.push(l);

          const srcNode = nMap.get(idea.id);
          const tgtNode = nMap.get(link.ideaId);
          if (srcNode && tgtNode) {
            srcNode.neighbors.add(link.ideaId);
            tgtNode.neighbors.add(idea.id);
            srcNode.links.add(l);
            tgtNode.links.add(l);
          }
        }
      });
    });

    return { nodes: nList, links: lList, nodeMap: nMap };
  }, [ideas, categories, catColorMap, showCategoryLinks]);

  // Obsidian Force Configuration: Separate main nodes widely and prevent clustering
  useEffect(() => {
    const applyForcesAndLayout = () => {
      if (fgRef.current) {
        const fg = fgRef.current;

        // 1. Center force: Set to 0 to completely prevent gravity from collapsing nodes inward
        const center = fg.d3Force("center");
        if (center) {
          center.strength(0);
        }

        // 2. Heavy Repulsion force (-9000 for hubs, -1500 for thoughts, radius 6000px)
        const charge = fg.d3Force("charge");
        if (charge) {
          charge.strength((n: any) => (n.isHub ? -9000 : -1500));
          charge.distanceMax(6000);
        }

        // 3. Wide link distances: 520px from hub to idea, 280px between linked thoughts
        const link = fg.d3Force("link");
        if (link) {
          link.distance((l: any) => (l.isCategoryLink ? 520 : 280));
        }

        // 4. Collision Force: Prevents nodes from ever overlapping or crowding
        fg.d3Force(
          "collide",
          forceCollide()
            .radius((n: any) => (n.isHub ? 120 : 50))
            .iterations(3)
        );

        // Unpin any previous positions so wide spacing takes effect immediately
        nodes.forEach((n) => {
          n.fx = undefined;
          n.fy = undefined;
        });

        fg.d3ReheatSimulation();

        // Smoothly fit camera around the expansive constellation
        setTimeout(() => {
          fgRef.current?.zoomToFit(700, 120);
        }, 500);
      }
    };

    applyForcesAndLayout();
    const timer = setTimeout(applyForcesAndLayout, 250);
    return () => clearTimeout(timer);
  }, [ideas.length, categories.length]);

  // When engine stops, lock positions if isLocked is true
  const handleEngineStop = useCallback(() => {
    if (!isLocked) return;
    nodes.forEach((n) => {
      if (n.x !== undefined && n.y !== undefined) {
        n.fx = n.x;
        n.fy = n.y;
        nodePositionsRef.current.set(n.id, {
          x: n.x,
          y: n.y,
          fx: n.fx,
          fy: n.fy,
        });
      }
    });
  }, [isLocked, nodes]);

  // Toggle lock state
  const handleToggleLock = () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);

    if (nextLocked) {
      nodes.forEach((n) => {
        if (n.x !== undefined && n.y !== undefined) {
          n.fx = n.x;
          n.fy = n.y;
          nodePositionsRef.current.set(n.id, {
            x: n.x,
            y: n.y,
            fx: n.fx,
            fy: n.fy,
          });
        }
      });
    } else {
      nodes.forEach((n) => {
        n.fx = undefined;
        n.fy = undefined;
        const cached = nodePositionsRef.current.get(n.id);
        if (cached) {
          cached.fx = undefined;
          cached.fy = undefined;
        }
      });
      if (fgRef.current) {
        fgRef.current.d3ReheatSimulation();
      }
    }
  };

  // Re-cluster / reset layout
  const handleReheat = () => {
    nodes.forEach((n) => {
      n.fx = undefined;
      n.fy = undefined;
      const cached = nodePositionsRef.current.get(n.id);
      if (cached) {
        cached.fx = undefined;
        cached.fy = undefined;
      }
    });
    if (fgRef.current) {
      fgRef.current.d3ReheatSimulation();
      setTimeout(() => {
        fgRef.current?.zoomToFit(600, 100);
      }, 400);
    }
  };

  // Drag node
  const handleNodeDragEnd = useCallback((node: any) => {
    node.fx = node.x;
    node.fy = node.y;
    nodePositionsRef.current.set(node.id, {
      x: node.x,
      y: node.y,
      fx: node.fx,
      fy: node.fy,
    });
  }, []);

  // Compute highlighted nodes when hovering
  const highlightNodes = useMemo(() => {
    const set = new Set<string>();
    if (hoverNode) {
      set.add(hoverNode.id);
      hoverNode.neighbors?.forEach((neighborId: string) => set.add(neighborId));
    }
    return set;
  }, [hoverNode]);

  const highlightLinks = useMemo(() => {
    const set = new Set<any>();
    if (hoverNode) {
      hoverNode.links?.forEach((l: any) => set.add(l));
    }
    return set;
  }, [hoverNode]);

  // Search zoom
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) return;

    const matched = nodes.find(
      (n) => n.name.toLowerCase().includes(q.toLowerCase())
    );

    if (matched && fgRef.current) {
      fgRef.current.centerAt(matched.x, matched.y, 700);
      fgRef.current.zoom(2.6, 700);
      setHoverNode(matched);
    }
  };

  // Touch / Click Zoom In Smoothly
  const handleNodeClick = useCallback(
    (node: any) => {
      if (!node) return;

      // Center and zoom in smoothly as requested
      if (fgRef.current && node.x !== undefined && node.y !== undefined) {
        const currentZoom = fgRef.current.zoom() || 1;
        const targetZoom = Math.max(currentZoom * 1.6, 2.6);
        fgRef.current.centerAt(node.x, node.y, 600);
        fgRef.current.zoom(targetZoom, 600);
      }

      setHoverNode(node);

      if (node.isHub) {
        setSelectedCategory(node.categoryName);
      } else if (node.ideaData) {
        setSelectedIdea(node.ideaData);
        if (onSelectIdea) onSelectIdea(node.ideaData);
      }
    },
    [setSelectedCategory, onSelectIdea]
  );

  const handleZoomIn = () => {
    if (fgRef.current) {
      const current = fgRef.current.zoom() || 1;
      fgRef.current.zoom(current * 1.5, 400);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      const current = fgRef.current.zoom() || 1;
      fgRef.current.zoom(Math.max(current * 0.67, 0.1), 400);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[500px] border border-[var(--line)] rounded-[18px] overflow-hidden bg-[var(--surface)] shadow-[var(--shadow)] flex">
      {/* Canvas Area */}
      <div className="flex-1 relative h-full">
        {/* Graph Controls Toolbar */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-32px)]">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search graph notes..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-full bg-white/95 backdrop-blur-sm border border-[var(--line)] shadow-sm focus:outline-none focus:border-[var(--pen)] w-44 sm:w-56 font-sans"
            />
          </div>

          {/* Toggle Lock / Pin Nodes */}
          <button
            type="button"
            onClick={handleToggleLock}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border shadow-sm transition-colors ${
              isLocked
                ? "bg-[var(--pen-soft)] border-[var(--pen)] text-[var(--pen)]"
                : "bg-white/95 border-[var(--line)] text-[var(--ink)] hover:border-[var(--muted)]"
            }`}
            title={
              isLocked
                ? "Nodes Locked: Nodes stay still. Click to unlock physics and drag to arrange."
                : "Physics Active: Touch and drag nodes freely. Click to lock them in place."
            }
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-[var(--muted)]" />}
            <span>{isLocked ? "Nodes Locked" : "Physics Active"}</span>
          </button>

          {/* Re-cluster Button */}
          <button
            type="button"
            onClick={handleReheat}
            className="p-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[var(--line)] shadow-sm hover:border-[var(--muted)] text-[var(--ink)]"
            title="Rearrange & Expand Graph"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Category Links */}
          <button
            type="button"
            onClick={() => setShowCategoryLinks(!showCategoryLinks)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm border border-[var(--line)] shadow-sm hover:border-[var(--muted)] text-[var(--ink)] transition-colors"
          >
            {showCategoryLinks ? <Eye className="w-3.5 h-3.5 text-[var(--pen)]" /> : <EyeOff className="w-3.5 h-3.5 text-[var(--muted)]" />}
            <span className="hidden sm:inline">Category Hubs</span>
          </button>

          {/* Quick Zoom Buttons */}
          <div className="flex items-center rounded-full bg-white/95 backdrop-blur-sm border border-[var(--line)] shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-[var(--surface-hover)] text-[var(--ink)] border-r border-[var(--line)]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-[var(--surface-hover)] text-[var(--ink)] border-r border-[var(--line)]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => fgRef.current?.zoomToFit(600, 100)}
              className="p-1.5 hover:bg-[var(--surface-hover)] text-[var(--ink)]"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Legend / Info bar */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
          {hoverLink?.reason ? (
            <div className="px-3 py-1.5 rounded-lg bg-[var(--ink)] text-white text-xs font-mono shadow-lg animate-in fade-in">
              <span className="text-[var(--hl)] font-bold mr-1">Connection:</span>
              {hoverLink.reason}
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-[var(--line)] text-[11px] font-mono text-[var(--muted)] shadow-sm">
              {nodes.length} nodes &bull; {links.length} links &bull; Touch / click any node to zoom in
            </div>
          )}

          {hoverNode && (
            <button
              type="button"
              onClick={() => setHoverNode(null)}
              className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm border border-[var(--line)] text-[11px] font-mono text-[var(--pen)] hover:bg-[var(--paper)] shadow-sm"
            >
              Clear selection
            </button>
          )}
        </div>

        {/* 2D Force Graph */}
        <ForceGraph2D
          ref={fgRef}
          graphData={{ nodes, links }}
          enableNodeDrag={!isLocked}
          enablePanInteraction={true}
          enableZoomInteraction={true}
          warmupTicks={0}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.4}
          onEngineStop={handleEngineStop}
          onNodeDragEnd={handleNodeDragEnd}
          nodeRelSize={7}
          linkCurvature={(link: any) => (link.isCategoryLink ? 0 : 0.16)}
          linkWidth={(link: any) =>
            highlightLinks.has(link) ? 3 : link.width || 1
          }
          linkColor={(link: any) => {
            const isDark = typeof document !== "undefined" && (document.documentElement.classList.contains("dark") || document.documentElement.getAttribute("data-theme") === "dark");
            if (highlightLinks.has(link)) return isDark ? "#4F6BFF" : "#2645D4";
            if (hoverNode && !highlightLinks.has(link)) return isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(229, 231, 235, 0.25)";
            return link.color || (isDark ? "rgba(100, 116, 139, 0.45)" : "rgba(209, 213, 219, 0.6)");
          }}
          nodePointerAreaPaint={(node: any, color, ctx) => {
            // Generous touch hit-box ensuring clicks & mobile touches always hit
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.isHub ? 36 : 26, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const isHovered = hoverNode === node;
            const isConnected = highlightNodes.has(node.id);
            const isDimmed = hoverNode && !isConnected;

            const isDark = typeof document !== "undefined" && (document.documentElement.classList.contains("dark") || document.documentElement.getAttribute("data-theme") === "dark");

            const isHub = node.isHub;
            // Dynamic Obsidian-grade sizing proportional to node connections
            const degree = node.neighbors?.size || 0;
            const radius = isHub ? 15 : Math.min(6.5 + degree * 1.5, 12);
            const label = node.name;
            const fontSize = isHub ? 14 / globalScale : 11 / globalScale;

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);

            // Node Color: Solid black in light mode, luminous light in dark mode
            const nodeFill = isDark ? "#F1F5F9" : "#111827";
            ctx.fillStyle = isDimmed ? (isDark ? "#475569" : "#9CA3AF") : nodeFill;
            ctx.fill();

            // Distinct category accent ring or active focus outline
            if (isHovered || isConnected) {
              ctx.strokeStyle = isDark ? "#4F6BFF" : "#2645D4";
              ctx.lineWidth = 3.5 / globalScale;
              ctx.stroke();
            } else if (isHub) {
              // Accent ring around category hubs
              ctx.strokeStyle = node.catColor || (isDark ? "#94A3B8" : "#4B5563");
              ctx.lineWidth = 2.5 / globalScale;
              ctx.stroke();
            } else {
              // Crisp subtle outline for idea notes
              ctx.strokeStyle = isDark ? "#94A3B8" : "#374151";
              ctx.lineWidth = 1 / globalScale;
              ctx.stroke();
            }

            // Draw crisp Obsidian-style label
            if (isHub || isHovered || isConnected || globalScale >= 0.85) {
              ctx.font = `${isHub ? "800" : "600"} ${fontSize}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              const textWidth = ctx.measureText(label).width;
              const bWidth = textWidth + 10 / globalScale;
              const bHeight = fontSize + 6 / globalScale;
              const labelY = node.y + (radius + 9) / globalScale;

              ctx.fillStyle = isDimmed
                ? (isDark ? "rgba(21,27,40,0.7)" : "rgba(255,255,255,0.7)")
                : (isDark ? "rgba(21,27,40,0.92)" : "rgba(255,255,255,0.95)");
              ctx.fillRect(
                node.x - bWidth / 2,
                labelY - bHeight / 2,
                bWidth,
                bHeight
              );

              ctx.fillStyle = isDimmed ? (isDark ? "#64748B" : "#9CA3AF") : (isDark ? "#F8FAFC" : "#111827");
              ctx.fillText(label, node.x, labelY);
            }
          }}
          onNodeHover={(node: any) => setHoverNode(node || null)}
          onLinkHover={(link: any) => setHoverLink(link || null)}
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* Side Panel for Clicked Idea */}
      {selectedIdea && (
        <aside className="w-80 md:w-96 border-l border-[var(--line)] bg-[var(--surface)] p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 z-30">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <span className={`pill p-${selectedIdea.type || "idea"}`}>
                {selectedIdea.type || "idea"}
              </span>
              <button
                onClick={() => setSelectedIdea(null)}
                className="p-1 text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <Link
                href={`/category/${encodeURIComponent(selectedIdea.category)}`}
                className="text-xs font-mono font-bold text-[var(--pen)] hover:underline inline-block mb-1"
              >
                {selectedIdea.category} &rarr;
              </Link>
              <h3 className="font-extrabold text-lg text-[var(--ink)] leading-snug font-[family-name:var(--f-display)]">
                {selectedIdea.title}
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-sm leading-relaxed text-[var(--ink)]">
              <WikilinkRenderer
                text={selectedIdea.summary}
                onSelectIdea={(target) => setSelectedIdea(target)}
              />
            </div>

            {/* Links count */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[var(--muted)]">
                <span>Outgoing links:</span>
                <span className="font-bold text-[var(--ink)]">{selectedIdea.links?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--muted)]">
                <span>Backlinks:</span>
                <span className="font-bold text-[var(--ink)]">{selectedIdea.backlinks?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--line)] flex gap-2">
            <button
              onClick={() => {
                if (onSelectIdea) onSelectIdea(selectedIdea);
              }}
              className="btn primary flex-1 text-center justify-center text-xs"
            >
              Open Full Note
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
