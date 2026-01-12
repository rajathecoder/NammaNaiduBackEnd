const FamilyDetail = require('../../models/FamilyDetail.model');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Get family details for a user
 */
const getFamilyDetails = async (req, res) => {
  try {
    const accountId = req.accountId || req.userAccountId;

    if (!accountId) {
      return errorResponse(res, 'User account ID not found', 401);
    }

    const familyDetail = await FamilyDetail.findOne({
      where: { accountId },
    });

    if (!familyDetail) {
      return successResponse(res, {
        accountId,
        fatherName: null,
        fatherOccupation: null,
        fatherStatus: null,
        motherName: null,
        motherOccupation: null,
        motherStatus: null,
        siblings: [],
      });
    }

    return successResponse(res, {
      accountId: familyDetail.accountId,
      fatherName: familyDetail.fatherName || null,
      fatherOccupation: familyDetail.fatherOccupation || null,
      fatherStatus: familyDetail.fatherStatus || 'alive',
      motherName: familyDetail.motherName || null,
      motherOccupation: familyDetail.motherOccupation || null,
      motherStatus: familyDetail.motherStatus || 'alive',
      siblings: familyDetail.siblings || [],
    });
  } catch (error) {
    console.error('Error in getFamilyDetails:', error);
    return errorResponse(res, 'Failed to fetch family details', 500);
  }
};

/**
 * Create or update family details for a user
 */
const saveFamilyDetails = async (req, res) => {
  try {
    const accountId = req.accountId || req.userAccountId;
    const { fatherName, fatherOccupation, fatherStatus, motherName, motherOccupation, motherStatus, siblings } = req.body;

    if (!accountId) {
      return errorResponse(res, 'User account ID not found', 401);
    }

    // Validate siblings is an array if provided
    let siblingsArray = [];
    if (siblings) {
      if (Array.isArray(siblings)) {
        siblingsArray = siblings;
      } else {
        return errorResponse(res, 'Siblings must be an array', 400);
      }
    }

    // Check if family detail already exists
    let familyDetail = await FamilyDetail.findOne({
      where: { accountId },
    });

    if (familyDetail) {
      // Update existing record
      familyDetail.fatherName = fatherName !== undefined ? fatherName : familyDetail.fatherName;
      familyDetail.fatherOccupation = fatherOccupation !== undefined ? fatherOccupation : familyDetail.fatherOccupation;
      familyDetail.fatherStatus = fatherStatus || familyDetail.fatherStatus || 'alive';
      familyDetail.motherName = motherName !== undefined ? motherName : familyDetail.motherName;
      familyDetail.motherOccupation = motherOccupation !== undefined ? motherOccupation : familyDetail.motherOccupation;
      familyDetail.motherStatus = motherStatus || familyDetail.motherStatus || 'alive';
      familyDetail.siblings = siblingsArray.length > 0 ? siblingsArray : familyDetail.siblings;
      await familyDetail.save();
    } else {
      // Create new record
      familyDetail = await FamilyDetail.create({
        accountId,
        fatherName: fatherName || null,
        fatherOccupation: fatherOccupation || null,
        fatherStatus: fatherStatus || 'alive',
        motherName: motherName || null,
        motherOccupation: motherOccupation || null,
        motherStatus: motherStatus || 'alive',
        siblings: siblingsArray,
      });
    }

    return successResponse(res, {
      accountId: familyDetail.accountId,
      fatherName: familyDetail.fatherName,
      fatherOccupation: familyDetail.fatherOccupation,
      fatherStatus: familyDetail.fatherStatus,
      motherName: familyDetail.motherName,
      motherOccupation: familyDetail.motherOccupation,
      motherStatus: familyDetail.motherStatus,
      siblings: familyDetail.siblings,
    });
  } catch (error) {
    console.error('Error in saveFamilyDetails:', error);
    return errorResponse(res, 'Failed to save family details', 500);
  }
};

/**
 * Get family details for a user by accountId (for viewing other users' profiles)
 */
const getFamilyDetailsByAccountId = async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!accountId) {
      return errorResponse(res, 'Account ID is required', 400);
    }

    const familyDetail = await FamilyDetail.findOne({
      where: { accountId },
    });

    if (!familyDetail) {
      return successResponse(res, {
        accountId,
        fatherName: null,
        fatherOccupation: null,
        fatherStatus: null,
        motherName: null,
        motherOccupation: null,
        motherStatus: null,
        siblings: [],
      });
    }

    return successResponse(res, {
      accountId: familyDetail.accountId,
      fatherName: familyDetail.fatherName || null,
      fatherOccupation: familyDetail.fatherOccupation || null,
      fatherStatus: familyDetail.fatherStatus || 'alive',
      motherName: familyDetail.motherName || null,
      motherOccupation: familyDetail.motherOccupation || null,
      motherStatus: familyDetail.motherStatus || 'alive',
      siblings: familyDetail.siblings || [],
    });
  } catch (error) {
    console.error('Error in getFamilyDetailsByAccountId:', error);
    return errorResponse(res, 'Failed to fetch family details', 500);
  }
};

module.exports = {
  getFamilyDetails,
  saveFamilyDetails,
  getFamilyDetailsByAccountId,
};
