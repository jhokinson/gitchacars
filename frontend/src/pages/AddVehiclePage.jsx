import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import apiService from '../services/apiService'
import { getMakes, getModels } from '../data/vehicleData'
import './pages.css'

const currentYear = new Date().getFullYear()

export default function AddVehiclePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')

  const [form, setForm] = useState({
    make: '', model: '', year: '', price: '',
    mileage: '', zipCode: '', description: '',
    transmission: 'automatic', drivetrain: 'fwd',
    vin: '', images: [],
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const makes = getMakes()
  const models = form.make ? getModels(form.make).map((m) => m.name) : []

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'make') {
      setForm((prev) => ({ ...prev, make: value, model: '' }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await apiService.vehicles.uploadImage(file)
      const url = res.data.data.url || res.data.data
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }))
    } catch {
      setServerError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const validate = () => {
    const errs = {}
    if (!form.make) errs.make = 'Required'
    if (!form.model) errs.model = 'Required'
    if (!form.year) errs.year = 'Required'
    else if (Number(form.year) < 1900 || Number(form.year) > currentYear + 1) errs.year = 'Invalid year'
    if (!form.price) errs.price = 'Required'
    if (!form.mileage) errs.mileage = 'Required'
    if (!form.zipCode) errs.zipCode = 'Required'
    else if (!/^\d{5}$/.test(form.zipCode)) errs.zipCode = 'Must be 5 digits'
    if (!form.description.trim()) errs.description = 'Required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      await apiService.vehicles.create({
        make: form.make,
        model: form.model,
        year: Number(form.year),
        price: Number(form.price),
        mileage: Number(form.mileage),
        zipCode: form.zipCode,
        description: form.description,
        transmission: form.transmission,
        drivetrain: form.drivetrain,
        vin: form.vin || null,
        images: form.images,
      })
      navigate(redirect || '/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to add vehicle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page-redesign">
      <h1>Add Vehicle to Inventory</h1>
      <p className="page-subtitle">
        Add your vehicle details below. Your vehicle is private and only shared when you introduce it to a buyer.
      </p>

      {serverError && <div className="form-error-banner">{serverError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="form-section-title">Vehicle Info</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Make</label>
              <select name="make" value={form.make} onChange={handleChange}>
                <option value="">Select a make</option>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.make && <div className="form-error">{errors.make}</div>}
            </div>
            <div className="form-group">
              <label>Model</label>
              <select name="model" value={form.model} onChange={handleChange} disabled={!form.make}>
                <option value="">{form.make ? 'Select a model' : 'Select make first'}</option>
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.model && <div className="form-error">{errors.model}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Year</label>
              <input name="year" type="number" value={form.year} onChange={handleChange} placeholder="2022" />
              {errors.year && <div className="form-error">{errors.year}</div>}
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="25000" />
              {errors.price && <div className="form-error">{errors.price}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mileage</label>
              <input name="mileage" type="number" value={form.mileage} onChange={handleChange} placeholder="35000" />
              {errors.mileage && <div className="form-error">{errors.mileage}</div>}
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="90210" maxLength={5} />
              {errors.zipCode && <div className="form-error">{errors.zipCode}</div>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Specs</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Transmission</label>
              <select name="transmission" value={form.transmission} onChange={handleChange}>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div className="form-group">
              <label>Drivetrain</label>
              <select name="drivetrain" value={form.drivetrain} onChange={handleChange}>
                <option value="fwd">FWD</option>
                <option value="rwd">RWD</option>
                <option value="awd">AWD</option>
                <option value="4wd">4WD</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>VIN (optional)</label>
            <input name="vin" value={form.vin} onChange={handleChange} placeholder="Vehicle Identification Number" />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Photos</h3>
          <div className="form-group">
            <label>Upload Images</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p className="form-hint">Uploading...</p>}
          </div>
          {form.images.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
              {form.images.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt={`Upload ${i + 1}`} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--color-danger)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Description</h3>
          <div className="form-group">
            <label>Tell buyers about your vehicle</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the condition, service history, notable features..."
              maxLength={1000}
            />
            <div className="char-count">{form.description.length} / 1000</div>
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 'var(--space-4)' }}>
          {loading ? 'Adding...' : 'Add Vehicle'}
        </button>
      </form>
    </div>
  )
}
