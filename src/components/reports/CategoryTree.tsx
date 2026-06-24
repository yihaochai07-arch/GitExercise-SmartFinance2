import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

export interface CategoryNode {
  id: string
  name: string
  icon?: string
  color?: string
  amount: number
  percentage: number
  children?: CategoryNode[]
}

interface CategoryTreeProps {
  data: CategoryNode[]
  formatCurrency: (amount: number) => string
  maxDepth?: number
}

export default function CategoryTree({ data, formatCurrency, maxDepth = 3 }: CategoryTreeProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-white/30 text-sm">
        No category data available
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {data.map((node) => (
        <TreeNode key={node.id} node={node} formatCurrency={formatCurrency} depth={0} maxDepth={maxDepth} />
      ))}
    </div>
  )
}

function TreeNode({
  node,
  formatCurrency,
  depth,
  maxDepth,
}: {
  node: CategoryNode
  formatCurrency: (amount: number) => string
  depth: number
  maxDepth: number
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 1) // auto-expand first level
  const hasChildren = node.children && node.children.length > 0
  const canExpand = hasChildren && depth < maxDepth

  return (
    <div>
      <div
        className={`flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors ${
          depth > 0 ? 'ml-6' : ''
        }`}
        style={{ borderLeft: depth > 0 ? `2px solid ${node.color || '#333'}` : 'none' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {canExpand && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/40 hover:text-white/60 transition"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          {node.icon && <span className="text-lg">{node.icon}</span>}
          <span className="text-sm text-white/80 truncate">{node.name}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white/60">{formatCurrency(node.amount)}</span>
          <span className="text-xs text-white/30 w-12 text-right">{node.percentage.toFixed(0)}%</span>
          <div className="w-20 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(node.percentage, 100)}%`,
                backgroundColor: node.color || '#888',
              }}
            />
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-0.5">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              formatCurrency={formatCurrency}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  )
}