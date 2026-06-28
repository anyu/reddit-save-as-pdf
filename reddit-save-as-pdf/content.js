window.addEventListener("load", () => {
  injectSaveAsPdfButtons();
  setInterval(injectSaveAsPdfButtons, 2000);
});

function injectSaveAsPdfButtons() {
  const actionRows = document.querySelectorAll(COMMENT_ROW);
  if (actionRows.length > 0) {
    actionRows.forEach(addSaveAsPdfButton);
    return;
  }

  // Legacy fallback for older logged-in Reddit markup without shreddit action rows
  getAllShareButtons();
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

function getCommentHost(actionRow) {
  return actionRow.closest('shreddit-comment');
}

function getCommentContent(actionRow) {
  const commentHost = getCommentHost(actionRow);
  if (commentHost) {
    return (
      commentHost.querySelector(COMMENT_TEXT) ||
      commentHost.querySelector('[slot="comment"] .md') ||
      commentHost.querySelector('[slot="comment"]') ||
      commentHost.querySelector('.RichTextJSON-root')
    );
  }

  const grandParentElement = actionRow.parentElement?.parentElement;
  return grandParentElement?.querySelector(COMMENT_TEXT) ?? null;
}

function getCommentUrl(actionRow) {
  const commentHost = getCommentHost(actionRow);
  const permalink =
    commentHost?.getAttribute('permalink') ||
    actionRow.getAttribute('permalink');

  if (permalink) {
    return `https://www.reddit.com${permalink}`;
  }

  return null;
}

/************************* LEGACY LOGGED IN ***************************/

const COMMENT_TEST_ID = 'div[data-testid="comment"]';
const COMMENT_HEADER = 'div[data-testid="post-comment-header"]';
const COMMENT_LINK = 'a[data-testid="comment_timestamp"]';
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
            if (!anchorElement) {
              console.warn("Could not find comment permalink for PDF export.");
              return;
            }
            const commentLink = anchorElement.getAttribute("href");

            const parsedURL = new URL(commentLink, window.location.origin);

            // exclude misc query params
            const baseURL = `${parsedURL.protocol}//${parsedURL.host}${parsedURL.pathname}`;
            handlePdfClick(commentContent, baseURL);
          }
        }
      });
    }
  }
}

/************************* SHREDDIT (logged in + logged out) ***************************/

const COMMENT_ROW = 'shreddit-comment-action-row[slot="actionRow"]';
const COMMENT_SHARE_SLOT = 'slot[name="comment-share"]';
const COMMENT_SAVE_AS_PDF_SLOT = 'slot[name="comment-save-as-pdf"]';

const COMMENT_SHARE_BUTTON = 'shreddit-comment-share-button';
const COMMENT_SHARE_BUTTON_SPAN = 'button span:first-child span:last-child';

const COMMENT_TEXT = '[id$="-comment-rtjson-content"]';

function addSaveAsPdfButton(rootComment) {
  if (!rootComment.shadowRoot) {
    return;
  }

  const commentShareSlot = rootComment.shadowRoot.querySelector(COMMENT_SHARE_SLOT);
  if (!commentShareSlot) {
    return;
  }

  const parentElement = commentShareSlot.parentElement;
  const saveAsPDFSlot = parentElement.querySelector(COMMENT_SAVE_AS_PDF_SLOT);

  // If Save as PDF slot doesn't already exist
  if (saveAsPDFSlot) {
    return;
  }

  // Create and insert <slot name="comment-save-as-pdf"></slot> after share slot
  const commentSaveAsPdfSlot = document.createElement('slot');
  commentSaveAsPdfSlot.setAttribute('name', 'comment-save-as-pdf');
  parentElement.insertBefore(commentSaveAsPdfSlot, commentShareSlot.nextSibling);

  const shareButton = rootComment.querySelector(COMMENT_SHARE_BUTTON);
  if (!shareButton) {
    return;
  }

  // Find the actual <button> inside the shareButton's shadow root
  const shareButtonElem = shareButton.shadowRoot?.querySelector('button');

  // Create new button
  const saveAsPdfButton = document.createElement("button");
  saveAsPdfButton.textContent = "Save as PDF";
  saveAsPdfButton.id = "saveAsPdfButton";
  saveAsPdfButton.setAttribute("slot", "comment-save-as-pdf");

  // Copy styles from the Share button
  if (shareButtonElem) {
    saveAsPdfButton.style.cssText = shareButtonElem.style.cssText;

    const shareButtonStyles = getComputedStyle(shareButton);
    const shareButtonSpan = shareButton.shadowRoot.querySelector(COMMENT_SHARE_BUTTON_SPAN);
    const shareButtonSpanStyles = shareButtonSpan
      ? getComputedStyle(shareButtonSpan)
      : shareButtonStyles;

    saveAsPdfButton.style.color = shareButtonSpanStyles.color;
    saveAsPdfButton.style.backgroundColor = shareButtonStyles.backgroundColor;
  }

  saveAsPdfButton.addEventListener("click", () => {
    const commentContent = getCommentContent(rootComment);
    const fullURL = getCommentUrl(rootComment);

    if (commentContent && fullURL) {
      handlePdfClick(commentContent, fullURL);
    } else {
      console.warn("Could not find comment content or permalink for PDF export.", {
        commentContent,
        fullURL,
      });
    }
  });

  // Append the button to the custom element (light DOM) for slot projection
  rootComment.appendChild(saveAsPdfButton);
}
