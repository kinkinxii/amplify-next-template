import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { loadSecrets } from './functions/secrets/resource';

defineBackend({
  auth,
  data,
  loadSecrets,
});
