const User = require('../../models/User.model');
const BasicDetail = require('../../models/BasicDetail.model');
const SubscriptionTransaction = require('../../models/SubscriptionTransaction.model');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../../utils/response');
const sequelize = require('../../config/database').sequelize;

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Get this week's date range (last 7 days)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get last 30 days for active users
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total users count
    const totalUsers = await User.count();

    // New registrations today
    const newRegistrationsToday = await User.count({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lte]: todayEnd,
        },
      },
    });

    // New registrations this week
    const newRegistrationsThisWeek = await User.count({
      where: {
        createdAt: {
          [Op.gte]: weekAgo,
        },
      },
    });

    // Men and Women counts
    const menCount = await User.count({
      where: {
        gender: 'Male',
      },
    });

    const womenCount = await User.count({
      where: {
        gender: 'Female',
      },
    });

    // Verified profiles - count from public.users where profileveriffied = 1
    const verifiedProfiles = await User.count({
      where: {
        profileveriffied: 1,
      },
    });

    // Pending approvals (users with photos but not fully verified)
    // Users who have photos but profileverified or proofverified is 0 or null
    const usersWithPhotos = await sequelize.query(
      `SELECT DISTINCT u.id 
       FROM users u
       INNER JOIN person_photos pp ON pp."personId" = u."accountId"
       LEFT JOIN basic_details bd ON bd."accountId" = u."accountId"
       WHERE (bd.profileverified = 0 OR bd.profileverified IS NULL OR bd.proofverified = 0 OR bd.proofverified IS NULL)
       OR bd.id IS NULL`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const pendingApprovals = usersWithPhotos.length;

    // Premium users (users with active subscription transactions)
    // Users who have at least one successful transaction
    const premiumUsersResult = await sequelize.query(
      `SELECT COUNT(DISTINCT "userId") as count
       FROM subscription_transactions
       WHERE status = 'success'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const premiumUsers = parseInt(premiumUsersResult[0]?.count || 0);

    // Active users (users who logged in or were active in last 30 days)
    // For now, we'll use users created in last 30 days as active
    // You can modify this based on your activity tracking
    const activeUsers = await User.count({
      where: {
        [Op.or]: [
          { createdAt: { [Op.gte]: thirtyDaysAgo } },
          { updatedAt: { [Op.gte]: thirtyDaysAgo } },
        ],
      },
    });

    // Inactive users (users not active in last 30 days)
    const inactiveUsers = totalUsers - activeUsers;

    // Total revenue (sum of all successful transactions)
    const revenueResult = await SubscriptionTransaction.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue'],
      ],
      where: {
        status: 'success',
      },
      raw: true,
    });

    const totalRevenue = parseFloat(revenueResult?.totalRevenue || 0);

    // Reported profiles (for now, set to 0 as we don't have a reports model)
    // You can update this when you add a reports/complaints feature
    const reportedProfiles = 0;

    const stats = {
      totalUsers,
      newRegistrationsToday,
      newRegistrationsThisWeek,
      menCount,
      womenCount,
      verifiedProfiles,
      pendingApprovals,
      premiumUsers,
      activeUsers,
      inactiveUsers,
      totalRevenue,
      reportedProfiles,
    };

    return successResponse(res, stats);
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return errorResponse(res, `Failed to fetch dashboard stats: ${error.message}`, 500);
  }
};

module.exports = {
  getDashboardStats,
};
