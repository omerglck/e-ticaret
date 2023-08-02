// HTML'den çektiklerimiz
const categoryList = document.querySelector(".categories");
const productsArea = document.querySelector(".products");
const basketBtn = document.getElementById("basket");
const closeBtn = document.getElementById("close");
const modalWrapper = document.querySelector(".modal-wrapper");
const basketList = document.querySelector("#list");
const totalSpan = document.querySelector("#total-price");
const totalCount = document.querySelector("#count");
const menu = document.querySelector(".menu");
const buttons = document.querySelector(".buttons");
const totalShopp = document.querySelector("#totalSepet");

// HTML'in yüklenme anı
//! *API İŞLEMLERİ
document.addEventListener("DOMContentLoaded", () => {
  // ekran yüklendiği anda çalışacak fonksiyonları tek bir foksiyon ile birleştirdik.
  // birleştirmeden yapsaydık bir addEventListener ekleyin fonksiyonu yazardık.
  fetchCategories();
  fetchProducts();
});

// Yaptığımız isteklerin tamamında bulunduğu için bunu bir değişkene atarak literal templates yapısında kullanırız.
const baseUrl = "https://api.escuelajs.co/api/v1";
/*
 * Kategori Bilgilerini Alma
 * Adım-1: API istek at.
 * Adım-2: Gelen veriyi işle.
 * Adım-3: Gelen veriyi kart şeklinde ekrana basıcak fonkisiyonu çalıştır.
 * Adım-4: Cevap hatalı olursa kullanıcıyı bilgilendir.
 */

function fetchCategories() {
  fetch(`${baseUrl}/categories`)
    // eğer ki veri olumlu gelirse çalışır
    .then((res) => res.json())
    // veriyi json formatına dönünce çalışır
    .then((data) => renderCategories(data.slice(1, 5)))
    // cevapta hata varsa çalışır
    .catch((err) => console.log(err));
}

// function fetchProducts() {
//   fetch(`${baseUrl}/products`)
//     .then((response) => response.json())
//     .then((data) => data.slice(1, 40))
//     .catch((err) => console.log(err));
// }

function renderCategories(categories) {
  // categories dizisindeki herbir obje için kart basma
  categories.forEach((category) => {
    // 1.adım: Div oluşturma
    const categoryDiv = document.createElement("div");
    // 2.adım: Div'e class ekleme
    categoryDiv.classList.add("category-card");
    // 3.adım: Div'in içeriğini belirleme
    categoryDiv.innerHTML = `
            <img src=${category.image}>
            <p>${category.name}</p>
        `;
    // 4.adım: Elemanı HTML'de categories divine ekleme
    categoryList.appendChild(categoryDiv);
  });
}

//! Ürünler için istek at
async function fetchProducts() {
  try {
    // isteği atar
    const response = await fetch(`${baseUrl}/products`);
    const data = await response.json();
    renderProducts(data.slice(0, 25));
  } catch (err) {
    // hata olursa yakalar
    console.log(err);
  }
}

// ürünleri ekrana basma
function renderProducts(products) {
  // her bir ürün için kart html'i oluştur ve diziye aktar
  const productsHTML = products
    .map(
      (product) =>
        `
          <div class="card">
              <img src=${product.images[0]}>
              <h3>${product.title}</h3>
              <h4>${
                product.category.name ? product.category.name : "Others"
              }</h4>
              <div class="bottom">
                  <span>${product.price} $</span>
                  <button onclick="addToBasket({id:${product.id},title:'${
          product.title
        }',price:${product.price},img:'${
          product.images[0]
        }',amount:1 })" id="add">Sepete Ekle</button>
              </div>
          </div>
      `
    )
    .join(" "); // dizi şeklinde ki veriyi virgülleri kaldırır stringe dönüştürür

  // ürünler HTML'ini index.html deki products a gönder
  productsArea.innerHTML = productsHTML;
}

//sepet değişkenleri
let basket = [];
let total = 0;
//! Modal Area
basketBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);

function openModal() {
  //sepeti açma
  modalWrapper.classList.add("active");
  // sepete ürünleri listeleme
  renderBasket();
}
function closeModal() {
  modalWrapper.classList.remove("active");
}
//todo burada "esc=escape" tuşuna basıldığında modalWrapper'ın active class'ını kaldırdık
document.addEventListener("keydown", (e) => {
  //   console.log("Tuş:", e.key);
  if (e.key === "Escape") {
    modalWrapper.classList.remove("active");
  }
});
//todo burada id sini kontrol ederek boşluğa tıkladığımızda modalWrapper'ın active class'ını kaldırdık
document.addEventListener("click", (e) => {
  if (e.target.id == "") {
    modalWrapper.classList.remove("active");
    return false;
  }
});

//! Sepet İşlemleri

// sepete ekleme işlemi
function addToBasket(product) {
  // ürün sepete daha önce eklendi mi
  const found = basket.find((i) => i.id === product.id);
  // eklenmiş
  if (found) {
    //sepette var miktarı arttır
    found.amount++;
  } //eklenmemiş
  else {
    basket.push(product);
  }
}

// sepete elemanları listeleme
function renderBasket() {
  const cardsHTML = basket
    .map(
      (product) => `  
          <div class="item">
          <img src=${product.img} alt="" />
          <h3 class="title">${product.title}</h3>
          <h4 class="price">${product.price}$</h4>
          <p>Miktar: ${product.amount}</p>
          <img onclick="deleteItem(${product.id})" id="delete" src="images/icons8-delete-24.png" alt="" />
          </div>
    
    
    `
    )
    .join("");

  // hazırladığımız kartları HTML'e gönderme
  basketList.innerHTML = cardsHTML;
  //toplam değeri hesapla
  calculateTotal();
}
//sepet toplamı ayarlama
function calculateTotal() {
  const sum = basket.reduce((sum, i) => sum + i.price * i.amount, 0);

  //ürün miktarı
  const amount = basket.reduce((sum, i) => sum + i.amount, 0);

  //miktarı html'e gönderme
  totalCount.innerText = amount + " Ürün";
  //toplam değeri HTML' gönderme
  totalSpan.innerText = sum;
  totalShopp.innerText = "Toplam" + sum + "$";
}

// sepetten ürün silme
function deleteItem(deleteid) {
  // kaldırılack ürün dışındaki bütün üeünleri al
  basket = basket.filter((i) => i.id !== deleteid);
  //listeyi güncelle
  renderBasket();
  //toplamı güncelle
  calculateTotal();
}

//! Hamburger Menu
menu.addEventListener("click", hamburgerMenu);
function hamburgerMenu() {
  buttons.classList.toggle("show");
}
