import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      index: true,
    },
    type: {
      type: String,
      enum: ['new_order', 'order_status', 'menu_update', 'system', 'review'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient querying
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

// Clean up old notifications (keep last 100)
notificationSchema.statics.cleanOldNotifications = async function(userId, keepCount = 100) {
  const notifications = await this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(keepCount)
    .select('_id');
  
  if (notifications.length > 0) {
    await this.deleteMany({
      _id: { $in: notifications.map(n => n._id) }
    });
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
