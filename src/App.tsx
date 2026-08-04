import { useState } from 'react'
import './App.css'

function App() {
  const DENT_SIZES = ["Small", "Medium", "Large", "Oversized"]
  const SEVERITY_LEVELS = ["Light", "Moderate", "Heavy"]
  const PANEL_TYPES = [
    "Hood",
    "Roof",
    "LeftFrontDoor",
    "RightFrontDoor",
    "LeftRearDoor",
    "RightRearDoor",
    "Trunk/DeckLid",
    "LeftQuarterPanel",
    "RightQuarterPanel",
    "LeftFender",
    "RightFender",
  ]

  type VehicleInformation = {
    year: NonNullable<number>,
    make: NonNullable<string>,
    model: NonNullable<string>,
    color: NonNullable<string>,
    vin?: string,
  }

  type panelReport = {
    panelType: string,
    numberOfDents: NonNullable<number>,
    avgDentSize: typeof DENT_SIZES[number],
    severityLevel: typeof SEVERITY_LEVELS[number]
  }

  type fullReport = {
    vehicleInformation: VehicleInformation,
    damageReported: Array<panelReport>;
  }

  // create the values for each input field and set the initial value
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [make, setMake] = useState<string>('')
  const [model, setModel] = useState<string>('')
  const [color, setColor] = useState<string>('')
  const [vin, setVin] = useState<string>('')

  // panels state - initialize with 3 empty panel reports (minimum required)
  const defaultPanel = (): panelReport => ({
    panelType: '',
    numberOfDents: 1,
    avgDentSize: DENT_SIZES[0],
    severityLevel: SEVERITY_LEVELS[0],
  })

  const [panels, setPanels] = useState<Array<panelReport>>([
    defaultPanel(),
    defaultPanel(),
    defaultPanel(),
  ])

  const [error, setError] = useState<string | null>(null)
  const [jsonOutput, setJsonOutput] = useState<string | null>(null)

  function updatePanel(index: number, changes: Partial<panelReport>) {
    setPanels((prev) => {
      const copy = prev.map((p) => ({ ...p }))
      copy[index] = { ...copy[index], ...changes }
      return copy
    })
  }

  function addPanel() {
    setPanels((prev) => [...prev, defaultPanel()])
  }

  function removePanel(index: number) {
    setPanels((prev) => {
      if (prev.length <= 3) return prev // enforce minimum of 3
      const copy = prev.slice()
      copy.splice(index, 1)
      return copy
    })
  }

  function validateAndBuildReport(): { ok: boolean; body?: fullReport; message?: string } {
    // validate vehicle fields
    if (!year || !make.trim() || !model.trim() || !color.trim()) {
      return { ok: false, message: 'Please complete all required vehicle information fields.' }
    }

    if (panels.length < 3) {
      return { ok: false, message: 'At least three panel reports are required.' }
    }

    for (let i = 0; i < panels.length; i++) {
      const p = panels[i]
      if (!p.panelType || !p.panelType.trim()) {
        return { ok: false, message: `Panel #${i + 1}: panel type is required.` }
      }
      if (!p.numberOfDents || p.numberOfDents <= 0) {
        return { ok: false, message: `Panel #${i + 1}: number of dents must be at least 1.` }
      }
      if (!p.avgDentSize || !DENT_SIZES.includes(p.avgDentSize)) {
        return { ok: false, message: `Panel #${i + 1}: avg dent size is invalid.` }
      }
      if (!p.severityLevel || !SEVERITY_LEVELS.includes(p.severityLevel)) {
        return { ok: false, message: `Panel #${i + 1}: severity level is invalid.` }
      }
    }

    const body: fullReport = {
      vehicleInformation: {
        year,
        make,
        model,
        color,
        vin,
      },
      damageReported: panels,
    }

    return { ok: true, body }
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    setJsonOutput(null)
    const result = validateAndBuildReport()
    if (!result.ok) {
      setError(result.message || 'Validation failed')
      return
    }
    setJsonOutput(JSON.stringify(result.body, null, 2))
  }

  return (
    <>
      <header style={{ padding: 20 }}>
        <h1>Damage Report</h1>
        <p>Please complete the required fields (marked with <span style={{ color: 'red' }}>*</span>).</p>
      </header>

      <main>
        <section id="report-form" style={{ padding: 20 }}>
          <h2>Damage Report Form (minimal)</h2>
          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Vehicle Information</legend>
              <label>
                Year: <span style={{ color: 'red' }}>*</span>{' '}
                <input
                  required
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </label>
              <label>
                Make: <span style={{ color: 'red' }}>*</span>{' '}
                <input required value={make} onChange={(e) => setMake(e.target.value)} />
              </label>
              <label>
                Model: <span style={{ color: 'red' }}>*</span>{' '}
                <input required value={model} onChange={(e) => setModel(e.target.value)} />
              </label>
              <label>
                Color: <span style={{ color: 'red' }}>*</span>{' '}
                <input required value={color} onChange={(e) => setColor(e.target.value)} />
              </label>
              <label>
                VIN: <span style={{ color: '#666' }}>(optional)</span>{' '}
                <input value={vin} onChange={(e) => setVin(e.target.value)} />
              </label>
            </fieldset>

            <fieldset>
              <legend>Panels (minimum 3)</legend>
              {panels.map((p, idx) => (
                <div key={idx} style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}>
                  <label>
                    Panel Type: <span style={{ color: 'red' }}>*</span>{' '}
                    <select required value={p.panelType} onChange={(e) => updatePanel(idx, { panelType: e.target.value })}>
                      <option value="">-- select --</option>
                      {PANEL_TYPES.map((pt) => (
                        <option key={pt} value={pt}>{pt}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    # Dents: <span style={{ color: 'red' }}>*</span>{' '}
                    <input required type="number" min={1} value={p.numberOfDents} onChange={(e) => updatePanel(idx, { numberOfDents: Number(e.target.value) })} />
                  </label>
                  <label>
                    Avg Size: <span style={{ color: 'red' }}>*</span>{' '}
                    <select required value={p.avgDentSize} onChange={(e) => updatePanel(idx, { avgDentSize: e.target.value as typeof DENT_SIZES[number] })}>
                      {DENT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <label>
                    Severity: <span style={{ color: 'red' }}>*</span>{' '}
                    <select required value={p.severityLevel} onChange={(e) => updatePanel(idx, { severityLevel: e.target.value as typeof SEVERITY_LEVELS[number] })}>
                      {SEVERITY_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <div>
                    <button type="button" onClick={() => removePanel(idx)} disabled={panels.length <= 3}>Remove</button>
                  </div>
                </div>
              ))}

              <div>
                <button type="button" onClick={addPanel}>Add panel</button>
              </div>
            </fieldset>

            <div style={{ marginTop: 12 }}>
              <button type="submit">Submit Report</button>
            </div>
          </form>

          {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
          {jsonOutput && (
            <div style={{ marginTop: 12 }}>
              <h3>Submission Successful</h3>
              <pre style={{ background: '#f6f6f6', padding: 12, overflow: 'auto' }}>{jsonOutput}</pre>
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default App
