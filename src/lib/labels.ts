export const ROLE_LABELS: Record<string, string> = {
  COACH: "Coach",
  SUPER_ADMIN: "Super Admin",
};

export const CLIENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  INACTIVE: "Inactive",
};

export const CLIENT_STATUS_TONES: Record<string, "green" | "amber" | "blue" | "neutral"> = {
  ACTIVE: "green",
  PAUSED: "amber",
  COMPLETED: "blue",
  INACTIVE: "neutral",
};

export const GOAL_CATEGORY_LABELS: Record<string, string> = {
  MUSCLE_BUILDING: "Muscle Building",
  FAT_LOSS: "Fat Loss",
  BODY_RECOMPOSITION: "Body Recomposition",
  WEIGHT_MAINTENANCE: "Weight Maintenance",
  PERFORMANCE: "Performance",
  LIFESTYLE_OPTIMIZATION: "Lifestyle Optimization",
  LONGEVITY: "Longevity",
  POSTPARTUM_SUPPORT: "Postpartum Support",
  SUSTAINABLE_HABITS: "Sustainable Habits",
};

export const ASSESSMENT_TYPE_LABELS: Record<string, string> = {
  INITIAL: "Initial",
  FOLLOW_UP: "Follow-up",
  REVIEW: "Review",
};

export const PLAN_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

export const PLAN_STATUS_TONES: Record<string, "neutral" | "green" | "amber"> = {
  DRAFT: "neutral",
  ACTIVE: "green",
  ARCHIVED: "amber",
};

export const CHECKIN_STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Completed",
  MISSED: "Missed",
  PENDING: "Pending",
};

export const CHECKIN_STATUS_TONES: Record<string, "green" | "red" | "amber"> = {
  COMPLETED: "green",
  MISSED: "red",
  PENDING: "amber",
};

export const FOLLOWUP_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const FOLLOWUP_PRIORITY_TONES: Record<string, "neutral" | "blue" | "amber" | "red"> = {
  LOW: "neutral",
  MEDIUM: "blue",
  HIGH: "amber",
  URGENT: "red",
};

export const FOLLOWUP_STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const FOLLOWUP_STATUS_TONES: Record<string, "amber" | "green" | "neutral"> = {
  OPEN: "amber",
  COMPLETED: "green",
  CANCELLED: "neutral",
};

export const SEX_LABELS: Record<string, string> = {
  female: "Female",
  male: "Male",
  other: "Other",
};

export const HABIT_FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
};

export const PHOTO_TYPE_LABELS: Record<string, string> = {
  FRONT: "Front",
  SIDE: "Side",
  BACK: "Back",
};