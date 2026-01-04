// file: halwaKadai_homePage_mainComponent.js
import { LightningElement, wire, track } from 'lwc';

// Replace with your static resources or external URLs
import IMG1 from '@salesforce/resourceUrl/HalwaKadaiImage1';
import IMG2 from '@salesforce/resourceUrl/HalwaKadaiImage2';
import getProducts from '@salesforce/apex/Halwakadai_HelperClass.getProductsDetails';

//import PRODUCTS from @salesforce.getProductsDetails

export default class HalwaKadai_homePage_mainComponent extends LightningElement {
  // Base slide data
  //Image4 = 'https://media.licdn.com/dms/image/v2/D5622AQGzvIsavdO49g/feedshare-shrink_1280/B56ZstqXhKJsAs-/0/1765997648869?e=1769040000&v=beta&t=sv9swAEc1yV0w2eLr9oIDxihvgq1xPVmCwnOd06KfO8';
  //Image5 = 'https://raw.githubusercontent.com/Madhesh2109/halwa-heritage/refs/heads/main/images/carrot-halwa.jpg';
  Image5 = 'https://raw.githubusercontent.com/Madhesh2109/halwa-heritage/refs/heads/main/images/halwa-kadai-1.png';
  Image6 = 'https://raw.githubusercontent.com/Madhesh2109/halwa-heritage/refs/heads/main/images/halwa1.jpeg';
  Image7 = 'https://raw.githubusercontent.com/Madhesh2109/halwa-heritage/refs/heads/main/images/halwa2.jpeg';
  Image8 = 'https://raw.githubusercontent.com/Madhesh2109/halwa-heritage/refs/heads/main/images/halwa3.jpeg';
 
  ImageProduct1 = 'https://raw.githubusercontent.com/Madhesh2109/halwa-heritage/refs/heads/main/images/badam-halwa.png';
  ImageProduct2 = 'https://raw.githubusercontent.com/Madhesh2109/halwa-heritage/refs/heads/main/images/carrot-halwa.jpg';
  ImageProduct3 = 'https://raw.githubusercontent.com/Madhesh2109/halwa-heritage/refs/heads/main/images/cashew-halwa.png';
  //ImageProduct1 = 'https://raw.githubusercontent.com/Madhesh2109/halwa-heritage/refs/heads/main/images/halwa3.jpeg';
  
  
  slides = [
    //{ id: 's1', url: IMG1, alt: 'Halwa Kadai - Slide 1' },
    //{ id: 's2', url: IMG2, alt: 'Halwa Kadai - Slide 2' },
    //{ id: 's3', url: IMG3, alt: 'Halwa Kadai - Slide 3' },
    //{ id: 's4', url: this.Image4, alt: 'Halwa Kadai - Slide 4' },
    { id: 's5', url: this.Image5, alt: 'Halwa Kadai - Slide 5' },
    { id: 's6', url: this.Image6, alt: 'Halwa Kadai - Slide 6' },
    { id: 's7', url: this.Image7, alt: 'Halwa Kadai - Slide 7' },
    { id: 's8', url: this.Image8, alt: 'Halwa Kadai - Slide 8' }

  ];

  //@wire(getProducts)
  //products;
    @track halwaProducts = [];

    @wire(getProducts)
    wiredProducts({ error, data }) {
        if (data) {
            this.products = data.map((prod, index) => ({
                id: prod.Id,
                url: prod.Image_URL__c, // custom field from Product2
                alt: `Halwa Kadai - Slide ${index + 1}`,
                name: prod.Name,
                description: prod.Description
            }));
        } else if (error) {
            console.error('Error fetching products', error);
        }
    }

  halwaProducts2 = [
    //{ id: 's1', url: IMG1, alt: 'Halwa Kadai - Slide 1' },
    //{ id: 's2', url: IMG2, alt: 'Halwa Kadai - Slide 2' },
    //{ id: 's3', url: IMG3, alt: 'Halwa Kadai - Slide 3' },
    //{ id: 's4', url: this.Image4, alt: 'Halwa Kadai - Slide 4' },
    { id: 'p1', url: this.ImageProduct1, alt: 'Halwa Kadai - Slide 5', name :'Badam  Halwa', description :'Rich almond halwa made with premium almonds and saffron.' },
    { id: 'p2', url: this.ImageProduct2, alt: 'Halwa Kadai - Slide 6', name :'Carrot Halwa', description :'Delicious carrot halwa made with fresh carrots, milk, and nuts.' },
    { id: 'p3', url: this.ImageProduct3, alt: 'Halwa Kadai - Slide 7', name :'Wheat  Halwa', description :'Classic wheat halwa, light and fragrant with cardamom.' },
    { id: 'p4', url: this.ImageProduct3, alt: 'Halwa Kadai - Slide 7', name :'Wheat  Halwa', description :'Classic wheat halwa, light and fragrant with cardamom.' },
    //{ id: 's8', url: this.Image8, alt: 'Halwa Kadai - Slide 8' }

  ];


  headline   = 'Authentic South Indian Halwa';
  subheading = 'Slow‑cooked in pure ghee with timeless Tamil heritage.';

  // Autoplay interval: set to 2000–4000 ms as you prefer
  intervalMs = 3000;

  current = 0;
  timerId;

  connectedCallback() {
    // Start autoplay
    this.start();
  }

  disconnectedCallback() {
    this.stop();
  }

  start() {
    console.log('Start');

    this.stop(); // clear any existing timer
    this.timerId = window.setInterval(() => {
      this.current = (this.current + 1) % this.slides.length;
      // No need to manually recompute; the getter below reacts on re-render
    }, this.intervalMs);
  }

  stop() {    console.log('Stop');

    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  pause()  { this.stop(); }
  resume() { this.start(); }

  // Reactive getter: computes classes on each render (no function calls in template)
  get slidesComputed() {
    return this.slides.map((s, i) => ({
      ...s,
      cls: i === this.current ? 'slide active' : 'slide'
    }));
  }
}