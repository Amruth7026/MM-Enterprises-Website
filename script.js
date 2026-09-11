const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

let products = [];
let cart = [];

try {
    const savedCart = localStorage.getItem("mmCart");
    cart = savedCart ? JSON.parse(savedCart) : [];
    if (!Array.isArray(cart)) {
        cart = [];
    }
} catch (error) {
    console.warn("Old cart data was invalid. Cart has been reset.");
    localStorage.removeItem("mmCart");
    cart = [];
}
let activeCat = "all";
let searchTerm = "";

/*
  This version works in TWO ways:
  1) With Live Server: it loads products.json.
  2) If you double-click index.html (file://): it automatically uses the
     built-in fallback product list, so you will not get the fetch/CORS error.
*/
async function loadProducts(){
  try{
    const response = await fetch("./products.json", {cache:"no-store"});
    if(!response.ok) throw new Error("products.json returned " + response.status);
    const data = await response.json();
    if(Array.isArray(data) && data.length) products=data;
  }catch(error){
    console.warn("products.json could not be loaded. Using built-in product data.", error);
    products = FALLBACK_PRODUCTS;
  }
  render();
}

function placeholder(cat){
  return cat==="brushes" ? "🖌️" :
         cat==="rollers" ? "🎨" :
         cat==="tools" ? "🔧" : "🧰";
}

