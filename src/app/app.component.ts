import { AfterViewInit, Component, ElementRef } from '@angular/core';
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
  // public hasFocus = false;
  public caret;

  private keys = [
    8, 9, 13, 16, 17, 18, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 46, 91, 93,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123,
  ];
  PI_2 = Math.PI / 2;
  PI_180 = Math.PI / 180;

  // private vars
  private particles = [];
  private destroyed = [];
  // private canvas;
  private context;
  private behavior: any;
  private paint: any;
  private update: any;
  private stage: any;

  public constructor(private element: ElementRef) {}

  public ngAfterViewInit(): void {
    // this.canvas = document.querySelector('canvas');
    this.input = document.querySelector('input');
    this.caret = document.createElement('span');
    this.caret.style.position = 'absolute';
    this.caret.style.left = 0;
    this.caret.style.top = 0;
    this.caret.style.margin = 0;
    this.caret.style.width = 'auto';
    this.caret.style.visibility = 'hidden';
    this.element.nativeElement.appendChild(this.caret);

    window.onload = this.reposition.bind(this);
    window.onresize = this.reposition.bind(this);
    this.reposition();

    this.testSimulate();
  }

  public reposition() {
    this.field = this.input.getBoundingClientRect();
  }

  public spawnsCharacter(keyCode) {
    return this.keys.indexOf(keyCode) === -1;
  }

  private getRandomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  private burst(intensity) {
    let behavior = [
      this.behavior.force(-0.015, -0.015),
      this.behavior.cohesion(50),
      this.behavior.move(),
    ];

    let size = 1.25;
    let force = 0.7;
    var lifeMin = 0;
    let progress =
      Math.min(this.field.width, this.caret.offsetWidth) / this.field.width;
    let offset = this.field.left + this.field.width * progress;
    let rangeMin = Math.max(this.field.left, offset - 30);
    let rangeMax = Math.min(this.field.right, offset + 10);

    this.spray(intensity, () => {
      return [
        null,
        null,
        Vector.create(
          this.getRandomBetween(rangeMin + 10, rangeMax - 20),
          this.getRandomBetween(this.field.top + 15, this.field.bottom - 15)
        ),
        Vector.random(force),
        size + Math.random(),
        this.getRandomBetween(lifeMin, 0),
        behavior,
      ];
    });

    // top edge
    this.spray(intensity * 0.5, () => {
      return [
        null,
        null,
        Vector.create(
          this.getRandomBetween(rangeMin, rangeMax),
          this.field.top
        ),
        Vector.random(force),
        size + Math.random(),
        this.getRandomBetween(lifeMin, 0),
        behavior,
      ];
    });

    // bottom edge
    this.spray(intensity * 0.5, () => {
      return [
        null,
        null,
        Vector.create(
          this.getRandomBetween(rangeMin, rangeMax),
          this.field.top + this.field.height
        ),
        Vector.random(force),
        size + Math.random(),
        this.getRandomBetween(lifeMin, 0),
        behavior,
      ];
    });

    // left edge
    if (this.input.value.length === 1) {
      this.spray(intensity * 2, () => {
        return [
          null,
          null,
          Vector.create(
            this.field.left + Math.random() * 20,
            this.getRandomBetween(this.field.top, this.field.bottom)
          ),
          Vector.random(force),
          size + Math.random(),
          this.getRandomBetween(lifeMin, 0),
          behavior,
        ];
      });
    }

    // right edge
    if (rangeMax === this.field.right) {
      this.spray(intensity * 2, () => {
        return [
          null,
          null,
          Vector.create(
            this.field.right,
            this.getRandomBetween(this.field.top, this.field.bottom)
          ),
          Vector.random(force),
          size + Math.random(),
          this.getRandomBetween(lifeMin, 0),
          behavior,
        ];
      });
    }
  }

  private testSimulate() {
    // start particle simulation
    this.simulate('2d', {
      init: () => {},
      tick: (particles) => {
        if (!particles) {
          return;
        }

        particles.forEach((p) => {
          if (p.life > this.MAX_LIFE) {
            this.destroy(p);
          }
        });
      },
      beforePaint: () => {
        this.clear();
      },
      paint: (particle) => {
        var p = particle.position;
        var s = particle.size;
        var o = 1 - particle.life / this.MAX_LIFE;

        this.paint.circle(p.x, p.y, s, 'rgba(255,255,255,' + o + ')');
        this.paint.circle(
          p.x,
          p.y,
          s + 1.5,
          'rgba(231,244,255,' + o * 0.25 + ')'
        );

        // extra
        var w = 2;
        var wh = w * 0.5;
        var h = 35;
        var hh = h * 0.5;
        this.context.rect(p.x - wh, p.y - hh, w, h);
        this.context.fillStyle = 'rgba(231,244,255,' + o * 0.025 + ')';
        this.context.fill();
        this.context.closePath();
      },
      afterPaint: () => {
        // nothing
      },
      action: (e) => {
        if (!this.spawnsCharacter(e.keyCode)) {
          return;
        }

        this.caret.textContent = this.input.value;

        this.burst(12);

        this.input.classList.add('keyup');
        setTimeout(() => {
          this.input.classList.remove('keyup');
        }, 100);
      },
    });
  }

  // setup DOM
  private simulate(dimensions, options) {
    if (!this.update) {
      this.update = () => {};
    }

    if (!this.stage) {
      this.stage = () => {};
    }

    if (!options) {
      console.error('"options" object must be defined');
      return;
    }

    if (!options.init) {
      console.error('"init" function must be defined');
      return;
    }

    if (!options.paint) {
      console.error('"paint" function must be defined');
      return;
    }

    if (!options.tick) {
      options.tick = () => {};
    }

    if (!options.beforePaint) {
      options.beforePaint = () => {};
    }

    if (!options.afterPaint) {
      options.afterPaint = () => {};
    }

    if (!options.action) {
      options.action = () => {};
    }

    // if (document.readyState === 'interactive') {
    //   this.setup(dimensions, options);
    // } else {
    //   document.addEventListener('DOMContentLoaded', () => {
    //     this.setup(dimensions, options);
    //   });
    // }

    this.setup(dimensions, options);
  }

  // resizes canvas to fit window dimensions
  private fitCanvas() {
    this.canvas.width = this.element.nativeElement.offsetWidth;
    this.canvas.height = this.element.nativeElement.offsetHeight;
  }

  // create canvas for drawing
  private setup(dimensions, options) {
    // create
    this.canvas = document.createElement('canvas');
    this.element.nativeElement.appendChild(this.canvas);

    // correct canvas size on window resize
    window.addEventListener('resize', this.fitCanvas.bind(this));

    // go
    this.go(dimensions, options);
  }

  // canvas has been attached, let's go!
  private go(dimensions, options) {
    // set initial canvas size
    this.fitCanvas();

    // get context for drawing
    this.context = this.canvas.getContext(dimensions);

    // this.clear = clear;
    // this.destroy = destroy;
    // this.add = add;
    // this.spray = spray;
    // this.debug = debug;

    this.paint = {
      circle: (x, y, size, color) => {
        this.context.beginPath();
        this.context.arc(x, y, size, 0, 2 * Math.PI, false);
        this.context.fillStyle = color;
        this.context.fill();
      },
      square: (x, y, size, color) => {
        this.context.beginPath();
        this.context.rect(x - size * 0.5, y - size * 0.5, size, size);
        this.context.fillStyle = color;
        this.context.fill();
      },
    };

    this.behavior = {
      cohesion: (range = 100, speed = 0.001) => {
        range = Math.pow(range, 2);

        return (particle) => {
          var center = new Vector();
          var i = 0;
          var l = this.particles.length;
          var count = 0;

          if (l <= 1) {
            return;
          }

          for (; i < l; i++) {
            // don't use self in group
            if (
              this.particles[i] === particle ||
              Vector.distanceSquared(
                this.particles[i].position,
                particle.position
              ) > range
            ) {
              continue;
            }

            center.add(
              Vector.subtract(this.particles[i].position, particle.position)
            );
            count++;
          }

          if (count > 0) {
            center.divide(count);

            center.normalize();
            center.multiply(particle.velocity.magnitude);

            center.multiply(0.05);
          }

          particle.velocity.add(center);
        };
      },
      separation: (distance: number = 25) => {
        distance = Math.pow(distance, 2);

        return (particle) => {
          var heading = new Vector();
          var i = 0;
          var l = this.particles.length;
          var count = 0;
          var diff;

          if (l <= 1) {
            return;
          }

          for (; i < l; i++) {
            // don't use self in group
            if (
              this.particles[i] === particle ||
              Vector.distanceSquared(
                this.particles[i].position,
                particle.position
              ) > distance
            ) {
              continue;
            }

            // stay away from neighbours
            diff = Vector.subtract(
              particle.position,
              this.particles[i].position
            );
            diff.normalize();

            heading.add(diff);
            count++;
          }

          if (count > 0) {
            // get average
            heading.divide(count);

            // make same length as current velocity (so particle won't speed up)
            heading.normalize();
            heading.multiply(particle.velocity.magnitude);

            // limit force to make particle movement smoother
            heading.limit(0.1);
          }

          particle.velocity.add(heading);
        };
      },
      alignment: (range) => {
        range = Math.pow(range || 100, 2);
        return (particle) => {
          var i = 0;
          var l = this.particles.length;
          var count = 0;
          var heading = new Vector();

          if (l <= 1) {
            return;
          }

          for (; i < l; i++) {
            // don't use self in group also don't align when out of range
            if (
              this.particles[i] === particle ||
              Vector.distanceSquared(
                this.particles[i].position,
                particle.position
              ) > range
            ) {
              continue;
            }

            heading.add(this.particles[i].velocity);
            count++;
          }

          if (count > 0) {
            heading.divide(count);
            heading.normalize();
            heading.multiply(particle.velocity.magnitude);

            // limit
            heading.multiply(0.1);
          }

          particle.velocity.add(heading);
        };
      },
      move: () => {
        return (particle) => {
          particle.position.add(particle.velocity);

          // handle collisions?
        };
      },
      eat: (food) => {
        food = food || [];
        return (particle) => {
          var i = 0;
          var l = this.particles.length;
          var prey;

          for (; i < l; i++) {
            prey = this.particles[i];

            // can't eat itself, also, needs to be tasty
            if (prey === particle || food.indexOf(prey.group) === -1) {
              continue;
            }

            // calculate force vector
            // if (
            //   Vector.distanceSquared(particle.position, neighbour.position) <
            //     2 &&
            //   particle.size >= neighbour.size
            // ) {
            //   particle.size += neighbour.size;
            //   this.destroy(neighbour);
            // }
          }
        };
      },
      force: (x, y) => {
        return (particle) => {
          particle.velocity.x += x;
          particle.velocity.y += y;
        };
      },
      limit: (treshold) => {
        return (particle) => {
          particle.velocity.limit(treshold);
        };
      },
      attract: (forceMultiplier, groups) => {
        forceMultiplier = forceMultiplier || 1;
        groups = groups || [];
        return (particle) => {
          // attract other particles
          var totalForce = new Vector(0, 0);
          var force = new Vector(0, 0);
          var i = 0;
          var l = this.particles.length;
          var distance;
          var pull;
          var attractor;
          var grouping = groups.length;

          for (; i < l; i++) {
            attractor = this.particles[i];

            // can't be attracted by itself or mismatched groups
            if (
              attractor === particle ||
              (grouping && groups.indexOf(attractor.group) === -1)
            ) {
              continue;
            }

            // calculate force vector
            force.x = attractor.position.x - particle.position.x;
            force.y = attractor.position.y - particle.position.y;
            distance = force.magnitude;
            force.normalize();

            // the bigger the attractor the more force
            force.multiply(attractor.size / distance);

            totalForce.add(force);
          }

          totalForce.multiply(forceMultiplier);

          particle.velocity.add(totalForce);
        };
      },
      wrap: (margin) => {
        return (particle) => {
          // move around when particle reaches edge of screen
          var position = particle.position;
          var radius = particle.size * 0.5;

          if (position.x + radius > this.canvas.width + margin) {
            position.x = radius;
          }

          if (position.y + radius > this.canvas.height + margin) {
            position.y = radius;
          }

          if (position.x - radius < -margin) {
            position.x = this.canvas.width - radius;
          }

          if (position.y - radius < -margin) {
            position.y = this.canvas.height - radius;
          }
        };
      },
      reflect: () => {
        return (particle) => {
          // bounce from edges
          var position = particle.position;
          var velocity = particle.velocity;
          var radius = particle.size * 0.5;

          if (position.x + radius > this.canvas.width) {
            velocity.x = -velocity.x;
          }

          if (position.y + radius > this.canvas.height) {
            velocity.y = -velocity.y;
          }

          if (position.x - radius < 0) {
            velocity.x = -velocity.x;
          }

          if (position.y - radius < 0) {
            velocity.y = -velocity.y;
          }
        };
      },
      edge: (action) => {
        return (particle) => {
          var position = particle.position;
          var velocity = particle.velocity;
          var radius = particle.size * 0.5;

          if (position.x + radius > this.canvas.width) {
            action(particle);
          }

          if (position.y + radius > this.canvas.height) {
            action(particle);
          }

          if (position.x - radius < 0) {
            action(particle);
          }

          if (position.y - radius < 0) {
            action(particle);
          }
        };
      },
    };

    // // public
    // Object.defineProperties(this, {
    //   particles: {
    //     get: () => {
    //       return this.particles;
    //     },
    //   },
    //   width: {
    //     get: () => {
    //       return this.canvas.width;
    //     },
    //   },
    //   height: {
    //     get: () => {
    //       return this.canvas.height;
    //     },
    //   },
    //   context: {
    //     get: () => {
    //       return this.context;
    //     },
    //   },
    // });

    // call init method so the scene can be setup
    options.init();

    // start ticking
    this.tick(options);

    // start listening to events
    var self = this;
    document.addEventListener('keyup', (e) => {
      options.action(self, e);
    });
  }

  // simulation update loop
  private act(options) {
    // update particle states
    var i = 0;
    var l = this.particles.length;
    var p;
    for (; i < l; i++) {
      this.particles[i].update(this);
    }

    // clean destroyed particles
    while ((p = this.destroyed.pop())) {
      do {
        // has not been found in destroyed array?
        if (p !== this.particles[i]) {
          continue;
        }

        // remove particle
        this.particles.splice(i, 1);
      } while (i-- >= 0);
    }

    // repaint context
    options.beforePaint();

    // repaint particles
    i = 0;
    l = this.particles.length;
    for (; i < l; i++) {
      options.paint(this.particles[i]);
    }

    // after particles have been painted
    options.afterPaint();
  }

  /**
   * API
   **/
  private clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private tick(options) {
    // call update method, this allows for inserting particles later on
    options.tick(this.particles);

    // update particles here
    this.act(options);

    // on to the next frame
    window.requestAnimationFrame(() => {
      this.tick(options);
    });
  }

  private destroy(particle) {
    this.destroyed.push(particle);
  }

  private add(id, group, position, velocity, size, life, behavior) {
    this.particles.push(
      new Particle(id, group, position, velocity, size, life, behavior)
    );
  }

  private spray(amount, config) {
    var i = 0;
    for (; i < amount; i++) {
      this.add(
        config[0],
        config[1],
        config[2],
        config[3],
        config[4],
        config[5],
        config[6]
      );
    }
  }

  private debug(particle) {
    this.paint.circle(
      particle.position.x,
      particle.position.y,
      particle.size,
      'rgba(255,0,0,.75)'
    );
    this.context.beginPath();
    this.context.moveTo(particle.position.x, particle.position.y);
    this.context.lineTo(
      particle.position.x + particle.velocity.x * 10,
      particle.position.y + particle.velocity.y * 10
    );
    this.context.strokeStyle = 'rgba(255,0,0,.1)';
    this.context.stroke();
    this.context.closePath();
  }
}
