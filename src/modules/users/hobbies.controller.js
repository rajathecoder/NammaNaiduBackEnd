const Hobby = require('../../models/Hobby.model');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Get hobbies/interests for a user
 */
const getHobbies = async (req, res) => {
  try {
    const accountId = req.accountId || req.userAccountId;

    if (!accountId) {
      return errorResponse(res, 'User account ID not found', 401);
    }

    const hobby = await Hobby.findOne({
      where: { accountId },
    });

    if (!hobby) {
      return successResponse(res, {
        accountId,
        hobbies: [],
        musicGenres: [],
        bookTypes: [],
        movieTypes: [],
        sports: [],
        cuisines: [],
        languages: [],
      });
    }

    return successResponse(res, {
      accountId: hobby.accountId,
      hobbies: hobby.hobbies || [],
      musicGenres: hobby.musicGenres || [],
      bookTypes: hobby.bookTypes || [],
      movieTypes: hobby.movieTypes || [],
      sports: hobby.sports || [],
      cuisines: hobby.cuisines || [],
      languages: hobby.languages || [],
    });
  } catch (error) {
    console.error('Error in getHobbies:', error);
    return errorResponse(res, 'Failed to fetch hobbies', 500);
  }
};

/**
 * Create or update hobbies/interests for a user
 */
const saveHobbies = async (req, res) => {
  try {
    const accountId = req.accountId || req.userAccountId;
    const { hobbies, musicGenres, bookTypes, movieTypes, sports, cuisines, languages } = req.body;

    if (!accountId) {
      return errorResponse(res, 'User account ID not found', 401);
    }

    // Validate that arrays are provided
    const hobbiesArray = Array.isArray(hobbies) ? hobbies : [];
    const musicGenresArray = Array.isArray(musicGenres) ? musicGenres : [];
    const bookTypesArray = Array.isArray(bookTypes) ? bookTypes : [];
    const movieTypesArray = Array.isArray(movieTypes) ? movieTypes : [];
    const sportsArray = Array.isArray(sports) ? sports : [];
    const cuisinesArray = Array.isArray(cuisines) ? cuisines : [];
    const languagesArray = Array.isArray(languages) ? languages : [];

    // Check if hobby record already exists
    let hobby = await Hobby.findOne({
      where: { accountId },
    });

    if (hobby) {
      // Update existing record
      hobby.hobbies = hobbiesArray;
      hobby.musicGenres = musicGenresArray;
      hobby.bookTypes = bookTypesArray;
      hobby.movieTypes = movieTypesArray;
      hobby.sports = sportsArray;
      hobby.cuisines = cuisinesArray;
      hobby.languages = languagesArray;
      await hobby.save();
    } else {
      // Create new record
      hobby = await Hobby.create({
        accountId,
        hobbies: hobbiesArray,
        musicGenres: musicGenresArray,
        bookTypes: bookTypesArray,
        movieTypes: movieTypesArray,
        sports: sportsArray,
        cuisines: cuisinesArray,
        languages: languagesArray,
      });
    }

    return successResponse(res, {
      accountId: hobby.accountId,
      hobbies: hobby.hobbies,
      musicGenres: hobby.musicGenres,
      bookTypes: hobby.bookTypes,
      movieTypes: hobby.movieTypes,
      sports: hobby.sports,
      cuisines: hobby.cuisines,
      languages: hobby.languages,
    });
  } catch (error) {
    console.error('Error in saveHobbies:', error);
    return errorResponse(res, 'Failed to save hobbies', 500);
  }
};

/**
 * Get hobbies/interests for a user by accountId (for viewing other users' profiles)
 */
const getHobbiesByAccountId = async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!accountId) {
      return errorResponse(res, 'Account ID is required', 400);
    }

    const hobby = await Hobby.findOne({
      where: { accountId },
    });

    if (!hobby) {
      return successResponse(res, {
        accountId,
        hobbies: [],
        musicGenres: [],
        bookTypes: [],
        movieTypes: [],
        sports: [],
        cuisines: [],
        languages: [],
      });
    }

    return successResponse(res, {
      accountId: hobby.accountId,
      hobbies: hobby.hobbies || [],
      musicGenres: hobby.musicGenres || [],
      bookTypes: hobby.bookTypes || [],
      movieTypes: hobby.movieTypes || [],
      sports: hobby.sports || [],
      cuisines: hobby.cuisines || [],
      languages: hobby.languages || [],
    });
  } catch (error) {
    console.error('Error in getHobbiesByAccountId:', error);
    return errorResponse(res, 'Failed to fetch hobbies', 500);
  }
};

module.exports = {
  getHobbies,
  saveHobbies,
  getHobbiesByAccountId,
};
