import { LightningElement } from 'lwc';
import myImage from '@salesforce/resourceUrl/NNImage';
export default class HelloWorld extends LightningElement {
        greeting = 'World';
        imageUrl = myImage;
        changeHandler(event) {
        this.greeting = event.target.value;
        }
         youtubeUrl = '';
  embedUrl = '';

  handleInputChange(event) {
    this.youtubeUrl = event.target.value;
    this.handleConvertClick();
  }

  handleConvertClick() {
    const videoIdMatch = this.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w-]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];
      this.embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else {
      this.embedUrl = ''; // Clear the embed URL if extraction fails
    }
  }

  /* 
  https://www.youtube.com/embed/oNK4x8LZec 

  https://youtu.be/_oNK4x8LZec?si=RMeoWAbumytNJdwr
*/
}