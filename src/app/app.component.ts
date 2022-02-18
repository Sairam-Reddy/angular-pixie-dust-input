import { AfterViewInit, Component } from '@angular/core';

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
  }

  public reposition() {
    this.field = this.input.getBoundingClientRect();
  }

  public spawnsCharacter(keyCode) {
    return this.keys.indexOf(keyCode) === -1;
  }

  public burst(intensity) {
    var behavior = [
      this.behavior.force(-0.015, -0.015),
      this.behavior.cohesion(50),
      this.behavior.move(),
    ];

    var size = 1.25;
    var force = 0.7;
    var lifeMin = 0;
    var progress =
      Math.min(this.field.width, this.caret.offsetWidth) / this.field.width;
    var offset = this.field.left + this.field.width * progress;
    var rangeMin = Math.max(this.field.left, offset - 30);
    var rangeMax = Math.min(this.field.right, offset + 10);

    this.spray(intensity, function () {
      return [
        null,
        null,
        Vector.create(
          this.getRandomBetweenNumber(rangeMin + 10, rangeMax - 20),
          this.getRandomBetweenNumber(
            this.field.top + 15,
            this.field.bottom - 15
          )
        ),
        Vector.random(force),
        size + Math.random(),
        this.getRandomBetweenNumber(lifeMin, 0),
        behavior,
      ];
    });

    // top edge
    this.spray(intensity * 0.5, function () {
      return [
        null,
        null,
        Vector.create(
          this.getRandomBetweenNumber(rangeMin, rangeMax),
          this.field.top
        ),
        Vector.random(force),
        size + Math.random(),
        this.getRandomBetweenNumber(lifeMin, 0),
        behavior,
      ];
    });

    // bottom edge
    this.spray(intensity * 0.5, function () {
      return [
        null,
        null,
        Vector.create(
          this.getRandomBetweenNumber(rangeMin, rangeMax),
          this.field.top + this.field.height
        ),
        Vector.random(force),
        size + Math.random(),
        this.getRandomBetweenNumber(lifeMin, 0),
        behavior,
      ];
    });

    // left edge
    if (this.input.value.length === 1) {
      this.spray(intensity * 2, function () {
        return [
          null,
          null,
          Vector.create(
            field.left + Math.random() * 20,
            this.getRandomBetweenNumber(this.field.top, this.field.bottom)
          ),
          Vector.random(force),
          size + Math.random(),
          this.getRandomBetweenNumber(lifeMin, 0),
          behavior,
        ];
      });
    }

    // right edge
    if (rangeMax == this.field.right) {
      this.spray(intensity * 2, function () {
        return [
          null,
          null,
          Vector.create(
            this.field.right,
            this.getRandomBetweenNumber(this.field.top, this.field.bottom)
          ),
          Vector.random(force),
          size + Math.random(),
          this.getRandomBetweenNumber(lifeMin, 0),
          behavior,
        ];
      });
    }
  }

  /**
   * Random
   */
  private getRandomBetweenNumber(min, max) {
    return min + Math.random() * (max - min);
  }
}
