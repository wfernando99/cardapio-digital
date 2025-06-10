/* --------- REGISTRO DO SERVICE WORKER --------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then(reg => console.log("SW registrado:", reg.scope))
      .catch(err => console.error("SW falhou:", err));
  });
}
/* ---------- DADOS ---------- */
const products=[
  {id:1,name:"Cheeseburger",description:"Pão, carne, queijo.",category:"burgers",price:15.9,image:"images/cheeseburger.jpg"},
  {id:2,name:"Duplo Bacon", description:"Dois hambúrgueres, bacon.",category:"burgers",price:22.0,image:"images/baconburger.jpg"},
  {id:3,name:"Pizza Margherita",description:"Tomate, mussarela, manjericão.",category:"pizzas",price:29.5,image:"images/pizza.jpg"},
  {id:4,name:"Calabresa", description:"Calabresa e cebola.",category:"pizzas",price:33.0,image:"images/calabresa.jpg"},
  {id:5,name:"Refrigerante", description:"Lata 350 ml.",category:"bebidas",price:6.0,image:"images/refri.jpg"},
  {id:6,name:"Suco Natural",description:"300 ml – laranja/limão.",category:"bebidas",price:8.5,image:"images/suco.jpg"}
];

/* ---------- ESTADO ---------- */
let cart=[];

/* ---------- HELPERS ---------- */
const $=sel=>document.querySelector(sel);
const format=v=>v.toFixed(2).replace('.',',');
function toast(msg){
  const el=$("#toast");
  el.textContent=msg;
  el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),1800);
}
function moneyMask(e){
  let v=e.target.value.replace(/\D/g,"");
  v=(v/100).toFixed(2).replace(".",",");
  e.target.value=v;
}

/* ---------- RENDER PRODUTOS ---------- */
function renderProducts(list=products){
  const wrap=$("#products");
  wrap.innerHTML="";
  list.forEach(p=>{
    wrap.insertAdjacentHTML("beforeend",`
      <div class="product">
        <div class="imgWrap skeleton">
          <img src="${p.image}" alt="${p.name}" loading="lazy"
               onload="this.parentNode.classList.remove('skeleton')">
        </div>
        <div class="product-content">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <strong>R$ ${format(p.price)}</strong>
          <button class="add-to-cart-btn" data-id="${p.id}">Adicionar ao Carrinho</button>
        </div>
      </div>
    `);
  });
}

/* ---------- CARRINHO ---------- */
function updateCart(){
  const count=cart.reduce((s,i)=>s+i.quantity,0);
  const total=cart.reduce((s,i)=>s+i.price*i.quantity,0);

  if(count===0){
    $("#bottomBar").classList.add("hidden");
  }else{
    $("#bottomBar").classList.remove("hidden");
    $("#bottomSubtotal").textContent=format(total);
    $("#openCartBtn").textContent=`Ver Sacola (${count})`;
  }

  const drawer=$("#cartItemsDrawer");
  drawer.innerHTML="";
  cart.forEach((item,i)=>{
    drawer.insertAdjacentHTML("beforeend",`
      <div class="cart-item">
        <span>${item.name} x${item.quantity}</span>
        <button class="remove-item" data-index="${i}">✕</button>
      </div>
    `);
  });
  $("#cartTotalDrawerValue").textContent=format(total);
}

function addToCart(id){
  const prod=products.find(p=>p.id==id);
  if(!prod)return;
  const item=cart.find(p=>p.id==id);
  item?item.quantity++:cart.push({...prod,quantity:1});
  updateCart();
  toast(`${prod.name} adicionado!`);
}
function removeFromCart(i){
  cart.splice(i,1);
  updateCart();
}

/* ---------- FILTROS ---------- */
function applyFilters(){
  const cat=$(".categories li.active").dataset.category;
  const term=$("#searchInput").value.toLowerCase();
  let list=products;
  if(cat!=="todos")list=list.filter(p=>p.category===cat);
  if(term)list=list.filter(p=>p.name.toLowerCase().includes(term)||p.description.toLowerCase().includes(term));
  renderProducts(list);
}

/* ---------- CHECKOUT ---------- */
function handleCheckout(e){
  e.preventDefault();
  if(!cart.length)return alert("Sacola vazia!");

  const nome=$("#nome").value.trim();
  const end=$("#endereco").value.trim();
  const pag=$("#pagamento").value;
  const troco=$("#troco").value;

  let msg=`*Pedido via Cardápio*%0A%0A`;
  msg+=`*Cliente:* ${nome}%0A*Endereço:* ${end}%0A%0A*Itens:*%0A`;
  cart.forEach(i=>msg+=`${i.name} x${i.quantity} - R$ ${format(i.price*i.quantity)}%0A`);
  msg+=`%0A*Total:* R$ ${format(cart.reduce((s,i)=>s+i.price*i.quantity,0))}%0A`;
  msg+=`*Pagamento:* ${pag}%0A`;
  if(pag==="Dinheiro"&&troco)msg+=`*Troco para:* R$ ${troco}%0A`;

  window.location=`https://wa.me/5581999999999?text=${msg}`;
}

/* ---------- EVENTOS ---------- */
document.addEventListener("DOMContentLoaded",()=>{
  renderProducts();

  $("#products").addEventListener("click",e=>{
    if(e.target.classList.contains("add-to-cart-btn"))
      addToCart(e.target.dataset.id);
  });
  $("#cartItemsDrawer").addEventListener("click",e=>{
    if(e.target.classList.contains("remove-item"))
      removeFromCart(e.target.dataset.index);
  });
  document.querySelectorAll(".categories li").forEach(li=>{
    li.onclick=()=>{
      document.querySelectorAll(".categories li").forEach(l=>l.classList.remove("active"));
      li.classList.add("active");
      applyFilters();
    };
  });
  $("#searchInput").oninput=applyFilters;

  $("#toggleTheme").onclick=()=>{
    document.body.classList.toggle("dark");
    $("#toggleTheme").textContent=document.body.classList.contains("dark")?"Modo Claro":"Modo Escuro";
  };

  $("#openCartBtn").onclick=()=>{
    $("#cartDrawer").classList.remove("hidden");
    $("#cartDrawer").classList.add("show");
    $("#drawerOverlay").classList.add("show");
  };
  $("#drawerOverlay").onclick=()=>{
    $("#cartDrawer").classList.add("hidden");
    $("#drawerOverlay").classList.remove("show");
  };

  $("#goCheckoutBtn").onclick=()=>{
    $("#cartDrawer").classList.add("hidden");
    $("#drawerOverlay").classList.remove("show");
    $("#checkoutSection").classList.remove("hidden");
    window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
  };

  $("#pagamento").onchange=e=>{
    e.target.value==="Dinheiro"?$("#trocoSection").classList.remove("hidden")
                               :$("#trocoSection").classList.add("hidden");
  };
  $("#troco").addEventListener("input",moneyMask);
  $("#checkoutForm").addEventListener("submit",handleCheckout);
});