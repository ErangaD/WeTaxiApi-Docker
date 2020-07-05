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

  public addTaxi = (req: Request, res: Response): any => {
    const taxiNumber = req.body.taxiNumber;
    const newTaxi = new models.Taxi({ taxiNumber: taxiNumber });
    newTaxi
      .save()
      .then((taxi) => {
        return res.status(200).send(taxi);
      })
      .catch((error) => {
        return res.status(500).send({ error: error });
      });
  };

  public updateLocation = (req: Request, res: Response): any => {
    // required request json data object = {taxiNumber: "taxiNumber", newLocation: {latitude: 9.099, longitude: 8.7676}}
    const locationData = req.body.locationData;
    const taxiNumber = locationData.taxiNumber;
    const taxiLocation = locationData.newLocation;
    taxiLocation.latitude = Number(taxiLocation.latitude);
    taxiLocation.longitude = Number(taxiLocation.longitude);
    models.Taxi.findOne({ taxiNumber: taxiNumber })
      .then((taxi) => {
        if (taxi.lastLocationLatitude) {
          if (
            Math.abs(taxi.lastLocationLatitude - taxiLocation.latitude) >
              GPS_THRESOLD ||
            Math.abs(taxi.lastLocationLongitude - taxiLocation.longitude) >
              GPS_THRESOLD
          ) {
            taxi.lastLocationLatitude = taxiLocation.latitude;
            taxi.lastLocationLongitude = taxiLocation.longitude;
            taxi
              .save()
              .then((taxi) => {
                return res.status(200).send({
                  result: 'Success',
                });
              })
              .catch((error) => {
                return res.status(500).send({ error: error });
              });
          } else {
            return res.status(200).send({
              result: 'Not a considerable GPS change',
            });
          }
        } else {
          taxi.lastLocationLatitude = taxiLocation.latitude;
          taxi.lastLocationLongitude = taxiLocation.longitude;
          taxi
            .save()
            .then((taxi) => {
              return res.status(200).send({
                result: 'Success',
              });
            })
            .catch((error) => {
              return res.status(500).send({ error: error });
            });
        }
      })
      .catch((error) => {
        return res.status(500).send({ error: error });
      });
  };

  public getParkingLots = (req: Request, res: Response): any => {
    models.ParkingLot.find({})
      .then((parkingLots) => {
        return res.status(200).send(parkingLots);
      })
      .catch((error) => {
        return res.status(500).send({ error: error });
      });
  };

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

  public addBonus = (req: Request, res: Response): any => {
    const parkingLotId = req.body.parkingLotId;
    const taxiNumber = req.body.taxiNumber;

    models.ParkingLot.findById(parkingLotId)
      .then((parkingLot) => {
        const taxisAvailable = parkingLot.taxiQueue;
        const otherTaxis = taxisAvailable.filter(
          (existingNumber) => existingNumber != taxiNumber
        );
        if (otherTaxis.length != taxisAvailable.length) {
          otherTaxis.unshift(taxiNumber);
          parkingLot.taxiQueue = otherTaxis;
          parkingLot
            .save()
            .then((parkingLot) => {
              return res.status(200).send(parkingLot.taxiQueue);
            })
            .catch((error) => {
              return res.status(500).send({ error: error });
            });
        } else {
          return res.status(500).send({
            error: 'Invalid Request: Taxi is not available in the parking lot',
          });
        }
      })
      .catch((error) => {
        return res.status(500).send({ error: error });
      });
  };

  public addToParkingLot = (req: Request, res: Response): any => {
    const parkingLotId = req.body.parkingLotId;
    const taxiNumber = req.body.taxiNumber;

    models.ParkingLot.findById(parkingLotId)
      .then((parkingLot) => {
        const taxisAvailable = parkingLot.taxiQueue;
        const otherTaxis = taxisAvailable.filter(
          (existingNumber) => existingNumber != taxiNumber
        );
        if (otherTaxis.length == taxisAvailable.length) {
          otherTaxis.push(taxiNumber);
          parkingLot.taxiQueue = otherTaxis;
          parkingLot.availableSlots = parkingLot.availableSlots - 1;
          parkingLot
            .save()
            .then((parkingLot) => {
              return res.status(200).send(parkingLot.taxiQueue);
            })
            .catch((error) => {
              return res.status(500).send({ error: error });
            });
        } else {
          return res.status(500).send({
            error:
              'Invalid Request: Taxi is available in the parking lot already',
          });
        }
      })
      .catch((error) => {
        return res.status(500).send({ error: error });
      });
  };

  public releaseTaxi = (req: Request, res: Response): any => {
    const parkingLotId = req.body.parkingLotId;
    models.ParkingLot.findById(parkingLotId)
      .then((parkingLot) => {
        const taxisAvailable = parkingLot.taxiQueue;
        if (taxisAvailable.length > 0) {
          const releasingTaxi = taxisAvailable[0];
          const otherTaxis = taxisAvailable.filter(
            (existingNumber) => existingNumber != releasingTaxi
          );
          otherTaxis.push(releasingTaxi);
          parkingLot.taxiQueue = otherTaxis;
          parkingLot
            .save()
            .then((parkingLot) => {
              return res.status(200).send(parkingLot.taxiQueue);
            })
            .catch((error) => {
              return res.status(500).send({ error: error });
            });
        } else {
          return res.status(500).send({
            error: 'Invalid Request: No taxis in the parking lot',
          });
        }
      })
      .catch((error) => {
        return res.status(500).send({ error: error });
      });
  };
}
