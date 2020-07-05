import models from '../models';
import { Request, Response } from 'express';

export class WeTaxiServiceSimulation {
  private processStarted = false;

  public addTaxi = async (taxiNumber: string): Promise<any> => {
    const newTaxi = new models.Taxi({ taxiNumber: taxiNumber });
    return await newTaxi.save();
  };

  // get the parking lots
  public getParkingLots = (): any => {
    models.ParkingLot.find({})
      .then((parkingLots) => {
        const parkingLotNames = parkingLots.map((lot) => lot.parkingLotName);
        console.log('Available Parking Lots:', parkingLotNames);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // get all taxis in a certaing parking lot
  public getParkingLotTaxis = async (parkingLotId: string): Promise<any> => {
    const parkingLot = await models.ParkingLot.findById(parkingLotId);
    console.log(
      'Available taxis in parking lot:',
      parkingLot.parkingLotName,
      ':',
      parkingLot.taxiQueue
    );
  };

  // adding a bonus to a taxi in a parking lot
  public addBonus = async (
    parkingLotId: string,
    taxiNumber: string
  ): Promise<any> => {
    const parkingLot = await models.ParkingLot.findById(parkingLotId);
    const taxisAvailable = parkingLot.taxiQueue;
    const otherTaxis = taxisAvailable.filter(
      (existingNumber) => existingNumber != taxiNumber
    );
    // check is taxi available on the parking lot?
    if (otherTaxis.length != taxisAvailable.length) {
      // if exists add to the front of the queue
      otherTaxis.unshift(taxiNumber);
      parkingLot.taxiQueue = otherTaxis;
      const updatedLot = await parkingLot.save();
      console.log(
        'Bonus Added: Taxi Shifted to first position of parking lot:',
        updatedLot.parkingLotName,
        updatedLot.taxiQueue
      );
    } else {
      console.error(
        parkingLotId,
        taxiNumber,
        'Invalid Request: Taxi is not available in the parking lot'
      );
    }
  };

  // add a taxi to a parking lot
  public addToParkingLot = async (
    parkingLotId: any,
    taxiNumber: string
  ): Promise<any> => {
    const parkingLot = await models.ParkingLot.findById(parkingLotId);
    const taxisAvailable = parkingLot.taxiQueue;
    const otherTaxis = taxisAvailable.filter(
      (existingNumber) => existingNumber != taxiNumber
    );
    // check whether already taxi is added to the queue or not
    if (otherTaxis.length == taxisAvailable.length) {
      otherTaxis.push(taxiNumber);
      parkingLot.taxiQueue = otherTaxis;
      // reduce 1 from available slots in the parking lot
      parkingLot.availableSlots = parkingLot.availableSlots - 1;
      const savedParkingLot = await parkingLot.save();
      console.log(
        'Taxi Added to the queue',
        savedParkingLot.taxiQueue,
        'of',
        savedParkingLot.parkingLotName
      );
      return savedParkingLot;
    } else {
      console.error(
        'Invalid Request: Taxi is available in the parking lot already'
      );
      return 'savedParkingLot';
    }
  };

  // release a taxi from the queue of the given parking lot
  public releaseTaxi = async (parkingLotId: string): Promise<any> => {
    const parkingLot = await models.ParkingLot.findById(parkingLotId);
    const taxisAvailable = parkingLot.taxiQueue;
    if (taxisAvailable.length > 0) {
      // get the first taxi on the list (other taxis contains the remaining ones)
      const releasingTaxi = taxisAvailable[0];
      const otherTaxis = taxisAvailable.filter(
        (existingNumber) => existingNumber != releasingTaxi
      );
      // taxi is again added to the last posision of the same queue
      otherTaxis.push(releasingTaxi);
      parkingLot.taxiQueue = otherTaxis;
      const updateLot = await parkingLot.save();
      console.log(
        'Taxi Added to last position of parking lot:',
        updateLot.parkingLotName,
        updateLot.taxiQueue
      );
    } else {
      console.error(
        parkingLotId,
        'Invalid Request: No taxis available in the parking lot'
      );
    }
  };

  private async runWithIntervals() {
    const parkingLots = await models.ParkingLot.find({});
    for (let k = 0; k < parkingLots.length; k++) {
      const parkingLot = parkingLots[k];
      // shows the existing taxis in the specific parking lot given the parking lot id
      this.getParkingLotTaxis(parkingLot._id);
      let randomTaxi = Math.floor(Math.random() * parkingLot.taxiQueue.length);
      let taxiName = 'Taxi:' + randomTaxi + ' ' + parkingLot.parkingLotName;
      // select a random taxi from the parking lot and add a bonus to that (to shift to the front of the queues)
      this.addBonus(parkingLot._id, taxiName);
      setTimeout(() => {
        randomTaxi = Math.floor(Math.random() * parkingLot.taxiQueue.length);
        taxiName = 'Taxi:' + randomTaxi + ' ' + parkingLot.parkingLotName;
        // select a random taxi and release the taxi from the queue (it is added again to the last position of the same queue since instruction was to do that)
        this.releaseTaxi(parkingLot._id);
      }, 2000);
    }
  }

  // starting the simulation
  public startSimulation = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    // add dummy data to db if not added previously
    if (!this.processStarted) {
      this.processStarted = true;
      const parkingLots = await models.ParkingLot.find({});
      for (let k = 0; k < parkingLots.length; k++) {
        // add random number of taxis to the parking lot
        const randomTaxis = 1 + Math.floor(Math.random() * 10);
        const parkingLot = parkingLots[k];
        for (let k = 0; k < randomTaxis; k++) {
          // first save the taxi and then add to the parking lot
          const result = await this.addTaxi(
            'Taxi:' + k + ' ' + parkingLot.parkingLotName
          );
          console.log('Taxi:' + k + ' ' + parkingLot.parkingLotName, 'saved');
          await this.addToParkingLot(
            parkingLot._id,
            'Taxi:' + k + ' ' + parkingLot.parkingLotName
          );
        }
      }
      setInterval(() => {
        // running simulation in every 15 seconds with the dummy data added
        this.runWithIntervals();
      }, 15000);
    }
    return res.status(200).send({ result: 'Success' });
  };
}
