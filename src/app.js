document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Bawang Goreng 300gr", img: "bwg1.png", price: 20000 },
      { id: 2, name: "Kacang Goreng 10k", img: "kcg1.jpg", price: 10000 },
      { id: 3, name: "Kerupuk Bawang 1B", img: "krp1.jpg", price: 50000 },
      { id: 4, name: "Bawang Goreng 1 Karung", img: "krg1.png", price: 750000 },
      { id: 5, name: "Bawang Goreng 1 Gantung", img: "bwg2.png", price: 50000 },
      { id: 6, name: "Bawang Goreng 70g 1G", img: "bwg4.jpg", price: 30000 },
      { id: 7, name: "Minyak Goreng 75g 1 pcs", img: "bwg5.jpg", price: 5000 },
      { id: 8, name: "Bawang Goreng Mix 170g", img: "bwg6.jpg", price: 8000 },
      { id: 9, name: "Minyak Goreng 1L", img: "myk1.jpg", price: 15000 },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // Cek Apakah Ada Barang Yang Sama Di Cart
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // Jika Belum Ada Atau Barang Kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        // Jika Barang sudah ada apakah barang itu beda atau sama dengan yg ada di cart??
        this.items = this.items.map((item) => {
          // Jika Barang Berbeda
          if (item.id !== newItem.id) {
            return item;
          } else {
            // Jika Barang Sudah Ada Tambah quantity dan sub totalnya
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },
    remove(id) {
      // Ambil Item yang mau diremove berdasarkan ID nya
      const cartItem = this.items.find((item) => item.id === id);

      // Jika Item lebih Dari 1
      if (cartItem.quantity > 1) {
        // Telusuri satu persatu
        this.items = this.items.map((item) => {
          //Jika bukan barang yang di klik
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        // Jika Barangnya Sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

// Form Validation
const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");

form.addEventListener("keyup", function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove("disabled");
      checkoutButton.classList.add("disabled");
    } else {
      return false;
    }
  }
  checkoutButton.disabled = false;
  checkoutButton.classList.remove("disabled");
});

// Kirim data ketika tombol checkout di klik
checkoutButton.addEventListener("click", async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  // const message = formatMessage(objData);
  // window.open('http://wa.me/62895620058282?text=' + encodeURIComponent(message));

  // Minta transaction token menggunakan ajax / fetch

  try {
    const response = await fetch("php/placeOrder.php", {
      method: "POST",
      body: data,
    });
    const token = await response.text();

    window.snap.pay(token);
  } catch (err) {
    console.log(err.message);
  }
});

const formatMessage = (obj) => {
  return `Data Customer
      nama: ${obj.name}
      email: ${obj.email}
      phone: ${obj.phone}
Data Pesanan
${JSON.parse(obj.items).map(
  (item) => `${item.name} (${item.quantity} x 
${rupiah(item.total)}) \n`
)}
Total : ${rupiah(obj.total)} 
Terima kasih.`;
};

// Konversi Ke Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
