const User = require('../models/User');
const Contact = require('../models/Contact');
const Consultation = require('../models/Consultation');
const Payment = require('../models/Payment');

// GET /api/admin/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalAdmins,

      totalEnquiries,
      newEnquiries,
      assessedEnquiries,
      quotedEnquiries,
      inProgressEnquiries,
      deliveredEnquiries,
      closedEnquiries,

      totalConsultations,
      pendingConsultations,
      confirmedConsultations,
      completedConsultations,
      cancelledConsultations,

      totalPayments,
      paidPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,

      revenueResult,

      recentEnquiries,
      recentConsultations,
      recentPayments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'admin' }),

      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      Contact.countDocuments({ status: 'assessed' }),
      Contact.countDocuments({ status: 'quoted' }),
      Contact.countDocuments({ status: 'in-progress' }),
      Contact.countDocuments({ status: 'delivered' }),
      Contact.countDocuments({ status: 'closed' }),

      Consultation.countDocuments(),
      Consultation.countDocuments({ status: 'pending' }),
      Consultation.countDocuments({ status: 'confirmed' }),
      Consultation.countDocuments({ status: 'completed' }),
      Consultation.countDocuments({ status: 'cancelled' }),

      Payment.countDocuments(),
      Payment.countDocuments({ status: 'paid' }),
      Payment.countDocuments({ status: 'created' }),
      Payment.countDocuments({ status: 'failed' }),
      Payment.countDocuments({ status: 'refunded' }),

      Payment.aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id: '$currency',
            total: { $sum: '$amount' }
          }
        }
      ]),

      Contact.find()
        .select('fullName email subject documentType status createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Consultation.find()
        .select('name email preferredDate preferredTime topic status createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Payment.find()
        .select('contactId amount currency purpose package bookTitle status createdAt')
        .populate('contactId', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const revenueByCurrency = {};

    revenueResult.forEach((item) => {
      revenueByCurrency[item._id || 'INR'] = item.total;
    });

    res.json({
      success: true,

      users: {
        total: totalUsers,
        customers: totalCustomers,
        admins: totalAdmins
      },

      enquiries: {
        total: totalEnquiries,
        new: newEnquiries,
        assessed: assessedEnquiries,
        quoted: quotedEnquiries,
        inProgress: inProgressEnquiries,
        delivered: deliveredEnquiries,
        closed: closedEnquiries
      },

      consultations: {
        total: totalConsultations,
        pending: pendingConsultations,
        confirmed: confirmedConsultations,
        completed: completedConsultations,
        cancelled: cancelledConsultations
      },

      payments: {
        total: totalPayments,
        paid: paidPayments,
        pending: pendingPayments,
        failed: failedPayments,
        refunded: refundedPayments,
        revenueByCurrency
      },

      recentActivity: {
        enquiries: recentEnquiries,
        consultations: recentConsultations,
        payments: recentPayments
      }
    });
  } catch (error) {
    next(error);
  }
};