# Reddit Save as PDF

![](docs/images/banner.svg)
A chrome extension to save a Reddit comment as PDF.

Because occasionally I want to do so.

![](docs/images/preview.gif)

### Requirements
- Works with the new Reddit UI, not old.

### Installation

Installation is currently manual as this is an unpublished extension.

1. Clone this repo
1. Go to: [chrome://extensions](chrome://extensions)
1. Enable **Developer mode**
1. Load unpacked, select this directory
1. Enable the extension

### Dev Notes
- This extension does not make use of commonly used JS/HTML to PDF libraries such as [jsPDF](https://github.com/parallax/jsPDF) or [html2pdf](https://github.com/eKoopmans/html2pdf.js), as they all rely on [html2canvas](https://github.com/niklasvh/html2canvas) under the hood, which does not encourage its use in browser extensions. One such known-ish issue that I encountered with html2canvas was CSP errors (when a user is logged in).