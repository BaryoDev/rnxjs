import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url)).split('\\').join('/');

// Classes live in component JS as well as the theme file, so scan both.
export const content = [
  `${root}/components/**/*.js`,
  `${root}/themes/tailwind/**/*.js`
];

export default {
  content,
  theme: {
    extend: {
      keyframes: {
        'rnx-toast-in': {
          from: { opacity: '0', transform: 'translateY(-0.5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'rnx-toast-in': 'rnx-toast-in 200ms ease-out'
      }
    }
  }
};
