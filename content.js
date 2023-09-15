function getShadowRoot(element) {
  const chrome = window.chrome;
  console.log("chrome", chrome)
  try {
    if (chrome.dom && chrome.dom.openOrClosedShadowRoot && element) {
      return element.openOrClosedShadowRoot;
    }
  } catch (error) {
    console.log("error", error)
    return null;
  }
}

function addSaveAsPdfButton() {
  const commentActionRow = document.querySelector(
    'shreddit-comment-action-row[slot="actionRow"]'
  );
  console.log("commentActionRow", commentActionRow)

  if (commentActionRow) {
    console.log("shadowroot", commentActionRow.shadowRoot)

    // const shadowRoot = getShadowRoot(commentActionRow);
    const results = commentActionRow.shadowRoot.querySelectorAll('*')
    console.log("results", results)
  }


  if (commentActionRow.when) {
    const shadowRoot = getShadowRoot(commentActionRow);
    console.log("shadowRoot", shadowRoot)
  }

  if (shadowRoot) {
    const sr = shadowRoot.querySelectorAll('*')
    console.log("sr", sr)
    // Find the <slot> element within the Shadow DOM
    const commentShareSlot = shadowRoot.querySelector('slot[name="comment-share"]');

    console.log("commentShareSlot", commentShareSlot)

    if (commentShareSlot) {
      console.log("commentShareSlot found", commentShareSlot)
    }

    if (commentShareSlot && commentActionRow) {
      console.log("BOTH HERE")
      // create and insert <slot name="comment-save-as-pdf"></slot> after share slot
      const commentSaveAsPdfSlot = document.createElement('slot');
      commentSaveAsPdfSlot.setAttribute('name', 'comment-save-as-pdf');

      const parentElement = commentShareSlot.parentElement;
      parentElement.insertBefore(commentSaveAsPdfSlot, commentShareSlot.nextSibling.nextSibling);

      const shareButton = commentActionRow.querySelector(
        'shreddit-comment-share-button'
      );
      
      if (shareButton) {  
        console.log("shareButton")

        // create and insert save as pdf button
        const saveAsPdfButton = document.createElement("button");
        saveAsPdfButton.textContent = "Save as PDF";
        saveAsPdfButton.id = "saveAsPdfButton";
        saveAsPdfButton.slot = "comment-save-as-pdf"
    
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
}

// Run function on page load
window.addEventListener("load", addSaveAsPdfButton);
