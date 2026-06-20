import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// ── Node types ──────────────────────────────────────────────────────────────

type NodeType = 'trigger' | 'wait' | 'action' | 'condition';

interface BaseNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
}

interface TriggerNodeData extends BaseNode {
  type: 'trigger';
  title: string;
  desc: string;
}

interface WaitNodeData extends BaseNode {
  type: 'wait';
  waitSeconds: number;
}

interface ActionNodeData extends BaseNode {
  type: 'action';
  title: string;
}

interface ConditionNodeData extends BaseNode {
  type: 'condition';
  condition: string;
}

type CanvasNode = TriggerNodeData | WaitNodeData | ActionNodeData | ConditionNodeData;

interface Edge {
  from: string;
  to: string;
}

const NODE_WIDTH = 260;
const NODE_HALF = NODE_WIDTH / 2;

// ── Node components ─────────────────────────────────────────────────────────

interface NodeProps {
  node: CanvasNode;
  selected: boolean;
  onClick: () => void;
}

function TriggerNodeCard({ node, selected, onClick }: NodeProps & { node: TriggerNodeData }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: node.x - NODE_HALF,
        top: node.y,
        width: NODE_WIDTH,
        background: '#fff',
        borderRadius: 12,
        border: `2px solid ${selected ? '#0A84FF' : '#2dd4bf'}`,
        boxShadow: selected ? '0 0 0 3px rgba(10,132,255,0.25)' : '0 2px 12px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
          padding: '12px 16px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 18 }}>⚡</span>
        <span
          style={{ color: '#fff', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          Trigger
        </span>
      </div>
      <div style={{ padding: '12px 16px 14px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1c1c1e', marginBottom: 4 }}>{node.title}</div>
        <div style={{ fontSize: 12, color: '#6e6e73', lineHeight: 1.4 }}>{node.desc}</div>
      </div>
    </div>
  );
}

function WaitNodeCard({ node, selected, onClick }: NodeProps & { node: WaitNodeData }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: node.x - NODE_HALF,
        top: node.y,
        width: NODE_WIDTH,
        background: '#fff',
        borderRadius: 12,
        border: `1.5px solid ${selected ? '#0A84FF' : '#e5e7eb'}`,
        boxShadow: selected ? '0 0 0 3px rgba(10,132,255,0.25)' : '0 2px 8px rgba(0,0,0,0.07)',
        cursor: 'pointer',
        userSelect: 'none',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>🕐</span>
      <div style={{ fontSize: 14, color: '#1c1c1e' }}>
        Wait for <strong>{node.waitSeconds}</strong> seconds
      </div>
    </div>
  );
}

function ActionNodeCard({ node, selected, onClick }: NodeProps & { node: ActionNodeData }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: node.x - NODE_HALF,
        top: node.y,
        width: NODE_WIDTH,
        background: '#fff',
        borderRadius: 12,
        border: `1.5px solid ${selected ? '#0A84FF' : '#e5e7eb'}`,
        boxShadow: selected ? '0 0 0 3px rgba(10,132,255,0.25)' : '0 2px 8px rgba(0,0,0,0.07)',
        cursor: 'pointer',
        userSelect: 'none',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span style={{ fontSize: 20, fontFamily: 'monospace', color: '#6e6e73', fontWeight: 700 }}>{'{/}'}</span>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1e' }}>{node.title}</div>
    </div>
  );
}

function ConditionNodeCard({ node, selected, onClick }: NodeProps & { node: ConditionNodeData }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: node.x - NODE_HALF,
        top: node.y,
        width: NODE_WIDTH,
        background: '#fff',
        borderRadius: 12,
        border: `1.5px solid ${selected ? '#0A84FF' : '#e5e7eb'}`,
        boxShadow: selected ? '0 0 0 3px rgba(10,132,255,0.25)' : '0 2px 8px rgba(0,0,0,0.07)',
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 18, color: '#f59e0b', flexShrink: 0 }}>▲</span>
        <div style={{ fontSize: 13, color: '#1c1c1e', lineHeight: 1.4 }}>{node.condition}</div>
      </div>
      <div
        style={{
          display: 'flex',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: '#34c759',
            textAlign: 'center',
            borderRight: '1px solid #f0f0f0',
          }}
        >
          ✓ True
        </div>
        <div
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: '#ff3b30',
            textAlign: 'center',
          }}
        >
          ✗ False
        </div>
      </div>
    </div>
  );
}

// ── SVG connector layer ─────────────────────────────────────────────────────

function getNodeBottom(node: CanvasNode): number {
  switch (node.type) {
    case 'trigger':
      return node.y + 96;
    case 'wait':
      return node.y + 52;
    case 'action':
      return node.y + 52;
    case 'condition':
      return node.y + 94;
  }
}

