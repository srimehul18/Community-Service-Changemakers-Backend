import cloudinary from '../config/cloudinary.js'
import fs from 'fs'

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No image uploaded'
      })
    }

    const result = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: 'mvl-coral/issues'
      }
    )

    fs.unlinkSync(req.file.path)

    res.status(200).json({
      message: 'Image uploaded successfully',
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        fileName: req.file.originalname
      }
    })
    }   catch (error) {
  if (req.file?.path && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path)
  }

  res.status(500).json({
    message: 'Image upload failed',
    error: error.message
  })
}
}