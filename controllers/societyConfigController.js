import SocietyConfig from '../models/SocietyConfig.js'

// Get the current society configuration
export const getSocietyConfig = async (req, res) => {
  try {
    let config = await SocietyConfig.findOne()

    // Create an empty configuration if one doesn't exist yet
    if (!config) {
      config = await SocietyConfig.create({
        towers: [],
        floors: [],
        commonAreas: []
      })
    }

    res.status(200).json(config)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch society configuration',
      error: error.message
    })
  }
}

// Update the society configuration
export const updateSocietyConfig = async (req, res) => {
  try {
    const {
      towers,
      floors,
      commonAreas
    } = req.body

    let config = await SocietyConfig.findOne()

    if (!config) {
      config = new SocietyConfig()
    }

    if (Array.isArray(towers)) {
      config.towers = towers
    }

    if (Array.isArray(floors)) {
      config.floors = floors
    }

    if (Array.isArray(commonAreas)) {
      config.commonAreas = commonAreas
    }

    await config.save()

    res.status(200).json({
      message: 'Society configuration updated successfully',
      config
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update society configuration',
      error: error.message
    })
  }
}