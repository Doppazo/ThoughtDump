"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useIdeas } from "@/context/IdeasContext";
import { Idea, Category } from "@/types";
import { getCategoryColor } from "@/lib/colors";
import {
  Search,
  Eye,
  EyeOff,
  Maximize2,
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
  const [isLocked, setIsLocked] = useState(true);
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

  // Build nodes and edges
  const { nodes, links, nodeMap } = useMemo(() => {
    const nList: any[] = [];
    const lList: any[] = [];
    const nMap = new Map<string, any>();

    // 1. Add Category Hub nodes
    categories.forEach((cat) => {
      const color = catColorMap.get(cat.name.toLowerCase()) || "#2645D4";
      const hubId = `hub_${cat.name}`;
      const cached = nodePositionsRef.current.get(hubId);
      const hubNode: any = {
        id: hubId,
        name: cat.name,
        color,
        val: 16,
        isHub: true,
        categoryName: cat.name,
        neighbors: new Set<string>(),
        links: new Set<any>(),
        ...(cached ? {
          x: cached.x,
          y: cached.y,
          fx: isLocked ? (cached.fx ?? cached.x) : undefined,
          fy: isLocked ? (cached.fy ?? cached.y) : undefined,
        } : {}),
      };
      nList.push(hubNode);
      nMap.set(hubNode.id, hubNode);
    });

    // 2. Add Idea nodes
    ideas.forEach((idea) => {
      const color = catColorMap.get(idea.category.toLowerCase()) || "#2645D4";
      const cached = nodePositionsRef.current.get(idea.id);
      const ideaNode: any = {
        id: idea.id,
        name: idea.title,
        color,
        val: 6,
        isHub: false,
        ideaData: idea,
        neighbors: new Set<string>(),
        links: new Set<any>(),
        ...(cached ? {
          x: cached.x,
          y: cached.y,
          fx: isLocked ? (cached.fx ?? cached.x) : undefined,
          fy: isLocked ? (cached.fy ?? cached.y) : undefined,
        } : {}),
      };
      nList.push(ideaNode);
      nMap.set(ideaNode.id, ideaNode);
    });

    // 3. Category Hub links
    if (showCategoryLinks) {
      ideas.forEach((idea) => {
        const hubId = `hub_${idea.category}`;
        if (nMap.has(hubId)) {
          const l = {
            id: `${idea.id}->${hubId}`,
            source: idea.id,
            target: hubId,
            isCategoryLink: true,
            color: `${catColorMap.get(idea.category.toLowerCase()) || "#D7DCE6"}33`,
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

    // 4. Idea-to-idea connections
    ideas.forEach((idea) => {
      (idea.links || []).forEach((link) => {
        if (nMap.has(link.ideaId)) {
          const l = {
            id: `${idea.id}-${link.ideaId}`,
            source: idea.id,
            target: link.ideaId,
            isCategoryLink: false,
            color: "var(--pen)",
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

  // Configure forces to prevent runaway repulsion
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fgRef.current) {
        const fg = fgRef.current;
        const charge = fg.d3Force("charge");
        if (charge) {
          charge.strength(-60);
          charge.distanceMax(200);
        }
        const link = fg.d3Force("link");
        if (link) {
          link.distance((l: any) => (l.isCategoryLink ? 60 : 45));
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // When engine stops, lock positions if isLocked is true so nodes never wander or drift
  const handleEngineStop = useCallback(() => {
    nodes.forEach((n) => {
      if (n.x !== undefined && n.y !== undefined) {
        if (isLocked) {
          n.fx = n.x;
          n.fy = n.y;
        }
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
      // Pin all nodes in place
      nodes.forEach((n) => {
        if (n.x !== undefined && n.y !== undefined) {
          n.fx = n.x;
          n.fy = n.y;
          nodePositionsRef.current.set(n.id, {
            x: n.x,
            y: n.y,
            fx: n.x,
            fy: n.y,
          });
        }
      });
    } else {
      // Unpin nodes and let gentle simulation reheat
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
    }
  };

  // Pin a dragged node in its new spot
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

  // Compute highlighted nodes when hovering a node
  const highlightNodes = useMemo(() => {
    const set = new Set<string>();
    if (hoverNode) {
      set.add(hoverNode.id);
      hoverNode.neighbors.forEach((neighborId: string) => set.add(neighborId));
    }
    return set;
  }, [hoverNode]);

  const highlightLinks = useMemo(() => {
    const set = new Set<any>();
    if (hoverNode) {
      hoverNode.links.forEach((l: any) => set.add(l));
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
      fgRef.current.centerAt(matched.x, matched.y, 800);
      fgRef.current.zoom(2.5, 800);
      setHoverNode(matched);
    }
  };

  const handleNodeClick = useCallback(
    (node: any) => {
      if (node.isHub) {
        setSelectedCategory(node.categoryName);
      } else if (node.ideaData) {
        setSelectedIdea(node.ideaData);
        if (onSelectIdea) onSelectIdea(node.ideaData);
      }
    },
    [setSelectedCategory, onSelectIdea]
  );

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[500px] border border-[var(--line)] rounded-[18px] overflow-hidden bg-white shadow-[var(--shadow)] flex">
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
                ? "Browsing mode: Nodes stay completely still when touched. Click to unlock physics and drag to arrange."
                : "Physics active: Touch and drag nodes to arrange. Click to lock them still in place."
            }
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-[var(--muted)]" />}
            <span>{isLocked ? "Nodes Still (Locked)" : "Physics Active"}</span>
          </button>

          {/* Re-cluster Button */}
          <button
            type="button"
            onClick={handleReheat}
            className="p-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[var(--line)] shadow-sm hover:border-[var(--muted)] text-[var(--ink)]"
            title="Settle & Rearrange Nodes"
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

          {/* Zoom reset */}
          <button
            type="button"
            onClick={() => fgRef.current?.zoomToFit(500, 40)}
            className="p-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[var(--line)] shadow-sm hover:border-[var(--muted)] text-[var(--ink)]"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Legend / Hover reason tooltip */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          {hoverLink?.reason ? (
            <div className="px-3 py-1.5 rounded-lg bg-[var(--ink)] text-white text-xs font-mono shadow-lg animate-in fade-in">
              <span className="text-[var(--hl)] font-bold mr-1">Connection:</span>
              {hoverLink.reason}
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-[var(--line)] text-[11px] font-mono text-[var(--muted)] shadow-sm">
              {nodes.length} nodes &bull; {links.length} links &bull; Touch / click to inspect
            </div>
          )}
        </div>

        {/* 2D Force Graph with Stable Physics */}
        <ForceGraph2D
          ref={fgRef}
          graphData={{ nodes, links }}
          enableNodeDrag={!isLocked}
          enablePanInteraction={true}
          enableZoomInteraction={true}
          warmupTicks={160}
          cooldownTicks={25}
          d3AlphaDecay={0.08}
          d3VelocityDecay={0.75}
          onEngineStop={handleEngineStop}
          onNodeDragEnd={handleNodeDragEnd}
          nodeRelSize={4}
          linkWidth={(link: any) =>
            highlightLinks.has(link) ? 3 : link.width || 1
          }
          linkColor={(link: any) => {
            if (highlightLinks.has(link)) return "var(--pen)";
            if (hoverNode && !highlightLinks.has(link)) return "#E5E7EB33";
            return link.color || "#D7DCE6";
          }}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const isHovered = hoverNode === node;
            const isConnected = highlightNodes.has(node.id);
            const isDimmed = hoverNode && !isConnected;

            const radius = node.isHub ? 8 : 4.5;
            const label = node.name;
            const fontSize = node.isHub ? 13 / globalScale : 11 / globalScale;

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);

            ctx.fillStyle = isDimmed ? "#D1D5DB" : node.color || "#2645D4";
            ctx.fill();

            if (isHovered || node.isHub) {
              ctx.strokeStyle = node.isHub ? "#161D2B" : "var(--pen)";
              ctx.lineWidth = node.isHub ? 2 / globalScale : 1.5 / globalScale;
              ctx.stroke();
            }

            // Draw label
            if (node.isHub || isHovered || isConnected || globalScale >= 1.6) {
              ctx.font = `${node.isHub ? "800" : "600"} ${fontSize}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              // Label background bubble
              const textWidth = ctx.measureText(label).width;
              const bWidth = textWidth + 8 / globalScale;
              const bHeight = fontSize + 4 / globalScale;
              ctx.fillStyle = isDimmed ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.92)";
              ctx.fillRect(
                node.x - bWidth / 2,
                node.y + (node.isHub ? 12 : 8) / globalScale - bHeight / 2,
                bWidth,
                bHeight
              );

              ctx.fillStyle = isDimmed ? "#9CA3AF" : node.isHub ? "var(--ink)" : "var(--pen)";
              ctx.fillText(label, node.x, node.y + (node.isHub ? 12 : 8) / globalScale);
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
