import { Component } from '@angular/core';
import { AppButton } from '../../../shared/components/app-button/app-button';


@Component({
  selector: 'app-home-booking',
  imports: [AppButton],
  templateUrl: './home-booking.html',
  styleUrl: './home-booking.css'
})
export class HomeBooking {
  //! button data
  btnText = "احجز موعدك";

}
