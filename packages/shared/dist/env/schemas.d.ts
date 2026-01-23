import { z } from 'zod';
export declare const ApiEnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    API_PORT: z.ZodDefault<z.ZodNumber>;
    DATABASE_URL: z.ZodOptional<z.ZodString>;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    S3_ENDPOINT: z.ZodOptional<z.ZodString>;
    S3_ACCESS_KEY: z.ZodOptional<z.ZodString>;
    S3_SECRET_KEY: z.ZodOptional<z.ZodString>;
    S3_BUCKET: z.ZodOptional<z.ZodString>;
    S3_REGION: z.ZodOptional<z.ZodString>;
    S3_FORCE_PATH_STYLE: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    API_PORT: number;
    DATABASE_URL?: string | undefined;
    REDIS_URL?: string | undefined;
    S3_ENDPOINT?: string | undefined;
    S3_ACCESS_KEY?: string | undefined;
    S3_SECRET_KEY?: string | undefined;
    S3_BUCKET?: string | undefined;
    S3_REGION?: string | undefined;
    S3_FORCE_PATH_STYLE?: string | undefined;
}, {
    NODE_ENV?: "development" | "test" | "production" | undefined;
    API_PORT?: number | undefined;
    DATABASE_URL?: string | undefined;
    REDIS_URL?: string | undefined;
    S3_ENDPOINT?: string | undefined;
    S3_ACCESS_KEY?: string | undefined;
    S3_SECRET_KEY?: string | undefined;
    S3_BUCKET?: string | undefined;
    S3_REGION?: string | undefined;
    S3_FORCE_PATH_STYLE?: string | undefined;
}>;
export declare const BotEnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    BOT_TOKEN: z.ZodString;
    BOT_LOG_LEVEL: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    BOT_TOKEN: string;
    BOT_LOG_LEVEL: "debug" | "info" | "warn" | "error";
}, {
    BOT_TOKEN: string;
    NODE_ENV?: "development" | "test" | "production" | undefined;
    BOT_LOG_LEVEL?: "debug" | "info" | "warn" | "error" | undefined;
}>;
export declare const WebappEnvSchema: z.ZodObject<{
    VITE_API_BASE_URL: z.ZodOptional<z.ZodString>;
    VITE_USE_MSW: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    VITE_API_BASE_URL?: string | undefined;
    VITE_USE_MSW?: string | undefined;
}, {
    VITE_API_BASE_URL?: string | undefined;
    VITE_USE_MSW?: string | undefined;
}>;
export type ApiEnv = z.infer<typeof ApiEnvSchema>;
export type BotEnv = z.infer<typeof BotEnvSchema>;
export type WebappEnv = z.infer<typeof WebappEnvSchema>;
//# sourceMappingURL=schemas.d.ts.map