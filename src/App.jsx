import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { AlgorithmCard } from './components/AlgorithmCard'
import { ProcessTable } from './components/ProcessTable'
import { algorithms } from './algorithms'
import { exampleProcesses, scenarios } from './data/scenarios'

function App() {
  const [processes, setProcesses] = useState(exampleProcesses)
  const [quantum, setQuantum] = useState(2)
  const [hasRun, setHasRun] = useState(false)
  const [simulations, setSimulations] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [explainMode, setExplainMode] = useState(false)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('fcfs')
  const [showLearn, setShowLearn] = useState(false)

  const results = useMemo(() => algorithms.map((algorithm) => ({ algorithm, result: algorithm.run(processes, quantum) })), [processes, quantum])
  const maxTime = Math.max(...results.flatMap(({ result }) => result.timeline.map((segment) => segment.end)), 1)
  const activeResult = results.find(({ algorithm }) => algorithm.key === selectedAlgorithm)?.result
  const currentEvent = activeResult?.events.filter((event) => event.time <= currentTime).at(-1) ?? activeResult?.events[0]

  useEffect(() => {
    if (!isPlaying) return undefined
    const timer = window.setInterval(() => setCurrentTime((time) => {
      if (time >= maxTime) { setIsPlaying(false); return time }
      return time + 1
    }), 650)
    return () => window.clearInterval(timer)
  }, [isPlaying, maxTime])

  const runSimulation = () => {
    setHasRun(true)
    setSimulations((count) => count + 1)
    setCurrentTime(0)
    setIsPlaying(false)
  }
  const addProcess = () => {
    const nextId = Math.max(...processes.map((process) => process.id), 0) + 1
    const colors = ['#67e8c4', '#ffae64', '#f48caa', '#8ab4ff', '#e7d66b', '#c5a6ed']
    setProcesses([...processes, { id: nextId, name: `P${nextId}`, arrival: nextId - 1, burst: 3, priority: 2, color: colors[(nextId - 1) % colors.length] }])
    setHasRun(false)
  }
  const clearProcesses = () => { setProcesses([]); setHasRun(false); setCurrentTime(0) }
  const generateRandom = () => {
    const colors = ['#67e8c4', '#ffae64', '#f48caa', '#8ab4ff', '#e7d66b', '#c5a6ed']
    const randomProcesses = Array.from({ length: 5 }, (_, index) => ({ id: index + 1, name: `P${index + 1}`, arrival: index === 0 ? 0 : Math.floor(Math.random() * 5), burst: Math.floor(Math.random() * 7) + 1, priority: Math.floor(Math.random() * 4) + 1, color: colors[index] }))
    setProcesses(randomProcesses.sort((left, right) => left.id - right.id)); setHasRun(false); setCurrentTime(0)
  }
  const reset = () => { setProcesses(exampleProcesses); setQuantum(2); setHasRun(false); setCurrentTime(0); setIsPlaying(false) }
  const loadScenario = (scenario) => { setProcesses(scenario.processes); setHasRun(false); setCurrentTime(0); document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' }) }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="OS Scheduler Lab inicio"><span className="brand-mark">OS</span><span>OS Scheduler Lab</span></a>
        <div className="topbar-meta"><span className="status-dot" /> Centro de control <span className="version">v1.0</span></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy"><span className="eyebrow">Laboratorio interactivo de sistemas operativos <span className="spark">✦</span></span><h1>Visualiza cómo<br /><em>piensa un sistema operativo.</em></h1><p>Procesos reales, decisiones visibles. Carga una vez y observa seis estrategias compartir la misma CPU.</p><div className="hero-actions"><a className="button button-dark" href="#simulator">Crear simulación ↓</a><button className="button button-ghost" type="button" onClick={() => setShowLearn((value) => !value)}>◎ Aprender</button></div></div>
        <div className="hero-orbit" aria-hidden="true"><span className="orbit-ring ring-one" /><span className="orbit-ring ring-two" /><span className="orbit-core">CPU</span><span className="orbit-label label-one">input</span><span className="orbit-label label-two">decision</span></div>
      </section>

      <section className="stats-strip"><div><strong>{processes.length}</strong><span>Procesos creados</span></div><div><strong>06</strong><span>Algoritmos disponibles</span></div><div><strong>{simulations}</strong><span>Simulaciones ejecutadas</span></div><div className="stats-message">Una entrada compartida.<br /><em>Seis formas de decidir.</em></div></section>

      <div className="workspace" id="simulator">
        <div className="section-intro"><div><span className="step-label">PASO 01 / CREAR</span><h2>Prepara la carga de trabajo</h2><p>Estos son los trabajos que esperan usar la CPU. Puedes cambiar sus datos o cargar un escenario.</p></div><span className="info-tip" title="Todos los algoritmos reciben exactamente estos mismos procesos.">?</span></div>
        <ProcessTable processes={processes} onChange={(next) => { setProcesses(next); setHasRun(false) }} onAdd={addProcess} onReset={reset} onRemove={(id) => { setProcesses(processes.filter((process) => process.id !== id)); setHasRun(false) }} onClear={clearProcesses} onExample={() => { setProcesses(exampleProcesses); setHasRun(false) }} onRandom={generateRandom} />
        <section className="settings-bar"><div><span className="eyebrow">Paso 02 / Configurar</span><strong>Parámetros de la simulación</strong></div><label className="quantum-control" title="El quantum es el pequeño turno que recibe un proceso antes de ceder la CPU.">Quantum de Round Robin <input type="number" min="1" max="20" value={quantum} onChange={(event) => setQuantum(Math.max(1, Number(event.target.value)))} /><span>unidades</span></label><span className="sync-label"><span className="sync-icon">↯</span> Misma entrada para todos</span></section>
        <div className="run-zone"><div><span className="step-label">PASO 03 / OBSERVAR</span><h2>Ejecuta el centro de control</h2><p>{hasRun ? 'La CPU ya tomó sus decisiones. Cambia los datos y vuelve a ejecutar para comparar.' : 'Presiona ejecutar para ver cómo seis estrategias toman decisiones distintas.'}</p></div><button className="run-button" type="button" disabled={!processes.length} onClick={runSimulation}><span>▶</span> Ejecutar simulación</button></div>

        {hasRun && <section className="playback panel"><div className="playback-head"><div><span className="eyebrow">Modo de recorrido</span><strong>Avanza por las decisiones de la CPU</strong></div><div className="playback-buttons"><button type="button" onClick={() => setIsPlaying((value) => !value)}>{isPlaying ? 'Ⅱ Pausar' : '▶ Reproducir'}</button><button type="button" onClick={() => setCurrentTime((time) => Math.min(maxTime, time + 1))}>⏭ Siguiente</button><button type="button" onClick={() => { setCurrentTime(0); setIsPlaying(false) }}>↺ Reiniciar</button></div></div><input className="timeline-slider" type="range" min="0" max={maxTime} value={currentTime} onChange={(event) => setCurrentTime(Number(event.target.value))} /><div className="time-readout"><span>Tiempo actual <strong>t = {currentTime}</strong></span><span>Fin estimado <strong>t = {maxTime}</strong></span></div><div className="event-explanation"><span className="event-badge">🧠 {selectedAlgorithm.toUpperCase()} está pensando</span><p>{explainMode && currentEvent ? currentEvent.explanation : 'Activa “Explicar simulación” para detenerte en cada decisión importante.'}</p><button type="button" onClick={() => setExplainMode((value) => !value)}>{explainMode ? 'Ocultar explicación' : 'Explicar simulación'}</button></div></section>}

        <section className="results-section"><div className="results-heading"><div><span className="step-label">PASO 04 / COMPARAR</span><h2>La arena de planificación</h2><p>Cada estrategia resuelve el mismo problema con una idea diferente. No existe un ganador absoluto.</p></div><span className="result-count">{processes.length} procesos · {processes.reduce((sum, process) => sum + process.burst, 0)} unidades</span></div><div className="algorithm-tabs">{results.map(({ algorithm }) => <button key={algorithm.key} className={selectedAlgorithm === algorithm.key ? 'active' : ''} type="button" onClick={() => setSelectedAlgorithm(algorithm.key)}>{algorithm.name}</button>)}</div><div className="algorithm-grid">{results.map(({ algorithm, result }) => <AlgorithmCard key={algorithm.key} algorithm={algorithm} result={result} processes={processes} quantum={quantum} maxTime={maxTime} currentTime={currentTime} active={selectedAlgorithm === algorithm.key} onSelect={() => setSelectedAlgorithm(algorithm.key)} />)}</div></section>

        <section className="scenario-section"><div><span className="step-label">EXPERIMENTA</span><h2>Escenarios para aprender</h2><p>Empieza con una situación conocida y observa qué cambia al cambiar la regla.</p></div><div className="scenario-grid">{scenarios.map((scenario) => <button type="button" className="scenario-card" key={scenario.id} onClick={() => loadScenario(scenario)}><span>{scenario.icon}</span><strong>{scenario.title}</strong><small>{scenario.description}</small><b>Probar escenario →</b></button>)}</div></section>

        {showLearn && <section className="learn-section panel"><div><span className="step-label">PASO 05 / ENTENDER</span><h2>Diccionario de la CPU</h2><p>La planificación es decidir quién usa un recurso limitado y cuándo.</p></div><div className="learn-grid">{[['Proceso', 'Un trabajo que necesita tiempo de CPU.'], ['Tiempo de llegada', 'El momento en que el proceso entra a la cola.'], ['Ráfaga CPU', 'Cuánto tiempo necesita para terminar.'], ['Prioridad', 'Qué tan importante es frente a otros procesos.'], ['Quantum', 'El pequeño turno de tiempo de Round Robin.'], ['Expropiativo', 'La CPU puede cambiar de proceso antes de que termine.']].map(([term, definition]) => <div key={term}><strong>{term}</strong><span>{definition}</span></div>)}</div></section>}
      </div>
      <footer><span>OS Scheduler Lab</span> · Visualiza cómo piensa un sistema operativo. <span className="footer-right">Hecho para experimentar <span className="spark">✦</span></span></footer>
    </main>
  )
}

export default App
