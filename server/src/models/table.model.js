import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Table name is required'],
      trim: true,
    },
    number: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      default: 4,
    },
    location: {
      type: String,
      enum: ['indoor', 'outdoor', 'terrace', 'private', 'bar'],
      default: 'indoor',
    },
    qrSettings: {
      foregroundColor: { type: String, default: '#000000' },
      backgroundColor: { type: String, default: '#FFFFFF' },
      padding: { type: Number, default: 2 },
      cornerRadius: { type: Number, default: 0 },
      logo: { type: String, default: null },
      text: { type: String, default: '' },
      textColor: { type: String, default: '#000000' },
      textSize: { type: Number, default: 14 },
      textPositionX: { type: Number, default: 50 },
      textPositionY: { type: Number, default: 90 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
tableSchema.index({ restaurant: 1, number: 1 }, { unique: true });

// Virtual for QR URL
tableSchema.virtual('qrUrl').get(function() {
  return `/menu/${this.restaurant.slug || this.restaurant}?table=${this.number}`;
});

const Table = mongoose.model('Table', tableSchema);

export default Table;