const SHARE_MENU_SELECTOR = `div[id$="-comment-share-menu"] button`;

function getAllShareButtons() {
  
  const buttonXPath = `//button[contains(text(), 'Share')]`;
  const shareButtonSnapshot = document.evaluate(
    buttonXPath,
    document,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

    const shareButtons = [];
    for (let i = 0; i < shareButtonSnapshot.snapshotLength; i++) {
      const shareButton = shareButtonSnapshot.snapshotItem(i);
      shareButtons.push(shareButton);
    }

    if (shareButtons.length > 0) {
      shareButtons.forEach((shareBtn) => {
          addSaveAsPdfButton(shareBtn);
      });
    }
}

function addSaveAsPdfButton(shareButton) {
  if (shareButton) {  
    const saveAsPdfButton = document.createElement("button");
    saveAsPdfButton.textContent = "Save as PDF";
    saveAsPdfButton.id = "saveAsPdfButton";

    const shareButtonStyles = getComputedStyle(shareButton);

    saveAsPdfButton.style.backgroundColor = shareButtonStyles.backgroundColor;
    saveAsPdfButton.style.color = shareButtonStyles.color;

    saveAsPdfButton.addEventListener("mouseover", () => {
      saveAsPdfButton.style.backgroundColor = shareButtonStyles.backgroundColor;
      saveAsPdfButton.style.color = shareButtonStyles.color;
    });

    saveAsPdfButton.addEventListener("mouseout", () => {
      saveAsPdfButton.style.backgroundColor = "";
      saveAsPdfButton.style.color = "";
    });

    const parentComment = shareButton.parentElement;
    const grandParentComment = parentComment.parentElement;

    if (grandParentComment) {
      grandParentComment.insertBefore(
        saveAsPdfButton,
        parentComment.nextSibling
      );
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

// Run function on page load
window.addEventListener("load", () => {
  getAllShareButtons();
});