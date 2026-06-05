import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.exam.mistakes',
  appName: '考研错题本',
  webDir: 'server/dist-public',
  android: {
    allowMixedContent: true,
  },
};

export default config;
