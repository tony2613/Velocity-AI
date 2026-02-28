import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.velocityai.app',
    appName: 'VelocityAI',
    webDir: 'dist',
    bundledWebRuntime: false,
    server: {
        url: 'https://velocity-ai.onrender.com',
        cleartext: true
    }
};

export default config;
