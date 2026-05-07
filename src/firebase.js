import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: ,
  authDomain: "jarque-portfolio.firebaseapp.com",
  projectId: "jarque-portfolio",
  storageBucket: "jarque-portfolio.firebasestorage.app",
  messagingSenderId: "786205583293",
  appId: "1:786205583293:web:99c64044dcd205769ad4d4"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

export const CLOUDINARY_CLOUD = 'dvbtqd57y'
export const CLOUDINARY_PRESET = 'portfolio_upload'

export async function uploadToCloudinary(file) {
  // Use 'auto' so it handles both images and PDFs correctly
  const resourceType = file.type === 'application/pdf' ? 'raw' : 'image'
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  )
  const data = await res.json()

  // Surface Cloudinary errors instead of silently returning undefined
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Upload failed (${res.status})`)
  }

  return data.secure_url
}
