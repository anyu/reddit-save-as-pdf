# Reddit Save as PDF

![](landing-page/images/other-assets/logo-banner.svg)
A handy Chrome extension to save a Reddit comment as PDF.

Because occasionally I want to do so.

![](landing-page/images/preview.gif)


### Requirements
Works with the new Reddit UI, not old.

### Installation

Available in the Chrome Web Store: [Reddit Save as PDF](https://chrome.google.com/webstore/detail/reddit-save-as-pdf/fbeeakkgbicfdjofohpdfjhfpfiglmhh)

### Dev Notes
This extension does not make use of commonly used JS/HTML to PDF libraries such as [jsPDF](https://github.com/parallax/jsPDF) or [html2pdf](https://github.com/eKoopmans/html2pdf.js), as they all rely on [html2canvas](https://github.com/niklasvh/html2canvas) under the hood, whose own FAQ discourages its use in browser extensions (I encountered CSP errors with it for logged in users)