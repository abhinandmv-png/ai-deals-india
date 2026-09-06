(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || !window.ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  const showcase = document.querySelector(".scroll-showcase");
  if (!showcase) return;
  const img = document.getElementById("showcaseImage");
  const title = document.getElementById("showcaseCaption");
  const price = document.getElementById("showcasePrice");
  const badge = document.getElementById("showcaseBadge");
  const data = window.__deals || [];
  const featured = data[0];
  if (featured) {
    if (featured.image) img.src = featured.image;
    img.alt = featured.title || "Featured deal";
    price.textContent = featured.price != null ? new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(featured.price)) : "LIVE";
    badge.textContent = featured.badge || "LIVE DEAL";
    title.textContent = featured.title || "A fresh deal, surfaced for you.";
  }
  const frame = document.querySelector(".product-frame");
  const stage = document.querySelector(".showcase-stage");
  const glow = document.querySelector(".stage-glow");
  const a = document.querySelector(".label-a"), b = document.querySelector(".label-b");
  const progress = document.querySelector(".showcase-progress span");
  const tl = gsap.timeline({scrollTrigger:{trigger:showcase,start:"top top",end:"bottom bottom",scrub:1,pin:".showcase-pin",invalidateOnRefresh:true}});
  tl.fromTo(frame,{scale:.68,rotateY:-16,y:110,opacity:.35},{scale:1.02,rotateY:0,y:0,opacity:1,duration:.42,ease:"power2.out"})
    .to(frame,{scale:.86,rotateY:12,rotateX:-5,y:-40,duration:.32,ease:"power2.inOut"})
    .to(frame,{scale:1.08,rotateY:-4,rotateX:2,y:10,duration:.26,ease:"power2.inOut"});
  tl.fromTo(glow,{scale:.5,opacity:.1},{scale:1.25,opacity:.7,duration:.55},"<")
    .fromTo(a,{x:70,opacity:0},{x:0,opacity:1,duration:.2},"<.12")
    .fromTo(b,{x:-70,opacity:0},{x:0,opacity:1,duration:.2},"<.08")
    .to(stage,{x:-18,duration:.3},0)
    .to(".showcase-copy",{y:-30,opacity:.75,duration:.35},0)
    .to(progress,{width:"100%",duration:1},"<");
  gsap.to(".orbit-a",{rotation:360,duration:18,repeat:-1,ease:"none"});
  gsap.to(".orbit-b",{rotation:-360,duration:25,repeat:-1,ease:"none"});
})();
