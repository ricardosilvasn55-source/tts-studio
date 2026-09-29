import azure from './azure.js';
const providers = { azure };
export const getProvider = () => providers[process.env.TTS_PROVIDER || 'azure'];
