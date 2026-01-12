const PersonPhoto = require('../../models/PersonPhoto.model');
const { uploadBase64Image } = require('../../services/cloudinary.service');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Upload person photos and proof image
 * POST /api/users/photos
 */
const uploadPersonPhotos = async (req, res) => {
  try {
    const { personid, personphoto, proofbase64 } = req.body;

    // Validate required fields
    if (!personid) {
      return errorResponse(res, 'personid is required', 400);
    }

    if (!proofbase64) {
      return errorResponse(res, 'proofbase64 is required', 400);
    }

    // Validate personphoto array
    if (!Array.isArray(personphoto)) {
      return errorResponse(res, 'personphoto must be an array', 400);
    }

    if (personphoto.length > 5) {
      return errorResponse(res, 'Maximum 5 photos allowed', 400);
    }

    // Validate each photo in the array
    for (const photo of personphoto) {
      if (!photo.photoplacement || photo.photoplacement < 1 || photo.photoplacement > 5) {
        return errorResponse(res, 'photoplacement must be between 1 and 5', 400);
      }
      if (!photo.photobase64) {
        return errorResponse(res, `photobase64 is required for photoplacement ${photo.photoplacement}`, 400);
      }
    }

    // Upload proof image to Cloudinary
    let proofLink = '';
    try {
      const proofResult = await uploadBase64Image(
        proofbase64,
        `proof-images/${personid}`,
        `proof-${personid}`
      );
      proofLink = proofResult.url;
    } catch (error) {
      return errorResponse(res, `Failed to upload proof image: ${error.message}`, 500);
    }

    // Upload person photos to Cloudinary
    const photoUploads = [];
    const photoMap = {}; // Map photoplacement to photo field

    for (const photo of personphoto) {
      try {
        const photoResult = await uploadBase64Image(
          photo.photobase64,
          `person-photos/${personid}`,
          `photo${photo.photoplacement}-${personid}`
        );

        photoMap[photo.photoplacement] = photoResult.url;
        photoUploads.push({
          photoplacement: photo.photoplacement,
          url: photoResult.url,
        });
      } catch (error) {
        return errorResponse(res, `Failed to upload photo ${photo.photoplacement}: ${error.message}`, 500);
      }
    }

    // Prepare database update/create data
    const photoData = {
      personId: personid,
      proofImage: proofLink,
    };

    // Map photoplacement to photo fields (photo1, photo2, etc.)
    photoUploads.forEach(({ photoplacement, url }) => {
      photoData[`photo${photoplacement}`] = url;
    });

    // Find or create person photo record
    const [personPhotoRecord, created] = await PersonPhoto.findOrCreate({
      where: { personId: personid },
      defaults: photoData,
    });

    // If record exists, update it (merge with existing photos)
    if (!created) {
      // Preserve existing photos that weren't updated
      const updateData = { ...photoData };
      for (let i = 1; i <= 5; i++) {
        if (!updateData[`photo${i}`] && personPhotoRecord[`photo${i}`]) {
          updateData[`photo${i}`] = personPhotoRecord[`photo${i}`];
        }
      }
      await personPhotoRecord.update(updateData);
    }

    // Format response
    const responsePhotos = [];
    for (let i = 1; i <= 5; i++) {
      const photoUrl = personPhotoRecord[`photo${i}`] || photoData[`photo${i}`] || null;
      if (photoUrl) {
        const photoObj = {
          photoplacement: i,
        };
        photoObj[`photo${i}link`] = photoUrl;
        responsePhotos.push(photoObj);
      }
    }

    return successResponse(res, {
      personid: personid,
      personphoto: responsePhotos,
      prooflink: proofLink,
    }, 201);
  } catch (error) {
    console.error('Error in uploadPersonPhotos:', error);
    return errorResponse(res, `Failed to upload photos: ${error.message}`, 500);
  }
};

/**
 * Get person photos
 * GET /api/users/photos/:personId
 */
const getPersonPhotos = async (req, res) => {
  try {
    const { personId } = req.params;

    if (!personId) {
      return errorResponse(res, 'personId is required', 400);
    }

    const personPhoto = await PersonPhoto.findOne({
      where: { personId: personId },
    });

    if (!personPhoto) {
      return successResponse(res, {
        personid: personId,
        personphoto: [],
        prooflink: '',
      });
    }

    // Format response
    const responsePhotos = [];
    for (let i = 1; i <= 5; i++) {
      const photoUrl = personPhoto[`photo${i}`];
      if (photoUrl) {
        const photoObj = {
          photoplacement: i,
        };
        photoObj[`photo${i}link`] = photoUrl;
        responsePhotos.push(photoObj);
      }
    }

    return successResponse(res, {
      personid: personId,
      personphoto: responsePhotos,
      prooflink: personPhoto.proofImage || '',
    });
  } catch (error) {
    console.error('Error in getPersonPhotos:', error);
    return errorResponse(res, `Failed to get photos: ${error.message}`, 500);
  }
};

module.exports = {
  uploadPersonPhotos,
  getPersonPhotos,
};
