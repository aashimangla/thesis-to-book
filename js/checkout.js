
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("checkout-form");
    const nameInput = document.getElementById("buyer-name");
    const emailInput = document.getElementById("buyer-email");
    const titleInput = document.getElementById("book-title");
    const formatSelect = document.getElementById("book-format");

    const shippingFields = document.getElementById("shipping-fields");
    const shippingAddress = document.getElementById("shipping-address");
    const shippingCity = document.getElementById("shipping-city");
    const shippingPostal = document.getElementById("shipping-postal");
    const shippingCountry = document.getElementById("shipping-country");

    const summaryTitle = document.getElementById("summary-title");
    const summaryFormat = document.getElementById("summary-format");
    const status = document.getElementById("checkout-status");

    // Read the selected book from the URL, if provided.
    const params = new URLSearchParams(window.location.search);
    const selectedBook = params.get("book");

    if (selectedBook) {
        titleInput.value = selectedBook;
        summaryTitle.textContent = selectedBook;
    }

    // Show shipping fields only for printed books.
    function updateFormat() {
        const isHardCopy = formatSelect.value === "hard";

        shippingFields.hidden = !isHardCopy;

        shippingAddress.required = isHardCopy;
        shippingCity.required = isHardCopy;
        shippingPostal.required = isHardCopy;
        shippingCountry.required = isHardCopy;

        if (formatSelect.value === "soft") {
            summaryFormat.textContent = "Format: Soft Copy (Digital)";
        } else if (isHardCopy) {
            summaryFormat.textContent = "Format: Hard Copy (Printed)";
        } else {
            summaryFormat.textContent = "Format: Not selected";
        }

        status.textContent = "";
    }

    formatSelect.addEventListener("change", updateFormat);

    // Demonstration only: validate locally without collecting or sending data.
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const selectedFormat = formatSelect.value;

        if (!titleInput.value.trim()) {
            status.textContent =
                "Please select a book from the gallery before continuing.";
            titleInput.focus();
            return;
        }

        if (!["soft", "hard"].includes(selectedFormat)) {
            status.textContent = "Please select a book format.";
            formatSelect.focus();
            return;
        }

        status.textContent =
            "Demo checkout validated. No payment was taken, no order was placed, and no information was sent or stored. Real checkout is not connected yet.";
    });

    // Keep the preview page free of stale status messages while editing.
    [nameInput, emailInput, titleInput, formatSelect].forEach((field) => {
        field.addEventListener("input", () => {
            status.textContent = "";
        });

        field.addEventListener("change", () => {
            status.textContent = "";
        });
    });

    updateFormat();
});
