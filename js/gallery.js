
document.addEventListener("DOMContentLoaded", () => {
  const cards = [...document.querySelectorAll(".gallery-card")];
  const filters = [...document.querySelectorAll(".gallery-filter")];
  const count = document.getElementById("gallery-count");

  const modal = document.getElementById("gallery-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalSubject = document.getElementById("modal-subject");
  const modalDescription = document.getElementById("modal-description");
  const closeButton = document.querySelector(".gallery-modal-close");
  const interiorsButton = document.getElementById("show-interiors");
  const interiorsSection = document.getElementById("interior-samples");

  // Filter the book gallery.
  function applyFilter(filter) {
    let visible = 0;

    cards.forEach((card) => {
      const categories = (card.dataset.category || "").split(" ");
      const matches = filter === "all" || categories.includes(filter);

      card.hidden = !matches;

      if (matches) visible++;
    });

    if (count) {
      count.textContent = visible;
    }
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter;

      filters.forEach((filterButton) => {
        const active = filterButton === button;

        filterButton.classList.toggle("is-active", active);
        filterButton.setAttribute("aria-pressed", String(active));
      });

      applyFilter(selectedFilter);
    });
  });

  // Show the selected book's details.
 
function showDetails(card) {
  if (!modal || !modalTitle || !modalSubject || !modalDescription) {
    return;
  }

  modalTitle.textContent = card.dataset.title || "Book sample";
  modalSubject.textContent = card.dataset.subject || "";
  modalDescription.textContent = card.dataset.description || "";

  // Reset the format selection whenever another book is opened.
  modal.querySelectorAll('input[name="book-format"]').forEach((input) => {
    input.checked = false;
  });

  const checkoutButton = document.getElementById("proceed-to-checkout");

  if (checkoutButton) {
  checkoutButton.disabled = true;
  checkoutButton.textContent = "Proceed to Checkout";
}

  if (typeof modal.showModal === "function") {
    modal.showModal();
  }
}


  cards.forEach((card) => {
    card.querySelectorAll(".gallery-card-open, .gallery-details")
      .forEach((button) => {
        button.addEventListener("click", () => showDetails(card));
      });
  });

  // Close the modal.
  if (closeButton && modal) {
    closeButton.addEventListener("click", () => modal.close());

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.open) {
        modal.close();
      }
    });
  }

  // Scroll to the interior design examples.
  if (interiorsButton && interiorsSection) {
    interiorsButton.addEventListener("click", () => {
      interiorsSection.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });
    });
  }

  applyFilter("all");
  

const checkoutButton = document.getElementById("proceed-to-checkout");

const API_BASE_URL = "http://localhost:5000";

if (checkoutButton && modal) {

  // Enable checkout only after a format is selected.
  modal.querySelectorAll('input[name="book-format"]').forEach((input) => {
    input.addEventListener("change", () => {
      checkoutButton.disabled = false;
    });
  });

  checkoutButton.addEventListener("click", async () => {

    const selectedFormat = modal.querySelector(
      'input[name="book-format"]:checked'
    );

    if (!selectedFormat) {
      alert("Please select Soft Copy or Hard Copy first.");
      return;
    }

    if (typeof window.Razorpay !== "function") {
      alert("Razorpay Checkout could not be loaded. Please refresh the page.");
      return;
    }

    const bookTitle = modalTitle.textContent.trim();
    const bookFormat = selectedFormat.value;

    checkoutButton.disabled = true;
    checkoutButton.textContent = "Creating payment...";

    try {

      // 1. Ask backend to create a Razorpay order.
      const orderResponse = await fetch(
        `${API_BASE_URL}/api/payments/create-book-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            bookTitle,
            bookFormat
          })
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Unable to create payment order.");
      }

      // 2. Configure Razorpay Checkout.
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ThesisToBook",
        description: `${bookTitle} - ${bookFormat === "soft" ? "Soft Copy" : "Hard Copy"}`,
        order_id: orderData.orderId,

        theme: {
          color: "#123746"
        },

        modal: {
          ondismiss: () => {
            checkoutButton.disabled = false;
            checkoutButton.textContent = "Proceed to Checkout";
          }
        },

        // 3. Verify payment on your backend.
        handler: async function (response) {

          checkoutButton.textContent = "Verifying payment...";

          try {

            const verifyResponse = await fetch(
              `${API_BASE_URL}/api/payments/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            if (verifyData.paymentStatus !== "paid") {
              throw new Error("Payment has not been confirmed.");
            }

            modal.close();

            alert(
              `Payment successful!\n\nBook: ${bookTitle}\nFormat: ${bookFormat === "soft" ? "Soft Copy" : "Hard Copy"}\nPayment ID: ${response.razorpay_payment_id}`
            );

          } catch (error) {
            console.error("Payment verification error:", error);

            alert(
              "We received your payment response, but could not verify it. Please contact support and share your payment ID: " +
              response.razorpay_payment_id
            );

          } finally {
            checkoutButton.disabled = false;
            checkoutButton.textContent = "Proceed to Checkout";
          }
        }
      };

      // 4. Close the book details modal first.
// Razorpay Checkout must appear above the page.
if (modal.open) {
  modal.close();
}

checkoutButton.textContent = "Opening secure checkout...";

const razorpayInstance = new window.Razorpay(options);

razorpayInstance.on("payment.failed", function (response) {
  console.error("Payment failed:", response.error);

  alert(
    response.error.description || "Payment failed. Please try again."
  );

  checkoutButton.disabled = false;
  checkoutButton.textContent = "Proceed to Checkout";
});

razorpayInstance.open();

    } catch (error) {

      console.error("Checkout error:", error);

      alert(error.message || "Something went wrong. Please try again.");

      checkoutButton.disabled = false;
      checkoutButton.textContent = "Proceed to Checkout";
    }
  });
}


});
