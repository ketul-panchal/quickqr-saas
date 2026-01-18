import mongoose from 'mongoose';

const onboardingSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    currentStep: {
      type: String,
      enum: ['welcome', 'restaurant_info', 'menu_setup', 'theme_selection', 'completion'],
      default: 'welcome',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    restaurantInfo: {
      restaurantName: String,
      ownerName: String,
      email: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      cuisineType: [String],
      description: String,
    },
    menuSetup: {
      categories: [
        {
          name: String,
          description: String,
          order: Number,
        },
      ],
      sampleItems: Boolean,
    },
    themeSettings: {
      theme: {
        type: String,
        enum: ['modern', 'classic', 'minimal', 'vibrant', 'dark', 'elegant'],
        default: 'modern',
      },
      primaryColor: {
        type: String,
        default: '#4F46E5',
      },
      secondaryColor: {
        type: String,
        default: '#10B981',
      },
      fontFamily: {
        type: String,
        default: 'Inter',
      },
      logo: String,
    },
    completedSteps: [String],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
onboardingSchema.index({ createdAt: 1 });
onboardingSchema.index({ 'restaurantInfo.email': 1 });

const Onboarding = mongoose.model('Onboarding', onboardingSchema);

export default Onboarding;