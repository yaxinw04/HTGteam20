// Listen for the message from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "autofill") {
      // retrieves data under firstName and lastName keys, data is object with the keys and their values
      chrome.storage.sync.get(["firstName", "lastName"], (data) => {
        // Find the input fields in the form
        const firstNameInput = document.getElementById("input_2_68_3");
        const lastNameInput = document.getElementById("input_2_68_6");
  
        // Autofill the input fields
        // if firstNameInput is html element, it sets the value of firstName to data.firstName
        if (firstNameInput) firstNameInput.value = data.firstName || ""; 
        if (lastNameInput) lastNameInput.value = data.lastName || "";
      });
    }
  });

  function createTooltip(term, definition) {
    const tooltip = document.createElement("div");
    tooltip.className = "medical-term-tooltip"; // in styles.css file
    // html for the button, term in bold followed by definition plus button which is created with class speakDefinition
    tooltip.innerHTML = `
      <strong>${term}:</strong> ${definition}
      <button class="speak-definition">Speak</button>
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

  const medicalTerms = [
    { term: 'allergies', definition: 'An abnormal reaction of the immune system to a harmless substance.' },
    { term: 'medication', definition: 'Substances used to treat, manage, or prevent medical conditions.' }
  ];

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
    terms.forEach(({ term, definition }) => {
      const regex = new RegExp('\\b' + term + '\\b', 'gi'); // create regex expression of term, so it's not case sensitive
      let match;
      while ((match = regex.exec(node.textContent)) !== null) {
        const range = document.createRange(); // range is pair of boundary points
        range.setStart(node, match.index); 
        range.setEnd(node, match.index + term.length);

        rangeList.push({
          range,
          definition,
        });
      }
    });
  }

  const selection = window.getSelection();

  rangeList.forEach(({ range, definition }) => {
    const span = document.createElement('span');
    span.classList.add('highlighted-term');
    span.setAttribute('data-definition', definition);
    range.surroundContents(span);
    selection.removeAllRanges();
  });

  const highlightedTerms = document.querySelectorAll(".highlighted-term");

  highlightedTerms.forEach((element) => {
    const term = element.textContent;
    const definition = element.getAttribute("data-definition");

    element.addEventListener("mouseover", () => {
      const tooltip = createTooltip(term, definition);
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

highlightTerms(medicalTerms);