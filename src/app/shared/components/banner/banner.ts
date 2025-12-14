import { Component, Input, AfterViewInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.css'
})
export class Banner {
  @Input() customClass: string = '';
  @Input() direction: 'left' | 'right' = 'left'; // 'left' for right-to-left, 'right' for left-to-right

  @ViewChildren('iconRef') icons!: QueryList<ElementRef>;

  ngAfterViewInit() {
    const elements = this.icons.map(el => el.nativeElement);
    const isRightToLeft = this.direction === 'left'; // Default direction is right-to-left when direction is 'left'
    const startX = isRightToLeft ? 200 : -200;
    const endX = isRightToLeft ? -1000 : 1000;

    const tl = gsap.timeline({ repeat: -1 });

    // 1) Enter animation
    tl.from(elements, {
      x: startX,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // 2) Continuous movement
    tl.to(elements, {
      x: endX,
      duration: 5,
      ease: 'none',
    }, '>');

    // 3) Exit animation
    tl.to(elements, {
      x: isRightToLeft ? (endX - 200) : (endX + 200),
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.in'
    }, '>');
  }
}