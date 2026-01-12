const Notification = require('../../models/Notification.model');
const User = require('../../models/User.model');
const PersonPhoto = require('../../models/PersonPhoto.model');

const getMyNotifications = async (req, res) => {
    try {
        const userId = req.accountId;

        const notifications = await Notification.findAll({
            where: { userId },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['name', 'accountId', 'userCode'],
                    include: [{
                        model: PersonPhoto,
                        as: 'personPhoto',
                        attributes: ['photo1']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.accountId;

        await Notification.update(
            { isRead: true },
            { where: { id, userId } }
        );

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification'
        });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.accountId;

        await Notification.update(
            { isRead: true },
            { where: { userId, isRead: false } }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notifications'
        });
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead
};
