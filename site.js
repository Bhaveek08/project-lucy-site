'use strict';

/* ── PARTICLE CANVAS ── */
(function(){
  var canvas = document.getElementById('particle-canvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){canvas.style.display='none';return}

  var W,H,particles=[],raf;
  var isMobile = function(){return window.innerWidth<768};
  var count = isMobile()?30:60;

  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}

  function mkP(){
    return{
      x:Math.random()*W,y:Math.random()*H,
      vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.2,
      r:Math.random()*1.5+.5,
      opacity:.1+Math.random()*.4,
      life:0,maxLife:400+Math.floor(Math.random()*600)
    };
  }

  function init(){
    resize();
    particles=[];
    for(var i=0;i<count;i++){var p=mkP();p.life=Math.floor(Math.random()*p.maxLife);particles.push(p)}
  }

  function tick(){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<particles.length;i++){
      var p=particles[i];
      p.life++;
      p.x+=p.vx;p.y+=p.vy;

      if(p.x<-20)p.x=W+10;if(p.x>W+20)p.x=-10;
      if(p.y<-20)p.y=H+10;if(p.y>H+20)p.y=-10;

      var alpha=p.opacity;
      if(p.life<60)alpha*=p.life/60;
      if(p.life>p.maxLife-80)alpha*=(p.maxLife-p.life)/80;

      if(p.life>=p.maxLife){particles[i]=mkP();particles[i].life=0;continue}
      if(alpha<=0)continue;

      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(255,45,116,'+alpha+')';
      ctx.fill();
    }

    // draw connections
    for(var i=0;i<particles.length;i++){
      for(var j=i+1;j<particles.length;j++){
        var dx=particles[i].x-particles[j].x;
        var dy=particles[i].y-particles[j].y;
        var dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<120){
          ctx.beginPath();
          ctx.moveTo(particles[i].x,particles[i].y);
          ctx.lineTo(particles[j].x,particles[j].y);
          ctx.strokeStyle='rgba(255,45,116,'+((.08)*(1-dist/120))+')';
          ctx.lineWidth=.5;
          ctx.stroke();
        }
      }
    }
    raf=requestAnimationFrame(tick);
  }

  window.addEventListener('resize',function(){resize()},{passive:true});
  document.addEventListener('visibilitychange',function(){if(document.hidden)cancelAnimationFrame(raf);else tick()});
  init();tick();
})();

/* ── SCROLL REVEAL ── */
(function(){
  var els=document.querySelectorAll('.reveal');
  if(!els.length)return;

  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});

  els.forEach(function(el){observer.observe(el)});
})();

/* ── ANIMATED COUNTERS ── */
(function(){
  var figs=document.querySelectorAll('.fig[data-target]');
  if(!figs.length)return;

  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        animateCounter(e.target);
        observer.unobserve(e.target);
      }
    });
  },{threshold:0.5});

  figs.forEach(function(f){observer.observe(f)});

  function animateCounter(el){
    var target=parseInt(el.getAttribute('data-target'),10);
    var suffix=el.getAttribute('data-suffix')||'';
    var duration=1800;
    var start=performance.now();

    function step(now){
      var progress=Math.min((now-start)/duration,1);
      var ease=1-Math.pow(1-progress,4); // ease-out quart
      var current=Math.floor(ease*target);
      el.textContent=current.toLocaleString()+suffix;
      if(progress<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
})();

/* ── ANIMATED EXAM BARS ── */
(function(){
  var meters=document.querySelectorAll('.meter i[data-width]');
  if(!meters.length)return;

  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var w=e.target.getAttribute('data-width');
        e.target.style.setProperty('--bar-w',w+'%');
        e.target.classList.add('filled');
        observer.unobserve(e.target);
      }
    });
  },{threshold:0.3});

  meters.forEach(function(m){observer.observe(m)});
})();

/* ── MOBILE NAV HAMBURGER ── */
(function(){
  var btn=document.getElementById('nav-hamburger');
  var links=document.getElementById('nav-links');
  if(!btn||!links)return;

  btn.addEventListener('click',function(){
    var open=links.classList.toggle('open');
    btn.classList.toggle('open');
    btn.setAttribute('aria-expanded',String(open));
    document.body.style.overflow=open?'hidden':'';
  });

  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      document.body.style.overflow='';
    });
  });
})();

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){
    var id=a.getAttribute('href');
    if(id==='#')return;
    var target=document.querySelector(id);
    if(!target)return;
    e.preventDefault();
    var offset=70;
    window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY-offset,behavior:'smooth'});
  });
});

/* ── INTRO SEQUENCE (INDEX.HTML) ── */
(function(){
  var overlay = document.getElementById('intro-overlay');
  var text = document.getElementById('intro-text');
  if(!overlay || !text) return;
  
  setTimeout(function(){ text.innerText = "Loading 14,000 memories..."; }, 800);
  setTimeout(function(){ text.innerText = "Awake."; }, 1800);
  setTimeout(function(){ 
    overlay.style.opacity = '0';
    setTimeout(function(){ overlay.remove(); }, 800);
  }, 2500);
})();
