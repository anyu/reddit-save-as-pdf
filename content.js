window.addEventListener("load", () => {
  detectLoggedInStatus()
});

const HEADER_USER_DROPDOWN = '.header-user-dropdown';

function detectLoggedInStatus() {
  const headerUserDropdown = document.querySelector(HEADER_USER_DROPDOWN);
  if (headerUserDropdown) { // user is logged in
    getAllShareButtons();
    setInterval(getAllShareButtons, 3000); // every 3s
  } else {
    getAllComments();
    setInterval(getAllComments, 3000);
  }
}

const handlePdfClick = async (e, linkToComment) => {
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

  const linkToCommentHTML = `
  <div>
    <a href="${linkToComment}" target="_blank">${linkToComment}</a>
  </div>
`;

  pdfContent.innerHTML = pdfStyles + e.innerHTML + linkToCommentHTML;
  html2pdf().set(html2pdfOptions).from(pdfContent).save();
}

/************************* LOGGED IN ***************************/

const COMMENT_TEST_ID = 'div[data-testid="comment"]';
const SAVE_AS_PDF_BUTTON = 'button#saveAsPdfButton';
const SHARE_BUTTON_XPATH = `//button[contains(text(), 'Share')]`;

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
    addSaveAsPdfButtonWhenLoggedIn(shareButton);
  }
}

function addSaveAsPdfButtonWhenLoggedIn(shareButton) {
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

/************************* LOGGED OUT ***************************/

const COMMENT_ROW = 'shreddit-comment-action-row[slot="actionRow"]';
const COMMENT_SHARE_SLOT = 'slot[name="comment-share"]';
const COMMENT_SAVE_AS_PDF_SLOT = 'slot[name="comment-save-as-pdf"]';

const COMMENT_SHARE_BUTTON = 'shreddit-comment-share-button';
const COMMENT_SHARE_BUTTON_SPAN = 'button span:first-child span:last-child';

const COMMENT_TEXT = '#-post-rtjson-content';

// Finds all comments and triggers adding the Save as PDF button to each
function getAllComments() {
  const commentNodes = document.querySelectorAll(COMMENT_ROW);
  commentNodes.forEach((commentNode) => {
    // Wait for nested shadow DOM to load
    if (commentNode.shadowRoot) {
      console.log(`Shadow DOM for comment '${commentNode}' has loaded.`);
      addSaveAsPdfButton(commentNode);
    }
  });
}

function addSaveAsPdfButton(rootComment) {
  const commentShareSlot = rootComment.shadowRoot.querySelector(COMMENT_SHARE_SLOT);
  if (commentShareSlot) {
    const parentElement = commentShareSlot.parentElement;
    const saveAsPDFButton = parentElement.querySelector(COMMENT_SAVE_AS_PDF_SLOT);

    // If Save as PDF button doesn't already exist
    if (!saveAsPDFButton) {
      // Create and insert <slot name="comment-save-as-pdf"></slot> after share slot
      const commentSaveAsPdfSlot = document.createElement('slot');
      commentSaveAsPdfSlot.setAttribute('name', 'comment-save-as-pdf');
      parentElement.insertBefore(commentSaveAsPdfSlot, commentShareSlot.nextSibling.nextSibling);
  
      const shareButton = rootComment.querySelector(COMMENT_SHARE_BUTTON);
      if (shareButton) {  

        // Create new button
        const saveAsPdfButton = document.createElement("button");
        saveAsPdfButton.textContent = "Save as PDF";
        saveAsPdfButton.id = "saveAsPdfButton";
        saveAsPdfButton.slot = "comment-save-as-pdf"
  
        // Match styles by using share button and span styles
        const shareButtonStyles = getComputedStyle(shareButton);
        saveAsPdfButton.style.backgroundColor = shareButtonStyles.backgroundColor;

        // Some styles are on the nested span
        const shareButtonSpan = shareButton.shadowRoot.querySelector(COMMENT_SHARE_BUTTON_SPAN)
        const shareButtonSpanStyles = getComputedStyle(shareButtonSpan);
        saveAsPdfButton.style.color = shareButtonSpanStyles.color;

        // Manually set some styles that aren't copied for some reason
        saveAsPdfButton.style.paddingLeft = "10px"
        saveAsPdfButton.style.paddingRight = "10px"

        // Set hover state styles
        saveAsPdfButton.addEventListener("mouseover", () => {
          saveAsPdfButton.style.backgroundColor = "";
          saveAsPdfButton.style.color = "";
        });
  
        saveAsPdfButton.addEventListener("mouseout", () => {
          saveAsPdfButton.style.backgroundColor = shareButtonStyles.backgroundColor;
          saveAsPdfButton.style.color = shareButtonSpanStyles.color;

        }); 
  
        // Insert "Save as PDF" to the right of "Share"
        shareButton.parentNode.insertBefore(
          saveAsPdfButton,
          shareButton.nextSibling.nextSibling
        );

        // On click, retrieve text of the clicked comment
        saveAsPdfButton.addEventListener("click", () => {
          const parentComment = rootComment.parentElement;
          const permalink = rootComment.getAttribute('permalink');
          const fullURL = `https://www.reddit.com/${permalink}`;

          if (parentComment) {
            var commentContent = parentComment.querySelector(COMMENT_TEXT);
          }
          handlePdfClick(commentContent, fullURL);
        });
      }
    }
  }
}