import { useState, useRef } from 'react'
import apiService from '../services/apiService'
import './ImageUploader.css'

export default function ImageUploader({ images = [], onChange, min = 3, max = 5 }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > max) {
      alert(`Maximum ${max} images allowed`)
      return
    }
    setUploading(true)
    try {
      for (const file of files) {
        const res = await apiService.vehicles.uploadImage(file)
        onChange([...images, res.data.url])
        images = [...images, res.data.url]
      }
    } catch {
      alert('Image upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleRemove = (idx) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div className="image-uploader">
      <div className="image-uploader-previews">
        {images.map((url, i) => (
          <div key={i} className="image-uploader-item">
            <img src={url} alt={`Upload ${i + 1}`} />
            <button type="button" className="image-uploader-remove" onClick={() => handleRemove(i)}>&times;</button>
          </div>
        ))}
        {uploading && (
          <div className="image-uploader-item image-uploader-loading">
            <div className="spinner" />
          </div>
        )}
      </div>
      {images.length < max && (
        <div style={{ marginTop: 8 }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>
            {images.length}/{max} images ({min} minimum)
          </p>
        </div>
      )}
    </div>
  )
}
