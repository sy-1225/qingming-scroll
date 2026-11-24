(function () {
  const categories = {
    porter: ["人物","挑夫","挑夫将两筐货物挂在扁担两头，靠肩膀承重，连人带货一同前行。"],
    walk: ["人物", "行旅客", "随街道望去，行人或结伴而行，或独自赶路。人物姿态各异，把长街上寻常的一刻留在画中。"],
    farmer: ["人物","田间农人","水田里的农人俯身照料秧苗。沿着田埂望去，耕作、挑运和赶往城中的行旅串起近郊的一日。"],
    pilot: ["人物", "汴河船工", "船上的人须彼此照应。观察他的脚步、身体朝向和手势，再看船与桥孔之间留出的水路。"],
    boat: ["舟车", "汴河舟船", "舟船往来于汴河水面。细看船身、舱篷与船上人的位置，可以分辨载运、掌舵与行船的不同空间。"],
    stall: ["店铺", "街边铺户", "临街铺面向路人敞开。铺前的驻足、交谈与张望，让买卖的情景从屋内延伸到街面。"]
  };
  window.initMotion = function (world, callback) {
    if (world.querySelector(".painting-motion")) return;
    const css = document.createElement("style");
    css.textContent = `
      .painting-motion{position:absolute;inset:0;pointer-events:none}
      .painting-motion img{max-width:none!important;display:block}
      .painting-motion .actor,.painting-motion .repair{position:absolute;box-sizing:border-box;border:0;padding:0;background:transparent;box-shadow:none}
      .painting-motion .actor{pointer-events:auto;cursor:pointer;animation:painting-glide var(--period) ease-in-out infinite alternate;animation-delay:var(--delay);transform-origin:50% 100%}
      .painting-motion .actor img{width:100%;height:100%;pointer-events:none;animation:painting-bob 1.35s ease-in-out infinite alternate}
      .painting-motion{--gold-edge:drop-shadow(1px 0 0 #ffdd82) drop-shadow(-1px 0 0 #ffdd82) drop-shadow(0 1px 0 #fff1be) drop-shadow(0 -1px 0 #ffdd82) drop-shadow(0 0 3px #a76a18)}
      .painting-motion .actor:focus-visible{outline:2px solid #9e472b;outline-offset:3px}
      .painting-motion .boat::after{content:"";position:absolute;inset:0;background:var(--silhouette) center/100% 100% no-repeat;pointer-events:none;opacity:0;filter:var(--gold-edge)}
      .painting-motion .actor:not(.boat):focus-visible{filter:var(--gold-edge)}
      .painting-motion .boat:focus-visible::after{opacity:1}
      @media (any-hover:hover){
        .painting-motion .actor:not(.boat):hover{filter:var(--gold-edge)}
        .painting-motion .boat:hover::after{opacity:1}
      }
      @keyframes painting-glide{to{transform:translate(var(--dx),var(--dy)) rotate(var(--turn))}}
      .painting-motion .actor.boat{animation-name:boat-float;mask-image:linear-gradient(to right,transparent,#000 6% 94%,transparent),linear-gradient(to bottom,transparent,#000 8% 92%,transparent);mask-composite:intersect}
      .painting-motion .actor.gentle{animation-name:gentle-sway}
      .painting-motion .gentle img{animation:none}
      .porter-load{position:absolute;inset:0;background-image:url(scroll.jpg);clip-path:polygon(43% 29%,44% 28%,50% 29%,52% 32%,50% 37%,66% 35%,68% 34%,70% 36%,76% 56%,79% 57%,78% 72%,73% 75%,61% 75%,57% 72%,57% 58%,60% 56%,66% 38%,51% 40%,54% 42%,58% 53%,56% 58%,54% 58%,58% 81%,56% 84%,55% 91%,57% 93%,53% 96%,51% 95%,51% 85%,47% 84%,46% 94%,45% 96%,40% 95%,40% 93%,42% 91%,41% 83%,39% 82%,40% 74%,31% 76%,24% 73%,24% 58%,27% 56%,32% 41%,29% 41%,29% 39%,33% 38%,34% 37%,35% 39%,45% 37%,44% 35%)}
      @keyframes gentle-sway{to{transform:translate(1px,-.5px)}}
      @keyframes boat-float{to{transform:translate(1px,-.65px)}}
      @keyframes painting-bob{to{transform:translateY(-0.7%) rotate(.65deg)}}
      
      .painting-motion .jointed img{position:absolute;inset:0;animation:none}
      .painting-motion .jointed .torso{clip-path:inset(0 0 33% 0)}
      .painting-motion .jointed .leg{transform-origin:50% 65%;animation:painting-step .53s ease-in-out infinite alternate}
      .painting-motion .jointed .near{clip-path:inset(65% 48% 0 0)}
      .painting-motion .jointed .far{clip-path:inset(65% 0 0 52%);animation-direction:alternate-reverse}
      .painting-motion .pilot img{transform-origin:55% 83%;animation:painting-lean 2s ease-in-out infinite alternate}
      @keyframes painting-step{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}
      @keyframes painting-lean{from{transform:rotate(-4deg)}to{transform:rotate(6deg)}}
      @media(prefers-reduced-motion:reduce){.painting-motion .actor,.painting-motion .actor img{animation:none!important}}
    `;
    document.head.append(css);
    const layer = document.createElement("div");
    layer.className = "painting-motion";
    world.append(layer);
    (window.paintingActors || []).forEach(([id,x,y,w,h,kind,dx,dy,period],i) => {
      const box = 'left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%;';
      const element = document.createElement("button"), details = categories[kind];
      element.className = "actor"; element.type="button";element.setAttribute("aria-label",details[1]);
      element.style.cssText = box+'--dx:'+dx+'%;--dy:'+dy+'%;--period:'+period+'s;--delay:-'+(i*1.7)+'s;--turn:'+(kind==='stall'?2:0)+'deg';
      element.title = details[1] + " · 点击查看介绍";
      let img;
      const gentleWalker = ["waterside-pedestrian", "shopkeeper", "street-walker"].includes(id);
      if (kind === "porter") {
        element.classList.add("gentle");
        const load = document.createElement("span");
        load.className = "porter-load";
        load.style.backgroundSize = (10000/w)+"% "+(10000/h)+"%";
        load.style.backgroundPosition = (100*x/(100-w))+"% "+(100*y/(100-h))+"%";
        element.append(load);
      } else if (kind === "boat") {
        // Move the original painted detail within feathered water edges.
        element.classList.add("boat");
        element.style.setProperty("--silhouette", 'url("motion/'+id+'.png")');
        element.style.backgroundImage = "url(scroll.jpg)";
        element.style.backgroundSize = (10000/w)+"% "+(10000/h)+"%";
        element.style.backgroundPosition = (100*x/(100-w))+"% "+(100*y/(100-h))+"%";
      } else {
        const patch = document.createElement("img");
        patch.alt = ""; patch.draggable = false; patch.className = "repair"; patch.style.cssText = box;
        patch.src = "motion/"+id+"-bg.png"; if (!gentleWalker) layer.append(patch);
        else element.classList.add("gentle");
        img = document.createElement("img");img.alt='';img.draggable=false;img.src='motion/'+id+'.png';element.append(img);
      }
      if(kind === "walk" && !gentleWalker){
        element.classList.add("jointed");
        for(const side of ["near", "far"]){
          const leg = img.cloneNode();
          leg.className = "leg "+side;
          element.append(leg);
        }
        img.className="torso";
      }
      element.classList.toggle("pilot", kind === "pilot" || kind === "farmer");
      element.onclick = event => {event.stopPropagation();callback(details[1],details[0],details[2],event);};
      layer.append(element);
    });
  };
})();
//ACTORS
window.paintingActors=[["riverside-boat", 56.18380062305296, 51.93370165745856, 3.38006230529595, 13.259668508287293, "boat", 36, 9, 17], ["bridge-walker", 52.912772585669785, 33.56353591160221, 0.6386292834890965, 8.425414364640885, "walk", 65, -11, 8], ["street-walker", 10.903426791277258, 65.19337016574586, 1.5109034267912773, 17.5414364640884, "walk", 79, -10, 9], ["country-walker", 86.65109034267913, 49.171270718232044, 0.6853582554517134, 11.049723756906078, "walk", -67, 16, 9], ["shopkeeper", 39.06542056074766, 71.54696132596685, 1.588785046728972, 23.204419889502763, "stall", 3, 0, 3], ["bridge-pedestrian", 55.15576323987539, 26.65745856353591, 0.7632398753894081, 8.149171270718233, "walk", 71, 3, 8], ["bridge-vendor", 50.60747663551402, 66.16022099447514, 0.778816199376947, 10.082872928176796, "stall", 4, -1, 2.8], ["boat-pilot", 54.84423676012461, 67.95580110497238, 1.1370716510903427, 11.878453038674033, "pilot", 4, 0, 2.5], ["boat-crew", 59.76635514018692, 61.187845303867405, 0.778816199376947, 8.425414364640885, "pilot", 2, 0, 2.2], ["shop-customer", 17.585669781931465, 67.95580110497238, 0.8411214953271028, 12.430939226519337, "walk", 50, -7, 7], ["market-porter", 45.32710280373832, 81.49171270718232, 2.64797507788162, 18.50828729281768, "porter", 0, 0, 5], ["country-drover", 94.04984423676012, 55.110497237569064, 1.02803738317757, 7.596685082872928, "farmer", 4, 2, 2.8], ["paddy-worker", 95.34267912772586, 56.49171270718232, 1.0124610591900312, 8.425414364640885, "farmer", 3, 0, 2.4], ["waterside-pedestrian", 82.18068535825545, 63.53591160220994, 0.8255451713395638, 13.950276243093922, "walk", -59, 8, 9], ["little-ferry", 30.90342679127726, 43.92265193370166, 1.3707165109034267, 7.458563535911602, "boat", 18, -5, 14]];
