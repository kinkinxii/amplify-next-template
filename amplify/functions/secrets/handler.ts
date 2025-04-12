import type { Handler, Context } from "aws-lambda";

export const handler: Handler = async (event: any, context: Context) => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
}