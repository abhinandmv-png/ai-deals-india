(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || !window.ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  const hero = document.querySelector(".lusion-hero");
  const story = document.querySelector(".story-section");

  // Editorial entrance: typography arrives first, then the product.
  if (hero) {
    gsap.fromTo(".lusion-hero .eyebrow,.lusion-hero .hero-meta",
      {y:20,opacity:0},{y:0,opacity:1,duration:.7,stagger:.08,ease:"power3.out"});
    gsap.fromTo(".hero-line",
      {y:90,opacity:0,clipPath:"inset(0 0 100% 0)"},
      {y:0,opacity:1,clipPath:"inset(0 0 0% 0)",duration:1.05,stagger:.12,ease:"power4.out"});
    gsap.fromTo(".lusion-hero .hero-lead,.lusion-hero .hero-actions",
      {y:25,opacity:0},{y:0,opacity:1,duration:.7,stagger:.12,delay:.35,ease:"power3.out"});
    gsap.fromTo(".hero-product-wrap",
      {y:70,opacity:0,scale:.82,rotate:-10},
      {y:0,opacity:1,scale:1,rotate:-4,duration:1.15,delay:.22,ease:"power3.out"});
    gsap.fromTo(".hero-number",
      {opacity:0,scale:1.2},{opacity:1,scale:1,duration:1.2,delay:.2,ease:"power2.out"});

    gsap.to(".hero-product-wrap", {
      y:-35, rotate:-1, scale:.96, ease:"none",
      scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:1}
    });
    gsap.to(".hero-copy", {
      y:-55, opacity:.15, ease:"none",
      scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:1}
    });
    gsap.to(".hero-orbit", {
      rotation:20, scale:1.08, opacity:.35, ease:"none",
      scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:1}
    });
  }

  // One restrained story transition — enough movement to feel cinematic, not enough to slow browsing.
  if (story) {
    gsap.fromTo(".story-copy",
      {x:-55,opacity:0},
      {x:0,opacity:1,duration:.9,ease:"power3.out",
       scrollTrigger:{trigger:story,start:"top 78%",once:true}});
    gsap.fromTo(".story-product",
      {x:90,opacity:0,scale:.84,rotate:10},
      {x:0,opacity:1,scale:1,rotate:3,duration:1.05,ease:"power3.out",
       scrollTrigger:{trigger:story,start:"top 72%",once:true}});
    gsap.fromTo(".story-tag",
      {y:20,opacity:0},{y:0,opacity:1,duration:.6,stagger:.12,
       scrollTrigger:{trigger:story,start:"top 65%",once:true}});
    gsap.to(".story-product",{
      y:-28,rotate:-1,ease:"none",
      scrollTrigger:{trigger:story,start:"top bottom",end:"bottom top",scrub:1}
    });
  }

  const grid = document.getElementById("dealGrid");
  if (grid) {
    const animate = () => {
      grid.querySelectorAll(".deal-card").forEach((card,i) => {
        if (card.dataset.revealed) return;
        card.dataset.revealed="1";
        gsap.fromTo(card,{y:35,opacity:0},{y:0,opacity:1,duration:.65,delay:(i%3)*.06,ease:"power3.out",
          scrollTrigger:{trigger:card,start:"top 92%",once:true}});
      });
      ScrollTrigger.refresh();
    };
    animate();
    new MutationObserver(animate).observe(grid,{childList:true});
  }
})();
