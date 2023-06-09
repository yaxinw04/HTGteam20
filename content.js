// Listen for the message from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "autofill") {
      // retrieves data under firstName and lastName keys, data is object with the keys and their values
      chrome.storage.sync.get(
        ["firstName", "lastName", "healthCardNumber", "dob", "height", "weight", "streetAddress", "city", "postal", "phone"],
        (data) => {
          // Find the input fields in the form
          const firstNameInput = document.getElementById("input_2_68_3");
          const lastNameInput = document.getElementById("input_2_68_6");
          const healthCardNumberInput = document.getElementById("input_2_2");
          const dobInput = document.getElementById("input_2_14");
          const heightInput = document.getElementById("input_2_15");
          const weightInput = document.getElementById("input_2_16");
          const streetAddressInput = document.getElementById("input_2_18");
          const cityInput = document.getElementById("input_2_19");
          const postalInput = document.getElementById("input_2_20");
          const phoneInput = document.getElementById("input_2_24");
  
          // Autofill the input fields
          // if firstNameInput is html element, it sets the value of firstNameInput to data.firstName
          if (firstNameInput) firstNameInput.value = data.firstName || "";
          if (lastNameInput) lastNameInput.value = data.lastName || "";
          if (healthCardNumberInput) healthCardNumberInput.value = data.healthCardNumber || "";
          if (dobInput) dobInput.value = data.dob || "";
          if (heightInput) heightInput.value = data.height || "";
          if (weightInput) weightInput.value = data.weight || "";
          if (streetAddressInput) streetAddressInput.value = data.streetAddress || "";
          if (cityInput) cityInput.value = data.city || "";
          if (postalInput) postalInput.value = data.postal || "";
          if (phoneInput) phoneInput.value = data.phone || "";
        }
      );
    }
  });
  

  function createTooltip(term, definition, imageSource) {
    const tooltip = document.createElement("div");
    tooltip.className = "medical-term-tooltip"; // in styles.css file

    const speakerIconUrl = chrome.runtime.getURL("speaker.png");
    const imageUrl = chrome.runtime.getURL(imageSource);

    // html for the button, term in bold followed by definition plus button which is created with class speakDefinition
    tooltip.innerHTML = `
    <strong>${term}:</strong> ${definition}
    <img src="${speakerIconUrl}" class="speak-definition" title="Speak"/>
    <img src="${imageUrl}" class="tooltip-image" />
    `;

    return tooltip;
  }
  
  function speakDefinition(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }

  // attach listener to speak button
function attachSpeakButtonEvent(tooltip) {
    // finds speak button by looking in the tooltip for element with speak definition class
    const speakButton = tooltip.querySelector(".speak-definition"); 
  
    speakButton.addEventListener("click", () => { // attaches an event listener if it's clicked...
      // takes text from tool tip and adjusts it by removing word speak and white space
      const definitionText = tooltip.textContent.replace("Speak", "").trim();
      speakDefinition(definitionText); 
    });
  }

  function attachTooltipEvents(tooltip) {
    const speakButton = tooltip.querySelector(".speak-definition");
  
    speakButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent the event from reaching the tooltip's 'mouseleave' event
      const definitionText = tooltip.textContent.replace("Speak", "").trim();
      speakDefinition(definitionText);
    });
  }

  function highlightTerms(terms) {
    // creates treewalker filtering out script and styles tags
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (node.parentNode.tagName.toLowerCase() !== 'script' && node.parentNode.tagName.toLowerCase() !== 'style') {
          return NodeFilter.FILTER_ACCEPT;
        }
      },
    });

    const rangeList = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    terms.forEach(({ term, definition, image }) => {
      const regex = new RegExp('\\b' + term + '\\b', 'gi'); // create regex expression of term, so it's not case sensitive
      let match;
      while ((match = regex.exec(node.textContent)) !== null) {
        const range = document.createRange(); // range is pair of boundary points
        range.setStart(node, match.index); 
        range.setEnd(node, match.index + term.length);

        rangeList.push({
          range,
          definition,
          imageSource: image
        });
      }
    });
  }

  const selection = window.getSelection();

  rangeList.forEach(({ range, definition, imageSource }) => {
    const span = document.createElement('span');
    span.classList.add('highlighted-term');
    span.setAttribute('data-definition', definition);
    span.setAttribute('image-source', imageSource);
    range.surroundContents(span);
    selection.removeAllRanges();
  });

  const highlightedTerms = document.querySelectorAll(".highlighted-term");

  highlightedTerms.forEach((element) => {
    const term = element.textContent;
    const definition = element.getAttribute("data-definition");
    const imageSource = element.getAttribute('image-source');
    element.addEventListener("mouseover", () => {
      const tooltip = createTooltip(term, definition, imageSource);
      tooltip.style.top = `${element.getBoundingClientRect().top + window.scrollY + 20}px`;
      tooltip.style.left = `${element.getBoundingClientRect().left + window.scrollX}px`;
      document.body.appendChild(tooltip);
      attachTooltipEvents(tooltip);

      tooltip.addEventListener("mouseleave", () => {
        tooltip.remove();
      });
    });
  });
}

function fetchAndHighlightTerms() {
  fetch(chrome.runtime.getURL('medical_terms.json'))
    .then(response => response.json())
    .then(terms => {
      highlightTerms(terms);
    })
    .catch(error => {
      console.error('Error fetching medical terms:', error);
    });
}

fetchAndHighlightTerms();