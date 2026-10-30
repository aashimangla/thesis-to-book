
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-form-status");
  const fileInput = document.getElementById("thesis-file");
  const fileName = document.getElementById("file-name");
  const fileError = document.getElementById("file-error");
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!form || !status || !submitButton) return;

  // Show the selected file name and validate its size/type.
  fileInput?.addEventListener("change", () => {
    const file = fileInput.files[0];
    fileError.textContent = "";

    if (!file) {
      fileName.textContent = "No file selected";
      return;
    }

    const allowedExtensions = /\.(pdf|docx)$/i;

    if (!allowedExtensions.test(file.name)) {
      fileError.textContent = "Please select a PDF or DOCX file.";
      fileInput.value = "";
      fileName.textContent = "No file selected";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      fileError.textContent = "The file must be 20 MB or smaller.";
      fileInput.value = "";
      fileName.textContent = "No file selected";
      return;
    }

    fileName.textContent = file.name;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    status.textContent = "";
    status.setAttribute("role", "status");

    if (!form.reportValidity()) return;

    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    status.textContent = "Sending your enquiry...";

    try {
      const formData = new FormData(form);

      const response = await fetch(
  "http://localhost:5000/api/contact",
  {
    method: "POST",
    body: formData
  }
);

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || result.error ||
          `Submission failed (${response.status}).`
        );
      }

      status.textContent =
        result.message || "Your enquiry was submitted successfully.";

      form.reset();

      if (fileName) fileName.textContent = "No file selected";
      if (fileError) fileError.textContent = "";

    } catch (error) {
      console.error("Contact form submission failed:", error);

      status.textContent =
        error.message === "Failed to fetch"
          ? "Could not connect to the server. Check that your backend is running."
          : error.message || "Something went wrong. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
});
