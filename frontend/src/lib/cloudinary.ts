import { Cloudinary } from '@cloudinary/url-gen'

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const cld = new Cloudinary({
  cloud: {
    cloudName
  }
})

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset || 'worksphere_secure')
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData
      }
    )
    
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    
    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export const generateImageUrl = (publicId: string, options?: {
  width?: number
  height?: number
  crop?: string
  quality?: number
}) => {
  let url = `https://res.cloudinary.com/${cloudName}/image/upload`
  
  if (options) {
    const transformations = []
    if (options.width) transformations.push(`w_${options.width}`)
    if (options.height) transformations.push(`h_${options.height}`)
    if (options.crop) transformations.push(`c_${options.crop}`)
    if (options.quality) transformations.push(`q_${options.quality}`)
    
    if (transformations.length > 0) {
      url += '/' + transformations.join(',')
    }
  }
  
  return `${url}/${publicId}`
}
