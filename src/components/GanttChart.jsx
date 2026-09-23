export function GanttChart({ segments, processes, maxTime, currentTime }) {
  const total = maxTime || Math.max(...segments.map((segment) => segment.end), 1)
  const colors = Object.fromEntries(processes.map((process) => [process.id, process.color]))

  return (
    <div className="gantt-wrap">
      <div className="gantt" aria-label="Diagrama de Gantt">
        {segments.map((segment, index) => {
          const width = ((segment.end - segment.start) / total) * 100
          const label = segment.processId === 'idle' ? '—' : processes.find((process) => process.id === segment.processId)?.name
          return (
            <div key={`${segment.processId}-${segment.start}-${index}`} className={`gantt-segment ${segment.processId === 'idle' ? 'idle' : ''} ${currentTime >= segment.start && currentTime < segment.end ? 'current' : ''}`} style={{ width: `${width}%`, '--process-color': colors[segment.processId] }} title={`${label}: ${segment.start} - ${segment.end} · Duración: ${segment.end - segment.start}`}>
              {width > 8 && <strong>{label}</strong>}
            </div>
          )
        })}
      </div>
      <div className="gantt-axis"><span>0</span><span>{total}</span></div>
    </div>
  )
}
