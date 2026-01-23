import { z } from 'zod';
export declare function validateOrThrow<T extends z.ZodTypeAny>(schema: T, rawEnv: Record<string, unknown>): z.infer<T>;
//# sourceMappingURL=validate.d.ts.map