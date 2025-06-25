document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger);

  let list = document.querySelectorAll(".carousel .list .item");
  let carousel = document.querySelector(".carousel");
  let mockup = document.querySelector(".mockup");

  let count = list.length;
  let active = 0;
  let leftMockup = 0;
  let left_each_item = 100 / (count - 1);
  let refreshInterval = null; // Initialize the variable
  let isScrollControlled = false;
  let lastScrollProgress = 0;

  console.log("Carousel initialized:", { count, left_each_item });

  function next_func() {
    console.log(
      "Next function called, isScrollControlled:",
      isScrollControlled
    );

    let oldActive = active;
    active = active >= count - 1 ? 0 : active + 1;
    leftMockup = active * left_each_item;
    carousel.classList.remove("right");

    console.log(
      "Next: oldActive:",
      oldActive,
      "newActive:",
      active,
      "leftMockup:",
      leftMockup
    );
    changeCarousel();
  }

  function prev_func() {
    console.log(
      "Prev function called, isScrollControlled:",
      isScrollControlled
    );

    let oldActive = active;
    active = active <= 0 ? count - 1 : active - 1;
    leftMockup = active * left_each_item;
    carousel.classList.add("right");

    console.log(
      "Prev: oldActive:",
      oldActive,
      "newActive:",
      active,
      "leftMockup:",
      leftMockup
    );
    changeCarousel();
  }

  function setActiveByIndex(newIndex) {
    if (newIndex === active) return;

    console.log("Setting active by index:", newIndex, "from:", active);

    let oldActive = active;
    active = newIndex;
    leftMockup = active * left_each_item;

    // Determine direction for animation
    if (newIndex > oldActive) {
      carousel.classList.remove("right");
      console.log("Direction: forward");
    } else {
      carousel.classList.add("right");
      console.log("Direction: backward");
    }

    changeCarousel();
  }

  function changeCarousel() {
    console.log("Changing carousel to index:", active);

    // Find item has class hidden to remove it
    let hidden_old = document.querySelector(".item.hidden");
    if (hidden_old) {
      hidden_old.classList.remove("hidden");
      console.log("Removed hidden class from previous item");
    }

    // Find item old active to remove it and add class hidden
    let active_old = document.querySelector(".item.active");
    if (active_old) {
      active_old.classList.remove("active");
      active_old.classList.add("hidden");
      console.log("Moved old active item to hidden");
    }

    // Add class active in position active new
    list[active].classList.add("active");
    console.log("Set new active item:", active);

    // Change mockup background
    mockup.style.setProperty("--left", leftMockup + "%");
    console.log("Updated mockup left position:", leftMockup + "%");

    // Handle auto-rotation interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
      console.log("Cleared existing interval");
    }

    // Only start auto-rotation if not scroll controlled
    if (!isScrollControlled) {
      refreshInterval = setInterval(() => {
        console.log("Auto-rotation triggered");
        next_func();
      }, 3000);
      console.log("Started new auto-rotation interval");
    }
  }

  // Initialize auto-rotation
  console.log("Starting initial auto-rotation");
  refreshInterval = setInterval(() => {
    console.log("Initial auto-rotation triggered");
    next_func();
  }, 3000);

  // ScrollTrigger setup
  console.log("Setting up ScrollTrigger");

  ScrollTrigger.create({
    trigger: "#home",
    start: "top top",
    end: "200% top",
    pin: "#home",
    pinSpacing: true,
    scrub: 1,
    // markers: true, // Keep markers for debugging
    onUpdate: (self) => {
      let progress = self.progress;
      console.log("ScrollTrigger onUpdate - progress:", progress);

      isScrollControlled = true;

      // Calculate which slide should be active based on scroll progress
      let targetIndex = Math.floor(progress * count);
      // Clamp to valid range
      targetIndex = Math.max(0, Math.min(targetIndex, count - 1));

      console.log(
        "Target index based on scroll:",
        targetIndex,
        "current active:",
        active
      );

      // Only change if we've moved to a different slide
      if (
        targetIndex !== active &&
        Math.abs(progress - lastScrollProgress) > 0.1
      ) {
        console.log("Scroll triggered slide change to:", targetIndex);
        setActiveByIndex(targetIndex);
        lastScrollProgress = progress;
      }
    },
    onEnter: () => {
      console.log("ScrollTrigger onEnter - taking scroll control");
      isScrollControlled = true;
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log("Stopped auto-rotation due to scroll control");
      }
    },
    onLeave: () => {
      console.log("ScrollTrigger onLeave - releasing scroll control");
      isScrollControlled = false;
      // Restart auto-rotation
      if (!refreshInterval) {
        refreshInterval = setInterval(() => {
          console.log("Resumed auto-rotation after scroll");
          next_func();
        }, 3000);
      }
    },
    onEnterBack: () => {
      console.log("ScrollTrigger onEnterBack - taking scroll control");
      isScrollControlled = true;
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log("Stopped auto-rotation due to scroll control (back)");
      }
    },
    onLeaveBack: () => {
      console.log("ScrollTrigger onLeaveBack - releasing scroll control");
      isScrollControlled = false;
      // Restart auto-rotation
      if (!refreshInterval) {
        refreshInterval = setInterval(() => {
          console.log("Resumed auto-rotation after scroll back");
          next_func();
        }, 3000);
      }
    },
  });

  console.log("ScrollTrigger setup complete");
});

// Initialize Lenis for smooth scrolling
console.log("Initializing Lenis");
const lenis = new Lenis();

// Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
lenis.on("scroll", ScrollTrigger.update);

// Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Disable lag smoothing in GSAP to prevent any delay in scroll animations
gsap.ticker.lagSmoothing(0);

console.log("Lenis setup complete");