interface ConnectorsProps {
  nodes: CanvasNode[];
  edges: Edge[];
  stageWidth: number;
  stageHeight: number;
}

function Connectors({ nodes, edges, stageWidth, stageHeight }: ConnectorsProps) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
      width={stageWidth}
      height={stageHeight}
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L0,8 L8,4 z" fill="#9ca3af" />
        </marker>
      </defs>
      {edges.map((edge) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) return null;

        const x1 = from.x;
        const y1 = getNodeBottom(from);
        const x2 = to.x;
        const y2 = to.y;
        const mid = (y1 + y2) / 2;

        return (
          <path
            key={`${edge.from}-${edge.to}`}
            d={`M ${x1},${y1} C ${x1},${mid} ${x2},${mid} ${x2},${y2}`}
            fill="none"
            stroke="#9ca3af"
            strokeWidth="1.5"
            markerEnd="url(#arrowhead)"
          />
        );
      })}
    </svg>
  );
}

// ── Default demo nodes ──────────────────────────────────────────────────────

const DEFAULT_NODES: CanvasNode[] = [
  {
    id: 't1',
    type: 'trigger',
    x: 380,
    y: 80,
    title: 'Order created',
    desc: 'This workflow starts when a new order is created',
  },
  { id: 'w1', type: 'wait', x: 380, y: 280, waitSeconds: 10 },
  { id: 'a1', type: 'action', x: 380, y: 440, title: 'Run code' },
  { id: 'c1', type: 'condition', x: 380, y: 600, condition: 'Run code has subscriptions is equal to true' },
];

const DEFAULT_EDGES: Edge[] = [
  { from: 't1', to: 'w1' },
  { from: 'w1', to: 'a1' },
  { from: 'a1', to: 'c1' },
];

// ── Stage dimensions ────────────────────────────────────────────────────────

const STAGE_W = 800;
const STAGE_H = 900;

// ── Main editor ─────────────────────────────────────────────────────────────

