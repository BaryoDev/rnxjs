// CommonJS copy of tailwind.preset.js. Keep the two in sync (a test checks it).
const root = __dirname.split('\\').join('/');

const content = [
  `${root}/components/**/*.js`,
  `${root}/themes/tailwind/**/*.js`
];

module.exports = {
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
module.exports.default = module.exports;
module.exports.content = content;
