import { STORE } from '/data/products.js';
import { initLayout } from '/assets/js/layout.js';
initLayout();
// Placeholder photos on info pages are labelled while the store is in demo mode.
if (STORE.demo) document.querySelectorAll('.demo-only').forEach((el) => { el.hidden = false; });
