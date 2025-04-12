import {defineFunction, secret} from '@aws-amplify/backend';

export const loadSecrets = defineFunction({
    name: 'load-secrets',
    entry: './handler.ts',
    environment: {
        OPENAI_API_KEY: secret('OPENAI_API_KEY'),
    },
});

