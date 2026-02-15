import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiService from '../services/apiService'
import VehicleCard from '../components/VehicleCard'
import IntroCard from '../components/IntroCard'
import Skeleton from '../components/Skeleton'
import './pages.css'

export default function SellerDashboardPage() {
  const [vehicles, setVehicles] = useState([])
  const [intros, setIntros] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiService.vehicles.getMine(),
      apiService.introductions.getSent(),
    ])
      .then(([vRes, iRes]) => {
        setVehicles(vRes.data.data)
        setIntros(iRes.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header"><h1>Seller Dashboard</h1></div>
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" />)}
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Seller Dashboard</h1>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>My Vehicles</h2>
          <Link to="/seller/add-vehicle" className="btn btn-primary btn-sm">+ Add Vehicle</Link>
        </div>
        {vehicles.length === 0 ? (
          <div className="dashboard-empty">No vehicles yet. Add a vehicle to start matching with buyers.</div>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Sent Introductions</h2>
        </div>
        {intros.length === 0 ? (
          <div className="dashboard-empty">No introductions sent yet. Find matches for your vehicles to get started.</div>
        ) : (
          <div className="intros-list">
            {intros.map((intro) => (
              <IntroCard key={intro.id} intro={intro} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
