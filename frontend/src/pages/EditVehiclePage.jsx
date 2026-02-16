import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiService from '../services/apiService'
import CustomSelect from '../components/CustomSelect'
import { getMakes, getModels } from '../data/vehicleData'
import './pages.css'

const currentYear = new Date().getFullYear()

export default function EditVehiclePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    apiService.vehicles.get(id)
      .then((res) => {
        const v = res.data.data
        setForm({
          make: v.make || '',
          model: v.model || '',
          year: v.year?.toString() || '',
          price: v.price?.toString() || '',
          mileage: v.mileage?.toString() || '',
          zipCode: v.zipCode || '',
          description: v.description || '',
          transmission: v.transmission || 'automatic',
          drivetrain: v.drivetrain || 'fwd',
          vin: v.vin || '',
          images: v.images || [],
        })
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading || !form) return <div className="form-page-redesign"><div className="spinner" style={{ margin: '40px auto' }} /></div>

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

    setSaving(true)
    try {
      await apiService.vehicles.update(id, {
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
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update vehicle')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form-page-redesign">
      <h1>Edit Vehicle</h1>

      {serverError && <div className="form-error-banner">{serverError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="form-section-title">Vehicle Info</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Make</label>
              <CustomSelect
                options={makes.map((m) => ({ value: m, label: m }))}
                value={form.make}
                onChange={(val) => setForm((prev) => ({ ...prev, make: val, model: '' }))}
                placeholder="Select a make"
                searchable
              />
              {errors.make && <div className="form-error">{errors.make}</div>}
            </div>
            <div className="form-group">
              <label>Model</label>
              <CustomSelect
                options={models.map((m) => ({ value: m, label: m }))}
                value={form.model}
                onChange={(val) => setForm((prev) => ({ ...prev, model: val }))}
                placeholder={form.make ? 'Select a model' : 'Select make first'}
                disabled={!form.make}
                searchable
              />
              {errors.model && <div className="form-error">{errors.model}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Year</label>
              <input name="year" type="number" value={form.year} onChange={handleChange} />
              {errors.year && <div className="form-error">{errors.year}</div>}
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} />
              {errors.price && <div className="form-error">{errors.price}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mileage</label>
              <input name="mileage" type="number" value={form.mileage} onChange={handleChange} />
              {errors.mileage && <div className="form-error">{errors.mileage}</div>}
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input name="zipCode" value={form.zipCode} onChange={handleChange} maxLength={5} />
              {errors.zipCode && <div className="form-error">{errors.zipCode}</div>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Specs</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Transmission</label>
              <CustomSelect
                options={[
                  { value: 'automatic', label: 'Automatic' },
                  { value: 'manual', label: 'Manual' },
                ]}
                value={form.transmission}
                onChange={(val) => setForm((prev) => ({ ...prev, transmission: val }))}
                placeholder="Transmission"
              />
            </div>
            <div className="form-group">
              <label>Drivetrain</label>
              <CustomSelect
                options={[
                  { value: 'fwd', label: 'FWD' },
                  { value: 'rwd', label: 'RWD' },
                  { value: 'awd', label: 'AWD' },
                  { value: '4wd', label: '4WD' },
                ]}
                value={form.drivetrain}
                onChange={(val) => setForm((prev) => ({ ...prev, drivetrain: val }))}
                placeholder="Drivetrain"
              />
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
              maxLength={1000}
            />
            <div className="char-count">{form.description.length} / 1000</div>
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving} style={{ marginTop: 'var(--space-4)' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
