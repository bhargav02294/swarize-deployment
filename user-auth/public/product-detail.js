/* ===================================
   GLOBAL
=================================== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
}

body {
  background: #0d0d0d;
  color: #f0f0f0;
}

/* ===================================
   NAVBAR
=================================== */

.navbar {
  width: 100%;
  background: #111;
  padding: 18px 40px;
  border-bottom: 1px solid #222;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-img { height: 40px; }

.menu {
  display: flex;
  gap: 30px;
  list-style: none;
}

.menu-item {
  color: #ccc;
  text-decoration: none;
}

.menu-item:hover { color: #fff; }

/* ===================================
   LAYOUT
=================================== */

.product-wrapper {
  max-width: 1350px;
  margin: 60px auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 80px;
  align-items: start;
}

/* ===================================
   GALLERY
=================================== */

.main-image-wrap {
  width: 100%;
  height: 650px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image-wrap img,
.main-image-wrap video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.thumbnail-row {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  overflow-x: auto;
}

.thumb-item {
  width: 90px;
  height: 90px;
  border: 1px solid #333;
  cursor: pointer;
}

/* ===================================
   INFO PANEL
=================================== */

.product-info {
  position: sticky;
  top: 120px;
}

.product-title {
  font-size: 34px;
  font-weight: 600;
  margin-bottom: 25px;
}

.price-box { margin-bottom: 25px; }

.display-price {
  color: #777;
  text-decoration: line-through;
}

.main-price {
  font-size: 30px;
  font-weight: 700;
  margin-top: 5px;
}

.selection-row {
  display: flex;
  gap: 12px;
  margin: 10px 0;
}

.selection-row label {
  min-width: 110px;
  font-weight: 600;
}

.size-container button {
  background: #000;
  border: 1px solid #fff;
  color: #fff;
  padding: 6px 12px;
  cursor: pointer;
}

.size-container button.selected {
  background: #fff;
  color: #000;
}

.size-chart-link {
  background: none;
  border: none;
  color: #38bdf8;
  cursor: pointer;
  margin-top: 5px;
}

/* ===================================
   BUTTONS
=================================== */

.buy-box {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn {
  padding: 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.buy-now {
  background: #fff;
  color: #000;
  border: none;
}

.add-to-cart {
  background: transparent;
  border: 1px solid #444;
  color: #fff;
}

.add-to-cart:hover {
  border-color: #fff;
}

/* ===================================
   DETAILS
=================================== */

.spec-separator {
  margin: 30px 0;
  border-top: 1px solid #333;
}

.spec-row {
  margin-bottom: 10px;
  color: #ccc;
}

.spec-row span {
  color: #fff;
}

/* ===================================
   MODAL
=================================== */

.modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
}

.modal {
  display: none;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #111;
  padding: 30px;
  width: 400px;
  border: 1px solid #333;
  z-index: 1001;
}

.close-btn {
  margin-top: 20px;
  padding: 10px;
  width: 100%;
}

/* ===================================
   MOBILE
=================================== */

@media (max-width: 768px) {

  .product-wrapper {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 0 20px;
  }

  .main-image-wrap {
    height: 420px;
  }

  .product-info {
    position: relative;
    top: 0;
  }

  .buy-box {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}
