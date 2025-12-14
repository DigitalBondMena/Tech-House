import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-app-button',
  imports: [],
  templateUrl: './app-button.html',
  styleUrl: './app-button.css'
})
export class AppButton {
  @Input() customClass: string = '';
  @Input() btnText: string = '';
  @Input() disabled: boolean = false;
  @Output() buttonClick = new EventEmitter<void>();
  
  onClick() {
    if (!this.disabled) {
      this.buttonClick.emit();
    }
  }
}
