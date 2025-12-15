import { Component, input } from '@angular/core';
import { AppButton } from '../../../shared/components/app-button/app-button';
import { CTASection } from '../../../core/models/home.model';


@Component({
  selector: 'app-home-booking',
  imports: [AppButton],
  templateUrl: './home-booking.html',
  styleUrl: './home-booking.css'
})
export class HomeBooking {
  //! Input for CTA Section data
  ctasection = input<CTASection | null>(null);

  //! button data
  btnText = "احجز موعدك";

}
