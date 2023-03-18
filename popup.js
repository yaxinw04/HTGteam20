document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(
      ["firstName", "lastName", "healthCardNumber", "dob", "height", "weight", "streetAddress", "city", "postal"],
      (result) => {
        document.getElementById("firstName").value = result.firstName || ""; // sets value of html element firstName to result.firstName
        document.getElementById("lastName").value = result.lastName || "";
        document.getElementById("healthCardNumber").value = result.healthCardNumber || "";
        document.getElementById("dob").value = result.dob|| "";
        document.getElementById("height").value = result.height || "";
        document.getElementById("weight").value = result.weight || "";
        document.getElementById("streetAddress").value = result.streetAddress || "";
        document.getElementById("city").value = result.city || "";
        document.getElementById("postal").value = result.postal || "";

      }
    );
  
    const form = document.getElementById("autofillForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault(); // wtf does this mean
  
      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
      const healthCardNumber = document.getElementById("healthCardNumber").value;
      const dob = document.getElementById("dob").value;
      const height = document.getElementById("height").value;
      const weight = document.getElementById("weight").value;
      const streetAddress = document.getElementById("streetAddress").value;
      const city = document.getElementById("city").value;
      const postal = document.getElementById("postal").value;

  
      chrome.storage.sync.set({ firstName, lastName, healthCardNumber, dob, height, weight, streetAddress, city, postal});
    });
  
    document.getElementById("autofillButton").addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "autofill" });
      });
  
      window.close();
    });
  });
  