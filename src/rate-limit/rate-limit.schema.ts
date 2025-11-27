export type RateLimitEntry = {
	hits: number;
	resetAt: number;
};

export type RateLimitResult = {
	allowed: boolean;
	remaining: number;
	resetAt: number;
};
