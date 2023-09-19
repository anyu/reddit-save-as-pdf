const COMMENT_TEST_ID = 'div[data-testid="comment"]';
const BUTTON_XPATH = `//button[contains(text(), 'Share')]`;

function addSaveAsPdfButton(shareButton) {
  const grandparentElement = shareButton.parentElement.parentElement;

  if (grandparentElement) {
    const saveAsPDFButton = grandparentElement.querySelector('button#saveAsPdfButton');
    if (!saveAsPDFButton) {

      const saveAsPdfButton = shareButton.cloneNode(true);
      saveAsPdfButton.textContent = "Save as PDF";
      saveAsPdfButton.id = "saveAsPdfButton";
     
      const parentElement = shareButton.parentElement;
      const grandParentElement = parentElement.parentElement;
      const greatGreatGrandParentElement = grandParentElement.parentElement.parentElement;

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

function observeShareButtons() {
  const shareButtons = document.evaluate(
    BUTTON_XPATH,
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

observeShareButtons();
setInterval(observeShareButtons, 3000); // every 3s