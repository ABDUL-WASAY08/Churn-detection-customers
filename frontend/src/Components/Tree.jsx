import { useMemo } from 'react';
import { Activity, Loader2, TreePine, AlertTriangle } from 'lucide-react';
import { trainDataStore } from '../zustand/traningdataState';

const NODE_W = 180;
const NODE_H = 92;
const LEVEL_H = 165;
const GAP = 44;
const PAD = 24;

// ---------- layout helpers ----------
function measure(node) {
  if (!node) return { leaves: 0, depth: 0 };
  if (node.leaf) return { leaves: 1, depth: 1 };
  const l = measure(node.left);
  const r = measure(node.right);
  return { leaves: l.leaves + r.leaves, depth: 1 + Math.max(l.depth, r.depth) };
}

function layoutTree(root) {
  const placed = [];
  const meta = measure(root);

  function place(n, startUnit, y) {
    if (n.leaf) {
      n.pos = { u: startUnit + 0.5, y };
      placed.push(n);
      return startUnit + 1;
    }
    const leftEnd = place(n.left, startUnit, y + 1);
    const rightEnd = place(n.right, leftEnd, y + 1);
    n.pos = { u: (startUnit + rightEnd) / 2, y };
    placed.push(n);
    return rightEnd;
  }

  place(root, 0, 0);

  const stride = NODE_W + GAP;
  const width = Math.max(1, meta.leaves - 1) * stride + NODE_W + PAD * 2;
  const height = meta.depth * LEVEL_H + PAD * 2;
  const px = (u) => PAD + u * stride;

  const nodes = placed.map((n) => {
    const cx = px(n.pos.u);
    const cy = PAD + n.pos.y * LEVEL_H;
    return { node: n, cx, cy, x: cx - NODE_W / 2, y: cy };
  });

  const edges = [];
  const byPos = new Map(nodes.map((n) => [n.node, n]));

  for (const n of placed) {
    if (n.leaf) continue;
    const p = byPos.get(n);
    const lc = byPos.get(n.left);
    const rc = byPos.get(n.right);
    edges.push({
      from: p,
      to: lc,
      kind: 'left',
      label: `≤ ${n.threshold ?? ''}`.trim(),
    });
    edges.push({
      from: p,
      to: rc,
      kind: 'right',
      label: `> ${n.threshold ?? ''}`.trim(),
    });
  }

  return { nodes, edges, width, height, leaves: meta.leaves, depth: meta.depth };
}

// ---------- value helpers ----------
// tree_.value at a node is [[class_0_count, class_1_count]]
// class 0 = No Churn, class 1 = Churn
function distribution(node) {
  const raw = node?.value?.[0] ?? [0, 0];
  const noChurn = Number(raw[0]) || 0;
  const churn = Number(raw[1]) || 0;
  const total = noChurn + churn;
  const pctChurn = total ? Math.round((churn / total) * 100) : 0;
  const pctNo = 100 - pctChurn;
  return { noChurn, churn, total, pctChurn, pctNo, isLeaf: Boolean(node.leaf) };
}

function edgePath(from, to) {
  const x1 = from.cx;
  const y1 = from.y + NODE_H;
  const x2 = to.cx;
  const y2 = to.y;
  const mid = (y1 + y2) / 2;
  const bend = 0.5;
  const dx = (x2 - x1) * bend;
  return `M ${x1} ${y1} C ${x1 + dx} ${mid}, ${x2 - dx} ${mid}, ${x2} ${y2}`;
}

