import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiService from '../services/apiService'
import { ListingForm } from './CreateListingPage'
import './pages.css'

export default function EditListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initial, setInitial] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiService.wantListings.get(id)
      .then((res) => {
        const l = res.data.data
        setInitial({
          title: l.title || '',
          make: l.make || '',
          model: l.model || '',
          yearMin: l.yearMin?.toString() || '',
          yearMax: l.yearMax?.toString() || '',
          budgetMin: l.budgetMin?.toString() || '',
          budgetMax: l.budgetMax?.toString() || '',
          zipCode: l.zipCode || '',
          radius: l.radiusMiles?.toString() || l.radius?.toString() || '',
          mileageMax: l.mileageMax?.toString() || '',
          description: l.description || '',
          transmission: l.transmission || 'Any',
          drivetrain: l.drivetrain || 'Any',
          condition: l.condition || 'Any',
          features: l.features || [],
          featuresMustHave: l.featuresMustHave || [],
          featuresNiceToHave: l.featuresNiceToHave || (l.features || []),
          vehicleType: l.vehicleType || null,
        })
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdate = async (data) => {
    await apiService.wantListings.update(id, data)
    navigate('/dashboard')
  }

  if (loading || !initial) return <div className="form-page-redesign"><div className="spinner" style={{ margin: '40px auto' }} /></div>

  return (
    <div className="create-listing-page">
      <h1>Edit Want-Listing</h1>
      <ListingForm initial={initial} onSubmit={handleUpdate} submitLabel="Save Changes" />
    </div>
  )
}
