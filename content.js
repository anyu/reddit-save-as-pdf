const COMMENT_SELECTOR = 'shreddit-comment-action-row[slot="actionRow"]';
const COMMENT_SHARE_SLOT_SELECTOR = 'slot[name="comment-share"]';
const COMMENT_CONTENT_SELECTOR = '#-post-rtjson-content';
const COMMENT_SHARE_BUTTON_SELECTOR = 'shreddit-comment-share-button';

// Finds all comment elements and adds the Save as PDF button to each
function checkShadowDomLoadedForAllComments(selector, intervalId) {
  const commentElements = document.querySelectorAll(selector);

  commentElements.forEach((commentElement) => {
    if (commentElement.shadowRoot) {
      clearInterval(intervalId);
      console.log(`Shadow DOM for comment '${commentElement}' has loaded.`);
      addSaveAsPdfButton(commentElement);
    }
  });
}

function addSaveAsPdfButton(shadowHost) {
      // Find the <slot> element within the Shadow DOM
      const commentShareSlot = shadowHost.shadowRoot.querySelector(COMMENT_SHARE_SLOT_SELECTOR);
      if (commentShareSlot) {
        // create and insert <slot name="comment-save-as-pdf"></slot> after share slot
        const commentSaveAsPdfSlot = document.createElement('slot');
        commentSaveAsPdfSlot.setAttribute('name', 'comment-save-as-pdf');

        const parentElement = commentShareSlot.parentElement;
        parentElement.insertBefore(commentSaveAsPdfSlot, commentShareSlot.nextSibling.nextSibling);

        const shareButton = shadowHost.querySelector(
          COMMENT_SHARE_BUTTON_SELECTOR
        );
        
        if (shareButton) {  
          // create and insert save as pdf button
          const saveAsPdfButton = document.createElement("button");
          saveAsPdfButton.textContent = "Save as PDF";
          saveAsPdfButton.id = "saveAsPdfButton";
          saveAsPdfButton.slot = "comment-save-as-pdf"

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

  
          saveAsPdfButton.addEventListener("click", () => {
            const parentComment = shadowHost.parentElement;
            if (parentComment) {
              var commentContent = parentComment.querySelector(COMMENT_CONTENT_SELECTOR);
            }
            handlePdfClick(commentContent);
          });
      
          // Insert "Save as PDF" to the right of "Share"
          shareButton.parentNode.insertBefore(
            saveAsPdfButton,
            shareButton.nextSibling.nextSibling
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
  const intervalId = setInterval(() => checkShadowDomLoadedForAllComments(COMMENT_SELECTOR, intervalId), 100);
});