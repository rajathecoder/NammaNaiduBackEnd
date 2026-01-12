const HoroscopeDetail = require('../../models/HoroscopeDetail.model');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Get horoscope details for a user
 */
const getHoroscopeDetails = async (req, res) => {
  try {
    const accountId = req.accountId || req.userAccountId; // Get accountId from authenticated user

    if (!accountId) {
      return errorResponse(res, 'User account ID not found', 401);
    }

    const horoscopeDetail = await HoroscopeDetail.findOne({
      where: { accountId },
    });

    if (!horoscopeDetail) {
      return successResponse(res, {
        accountId,
        rasi: null,
        natchathiram: null,
        birthPlace: null,
        birthTime: null,
      });
    }

    return successResponse(res, {
      accountId: horoscopeDetail.accountId,
      rasi: horoscopeDetail.rasi || null,
      natchathiram: horoscopeDetail.natchathiram || null,
      birthPlace: horoscopeDetail.birthPlace || null,
      birthTime: horoscopeDetail.birthTime || null,
    });
  } catch (error) {
    console.error('Error in getHoroscopeDetails:', error);
    return errorResponse(res, 'Failed to fetch horoscope details', 500);
  }
};

/**
 * Create or update horoscope details for a user
 */
const saveHoroscopeDetails = async (req, res) => {
  try {
    const accountId = req.accountId || req.userAccountId; // Get accountId from authenticated user
    const { rasi, natchathiram, birthPlace, birthTime } = req.body;

    if (!accountId) {
      return errorResponse(res, 'User account ID not found', 401);
    }

    // Validate required fields (if needed)
    // You can add validation here if any field is required

    // Check if horoscope detail already exists
    let horoscopeDetail = await HoroscopeDetail.findOne({
      where: { accountId },
    });

    if (horoscopeDetail) {
      // Update existing record
      horoscopeDetail.rasi = rasi || horoscopeDetail.rasi;
      horoscopeDetail.natchathiram = natchathiram || horoscopeDetail.natchathiram;
      horoscopeDetail.birthPlace = birthPlace || horoscopeDetail.birthPlace;
      horoscopeDetail.birthTime = birthTime || horoscopeDetail.birthTime;
      await horoscopeDetail.save();
    } else {
      // Create new record
      horoscopeDetail = await HoroscopeDetail.create({
        accountId,
        rasi: rasi || null,
        natchathiram: natchathiram || null,
        birthPlace: birthPlace || null,
        birthTime: birthTime || null,
      });
    }

    return successResponse(res, {
      accountId: horoscopeDetail.accountId,
      rasi: horoscopeDetail.rasi,
      natchathiram: horoscopeDetail.natchathiram,
      birthPlace: horoscopeDetail.birthPlace,
      birthTime: horoscopeDetail.birthTime,
    });
  } catch (error) {
    console.error('Error in saveHoroscopeDetails:', error);
    return errorResponse(res, 'Failed to save horoscope details', 500);
  }
};

/**
 * Get horoscope details for a user by accountId (for viewing other users' profiles)
 */
const getHoroscopeDetailsByAccountId = async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!accountId) {
      return errorResponse(res, 'Account ID is required', 400);
    }

    const horoscopeDetail = await HoroscopeDetail.findOne({
      where: { accountId },
    });

    if (!horoscopeDetail) {
      return successResponse(res, {
        accountId,
        rasi: null,
        natchathiram: null,
        birthPlace: null,
        birthTime: null,
      });
    }

    return successResponse(res, {
      accountId: horoscopeDetail.accountId,
      rasi: horoscopeDetail.rasi || null,
      natchathiram: horoscopeDetail.natchathiram || null,
      birthPlace: horoscopeDetail.birthPlace || null,
      birthTime: horoscopeDetail.birthTime || null,
    });
  } catch (error) {
    console.error('Error in getHoroscopeDetailsByAccountId:', error);
    return errorResponse(res, 'Failed to fetch horoscope details', 500);
  }
};

module.exports = {
  getHoroscopeDetails,
  saveHoroscopeDetails,
  getHoroscopeDetailsByAccountId,
};
