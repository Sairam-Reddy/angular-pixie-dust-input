import { AfterViewInit, Component } from '@angular/core';
import { Particle } from './models/particle.model';
import { Vector } from './models/vector.model';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  public MAX_LIFE = 50;
  public canvas;
  public input;
  public field;
  public hasFocus = false;
  public caret;

  private keys = [
    8, 9, 13, 16, 17, 18, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 46, 91, 93,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123,
  ];
  PI_2 = Math.PI / 2;
  PI_180 = Math.PI / 180;

  public ngAfterViewInit(): void {
    this.canvas = document.querySelector('canvas');
    this.input = document.querySelector('input');
    this.caret = document.createElement('span');
    this.caret.style.position = 'absolute';
    this.caret.style.left = 0;
    this.caret.style.top = 0;
    this.caret.style.margin = 0;
    this.caret.style.width = 'auto';
    this.caret.style.visibility = 'hidden';
    document.body.appendChild(this.caret);

    window.onload = this.reposition;
    window.onresize = this.reposition;
    this.reposition();

    this.input.onfocus = () => {
      this.hasFocus = true;
    };

    this.input.onblur = () => {
      this.hasFocus = false;
    };
  }

  public reposition() {
    this.field = this.input.getBoundingClientRect();
  }

  public spawnsCharacter(keyCode) {
    return this.keys.indexOf(keyCode) === -1;
  }
}
