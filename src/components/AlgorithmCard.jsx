import { GanttChart } from './GanttChart'

export function AlgorithmCard({ algorithm, result, processes, quantum, maxTime, currentTime, active, onSelect }) {

  return (
    <article className={`algorithm-card accent-${algorithm.accent} ${active ? 'selected' : ''}`} onClick={onSelect}>
      <div className="card-topline">
        <div>
          <span className="algorithm-index">{algorithm.index}</span>
          <h3>{algorithm.name}</h3>
          <p>{algorithm.detail}{algorithm.key === 'rr' && <span className="quantum-badge">q = {quantum}</span>}</p>
        </div>
        <span className="live-dot">Listo</span>
      </div>
      <GanttChart segments={result.timeline} processes={processes} maxTime={maxTime} currentTime={currentTime} />
      <div className="metric-row">
        <div><span>Espera promedio</span><strong>{result.averages.waitingTime.toFixed(1)} <small>u</small></strong></div>
        <div><span>Retorno promedio</span><strong>{result.averages.turnaroundTime.toFixed(1)} <small>u</small></strong></div>
      </div>
      <div className="secondary-metrics"><span>Respuesta <b>{result.averages.responseTime.toFixed(1)}</b></span><span>Cambios <b>{result.averages.contextSwitches}</b></span><span>CPU <b>{result.averages.cpuUtilization.toFixed(0)}%</b></span></div>
      <button className="why-button" type="button" onClick={(event) => { event.stopPropagation(); onSelect() }}>¿Por qué pasó esto? →</button>
    </article>
  )
}