function render(){
  const box=$("#products");
  const list=products.filter(p =>
    (activeCat==="all" || p.category===activeCat) &&
    (`${p.name} ${p.brand} ${p.category} ${p.size}`.toLowerCase().includes(searchTerm))
  );

  box.innerHTML=list.length ? list.map((p,i)=>`
    <article class="product">
      <div class="p-img">
        ${p.image ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">` : ""}
        <div class="p-placeholder" style="${p.image ? "display:none" : ""}">${placeholder(p.category)}</div>
        <span class="p-code">${String(i+1).padStart(2,"0")}</span>
      </div>
      <div class="p-body">
        <small>${p.category.toUpperCase()} · ${p.brand}</small>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="price quote">GET PRICE / QUOTE</div>
        <div class="product-actions">
          <button class="add" onclick="addCart('${p.id}')">Add to cart</button>
          <a class="wa" target="_blank" rel="noopener" href="${waLink(p)}">WhatsApp</a>
        </div>
      </div>
    </article>
  `).join("") : `
    <div style="grid-column:1/-1;text-align:center;padding:60px;color:#68736c">
      No products found.
    </div>`;
  updateCart();
}

function waLink(p){
  return "https://wa.me/918310271582?text="+encodeURIComponent(
    `Hello MM Enterprises, I am interested in ${p.name} (${p.size}). Please share price and availability.`
  );
}

function addCart(id){
  const p=products.find(x=>x.id===id);
  if(!p) return;
  const item=cart.find(x=>x.id===id);
  if(item) item.qty++;
  else cart.push({id,qty:1});
  save();
  toast("Added to cart");
}

function save(){
  localStorage.setItem("mmCart",JSON.stringify(cart));
  updateCart();
}

function updateCart(){
  $("#cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);
  $("#cartTotal").textContent=cart.reduce((s,x)=>s+x.qty,0);
  const box=$("#cartItems");

  box.innerHTML=cart.length ? cart.map(x=>{
    const p=products.find(y=>y.id===x.id);
    if(!p) return "";
    return `<div class="cart-item">
      <img src="${p.image||"assets/shilpipro-logo.jpg"}" alt="">
      <div>
        <h4>${p.name}</h4>
        <small>${p.size}</small>
        <div class="qty">
          <button onclick="changeQty('${p.id}',-1)">−</button>
          <b>${x.qty}</b>
          <button onclick="changeQty('${p.id}',1)">+</button>
          <button class="remove" onclick="removeItem('${p.id}')">Remove</button>
        </div>
      </div>
    </div>`;
  }).join("") : `
    <div style="padding:40px 0;color:#68736c;font-size:12px;text-align:center">
      Your cart is empty.<br>Add products to build an enquiry.
    </div>`;
}

function changeQty(id,n){
  const x=cart.find(y=>y.id===id);
  if(!x)return;
  x.qty+=n;
  if(x.qty<=0)cart=cart.filter(y=>y.id!==id);
  save();
}

function removeItem(id){
  cart=cart.filter(x=>x.id!==id);
  save();
}

function toast(t){
  const x=$("#toast");
  x.textContent=t;
  x.classList.add("show");
  setTimeout(()=>x.classList.remove("show"),1400);
}

// Category buttons
$$(".cats button").forEach(b=>b.onclick=()=>{
  $$(".cats button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  activeCat=b.dataset.cat;
  render();
});

// Search
$("#search").oninput=e=>{
  searchTerm=e.target.value.toLowerCase();
  render();
};

// Cart
$("#cartBtn").onclick=()=>{
  $("#cartPanel").classList.add("open");
  $("#overlay").classList.add("show");
};
function closeCart(){
  $("#cartPanel").classList.remove("open");
  $("#overlay").classList.remove("show");
}
$("#closeCart").onclick=closeCart;
$("#overlay").onclick=closeCart;

// WhatsApp checkout
$("#checkout").onclick=()=>{
  if(!cart.length){toast("Cart is empty");return;}
  let text="Hello MM Enterprises,\n\nI would like to enquire/order:\n";
  cart.forEach(x=>{
    const p=products.find(y=>y.id===x.id);
    if(p) text+=`\n• ${p.name} — Qty: ${x.qty} — ${p.size}`;
  });
  text+="\n\nPlease share price and availability.";
  window.open("https://wa.me/918310271582?text="+encodeURIComponent(text),"_blank");
};

// Enquiry form
$("#form").onsubmit=e=>{
  e.preventDefault();
  const text=`Hello MM Enterprises,\n\nName: ${$("#name").value}\nMobile: ${$("#phone").value}\nType: ${$("#req").value}\nMessage: ${$("#message").value}`;
  window.open("https://wa.me/918310271582?text="+encodeURIComponent(text),"_blank");
};

// English / Kannada primary toggle
let kn=false;
$("#lang").onclick=()=>{
  kn=!kn;
  $("#lang").textContent=kn?"English":"ಕನ್ನಡ";
  $$("[data-en]").forEach(a=>a.textContent=kn?a.dataset.kn:a.dataset.en);
  $("#heroText").textContent=kn
    ? "ಬ್ರಷ್, ರೋಲರ್, ಬ್ಲೇಡ್ ಮತ್ತು ಪೇಂಟಿಂಗ್ ಪರಿಕರಗಳನ್ನು ನೋಡಿ. ಉತ್ಪನ್ನಗಳನ್ನು ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ ಮತ್ತು WhatsApp ಮೂಲಕ MM Enterprises ಗೆ ನೇರವಾಗಿ ವಿಚಾರಣೆ ಕಳುಹಿಸಿ."
    : "A modern painting-tools store for brushes, rollers, blades and accessories. Browse the range, add what you need and send your order directly to MM Enterprises on WhatsApp.";
};

const FALLBACK_PRODUCTS = [{"id": "B001", "category": "brushes", "brand": "ShilpiPro", "name": "ShilpiPro Brush S-1", "size": "S-1", "price": 0, "image": "assets/brushes.jpg", "desc": "Professional paint brush for controlled paint application.", "featured": true}, {"id": "B002", "category": "brushes", "brand": "ShilpiPro", "name": "ShilpiPro Brush S-2", "size": "S-2", "price": 0, "image": "assets/brushes.jpg", "desc": "Professional paint brush for smooth coverage.", "featured": true}, {"id": "B003", "category": "brushes", "brand": "ShilpiPro", "name": "ShilpiPro Brush S-3", "size": "S-3", "price": 0, "image": "assets/brushes.jpg", "desc": "Professional paint brush for painting projects.", "featured": true}, {"id": "R001", "category": "rollers", "brand": "MM Enterprises", "name": "Wall Paint Roller", "size": "Ask for sizes", "price": 0, "image": "", "desc": "Roller for smooth application on walls and larger surfaces.", "featured": true}, {"id": "R002", "category": "rollers", "brand": "MM Enterprises", "name": "Premium Paint Roller", "size": "Ask for sizes", "price": 0, "image": "", "desc": "Higher-comfort roller option for painting projects.", "featured": false}, {"id": "T001", "category": "tools", "brand": "MM Enterprises", "name": "Thinner Blade", "size": "Ask for size", "price": 0, "image": "", "desc": "Painting and surface-preparation blade.", "featured": true}, {"id": "T002", "category": "tools", "brand": "MM Enterprises", "name": "Surface Scraper", "size": "Ask for size", "price": 0, "image": "", "desc": "Practical scraper for surface preparation.", "featured": false}, {"id": "A001", "category": "accessories", "brand": "MM Enterprises", "name": "Painting Accessories", "size": "Various", "price": 0, "image": "", "desc": "Useful accessories for painters and contractors.", "featured": true}, {"id": "A002", "category": "accessories", "brand": "MM Enterprises", "name": "Painter's Tool Kit", "size": "Various", "price": 0, "image": "", "desc": "A convenient selection of everyday painting tools.", "featured": false}];
loadProducts();
