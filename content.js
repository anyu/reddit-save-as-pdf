function checkShadowDomLoaded(selector, intervalId) {
  const shadowHost = document.querySelector(selector);
  
  if (shadowHost && shadowHost.shadowRoot) {
    clearInterval(intervalId);
    console.log(`${selector}'s Shadow DOM has loaded.`);
    addSaveAsPdfButton(shadowHost)
  }
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

          saveAsPdfButton.style.paddingLeft = "15px";
          saveAsPdfButton.style.paddingRight = "15px";
          saveAsPdfButton.style.borderRadius = "5px";
  
          saveAsPdfButton.addEventListener("click", () => {
            console.log("save button clicked");
            // TODO: Add PDF generation logic (jsPDF?)
          });
      
          // Insert "Save as PDF" to the right of "Share"
          shareButton.parentNode.insertBefore(
            saveAsPdfButton,
            shareButton.nextSibling.nextSibling
          );
        }
      }
}

// Run function on page load
window.addEventListener("load", () => {
  const commentSelector = 'shreddit-comment-action-row[slot="actionRow"]';
  const intervalId = setInterval(() => checkShadowDomLoaded(commentSelector, intervalId), 100);
});