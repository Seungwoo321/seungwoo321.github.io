const { withContentlayer } = require('next-contentlayer')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const googleAdsensCsp = {
  connectSrc: 'pagead2.googlesyndication.com',
  imgSrc: 'pagead2.googlesyndication.com',
  frameSrc: 'googleads.g.doubleclick.net tpc.googlesyndication.com',
  scriptSrc:
    'pagead2.googlesyndication.com partner.googleadservices.com tpc.googlesyndication.com www.googletagservices.com adservice.google.com adservice.google.ad adservice.google.ae adservice.google.com.af adservice.google.com.ag adservice.google.com.ai adservice.google.al adservice.google.am adservice.google.co.ao adservice.google.com.ar adservice.google.as adservice.google.at adservice.google.com.au adservice.google.az adservice.google.ba adservice.google.com.bd adservice.google.be adservice.google.bf adservice.google.bg adservice.google.com.bh adservice.google.bi adservice.google.bj adservice.google.com.bn adservice.google.com.bo adservice.google.com.br adservice.google.bs adservice.google.bt adservice.google.co.bw adservice.google.by adservice.google.com.bz adservice.google.ca adservice.google.cd adservice.google.cf adservice.google.cg adservice.google.ch adservice.google.ci adservice.google.co.ck adservice.google.cl adservice.google.cm adservice.google.cn adservice.google.com.co adservice.google.co.cr adservice.google.com.cu adservice.google.cv adservice.google.com.cy adservice.google.cz adservice.google.de adservice.google.dj adservice.google.dk adservice.google.dm adservice.google.com.do adservice.google.dz adservice.google.com.ec adservice.google.ee adservice.google.com.eg adservice.google.es adservice.google.com.et adservice.google.fi adservice.google.com.fj adservice.google.fm adservice.google.fr adservice.google.ga adservice.google.ge adservice.google.gg adservice.google.com.gh adservice.google.com.gi adservice.google.gl adservice.google.gm adservice.google.gr adservice.google.com.gt adservice.google.gy adservice.google.com.hk adservice.google.hn adservice.google.hr adservice.google.ht adservice.google.hu adservice.google.co.id adservice.google.ie adservice.google.co.il adservice.google.im adservice.google.co.in adservice.google.iq adservice.google.is adservice.google.it adservice.google.je adservice.google.com.jm adservice.google.jo adservice.google.co.jp adservice.google.co.ke adservice.google.com.kh adservice.google.ki adservice.google.kg adservice.google.co.kr adservice.google.com.kw adservice.google.kz adservice.google.la adservice.google.com.lb adservice.google.li adservice.google.lk adservice.google.co.ls adservice.google.lt adservice.google.lu adservice.google.lv adservice.google.com.ly adservice.google.co.ma adservice.google.md adservice.google.me adservice.google.mg adservice.google.mk adservice.google.ml adservice.google.com.mm adservice.google.mn adservice.google.ms adservice.google.com.mt adservice.google.mu adservice.google.mv adservice.google.mw adservice.google.com.mx adservice.google.com.my adservice.google.co.mz adservice.google.com.na adservice.google.com.ng adservice.google.com.ni adservice.google.ne adservice.google.nl adservice.google.no adservice.google.com.np adservice.google.nr adservice.google.nu adservice.google.co.nz adservice.google.com.om adservice.google.com.pa adservice.google.com.pe adservice.google.com.pg adservice.google.com.ph adservice.google.com.pk adservice.google.pl adservice.google.pn adservice.google.com.pr adservice.google.ps adservice.google.pt adservice.google.com.py adservice.google.com.qa adservice.google.ro adservice.google.ru adservice.google.rw adservice.google.com.sa adservice.google.com.sb adservice.google.sc adservice.google.se adservice.google.com.sg adservice.google.sh adservice.google.si adservice.google.sk adservice.google.com.sl adservice.google.sn adservice.google.so adservice.google.sm adservice.google.sr adservice.google.st adservice.google.com.sv adservice.google.td adservice.google.tg adservice.google.co.th adservice.google.com.tj adservice.google.tl adservice.google.tm adservice.google.tn adservice.google.to adservice.google.com.tr adservice.google.tt adservice.google.com.tw adservice.google.co.tz adservice.google.com.ua adservice.google.co.ug adservice.google.co.uk adservice.google.com.uy adservice.google.co.uz adservice.google.com.vc adservice.google.co.ve adservice.google.vg adservice.google.co.vi adservice.google.com.vn adservice.google.vu adservice.google.ws adservice.google.rs adservice.google.co.za adservice.google.co.zm adservice.google.co.zw adservice.google.cat',
}

// You might need to insert additional domains in script-src if you are using external services
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' utteranc.es codesandbox.io  *.googletagmanager.com ${googleAdsensCsp.scriptSrc};
  style-src 'self' 'unsafe-inline' codesandbox.io;
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self';
  frame-src utteranc.es codesandbox.io jsfiddle.net ${googleAdsensCsp.frameSrc};
  worker-src 'self' codesandbox.io;
`

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
module.exports = () => {
  const plugins = [withContentlayer, withBundleAnalyzer]
  return plugins.reduce((acc, next) => next(acc), {
    reactStrictMode: true,
    images: {
      loader: 'akamai',
      path: '/',
    },
    assetPrefix: '/',
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    eslint: {
      dirs: ['pages', 'components', 'lib', 'layouts', 'scripts'],
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
      ]
    },
    webpack: (config) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })

      return config
    },
  })
}
