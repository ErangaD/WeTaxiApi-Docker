import { Application } from 'express';
import { WeTaxiService } from '../services/weTaxi.service';

export class ParkingLotController {
  private weTaxiService: WeTaxiService;

  constructor(private app: Application) {
    this.weTaxiService = new WeTaxiService();
    this.routes();
    this.getParkingLots();
    this.getTaxiQueue();
  }

  public routes = () => {
    return this.app.route('/welcome').get(this.weTaxiService.welcomeMessage);
  };

  public getParkingLots = () => {
    return this.app
      .route('/parking-lot/get-parking-lots')
      .get(this.weTaxiService.getParkingLots);
  };

  public getTaxiQueue = () => {
    return this.app
      .route('/parking-lot/get-taxis')
      .post(this.weTaxiService.getParkingLotTaxis);
  };

  public addBonus = () => {
    return this.app
      .route('/parking-lot/add-bonus')
      .post(this.weTaxiService.addBonus);
  };

  public removeTaxi = () => {
    return this.app
      .route('/parking-lot/release-taxi')
      .post(this.weTaxiService.releaseTaxi);
  };

  public addToParkingLot = () => {
    return this.app
      .route('/parking-lot/add-to-parking-lot')
      .post(this.weTaxiService.addToParkingLot);
  };
}
