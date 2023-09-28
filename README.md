# Reddit - Save as PDF

![](images/banner.svg)
A chrome extension to save a Reddit comment as PDF.

Because occasionally I want to do so.

![](images/preview.png)

### Requirements
- Works with the new Reddit UI, not old.
- Bundles [html2pdf](https://github.com/eKoopmans/html2pdf.js) v0.9.3, since Chrome Manifest v3 [no longer allows](https://developer.chrome.com/docs/extensions/migrating/improve-security/#remove-remote-code) executing remotely hosted files directly.

### Installation

Installation is currently manual as this is an unpublished extension.

1. Clone this repo
1. Go to: [chrome://extensions](chrome://extensions)
1. Enable **Developer mode**
1. Load unpacked, select this directory
1. Enable the extension

Probably disable it after trying out for now :D

### TODO
- Try [jsPDF](https://github.com/parallax/jsPDF) directly
  - Hopefully solves issue w/ CSP error on extension page (triggered only when logged in and hit the Save as PDF button, even though functionality still works)
  - Should be able to save PDF as text instead of image
- Simplify DOM traversal

#### Nice to haves
- Use bg worker to open up embed page and save nicer version?
- Add Save to PDF button elsewhere too (main post, from homepage, etc)
