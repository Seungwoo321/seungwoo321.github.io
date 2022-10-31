import Script from 'next/script'

export default function GoogleAdsenseScript() {
  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7701657858733816"
        crossOrigin="anonymous"
      ></Script>
    </>
  )
}
