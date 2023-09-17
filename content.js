function addScript(url) {
  var script = document.createElement('script');
  script.type = 'application/javascript';
  script.src = url;
  document.head.appendChild(script);
}


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
      const commentShareSlot = shadowHost.shadowRoot.querySelector(
        'slot[name="comment-share"]'
      );
      if (commentShareSlot) {
        // create and insert <slot name="comment-save-as-pdf"></slot> after share slot
        const commentSaveAsPdfSlot = document.createElement('slot');
        commentSaveAsPdfSlot.setAttribute('name', 'comment-save-as-pdf');

        const parentElement = commentShareSlot.parentElement;
        parentElement.insertBefore(commentSaveAsPdfSlot, commentShareSlot.nextSibling.nextSibling);

        const shareButton = shadowHost.querySelector(
          'shreddit-comment-share-button'
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
            // TODO: Grab specific comment, not just first
            var element = document.getElementById('-post-rtjson-content');
            handlePdfClick(element);
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
  var opt = {
    margin:       1,
    filename:     'reddit-comment.pdf',
  };
    e.style.color='black'
    html2pdf().set(opt).from(e).save();
}

// Run function on page load
window.addEventListener("load", () => {
  const commentSelector = 'shreddit-comment-action-row[slot="actionRow"]';
  const intervalId = setInterval(() => checkShadowDomLoadedForAllComments(commentSelector, intervalId), 100);
});