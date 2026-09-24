import { useEffect, useMemo, useState } from 'react'
import { academicExperiments, compareResults, detectBehaviors, downloadCsv, generateScenario, getAvailableProcesses, getDecisionAt, getProcessAtTime, processSnapshot, toCsv } from '../lab'

const challenge = { processes: [{ id: 1, name: 'P1', arrival: 0, burst: 8, priority: 2 }, { id: 2, name: 'P2', arrival: 1, burst: 2, priority: 1 }, { id: 3, name: 'P3', arrival: 2, burst: 3, priority: 3 }], algorithm: 'srtf', time: 2, answer: 2 }

export function LabPanel({ processes, results, beforeResults, quantum, onQuantumChange, onApplyProcesses, currentTime, onTimeChange, selectedAlgorithm, onAlgorithmChange, maxTime }) {
  const [generator, setGenerator] = useState({ count: 3, arrivalMax: 10, burstMax: 20, priorityMax: 5, quantum: 3 })
  const [selectedProcess, setSelectedProcess] = useState(processes[0]?.id ?? null)
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('os-scheduler-saved') || '[]'))
  const [challengeAnswer, setChallengeAnswer] = useState(null)
  const [builderItems, setBuilderItems] = useState([])
  const [professorTime, setProfessorTime] = useState(0)
  const [exposure, setExposure] = useState(false)
  const activeResult = results.find(({ algorithm }) => algorithm.key === selectedAlgorithm)?.result ?? results[0]?.result
  const selected = processes.find((process) => process.id === selectedProcess)
  const comparisons = useMemo(() => compareResults(beforeResults, results), [beforeResults, results])
  const observations = useMemo(() => detectBehaviors(processes, results, quantum), [processes, results, quantum])
  const available = activeResult ? getAvailableProcesses(activeResult, processes, currentTime) : []
  const decision = activeResult && selected ? getDecisionAt(activeResult, selected.id, currentTime) : null
  const snapshot = activeResult && selected ? processSnapshot(activeResult, selected.id, currentTime) : null

  useEffect(() => {
    const handleKey = (event) => {
      if (!exposure) return
      if (event.key === 'ArrowRight') onTimeChange(Math.min(maxTime, currentTime + 1))
      if (event.key === 'ArrowLeft') onTimeChange(Math.max(0, currentTime - 1))
      if (event.key === 'Escape') setExposure(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentTime, exposure, maxTime, onTimeChange])

  const saveScenario = () => {
    const next = [{ id: Date.now(), name: `Experimento ${saved.length + 1}`, date: new Date().toLocaleString(), processes, quantum }, ...saved]
    setSaved(next)
    localStorage.setItem('os-scheduler-saved', JSON.stringify(next))
  }
  const deleteSaved = (id) => {
    const next = saved.filter((item) => item.id !== id)
    setSaved(next)
    localStorage.setItem('os-scheduler-saved', JSON.stringify(next))
  }
  const generated = () => {
    onQuantumChange(generator.quantum)
    onApplyProcesses(generateScenario(generator))
  }
  const checkBuilder = () => {
    const expected = activeResult?.timeline.filter((segment) => segment.processId !== 'idle').map((segment) => segment.processId) ?? []
    const correct = JSON.stringify(builderItems) === JSON.stringify(expected)
    window.alert(correct ? '✓ Correcto' : `✗ La secuencia esperada comienza con ${expected[0] ?? 'ningún proceso'}.`)
  }

  return (
    <section className={`lab-section ${exposure ? 'exposure-mode' : ''}`} id="laboratorio">
      {exposure && <div className="exposure-bar">OS SCHEDULER LAB — DEMOSTRACIÓN <button type="button" onClick={() => setExposure(false)}>Salir</button></div>}
      <div className="lab-heading"><div><span className="step-label">WHAT IF? / LABORATORIO DE EXPERIMENTOS</span><h2>Observa qué cambia cuando cambias las condiciones.</h2><p>El escenario original queda como referencia; cada ajuste vuelve a ejecutar todos los algoritmos.</p></div><div className="lab-actions"><button className="button button-dark" type="button" onClick={() => setExposure(true)}>🎤 Modo exposición</button><button className="button button-ghost" type="button" onClick={saveScenario}>Guardar escenario</button></div></div>

      <section className="lab-panel comparison-panel"><div className="lab-panel-title"><div><span className="eyebrow">Antes vs después</span><h3>Comparación objetiva</h3></div><div className="export-actions"><button type="button" onClick={() => downloadCsv('resultados-planificacion.csv', toCsv(results))}>📄 Exportar resultados</button><button type="button" onClick={() => downloadCsv('comparacion-planificacion.csv', [['Algoritmo', 'Métrica', 'Antes', 'Después', 'Cambio'], ...comparisons.flatMap((item) => item.metrics.map((metric) => [item.algorithm.name, metric.key, metric.before, metric.after, metric.delta]))].map((row) => row.join(',')).join('\n'))}>📊 Exportar comparación</button></div></div><div className="comparison-grid"><div><strong>ANTES</strong>{beforeResults.map(({ algorithm, result }) => <p key={algorithm.key}>{algorithm.name}<b>{result.averages.waitingTime.toFixed(1)} u</b></p>)}</div><div><strong>DESPUÉS</strong>{comparisons.map(({ algorithm, metrics }) => { const metric = metrics.find((item) => item.key === 'waitingTime'); return <p key={algorithm.key}>{algorithm.name}<b>{metric.after.toFixed(1)} u <span className={metric.delta > 0 ? 'delta-up' : metric.delta < 0 ? 'delta-down' : 'delta-same'}>{metric.delta > 0 ? '↑' : metric.delta < 0 ? '↓' : '→'} {Math.abs(metric.delta).toFixed(1)}</span></b></p> })}</div></div></section>

      <section className="lab-panel quantum-panel"><div><span className="eyebrow">Round Robin / experimento directo</span><h3>QUANTUM <output>{quantum}</output></h3><input aria-label="Quantum de Round Robin" type="range" min="1" max="10" value={quantum} onChange={(event) => onQuantumChange(Number(event.target.value))} /><div className="range-labels"><span>1</span><span>10</span></div></div><p>{quantum <= 2 ? `Con quantum ${quantum}, los turnos son pequeños y Round Robin registra ${results.find(({ algorithm }) => algorithm.key === 'rr')?.result.averages.contextSwitches ?? 0} cambios de contexto.` : quantum >= 7 ? `Con quantum ${quantum}, los turnos son amplios y Round Robin se acerca al comportamiento de una cola por llegada.` : `Con quantum ${quantum}, cada proceso recibe turnos intermedios; observa el Gantt y los ${results.find(({ algorithm }) => algorithm.key === 'rr')?.result.averages.contextSwitches ?? 0} cambios de contexto reales.`}</p></section>

      <section className="lab-panel timeline-panel"><div className="lab-panel-title"><div><span className="eyebrow">Timeline global</span><h3>Todos enfrentan el mismo tiempo</h3></div><output>t = {currentTime}</output></div><input aria-label="Cursor temporal global" className="timeline-slider" type="range" min="0" max={maxTime} value={currentTime} onChange={(event) => onTimeChange(Number(event.target.value))} /><div className="global-timeline">{Array.from({ length: maxTime + 1 }, (_, time) => <button type="button" key={time} className={time === currentTime ? 'time-active' : ''} onClick={() => onTimeChange(time)}>{time}</button>)}</div><div className="algorithm-state-grid">{results.map(({ algorithm, result }) => <button type="button" key={algorithm.key} className="algorithm-state" onClick={() => onAlgorithmChange(algorithm.key)}><strong>{algorithm.name}</strong><span>CPU → {getProcessAtTime(result, currentTime) ? processes.find((process) => process.id === getProcessAtTime(result, currentTime))?.name : 'libre'}</span><small>Cola → {getAvailableProcesses(result, processes, currentTime).filter((process) => !process.selected).map((process) => process.name).join(', ') || 'vacía'}</small></button>)}</div></section>

      <div className="lab-two-columns"><section className="lab-panel decision-panel"><div className="lab-panel-title"><div><span className="eyebrow">Decisión del algoritmo</span><h3>¿Por qué estaba ejecutándose {selected?.name ?? '...' }?</h3></div><select aria-label="Algoritmo inspeccionado" value={selectedAlgorithm} onChange={(event) => onAlgorithmChange(event.target.value)}>{results.map(({ algorithm }) => <option key={algorithm.key} value={algorithm.key}>{algorithm.name}</option>)}</select></div><p><strong>TIEMPO:</strong> t = {currentTime} · <strong>PROCESO:</strong> {getProcessAtTime(activeResult, currentTime) ? processes.find((process) => process.id === getProcessAtTime(activeResult, currentTime))?.name : 'CPU libre'}</p><div className="decision-box"><strong>DECISIÓN</strong><span>{decision?.explanation || 'Mueve el cursor hasta una decisión real del timeline.'}</span></div><strong>PROCESOS DISPONIBLES</strong><ul>{available.map((process) => <li key={process.id}>{process.name} → {process.remaining} unidades restantes {process.selected && <b> ← CPU</b>}</li>)}</ul></section><section className="lab-panel inspector-panel"><div className="lab-panel-title"><div><span className="eyebrow">Inspector de procesos</span><h3>Elige un proceso</h3></div><select aria-label="Proceso inspeccionado" value={selectedProcess ?? ''} onChange={(event) => setSelectedProcess(Number(event.target.value))}>{processes.map((process) => <option key={process.id} value={process.id}>{process.name}</option>)}</select></div>{snapshot && <><div className="process-inspector-head"><span style={{ '--process-color': selected.color }}>{selected.name}</span><strong>{snapshot.waitingTime} u espera</strong></div><div className="status-list"><span className={snapshot.arrived ? 'done' : ''}>✓ Llegó</span><span className={snapshot.waiting ? 'done' : ''}>✓ Esperó</span><span className={snapshot.running ? 'done' : ''}>✓ Ejecutándose</span><span className={snapshot.completed ? 'done' : ''}>✓ Terminado</span></div><div className="inspector-metrics"><span>Respuesta <b>{snapshot.responseTime}</b></span><span>Finalización <b>{snapshot.completionTime}</b></span><span>Turnaround <b>{snapshot.turnaroundTime}</b></span></div></>}</section></div>

      {observations.length > 0 && <section className="lab-panel observations"><div><span className="eyebrow">Detector de comportamientos</span><h3>Lo que está ocurriendo en los datos</h3></div><div className="observation-grid">{observations.map((observation) => <article key={observation.title}><span>{observation.icon}</span><strong>{observation.title}</strong><p>{observation.text}</p></article>)}</div></section>}

      <section className="lab-panel generator-panel"><div className="lab-panel-title"><div><span className="eyebrow">🎲 Generador de escenarios</span><h3>Crea una carga para investigar</h3></div><button className="button button-dark" type="button" onClick={() => onApplyProcesses(generateScenario({ count: 3 + Math.floor(Math.random() * 4), arrivalMax: 10, burstMax: 20, priorityMax: 5 }))}>🎲 Sorpréndeme</button></div><div className="generator-fields">{[['count', 'Procesos', 1, 8], ['arrivalMax', 'Llegada máxima', 0, 20], ['burstMax', 'Ráfaga máxima', 1, 30], ['priorityMax', 'Prioridad máxima', 1, 9], ['quantum', 'Quantum', 1, 10]].map(([key, label, min, max]) => <label key={key}>{label}<input type="number" min={min} max={max} value={generator[key]} onChange={(event) => setGenerator({ ...generator, [key]: Number(event.target.value) })} /></label>)}<button className="button button-dark" type="button" onClick={generated}>GENERAR ESCENARIO</button></div></section>

      <section className="academic-section"><div className="lab-heading"><div><span className="step-label">🧪 EXPERIMENTOS ACADÉMICOS</span><h2>Preguntas listas para investigar</h2></div></div><div className="academic-grid">{academicExperiments.map((experiment) => <button type="button" className="academic-card" key={experiment.id} onClick={() => { onQuantumChange(experiment.quantum ?? quantum); onApplyProcesses(experiment.processes) }}><span>{experiment.icon}</span><strong>{experiment.title}</strong><small>{experiment.objective}</small><b>Ejecutar experimento →</b></button>)}</div></section>

      <div className="lab-two-columns"><section className="lab-panel challenge-panel"><span className="eyebrow">🎯 Modo reto</span><h3>¿Qué proceso ejecutará SRTF en t=2?</h3><p>P1: 0 / 8 · P2: 1 / 2 · P3: 2 / 3</p><div className="challenge-options">{challenge.processes.map((process) => <button type="button" key={process.id} onClick={() => setChallengeAnswer(process.id)} className={challengeAnswer === process.id ? (process.id === challenge.answer ? 'correct' : 'wrong') : ''}>{process.name}</button>)}</div>{challengeAnswer && <div className="challenge-result"><strong>{challengeAnswer === challenge.answer ? '✓ Respuesta: P2' : '✗ La respuesta es P2'}</strong><span>P2 tiene el menor tiempo restante entre los procesos disponibles en t=2.</span></div>}</section><section className="lab-panel builder-panel"><span className="eyebrow">🧱 Construye el Gantt</span><h3>Ordena FCFS y comprueba tu hipótesis</h3><div className="builder-source">{processes.map((process) => <button draggable key={process.id} type="button" onClick={() => setBuilderItems([...builderItems, process.id])}>{process.name}</button>)}</div><div className="builder-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => setBuilderItems([...builderItems, Number(event.dataTransfer.getData('processId'))])}>{builderItems.map((id, index) => <span key={`${id}-${index}`}>{processes.find((process) => process.id === id)?.name}</span>)}</div><button className="button button-dark" type="button" onClick={checkBuilder}>COMPROBAR</button></section></div>

      <div className="lab-two-columns"><section className="lab-panel professor-panel"><span className="eyebrow">🐢 Modo profesor</span><h3>Una decisión a la vez</h3><input aria-label="Tiempo del modo profesor" type="range" min="0" max={maxTime} value={professorTime} onChange={(event) => setProfessorTime(Number(event.target.value))} /><p><strong>TIEMPO: {professorTime}</strong> · {getDecisionAt(activeResult, getProcessAtTime(activeResult, professorTime), professorTime)?.explanation || 'Avanza hasta una selección de CPU.'}</p><button className="button button-dark" type="button" onClick={() => setProfessorTime((time) => Math.min(maxTime, time + 1))}>CONTINUAR</button></section><section className="lab-panel map-panel"><span className="eyebrow">Mapa visual del sistema operativo</span><div className="system-map"><span>USUARIO</span><i>↓</i><span>PROCESOS</span><i>↓</i><span>COLA DE LISTOS</span><i>↓</i><strong>PLANIFICADOR {activeResult?.algorithm}</strong><small>{selectedAlgorithm === 'fcfs' ? 'Buscando el proceso que llegó primero...' : selectedAlgorithm === 'srtf' ? 'Buscando el menor tiempo restante...' : selectedAlgorithm === 'rr' ? 'Asignando el siguiente quantum...' : 'Aplicando la regla seleccionada...'}</small><i>↓</i><span>CPU → {getProcessAtTime(activeResult, currentTime) ? processes.find((process) => process.id === getProcessAtTime(activeResult, currentTime))?.name : 'libre'}</span><i>↓</i><span>PROCESO TERMINADO</span></div></section></div>

      <section className="lab-panel saved-panel"><div className="lab-panel-title"><div><span className="eyebrow">Mis experimentos</span><h3>Escenarios guardados</h3></div><span>{saved.length} guardados</span></div>{saved.length === 0 ? <p>Aún no hay escenarios guardados.</p> : saved.map((item) => <div className="saved-row" key={item.id}><strong>{item.name}</strong><small>{item.date} · {item.processes.length} procesos · q={item.quantum}</small><button type="button" onClick={() => { onQuantumChange(item.quantum); onApplyProcesses(item.processes) }}>Cargar</button><button type="button" onClick={() => deleteSaved(item.id)}>Eliminar</button></div>)}</section>
    </section>
  )
}
