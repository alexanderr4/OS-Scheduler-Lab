import { useState } from 'react'

export function ProcessTable({ processes, onChange, onAdd, onReset, onRemove, onClear, onExample, onRandom }) {
  const [validation, setValidation] = useState('')
  const updateProcess = (id, field, value) => {
    const raw = Number(value)
    if (field === 'arrival' && raw < 0) setValidation('No puedes ingresar un tiempo de llegada negativo.')
    else if (field === 'burst' && raw <= 0) setValidation('El tiempo de ejecución debe ser mayor que 0.')
    else if (field === 'priority' && raw < 1) setValidation('La prioridad debe ser un número entre 1 y 9.')
    else setValidation('')
    const numeric = field === 'burst' ? Math.max(1, raw || 1) : field === 'priority' ? Math.min(9, Math.max(1, raw || 1)) : Math.max(0, raw || 0)
    onChange(processes.map((process) => process.id === id ? { ...process, [field]: numeric } : process))
  }

  return (
    <section className="input-panel panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Entrada compartida</span>
          <h2>Cola de procesos</h2>
        </div>
        <div className="heading-actions">
          <button className="button button-ghost" type="button" onClick={onExample}>Ejemplo</button>
          <button className="button button-ghost" type="button" onClick={onRandom}>Aleatorios</button>
          <button className="button button-ghost" type="button" onClick={onClear}>Limpiar</button>
          <button className="button button-ghost" type="button" onClick={onReset} title="Restablecer datos">
            <span aria-hidden="true">↺</span> Restablecer
          </button>
          <button className="button button-dark" type="button" onClick={onAdd} title="Agregar proceso">
            <span aria-hidden="true">+</span> Nuevo proceso
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Proceso</th><th>Llegada</th><th>Ráfaga CPU</th><th>Prioridad</th><th aria-label="Eliminar" /></tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <tr key={process.id}>
                <td><span className="process-tag" style={{ '--process-color': process.color }}>{process.name}</span></td>
                {['arrival', 'burst', 'priority'].map((field) => (
                  <td key={field}>
                    <input
                      aria-label={`${process.name} ${field}`}
                      type="number"
                      min="0"
                      max={field === 'priority' ? 9 : 99}
                      value={process[field]}
                      onChange={(event) => updateProcess(process.id, field, event.target.value)}
                    />
                  </td>
                ))}
                <td><button className="icon-button danger" type="button" onClick={() => onRemove(process.id)} title={`Eliminar ${process.name}`}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {validation && <p className="table-error" role="alert">{validation}</p>}
      <p className="table-note">La misma entrada alimenta los cinco modelos simultáneamente.</p>
    </section>
  )
}
