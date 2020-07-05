import { Request, Response } from 'express';
import {
  WELCOME_MESSAGE,
  GPS_THRESOLD,
} from '../constants/WeTaxiApi.constants';
import models from '../models';

export class WeTaxiService {
  public welcomeMessage = (req: Request, res: Response): Response => {
    return res.status(200).send(WELCOME_MESSAGE);
  };

  // adding a taxi to db
  public addTaxi = async (req: Request, res: Response): Promise<any> => {
    const taxiNumber = req.body.taxiNumber;
    const newTaxi = new models.Taxi({ taxiNumber: taxiNumber });
    const taxi = await newTaxi.save();
    return res.status(200).send(taxi);
  };

  //
  public updateLocation = async (req: Request, res: Response): Promise<any> => {
    // required request json data object in the request body Ex: = {taxiNumber: "taxiNumber", newLocation: {latitude: 9.099, longitude: 8.7676}}
    const locationData = req.body.locationData;
    const taxiNumber = locationData.taxiNumber;
    const taxiLocation = locationData.newLocation;
    // convert request's latitude and longitude to numbers since the request body values received are strings
    taxiLocation.latitude = Number(taxiLocation.latitude);
    taxiLocation.longitude = Number(taxiLocation.longitude);
    const taxi = await models.Taxi.findOne({ taxiNumber: taxiNumber });
    if (taxi) {
      // check if the taxi is a new one without previous location updates
      if (taxi.lastLocationLatitude) {
        // check the location update suffices the threshold value to avoid noise
        if (
          Math.abs(taxi.lastLocationLatitude - taxiLocation.latitude) >
            GPS_THRESOLD ||
          Math.abs(taxi.lastLocationLongitude - taxiLocation.longitude) >
            GPS_THRESOLD
        ) {
          taxi.lastLocationLatitude = taxiLocation.latitude;
          taxi.lastLocationLongitude = taxiLocation.longitude;
          await taxi.save();
          return res.status(200).send({
            result: 'Success',
          });
        } else {
          return res.status(200).send({
            result: 'Not a considerable GPS change',
          });
        }
      } else {
        taxi.lastLocationLatitude = taxiLocation.latitude;
        taxi.lastLocationLongitude = taxiLocation.longitude;
        await taxi.save();
        return res.status(200).send({
          result: 'Success',
        });
      }
    } else {
      return res.status(400).send('Not found!');
    }
  };

  // get the parking lots
  public getParkingLots = async (req: Request, res: Response): Promise<any> => {
    const parkingLots = await models.ParkingLot.find({});
    return res.status(200).send(parkingLots);
  };

  // get all taxis in a certaing parking lot
  public getParkingLotTaxis = (req: Request, res: Response): any => {
    const parkingLotId = req.body.parkingLotId;
    models.ParkingLot.findById(parkingLotId)
      .then((parkingLot) => {
        return res.status(200).send(parkingLot.taxiQueue);
      })
      .catch((error) => {
        return res.status(500).send({ error: error });
      });
  };

  // adding a bonus to a taxi in a parking lot
  public addBonus = async (req: Request, res: Response): Promise<any> => {
    const parkingLotId = req.body.parkingLotId;
    const taxiNumber = req.body.taxiNumber;

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
      const updateLot = await parkingLot.save();
      return res.status(200).send(updateLot.taxiQueue);
    } else {
      return res.status(500).send({
        error: 'Invalid Request: Taxi is not available in the parking lot',
      });
    }
  };

  // add a taxi to a parking lot
  public addToParkingLot = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const parkingLotId = req.body.parkingLotId;
    const taxiNumber = req.body.taxiNumber;

    const parkingLot = await models.ParkingLot.findById(parkingLotId);
    const taxisAvailable = parkingLot.taxiQueue;
    const otherTaxis = taxisAvailable.filter(
      (existingNumber) => existingNumber != taxiNumber
    );
    // check whether already taxi is added to the queue or not
    if (otherTaxis.length == taxisAvailable.length) {
      otherTaxis.push(taxiNumber);
      parkingLot.taxiQueue = otherTaxis;
      parkingLot.availableSlots = parkingLot.availableSlots - 1;
      // reduce 1 from available slots in the parking lot
      const updatedLot = await parkingLot.save();
      return res.status(200).send(updatedLot.taxiQueue);
    } else {
      return res.status(500).send({
        error: 'Invalid Request: Taxi is available in the parking lot already',
      });
    }
  };

  // release a taxi from the queue of the given parking lot
  public releaseTaxi = async (req: Request, res: Response): Promise<any> => {
    const parkingLotId = req.body.parkingLotId;
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
      const updatedLot = await parkingLot.save();
      return res.status(200).send(updatedLot.taxiQueue);
    } else {
      return res.status(500).send({
        error: 'Invalid Request: No taxis in the parking lot',
      });
    }
  };
}
