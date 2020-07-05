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
    this.startSimulation();
  }

  public routes = () => {
    return this.app.route('/welcome').get(this.weTaxiService.welcomeMessage);
  };

  public startSimulation = () => {
    return this.app
      .route('/start-simulation')
      .get(this.weTaxiServiceSimulation.startSimulation);
  };
}
