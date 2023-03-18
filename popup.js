document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["firstName", "lastName"], (result) => {
      document.getElementById("firstName").value = result.firstName || ""; // sets value of html element firstName to result.firstName
      document.getElementById("lastName").value = result.lastName || "";
    });

    const form = document.getElementById("autofillForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault(); // wtf does this mean
  
      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
  
      chrome.storage.sync.set({ firstName, lastName }, () => {
        window.close();
      });
    });

    document.getElementById("autofillButton").addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "autofill" });
        });
    
        window.close();
      });
    });
    