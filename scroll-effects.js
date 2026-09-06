(() => {
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!window.gsap||!window.ScrollTrigger||reduce)return;
  gsap.registerPlugin(ScrollTrigger);
  const hero=document.querySelector(".hero");
  if(hero){
    const heroCopy=hero.querySelector(".hero-copy"), heroVisual=hero.querySelector(".hero-visual");
    const heroTitle=hero.querySelector("h1"), heroLead=hero.querySelector(".hero-lead"), heroActions=hero.querySelector(".hero-actions"), trust=hero.querySelector(".trustline");
    const heroTl=gsap.timeline({scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:1.15}});
    heroTl.to(heroTitle,{y:-95,scale:.9,opacity:.12,duration:1},0)
      .to(heroLead,{y:-55,opacity:0,duration:.72},.05)
      .to(heroActions,{y:-35,opacity:0,duration:.58},.1)
      .to(trust,{y:-20,opacity:0,duration:.45},.15)
      .to(heroVisual,{y:105,scale:.88,rotateY:-8,opacity:.15,duration:1},0)
      .to(heroCopy,{x:-28,duration:1},0);
    gsap.fromTo(heroTitle,{y:35,opacity:0,clipPath:"inset(0 0 100% 0)"},{y:0,opacity:1,clipPath:"inset(0 0 0% 0)",duration:1.05,ease:"power4.out",delay:.08});
    gsap.fromTo(heroLead,{y:25,opacity:0},{y:0,opacity:1,duration:.8,ease:"power3.out",delay:.28});
    gsap.fromTo(heroActions,{y:20,opacity:0},{y:0,opacity:1,duration:.7,ease:"power3.out",delay:.4});
    gsap.fromTo(trust,{y:15,opacity:0},{y:0,opacity:1,duration:.65,ease:"power3.out",delay:.52});
    gsap.fromTo(heroVisual,{x:50,y:25,scale:.94,opacity:0},{x:0,y:0,scale:1,opacity:1,duration:1.1,ease:"power3.out",delay:.2});
    gsap.fromTo(".hero-card",{rotateX:7,rotateY:-5},{rotateX:0,rotateY:0,duration:1.2,ease:"power3.out",delay:.3});
    gsap.to(".glass-orb.orb-one",{y:-35,x:18,rotation:18,duration:3.8,repeat:-1,yoyo:true,ease:"sine.inOut"});
    gsap.to(".glass-orb.orb-two",{y:28,x:-15,rotation:-15,duration:4.5,repeat:-1,yoyo:true,ease:"sine.inOut"});
    gsap.to(".chip-top",{y:-16,x:8,rotation:-3,duration:2.8,repeat:-1,yoyo:true,ease:"sine.inOut"});
    gsap.to(".chip-bottom",{y:14,x:-8,rotation:3,duration:3.4,repeat:-1,yoyo:true,ease:"sine.inOut"});
    gsap.to(".signal-bar span",{scaleX:.82,transformOrigin:"left center",duration:1.5,repeat:-1,yoyo:true,ease:"sine.inOut"});
  }

  const showcase=document.querySelector(".scroll-showcase");
  if(showcase){
    const img=document.getElementById("showcaseImage"),title=document.getElementById("showcaseCaption"),price=document.getElementById("showcasePrice"),badge=document.getElementById("showcaseBadge"),featured=(window.__deals||[])[0];
    if(featured){if(featured.image)img.src=featured.image;img.alt=featured.title||"Featured deal";if(featured.price!=null)price.textContent=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(featured.price));badge.textContent=featured.badge||"LIVE DEAL";title.textContent=featured.title||"A fresh deal, surfaced for you."}
    const frame=document.querySelector(".product-frame"),stage=document.querySelector(".showcase-stage"),glow=document.querySelector(".stage-glow"),a=document.querySelector(".label-a"),b=document.querySelector(".label-b"),progress=document.querySelector(".showcase-progress span");
    const tl=gsap.timeline({scrollTrigger:{trigger:showcase,start:"top top",end:"bottom bottom",scrub:1,pin:".showcase-pin",invalidateOnRefresh:true}});
    tl.fromTo(frame,{scale:.68,rotateY:-16,y:110,opacity:.35},{scale:1.02,rotateY:0,y:0,opacity:1,duration:.42,ease:"power2.out"}).to(frame,{scale:.86,rotateY:12,rotateX:-5,y:-40,duration:.32,ease:"power2.inOut"}).to(frame,{scale:1.08,rotateY:-4,rotateX:2,y:10,duration:.26,ease:"power2.inOut"}).to(stage,{x:-18,duration:.3},0).to(".showcase-copy",{y:-30,opacity:.75,duration:.35},0).fromTo(glow,{scale:.5,opacity:.1},{scale:1.25,opacity:.7,duration:.55},"<").fromTo(a,{x:70,opacity:0},{x:0,opacity:1,duration:.2},"<.12").fromTo(b,{x:-70,opacity:0},{x:0,opacity:1,duration:.2},"<.08").to(progress,{width:"100%",duration:1},"<");
    gsap.to(".orbit-a",{rotation:360,duration:18,repeat:-1,ease:"none"});gsap.to(".orbit-b",{rotation:-360,duration:25,repeat:-1,ease:"none"});
  }
  const horizontal=document.querySelector(".horizontal-deals");
  const track=document.getElementById("horizontalTrack");
  function buildHorizontal(){
    if(!track||!horizontal)return;
    track.innerHTML="";
    const deals=(window.__deals||[]).slice(0,8);
    if(!deals.length)return;
    deals.forEach((d,i)=>{
      const card=document.createElement("article");
      card.className="horizontal-card";
      const price=d.price!=null?new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(d.price)):"Check price";
      const old=d.originalPrice!=null?new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(d.originalPrice)):"";
      card.innerHTML='<span class="hc-number">'+String(i+1).padStart(2,"0")+'</span><div class="hc-image"><img loading="lazy" src="'+(d.image||"logo.png")+'" alt=""></div><div class="hc-info"><div><div class="hc-kicker">AI SELECTED DEAL</div><div class="hc-title"></div></div><div class="hc-bottom"><div><span class="hc-price">'+price+'</span>'+(old?'<span class="hc-old">'+old+"</span>":"")+'</div><span class="hc-badge">'+(d.badge||"LIVE")+"</span></div></div>";
      card.querySelector(".hc-title").textContent=d.title||"Featured deal";
      track.appendChild(card);
    });
    if(window.innerWidth>850){
      const distance=()=>Math.max(0,track.scrollWidth-window.innerWidth+40);
      gsap.set(track,{x:0});
      gsap.to(track,{x:()=>-distance(),ease:"none",scrollTrigger:{trigger:horizontal,start:"top top",end:()=>"+="+(distance()+window.innerWidth),pin:".horizontal-pin",scrub:1,invalidateOnRefresh:true,anticipatePin:1}});
      gsap.fromTo(".horizontal-card",{rotateY:12,scale:.9,opacity:.7},{rotateY:0,scale:1,opacity:1,stagger:.12,scrollTrigger:{trigger:horizontal,start:"top top",end:()=>"+="+(distance()+window.innerWidth),scrub:1}});
      gsap.to(".h-progress span",{width:"100%",ease:"none",scrollTrigger:{trigger:horizontal,start:"top top",end:()=>"+="+(distance()+window.innerWidth),scrub:1}});
    }else{
      gsap.to(track,{x:()=>-(track.scrollWidth-window.innerWidth+44),ease:"none",scrollTrigger:{trigger:horizontal,start:"top top",end:"+=1400",pin:".horizontal-pin",scrub:1,invalidateOnRefresh:true}});
      gsap.to(".h-progress span",{width:"100%",ease:"none",scrollTrigger:{trigger:horizontal,start:"top top",end:"+=1400",scrub:1}});
    }
  }
  buildHorizontal();

  let animated=new WeakSet();
  function revealCards(){
    document.querySelectorAll(".deal-card").forEach((card,i)=>{
      if(animated.has(card))return; animated.add(card);
      gsap.fromTo(card,{y:70,opacity:0,scale:.97},{y:0,opacity:1,scale:1,duration:.7,delay:(i%3)*.07,ease:"power3.out",scrollTrigger:{trigger:card,start:"top 88%",once:true}});
    });
    document.querySelectorAll(".how-grid .glass-card").forEach((card,i)=>{
      if(card.dataset.animated)return;card.dataset.animated="1";
      gsap.fromTo(card,{y:55,opacity:0},{y:0,opacity:1,duration:.7,delay:i*.1,ease:"power3.out",scrollTrigger:{trigger:card,start:"top 88%",once:true}});
    });
    if(!document.querySelector(".seo-intro").dataset.animated){document.querySelector(".seo-intro").dataset.animated="1";gsap.fromTo(".seo-intro",{y:55,opacity:0},{y:0,opacity:1,duration:.8,ease:"power3.out",scrollTrigger:{trigger:".seo-intro",start:"top 88%",once:true}})}
    if(!document.querySelector(".telegram-cta").dataset.animated){document.querySelector(".telegram-cta").dataset.animated="1";gsap.fromTo(".telegram-cta",{y:60,opacity:0,scale:.98},{y:0,opacity:1,scale:1,duration:.8,ease:"power3.out",scrollTrigger:{trigger:".telegram-cta",start:"top 90%",once:true}})}
    ScrollTrigger.refresh();
  }
  revealCards();
  const grid=document.getElementById("dealGrid");
  if(grid)new MutationObserver(revealCards).observe(grid,{childList:true});
})();
