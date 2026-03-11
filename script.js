/* ── 1. PARTICLE HERO CANVAS ─────────────────────────────────────── */
  (function initParticles() {
    const canvas = document.getElementById('heroCanvas');
    const ctx    = canvas.getContext('2d');
    const CONFIG = {
      particleCount : 130, maxSpeed:0.35, minRadius:1, maxRadius:2.8,
      connectionDist:130, mouseRadius:160,
      colors:['#3B82F6','#60A5FA','#93C5FD','#BFDBFE','#ffffff'],
      bgColor:'#060d1f',
    };
    let W, H, mouse={x:-9999,y:-9999}, particles=[], animId;

    function resize() {
      const hero = document.getElementById('hero');
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(initial) {
        this.x=Math.random()*W; this.y=initial?Math.random()*H:-10;
        this.r=CONFIG.minRadius+Math.random()*(CONFIG.maxRadius-CONFIG.minRadius);
        this.vx=(Math.random()-.5)*CONFIG.maxSpeed*2;
        this.vy=(Math.random()-.5)*CONFIG.maxSpeed*2;
        this.alpha=.2+Math.random()*.65; this.baseAlpha=this.alpha;
        this.colorIdx=Math.floor(Math.random()*CONFIG.colors.length);
        this.twinkleSpeed=.008+Math.random()*.015;
        this.twinkleDir=Math.random()>.5?1:-1;
      }
      update() {
        this.x+=this.vx; this.y+=this.vy;
        const dx=this.x-mouse.x, dy=this.y-mouse.y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<CONFIG.mouseRadius){const f=(CONFIG.mouseRadius-dist)/CONFIG.mouseRadius;this.x+=dx/dist*f*2.5;this.y+=dy/dist*f*2.5;}
        this.alpha+=this.twinkleSpeed*this.twinkleDir;
        if(this.alpha>this.baseAlpha+.3||this.alpha<.1) this.twinkleDir*=-1;
        if(this.x<-5)this.x=W+5; if(this.x>W+5)this.x=-5;
        if(this.y<-5)this.y=H+5; if(this.y>H+5)this.y=-5;
      }
      draw() {
        ctx.save(); ctx.globalAlpha=Math.max(0,Math.min(1,this.alpha));
        ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fillStyle=CONFIG.colors[this.colorIdx]; ctx.fill();
        if(this.r>1.8){
          ctx.beginPath(); ctx.arc(this.x,this.y,this.r*2.5,0,Math.PI*2);
          const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*2.5);
          g.addColorStop(0,CONFIG.colors[this.colorIdx]+'55'); g.addColorStop(1,'transparent');
          ctx.fillStyle=g; ctx.fill();
        }
        ctx.restore();
      }
    }

    function drawConnections(){
      for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){
        const a=particles[i],b=particles[j];
        const d=Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);
        if(d<CONFIG.connectionDist){
          ctx.save(); ctx.globalAlpha=(1-d/CONFIG.connectionDist)*.25;
          ctx.strokeStyle='#3B82F6'; ctx.lineWidth=.6;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); ctx.restore();
        }
      }
    }

    let shootingStars=[];
    function spawnShootingStar(){shootingStars.push({x:Math.random()*W,y:Math.random()*H*.5,len:80+Math.random()*80,speed:6+Math.random()*6,alpha:1,angle:Math.PI/5+(Math.random()-.5)*.3});}
    function updateShootingStars(){
      shootingStars=shootingStars.filter(s=>s.alpha>0);
      for(const s of shootingStars){
        s.x+=Math.cos(s.angle)*s.speed; s.y+=Math.sin(s.angle)*s.speed; s.alpha-=.022;
        ctx.save(); ctx.globalAlpha=Math.max(0,s.alpha);
        const g=ctx.createLinearGradient(s.x,s.y,s.x-Math.cos(s.angle)*s.len,s.y-Math.sin(s.angle)*s.len);
        g.addColorStop(0,'#fff'); g.addColorStop(1,'transparent');
        ctx.strokeStyle=g; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-Math.cos(s.angle)*s.len,s.y-Math.sin(s.angle)*s.len); ctx.stroke(); ctx.restore();
      }
    }
    setInterval(()=>{if(document.visibilityState!=='hidden')spawnShootingStar();},3500);

    const nebulae=[{x:.75,y:.3,r:.35,c:'rgba(37,99,235,'},{x:.2,y:.7,r:.28,c:'rgba(96,165,250,'},{x:.5,y:.15,r:.22,c:'rgba(37,99,235,'}];
    function drawNebulae(){
      for(const n of nebulae){
        const cx=n.x*W,cy=n.y*H,rad=n.r*Math.min(W,H);
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rad);
        g.addColorStop(0,n.c+'.09)'); g.addColorStop(.6,n.c+'.04)'); g.addColorStop(1,n.c+'0)');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      }
    }

    function loop(){
      ctx.fillStyle=CONFIG.bgColor; ctx.fillRect(0,0,W,H);
      drawNebulae(); drawConnections();
      for(const p of particles){p.update();p.draw();}
      updateShootingStars(); animId=requestAnimationFrame(loop);
    }
    function init(){resize();particles=Array.from({length:CONFIG.particleCount},()=>new Particle());cancelAnimationFrame(animId);loop();}
    window.addEventListener('resize',resize);
    document.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;});
    document.addEventListener('mouseleave',()=>{mouse.x=-9999;mouse.y=-9999;});
    canvas.addEventListener('touchmove',e=>{const r=canvas.getBoundingClientRect();mouse.x=e.touches[0].clientX-r.left;mouse.y=e.touches[0].clientY-r.top;e.preventDefault();},{passive:false});
    canvas.addEventListener('touchend',()=>{mouse.x=-9999;mouse.y=-9999;});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')cancelAnimationFrame(animId);else loop();});
    init();
  })();

  /* ── 2. PROFILE CANVAS ───────────────────────────────────────────── */
  (function initProfile(){
    const canvas=document.getElementById('profileCanvas');
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    const SIZE=270; canvas.width=SIZE; canvas.height=SIZE;
    function drawFallback(){
      ctx.clearRect(0,0,SIZE,SIZE); ctx.save();
      ctx.beginPath(); ctx.arc(SIZE/2,SIZE/2,SIZE/2,0,Math.PI*2); ctx.clip();
      const g=ctx.createLinearGradient(0,0,SIZE,SIZE);
      g.addColorStop(0,'#1D4ED8'); g.addColorStop(1,'#3B82F6');
      ctx.fillStyle=g; ctx.fillRect(0,0,SIZE,SIZE);
      ctx.fillStyle='#fff'; ctx.font=`bold 72px 'Playfair Display',serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('MS',SIZE/2,SIZE/2); ctx.restore();
    }
    function drawRounded(imgEl){
      ctx.clearRect(0,0,SIZE,SIZE); ctx.save();
      ctx.beginPath(); ctx.arc(SIZE/2,SIZE/2,SIZE/2,0,Math.PI*2); ctx.clip();
      const iw=imgEl.naturalWidth,ih=imgEl.naturalHeight;
      ctx.drawImage(imgEl,iw*.03,ih*.015,iw*.295,ih*.225,0,0,SIZE,SIZE); ctx.restore();
    }
    const img=new Image();
    img.onload=()=>drawRounded(img); img.onerror=drawFallback;
    img.src='Mohammad_Sakib_Hossen_CV_pdf.png';
  })();

  /* ── 3. NAVBAR ───────────────────────────────────────────────────── */
  (function initNav(){
    const navbar=document.getElementById('navbar');
    const menuBtn=document.getElementById('menuBtn');
    const mobileMenu=document.getElementById('mobileMenu');
    window.addEventListener('scroll',()=>navbar.classList.toggle('shadow-lg',window.scrollY>20));
    menuBtn.addEventListener('click',()=>{
      const open=mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('flex',!open);
      const spans=menuBtn.querySelectorAll('span');
      const isOpen=!open;
      spans[0].style.transform=isOpen?'rotate(45deg) translate(5px,5px)':'';
      spans[1].style.opacity=isOpen?'0':'1';
      spans[2].style.transform=isOpen?'rotate(-45deg) translate(5px,-5px)':'';
    });
    mobileMenu.querySelectorAll('a').forEach(link=>{
      link.addEventListener('click',()=>{
        mobileMenu.classList.add('hidden'); mobileMenu.classList.remove('flex');
        menuBtn.querySelectorAll('span').forEach(s=>{s.style.transform='';s.style.opacity='1';});
      });
    });
    const allLinks=document.querySelectorAll('.nav-link');
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          allLinks.forEach(l=>l.classList.remove('active'));
          const active=[...allLinks].find(l=>l.getAttribute('href')==='#'+entry.target.id);
          if(active)active.classList.add('active');
        }
      });
    },{threshold:.35});
    document.querySelectorAll('section[id]').forEach(s=>io.observe(s));
  })();

  /* ── 4. SCROLL FADE-IN ───────────────────────────────────────────── */
  (function initFadeIn(){
    const items=document.querySelectorAll('.fade-up');
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const siblings=[...entry.target.parentElement.querySelectorAll('.fade-up:not(.visible)')];
          const idx=siblings.indexOf(entry.target);
          setTimeout(()=>entry.target.classList.add('visible'),idx*90);
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.12});
    items.forEach(el=>observer.observe(el));
  })();

  /* ── 5. SMOOTH SCROLL ────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',e=>{
      const target=document.querySelector(link.getAttribute('href'));
      if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}
    });
  });

  /* ── 6. TYPED TEXT ───────────────────────────────────────────────── */
  (function initTyped(){
    const el=document.getElementById('typedText');
    if(!el)return;
    const roles=['Front-End Developer','Senior SEO Executive (ORM)','ReactJS Engineer','Digital Growth Strategist'];
    let roleIdx=0,charIdx=0,deleting=false,paused=false;
    function tick(){
      const current=roles[roleIdx];
      if(paused){paused=false;setTimeout(tick,1800);return;}
      if(!deleting){
        el.textContent=current.slice(0,++charIdx);
        if(charIdx===current.length){deleting=true;paused=true;}
        setTimeout(tick,68);
      } else {
        el.textContent=current.slice(0,--charIdx);
        if(charIdx===0){deleting=false;roleIdx=(roleIdx+1)%roles.length;paused=true;}
        setTimeout(tick,32);
      }
    }
    setTimeout(tick,1200);
  })();