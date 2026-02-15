import { useState, useEffect } from 'react'
import apiService from '../services/apiService'
import './pages.css'

const TABS = ['Users', 'Listings', 'Vehicles']

export default function AdminPage() {
  const [tab, setTab] = useState('Users')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const fetchData = async (currentTab, currentPage, currentSearch) => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit, search: currentSearch || undefined }
      let res
      if (currentTab === 'Users') {
        res = await apiService.admin.getUsers(params)
        setData(res.data.data.users || res.data.data)
        setTotal(res.data.data.total || 0)
      } else if (currentTab === 'Listings') {
        res = await apiService.admin.getWantListings(params)
        setData(res.data.data.listings || res.data.data)
        setTotal(res.data.data.total || 0)
      } else {
        res = await apiService.admin.getVehicles(params)
        setData(res.data.data.vehicles || res.data.data)
        setTotal(res.data.data.total || 0)
      }
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchData(tab, 1, search)
  }, [tab])

  const handleSearch = () => {
    setPage(1)
    fetchData(tab, 1, search)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      if (tab === 'Users') await apiService.admin.deleteUser(id)
      else if (tab === 'Listings') await apiService.admin.deleteWantListing(id)
      else await apiService.admin.deleteVehicle(id)
      setData((prev) => prev.filter((item) => item.id !== id))
    } catch {
      alert('Failed to delete')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="admin-search">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={`Search ${tab.toLowerCase()}...`}
        />
        <button className="btn btn-secondary btn-sm" onClick={handleSearch}>Search</button>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '40px auto' }} />
      ) : data.length === 0 ? (
        <div className="dashboard-empty">No {tab.toLowerCase()} found.</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              {tab === 'Users' && (
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              )}
              {tab === 'Listings' && (
                <tr>
                  <th>Title</th>
                  <th>Make / Model</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              )}
              {tab === 'Vehicles' && (
                <tr>
                  <th>Vehicle</th>
                  <th>Price</th>
                  <th>Mileage</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              )}
            </thead>
            <tbody>
              {tab === 'Users' && data.map((u) => (
                <tr key={u.id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-ghost-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {tab === 'Listings' && data.map((l) => (
                <tr key={l.id}>
                  <td>{l.title}</td>
                  <td>{l.make} {l.model}</td>
                  <td>${Number(l.budgetMin).toLocaleString()} - ${Number(l.budgetMax).toLocaleString()}</td>
                  <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                  <td>
                    <button className="btn btn-ghost-danger btn-sm" onClick={() => handleDelete(l.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {tab === 'Vehicles' && data.map((v) => (
                <tr key={v.id}>
                  <td>{v.year} {v.make} {v.model}</td>
                  <td>${Number(v.price).toLocaleString()}</td>
                  <td>{Number(v.mileage).toLocaleString()} mi</td>
                  <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                  <td>
                    <button className="btn btn-ghost-danger btn-sm" onClick={() => handleDelete(v.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { const p = page - 1; setPage(p); fetchData(tab, p, search) }}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { const p = page + 1; setPage(p); fetchData(tab, p, search) }}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
