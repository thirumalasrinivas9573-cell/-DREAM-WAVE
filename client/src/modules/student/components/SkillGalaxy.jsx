import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Skill Galaxy — Interactive skill node graph ──────────────────────────────
// Renders skills as orbiting nodes with locked/current/completed states.

const LEVEL_COLORS = {
  Beginner:     { main: '#6366F1', glow: 'rgba(99,102,241,0.4)',  bg: 'rgba(99,102,241,0.12)'   },
  Intermediate: { main: '#A855F7', glow: 'rgba(168,85,247,0.4)',  bg: 'rgba(168,85,247,0.12)'   },
  Advanced:     { main: '#EC4899', glow: 'rgba(236,72,153,0.4)',  bg: 'rgba(236,72,153,0.12)'   },
  Expert:       { main: '#F59E0B', glow: 'rgba(245,158,11,0.4)',  bg: 'rgba(245,158,11,0.12)'   },
}

function SkillNode({ skill, status, x, y, color, size = 52, onClick, isSelected }) {
  const glow = color.glow
  const isLocked    = status === 'locked'
  const isCurrent   = status === 'current'
  const isCompleted = status === 'completed'

  return (
    <motion.g
      style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
      onClick={() => !isLocked && onClick(skill)}
    >
      {/* Pulse ring for current node */}
      {isCurrent && (
        <motion.circle
          cx={x} cy={y} r={size / 2 + 8}
          fill="none" stroke={color.main} strokeWidth={1.5}
          animate={{ r: [size / 2 + 8, size / 2 + 18, size / 2 + 8], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {/* Glow halo */}
      {!isLocked && (
        <motion.circle
          cx={x} cy={y} r={size / 2 + 4}
          fill={glow}
          animate={isCurrent
            ? { r: [size / 2 + 4, size / 2 + 8, size / 2 + 4], opacity: [0.5, 0.9, 0.5] }
            : isSelected
              ? { opacity: [0.5, 1, 0.5] }
              : { opacity: 0.3 }
          }
          transition={{ duration: isCurrent ? 2 : 2.5, repeat: Infinity }}
        />
      )}
      {/* Node circle */}
      <motion.circle
        cx={x} cy={y}
        r={isSelected ? size / 2 + 3 : size / 2}
        fill={
          isCompleted
            ? `url(#grad-completed-${skill.name?.replace(/\s+/g, '')})`
            : isCurrent
              ? `url(#grad-current-${skill.name?.replace(/\s+/g, '')})`
              : isLocked
                ? 'rgba(30,30,50,0.9)'
                : color.bg
        }
        stroke={isLocked ? 'rgba(255,255,255,0.08)' : isSelected ? color.main : `${color.main}88`}
        strokeWidth={isSelected ? 2.5 : 1.5}
        style={{ filter: !isLocked ? `drop-shadow(0 0 8px ${color.glow})` : 'none' }}
        whileHover={!isLocked ? { scale: 1.12 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      />
      {/* Gradients */}
      <defs>
        <radialGradient id={`grad-completed-${skill.name?.replace(/\s+/g, '')}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </radialGradient>
        <radialGradient id={`grad-current-${skill.name?.replace(/\s+/g, '')}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor={color.main} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color.main} stopOpacity="0.5" />
        </radialGradient>
      </defs>
      {/* Icon / content */}
      {isCompleted ? (
        <text x={x} y={y + 6} textAnchor="middle" fontSize={size * 0.45} fill="white" style={{ userSelect: 'none' }}>✓</text>
      ) : isLocked ? (
        <text x={x} y={y + 6} textAnchor="middle" fontSize={size * 0.38} fill="rgba(255,255,255,0.2)" style={{ userSelect: 'none' }}>🔒</text>
      ) : (
        <text x={x} y={y + 5} textAnchor="middle" fontSize={size * 0.32} fill={color.main} fontWeight="700" style={{ userSelect: 'none' }}>
          {skill.name?.slice(0, 2).toUpperCase() || '??'}
        </text>
      )}
      {/* Label below */}
      <text
        x={x} y={y + size / 2 + 16}
        textAnchor="middle"
        fontSize={11}
        fill={isLocked ? 'rgba(255,255,255,0.25)' : isCompleted ? '#34D399' : isCurrent ? color.main : 'rgba(255,255,255,0.7)'}
        fontFamily="Inter, sans-serif"
        fontWeight={isCurrent || isSelected ? '700' : '400'}
        style={{ userSelect: 'none' }}
      >
        {skill.name && skill.name.length > 12 ? skill.name.slice(0, 12) + '…' : skill.name}
      </text>
    </motion.g>
  )
}

function ConnectionLine({ x1, y1, x2, y2, color, opacity = 0.3, animated = false }) {
  const d = `M ${x1} ${y1} L ${x2} ${y2}`
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth={1.5}
      strokeOpacity={opacity}
      strokeDasharray={animated ? '4 4' : 'none'}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
    />
  )
}

export default function SkillGalaxy({ skills = [], currentSkillName = null }) {
  const [selected, setSelected] = useState(null)
  const [viewBox, setViewBox]   = useState({ w: 800, h: 500 })
  const svgRef = useRef(null)

  useEffect(() => {
    const update = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        setViewBox({ w: Math.max(600, rect.width), h: Math.max(400, rect.height) })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Assign status and layout positions
  const nodesWithPos = useMemo(() => {
    if (!skills.length) return []

    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    const byLevel = {}
    levels.forEach(l => { byLevel[l] = skills.filter(s => s.level === l) })

    // Find first incomplete skill to mark as 'current'
    const flatSkills = levels.flatMap(l => byLevel[l])
    let foundCurrent = false

    const w = viewBox.w
    const h = viewBox.h

    const positioned = []

    levels.forEach((level, li) => {
      const group = byLevel[level]
      if (!group.length) return

      const color = LEVEL_COLORS[level] || LEVEL_COLORS.Beginner
      const yBand = (h / levels.length) * li + h / (levels.length * 2)

      group.forEach((skill, si) => {
        const xStart = 80
        const xEnd = w - 80
        const xStep = (xEnd - xStart) / Math.max(group.length, 1)
        const x = xStart + xStep * si + xStep / 2
        const y = yBand + (si % 2 === 0 ? -20 : 20) // slight zigzag

        // Determine status
        const isCurrentByName = currentSkillName && skill.name === currentSkillName
        let status
        if (isCurrentByName) {
          status = 'current'
          foundCurrent = true
        } else if (!foundCurrent) {
          status = 'completed'
        } else {
          // Mark the very next one after current as 'current' if none provided
          if (!currentSkillName && !foundCurrent) {
            status = 'current'
            foundCurrent = true
          } else {
            status = 'locked'
          }
        }

        positioned.push({ skill, status, x, y, color, level })
      })
    })

    // If no current was found and no name provided, make first one current
    if (!foundCurrent && positioned.length > 0) {
      positioned[0].status = 'current'
    }

    return positioned
  }, [skills, currentSkillName, viewBox.w, viewBox.h])

  const selectedNode = nodesWithPos.find(n => n.skill.name === selected?.name)

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        position: 'relative',
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,0.06), transparent 70%), rgba(9,9,11,0.9)',
        border: '1px solid var(--border-purple)',
        borderRadius: 'var(--r-xl)',
        overflow: 'hidden',
        minHeight: 460,
      }}>
        {/* Stars background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 40 }, (_, i) => (
            <motion.div key={i}
              animate={{ opacity: [0.1, 0.6, 0.1] }}
              transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
              style={{
                position: 'absolute',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: Math.random() > 0.8 ? 3 : 2,
                height: Math.random() > 0.8 ? 3 : 2,
                borderRadius: '50%',
                background: 'white',
              }}
            />
          ))}
        </div>

        {/* Level labels */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-around',
          padding: '30px 0', pointerEvents: 'none', zIndex: 2,
        }}>
          {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((lvl, i) => (
            skills.filter(s => s.level === lvl).length > 0 && (
              <div key={lvl} style={{
                writingMode: 'vertical-lr', textOrientation: 'mixed',
                fontSize: '0.65rem', fontWeight: 700,
                color: LEVEL_COLORS[lvl]?.main || '#8B5CF6',
                padding: '0 10px', opacity: 0.6, letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {lvl}
              </div>
            )
          ))}
        </div>

        {/* SVG Canvas */}
        <svg
          ref={svgRef}
          style={{ width: '100%', height: 460, display: 'block' }}
          viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connection lines between sequential nodes */}
          {nodesWithPos.map((node, i) => {
            if (i === 0) return null
            const prev = nodesWithPos[i - 1]
            if (node.level !== prev.level) return null // only connect within levels
            const isActive = prev.status !== 'locked' && node.status !== 'locked'
            return (
              <ConnectionLine
                key={`line-${i}`}
                x1={prev.x} y1={prev.y}
                x2={node.x} y2={node.y}
                color={isActive ? node.color.main : 'rgba(255,255,255,0.08)'}
                opacity={isActive ? 0.35 : 0.1}
                animated={prev.status === 'current' || node.status === 'current'}
              />
            )
          })}

          {/* Skill nodes */}
          {nodesWithPos.map((n, i) => (
            <SkillNode
              key={n.skill.name + i}
              skill={n.skill}
              status={n.status}
              x={n.x}
              y={n.y}
              color={n.color}
              size={n.status === 'current' ? 58 : n.status === 'completed' ? 50 : 46}
              onClick={setSelected}
              isSelected={selected?.name === n.skill.name}
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12, padding: '0 4px' }}>
        {[
          { status: 'completed', label: 'Completed', color: '#10B981', icon: '✓' },
          { status: 'current',   label: 'Current',   color: '#8B5CF6', icon: '●' },
          { status: 'locked',    label: 'Locked',    color: '#475569', icon: '🔒' },
        ].map(({ status, label, color, icon }) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              background: status === 'completed' ? '#10B981' : status === 'current' ? '#8B5CF6' : 'rgba(255,255,255,0.08)',
              border: status === 'locked' ? '1px solid rgba(255,255,255,0.1)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: 'white',
            }}>
              {status === 'locked' ? '' : status === 'completed' ? '✓' : ''}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {nodesWithPos.filter(n => n.status === 'completed').length}/{nodesWithPos.length} mastered
        </span>
      </div>

      {/* Selected skill detail panel */}
      <AnimatePresence>
        {selected && selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            style={{
              marginTop: 16,
              background: `linear-gradient(135deg, ${selectedNode.color.bg}, rgba(13,13,23,0.9))`,
              border: `1px solid ${selectedNode.color.main}33`,
              borderRadius: 'var(--r-lg)',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: selectedNode.color.main }}>
                    {selected.name}
                  </span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999,
                    background: `${selectedNode.color.main}18`, color: selectedNode.color.main,
                    border: `1px solid ${selectedNode.color.main}30`,
                  }}>
                    {selectedNode.status === 'completed' ? '✓ Mastered' : selectedNode.status === 'current' ? '● Active' : '🔒 Locked'}
                  </span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 600, padding: '2px 10px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}>
                    {selected.level}
                  </span>
                  {selected.priority && (
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600, padding: '2px 10px', borderRadius: 999,
                      background: 'rgba(245,158,11,0.1)', color: '#FBBF24',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}>
                      {selected.priority} Priority
                    </span>
                  )}
                </div>
                {selected.resources && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                    📚 {selected.resources}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', padding: 4, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
