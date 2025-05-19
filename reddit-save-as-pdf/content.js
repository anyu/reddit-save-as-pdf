window.addEventListener("load", () => {
  detectLoggedInStatus()
});

const HEADER_USER_DROPDOWN = '.header-user-dropdown';

function detectLoggedInStatus() {
  const headerUserDropdown = document.querySelector(HEADER_USER_DROPDOWN);
  if (headerUserDropdown) { // user is logged in
    getAllShareButtons();
    setInterval(getAllShareButtons, 2000); // every 2s
  } else {
    getAllComments();
    setInterval(getAllComments, 2000);
  }
}

function convertHTMLToPDF(elem, linkToComment) {

  // See chrome://settings/fonts for default included fonts
  // Noto Sans is what Reddit uses, but Avenir is nicer :)
  elem.style.fontFamily = 'Avenir, Noto Sans Kannada, Arial, sans-serif';

  const newWindow = window.open('', '', 'width=800,height=600');
  newWindow.document.open();
  newWindow.document.write(elem.outerHTML);
  newWindow.document.close();

  // Suffix default file name with comment ID or current time in UNIX if none
  const currentTimeUnix = new Date().getTime();
  commentID = currentTimeUnix

  // Expects the following Reddit URL format - extracts the ID after the 2nd `comment`
  // https://www.reddit.com/r/explainlikeimfive/comments/1dd3g1/comment/c9p9b83
  const match = /comment\/([^/]+)/.exec(linkToComment);
  if (match && match[1]) {
    commentID = match[1];
  }
  newWindow.document.title = `reddit-comment-${commentID}.pdf`;

  // Wait for content to load
  setTimeout(() => {
    newWindow.print();
    newWindow.close();
  }, 500);
}

async function handlePdfClick(e, linkToComment) {
  if (!e) {
    alert("Could not find comment content to save as PDF.");
    return;
  }
  const pdfContent = document.createElement('div');

  const linkToCommentHTML = `
  <div>
    <br/>
    <a href="${linkToComment}" target="_blank">${linkToComment}</a>
  </div>`;

  pdfContent.innerHTML = e.innerHTML + linkToCommentHTML;
  convertHTMLToPDF(pdfContent, linkToComment)
}

/************************* LOGGED IN ***************************/

const COMMENT_TEST_ID = 'div[data-testid="comment"]';
const COMMENT_HEADER = 'div[data-testid="post-comment-header"]';
const COMMENT_LINK = 'a[data-testid="comment_timestamp';
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

          var commentHeader = greatGreatGrandParentElement.querySelector(COMMENT_HEADER);
          if (commentHeader) {
            const anchorElement = commentHeader.querySelector(COMMENT_LINK);
            const commentLink = anchorElement.getAttribute("href");

            const parsedURL = new URL(commentLink);

            // exclude misc query params
            const baseURL = `${parsedURL.protocol}//${parsedURL.host}${parsedURL.pathname}`;
            handlePdfClick(commentContent, baseURL);
          }
        }
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

const COMMENT_TEXT = '[id$="-comment-rtjson-content"]';

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
    const saveAsPDFSlot = parentElement.querySelector(COMMENT_SAVE_AS_PDF_SLOT);

    // If Save as PDF slot doesn't already exist
    if (!saveAsPDFSlot) {
      // Create and insert <slot name="comment-save-as-pdf"></slot> after share slot
      const commentSaveAsPdfSlot = document.createElement('slot');
      commentSaveAsPdfSlot.setAttribute('name', 'comment-save-as-pdf');
      parentElement.insertBefore(commentSaveAsPdfSlot, commentShareSlot.nextSibling);

      const shareButton = rootComment.querySelector(COMMENT_SHARE_BUTTON);
      if (shareButton) {
        // Find the actual <button> inside the shareButton's shadow root
        const shareButtonElem = shareButton.shadowRoot.querySelector('button');

        // Create new button
        const saveAsPdfButton = document.createElement("button");
        saveAsPdfButton.textContent = "Save as PDF";
        saveAsPdfButton.id = "saveAsPdfButton";
        saveAsPdfButton.setAttribute("slot", "comment-save-as-pdf");

        // Copy classes and styles from the Share button for a perfect match
        if (shareButtonElem) {
          // saveAsPdfButton.className = shareButtonElem.className;
          saveAsPdfButton.style.cssText = shareButtonElem.style.cssText;
          saveAsPdfButton.style.color = shareButtonSpanStyles.color;
          saveAsPdfButton.style.backgroundColor = shareButtonStyles.backgroundColor;
        }

        // Match styles by using share button and span styles
        // const shareButtonStyles = getComputedStyle(shareButton);

        // // Some styles are on the nested span
        // const shareButtonSpan = shareButton.shadowRoot.querySelector(COMMENT_SHARE_BUTTON_SPAN)
        // const shareButtonSpanStyles = getComputedStyle(shareButtonSpan);

        // // Manually set some styles that aren't copied for some reason
        // saveAsPdfButton.style.paddingLeft = "10px"
        // saveAsPdfButton.style.paddingRight = "10px"

        // // Set hover state styles
        // saveAsPdfButton.addEventListener("mouseover", () => {
        //   saveAsPdfButton.style.backgroundColor = "";
        //   saveAsPdfButton.style.color = "";
        // });

        // saveAsPdfButton.addEventListener("mouseout", () => {
        //   saveAsPdfButton.style.backgroundColor = shareButtonStyles.backgroundColor;
        //   saveAsPdfButton.style.color = shareButtonSpanStyles.color;
        // });

        // On click, retrieve text of the clicked comment
        saveAsPdfButton.addEventListener("click", () => {
          const grandParentElement = rootComment.parentElement.parentElement;
          const permalink = rootComment.getAttribute('permalink');
          const fullURL = `https://www.reddit.com${permalink}`;

          let commentContent = null;
          if (grandParentElement) {
            commentContent = grandParentElement.querySelector(COMMENT_TEXT);
          }
          if (commentContent) {
            handlePdfClick(commentContent, fullURL);
          } else {
            console.warn("Could not find comment content for PDF export.");
          }
        });

        // Append the button to the custom element (light DOM) for slot projection
        rootComment.appendChild(saveAsPdfButton);
      }
    }
  }
}