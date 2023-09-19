// Expected DOM structure
/* <shreddit-comment-action-row...slot="actionRow">
    <#shadow-root> (open)
      <div>
        ...
        <slot name="comment-reply"></slot>
        <slot name="comment-share"></slot>
        <slot name="comment-save-as-pdf"></slot>
      </div>
    <faceplate-tracker...slot=comment-reply>

    <shreddit-comment-share-button...slot-comment-share>
      <#shadow-root> (open)
      <button>
        <span>
          <span></span>
          <span></span>
          <span>Share</span>
        </span
      </button>
    </shreddit-comment-share-button>

    <button id="saveAsPdfButton" slot=comment-save-as-pdf"></button>
   </shreddit-comment-action-row>
*/

const COMMENT_ROW = 'shreddit-comment-action-row[slot="actionRow"]';
const COMMENT_SHARE_SLOT = 'slot[name="comment-share"]';
const COMMENT_SAVE_AS_PDF_SLOT = 'slot[name="comment-save-as-pdf"]';

const COMMENT_SHARE_BUTTON = 'shreddit-comment-share-button';
const COMMENT_SHARE_BUTTON_SPAN = 'button span:first-child span:last-child';

const COMMENT_TEXT = '#-post-rtjson-content';

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
          if (parentComment) {
            var commentContent = parentComment.querySelector(COMMENT_TEXT);
          }
          handlePdfClick(commentContent);
        });
      }
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

getAllComments();
setInterval(getAllComments, 3000); // every 3s