export default function TowerEditRoom() {
  const router = useRouter();
  const { id } = router.query;
  const towerId = typeof id === 'string' ? id : 'new';

  const [towerName, setTowerName] = useState('Order created');
  const [isEnabled, setIsEnabled] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(towerName);

  const [nodes] = useState<CanvasNode[]>(DEFAULT_NODES);
  const [edges] = useState<Edge[]>(DEFAULT_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Pan & zoom
  const [translate, setTranslate] = useState({ x: 60, y: 40 });
  const [scale, setScale] = useState(1);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Keyboard: Escape to go back
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void router.push('/automations/tower');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-node]')) return;
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y };
      setSelectedNodeId(null);
    },
    [translate],
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setTranslate({ x: panStart.current.tx + dx, y: panStart.current.ty + dy });
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      return Math.max(0.25, Math.min(2, prev * delta));
    });
  }, []);

  const handleZoomIn = () => setScale((s) => Math.min(2, s * 1.2));
  const handleZoomOut = () => setScale((s) => Math.max(0.25, s / 1.2));
  const handleFit = () => {
    setScale(1);
    setTranslate({ x: 60, y: 40 });
  };

  const handleNameCommit = () => {
    setTowerName(nameInput.trim() || towerName);
    setEditingName(false);
  };

  // More actions dropdown
  const [showMoreActions, setShowMoreActions] = useState(false);
  const moreActionsRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showMoreActions) return;
    const handler = (e: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target as Node)) {
        setShowMoreActions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMoreActions]);

  const renderNode = (node: CanvasNode) => {
    const props = {
      node,
      selected: selectedNodeId === node.id,
      onClick: () => setSelectedNodeId(node.id),
    };
    switch (node.type) {
      case 'trigger':
        return <TriggerNodeCard key={node.id} {...props} node={node} />;
      case 'wait':
        return <WaitNodeCard key={node.id} {...props} node={node} />;
      case 'action':
        return <ActionNodeCard key={node.id} {...props} node={node} />;
      case 'condition':
        return <ConditionNodeCard key={node.id} {...props} node={node} />;
    }
  };

  return (
    <>
      <Head>
        <title>{towerName} — Tower Editor</title>
      </Head>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#f2f2f7',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            height: 56,
            background: '#fff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 12,
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          {/* Tower icon + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚡</span>
            {editingName ? (
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameCommit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameCommit();
                  if (e.key === 'Escape') {
                    setNameInput(towerName);
                    setEditingName(false);
                  }
                }}
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  border: 'none',
                  borderBottom: '2px solid #0A84FF',
                  outline: 'none',
                  background: 'transparent',
                  color: '#1c1c1e',
                  width: 240,
                  fontFamily: 'inherit',
                  padding: '2px 0',
                }}
              />
            ) : (
              <button
                onClick={() => {
                  setNameInput(towerName);
                  setEditingName(true);
                }}
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1c1c1e',
                  background: 'none',
                  border: 'none',
                  cursor: 'text',
                  padding: '2px 4px',
                  borderRadius: 4,
                  fontFamily: 'inherit',
                }}
                title="Click to rename"
              >
                {towerName}
              </button>
            )}
            <span
              style={{
                fontSize: 11,
                color: '#8e8e93',
                background: '#f2f2f7',
                borderRadius: 6,
                padding: '2px 8px',
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {towerId === 'new' ? 'Draft' : `ID: ${towerId}`}
            </span>
          </div>

          {/* More actions */}
          <div style={{ position: 'relative' }}>
            <button
              ref={moreActionsRef}
              onClick={() => setShowMoreActions((v) => !v)}
              style={{
                height: 32,
                padding: '0 12px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#fff',
                fontSize: 13,
                fontWeight: 500,
                color: '#1c1c1e',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'inherit',
              }}
            >
              More actions <span style={{ fontSize: 10 }}>▾</span>
            </button>
            {showMoreActions && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: 180,
                  overflow: 'hidden',
                  zIndex: 100,
                }}
              >
                {['Duplicate tower', 'Export JSON', 'View run history', 'Delete tower'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setShowMoreActions(false)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      fontSize: 14,
                      color: item === 'Delete tower' ? '#ff3b30' : '#1c1c1e',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f2f2f7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enable/Disable toggle */}
          <button
            onClick={() => setIsEnabled((v) => !v)}
            style={{
              height: 32,
              padding: '0 14px',
              borderRadius: 8,
              border: 'none',
              background: isEnabled ? '#ff3b30' : '#34c759',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.2s',
            }}
          >
            {isEnabled ? 'Turn off tower' : 'Turn on tower'}
          </button>

          {/* Close */}
          <button
            onClick={() => void router.push('/automations/tower')}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontSize: 18,
              lineHeight: '30px',
              color: '#8e8e93',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'inherit',
            }}
            title="Close editor (Escape)"
          >
            ✕
          </button>
        </div>

        {/* ── Canvas ── */}
        <div
          ref={canvasRef}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            cursor: isPanning.current ? 'grabbing' : 'grab',
            backgroundImage: 'radial-gradient(circle, #c0c0c0 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundColor: '#f2f2f7',
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* "Test your tower" pill */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 24,
              padding: '6px 16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1c1c1e', whiteSpace: 'nowrap' }}>
              Test your tower
            </span>
            <input
              type="text"
              placeholder="Enter test value..."
              onClick={(e) => e.stopPropagation()}
              style={{
                height: 26,
                padding: '0 10px',
                borderRadius: 14,
                border: '1px solid #e5e7eb',
                background: '#f9f9f9',
                fontSize: 12,
                color: '#1c1c1e',
                width: 160,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              onClick={(e) => e.stopPropagation()}
              style={{
                height: 26,
                padding: '0 12px',
                borderRadius: 14,
                border: 'none',
                background: '#0A84FF',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Run
            </button>
          </div>

          {/* Stage */}
          <div
            style={{
              position: 'absolute',
              transformOrigin: '0 0',
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              width: STAGE_W,
              height: STAGE_H,
            }}
          >
            {/* SVG connectors */}
            <Connectors nodes={nodes} edges={edges} stageWidth={STAGE_W} stageHeight={STAGE_H} />

            {/* Nodes */}
            <div data-node="true">{nodes.map(renderNode)}</div>
          </div>

          {/* ── Bottom toolbar ── */}
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: '6px 8px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              zIndex: 20,
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {[
              { label: '−', title: 'Zoom out', onClick: handleZoomOut },
              { label: '+', title: 'Zoom in', onClick: handleZoomIn },
              { label: '⤢', title: 'Fit to screen', onClick: handleFit },
              { label: '?', title: 'Help', onClick: () => {} },
              { label: '⚙', title: 'Settings', onClick: () => {} },
            ].map((btn) => (
              <button
                key={btn.label}
                title={btn.title}
                onClick={btn.onClick}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: 'none',
                  background: 'none',
                  fontSize: btn.label === '⤢' ? 16 : 18,
                  color: '#3c3c43',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'inherit',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f2f2f7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                {btn.label}
              </button>
            ))}
            <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 2px' }} />
            <span style={{ fontSize: 12, color: '#8e8e93', padding: '0 6px' }}>{Math.round(scale * 100)}%</span>
          </div>

          {/* ── Bottom-right saved indicator ── */}
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              fontSize: 12,
              color: '#8e8e93',
              background: 'rgba(255,255,255,0.85)',
              borderRadius: 8,
              padding: '6px 12px',
              zIndex: 20,
              backdropFilter: 'blur(8px)',
            }}
          >
            ✓ Saved · Last changed Jun 18, 2026 06:00 PM
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
