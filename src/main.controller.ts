import { Application } from 'express';
import { WeTaxiService } from './services/weTaxi.service';
import { WeTaxiServiceSimulation } from './services/weTaxi.service.simulation';

export class Controller {
  private weTaxiService: WeTaxiService;
  private weTaxiServiceSimulation: WeTaxiServiceSimulation;

  constructor(private app: Application) {
    this.weTaxiService = new WeTaxiService();
    this.weTaxiServiceSimulation = new WeTaxiServiceSimulation();
    this.routes();
    this.updateLocation();
    this.addTaxi();
    this.getParkingLots();
    this.getTaxiQueue();
    this.startSimulation();
  }

  public routes = () => {
    return this.app.route('/welcome').get(this.weTaxiService.welcomeMessage);
  };

  public updateLocation = () => {
    return this.app
      .route('/update-location')
      .post(this.weTaxiService.updateLocation);
  };

  public addTaxi = () => {
    return this.app.route('/add-taxi').post(this.weTaxiService.addTaxi);
  };

  public getParkingLots = () => {
    return this.app
      .route('/get-parking-lots')
      .get(this.weTaxiService.getParkingLots);
  };

  public getTaxiQueue = () => {
    return this.app
      .route('/get-taxis')
      .post(this.weTaxiService.getParkingLotTaxis);
  };

  public addBonus = () => {
    return this.app.route('/add-bonus').post(this.weTaxiService.addBonus);
  };

  public removeTaxi = () => {
    return this.app.route('/release-taxi').post(this.weTaxiService.releaseTaxi);
  };

  public addToParkingLot = () => {
    return this.app
      .route('/add-to-parking-lot')
      .post(this.weTaxiService.addToParkingLot);
  };

  public startSimulation = () => {
    return this.app
      .route('/start-simulation')
      .get(this.weTaxiServiceSimulation.startSimulation);
  };
}