// ---------- node rendering ----------
function NodeShape({ node, cx, y }) {
  const d = distribution(node);
  const isLeaf = node.leaf;
  const gini = node.impurity;

  const decisionColor = 'rgba(14, 165, 233, 1)'; // sky
  const leafMajority = d.churn >= d.noChurn;

  const splitLabel = node.feature
    ? `${node.feature} ≤ ${node.threshold}`
    : '';

  const labels = [];
  if (isLeaf) {
    labels.push(
      leafMajority
        ? { t: 'Churn', weight: 'bold', color: 'text-red-600' }
        : { t: 'No Churn', weight: 'bold', color: 'text-emerald-600' },
    );
    labels.push({ t: `${d.total.toLocaleString()} samples`, color: 'text-slate-500' });
    labels.push({ t: `${d.pctChurn}% churn`, color: 'text-slate-600', mono: true });
  }

  return (
    <g>
      {/* node card */}
      <rect
        x={cx - NODE_W / 2}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx="10"
        fill={isLeaf ? '#f8fafc' : '#f0f9ff'}
        stroke={isLeaf ? (leafMajority ? '#dc2626' : '#10b981') : decisionColor}
        strokeWidth="2"
      />

      {!isLeaf && (
        <rect
          x={cx - NODE_W / 2}
          y={y}
          width={NODE_W}
          height={30}
          rx="10"
          fill={decisionColor}
        />
      )}

      {/* header text */}
      <text
        x={cx}
        y={isLeaf ? y + 20 : y + 20}
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill={isLeaf ? (leafMajority ? '#dc2626' : '#10b981') : '#ffffff'}
      >
        {isLeaf ? (leafMajority ? 'Churn' : 'No Churn') : splitLabel}
      </text>

      <text x={cx} y={y + 42} textAnchor="middle" fontSize="11" fill="#475569">
        {d.total.toLocaleString()} samples
      </text>

      {!isLeaf && gini !== undefined && (
        <text x={cx} y={y + 58} textAnchor="middle" fontSize="11" fill="#64748b">
          gini {gini}
        </text>
      )}

      {/* distribution bar */}
      <g>
        <rect
          x={cx - NODE_W / 2 + 14}
          y={y + (isLeaf ? 64 : 72)}
          width={NODE_W - 28}
          height="8"
          rx="4"
          fill="#e2e8f0"
        />
        <rect
          x={cx - NODE_W / 2 + 14}
          y={y + (isLeaf ? 64 : 72)}
          width={(NODE_W - 28) * (d.pctChurn / 100)}
          height="8"
          rx="4"
          fill="#ef4444"
        />
        <rect
          x={cx - NODE_W / 2 + 14 + (NODE_W - 28) * (d.pctChurn / 100)}
          y={y + (isLeaf ? 64 : 72)}
          width={(NODE_W - 28) * (d.pctNo / 100)}
          height="8"
          rx="4"
          fill="#10b981"
        />
      </g>
    </g>
  );
}

// ---------- main component ----------
export const Tree = () => {
  const { tree, treeLoading, status } = trainDataStore();

  const top = useMemo(() => (tree && tree.tree ? tree.tree : null), [tree]);
  const layout = useMemo(() => (top ? layoutTree(top) : null), [top]);

  if (treeLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <Header />
        <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Building tree layout…
        </div>
      </div>
    );
  }

  if (!top) {
    const hasError = Boolean(tree?.error);
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <Header />
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
          {hasError ? (
            <>
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <p className="text-sm">{tree.error}</p>
              <p className="text-xs">Run training first, then this tree will appear here.</p>
            </>
          ) : (
            <>
              <TreePine className="w-8 h-8 text-slate-300" />
              <p className="text-sm">
                Train the model to visualize the first tree of the Random Forest here.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const trainingDone =
    typeof status?.status === 'string' && status.status.startsWith('completed');

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <Header extra={`• ${layout.leaves} leaves • depth ${layout.depth}${tree?.maxDepthShown ? ` (capped at ${tree.maxDepthShown})` : ''}${tree?.nEstimators ? ` • RF with ${tree.nEstimators} trees` : ''}`} />

      {!trainingDone && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          <Activity className="w-3.5 h-3.5" />
          This reflects the most recently completed training run.
        </div>
      )}

      <div className="overflow-auto border border-slate-100 rounded-lg bg-slate-50/60">
        <svg
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="min-w-full"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
          </defs>

          {layout.edges.map((e, i) => (
            <g key={`e${i}`}>
              <path
                d={edgePath(e.from, e.to)}
                fill="none"
                stroke={e.kind === 'left' ? '#0ea5e9' : '#f59e0b'}
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />
              <text
                x={(e.from.cx + e.to.cx) / 2 - (e.kind === 'left' ? 26 : -26)}
                y={(e.from.y + NODE_H + e.to.y) / 2}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill={e.kind === 'left' ? '#0284c7' : '#d97706'}
              >
                {e.label}
              </text>
            </g>
          ))}

          {layout.nodes.map((n, i) => (
            <NodeShape key={`n${i}`} node={n.node} cx={n.cx} y={n.y} />
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-sky-500" /> Split node
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-600" /> No Churn (majority)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-600" /> Churn (majority)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-300" /> No Churn
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-400" /> Churn
        </span>
      </div>
    </div>
  );

  function Header({ extra }) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <TreePine className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-semibold text-slate-800">
          Decision Tree Visualization
        </h2>
        {extra && <span className="text-xs text-slate-400 font-normal">{extra}</span>}
      </div>
    );
  }
};