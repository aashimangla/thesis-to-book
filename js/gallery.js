
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
    checkoutButton.disabled = false;
    checkoutButton.textContent = "Continue to Checkout";
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

if (checkoutButton) {
  checkoutButton.addEventListener("click", () => {
    const selectedFormat = modal.querySelector(
      'input[name="book-format"]:checked'
    );

    if (!selectedFormat) {
      alert("Please select Soft Copy or Hard Copy first.");
      return;
    }

    const params = new URLSearchParams({
      book: modalTitle.textContent.trim(),
      format: selectedFormat.value
    });

    window.location.href = `checkout.html?${params.toString()}`;
  });
}

});
