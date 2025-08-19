import { z } from 'zod';

export const onboardingProfileSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
	ownerBirthDay: z.string().optional(),
	ownerBirthMonth: z.string().optional(),
	ownerBirthYear: z.string().optional(),
	ownerGender: z.string().optional(),
	ownerProvince: z.string().optional(),
	ownerAgreeTerms: z.boolean().default(false),
	marketingConsent: z.boolean().optional(),
	tosConsent: z.boolean().optional(),
	tosVersion: z.string().optional(),
});

// General pet schema for onboarding flows (flexible)
export const onboardingPetSchema = z.object({
	petName: z.string().min(1, "Pet name is required"),
	petType: z.enum(["dog", "cat", "other"]),
	petBreed: z.string().optional(),
	breedId: z.string().uuid().optional(),
	petGender: z.enum(["male", "female", "unknown"]),
	neutered: z.enum(["yes", "no", "not_sure"]),
	petBirthDay: z.string().optional(),
	petBirthMonth: z.string().optional(),
	petBirthYear: z.string().optional(),
	avatarUrl: z.string().url().optional(),
});

// Strict pet schema (e.g., when requiring a text breed name)
export const onboardingPetSchemaStrict = onboardingPetSchema.extend({
	petBreed: z.string().min(1, "Pet breed is required"),
});

export const completeOnboardingSchemaStrict = z.object({
	profile: onboardingProfileSchema,
	pet: onboardingPetSchemaStrict,
}); 