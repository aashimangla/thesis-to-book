
document.addEventListener("DOMContentLoaded", () => {
  const cards = [...document.querySelectorAll(".gallery-card")];
  const filters = [...document.querySelectorAll(".gallery-filter")];
  const count = document.getElementById("gallery-count");

  const modal = document.getElementById("gallery-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalSubject = document.getElementById("modal-subject");
  const modalDescription = document.getElementById("modal-description");
  const closeButton = document.querySelector(".gallery-modal-close");

  function applyFilter(filter) {
    let visible = 0;

    cards.forEach((card) => {
      const categories = card.dataset.category.split(" ");
      const matches = filter === "all" || categories.includes(filter);

      card.hidden = !matches;

      if (matches) visible++;
    });

    count.textContent = visible;
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

  function showDetails(card) {
    modalTitle.textContent = card.dataset.title;
    modalSubject.textContent = card.dataset.subject;
    modalDescription.textContent = card.dataset.description;

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

  closeButton.addEventListener("click", () => modal.close());

  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.open) modal.close();
  });

  document.getElementById("show-interiors").addEventListener("click", () => {
    document.getElementById("interior-samples").scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start"
    });
  });

  applyFilter("all");
});
