import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
      default: null,
    },
    image: {
      url: String,
      publicId: String,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    variants: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    addons: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    tags: [String],
    badges: {
      isNew: { type: Boolean, default: false },
      isBestseller: { type: Boolean, default: false },
      isSpicy: { type: Boolean, default: false },
      isVegetarian: { type: Boolean, default: false },
      isVegan: { type: Boolean, default: false },
      isGlutenFree: { type: Boolean, default: false },
    },
    nutritionInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    preparationTime: {
      type: Number, // in minutes
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
menuItemSchema.index({ restaurant: 1, category: 1, order: 1 });
menuItemSchema.index({ restaurant: 1, name: 'text', description: 'text' });

// Virtual for effective price
menuItemSchema.virtual('effectivePrice').get(function () {
  return this.salePrice && this.salePrice < this.price ? this.salePrice : this.price;
});

// Virtual for discount percentage
menuItemSchema.virtual('discountPercentage').get(function () {
  if (this.salePrice && this.salePrice < this.price) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

// Pre-save: Generate slug
menuItemSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;