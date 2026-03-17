// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // Basic Intersection Observer for fade-in animations on cards
    const cards = document.querySelectorAll(".service-card");
    
    // Add initial CSS to cards
    cards.forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered animation
                setTimeout(() => {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                }, index * 100);
                
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    cards.forEach(card => {
        observer.observe(card);
        
        // Setup click handler for navigation
        card.addEventListener("click", () => {
            alert(`You clicked ${card.querySelector('p').innerText}. (This would normally navigate to /agents)`);
        });
    });

    // Buttons interaction
    const buttons = document.querySelectorAll("button");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            if (!btn.closest('.service-card')) {
                alert(`Button "${e.target.innerText}" clicked!`);
            }
        });
    });
});
