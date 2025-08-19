import { db } from '@/db';
import { userSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { subscriptionCreateSchema, subscriptionUpdateSchema, subscriptionPlanSchema, subscriptionStatusSchema, billingCycleSchema } from '@/constants';

export class SubscriptionService {
	async get(userId: string) {
		const rows = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId)).limit(1);
		return rows[0] || null;
	}

	async ensure(userId: string) {
		console.log(`[SubscriptionService] Ensuring subscription for user: ${userId}`);
		const current = await this.get(userId);
		if (current) {
			console.log(`[SubscriptionService] Found existing subscription:`, current);
			return current;
		}
		console.log(`[SubscriptionService] Creating new subscription for user: ${userId}`);
		try {
			const [inserted] = await db.insert(userSubscriptions).values({ 
				userId, 
				plan: 'free', 
				status: 'active', 
				billingCycle: 'monthly', 
				priceCents: 0, 
				currency: 'THB' 
			}).returning();
			console.log(`[SubscriptionService] Created subscription:`, inserted);
			return inserted;
		} catch (error) {
			console.error(`[SubscriptionService] Error creating subscription:`, error);
			throw error;
		}
	}

	async createOrUpdate(userId: string, input: z.infer<typeof subscriptionCreateSchema>) {
		const validated = subscriptionCreateSchema.parse(input);
		const existing = await this.get(userId);
		if (existing) {
			const [updated] = await db
				.update(userSubscriptions)
				.set({
					plan: validated.plan,
					status: validated.status,
					billingCycle: validated.cycle.type,
					priceCents: validated.cycle.priceCents,
					currency: validated.cycle.currency,
					trialEndsAt: validated.trialEndsAt ? new Date(validated.trialEndsAt) : null,
					currentPeriodEnd: validated.currentPeriodEnd ? new Date(validated.currentPeriodEnd) : null,
					updatedAt: new Date(),
				})
				.where(eq(userSubscriptions.userId, userId))
				.returning();
			return updated;
		}
		const [inserted] = await db
			.insert(userSubscriptions)
			.values({
				userId,
				plan: validated.plan,
				status: validated.status,
				billingCycle: validated.cycle.type,
				priceCents: validated.cycle.priceCents,
				currency: validated.cycle.currency,
				trialEndsAt: validated.trialEndsAt ? new Date(validated.trialEndsAt) : null,
				currentPeriodEnd: validated.currentPeriodEnd ? new Date(validated.currentPeriodEnd) : null,
			})
			.returning();
		return inserted;
	}

	async update(userId: string, input: z.infer<typeof subscriptionUpdateSchema>) {
		const validated = subscriptionUpdateSchema.parse(input);
		const [updated] = await db
			.update(userSubscriptions)
			.set({
				plan: validated.plan ?? undefined,
				status: validated.status ?? undefined,
				billingCycle: validated.cycle?.type ?? undefined,
				priceCents: validated.cycle?.priceCents ?? undefined,
				currency: validated.cycle?.currency ?? undefined,
				trialEndsAt: validated.trialEndsAt ? new Date(validated.trialEndsAt) : undefined,
				currentPeriodEnd: validated.currentPeriodEnd ? new Date(validated.currentPeriodEnd) : undefined,
				updatedAt: new Date(),
			})
			.where(eq(userSubscriptions.userId, userId))
			.returning();
		if (!updated) throw new Error('Subscription not found');
		return updated;
	}
}

export const subscriptionService = new SubscriptionService(); 