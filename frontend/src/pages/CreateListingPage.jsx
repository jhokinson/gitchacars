import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/apiService'
import FeatureTagPicker from '../components/FeatureTagPicker'
import AIChatBox from '../components/AIChatBox'
import ListingPreview from '../components/ListingPreview'
import VehicleTypeIcon from '../components/VehicleTypeIcon'
import CustomSelect from '../components/CustomSelect'
import SuccessToast from '../components/SuccessToast'
import { getAllMakes, getModelsByMake } from '../data/carMakesModels'
import { getModelInfo } from '../data/vehicleData'
import './pages.css'

const initialForm = {
  title: '', make: '', model: '', yearMin: '', yearMax: '',
  budgetMin: '', budgetMax: '', zipCode: '', radius: '',
  mileageMax: '', description: '', transmission: 'Any',
  drivetrain: 'Any', condition: 'Any', features: [],
  featuresMustHave: [], featuresNiceToHave: [],
  vehicleType: null, makeOther: '', modelOther: '',
}

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'truck', label: 'Pickup Truck' },
  { value: 'classic', label: 'Classic Car' },
  { value: 'exotic', label: 'Exotic / Sports' },
  { value: 'van', label: 'Van / Minivan' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'wagon', label: 'Wagon / Hatchback' },
  { value: 'electric', label: 'Electric' },
  { value: 'other', label: 'Other' },
]

const DRIVETRAINS = { fwd: 'FWD', rwd: 'RWD', awd: 'AWD', '4wd': '4WD' }

const makeOptions = [...getAllMakes(), { value: '__other__', label: 'Other' }]

