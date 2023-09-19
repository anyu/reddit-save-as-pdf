const COMMENT_TEST_ID = 'div[data-testid="comment"]';
const SAVE_AS_PDF_BUTTON = 'button#saveAsPdfButton';
const SHARE_BUTTON_XPATH = `//button[contains(text(), 'Share')]`;

function addSaveAsPdfButton(shareButton) {
  const grandparentElement = shareButton.parentElement.parentElement;
  if (grandparentElement) {
    const saveAsPDFButton = grandparentElement.querySelector(SAVE_AS_PDF_BUTTON);

    // If Save as PDF button doesn't already exist
    if (!saveAsPDFButton) {

      // Clone Share button and update text
      const saveAsPdfButton = shareButton.cloneNode(true);
      saveAsPdfButton.textContent = "Save as PDF";
      saveAsPdfButton.id = "saveAsPdfButton";
     
      const parentElement = shareButton.parentElement;
      const grandParentElement = parentElement.parentElement;
      const greatGreatGrandParentElement = grandParentElement.parentElement.parentElement;

      // Insert "Save as PDF" to the right of "Share"
      if (grandParentElement) {
        grandParentElement.insertBefore(
          saveAsPdfButton,
          parentElement.nextSibling
        );
      }

      saveAsPdfButton.addEventListener("click", () => {
        if (greatGreatGrandParentElement) {
          var commentContent = greatGreatGrandParentElement.querySelector(COMMENT_TEST_ID);
        }
        handlePdfClick(commentContent);
      });
    }
  }
}

const handlePdfClick = async (e) => {
  const currentTimeUnix = new Date().getTime();

  const html2pdfOptions = {
    margin: 10,
    filename: `${currentTimeUnix}-reddit.pdf`,
  };

  const pdfStyles = `
  <style>
    body {
      color: black !important;
    }
  </style>
`;

  const pdfContent = document.createElement('div');
  pdfContent.innerHTML = pdfStyles + e.innerHTML;
  html2pdf().set(html2pdfOptions).from(pdfContent).save();
}

// Finds all Share buttons and triggers adding the Save as PDF button to each
function getAllShareButtons() {
  const shareButtons = document.evaluate(
    SHARE_BUTTON_XPATH,
    document,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  for (let i = 0; i < shareButtons.snapshotLength; i++) {
    const shareButton = shareButtons.snapshotItem(i);
      addSaveAsPdfButton(shareButton);
  }
}

getAllShareButtons();
setInterval(getAllShareButtons, 3000); // every 3s