import { Application } from 'express';
import { WeTaxiService } from '../services/weTaxi.service';

export class TaxiController {
  private weTaxiService: WeTaxiService;

  constructor(private app: Application) {
    this.weTaxiService = new WeTaxiService();
    this.routes();
    this.updateLocation();
    this.addTaxi();
  }

  public routes = () => {
    return this.app.route('/welcome').get(this.weTaxiService.welcomeMessage);
  };

  public updateLocation = () => {
    return this.app
      .route('/taxi/update-location')
      .post(this.weTaxiService.updateLocation);
  };

  public addTaxi = () => {
    return this.app.route('/taxi/add-taxi').post(this.weTaxiService.addTaxi);
  };
}
