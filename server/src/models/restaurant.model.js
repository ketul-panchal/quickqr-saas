import mongoose from 'mongoose';

const workingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  openTime: {
    type: String,
    default: '09:00',
  },
  closeTime: {
    type: String,
    default: '22:00',
  },
}, { _id: false });

const restaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      fullAddress: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    logo: {
      url: String,
      publicId: String,
    },
    coverImage: {
      url: String,
      publicId: String,
    },
    template: {
      type: String,
      enum: ['modern', 'classic', 'elegant', 'minimal'],
      default: 'modern',
    },
    theme: {
      primaryColor: {
        type: String,
        default: '#0ea5e9',
      },
      secondaryColor: {
        type: String,
        default: '#10b981',
      },
      fontFamily: {
        type: String,
        default: 'Inter',
      },
    },
    workingHours: {
      type: [workingHoursSchema],
      default: [
        { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
        { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
        { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
        { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
        { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '23:00' },
        { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '23:00' },
        { day: 'sunday', isOpen: true, openTime: '10:00', closeTime: '21:00' },
      ],
    },
    timing: {
      type: String,
      trim: true,
      maxlength: [100, 'Timing cannot exceed 100 characters'],
    },
    cuisineTypes: [{
      type: String,
      trim: true,
    }],
    features: {
      hasDelivery: { type: Boolean, default: false },
      hasTakeaway: { type: Boolean, default: true },
      hasDineIn: { type: Boolean, default: true },
      hasReservation: { type: Boolean, default: false },
      acceptsOnlinePayment: { type: Boolean, default: false },
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
    },
    stats: {
      totalMenuItems: { type: Number, default: 0 },
      totalCategories: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalScans: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
    },
    qrCode: {
      url: String,
      publicId: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
restaurantSchema.index({ slug: 1 }, { unique: true });
restaurantSchema.index({ owner: 1, createdAt: -1 });
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ isActive: 1, isPublished: 1 });

// Virtual for menu URL
restaurantSchema.virtual('menuUrl').get(function () {
  return `/menu/${this.slug}`;
});

// Virtual for full address
restaurantSchema.virtual('formattedAddress').get(function () {
  const { street, city, state, zipCode, country } = this.address || {};
  const parts = [street, city, state, zipCode, country].filter(Boolean);
  return parts.join(', ');
});

// Pre-save middleware to update fullAddress
restaurantSchema.pre('save', function (next) {
  if (this.address) {
    const { street, city, state, zipCode, country } = this.address;
    const parts = [street, city, state, zipCode, country].filter(Boolean);
    this.address.fullAddress = parts.join(', ');
  }
  next();
});

// Static method to check if slug exists
restaurantSchema.statics.isSlugTaken = async function (slug, excludeId) {
  const restaurant = await this.findOne({ slug, _id: { $ne: excludeId } });
  return !!restaurant;
};

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;