function AccordionSection({ title, summary, complete, open, onToggle, children }) {
  const [overflowVisible, setOverflowVisible] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (open) {
      // After expand transition ends, switch to overflow:visible so dropdowns aren't clipped
      const timer = setTimeout(() => setOverflowVisible(true), 320)
      return () => clearTimeout(timer)
    } else {
      // Immediately hide overflow when closing so collapse animation works
      setOverflowVisible(false)
    }
  }, [open])

  return (
    <div className={`accordion-section${open ? ' open' : ''}${complete ? ' complete' : ''}`}>
      <button type="button" className="accordion-header" onClick={onToggle}>
        <div className="accordion-header-left">
          {complete ? (
            <svg className="accordion-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          ) : (
            <div className="accordion-number" />
          )}
          <span className="accordion-title">{title}</span>
        </div>
        <div className="accordion-header-right">
          {!open && summary && <span className="accordion-summary">{summary}</span>}
          <svg className={`accordion-chevron${open ? ' rotated' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </button>
      <div
        ref={wrapperRef}
        className="accordion-body-wrapper"
        style={{
          maxHeight: open ? 800 : 0,
          overflow: overflowVisible ? 'visible' : 'hidden',
        }}
      >
        <div className="accordion-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export function ListingForm({ initial = initialForm, onSubmit, submitLabel = 'Create Listing' }) {
  const [form, setForm] = useState({ ...initialForm, ...initial })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [openSections, setOpenSections] = useState({ vehicle: true, specs: true, budget: true, details: true })
  const [titleEdited, setTitleEdited] = useState(false)

  const isOtherMake = form.make === '__other__'
  const isOtherModel = form.model === '__other__'
  const effectiveMake = isOtherMake ? form.makeOther : form.make
  const effectiveModel = isOtherModel ? form.modelOther : form.model

  const modelOptions = form.make && form.make !== '__other__'
    ? [...getModelsByMake(form.make), { value: '__other__', label: 'Other' }]
    : [{ value: '__other__', label: 'Other' }]

  // Compute section completeness
  const s1Complete = effectiveMake && effectiveModel
  const s2Complete = s1Complete && form.yearMin && form.yearMax
  const s3Complete = s2Complete && form.budgetMin && form.budgetMax && form.zipCode && form.radius

  // Auto-populate from vehicle data when make+model are selected
  useEffect(() => {
    if (!form.make || form.make === '__other__' || !form.model || form.model === '__other__') return
    const info = getModelInfo(form.make, form.model)
    if (!info) return

    const updates = {}
    if (!form.yearMin) updates.yearMin = info.yearStart.toString()
    if (!form.yearMax) updates.yearMax = new Date().getFullYear().toString()
    if (form.transmission === 'Any') updates.transmission = info.defaultTransmission
    if (form.drivetrain === 'Any') updates.drivetrain = info.defaultDrivetrain
    if (!form.vehicleType) updates.vehicleType = info.type
    if ((!form.features || form.features.length === 0) && (!form.featuresNiceToHave || form.featuresNiceToHave.length === 0) && info.suggestedFeatures.length > 0) {
      updates.featuresNiceToHave = info.suggestedFeatures
      updates.features = info.suggestedFeatures
    }

    if (Object.keys(updates).length > 0) {
      setForm((prev) => ({ ...prev, ...updates }))
    }

    // Auto-open section 2
    setOpenSections((prev) => ({ ...prev, specs: true }))
  }, [form.make, form.model])

  // Auto-open details section when budget section is complete
  useEffect(() => {
    if (s3Complete) {
      setOpenSections((prev) => ({ ...prev, details: true }))
    }
  }, [s3Complete])

  // Auto-generate title
  useEffect(() => {
    if (titleEdited) return
    if (effectiveMake && effectiveModel && form.yearMin && form.yearMax) {
      const title = `Looking for a ${form.yearMin}-${form.yearMax} ${effectiveMake} ${effectiveModel}`
      setForm((prev) => ({ ...prev, title }))
    }
  }, [effectiveMake, effectiveModel, form.yearMin, form.yearMax, titleEdited])

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleMakeChange = (val) => setForm((prev) => ({ ...prev, make: val, model: '', modelOther: '', makeOther: '' }))

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Required'
    if (!effectiveMake.trim()) errs.make = 'Required'
    if (!effectiveModel.trim()) errs.model = 'Required'
    if (!form.yearMin) errs.yearMin = 'Required'
    if (!form.yearMax) errs.yearMax = 'Required'
    if (Number(form.yearMin) > Number(form.yearMax)) errs.yearMax = 'Must be >= year min'
    if (!form.budgetMin) errs.budgetMin = 'Required'
    if (!form.budgetMax) errs.budgetMax = 'Required'
    if (Number(form.budgetMin) > Number(form.budgetMax)) errs.budgetMax = 'Must be >= budget min'
    if (!form.zipCode.trim()) errs.zipCode = 'Required'
    else if (!/^\d{5}$/.test(form.zipCode)) errs.zipCode = 'Must be 5 digits'
    if (!form.radius) errs.radius = 'Required'
    if (!form.mileageMax) errs.mileageMax = 'Required'
    if (!form.description.trim()) errs.description = 'Required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      // Open all sections so errors are visible
      setOpenSections({ vehicle: true, specs: true, budget: true, details: true })
      return
    }

    setLoading(true)
    try {
      const data = {
        ...form,
        make: effectiveMake,
        model: effectiveModel,
        yearMin: Number(form.yearMin),
        yearMax: Number(form.yearMax),
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        radiusMiles: Number(form.radius),
        mileageMax: Number(form.mileageMax),
        transmission: form.transmission === 'Any' ? null : form.transmission,
        drivetrain: form.drivetrain === 'Any' ? null : form.drivetrain,
        condition: form.condition === 'Any' ? null : form.condition,
        features: [...(form.featuresMustHave || []), ...(form.featuresNiceToHave || [])],
        featuresMustHave: form.featuresMustHave || [],
        featuresNiceToHave: form.featuresNiceToHave || [],
        vehicleType: form.vehicleType || null,
      }
      delete data.radius
      delete data.makeOther
      delete data.modelOther
      await onSubmit(data)
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to save listing')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const s1Summary = effectiveMake && effectiveModel ? `${effectiveMake} ${effectiveModel}` : ''
  const s2Summary = form.yearMin && form.yearMax ? `${form.yearMin}\u2013${form.yearMax}` + (form.transmission !== 'Any' ? `, ${form.transmission}` : '') : ''
  const s3Summary = form.budgetMin && form.budgetMax ? `$${Number(form.budgetMin).toLocaleString()}\u2013$${Number(form.budgetMax).toLocaleString()}` : ''

  return (
    <form onSubmit={handleSubmit}>
      {serverError && <div className="form-error-banner">{serverError}</div>}

      <AccordionSection
        title="What are you looking for?"
        summary={s1Summary}
        complete={!!s1Complete}
        open={openSections.vehicle}
        onToggle={() => toggleSection('vehicle')}
      >
        <div className="vehicle-type-grid" style={{ marginBottom: 'var(--space-4)' }}>
          {VEHICLE_TYPES.map((vt) => (
            <button
              key={vt.value}
              type="button"
              className={`vehicle-type-card${form.vehicleType === vt.value ? ' selected' : ''}`}
              onClick={() => setForm((prev) => ({ ...prev, vehicleType: prev.vehicleType === vt.value ? null : vt.value }))}
            >
              <VehicleTypeIcon type={vt.value} size={32} />
              <span>{vt.label}</span>
            </button>
          ))}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Make</label>
            <CustomSelect
              options={makeOptions}
              value={form.make}
              onChange={handleMakeChange}
              placeholder="Select a make..."
              searchable
            />
            {isOtherMake && (
              <input name="makeOther" value={form.makeOther} onChange={handleChange} placeholder="Enter make" style={{ marginTop: 8 }} />
            )}
            {errors.make && <div className="form-error">{errors.make}</div>}
          </div>
          <div className="form-group">
            <label>Model</label>
            <CustomSelect
              options={modelOptions}
              value={form.model}
              onChange={(val) => setForm((prev) => ({ ...prev, model: val, modelOther: '' }))}
              placeholder={form.make ? 'Select a model...' : 'Select make first'}
              disabled={!form.make}
              searchable
            />
            {isOtherModel && (
              <input name="modelOther" value={form.modelOther} onChange={handleChange} placeholder="Enter model" style={{ marginTop: 8 }} />
            )}
            {errors.model && <div className="form-error">{errors.model}</div>}
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Year & Specs"
        summary={s2Summary}
        complete={!!s2Complete}
        open={openSections.specs}
        onToggle={() => toggleSection('specs')}
      >
        <div className="form-row">
          <div className="form-group">
            <label>Year Min</label>
            <input name="yearMin" type="number" value={form.yearMin} onChange={handleChange} placeholder="2018" />
            {errors.yearMin && <div className="form-error">{errors.yearMin}</div>}
          </div>
          <div className="form-group">
            <label>Year Max</label>
            <input name="yearMax" type="number" value={form.yearMax} onChange={handleChange} placeholder="2024" />
            {errors.yearMax && <div className="form-error">{errors.yearMax}</div>}
          </div>
        </div>
        <div className="form-group">
          <label>Max Mileage</label>
          <input name="mileageMax" type="number" value={form.mileageMax} onChange={handleChange} placeholder="50000" />
          {errors.mileageMax && <div className="form-error">{errors.mileageMax}</div>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Transmission</label>
            <CustomSelect
              options={[
                { value: 'Any', label: 'Any' },
                { value: 'automatic', label: 'Automatic' },
                { value: 'manual', label: 'Manual' },
              ]}
              value={form.transmission}
              onChange={(val) => setForm((prev) => ({ ...prev, transmission: val }))}
              placeholder="Any"
            />
          </div>
          <div className="form-group">
            <label>Drivetrain</label>
            <CustomSelect
              options={[
                { value: 'Any', label: 'Any' },
                { value: 'fwd', label: 'FWD' },
                { value: 'rwd', label: 'RWD' },
                { value: 'awd', label: 'AWD' },
                { value: '4wd', label: '4WD' },
              ]}
              value={form.drivetrain}
              onChange={(val) => setForm((prev) => ({ ...prev, drivetrain: val }))}
              placeholder="Any"
            />
          </div>
          <div className="form-group">
            <label>Condition</label>
            <CustomSelect
              options={[
                { value: 'Any', label: 'Any' },
                { value: 'new', label: 'New' },
                { value: 'used', label: 'Used' },
              ]}
              value={form.condition}
              onChange={(val) => setForm((prev) => ({ ...prev, condition: val }))}
              placeholder="Any"
            />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Budget & Location"
        summary={s3Summary}
        complete={!!s3Complete}
        open={openSections.budget}
        onToggle={() => toggleSection('budget')}
      >
        <div className="form-row">
          <div className="form-group">
            <label>Budget Min ($)</label>
            <input name="budgetMin" type="number" value={form.budgetMin} onChange={handleChange} placeholder="10000" />
            {errors.budgetMin && <div className="form-error">{errors.budgetMin}</div>}
          </div>
          <div className="form-group">
            <label>Budget Max ($)</label>
            <input name="budgetMax" type="number" value={form.budgetMax} onChange={handleChange} placeholder="25000" />
            {errors.budgetMax && <div className="form-error">{errors.budgetMax}</div>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Zip Code</label>
            <input name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="90210" />
            {errors.zipCode && <div className="form-error">{errors.zipCode}</div>}
          </div>
          <div className="form-group">
            <label>Radius (miles)</label>
            <input name="radius" type="number" value={form.radius} onChange={handleChange} placeholder="50" />
            {errors.radius && <div className="form-error">{errors.radius}</div>}
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Features & Details"
        summary={form.title ? form.title : ''}
        complete={!!form.title && !!form.description}
        open={openSections.details}
        onToggle={() => toggleSection('details')}
      >
        <div className="form-group">
          <label>Listing Title</label>
          <input
            name="title"
            value={form.title}
            onChange={(e) => { setTitleEdited(true); const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })) }}
            placeholder="e.g. Looking for a 2020-2024 Honda CR-V"
          />
          <div className="form-hint">Tip: A good title includes year range, make, model, and budget</div>
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>
        <div className="form-group">
          <label>Features</label>
          <FeatureTagPicker
            mustHave={form.featuresMustHave || []}
            niceToHave={form.featuresNiceToHave || []}
            onChangeMustHave={(featuresMustHave) => setForm((prev) => ({ ...prev, featuresMustHave, features: [...featuresMustHave, ...(prev.featuresNiceToHave || [])] }))}
            onChangeNiceToHave={(featuresNiceToHave) => setForm((prev) => ({ ...prev, featuresNiceToHave, features: [...(prev.featuresMustHave || []), ...featuresNiceToHave] }))}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe what you're looking for — condition preferences, must-have features, deal-breakers, etc." maxLength={500} />
          <div className="char-count">{(form.description || '').length} / 500</div>
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
      </AccordionSection>

      <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 'var(--space-4)' }}>
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}

export default function CreateListingPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('chat')
  const [listingData, setListingData] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [aiUnavailable, setAiUnavailable] = useState(false)

  useEffect(() => {
    apiService.ai.status()
      .then(res => {
        if (!res.data.data.available) {
          setAiUnavailable(true)
          setMode('manual')
        }
      })
      .catch(() => {
        // Status check failed — optimistic: keep AI mode
      })
  }, [])

  const handleListingData = (data) => {
    setListingData(prev => ({ ...prev, ...data }))
  }

  const handleChatCreate = async () => {
    setSubmitting(true)
    try {
      const data = {
        title: listingData.title,
        make: listingData.make,
        model: listingData.model,
        yearMin: Number(listingData.yearMin),
        yearMax: Number(listingData.yearMax),
        budgetMin: Number(listingData.budgetMin),
        budgetMax: Number(listingData.budgetMax),
        zipCode: listingData.zipCode,
        radiusMiles: Number(listingData.radius || listingData.radiusMiles || 50),
        mileageMax: Number(listingData.mileageMax),
        description: listingData.description || '',
        transmission: listingData.transmission || null,
        drivetrain: listingData.drivetrain || null,
        condition: listingData.condition || null,
        features: listingData.features || [...(listingData.featuresMustHave || []), ...(listingData.featuresNiceToHave || [])],
        featuresMustHave: listingData.featuresMustHave || [],
        featuresNiceToHave: listingData.featuresNiceToHave || [],
        vehicleType: listingData.vehicleType || null,
      }
      await apiService.wantListings.create(data)
      setShowSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch {
      alert('Failed to create listing. Please check all fields.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleManualCreate = async (data) => {
    await apiService.wantListings.create(data)
    setShowSuccess(true)
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  // Convert AI-extracted data to form-compatible initial values
  const chatDataToFormInitial = () => ({
    title: listingData.title || '',
    make: listingData.make || '',
    model: listingData.model || '',
    yearMin: listingData.yearMin?.toString() || '',
    yearMax: listingData.yearMax?.toString() || '',
    budgetMin: listingData.budgetMin?.toString() || '',
    budgetMax: listingData.budgetMax?.toString() || '',
    zipCode: listingData.zipCode || '',
    radius: (listingData.radius || listingData.radiusMiles || '')?.toString() || '',
    mileageMax: listingData.mileageMax?.toString() || '',
    description: listingData.description || '',
    transmission: listingData.transmission || 'Any',
    drivetrain: listingData.drivetrain || 'Any',
    condition: listingData.condition || 'Any',
    features: listingData.features || [...(listingData.featuresMustHave || []), ...(listingData.featuresNiceToHave || [])],
    featuresMustHave: listingData.featuresMustHave || [],
    featuresNiceToHave: listingData.featuresNiceToHave || [],
    vehicleType: listingData.vehicleType || null,
  })

  const requiredFields = ['title', 'make', 'model', 'yearMin', 'yearMax', 'budgetMin', 'budgetMax', 'zipCode', 'mileageMax', 'description']
  const filledRequired = requiredFields.filter(f => {
    const val = listingData[f]
    return val !== undefined && val !== null && val !== ''
  })
  const canSubmit = filledRequired.length >= requiredFields.length - 1 // allow 1 missing (description can be generated)

  return (
    <div className="create-listing-page">
      <h1>Create Want-Listing</h1>

      {aiUnavailable && (
        <div className="ai-unavailable-banner">
          AI assistant is currently unavailable. You can create your listing using the form below.
        </div>
      )}

      <div className="create-listing-toggle">
        <button
          className={`toggle-btn${mode === 'chat' ? ' active' : ''}`}
          onClick={() => setMode('chat')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          AI Assistant
        </button>
        <button
          className={`toggle-btn${mode === 'manual' ? ' active' : ''}`}
          onClick={() => setMode('manual')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Manual Form
        </button>
      </div>

      {mode === 'chat' && (
        <div className="create-listing-chat-layout">
          <div className="create-listing-chat-col">
            <AIChatBox onListingData={handleListingData} onSwitchToManual={() => setMode('manual')} />
          </div>
          <div className="create-listing-preview-col">
            <ListingPreview data={listingData} />
            <button
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 'var(--space-4)' }}
              disabled={!canSubmit || submitting}
              onClick={handleChatCreate}
            >
              {submitting ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </div>
      )}

      {mode === 'manual' && (
        <ListingForm
          initial={chatDataToFormInitial()}
          onSubmit={handleManualCreate}
          submitLabel="Create Listing"
        />
      )}

      <SuccessToast show={showSuccess} message="Listing created!" />
    </div>
  )
}
