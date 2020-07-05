// Express
import express, { Application } from 'express';
import bodyParser from 'body-parser';

// Importing our controller
import { Controller } from './main.controller';

// importing all the controllers as controllers from the controllers.ts file
import controllers from './controllers';

// DB
import {
  MONGO_DB,
  NUMBER_OF_AVAILABLE_SLOTS,
  NUMBER_OF_PARKING_LOTS,
} from './constants/WeTaxiApi.constants';
import mongoose from 'mongoose';

// CORS
import cors from 'cors';

// Errors
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';

// Logging
import morganBody from 'morgan-body';

// models
import models from './models';

class App {
  public app: Application;

  // Declaring our controller
  public weTaxiController: Controller;

  constructor() {
    this.app = express();
    // Main App configuration
    this.setConfig();

    // Mongo configuration
    this.setMongoConfig();

    // Creating and assigning a new controllers
    new Controller(this.app);
    new controllers.TaxiController(this.app);
    new controllers.ParkingLotController(this.app);

    // Errors always in the bottom as the cycle of Req/Resp closing with it
    this.setErrors();
  }

  private setConfig() {
    // Allows us to receive requests with data in json format
    this.app.use(bodyParser.json({ limit: '50mb' }));
    // Allows us to receive requests with data in x-www-form-urlencoded format
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    // Enables cors
    this.app.use(cors());
    // Morgan Logging
    morganBody(this.app, { theme: 'darkened' });
    // initialize parking lot if not present
    this.initializeParkingLot();
  }

  private initializeParkingLot() {
    models.ParkingLot.find({})
      .then((parkingLot) => {
        if (parkingLot.length == 0) {
          // create a new parking lots
          for (let i = 0; i < NUMBER_OF_PARKING_LOTS; i++) {
            const taxiQueue = [];
            const parkingLot = new models.ParkingLot({
              parkingLotName: 'PL:' + i,
              availableSlots: NUMBER_OF_AVAILABLE_SLOTS,
              taxiQueue: taxiQueue,
            });
            parkingLot.save();
          }
        }
      })
      .catch((error) => {
        console.error('Retrieve parking lots failed::', error);
      });
  }

  private setErrors() {
    // Error Handling
    this.app.use(errorHandler);
    this.app.use(notFoundHandler);
  }

  // Mongo connection to our DB
  private setMongoConfig() {
    mongoose.Promise = global.Promise;
    mongoose.connect(MONGO_DB, {
      useNewUrlParser: true,
    });
  }
}

export default new App().app;
